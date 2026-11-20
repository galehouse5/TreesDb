/**
 * P3-08 import-photos.sql.ts tests (pglite, doc 05 §P3-08), plus the photo
 * cleanup that removeImportSite / removeTree / removeTrip now do.
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createImportSite, createTrip, removeImportSite, removeTrip } from "./import-drafts.sql";
import { createSingleTrunkTree, removeTree } from "./import-trees.sql";
import {
  ImportPhotoAccessError,
  addImportPhoto,
  listImportPhotosForTrip,
  removeImportPhoto,
  updateImportPhotoCaption,
} from "./import-photos.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, pgliteSqlTag } from "./test-helpers";

let userSeq = 0;
async function insertUser(db: PGlite): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into users (
       email, firstname, lastname, roles,
       password_hash, password_algo, password_argon2,
       password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
       created, last_login, email_verification_token, email_verified,
       recently_failed_login_attempts, last_failed_login_attempt
     ) values (
       $1, 'Test', 'User', 3,
       $2, 'argon2id', null,
       0, 0, 0, 0, 0,
       now(), now(), $3, now(),
       0, null
     ) returning id`,
    [`photos${++userSeq}@example.com`, Buffer.alloc(32), Buffer.alloc(32)],
  );
  return r.rows[0]!.id;
}

const ROW = { width: 640, height: 480, bytes: 1234, format: 1 };
const noBlob = async () => {};

describe("import-photos.sql", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  async function newTrip() {
    const userId = await insertUser(db);
    const now = new Date();
    const tripId = await createTrip(userId, now, sql);
    const siteId = await createImportSite(tripId, { stateId: null, county: "" }, now, sql);
    const treeId = await createSingleTrunkTree(tripId, siteId, null, now, sql);
    return { userId, tripId, siteId, treeId };
  }

  async function photoCount(photoId: number): Promise<number> {
    const r = await db.query<{ n: number }>(`select count(*)::int as n from photos where id = $1`, [photoId]);
    return r.rows[0]!.n;
  }

  it("adds a site photo (type 2) and a tree photo (type 3), writing each blob under the new id", async () => {
    const { userId, tripId, siteId, treeId } = await newTrip();
    const written: number[] = [];
    const now = new Date("2026-11-20T12:00:00Z");

    const site = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, now, async (id) => {
      written.push(id);
    }, sql);
    const tree = await addImportPhoto(tripId, { kind: "tree", treeId }, userId, ROW, now, async (id) => {
      written.push(id);
    }, sql);

    expect(written).toEqual([site.photoId, tree.photoId]);
    const refs = await db.query<{ type: number; import_site_id: number | null; import_tree_id: number | null }>(
      `select type, import_site_id, import_tree_id from photo_references where id in ($1, $2) order by id`,
      [site.referenceId, tree.referenceId],
    );
    expect(refs.rows).toEqual([
      { type: 2, import_site_id: siteId, import_tree_id: null },
      { type: 3, import_site_id: null, import_tree_id: treeId },
    ]);
    const photo = await db.query<{ creator_user_id: number; width: number; height: number; bytes: number; format: number }>(
      `select creator_user_id, width, height, bytes, format from photos where id = $1`,
      [site.photoId],
    );
    expect(photo.rows[0]).toEqual({ creator_user_id: userId, width: 640, height: 480, bytes: 1234, format: 1 });

    const trip = await db.query<{ last_saved: Date }>(`select last_saved from import_trips where id = $1`, [tripId]);
    expect(trip.rows[0]!.last_saved.getTime()).toBe(now.getTime());

    const listed = await listImportPhotosForTrip(tripId, sql);
    expect(listed.map((p) => [p.referenceId, p.importSiteId, p.importTreeId])).toEqual([
      [site.referenceId, siteId, null],
      [tree.referenceId, null, treeId],
    ]);
  });

  it("rejects a site or tree from another trip", async () => {
    const a = await newTrip();
    const b = await newTrip();
    await expect(
      addImportPhoto(a.tripId, { kind: "site", siteId: b.siteId }, a.userId, ROW, new Date(), noBlob, sql),
    ).rejects.toBeInstanceOf(ImportPhotoAccessError);
    await expect(
      addImportPhoto(a.tripId, { kind: "tree", treeId: b.treeId }, a.userId, ROW, new Date(), noBlob, sql),
    ).rejects.toBeInstanceOf(ImportPhotoAccessError);
  });

  it("leaves no rows behind when the blob write fails", async () => {
    const { userId, tripId, siteId } = await newTrip();
    const before = await db.query<{ n: number }>(`select count(*)::int as n from photos`);
    await expect(
      addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), async () => {
        throw new Error("blob down");
      }, sql),
    ).rejects.toThrow("blob down");
    const after = await db.query<{ n: number }>(`select count(*)::int as n from photos`);
    expect(after.rows[0]!.n).toBe(before.rows[0]!.n);
    expect(await listImportPhotosForTrip(tripId, sql)).toEqual([]);
  });

  it("sets, trims and clears a caption, only within the trip", async () => {
    const { userId, tripId, siteId } = await newTrip();
    const other = await newTrip();
    const { referenceId } = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), noBlob, sql);

    await updateImportPhotoCaption(tripId, referenceId, "  Big oak from the north  ", new Date(), sql);
    expect((await listImportPhotosForTrip(tripId, sql))[0]!.caption).toBe("Big oak from the north");

    await updateImportPhotoCaption(tripId, referenceId, "   ", new Date(), sql);
    expect((await listImportPhotosForTrip(tripId, sql))[0]!.caption).toBeNull();

    await expect(updateImportPhotoCaption(other.tripId, referenceId, "x", new Date(), sql)).rejects.toBeInstanceOf(
      ImportPhotoAccessError,
    );
  });

  it("removes a photo and its row, returning the id for blob cleanup", async () => {
    const { userId, tripId, treeId } = await newTrip();
    const other = await newTrip();
    const { photoId, referenceId } = await addImportPhoto(
      tripId, { kind: "tree", treeId }, userId, ROW, new Date(), noBlob, sql,
    );

    await expect(removeImportPhoto(other.tripId, referenceId, new Date(), sql)).rejects.toBeInstanceOf(
      ImportPhotoAccessError,
    );
    expect(await removeImportPhoto(tripId, referenceId, new Date(), sql)).toEqual([photoId]);
    expect(await photoCount(photoId)).toBe(0);
  });

  it("keeps a photo that another reference still uses (e.g. a finished trip's canonical copy)", async () => {
    const { userId, tripId, siteId } = await newTrip();
    const { photoId, referenceId } = await addImportPhoto(
      tripId, { kind: "site", siteId }, userId, ROW, new Date(), noBlob, sql,
    );
    // A type-1 reference stands in for the canonical copy the merge engine makes.
    await db.query(`insert into photo_references (type, photo_id) values (1, $1)`, [photoId]);

    expect(await removeImportPhoto(tripId, referenceId, new Date(), sql)).toEqual([]);
    expect(await photoCount(photoId)).toBe(1);
  });

  it("removeTree deletes the tree's photos", async () => {
    const { userId, tripId, siteId, treeId } = await newTrip();
    const { photoId } = await addImportPhoto(tripId, { kind: "tree", treeId }, userId, ROW, new Date(), noBlob, sql);
    const siteRef = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), noBlob, sql);

    expect(await removeTree(tripId, treeId, new Date(), sql)).toEqual([photoId]);
    expect(await photoCount(photoId)).toBe(0);
    expect(await photoCount(siteRef.photoId)).toBe(1);
  });

  it("removeImportSite deletes the site's and its trees' photos, and ignores another trip's site", async () => {
    const { userId, tripId, siteId, treeId } = await newTrip();
    const other = await newTrip();
    const a = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), noBlob, sql);
    const b = await addImportPhoto(tripId, { kind: "tree", treeId }, userId, ROW, new Date(), noBlob, sql);

    expect(await removeImportSite(siteId, other.tripId, new Date(), sql)).toEqual([]);
    expect(await photoCount(a.photoId)).toBe(1);

    expect((await removeImportSite(siteId, tripId, new Date(), sql)).sort()).toEqual([a.photoId, b.photoId].sort());
    expect(await photoCount(a.photoId)).toBe(0);
    expect(await photoCount(b.photoId)).toBe(0);
  });

  it("removeTrip deletes the trip's photos", async () => {
    const { userId, tripId, siteId, treeId } = await newTrip();
    const a = await addImportPhoto(tripId, { kind: "site", siteId }, userId, ROW, new Date(), noBlob, sql);
    const b = await addImportPhoto(tripId, { kind: "tree", treeId }, userId, ROW, new Date(), noBlob, sql);

    const removed = await removeTrip(tripId, userId, ["import"], sql);
    expect(removed.sort()).toEqual([a.photoId, b.photoId].sort());
    expect(await photoCount(a.photoId)).toBe(0);
  });
});
