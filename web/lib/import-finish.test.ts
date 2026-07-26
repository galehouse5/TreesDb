/**
 * P3-06 lib/import-finish.ts tests (pure, doc 05 §P3-06, doc 01 §10).
 * Covers: the composed full-graph validation (trip/site/tree/trunk field
 * errors bubbling with the right context, the two structural minimums
 * Trip.Sites/Site.Trees add on top of the earlier steps' own validators,
 * Optional-tier warnings staying non-blocking) and the persisted-row ->
 * step-input round-trip helpers (`tripDraftToStepInput`/
 * `treeRecordToStepInput`/`trunkRecordToStepInput`).
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  describeFinishError,
  hasBlockingErrors,
  treeRecordToStepInput,
  tripDraftToStepInput,
  trunkRecordToStepInput,
  validateTripForFinish,
  type FinishError,
  type FinishGraphInput,
  type FinishSiteInput,
  type FinishTreeInput,
} from "./import-finish";
import {
  ImportTreeType,
  TreeAgeClass,
  TreeAgeType,
  TreeFormType,
  TreeHeightMeasurementMethod,
  TreeStatus,
  TreeTerrainType,
  type TreeStepInput,
  type TrunkInput,
} from "./import-trees";
import { siteToStepInput, type SiteStepInput } from "./import-sites";
import type { TripStepInput } from "./import-wizard";
import { DistanceFormat, ElevationFormat } from "./units/parse";
import { CoordinatesFormat } from "./units/parse-coordinates";
import { finishTrip } from "./merge/engine";
import { reimportTrip } from "./merge/reimport";
import { getTrip, listImportSites, listStates } from "../db/queries/import-drafts.sql";
import { listAllSiteTreesForTrip, listTrunksByTree } from "../db/queries/import-trees.sql";
import type { SqlTag } from "../db/queries/sql-tag";
import { createTestDb, insertCountry, insertState, pgliteSqlTag } from "../db/queries/test-helpers";

// ---------------------------------------------------------------------------
// Fixture builders
// ---------------------------------------------------------------------------

function baseTripStepInput(overrides: Partial<TripStepInput> = {}): TripStepInput {
  return {
    name: "Ohio Big Tree Hunt",
    date: "2020-06-15",
    measurerContactInfo: "555-1234",
    makeMeasurerContactInfoPublic: true,
    firstMeasurer: "Anderson, Alice",
    secondMeasurer: "",
    thirdMeasurer: "",
    website: "",
    ...overrides,
  };
}

function baseSiteStepInput(overrides: Partial<SiteStepInput> = {}): SiteStepInput {
  return {
    name: "North Grove",
    coordinates: "",
    stateId: 1,
    county: "Cuyahoga",
    ownershipType: "City park",
    ownershipContactInfo: "",
    makeOwnershipContactInfoPublic: true,
    comments: "",
    ...overrides,
  };
}

function baseTreeStepInput(overrides: Partial<TreeStepInput> = {}): TreeStepInput {
  return {
    treeType: ImportTreeType.SingleTrunk,
    commonName: "White Oak",
    scientificName: "Quercus alba",
    status: TreeStatus.NotSpecified,
    ageClass: TreeAgeClass.NotSpecified,
    ageType: TreeAgeType.NotSpecified,
    age: "",
    height: "80'",
    heightMeasurementMethod: TreeHeightMeasurementMethod.NotSpecified,
    girth: "200'",
    combinedGirthNumberOfTrunks: "",
    crownSpread: "60'",
    elevation: "",
    terrainType: TreeTerrainType.NotSpecified,
    formType: TreeFormType.Single,
    coordinates: "",
    generalComments: "",
    ...overrides,
  };
}

function validTree(id = 1, overrides: Partial<TreeStepInput> = {}): FinishTreeInput {
  return { id, label: "Quercus alba", step: baseTreeStepInput(overrides), trunks: [] };
}

function validSite(id = 1, trees: FinishTreeInput[] = [validTree()]): FinishSiteInput {
  return { id, name: "North Grove", step: baseSiteStepInput(), stateBounds: null, trees };
}

function validGraph(overrides: Partial<FinishGraphInput> = {}): FinishGraphInput {
  return {
    trip: baseTripStepInput(),
    sites: [validSite()],
    ...overrides,
  };
}

function trunkErrorsOf(errors: FinishError[]) {
  return errors.filter((e): e is Extract<FinishError, { level: "trunk" }> => e.level === "trunk");
}

// ---------------------------------------------------------------------------
// validateTripForFinish
// ---------------------------------------------------------------------------

describe("validateTripForFinish", () => {
  it("a fully valid graph has no required or optional errors", () => {
    const validation = validateTripForFinish(validGraph());
    expect(validation.requiredErrors).toEqual([]);
    expect(validation.optionalErrors).toEqual([]);
    expect(hasBlockingErrors(validation)).toBe(false);
  });

  it("blocks a trip with zero sites (Trip.cs:56 Size(1,100))", () => {
    const validation = validateTripForFinish(validGraph({ sites: [] }));
    expect(validation.requiredErrors).toContainEqual({
      level: "trip-sites",
      message: "You must add site visits to your trip.",
    });
    expect(hasBlockingErrors(validation)).toBe(true);
  });

  it("blocks a site with zero trees (Site.cs:110 Size2(1,MaxValue))", () => {
    const site = validSite(1, []);
    const validation = validateTripForFinish(validGraph({ sites: [site] }));
    expect(validation.requiredErrors).toContainEqual({
      level: "site-trees",
      siteId: 1,
      siteName: "North Grove",
      message: "You must add tree measurements to this site.",
    });
    expect(hasBlockingErrors(validation)).toBe(true);
  });

  it("bubbles trip-level field errors with the field name", () => {
    const validation = validateTripForFinish(validGraph({ trip: baseTripStepInput({ name: "" }) }));
    const err = validation.requiredErrors.find((e) => e.level === "trip");
    expect(err).toMatchObject({ level: "trip", field: "name", message: "Trip name must be specified." });
    expect(hasBlockingErrors(validation)).toBe(true);
  });

  it("bubbles site-level field errors with site id/name context", () => {
    const site: FinishSiteInput = { ...validSite(), step: baseSiteStepInput({ name: "" }) };
    const validation = validateTripForFinish(validGraph({ sites: [site] }));
    const err = validation.requiredErrors.find((e) => e.level === "site");
    expect(err).toMatchObject({
      level: "site",
      siteId: site.id,
      siteName: "North Grove",
      field: "name",
      message: "Site name must be specified.",
    });
  });

  it("bubbles tree-level required errors with site/tree context", () => {
    const tree = validTree(7, { commonName: "" });
    const validation = validateTripForFinish(validGraph({ sites: [validSite(1, [tree])] }));
    const err = validation.requiredErrors.find((e) => e.level === "tree");
    expect(err).toMatchObject({
      level: "tree",
      siteId: 1,
      siteName: "North Grove",
      treeId: 7,
      treeLabel: "Quercus alba",
      field: "commonName",
      message: "Common name must be specified.",
    });
  });

  it("multi-trunk tree-level errors bubble too (e.g. FormType must not be Single)", () => {
    const tree = validTree(2, { treeType: ImportTreeType.MultiTrunk, formType: TreeFormType.Single });
    const validation = validateTripForFinish(validGraph({ sites: [validSite(1, [tree])] }));
    const err = validation.requiredErrors.find((e) => e.level === "tree" && e.field === "formType");
    expect(err).toMatchObject({ level: "tree", field: "formType", message: "Form type must not be single." });
  });

  it("trunk-level errors bubble with site/tree/trunk context, only for multi-trunk trees", () => {
    const tree: FinishTreeInput = {
      id: 2,
      label: "Quercus alba",
      step: baseTreeStepInput({
        treeType: ImportTreeType.MultiTrunk,
        formType: TreeFormType.Multi,
        combinedGirthNumberOfTrunks: "2",
      }),
      trunks: [
        { id: 10, step: { girth: "10'", girthMeasurementHeight: "4.5'", height: "60'", trunkComments: "" } },
        { id: 11, step: { girth: "", girthMeasurementHeight: "", height: "", trunkComments: "" } },
      ],
    };
    const validation = validateTripForFinish(validGraph({ sites: [validSite(1, [tree])] }));
    const trunkErrors = trunkErrorsOf(validation.requiredErrors);
    expect(trunkErrors).toHaveLength(2);
    for (const e of trunkErrors) {
      expect(e.trunkId).toBe(11);
      expect(e.treeId).toBe(2);
      expect(e.siteId).toBe(1);
      expect(e.message).toBe("You must specify a height or girth.");
    }
    expect(trunkErrors.map((e) => e.field).sort()).toEqual(["girth", "height"]);
  });

  it("single-trunk trees never produce trunk-level errors even with malformed trunk rows attached", () => {
    // Defensive: a single-trunk tree's `trunks` array should always be
    // empty in practice (single-trunk trees carry no Trunks collection at
    // all, db/queries/import-trees.sql.ts's `updateTree` deletes them on
    // switch-to-single-trunk) -- but the validator itself should not
    // iterate trunks for a non-multi-trunk tree regardless.
    const tree: FinishTreeInput = {
      id: 3,
      label: "Quercus alba",
      step: baseTreeStepInput({ treeType: ImportTreeType.SingleTrunk }),
      trunks: [{ id: 99, step: { girth: "", girthMeasurementHeight: "", height: "", trunkComments: "" } }],
    };
    const validation = validateTripForFinish(validGraph({ sites: [validSite(1, [tree])] }));
    expect(trunkErrorsOf(validation.requiredErrors)).toEqual([]);
  });

  it("site Optional-tag coordinate-bounds warning is non-blocking", () => {
    const site: FinishSiteInput = {
      ...validSite(),
      step: baseSiteStepInput({ coordinates: "10, 10" }), // far outside the bounds below
      stateBounds: { neLatitude: 42, neLongitude: -80, swLatitude: 38, swLongitude: -85 },
    };
    const validation = validateTripForFinish(validGraph({ sites: [site] }));
    expect(validation.requiredErrors).toEqual([]);
    const warning = validation.optionalErrors.find((e) => e.level === "site");
    expect(warning).toMatchObject({ level: "site", field: "coordinates" });
    expect(warning!.message).toMatch(/^\(Optional\)/);
    expect(hasBlockingErrors(validation)).toBe(false);
  });

  it("tree Optional-tag site-distance warning is non-blocking", () => {
    const site: FinishSiteInput = {
      ...validSite(),
      step: baseSiteStepInput({ coordinates: "40, -83" }),
      trees: [validTree(1, { coordinates: "41, -84" })], // > 1 arc-minute away
    };
    const validation = validateTripForFinish(validGraph({ sites: [site] }));
    expect(validation.requiredErrors).toEqual([]);
    const warning = validation.optionalErrors.find((e) => e.level === "tree");
    expect(warning).toMatchObject({ level: "tree", field: "coordinates" });
    expect(warning!.message).toMatch(/^\(Optional\)/);
    expect(hasBlockingErrors(validation)).toBe(false);
  });

  it("does not evaluate the Optional tier for a site whose Required tier already failed", () => {
    // stateBounds is present but the site's own Required-tag pass fails
    // (blank name) -- validateSiteOptional must not run in that case
    // (mirrors buildSiteStep's own two-phase gate).
    const site: FinishSiteInput = {
      ...validSite(),
      step: baseSiteStepInput({ name: "", coordinates: "10, 10" }),
      stateBounds: { neLatitude: 42, neLongitude: -80, swLatitude: 38, swLongitude: -85 },
    };
    const validation = validateTripForFinish(validGraph({ sites: [site] }));
    expect(validation.optionalErrors.some((e) => e.level === "site")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// describeFinishError
// ---------------------------------------------------------------------------

describe("describeFinishError", () => {
  it("formats every error level with its locating context", () => {
    expect(describeFinishError({ level: "trip", field: "name", message: "Trip name must be specified." })).toBe(
      "Trip name must be specified.",
    );
    expect(describeFinishError({ level: "trip-sites", message: "You must add site visits to your trip." })).toBe(
      "You must add site visits to your trip.",
    );
    expect(
      describeFinishError({ level: "site", siteId: 1, siteName: "North Grove", field: "name", message: "Site name must be specified." }),
    ).toBe("North Grove: Site name must be specified.");
    expect(
      describeFinishError({
        level: "tree",
        siteId: 1,
        siteName: "North Grove",
        treeId: 2,
        treeLabel: "Quercus alba",
        field: "commonName",
        message: "Common name must be specified.",
      }),
    ).toBe("North Grove - Quercus alba: Common name must be specified.");
    expect(
      describeFinishError({
        level: "trunk",
        siteId: 1,
        siteName: "North Grove",
        treeId: 2,
        treeLabel: "Quercus alba",
        trunkId: 5,
        field: "girth",
        message: "You must specify a height or girth.",
      }),
    ).toBe("North Grove - Quercus alba (trunk): You must specify a height or girth.");
  });
});

// ---------------------------------------------------------------------------
// Persisted-row -> step-input round trips
// ---------------------------------------------------------------------------

describe("tripDraftToStepInput", () => {
  it("round-trips measurers through toFormalName", () => {
    const input = tripDraftToStepInput({
      name: "Trip",
      date: "2020-01-01",
      measurerContactInfo: "555",
      makeMeasurerContactInfoPublic: true,
      website: "",
      measurers: [
        { firstName: "Alice", lastName: "Anderson" },
        { firstName: "Bob", lastName: "Brown" },
      ],
    });
    expect(input.firstMeasurer).toBe("Anderson, Alice");
    expect(input.secondMeasurer).toBe("Brown, Bob");
    expect(input.thirdMeasurer).toBe("");
  });

  it("a null date becomes the blank-input-field sentinel", () => {
    const input = tripDraftToStepInput({
      name: "",
      date: null,
      measurerContactInfo: "",
      makeMeasurerContactInfoPublic: false,
      website: "",
      measurers: [],
    });
    expect(input.date).toBe("");
  });
});

describe("treeRecordToStepInput", () => {
  it("round-trips specified distance/elevation/coordinate fields to editable text", () => {
    const step = treeRecordToStepInput({
      type: ImportTreeType.SingleTrunk,
      commonName: "White Oak",
      scientificName: "Quercus alba",
      status: TreeStatus.NotSpecified,
      ageClass: TreeAgeClass.NotSpecified,
      ageType: TreeAgeType.NotSpecified,
      age: 42,
      height: 80,
      heightInputFormat: DistanceFormat.Default,
      heightMeasurementMethod: TreeHeightMeasurementMethod.NotSpecified,
      girth: 200,
      girthInputFormat: DistanceFormat.Default,
      combinedGirthNumberOfTrunks: null,
      crownSpread: 60,
      crownSpreadInputFormat: DistanceFormat.Default,
      elevation: 500,
      elevationInputFormat: ElevationFormat.Default,
      terrainType: TreeTerrainType.NotSpecified,
      formType: TreeFormType.Single,
      latitude: 40,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      generalComments: "",
    });
    expect(step.age).toBe("42");
    expect(step.height).toBe("80'");
    expect(step.girth).toBe("200'");
    expect(step.crownSpread).toBe("60'");
    expect(step.elevation).toBe("500 ft");
    expect(step.coordinates).toBe("40, -83");
  });

  it("unspecified fields round-trip to blank text, not a fabricated zero", () => {
    const step = treeRecordToStepInput({
      type: ImportTreeType.SingleTrunk,
      commonName: "",
      scientificName: "",
      status: TreeStatus.NotSpecified,
      ageClass: TreeAgeClass.NotSpecified,
      ageType: TreeAgeType.NotSpecified,
      age: null,
      height: 0,
      heightInputFormat: DistanceFormat.Unspecified,
      heightMeasurementMethod: TreeHeightMeasurementMethod.NotSpecified,
      girth: 0,
      girthInputFormat: DistanceFormat.Unspecified,
      combinedGirthNumberOfTrunks: null,
      crownSpread: 0,
      crownSpreadInputFormat: DistanceFormat.Unspecified,
      elevation: 0,
      elevationInputFormat: ElevationFormat.Unspecified,
      terrainType: TreeTerrainType.NotSpecified,
      formType: TreeFormType.Single,
      latitude: 0,
      latitudeInputFormat: CoordinatesFormat.Unspecified,
      longitude: 0,
      longitudeInputFormat: CoordinatesFormat.Unspecified,
      generalComments: "",
    });
    expect(step.age).toBe("");
    expect(step.height).toBe("");
    expect(step.girth).toBe("");
    expect(step.crownSpread).toBe("");
    expect(step.elevation).toBe("");
    expect(step.coordinates).toBe("");
  });
});

describe("trunkRecordToStepInput", () => {
  it("round-trips a specified trunk's fields to editable text", () => {
    const step: TrunkInput = trunkRecordToStepInput({
      girth: 10,
      girthInputFormat: DistanceFormat.Default,
      girthMeasurementHeight: 4.5,
      girthMeasurementHeightInputFormat: DistanceFormat.Default,
      height: 60,
      heightInputFormat: DistanceFormat.Default,
      trunkComments: "leans north",
    });
    expect(step.girth).toBe("10'");
    expect(step.girthMeasurementHeight).toBe("4.5'");
    expect(step.height).toBe("60'");
    expect(step.trunkComments).toBe("leans north");
  });
});

// ---------------------------------------------------------------------------
// Integration: validateTripForFinish + finishTrip + reimportTrip against a
// real (PGlite) schema, assembling the graph the exact way
// app/import/[tripId]/review/load-graph.ts does -- reusing the SAME
// production query functions (db/queries/import-drafts.sql.ts /
// import-trees.sql.ts, each accepting an injectable `sql`) rather than
// re-implementing that assembly here, so this test also catches any
// field-shape mismatch between this module's round-trip helpers and what
// those queries actually return (a purely hand-built-fixture unit test
// above couldn't catch that class of bug). Complements lib/merge/
// engine.test.ts / reimport.test.ts (which this test's assertions
// deliberately mirror -- "assert via the engine's own patterns", doc 05
// §P3-06) by proving the WIZARD's own read path produces a graph the
// engine accepts end-to-end, not just that the engine works in isolation.
// ---------------------------------------------------------------------------

async function insertImportTrip(
  db: PGlite,
  overrides: Partial<{ name: string; date: string; website: string }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_trips (creator_user_id, name, date, website, photos_available, measurer_contact_info, make_measurer_contact_info_public)
     values (null, $1, $2, $3, false, '555-1234', false) returning id`,
    [overrides.name ?? "Integration Trip", overrides.date ?? "2021-05-01", overrides.website ?? ""],
  );
  return r.rows[0]!.id;
}

async function insertImportTripMeasurer(db: PGlite, tripId: number, firstName: string, lastName: string): Promise<void> {
  await db.query(`insert into import_trip_measurers (trip_id, first_name, last_name) values ($1, $2, $3)`, [
    tripId,
    firstName,
    lastName,
  ]);
}

async function insertImportSite(
  db: PGlite,
  tripId: number,
  stateId: number,
  overrides: Partial<{ name: string; county: string; latitude: number; longitude: number }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_sites (
       creator_user_id, trip_id, name, state_id, county, ownership_type, ownership_contact_info,
       make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
     ) values (null, $1, $2, $3, $4, 'Public', '', false, $5, $6, $7, $6, '')
     returning id`,
    [
      tripId,
      overrides.name ?? "Integration Park",
      stateId,
      overrides.county ?? "Franklin",
      overrides.latitude ?? 40,
      CoordinatesFormat.DecimalDegrees,
      overrides.longitude ?? -83,
    ],
  );
  return r.rows[0]!.id;
}

async function insertImportTree(
  db: PGlite,
  siteId: number,
  overrides: Partial<{ commonName: string; scientificName: string; height: number; girth: number; crownSpread: number }> = {},
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
       0, 1, 0, 1, false,
       0, 1,
       $4, 2, 0,
       0, 1,
       0, 1,
       0, 1,
       0, 1,
       0, 1,
       '', '', '', '',
       $5, 2, 0, 1,
       0, 1, '',
       $6, 2, 0, 1,
       '', 0, 1,
       0, 1, '', '',
       0, 1, '', '',
       1, 1, '',
       0, null, null, '', null
     ) returning id`,
    [
      siteId,
      overrides.commonName ?? "White Oak",
      overrides.scientificName ?? "Quercus alba",
      overrides.height ?? 80,
      overrides.girth ?? 200,
      overrides.crownSpread ?? 60,
    ],
  );
  return r.rows[0]!.id;
}

async function loadGraph(tripId: number, sql: SqlTag): Promise<FinishGraphInput> {
  const trip = await getTrip(tripId, sql);
  if (!trip) throw new Error(`trip ${tripId} not found`);
  const [sites, states, treesBySite] = await Promise.all([
    listImportSites(tripId, sql),
    listStates(sql),
    listAllSiteTreesForTrip(tripId, sql),
  ]);
  const siteInputs: FinishSiteInput[] = [];
  for (const site of sites) {
    const trees = treesBySite[site.id] ?? [];
    const treeInputs: FinishTreeInput[] = [];
    for (const tree of trees) {
      const trunks = tree.type === ImportTreeType.MultiTrunk ? await listTrunksByTree(tree.id, sql) : [];
      treeInputs.push({
        id: tree.id,
        label: tree.scientificName.trim() !== "" ? tree.scientificName : "(Unidentified)",
        step: treeRecordToStepInput(tree),
        trunks: trunks.map((t) => ({ id: t.id, step: trunkRecordToStepInput(t) })),
      });
    }
    siteInputs.push({
      id: site.id,
      name: site.name || "(unnamed site)",
      step: siteToStepInput(site),
      stateBounds: states.find((s) => s.id === site.stateId) ?? null,
      trees: treeInputs,
    });
  }
  return { trip: tripDraftToStepInput(trip), sites: siteInputs };
}

describe("finish-time integration (real PGlite schema)", () => {
  // Single shared PGlite instance for the whole describe block -- matches
  // every existing PGlite-backed suite's own rationale (engine.test.ts's
  // header: repeated boot of separate WASM instances per-test was observed
  // to intermittently crash, unrelated to any of these suites' own logic).
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("a minimal valid trip (1 site, 1 single-trunk tree) passes validateTripForFinish, finishes end-to-end, then reimports idempotently", async () => {
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    const tripId = await insertImportTrip(db);
    await insertImportTripMeasurer(db, tripId, "Carol", "Carpenter");
    const importSiteId = await insertImportSite(db, tripId, stateId);
    await insertImportTree(db, importSiteId);

    // Review page's own read path: assemble the graph, then validate --
    // must be clean (no required errors) for a minimal-but-complete trip.
    const graphBeforeFinish = await loadGraph(tripId, sql);
    const validationBeforeFinish = validateTripForFinish(graphBeforeFinish);
    expect(validationBeforeFinish.requiredErrors).toEqual([]);
    expect(hasBlockingErrors(validationBeforeFinish)).toBe(false);

    const finishResult = await finishTrip(tripId, sql);
    expect(finishResult).toEqual({
      sitesInserted: 1,
      sitesMerged: 0,
      treesInserted: 1,
      treesMerged: 0,
      measurementsInserted: 1,
    });

    const [site] = await sql<{ id: number; name: string }>`
      select id, name from sites where state_id = ${stateId}
    `;
    expect(site!.name).toBe("Integration Park");

    const [tree] = await sql<{ id: number; common_name: string }>`
      select id, common_name from trees where site_id = ${site!.id}
    `;
    expect(tree!.common_name).toBe("White Oak");

    const [measurement] = await sql<{ importing_trip_id: number | null }>`
      select importing_trip_id from tree_measurements where tree_id = ${tree!.id}
    `;
    expect(measurement!.importing_trip_id).toBe(tripId);

    const [visit] = await sql<{ importing_trip_id: number | null }>`
      select importing_trip_id from site_visits where site_id = ${site!.id}
    `;
    expect(visit!.importing_trip_id).toBe(tripId);

    const [tripRowAfterFinish] = await sql<{ imported: Date | null }>`
      select imported from import_trips where id = ${tripId}
    `;
    expect(tripRowAfterFinish!.imported).not.toBeNull();

    // Review page would now offer Reimport (`trip.isImported`) --
    // `getTrip` (the same read `loadGraph`/the actual Review page use)
    // reflects the stamped `imported` column.
    const tripDraftAfterFinish = await getTrip(tripId, sql);
    expect(tripDraftAfterFinish!.isImported).toBe(true);

    // Re-assemble + re-validate the (now-imported) graph -- still clean --
    // then reimport. This trip is the sole trip that ever touched this
    // site/tree, so the delete-then-reimport orphan cleanup (reimport.ts)
    // fully deletes and freshly recreates both (matching reimport.test.ts's
    // own "idempotence" test's expected result), not a merge.
    const graphBeforeReimport = await loadGraph(tripId, sql);
    const validationBeforeReimport = validateTripForFinish(graphBeforeReimport);
    expect(validationBeforeReimport.requiredErrors).toEqual([]);

    const reimportResult = await reimportTrip(tripId, sql);
    expect(reimportResult).toEqual({
      sitesInserted: 1,
      sitesMerged: 0,
      treesInserted: 1,
      treesMerged: 0,
      measurementsInserted: 1,
    });

    // Idempotent: still exactly one site and one tree at this state, with
    // the same content as before the reimport.
    const sitesAfter = await sql<{ id: number; name: string; county: string }>`
      select id, name, county from sites where state_id = ${stateId}
    `;
    expect(sitesAfter).toHaveLength(1);
    expect(sitesAfter[0]!.name).toBe("Integration Park");

    const treesAfter = await sql<{ id: number; common_name: string; height: number; girth: number }>`
      select id, common_name, height, girth from trees where site_id = ${sitesAfter[0]!.id}
    `;
    expect(treesAfter).toHaveLength(1);
    expect(treesAfter[0]!.common_name).toBe("White Oak");
    expect(treesAfter[0]!.height).toBeCloseTo(80, 3);
    expect(treesAfter[0]!.girth).toBeCloseTo(200, 3);

    const measurementsAfter = await sql<{ id: number }>`
      select id from tree_measurements where tree_id = ${treesAfter[0]!.id}
    `;
    expect(measurementsAfter).toHaveLength(1);
  });
});
