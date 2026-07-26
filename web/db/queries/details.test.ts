import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { siteDetails, siteSpeciesGrid, treeDetails } from "./details.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, insertTreeMeasurer, pgliteSqlTag } from "./test-helpers";

// Local, test-only insert helpers for rows `test-helpers.ts` doesn't already
// cover (tree_measurements/site_visits/site_visitors/photo_references) --
// kept in this file rather than added to the shared `test-helpers.ts` to
// respect this task's file-ownership boundary (only `details.sql.ts` (+
// test) is owned here).

async function insertTreeMeasurement(
  db: PGlite,
  treeId: number,
  overrides: Partial<{
    scientificName: string;
    commonName: string;
    measured: string;
    height: number;
    heightInputFormat: number;
    girth: number;
    girthInputFormat: number;
    crownSpread: number;
    crownSpreadInputFormat: number;
    generalComments: string;
    entspts: number | null;
    entspts2: number | null;
    championPoints: number | null;
    abbreviatedChampionPoints: number | null;
    diameter: number;
    diameterInputFormat: number;
    conicalVolume: number;
    conicalVolumeInputFormat: number;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into tree_measurements (
       tree_id, computed_measured_species_id, measured, common_name, scientific_name,
       height, height_input_format, height_measurement_method,
       girth, girth_input_format, crown_spread, crown_spread_input_format,
       latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude,
       elevation, elevation_input_format, general_comments,
       diameter, diameter_input_format, entspts, conical_volume, conical_volume_input_format,
       entspts2, champion_points, abbreviated_champion_points
     )
     values (
       $1, 0, $2, $3, $4,
       $5, $6, 1,
       $7, $8, $9, $10,
       40, 2, -83, 2,
       40, -83,
       0, 2, $11,
       $12, $13, $14, $15, $16,
       $17, $18, $19
     ) returning id`,
    [
      treeId,
      overrides.measured ?? "2020-01-01",
      overrides.commonName ?? "White Oak",
      overrides.scientificName ?? "Quercus alba",
      overrides.height ?? 0,
      overrides.heightInputFormat ?? 1,
      overrides.girth ?? 0,
      overrides.girthInputFormat ?? 1,
      overrides.crownSpread ?? 0,
      overrides.crownSpreadInputFormat ?? 1,
      overrides.generalComments ?? "",
      overrides.diameter ?? 0,
      overrides.diameterInputFormat ?? 1,
      overrides.entspts ?? null,
      overrides.conicalVolume ?? 0,
      overrides.conicalVolumeInputFormat ?? 1,
      overrides.entspts2 ?? null,
      overrides.championPoints ?? null,
      overrides.abbreviatedChampionPoints ?? null,
    ],
  );
  return r.rows[0]!.id;
}

async function insertSiteVisit(
  db: PGlite,
  siteId: number,
  stateId: number,
  overrides: Partial<{ visited: string; comments: string; tripReportUrl: string }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into site_visits (
       site_id, visited, name, state_id, county, ownership_type, ownership_contact_info,
       make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude, comments, trip_report_url
     )
     values ($1, $2, 'Test Park', $3, 'Franklin', 'Public', '', false, 40, 2, -83, 2, 40, -83, $4, $5)
     returning id`,
    [siteId, overrides.visited ?? "2020-01-01", stateId, overrides.comments ?? "", overrides.tripReportUrl ?? ""],
  );
  return r.rows[0]!.id;
}

async function insertSiteVisitor(db: PGlite, siteId: number, siteVisitId: number, firstName: string, lastName: string): Promise<void> {
  await db.query(`insert into site_visitors (site_id, site_visit_id, first_name, last_name) values ($1, $2, $3, $4)`, [
    siteId,
    siteVisitId,
    firstName,
    lastName,
  ]);
}

