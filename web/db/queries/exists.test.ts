import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseDetailId, siteExists, stateExists, treeExists } from "./exists.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./test-helpers";

describe("detail-page existence checks", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  let siteId: number;
  let treeId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db, { name: "United States", doubleLetterCode: "US", tripleLetterCode: "USA" });
    stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH", tripleLetterCode: "OHI" });
    siteId = await insertSite(db, stateId);
    treeId = await insertTree(db, siteId);
  });

  afterAll(async () => {
    await db.close();
  });

  it("finds existing records", async () => {
    expect(await treeExists(treeId, sql)).toBe(true);
    expect(await siteExists(siteId, sql)).toBe(true);
    expect(await stateExists(stateId, sql)).toBe(true);
  });

  it("reports missing records", async () => {
    expect(await treeExists(treeId + 1000, sql)).toBe(false);
    expect(await siteExists(siteId + 1000, sql)).toBe(false);
    expect(await stateExists(stateId + 1000, sql)).toBe(false);
  });

  it("accepts only positive int32 ids", () => {
    expect(parseDetailId("42")).toBe(42);
    expect(parseDetailId("0")).toBeNull();
    expect(parseDetailId("-1")).toBeNull();
    expect(parseDetailId("1.5")).toBeNull();
    expect(parseDetailId("abc")).toBeNull();
    expect(parseDetailId("99999999999")).toBeNull();
  });
});
