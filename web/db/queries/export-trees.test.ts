import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getExportTrees } from "./export-trees.sql";
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

// --- Local fixture helpers ---------------------------------------------------
// Not added to the shared `test-helpers.ts` (owned by another task, and this
// file is the only consumer of these particular tables) -- kept local per
// this task's file-ownership boundary (own only `export-trees.sql.ts` + its
// colocated test).

async function insertSiteVisit(
  db: PGlite,
  siteId: number,
  stateId: number,
  overrides: Partial<{
    visited: string;
    comments: string;
    tripReportUrl: string;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into site_visits (
       site_id, visited, name, state_id, county, ownership_type, ownership_contact_info,
       make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude, comments, trip_report_url
     )
     values ($1, $2, 'Visit', $3, 'Franklin', 'Public', '', false, 40, 2, -83, 2, 40, -83, $4, $5)
     returning id`,
    [
      siteId,
      overrides.visited ?? "2020-01-01",
      stateId,
      overrides.comments ?? "",
      overrides.tripReportUrl ?? "",
    ],
  );
  return r.rows[0]!.id;
}

async function insertTreeMeasurement(
  db: PGlite,
  treeId: number,
  overrides: Partial<{
    measured: string;
    commonName: string;
    scientificName: string;
    generalComments: string;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into tree_measurements (
       tree_id, computed_measured_species_id, measured, common_name, scientific_name,
       height, height_input_format, height_measurement_method,
       girth, girth_input_format,
       crown_spread, crown_spread_input_format,
       latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude,
       elevation, elevation_input_format, general_comments,
       diameter, diameter_input_format,
       conical_volume, conical_volume_input_format
     )
     values (
       $1, 0, $2, $3, $4,
       0, 2, 0,
       0, 2,
       0, 2,
       40, 2, -83, 2,
       40, -83,
       0, 2, $5,
       0, 2,
       0, 2
     )
     returning id`,
    [
      treeId,
      overrides.measured ?? "2020-01-01",
      overrides.commonName ?? "White Oak",
      overrides.scientificName ?? "Quercus alba",
      overrides.generalComments ?? "",
    ],
  );
  return r.rows[0]!.id;
}

