import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { recentTrips } from "./activity.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, pgliteSqlTag } from "./test-helpers";

/**
 * Minimal `site_visits` / `site_visitors` fixture inserter -- test-helpers.ts
 * (shared across every db/queries/*.test.ts task) has no `insertSiteVisit`
 * helper and is out of this task's file-ownership (P1-13 owns only
 * activity.sql.ts + this test), so visits/visitors are inserted with raw
 * `db.query` here instead of extending that shared file.
 */
async function insertSiteVisit(
  db: PGlite,
  siteId: number,
  stateId: number,
  overrides: Partial<{ visited: string; county: string; name: string }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into site_visits (
       site_id, visited, name, state_id, county,
       ownership_type, ownership_contact_info, make_ownership_contact_info_public,
       latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude, comments
     ) values ($1, $2, $3, $4, $5, 'Public', '', false, 40, 2, -83, 2, 40, -83, '')
     returning id`,
    [
      siteId,
      overrides.visited ?? "2020-01-01",
      overrides.name ?? "Test Site",
      stateId,
      overrides.county ?? "Franklin",
    ],
  );
  return r.rows[0]!.id;
}

async function insertSiteVisitor(
  db: PGlite,
  siteVisitId: number,
  firstName: string,
  lastName: string,
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into site_visitors (site_visit_id, first_name, last_name) values ($1, $2, $3) returning id`,
    [siteVisitId, firstName, lastName],
  );
  return r.rows[0]!.id;
}

describe("activity.sql: recentTrips (BrowseController.RecentTrips)", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  });

  afterAll(async () => {
    await db.close();
  });

  it("orders by visited DESC, ties broken by id ASC, and attaches visitors in insertion (id asc) order", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId, { name: "Ohio" });
    const site1 = await insertSite(db, stateId, { name: "Site One", county: "Adams" });
    const site2 = await insertSite(db, stateId, { name: "Site Two", county: "Butler" });

    const oldVisit = await insertSiteVisit(db, site1, stateId, { visited: "2020-01-01", county: "Adams" });
    const newVisit = await insertSiteVisit(db, site2, stateId, { visited: "2021-06-15", county: "Butler" });
    // Same date as `newVisit` -- must sort BEFORE it (id ASC tiebreak: this
    // row's id is larger, so it is LATER in the tie sort) -- constructed
    // as a second, later-inserted visit on the same date. (id ASC confirmed
    // via live-site audit against www.treesdb.org/Browse/Activity -- see
    // activity.sql.ts header.)
    const tieVisit = await insertSiteVisit(db, site1, stateId, { visited: "2021-06-15", county: "Adams" });

    await insertSiteVisitor(db, newVisit, "Elijah", "Whitcomb");
    // Insertion order matters: Brian is added AFTER Jess, so the expected
    // Visitors order is Jess, then Brian (NHibernate's unordered bag
    // iterates by underlying row/id order -- see activity.sql.ts header).
    await insertSiteVisitor(db, oldVisit, "Jess", "Riddle");
    await insertSiteVisitor(db, oldVisit, "Brian", "Beduhn");

    const trips = await recentTrips(40, sql);

    expect(trips.map((t) => t.siteVisitId)).toEqual([newVisit, tieVisit, oldVisit]);

    const old = trips.find((t) => t.siteVisitId === oldVisit)!;
    expect(old.siteName).toBe("Site One");
    expect(old.county).toBe("Adams");
    expect(old.stateName).toBe("Ohio");
    expect(old.visited).toBe("2020-01-01");
    expect(old.visitors).toEqual([
      { firstName: "Jess", lastName: "Riddle" },
      { firstName: "Brian", lastName: "Beduhn" },
    ]);

    const tie = trips.find((t) => t.siteVisitId === tieVisit)!;
    expect(tie.visitors).toEqual([]);
  });

  it("caps at `limit` (default 40), keeping only the most recent visits", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId, { name: "Texas" });
    const site = await insertSite(db, stateId, { name: "Many Visits Site" });

    const ids: number[] = [];
    for (let i = 0; i < 5; i++) {
      ids.push(await insertSiteVisit(db, site, stateId, { visited: `2022-01-0${i + 1}` }));
    }

    const trips = await recentTrips(3, sql);
    expect(trips).toHaveLength(3);
    // Most recent 3 of the 5 dates just inserted, newest first.
    expect(trips.map((t) => t.siteVisitId)).toEqual([ids[4], ids[3], ids[2]]);
  });

  it("returns an empty array when there are no site visits", async () => {
    const db2 = await createTestDb();
    const sql2 = pgliteSqlTag(db2);
    expect(await recentTrips(40, sql2)).toEqual([]);
    await db2.close();
  });
});