describe("details.sql", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  let siteId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH" });
    siteId = await insertSite(db, stateId, { name: "Test Park", county: "Franklin" });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("treeDetails", () => {
    it("returns null for a missing id", async () => {
      expect(await treeDetails(999999, sql)).toBeNull();
    });

    it("computes GeneralComments from the LAST measurement (not a trees column), and orders measurements newest first", async () => {
      const treeId = await insertTree(db, siteId, { scientificName: "Quercus alba", commonName: "White Oak", height: 120, girth: 60 });
      await insertTreeMeasurement(db, treeId, {
        measured: "2019-01-01",
        height: 100,
        heightInputFormat: 2,
        generalComments: "old comment",
      });
      const newest = await insertTreeMeasurement(db, treeId, {
        measured: "2020-06-01",
        height: 120,
        heightInputFormat: 2,
        generalComments: "newest comment",
      });
      await insertTreeMeasurer(db, { measurementId: newest }, "Jane", "Doe");

      const data = await treeDetails(treeId, sql);
      expect(data).not.toBeNull();
      expect(data!.generalComments).toBe("newest comment");
      expect(data!.measurements).toHaveLength(2);
      expect(data!.measurements[0]!.measured.slice(0, 10)).toBe("2020-06-01");
      expect(data!.measurements[1]!.measured.slice(0, 10)).toBe("2019-01-01");
      expect(data!.measurements[0]!.measurers).toEqual([{ firstName: "Jane", lastName: "Doe" }]);
    });

    it("breaks same-date measurement ties by lowest id first (LINQ `OrderByDescending` stable-sort tie preservation, NOT `id desc`)", async () => {
      const treeId = await insertTree(db, siteId, { scientificName: "Tsuga canadensis", commonName: "Eastern Hemlock", height: 90, girth: 50 });
      const lower = await insertTreeMeasurement(db, treeId, { scientificName: "Tsuga canadensis", commonName: "Eastern Hemlock", measured: "2021-05-01", height: 90, heightInputFormat: 2 });
      const higher = await insertTreeMeasurement(db, treeId, { scientificName: "Tsuga canadensis", commonName: "Eastern Hemlock", measured: "2021-05-01", height: 91, heightInputFormat: 2 });
      expect(higher).toBeGreaterThan(lower);

      const data = await treeDetails(treeId, sql);
      expect(data!.measurements.map((m) => m.id)).toEqual([lower, higher]);
    });

    it("computes TDI2/TDI3 against the CURRENT global max for (scientificName, commonName)", async () => {
      // Species-global max: 200'/90' girth, from a second, taller tree.
      const treeId = await insertTree(db, siteId, { scientificName: "Pinus strobus", commonName: "White Pine", height: 100, girth: 40 });
      await insertTreeMeasurement(db, treeId, { scientificName: "Pinus strobus", commonName: "White Pine", height: 100, heightInputFormat: 2, girth: 40, girthInputFormat: 2, crownSpread: 20, crownSpreadInputFormat: 2 });
      const tallTreeId = await insertTree(db, siteId, { scientificName: "Pinus strobus", commonName: "White Pine", height: 200, girth: 80 });
      await insertTreeMeasurement(db, tallTreeId, { scientificName: "Pinus strobus", commonName: "White Pine", height: 200, heightInputFormat: 2, girth: 80, girthInputFormat: 2, crownSpread: 40, crownSpreadInputFormat: 2 });

      const data = await treeDetails(treeId, sql);
      expect(data).not.toBeNull();
      // Global max height=200, girth=80 (from tallTreeId).
      expect(data!.maxHeight).toBe(200);
      expect(data!.maxGirth).toBe(80);
      // TDI2 = height/maxHeight + girth/maxGirth = 100/200 + 40/80 = 0.5 + 0.5 = 1
      expect(data!.height / data!.maxHeight + data!.girth / data!.maxGirth).toBeCloseTo(1, 5);
    });

    it("passes each measurement's own raw input-format codes through untouched, for the page to gate NullDisplayText", async () => {
      const treeId = await insertTree(db, siteId, { scientificName: "Acer rubrum", commonName: "Red Maple", height: 0, girth: 0 });
      await insertTreeMeasurement(db, treeId, {
        scientificName: "Acer rubrum",
        commonName: "Red Maple",
        height: 0,
        heightInputFormat: 1, // Unspecified
        girth: 40,
        girthInputFormat: 2, // Default (specified)
      });
      const data = await treeDetails(treeId, sql);
      expect(data!.measurements).toHaveLength(1);
      expect(data!.measurements[0]!.heightInputFormat).toBe(1);
      expect(data!.measurements[0]!.girthInputFormat).toBe(2);
      expect(data!.measurements[0]!.girth).toBe(40);
    });
  });

  describe("siteDetails", () => {
    it("returns null for a missing id", async () => {
      expect(await siteDetails(999999, sql)).toBeNull();
    });

    it("maps LastVisitComments from the LATEST site_visits row (not a sites column), newest-first visits", async () => {
      const localSiteId = await insertSite(db, stateId, { name: "Visit Park" });
      await insertSiteVisit(db, localSiteId, stateId, { visited: "2019-01-01", comments: "first visit" });
      const latest = await insertSiteVisit(db, localSiteId, stateId, { visited: "2021-01-01", comments: "latest visit" });
      await insertSiteVisitor(db, localSiteId, latest, "Ann", "Lee");

      const data = await siteDetails(localSiteId, sql);
      expect(data).not.toBeNull();
      expect(data!.lastVisitComments).toBe("latest visit");
      expect(data!.visits).toHaveLength(2);
      expect(data!.visits[0]!.visited.slice(0, 10)).toBe("2021-01-01");
      expect(data!.visits[0]!.visitors).toEqual([{ firstName: "Ann", lastName: "Lee" }]);
      expect(data!.visits[1]!.visited.slice(0, 10)).toBe("2019-01-01");
    });

    it("breaks same-date visit ties by lowest id first (LINQ `OrderByDescending` stable-sort tie preservation, NOT `id desc`)", async () => {
      const localSiteId = await insertSite(db, stateId, { name: "Tie Park" });
      const lower = await insertSiteVisit(db, localSiteId, stateId, { visited: "2020-03-01", comments: "a", tripReportUrl: "http://a.example/x" });
      const higher = await insertSiteVisit(db, localSiteId, stateId, { visited: "2020-03-01", comments: "b", tripReportUrl: "" });
      expect(higher).toBeGreaterThan(lower);

      const data = await siteDetails(localSiteId, sql);
      expect(data!.visits.map((v) => v.id)).toEqual([lower, higher]);
      expect(data!.visits[0]!.tripReportUrl).toBe("http://a.example/x");
      expect(data!.visits[1]!.tripReportUrl).toBe("");
    });
  });

  describe("siteSpeciesGrid", () => {
    let gridSiteId: number;

    beforeAll(async () => {
      gridSiteId = await insertSite(db, stateId, { name: "Grid Park" });
      await insertTree(db, gridSiteId, { scientificName: "Quercus alba", commonName: "White Oak", height: 100, girth: 40 });
      await insertTree(db, gridSiteId, { scientificName: "Acer rubrum", commonName: "Red Maple", height: 150, girth: 60 });
      await insertTree(db, gridSiteId, { scientificName: "Fagus grandifolia", commonName: "American Beech", height: 80, girth: 30 });
    });

    it("defaults to unsorted (query-natural, scientificName ascending) order when sort is absent", async () => {
      const result = await siteSpeciesGrid(gridSiteId, {}, sql);
      expect(result.totalCount).toBe(3);
      expect(result.rows.map((r) => r.scientificName)).toEqual(["Acer rubrum", "Fagus grandifolia", "Quercus alba"]);
    });

    it("sorts by MaxHeight ascending by default, descending when sortAscending is literally false", async () => {
      const asc = await siteSpeciesGrid(gridSiteId, { sort: "MaxHeight" }, sql);
      expect(asc.rows.map((r) => r.maxHeight)).toEqual([80, 100, 150]);

      const desc = await siteSpeciesGrid(gridSiteId, { sort: "MaxHeight", sortAscending: false }, sql);
      expect(desc.rows.map((r) => r.maxHeight)).toEqual([150, 100, 80]);
    });

    it("an unmatched (case-sensitive) sort column falls back to unsorted, not an error", async () => {
      const result = await siteSpeciesGrid(gridSiteId, { sort: "maxheight" }, sql);
      expect(result.rows.map((r) => r.scientificName)).toEqual(["Acer rubrum", "Fagus grandifolia", "Quercus alba"]);
    });

    it("pages at size 10 (page index 0-based, `page ?? 0`)", async () => {
      const result = await siteSpeciesGrid(gridSiteId, { page: 0 }, sql);
      expect(result.pageIndex).toBe(0);
      expect(result.rows).toHaveLength(3); // fewer than 10 total
      const pastEnd = await siteSpeciesGrid(gridSiteId, { page: 1 }, sql);
      expect(pastEnd.rows).toHaveLength(0);
      expect(pastEnd.totalCount).toBe(3);
    });
  });
});
