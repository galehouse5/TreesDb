// Integration tests for reimport.ts's `reimportTrip` -- the orphan-cleanup
// rules (RemoveMeasurementsByTrip/RemoveVisitsByTrip) and reimport
// idempotence (doc 07 §8).
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { finishTrip } from "./engine";
import { reimportTrip } from "./reimport";
import { createTestDb, insertCountry, insertState, pgliteSqlTag } from "../../db/queries/test-helpers";
import type { SqlTag } from "../../db/queries/sql-tag";
import { CoordinatesFormat } from "./types";

// Same local, test-only import_* insert helpers as engine.test.ts -- kept
// local to each test file per this codebase's established convention (see
// details.test.ts's comment) rather than added to the shared test-helpers.ts.

async function insertImportTrip(
  db: PGlite,
  overrides: Partial<{ name: string; date: string; website: string }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_trips (creator_user_id, name, date, website, photos_available, measurer_contact_info, make_measurer_contact_info_public)
     values (null, $1, $2, $3, false, '', false) returning id`,
    [overrides.name ?? "Test Trip", overrides.date ?? "2020-06-15", overrides.website ?? ""],
  );
  return r.rows[0]!.id;
}

async function insertImportSite(
  db: PGlite,
  tripId: number,
  stateId: number,
  overrides: Partial<{
    name: string;
    county: string;
    latitude: number;
    latitudeInputFormat: number;
    longitude: number;
    longitudeInputFormat: number;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_sites (
       creator_user_id, trip_id, name, state_id, county, ownership_type, ownership_contact_info,
       make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
     ) values (null, $1, $2, $3, $4, 'Public', '', false, $5, $6, $7, $8, '')
     returning id`,
    [
      tripId,
      overrides.name ?? "Test Park",
      stateId,
      overrides.county ?? "Franklin",
      overrides.latitude ?? 40,
      overrides.latitudeInputFormat ?? CoordinatesFormat.DecimalDegrees,
      overrides.longitude ?? -83,
      overrides.longitudeInputFormat ?? CoordinatesFormat.DecimalDegrees,
    ],
  );
  return r.rows[0]!.id;
}

