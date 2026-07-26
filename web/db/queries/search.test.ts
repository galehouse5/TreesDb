import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { searchMeasuredSpecies, searchSites, searchStates } from "./search.sql";
import type { SqlTag } from "./sql-tag";
import {
  createTestDb,
  insertCountry,
  insertSite,
  insertState,
  insertTree,
  pgliteSqlTag,
} from "./test-helpers";

describe("search.sql (CreateObjectsAndTypes.sql:310-387, D-010)", () => {
  let db: PGlite;
  let sql: SqlTag;

  // Site rank fixture (term "Oak"): hand-computed against the legacy
  // 6-flag formula (prefix/suffix/contains on name, then county).
  //   site1 name="Oak"      county="Ash"        -> name: pre+suf+contains = 3, county: 0  => rank 3
  //   site2 name="Oakville" county="Elm"         -> name: pre+contains    = 2, county: 0  => rank 2
  //   site3 name="Big Oak"  county="Ash"         -> name: suf+contains    = 2, county: 0  => rank 2
  //   site4 name="Maple"    county="Oak County"  -> name: 0,               county: pre+contains = 2 => rank 2
  let site1: number;
  let site2: number;
  let site3: number;
  let site4: number;
  // D-010 wildcard-passthrough fixture: term "A%B" contains a literal '%'.
  // Legacy does not escape it, so it acts as a genuine LIKE wildcard in the
  // pattern '%A%B%' -- both "AB" (wildcard matches zero chars) and "AXXXB"
  // (wildcard matches "XXX") match. If `%` were escaped (turning it into a
  // literal-match request for the substring "A%B"), NEITHER would match,
  // since neither string literally contains a percent sign.
  let sitePercentA: number;
  let sitePercentB: number;

  let stateOhio: number;
  let stateIdaho: number;
  let stateOheo: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    // Distinct name/codes from the "Ohio" fixtures below (created explicitly
    // later in this block) so this site-holder state doesn't accidentally
    // also match the searchStates("oh") assertions.
    const stateId = await insertState(db, countryId, {
      name: "Nowhereville",
      doubleLetterCode: "ZZ",
      tripleLetterCode: "ZZZ",
    });

    site1 = await insertSite(db, stateId, { name: "Oak", county: "Ash" });
    site2 = await insertSite(db, stateId, { name: "Oakville", county: "Elm" });
    site3 = await insertSite(db, stateId, { name: "Big Oak", county: "Ash" });
    site4 = await insertSite(db, stateId, { name: "Maple", county: "Oak County" });
    sitePercentA = await insertSite(db, stateId, { name: "AB", county: "Zzz" });
    sitePercentB = await insertSite(db, stateId, { name: "AXXXB", county: "Zzz" });

    stateOhio = await insertState(db, countryId, {
      name: "Ohio",
      doubleLetterCode: "OH",
      tripleLetterCode: "OHI",
    });
    stateIdaho = await insertState(db, countryId, {
      name: "Idaho",
      doubleLetterCode: "ID",
      tripleLetterCode: "IDA",
    });
    stateOheo = await insertState(db, countryId, {
      name: "Oheo",
      doubleLetterCode: "XY",
      tripleLetterCode: "XYZ",
    });

    const speciesSite = await insertSite(db, stateId, { name: "Species Site" });
    await insertTree(db, speciesSite, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
    });
    await insertTree(db, speciesSite, {
      scientificName: "Alba vulgaris",
      commonName: "Something Else",
    });
    await insertTree(db, speciesSite, {
      scientificName: "Unrelated Genus",
      commonName: "Foo Alba Bar",
    });
    await insertTree(db, speciesSite, {
      scientificName: "Pinus strobus",
      commonName: "White Pine",
    });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("searchSites", () => {
    it("computes the exact 6-flag rank and orders rank desc", async () => {
      const results = await searchSites("Oak", sql);
      const byId = new Map(results.map((r) => [r.id, r.rank]));
      expect(byId.get(site1)).toBe(3);
      expect(byId.get(site2)).toBe(2);
      expect(byId.get(site3)).toBe(2);
      expect(byId.get(site4)).toBe(2);
      expect(results[0]!.id).toBe(site1);
      // Ties at rank 2 are broken by our chosen deterministic secondary
      // sort (id asc) -- see search.sql.ts's header on why legacy had no
      // guaranteed tie order here.
      const tiedIds = results.filter((r) => r.rank === 2).map((r) => r.id);
      expect(tiedIds).toEqual([site2, site3, site4].sort((a, b) => a - b));
    });

    it("D-010: a literal '%' in the term is NOT escaped -- it acts as a wildcard", async () => {
      const results = await searchSites("A%B", sql);
      const ids = results.map((r) => r.id);
      expect(ids).toContain(sitePercentA);
      expect(ids).toContain(sitePercentB);
      const byId = new Map(results.map((r) => [r.id, r.rank]));
      // Both match all three name flags (prefix/suffix/contains) via the
      // wildcard-interpreted pattern.
      expect(byId.get(sitePercentA)).toBe(3);
      expect(byId.get(sitePercentB)).toBe(3);
    });
  });

  describe("searchStates", () => {
    it("computes 3 name flags + 2 each for exact code matches, case-insensitively", async () => {
      const results = await searchStates("oh", sql);
      const byId = new Map(results.map((r) => [r.id, r.rank]));
      // Ohio: name prefix+contains (2) + double-code exact match (+2) = 4.
      expect(byId.get(stateOhio)).toBe(4);
      // Oheo: name prefix+contains (2), no code match = 2.
      expect(byId.get(stateOheo)).toBe(2);
      expect(results[0]!.id).toBe(stateOhio);
    });

    it("filters out states matching neither the name substring nor an exact code", async () => {
      const results = await searchStates("oh", sql);
      expect(results.map((r) => r.id)).not.toContain(stateIdaho);
    });

    // SQL Server ANSI-padding equality: trailing spaces are ignored in
    // char/varchar '=' ('ND' = 'nd ' is TRUE), leading spaces are not.
    // Found via production parity (corpus term "nd " ranked North Dakota
    // in the legacy dump); replicated with rtrim on both sides.
    it("code equality ignores trailing spaces in the term (ANSI padding), not leading", async () => {
      const trailing = await searchStates("oh ", sql);
      expect(new Map(trailing.map((r) => [r.id, r.rank])).get(stateOhio)).toBe(2);
      const leading = await searchStates(" oh", sql);
      expect(new Map(leading.map((r) => [r.id, r.rank])).get(stateOhio)).toBeUndefined();
    });
  });

  describe("searchMeasuredSpecies", () => {
    it("ranks by the 6-flag formula over (scientificName, commonName)", async () => {
      const results = await searchMeasuredSpecies("alba", sql);
      const byKey = new Map(
        results.map((r) => [`${r.scientificName}|${r.commonName}`, r.rank]),
      );
      // "Quercus alba" / "White Oak": scientific suffix+contains = 2.
      expect(byKey.get("Quercus alba|White Oak")).toBe(2);
      // "Alba vulgaris" / "Something Else": scientific prefix+contains = 2.
      expect(byKey.get("Alba vulgaris|Something Else")).toBe(2);
      // "Unrelated Genus" / "Foo Alba Bar": common contains only = 1.
      expect(byKey.get("Unrelated Genus|Foo Alba Bar")).toBe(1);
      // "Pinus strobus" / "White Pine" doesn't match anywhere -> filtered out.
      expect(byKey.has("Pinus strobus|White Pine")).toBe(false);
    });

    it("orders rank desc", async () => {
      const results = await searchMeasuredSpecies("alba", sql);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.rank).toBeGreaterThanOrEqual(results[i]!.rank);
      }
    });
  });
});
