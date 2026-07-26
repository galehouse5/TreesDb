import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { measurerActivity } from "./measurer-activity.sql";
import type { SqlTag } from "./sql-tag";
import {
  createTestDb,
  insertCountry,
  insertSite,
  insertState,
  insertTree,
  insertTreeMeasurer,
  pgliteSqlTag,
} from "./test-helpers";

describe("measurer-activity.sql (CreateObjectsAndTypes.sql:284-300)", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const site1 = await insertSite(db, stateId, { name: "Site One" });
    const site2 = await insertSite(db, stateId, { name: "Site Two" });

    const tree1 = await insertTree(db, site1, { lastMeasured: "2020-01-01" });
    const tree2 = await insertTree(db, site1, { lastMeasured: "2020-06-15" });
    const tree3 = await insertTree(db, site2, { lastMeasured: "2021-03-10" });

    // John Smith measured tree1 and tree2 (both at site1) plus tree3 (site2):
    // 3 distinct trees, 2 distinct sites, last measurement 2021-03-10.
    await insertTreeMeasurer(db, { treeId: tree1 }, "John", "Smith");
    await insertTreeMeasurer(db, { treeId: tree2 }, "John", "Smith");
    await insertTreeMeasurer(db, { treeId: tree3 }, "John", "Smith");
    // A duplicate row for the same (measurer, tree) pair -- e.g. two
    // separate measurement events by the same person on the same tree --
    // must not double-count tree1 (COUNT(DISTINCT tree_id)).
    await insertTreeMeasurer(db, { treeId: tree1 }, "John", "Smith");

    // Jane Doe is recorded only against a MEASUREMENT (tree_id null),
    // never directly against a tree row. The legacy view's join is
    // `Trees.Trees t ON t.Id = m.TreeId` (INNER JOIN on TreeId, not
    // MeasurementId) -- this row must be excluded entirely.
    await insertTreeMeasurer(db, { treeId: null, measurementId: null }, "Jane", "Doe");
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("groups by (lastName, firstName) with distinct tree/site counts and the max last-measured date", async () => {
    const rows = await measurerActivity(sql);
    const smith = rows.find((r) => r.lastName === "Smith" && r.firstName === "John");
    expect(smith).toBeDefined();
    expect(smith!.treesMeasuredCount).toBe(3);
    expect(smith!.sitesVisitedCount).toBe(2);
    expect(smith!.lastMeasurementDate).toBe("2021-03-10");
  });

  it("excludes measurers whose tree_id is null (measurement-only rows), per the legacy INNER JOIN on TreeId", async () => {
    const rows = await measurerActivity(sql);
    expect(rows.find((r) => r.lastName === "Doe" && r.firstName === "Jane")).toBeUndefined();
  });
});
