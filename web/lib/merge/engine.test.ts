// Integration tests for engine.ts's `finishTrip` against a real (PGlite)
// schema. Complements the pure-function unit suites in headline.test.ts,
// graph.test.ts, and predicates.test.ts (which already cover the exact
// 25.0'/1-ulp coordinate boundary cases at the unit level per doc 07 §8 --
// see this file's header note in engine.ts). These tests exercise the
// DB round-trip: candidate queries, insert-vs-merge branching, headline
// persistence, species-hash computation, and stale-metric propagation.
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { speciesHash } from "../species-hash";
import { finishTrip } from "./engine";
import { createTestDb, insertCountry, insertState, pgliteSqlTag } from "../../db/queries/test-helpers";
import type { SqlTag } from "../../db/queries/sql-tag";
import { CoordinatesFormat } from "./types";

// Local, test-only insert helpers for the import_* staging tables --
// test-helpers.ts doesn't cover these (see details.test.ts's identical
// rationale for keeping such helpers local to the owning task's test file).

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

async function insertImportTripMeasurer(
  db: PGlite,
  tripId: number,
  firstName: string,
  lastName: string,
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_trip_measurers (trip_id, first_name, last_name) values ($1, $2, $3) returning id`,
    [tripId, firstName, lastName],
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

describe("finishTrip", () => {
  // A single shared PGlite instance for the whole file (booting many
  // separate WASM instances per-test, one per `it`, was observed to
  // intermittently crash with a spurious "time zone ... not recognized"
  // error from the WASM Postgres runtime -- matching vitest.config.ts's
  // existing note about concurrent WASM boots contending for CPU/resources.
  // Every existing PGlite-backed suite in this codebase uses a single
  // `beforeAll` instance for the same reason; each test below creates its
  // own country/state/trip fixtures and scopes every assertion query by the
  // specific ids it just created, so tests stay independent within the
  // shared DB.
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

  it("fresh import inserts a new site, tree, and measurement with computed headline + species hash", async () => {
    const stateId = await freshState();
    const tripId = await insertImportTrip(db, { date: "2020-06-15" });
    await insertImportTripMeasurer(db, tripId, "Alice", "Anderson");
    const importSiteId = await insertImportSite(db, tripId, stateId, {
      latitude: 40,
      longitude: -83,
    });
    await insertImportTree(db, importSiteId, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
      height: 80,
      girth: 200,
      crownSpread: 60,
    });

    const result = await finishTrip(tripId, sql);
    expect(result).toEqual({
      sitesInserted: 1,
      sitesMerged: 0,
      treesInserted: 1,
      treesMerged: 0,
      measurementsInserted: 1,
    });

    const [site] = await sql<{
      id: number;
      name: string;
      county: string;
      visit_count: number;
      are_metrics_stale: boolean;
    }>`select id, name, county, visit_count, are_metrics_stale from sites where state_id = ${stateId}`;
    expect(site!.name).toBe("Test Park");
    expect(site!.county).toBe("Franklin");
    expect(site!.visit_count).toBe(1);
    // finishTrip runs recomputeStaleMetrics at the end of the same
    // transaction -- the stale flag it set mid-transaction should already
    // be cleared by the time finishTrip returns.
    expect(site!.are_metrics_stale).toBe(false);

    const [state] = await sql<{ are_metrics_stale: boolean; computed_trees_measured_count: number }>`
      select are_metrics_stale, computed_trees_measured_count from states where id = ${stateId}
    `;
    expect(state!.are_metrics_stale).toBe(false);
    expect(state!.computed_trees_measured_count).toBe(1);

    const [tree] = await sql<{
      id: number;
      common_name: string;
      scientific_name: string;
      height: number;
      girth: number;
      computed_measured_species_id: number;
    }>`select id, common_name, scientific_name, height, girth, computed_measured_species_id from trees where site_id = ${site!.id}`;
    expect(tree!.common_name).toBe("White Oak");
    expect(tree!.scientific_name).toBe("Quercus alba");
    expect(tree!.height).toBeCloseTo(80, 3);
    expect(tree!.computed_measured_species_id).toBe(speciesHash("Quercus alba", "White Oak"));

    const measurers = await sql<{ first_name: string; last_name: string }>`
      select first_name, last_name from tree_measurers where tree_id = ${tree!.id}
    `;
    expect(measurers).toEqual([{ first_name: "Alice", last_name: "Anderson" }]);
  });

  it("throws when finishing an already-imported trip (guard, matching the controller's Import/Reimport split)", async () => {
    const stateId = await freshState();
    const tripId = await insertImportTrip(db);
    const importSiteId = await insertImportSite(db, tripId, stateId);
    await insertImportTree(db, importSiteId);
    await finishTrip(tripId, sql);

    await expect(finishTrip(tripId, sql)).rejects.toThrow(/already imported/);
  });

  it("merges a second trip's site (close coordinates, same name/state/county) and accumulates a measurement on the matching tree", async () => {
    const stateId = await freshState();
    const trip1 = await insertImportTrip(db, { date: "2019-01-01" });
    const site1 = await insertImportSite(db, trip1, stateId, { latitude: 40, longitude: -83 });
    await insertImportTree(db, site1, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
      latitude: 40.001,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83.001,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      height: 70,
    });
    await finishTrip(trip1, sql);

    // 24.9 arc-minutes north -- within the merge threshold (doc 07 §8
    // safe-margin case; the exact 25.0'/25.1' boundary is covered at the
    // pure-predicate level in predicates.test.ts).
    const trip2 = await insertImportTrip(db, { date: "2020-06-15" });
    const site2 = await insertImportSite(db, trip2, stateId, {
      name: "Test Park", // same name (case aside)
      county: "Franklin", // same county
      latitude: 40 + 24.9 / 60,
      longitude: -83,
    });
    await insertImportTree(db, site2, {
      commonName: "White Oak",
      scientificName: "Quercus alba",
      latitude: 40.001, // exact same tree coordinates -> Tree.ShouldMerge matches
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83.001,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      height: 82, // grew since the last visit
    });

    const result = await finishTrip(trip2, sql);
    expect(result).toEqual({
      sitesInserted: 0,
      sitesMerged: 1,
      treesInserted: 0,
      treesMerged: 1,
      measurementsInserted: 1,
    });

    const [site] = await sql<{ id: number; visit_count: number }>`
      select id, visit_count from sites where state_id = ${stateId}
    `;
    expect(site!.visit_count).toBe(2);

    const [tree] = await sql<{ id: number; height: number }>`
      select id, height from trees where site_id = ${site!.id}
    `;
    // Headline height comes from the LAST (trip2's) measurement.
    expect(tree!.height).toBeCloseTo(82, 3);

    const measurementCount = await sql<{ n: number }>`
      select count(*)::int as n from tree_measurements where tree_id = ${tree!.id}
    `;
    expect(measurementCount[0]!.n).toBe(2);
  });

  it("does not merge the site when county differs, even with matching name and close coordinates", async () => {
    const stateId = await freshState();
    const trip1 = await insertImportTrip(db);
    const site1 = await insertImportSite(db, trip1, stateId, {
      name: "Test Park",
      county: "Franklin",
      latitude: 40,
      longitude: -83,
    });
    await insertImportTree(db, site1);
    await finishTrip(trip1, sql);

    const trip2 = await insertImportTrip(db);
    const site2 = await insertImportSite(db, trip2, stateId, {
      name: "Test Park",
      county: "Delaware", // county mismatch
      latitude: 40,
      longitude: -83,
    });
    await insertImportTree(db, site2);

    const result = await finishTrip(trip2, sql);
    expect(result.sitesInserted).toBe(1);
    expect(result.sitesMerged).toBe(0);

    const sites = await sql<{ id: number }>`select id from sites where state_id = ${stateId}`;
    expect(sites).toHaveLength(2);
  });

  it("merges the site but keeps trees separate when tree coordinates differ by 1 ULP", async () => {
    const stateId = await freshState();
    const F = Math.fround;
    const baseLat = F(40.001);
    const buf = new Float32Array([baseLat]);
    const bits = new Int32Array(buf.buffer);
    bits[0] += 1;
    const oneUlpUp = buf[0];

    const trip1 = await insertImportTrip(db);
    const site1 = await insertImportSite(db, trip1, stateId, { latitude: 40, longitude: -83 });
    await insertImportTree(db, site1, {
      latitude: baseLat,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83.001,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    await finishTrip(trip1, sql);

    const trip2 = await insertImportTrip(db);
    const site2 = await insertImportSite(db, trip2, stateId, { latitude: 40, longitude: -83 });
    await insertImportTree(db, site2, {
      latitude: oneUlpUp, // 1 float32 ULP away from trip1's tree
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83.001,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });

    const result = await finishTrip(trip2, sql);
    expect(result.sitesMerged).toBe(1);
    expect(result.treesInserted).toBe(1); // NOT merged into trip1's tree
    expect(result.treesMerged).toBe(0);

    const trees = await sql<{ id: number }>`select id from trees where site_id in (
      select id from sites where state_id = ${stateId}
    )`;
    expect(trees).toHaveLength(2);
  });
});
