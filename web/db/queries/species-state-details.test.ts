import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  boundsMidpoint,
  globalSpeciesMaxima,
  recordedSitesForSpeciesInState,
  recordedStatesForSpecies,
  recordedTreesForSpeciesInSite,
  resolveSpeciesSlug,
  siteSpeciesMaxima,
  sitesForState,
  sitesForStateGrid,
  sortAndPage,
  stateSpeciesGrid,
  stateSpeciesMaxima,
  stateSummary,
} from "./species-state-details.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./test-helpers";

describe("species-state-details.sql", () => {
  let db: PGlite;
  let sql: SqlTag;
  let countryId: number;
  let stateAId: number;
  let stateBId: number;
  let siteAId: number;
  let siteA2Id: number;
  let siteBId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    countryId = await insertCountry(db);
    stateAId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH", tripleLetterCode: "OHI" });
    stateBId = await insertState(db, countryId, { name: "Alabama", doubleLetterCode: "AL", tripleLetterCode: "ALA" });
    siteAId = await insertSite(db, stateAId, { name: "Bear Meadows", county: "Franklin" });
    siteA2Id = await insertSite(db, stateAId, { name: "Ash Cave", county: "Hocking" });
    siteBId = await insertSite(db, stateBId, { name: "Dismals Canyon", county: "Franklin" });

    // Quercus alba / White Oak: 2 trees at siteA (Ohio), 1 at siteA2 (Ohio), 1 at siteB (Alabama).
    await insertTree(db, siteAId, { scientificName: "Quercus alba", commonName: "White Oak", height: 100, girth: 40 });
    await insertTree(db, siteAId, { scientificName: "Quercus alba", commonName: "White Oak", height: 120, girth: 30 });
    await insertTree(db, siteA2Id, { scientificName: "Quercus alba", commonName: "White Oak", height: 80, girth: 20 });
    await insertTree(db, siteBId, { scientificName: "Quercus alba", commonName: "White Oak", height: 150, girth: 50 });
    // A second species so resolveSpeciesSlug/measuredSpecies has >1 row.
    await insertTree(db, siteAId, { scientificName: "Acer rubrum", commonName: "Red Maple", height: 60, girth: 25 });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("resolveSpeciesSlug", () => {
    it("resolves a known slug to its (scientificName, commonName) pair", async () => {
      const r = await resolveSpeciesSlug("quercus-alba--white-oak", sql);
      expect(r).toEqual({ scientificName: "Quercus alba", commonName: "White Oak" });
    });

    it("returns null for an unknown slug", async () => {
      expect(await resolveSpeciesSlug("no-such-species--nope", sql)).toBeNull();
    });
  });

  describe("globalSpeciesMaxima", () => {
    it("returns null when the species has zero trees anywhere", async () => {
      expect(await globalSpeciesMaxima("Nothing here", "Nope", sql)).toBeNull();
    });

    it("computes the max across every tree of the species, any state/site", async () => {
      const r = await globalSpeciesMaxima("Quercus alba", "White Oak", sql);
      expect(r).not.toBeNull();
      expect(r!.maxHeight).toBe(150); // from siteB
      expect(r!.maxHeightInputFormat).toBe(2);
      expect(r!.maxGirth).toBe(50);
    });
  });

  describe("stateSpeciesMaxima / siteSpeciesMaxima", () => {
    it("scopes the max to just the given state", async () => {
      const r = await stateSpeciesMaxima("Quercus alba", "White Oak", stateAId, sql);
      expect(r).not.toBeNull();
      expect(r!.maxHeight).toBe(120); // max of the two Ohio sites, not Alabama's 150
    });

    it("returns null when the species isn't recorded in that state (404 gate)", async () => {
      expect(await stateSpeciesMaxima("Acer rubrum", "Red Maple", stateBId, sql)).toBeNull();
    });

    it("scopes the max to just the given site", async () => {
      const r = await siteSpeciesMaxima("Quercus alba", "White Oak", siteAId, sql);
      expect(r).not.toBeNull();
      expect(r!.maxHeight).toBe(120);
      const r2 = await siteSpeciesMaxima("Quercus alba", "White Oak", siteA2Id, sql);
      expect(r2!.maxHeight).toBe(80);
    });

    it("returns null when the species isn't recorded at that site (404 gate)", async () => {
      expect(await siteSpeciesMaxima("Quercus alba", "White Oak", siteBId, sql)).not.toBeNull();
      expect(await siteSpeciesMaxima("Acer rubrum", "Red Maple", siteBId, sql)).toBeNull();
    });
  });

  describe("recordedStatesForSpecies / recordedSitesForSpeciesInState / recordedTreesForSpeciesInSite", () => {
    it("groups by state, ordered by state name ascending", async () => {
      const rows = await recordedStatesForSpecies("Quercus alba", "White Oak", sql);
      expect(rows.map((r) => r.stateName)).toEqual(["Alabama", "Ohio"]); // alphabetical, not insertion order
      const ohio = rows.find((r) => r.stateName === "Ohio")!;
      expect(ohio.maxHeight).toBe(120);
      const alabama = rows.find((r) => r.stateName === "Alabama")!;
      expect(alabama.maxHeight).toBe(150);
    });

    it("groups by site within one state, ordered by site name ascending", async () => {
      const rows = await recordedSitesForSpeciesInState("Quercus alba", "White Oak", stateAId, sql);
      expect(rows.map((r) => r.siteName)).toEqual(["Ash Cave", "Bear Meadows"]);
      expect(rows.find((r) => r.siteName === "Bear Meadows")!.maxHeight).toBe(120);
    });

    it("lists individual trees at one site, ordered by height descending (natural order, no sort)", async () => {
      const rows = await recordedTreesForSpeciesInSite("Quercus alba", "White Oak", siteAId, sql);
      expect(rows.map((r) => r.height)).toEqual([120, 100]);
    });
  });

  describe("sortAndPage (generic helper)", () => {
    interface Row {
      id: number;
      name: string;
      value: number | null;
    }
    const rows: Row[] = [
      { id: 1, name: "B", value: 10 },
      { id: 2, name: "A", value: null },
      { id: 3, name: "C", value: 5 },
    ];
    const keyFns = { Name: (r: Row) => r.name, Value: (r: Row) => r.value };

    it("returns query-natural order when sort is absent", () => {
      const result = sortAndPage(rows, keyFns, {});
      expect(result.rows.map((r) => r.id)).toEqual([1, 2, 3]);
      expect(result.totalCount).toBe(3);
    });

    it("sorts ascending by default; nulls sort first (Comparer<object>.Default)", () => {
      const result = sortAndPage(rows, keyFns, { sort: "Value" });
      expect(result.rows.map((r) => r.id)).toEqual([2, 3, 1]); // null, 5, 10
    });

    it("reverses (not re-sorts descending) when sortAscending is literally false", () => {
      const result = sortAndPage(rows, keyFns, { sort: "Value", sortAscending: false });
      expect(result.rows.map((r) => r.id)).toEqual([1, 3, 2]); // reverse of [2,3,1]
    });

    it("an unmatched sort key falls back to unsorted, not an error", () => {
      const result = sortAndPage(rows, keyFns, { sort: "Nope" });
      expect(result.rows.map((r) => r.id)).toEqual([1, 2, 3]);
    });

    it("without a naturalKeyFn, omits it entirely (no 4th arg) and stays query-natural even when sortAscending=false is (nonsensically) passed alongside a blank sort", () => {
      const result = sortAndPage(rows, keyFns, { sortAscending: false });
      expect(result.rows.map((r) => r.id)).toEqual([1, 2, 3]); // untouched -- sortAscending only applies to a MATCHED sort key
    });

    it("with a naturalKeyFn, re-sorts the blank/unmatched case by that key via localeCompare instead of trusting the caller's raw order, and never reverses it", () => {
      const named = [
        { id: 1, name: "B" },
        { id: 2, name: "A" },
        { id: 3, name: "C" },
      ];
      const nameKeyFns = { Name: (r: (typeof named)[number]) => r.name };
      const blank = sortAndPage(named, nameKeyFns, {}, nameKeyFns.Name);
      expect(blank.rows.map((r) => r.id)).toEqual([2, 1, 3]); // A, B, C -- not [1,2,3] (input order)

      const unmatched = sortAndPage(named, nameKeyFns, { sort: "Nope", sortAscending: false }, nameKeyFns.Name);
      expect(unmatched.rows.map((r) => r.id)).toEqual([2, 1, 3]); // sortAscending ignored -- no matched column
    });

    it("reproduces the production fix: a symbol-bearing name (U+00D7) sorts as near-ignorable via localeCompare, not after every ASCII letter (Postgres's plain byte-order 'C' collation)", () => {
      const species = [
        { id: 1, name: "Acer saccharum" },
        { id: 2, name: "Acer griseum" },
        { id: 3, name: "Acer ×freemanii" },
        { id: 4, name: "Acer nigrum" },
      ];
      const keyFn = (r: (typeof species)[number]) => r.name;
      const result = sortAndPage(species, { Name: keyFn }, {}, keyFn);
      // Postgres 'C'-locale byte order would put "Acer ×freemanii" LAST
      // (id 3 at the end, since '×' > every ASCII letter byte); the fix's
      // localeCompare-based natural sort instead treats '×' as
      // near-ignorable, sorting it FIRST (matching legacy/SQL Server).
      expect(result.rows.map((r) => r.id)).toEqual([3, 2, 4, 1]);
    });

    it("pages at the shared page size", () => {
      const result = sortAndPage(rows, keyFns, { page: 1 });
      expect(result.pageIndex).toBe(1);
      expect(result.rows).toHaveLength(0); // fewer than 10 total, page 1 is past the end
      expect(result.totalCount).toBe(3);
    });
  });

  describe("stateSpeciesGrid / sitesForState / sitesForStateGrid", () => {
    it("stateSpeciesGrid reuses measuredSpeciesByState, natural order scientificName ascending", async () => {
      const grid = await stateSpeciesGrid(stateAId, {}, sql);
      expect(grid.rows.map((r) => r.scientificName)).toEqual(["Acer rubrum", "Quercus alba"]);
      expect(grid.totalCount).toBe(2);
    });

    it("sitesForState orders by site name ascending, only the 4 metric columns", async () => {
      await db.query(`update sites set computed_rhi5 = 91.26, computed_rgi5 = 15.03 where id = $1`, [siteAId]);
      const rows = await sitesForState(stateAId, sql);
      expect(rows.map((r) => r.name)).toEqual(["Ash Cave", "Bear Meadows"]);
      const bearMeadows = rows.find((r) => r.name === "Bear Meadows")!;
      expect(bearMeadows.computedRhi5).toBeCloseTo(91.26, 2);
      expect(bearMeadows.computedRhi10).toBeNull();
    });

    it("sitesForStateGrid sorts by RHI5 with nulls first", async () => {
      const grid = await sitesForStateGrid(stateAId, { sort: "RHI5" }, sql);
      expect(grid.rows.map((r) => r.name)).toEqual(["Ash Cave", "Bear Meadows"]); // null (Ash Cave) before 91.26
    });
  });

  describe("stateSummary", () => {
    it("returns null for a missing id", async () => {
      expect(await stateSummary(999999, sql)).toBeNull();
    });

    it("carries the state's own code, the country's separate code, and computed_* metrics verbatim", async () => {
      await db.query(
        `update states set computed_rhi5 = 141.02, computed_trees_measured_count = 148,
           computed_last_measurement_date = '2024-04-20', ne_latitude = 40.5, ne_longitude = -82.5,
           sw_latitude = 39.5, sw_longitude = -83.5
         where id = $1`,
        [stateAId],
      );
      const s = await stateSummary(stateAId, sql);
      expect(s).not.toBeNull();
      expect(s!.name).toBe("Ohio");
      expect(s!.doubleLetterCode.trim()).toBe("OH");
      expect(s!.countryDoubleLetterCode.trim()).toBe("US");
      expect(s!.computedRhi5).toBeCloseTo(141.02, 2);
      expect(s!.computedTreesMeasuredCount).toBe(148);
      expect(s!.computedLastMeasurementDate).toBe("2024-04-20");
    });
  });

  describe("boundsMidpoint", () => {
    it("computes the simple (non-antimeridian) midpoint", () => {
      expect(boundsMidpoint(40, 39)).toBeCloseTo(39.5, 4);
      expect(boundsMidpoint(-82.5, -83.5)).toBeCloseTo(-83, 4);
    });

    it("wraps around the antimeridian when edge1 < edge2", () => {
      // NE longitude -179, SW longitude 179 (bounding box crosses the
      // antimeridian) -> midpoint should be 180, not the naive 0.
      expect(boundsMidpoint(-179, 179)).toBeCloseTo(180, 1);
    });

    it("normalizes an overshoot past +/-180 back into range (Longitude.Create's wrap, production regression: Alaska/state 62)", () => {
      // Real NE/SW longitudes for Alaska (state 62): the raw antimeridian
      // sum overshoots to ~201 (172.1155 + 360 - 129.9742, halved and
      // re-added) -- must wrap to ~-158.93, matching legacy's rendered
      // "-158 55.761" (DDM), not the raw unwrapped "201 04.239".
      const result = boundsMidpoint(-129.9742, 172.1155);
      expect(result).toBeGreaterThan(-180);
      expect(result).toBeLessThan(-150);
      expect(result).toBeCloseTo(-158.93, 1);
    });
  });
});
