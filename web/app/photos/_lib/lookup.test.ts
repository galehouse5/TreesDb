/** findViewablePhoto against PGlite: public references, and P3-08's editor-only import photos. */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createImportSite, createTrip } from "@/db/queries/import-drafts.sql";
import { createSingleTrunkTree } from "@/db/queries/import-trees.sql";
import { addImportPhoto } from "@/db/queries/import-photos.sql";
import type { SqlTag } from "@/db/queries/sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, pgliteSqlTag } from "@/db/queries/test-helpers";
import { findViewablePhoto } from "./lookup";

let seq = 0;
async function insertUser(db: PGlite): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into users (
       email, firstname, lastname, roles,
       password_hash, password_algo, password_argon2,
       password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
       created, last_login, email_verification_token, email_verified,
       recently_failed_login_attempts, last_failed_login_attempt
     ) values ($1, 'T', 'U', 3, $2, 'argon2id', null, 0, 0, 0, 0, 0, now(), now(), $3, now(), 0, null)
     returning id`,
    [`lookup${++seq}@example.com`, Buffer.alloc(32), Buffer.alloc(32)],
  );
  return r.rows[0]!.id;
}

const ROW = { width: 10, height: 10, bytes: 100, format: 3 };

describe("findViewablePhoto", () => {
  let db: PGlite;
  let sql: SqlTag;
  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);
  afterAll(async () => {
    await db.close();
  });

  async function importPhotos() {
    const userId = await insertUser(db);
    const tripId = await createTrip(userId, new Date(), sql);
    const siteId = await createImportSite(tripId, { stateId: null, county: "" }, new Date(), sql);
    const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
    const site = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), async () => {}, sql);
    const tree = await addImportPhoto(tripId, { kind: "tree", treeId }, userId, ROW, new Date(), async () => {}, sql);
    return { userId, sitePhoto: site.photoId, treePhoto: tree.photoId };
  }

  it("returns null for a missing photo", async () => {
    expect(await findViewablePhoto(987654, null, sql)).toBeNull();
  });

  it("hides import photos from anonymous users and other users", async () => {
    const { sitePhoto } = await importPhotos();
    const stranger = await insertUser(db);
    expect(await findViewablePhoto(sitePhoto, null, sql)).toBeNull();
    expect(await findViewablePhoto(sitePhoto, { userId: stranger, roles: ["import"] }, sql)).toBeNull();
  });

  it("shows site and tree import photos to the trip's editor, as not public", async () => {
    const { userId, sitePhoto, treePhoto } = await importPhotos();
    const editor = { userId, roles: ["import"] };
    expect(await findViewablePhoto(sitePhoto, editor, sql)).toEqual({ format: 3, isPublic: false });
    expect(await findViewablePhoto(treePhoto, editor, sql)).toEqual({ format: 3, isPublic: false });
    // The trip's creator without the Import role is not an editor (UserRoles.cs:69).
    expect(await findViewablePhoto(sitePhoto, { userId, roles: [] }, sql)).toBeNull();
  });

  it("shows a photo with a canonical reference to everyone, as public", async () => {
    const { sitePhoto } = await importPhotos();
    // The canonical copy the merge engine makes on Finish (here a type-4 Site reference).
    const countryId = await insertCountry(db, { doubleLetterCode: "LK", tripleLetterCode: "LKP", name: "Lookupland" });
    const stateId = await insertState(db, countryId, { doubleLetterCode: "LK", tripleLetterCode: "LKS", name: "Lookup" });
    const siteId = await insertSite(db, stateId);
    await db.query(`insert into photo_references (type, site_id, photo_id) values (4, $1, $2)`, [siteId, sitePhoto]);
    expect(await findViewablePhoto(sitePhoto, null, sql)).toEqual({ format: 3, isPublic: true });
  });
});