async function insertPhoto(db: PGlite): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into photos (created, width, height, bytes, format)
     values (now(), 100, 100, 1000, 1) returning id`,
  );
  return r.rows[0]!.id;
}

async function insertTreeMeasurementPhotoReference(
  db: PGlite,
  treeMeasurementId: number,
  photoId: number,
): Promise<void> {
  await db.query(`insert into photo_references (type, tree_measurement_id, photo_id) values (7, $1, $2)`, [
    treeMeasurementId,
    photoId,
  ]);
}

async function setLatLongInputFormat(
  db: PGlite,
  treeId: number,
  latitudeInputFormat: number,
  longitudeInputFormat: number,
): Promise<void> {
  await db.query(`update trees set latitude_input_format = $2, longitude_input_format = $3 where id = $1`, [
    treeId,
    latitudeInputFormat,
    longitudeInputFormat,
  ]);
}

// --- Tests -------------------------------------------------------------------
// Each top-level `describe` below gets its OWN fresh PGlite instance (rather
// than one shared across the whole file) so exact-match/contains-match
// filter assertions and count assertions can't be polluted by other
// sections' fixtures -- `insertTree`'s defaults (`commonName: "White Oak"`,
// `scientificName: "Quercus alba"`) and this file's repeated "Baker Woods"
// site name would otherwise collide across sections.

describe("export-trees.sql (getExportTrees, port of ExportRepository.GetTrees) - field mapping", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("shapes a fully-populated tree into ExportTreeRow", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH" });
    const siteId = await insertSite(db, stateId, { name: "Baker Woods", county: "Franklin" });
    await insertSiteVisit(db, siteId, stateId, {
      visited: "2019-05-01",
      comments: "old comment",
      tripReportUrl: "http://old",
    });
    await insertSiteVisit(db, siteId, stateId, {
      visited: "2021-06-15",
      comments: "latest visit comment",
      tripReportUrl: "http://latest",
    });
    const treeId = await insertTree(db, siteId, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
      height: 100,
      girth: 40,
      crownSpread: 20,
      lastMeasured: "2021-07-01",
    });
    await insertTreeMeasurement(db, treeId, {
      measured: "2020-01-01",
      generalComments: "first measurement comment",
    });
    const lastMeasurementId = await insertTreeMeasurement(db, treeId, {
      measured: "2021-07-01",
      generalComments: "latest measurement comment",
    });
    await insertTreeMeasurer(db, { treeId }, "John", "Smith");
    const photoId = await insertPhoto(db);
    await insertTreeMeasurementPhotoReference(db, lastMeasurementId, photoId);

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.id).toBe(treeId);
    expect(row.commonName).toBe("White Oak");
    expect(row.scientificName).toBe("Quercus alba");
    expect(row.stateName).toBe("Ohio");
    expect(row.county).toBe("Franklin");
    expect(row.siteName).toBe("Baker Woods");
    // Site comments/trip report url come from the LAST visit (max visited).
    expect(row.siteComments).toBe("latest visit comment");
    expect(row.tripReportUrl).toBe("http://latest");
    // Tree comments come from the LAST measurement (max measured).
    expect(row.treeComments).toBe("latest measurement comment");
    expect(row.measurementCount).toBe(2);
    expect(row.measuredDate).toBe("2021-07-01");
    expect(row.measurers).toEqual([{ firstName: "John", lastName: "Smith" }]);
    // hasPhotos reflects only the LAST measurement's photos.
    expect(row.hasPhotos).toBe(true);
    expect(row.heightFeet).toBe(100);
    expect(row.girthFeet).toBe(40);
    expect(row.crownSpreadFeet).toBe(20);
  });

  it("hasPhotos is false when only an earlier (non-last) measurement has a photo", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const siteId = await insertSite(db, stateId);
    const treeId = await insertTree(db, siteId, { lastMeasured: "2021-01-01" });
    const earlierMeasurementId = await insertTreeMeasurement(db, treeId, { measured: "2019-01-01" });
    await insertTreeMeasurement(db, treeId, { measured: "2021-01-01" });
    const photoId = await insertPhoto(db);
    await insertTreeMeasurementPhotoReference(db, earlierMeasurementId, photoId);

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows[0]!.hasPhotos).toBe(false);
  });

  it("last measurement / last visit ties (equal max date) break toward the higher id", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const siteId = await insertSite(db, stateId);
    await insertSiteVisit(db, siteId, stateId, { visited: "2020-01-01", comments: "visit A" });
    await insertSiteVisit(db, siteId, stateId, { visited: "2020-01-01", comments: "visit B" });
    const treeId = await insertTree(db, siteId, { lastMeasured: "2020-06-01" });
    await insertTreeMeasurement(db, treeId, { measured: "2020-06-01", generalComments: "measurement A" });
    await insertTreeMeasurement(db, treeId, { measured: "2020-06-01", generalComments: "measurement B" });

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows[0]!.siteComments).toBe("visit B");
    expect(rows[0]!.treeComments).toBe("measurement B");
  });

  it("measurers preserve insertion (id) order and are NOT de-duplicated", async () => {
    // Verified against the production byte-level oracle
    // (parity/snapshots/exports/Export/SpeciesByFilters__*.csv, tree id
    // 58927): "Turner Sharp, Turner Sharp, Susan Sharp, Dan Cooley" -- the
    // persisted tree-scoped `tree_measurers` cache is not duplicate-free in
    // production, so this query must not dedupe either.
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const siteId = await insertSite(db, stateId);
    const treeId = await insertTree(db, siteId);
    await insertTreeMeasurer(db, { treeId }, "Turner", "Sharp");
    await insertTreeMeasurer(db, { treeId }, "Turner", "Sharp");
    await insertTreeMeasurer(db, { treeId }, "Susan", "Sharp");
    await insertTreeMeasurer(db, { treeId }, "Dan", "Cooley");
    // A measurement-scoped row (measurement_id set, tree_id null) must be
    // excluded entirely.
    const measurementId = await insertTreeMeasurement(db, treeId);
    await insertTreeMeasurer(db, { measurementId }, "Ignored", "Measurer");

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows[0]!.measurers).toEqual([
      { firstName: "Turner", lastName: "Sharp" },
      { firstName: "Turner", lastName: "Sharp" },
      { firstName: "Susan", lastName: "Sharp" },
      { firstName: "Dan", lastName: "Cooley" },
    ]);
  });

  it("no measurers -> empty array", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const siteId = await insertSite(db, stateId);
    const treeId = await insertTree(db, siteId);

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows[0]!.measurers).toEqual([]);
  });

  it("IsSpecified gating passes through the *_input_format != 1 (Unspecified) flags", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const siteId = await insertSite(db, stateId);
    const treeId = await insertTree(db, siteId);
    await setLatLongInputFormat(db, treeId, 1 /* Unspecified */, 2 /* Default */);

    const rows = await getExportTrees({ treeId }, sql);
    expect(rows[0]!.latitudeSpecified).toBe(false);
    expect(rows[0]!.longitudeSpecified).toBe(true);
  });
});

describe("export-trees.sql - filters (ExportRepository.CreateTreeCriteria / CreateSiteCriteria)", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  let otherStateId: number;
  let siteId: number;
  let otherSiteId: number;
  let oakId: number;
  let pineId: number;
  let otherOakId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH" });
    otherStateId = await insertState(db, countryId, { name: "Indiana", doubleLetterCode: "IN" });
    siteId = await insertSite(db, stateId, { name: "Baker Woods", county: "Franklin" });
    otherSiteId = await insertSite(db, otherStateId, { name: "Other Park", county: "Marion" });
    oakId = await insertTree(db, siteId, { commonName: "White Oak", scientificName: "Quercus alba" });
    pineId = await insertTree(db, siteId, {
      commonName: "White Pine",
      scientificName: "Pinus strobus",
    });
    otherOakId = await insertTree(db, otherSiteId, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
    });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("treeId: exact match, one row", async () => {
    const rows = await getExportTrees({ treeId: oakId }, sql);
    expect(rows.map((r) => r.id)).toEqual([oakId]);
  });

  it("siteId: restricts to one site", async () => {
    const rows = await getExportTrees({ siteId }, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual([oakId, pineId].sort((a, b) => a - b));
  });

  it("stateId: restricts to one state", async () => {
    const rows = await getExportTrees({ stateId: otherStateId }, sql);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.stateName).toBe("Indiana");
  });

  it("botanicalName + commonName: exact match, case-insensitive, global (no site/state scope)", async () => {
    const rows = await getExportTrees({ botanicalName: "QUERCUS ALBA", commonName: "white oak" }, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual([oakId, otherOakId].sort((a, b) => a - b));
  });

  it("botanicalNameFilter: contains match, case-insensitive, unescaped %/_", async () => {
    const rows = await getExportTrees({ botanicalNameFilter: "ALBA" }, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual([oakId, otherOakId].sort((a, b) => a - b));
  });

  it("commonNameFilter: contains match", async () => {
    const rows = await getExportTrees({ siteId, commonNameFilter: "Pine" }, sql);
    expect(rows.map((r) => r.id)).toEqual([pineId]);
  });

  it("stateFilter: contains match on state name", async () => {
    const rows = await getExportTrees({ stateFilter: "ohi" }, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual([oakId, pineId].sort((a, b) => a - b));
  });

  it("countyFilter: contains match on site county", async () => {
    const rows = await getExportTrees({ countyFilter: "Marion" }, sql);
    expect(rows.map((r) => r.id)).toEqual([otherOakId]);
  });

  it("siteFilter: contains match on site name", async () => {
    const rows = await getExportTrees({ siteFilter: "Baker" }, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual([oakId, pineId].sort((a, b) => a - b));
  });

  it("combined filters AND together", async () => {
    const rows = await getExportTrees({ stateId, commonNameFilter: "Oak" }, sql);
    expect(rows.map((r) => r.id)).toEqual([oakId]);
  });

  it("no match -> empty array, not an error", async () => {
    const rows = await getExportTrees({ botanicalName: "Nonexistent species" }, sql);
    expect(rows).toEqual([]);
  });

  it("unfiltered -> every tree in the fixture db", async () => {
    const rows = await getExportTrees({}, sql);
    expect(rows.map((r) => r.id).sort((a, b) => a - b)).toEqual(
      [oakId, pineId, otherOakId].sort((a, b) => a - b),
    );
  });
});

describe("export-trees.sql - order (state code, county, site name, common name, scientific name, height, id)", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("orders across states/sites/species as ExportRepository.GetTrees does", async () => {
    const countryId = await insertCountry(db);
    const stateA = await insertState(db, countryId, { name: "Alabama", doubleLetterCode: "AL" });
    const stateB = await insertState(db, countryId, { name: "Wyoming", doubleLetterCode: "WY" });
    const siteA1 = await insertSite(db, stateA, { name: "Site A1", county: "County A" });
    const siteA2 = await insertSite(db, stateA, { name: "Site A2", county: "County B" });
    const siteB1 = await insertSite(db, stateB, { name: "Site B1", county: "County Z" });

    const t1 = await insertTree(db, siteB1, { commonName: "Elm", scientificName: "Ulmus" });
    const t2 = await insertTree(db, siteA2, { commonName: "Elm", scientificName: "Ulmus" });
    const t3 = await insertTree(db, siteA1, { commonName: "Birch", scientificName: "Betula" });
    const t4 = await insertTree(db, siteA1, {
      commonName: "Birch",
      scientificName: "Betula",
      height: 10,
    });
    const t5 = await insertTree(db, siteA1, { commonName: "Ash", scientificName: "Fraxinus" });

    const rows = await getExportTrees({}, sql);
    const ids = rows.map((r) => r.id);
    // Expected: state AL before WY; within AL, County A (site A1) before
    // County B (site A2); within site A1, common name Ash before Birch;
    // within Birch (tied common+scientific), height 0 (t3) before height 10
    // (t4, ThenBy Height.Feet).
    expect(ids).toEqual([t5, t3, t4, t2, t1]);
  });

  it("ties on all six legacy keys break toward tree id (documented deviation, W-003 candidate)", async () => {
    const countryId = await insertCountry(db);
    const state = await insertState(db, countryId);
    const site = await insertSite(db, state);
    const tA = await insertTree(db, site, { commonName: "Elm", scientificName: "Ulmus", height: 5 });
    const tB = await insertTree(db, site, { commonName: "Elm", scientificName: "Ulmus", height: 5 });

    const rows = await getExportTrees({ siteId: site }, sql);
    expect(rows.map((r) => r.id)).toEqual([tA, tB]);
  });
});