async function insertImportTree(
  db: PGlite,
  siteId: number,
  overrides: Partial<{
    commonName: string;
    scientificName: string;
    height: number;
    heightInputFormat: number;
    girth: number;
    girthInputFormat: number;
    crownSpread: number;
    crownSpreadInputFormat: number;
    latitude: number;
    latitudeInputFormat: number;
    longitude: number;
    longitudeInputFormat: number;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_trees (
       creator_user_id, site_id, type, tree_name, tree_number, common_name, scientific_name,
       status, health_status, age_class, age_type, age, general_comments,
       latitude, latitude_input_format, longitude, longitude_input_format, make_coordinates_public,
       elevation, elevation_input_format,
       height, height_input_format, height_measurement_method,
       height_measurements_distance_top, height_measurements_distance_top_input_format,
       height_measurements_angle_top, height_measurements_angle_top_input_format,
       height_measurements_distance_bottom, height_measurements_distance_bottom_input_format,
       height_measurements_angle_bottom, height_measurements_angle_bottom_input_format,
       height_measurements_vertical_offset, height_measurements_vertical_offset_input_format,
       height_measurement_type, laser_brand, clinometer_brand, height_comments,
       girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
       girth_root_collar_height, girth_root_collar_height_input_format, girth_comments,
       crown_spread, crown_spread_input_format, maximum_limb_length, maximum_limb_length_input_format,
       crown_spread_measurement_method, base_crown_height, base_crown_height_input_format,
       crown_volume, crown_volume_input_format, crown_volume_calculation_method, crown_comments,
       trunk_volume, trunk_volume_input_format, trunk_volume_calculation_method, trunk_comments,
       form_type, number_of_trunks, tree_form_comments,
       terrain_type, terrain_shape_index, landform_index, terrain_comments, combined_girth_number_of_trunks
     ) values (
       null, $1, 1, 'Tree 1', null, $2, $3,
       0, '', 0, 0, null, '',
       $4, $5, $6, $7, false,
       0, 1,
       $8, $9, 0,
       0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
       '', '', '', '',
       $10, $11, 0, 1,
       0, 1, '',
       $12, $13, 0, 1,
       '', 0, 1,
       0, 1, '', '',
       0, 1, '', '',
       0, null, '',
       0, null, null, '', null
     ) returning id`,
    [
      siteId,
      overrides.commonName ?? "White Oak",
      overrides.scientificName ?? "Quercus alba",
      overrides.latitude ?? 0,
      overrides.latitudeInputFormat ?? CoordinatesFormat.Unspecified,
      overrides.longitude ?? 0,
      overrides.longitudeInputFormat ?? CoordinatesFormat.Unspecified,
      overrides.height ?? 80,
      overrides.heightInputFormat ?? CoordinatesFormat.Default,
      overrides.girth ?? 200,
      overrides.girthInputFormat ?? CoordinatesFormat.Default,
      overrides.crownSpread ?? 60,
      overrides.crownSpreadInputFormat ?? CoordinatesFormat.Default,
    ],
  );
  return r.rows[0]!.id;
}

describe("reimportTrip", () => {
  // Single shared PGlite instance across this file -- see engine.test.ts's
  // header note (repeated boot of separate WASM instances per-test was
  // observed to intermittently crash unrelated to this suite's logic).
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  async function freshState(): Promise<number> {
    const countryId = await insertCountry(db);
    return insertState(db, countryId);
  }

  it("throws when reimporting a trip that has never been imported", async () => {
    const tripId = await insertImportTrip(db);
    await expect(reimportTrip(tripId, sql)).rejects.toThrow(/has not yet been imported/);
  });

  it("reimport idempotence: import once, then reimport, reproduces the same site/tree/measurement content", async () => {
    const stateId = await freshState();
    const tripId = await insertImportTrip(db, { date: "2020-06-15" });
    const importSiteId = await insertImportSite(db, tripId, stateId, { latitude: 40, longitude: -83 });
    await insertImportTree(db, importSiteId, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
      height: 80,
      girth: 200,
      crownSpread: 60,
    });

    await finishTrip(tripId, sql);
    const before = await sql<{
      name: string;
      county: string;
      visit_count: number;
      common_name: string;
      scientific_name: string;
      height: number;
      girth: number;
      measurement_count: number;
    }>`
      select s.name, s.county, s.visit_count, t.common_name, t.scientific_name, t.height, t.girth,
        (select count(*)::int from tree_measurements tm where tm.tree_id = t.id) as measurement_count
      from sites s join trees t on t.site_id = s.id
      where s.state_id = ${stateId}
    `;

    const result = await reimportTrip(tripId, sql);
    expect(result).toEqual({
      sitesInserted: 1,
      sitesMerged: 0,
      treesInserted: 1,
      treesMerged: 0,
      measurementsInserted: 1,
    });

    const after = await sql<{
      name: string;
      county: string;
      visit_count: number;
      common_name: string;
      scientific_name: string;
      height: number;
      girth: number;
      measurement_count: number;
    }>`
      select s.name, s.county, s.visit_count, t.common_name, t.scientific_name, t.height, t.girth,
        (select count(*)::int from tree_measurements tm where tm.tree_id = t.id) as measurement_count
      from sites s join trees t on t.site_id = s.id
      where s.state_id = ${stateId}
    `;

    expect(after).toEqual(before);
  });

  it("orphan cleanup: reimporting a trip that solely created a site removes that site and its tree", async () => {
    const stateId = await freshState();
    const tripId = await insertImportTrip(db);
    const importSiteId = await insertImportSite(db, tripId, stateId, {
      name: "Solo Site",
      latitude: 41,
      longitude: -84,
    });
    await insertImportTree(db, importSiteId);
    await finishTrip(tripId, sql);

    const [siteBefore] = await sql<{ id: number }>`
      select id from sites where state_id = ${stateId} and name = 'Solo Site'
    `;
    expect(siteBefore).toBeDefined();
    const siteId = siteBefore!.id;

    // Delete this trip's import_* staging rows too, so re-running
    // finishTrip's internals (via reimportTrip -> runImport) sees NO sites
    // for this trip and only the cleanup phase's deletions are exercised.
    await sql`delete from import_trees where site_id = ${importSiteId}`;
    await sql`delete from import_sites where id = ${importSiteId}`;

    const result = await reimportTrip(tripId, sql);
    expect(result).toEqual({
      sitesInserted: 0,
      sitesMerged: 0,
      treesInserted: 0,
      treesMerged: 0,
      measurementsInserted: 0,
    });

    const sitesAfter = await sql<{ id: number }>`select id from sites where id = ${siteId}`;
    expect(sitesAfter).toHaveLength(0);
    const treesAfter = await sql<{ id: number }>`select id from trees where site_id = ${siteId}`;
    expect(treesAfter).toHaveLength(0);
  });

  it("orphan cleanup: a site shared by another trip survives reimport of the trip that only added a visit", async () => {
    const stateId = await freshState();

    const trip1 = await insertImportTrip(db, { date: "2019-01-01" });
    const site1 = await insertImportSite(db, trip1, stateId, {
      name: "Shared Site",
      latitude: 42,
      longitude: -85,
    });
    await insertImportTree(db, site1, { commonName: "Shared Tree" });
    await finishTrip(trip1, sql);

    const trip2 = await insertImportTrip(db, { date: "2020-06-15" });
    // Same name/state/county, close coordinates -> merges into the same
    // site as trip1 (an additional visit, no new tree).
    const site2 = await insertImportSite(db, trip2, stateId, {
      name: "Shared Site",
      latitude: 42,
      longitude: -85,
    });
    // No import_trees row for trip2 -- this trip only visits, doesn't add a tree.
    await finishTrip(trip2, sql);

    const [site] = await sql<{ id: number; visit_count: number }>`
      select id, visit_count from sites where state_id = ${stateId}
    `;
    expect(site!.visit_count).toBe(2);
    const siteId = site!.id;

    // Reimporting trip2 removes ONLY its own visit; the site survives
    // because trip1's visit remains.
    await sql`delete from import_sites where id = ${site2}`;
    const result = await reimportTrip(trip2, sql);
    expect(result.sitesInserted).toBe(0);
    expect(result.sitesMerged).toBe(0);

    const [siteAfter] = await sql<{ id: number }>`select id from sites where id = ${siteId}`;
    expect(siteAfter).toBeDefined();

    // The underlying site_visits row count reflects the cleanup accurately...
    const visitRows = await sql<{ n: number }>`
      select count(*)::int as n from site_visits where site_id = ${siteId}
    `;
    expect(visitRows[0]!.n).toBe(1);
    // ...but per engine.ts's documented DESIGN CHOICE (matching legacy
    // exactly), the orphan-cleanup phase never recomputes a SURVIVING
    // site's headline -- the stored `visit_count` column is left stale at
    // its pre-cleanup value until something merges into this site again.
    const [staleHeadline] = await sql<{ visit_count: number }>`
      select visit_count from sites where id = ${siteId}
    `;
    expect(staleHeadline!.visit_count).toBe(2);

    const treesAfter = await sql<{ id: number }>`select id from trees where site_id = ${siteId}`;
    expect(treesAfter).toHaveLength(1); // trip1's tree untouched
  });

  it("stale-flag propagation: reimport re-marks the site stale and recomputeStaleMetrics refreshes it", async () => {
    const stateId = await freshState();

    // Two trips share one site (trip1's visit keeps the site alive across
    // trip2's reimport below) so this test can inspect a SURVIVING site's
    // refreshed metrics, rather than a freshly re-created one.
    const trip1 = await insertImportTrip(db, { date: "2019-01-01" });
    const site1 = await insertImportSite(db, trip1, stateId, { name: "Metrics Park", latitude: 44, longitude: -87 });
    await insertImportTree(db, site1, { commonName: "White Oak", height: 50 });
    await finishTrip(trip1, sql);

    const trip2 = await insertImportTrip(db, { date: "2020-06-15" });
    const site2 = await insertImportSite(db, trip2, stateId, { name: "Metrics Park", latitude: 44, longitude: -87 });
    await insertImportTree(db, site2, { commonName: "Red Maple", height: 30 });
    await finishTrip(trip2, sql);

    const [site] = await sql<{ id: number }>`select id from sites where state_id = ${stateId}`;
    const siteId = site!.id;

    // Sabotage: a value a real recompute would never produce, with the
    // stale flag explicitly cleared -- if reimportTrip's stale-marking
    // didn't run (or recomputeStaleMetrics didn't pick it back up), this
    // sentinel would survive untouched.
    await sql`update sites set are_metrics_stale = false, computed_trees_measured_count = 99999 where id = ${siteId}`;

    const result = await reimportTrip(trip2, sql);
    expect(result.sitesMerged).toBe(1);
    expect(result.treesInserted).toBe(1);

    const [siteAfter] = await sql<{
      are_metrics_stale: boolean;
      computed_trees_measured_count: number;
    }>`select are_metrics_stale, computed_trees_measured_count from sites where id = ${siteId}`;
    expect(siteAfter!.are_metrics_stale).toBe(false); // recomputeStaleMetrics clears it before reimportTrip returns
    expect(siteAfter!.computed_trees_measured_count).toBe(2); // both trees counted again, sentinel gone
  });
});
