/**
 * Import-wizard Trees-step data layer -- task P3-05 (doc 05 §P3-05, doc 01
 * §2 `import_trees`/`import_trunks` columns, doc 01 §10). Owns
 * `import_trees` + `import_trunks` CRUD exclusively; does NOT modify
 * db/queries/import-drafts.sql.ts (Trip step's file, owned by a parallel
 * task) but DOES import `assertTripEditable` from it for the same
 * role+creator authorization every wizard step enforces (doc 01 §1).
 *
 * Every mutating function additionally scopes its WHERE clause through the
 * `import_trees.site_id -> import_sites.id -> import_sites.trip_id` chain
 * for the CALLER-SUPPLIED `tripId` -- defense in depth against a forged
 * `treeId`/`trunkId` hidden form field pointing at a different trip's row
 * (the caller has already run `assertTripEditable(tripId, ...)`, but that
 * only proves the caller owns `tripId`, not that a posted id belongs to it;
 * legacy's equivalent, `trip.FindTreeById(treeId)`, gets this for free by
 * only ever searching the already-loaded, already-authorized trip's own
 * object graph -- `Trip.cs:126-130`/`Site.cs:131-132`).
 *
 * Every mutation stamps `import_trips.last_saved` (`ImportRepository.Save`,
 * `TMD.Model/Imports/ImportRepository.cs:11-15` -- called from every wizard
 * mutation, not just Trees'), via a plain UPDATE joined through the site --
 * this file doesn't import `saveTripStep`/`updateTripStep` (those touch
 * `import_trips`' OWN scalar fields, a different concern) but writing
 * `last_saved` directly here is the same non-exclusive "every step stamps
 * this column" pattern import-drafts.sql.ts's header describes.
 *
 * Site enumeration (for grouping trees by site on the Trees page, matching
 * `TMD/Views/Import/Trees.cshtml`'s `for (site in Model.Sites)` loop) reuses
 * `listImportSites`/`ImportSite` from db/queries/import-drafts.sql.ts (the
 * Sites step's file, P3-04) rather than duplicating that read here -- an
 * ordinary cross-module import, not a modification of that file.
 *
 * See lib/import-trees.ts's header for the full single-vs-multi-trunk /
 * reachable-legacy-UI-vs-domain-model finding this file's design follows.
 */
import type { SqlTag } from "./sql-tag";
import { defaultSql, withTransaction } from "./sql-tag";
import { CoordinatesFormat } from "../../lib/units/parse-coordinates";
import { DistanceFormat, ElevationFormat } from "../../lib/units/parse";
import { ImportTreeType, TreeAgeClass, TreeAgeType, TreeFormType, TreeHeightMeasurementMethod, TreeStatus, TreeTerrainType } from "../../lib/import-trees";

export class TreeAccessError extends Error {
  constructor(message = "Tree not found in this trip.") {
    super(message);
    this.name = "TreeAccessError";
  }
}

async function stampLastSaved(tripId: number, now: Date, sql: SqlTag): Promise<void> {
  await sql`update import_trips set last_saved = ${now} where id = ${tripId}`;
}

async function getTripDefaults(
  tripId: number,
  sql: SqlTag,
): Promise<{ heightMeasurementMethod: number; laserBrand: string; clinometerBrand: string }> {
  const rows = await sql<{
    default_height_measurement_method: number;
    default_laser_brand: string | null;
    default_clinometer_brand: string | null;
  }>`
    select default_height_measurement_method, default_laser_brand, default_clinometer_brand
    from import_trips where id = ${tripId}
  `;
  const row = rows[0];
  return {
    heightMeasurementMethod: row?.default_height_measurement_method ?? 0,
    laserBrand: row?.default_laser_brand ?? "",
    clinometerBrand: row?.default_clinometer_brand ?? "",
  };
}

// ---------------------------------------------------------------------------
// Tree row shape
// ---------------------------------------------------------------------------

export interface TreeRecord {
  id: number;
  siteId: number;
  type: ImportTreeType;
  commonName: string;
  scientificName: string;
  status: TreeStatus;
  ageClass: TreeAgeClass;
  ageType: TreeAgeType;
  age: number | null;
  height: number;
  heightInputFormat: DistanceFormat;
  heightMeasurementMethod: TreeHeightMeasurementMethod;
  girth: number;
  girthInputFormat: DistanceFormat;
  combinedGirthNumberOfTrunks: number | null;
  crownSpread: number;
  crownSpreadInputFormat: DistanceFormat;
  elevation: number;
  elevationInputFormat: ElevationFormat;
  terrainType: TreeTerrainType;
  formType: TreeFormType;
  numberOfTrunks: number | null;
  latitude: number;
  latitudeInputFormat: CoordinatesFormat;
  longitude: number;
  longitudeInputFormat: CoordinatesFormat;
  generalComments: string;
}

export interface TrunkRecord {
  id: number;
  treeId: number;
  girth: number;
  girthInputFormat: DistanceFormat;
  girthMeasurementHeight: number;
  girthMeasurementHeightInputFormat: DistanceFormat;
  height: number;
  heightInputFormat: DistanceFormat;
  trunkComments: string;
}

interface RawTreeRow {
  id: number;
  site_id: number;
  type: number;
  common_name: string;
  scientific_name: string;
  status: number;
  age_class: number;
  age_type: number;
  age: number | null;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  combined_girth_number_of_trunks: number | null;
  crown_spread: number;
  crown_spread_input_format: number;
  elevation: number;
  elevation_input_format: number;
  terrain_type: number;
  form_type: number;
  number_of_trunks: number | null;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  general_comments: string;
}

function mapTreeRow(r: RawTreeRow): TreeRecord {
  return {
    id: r.id,
    siteId: r.site_id,
    type: r.type,
    commonName: r.common_name,
    scientificName: r.scientific_name,
    status: r.status,
    ageClass: r.age_class,
    ageType: r.age_type,
    age: r.age,
    height: r.height,
    heightInputFormat: r.height_input_format,
    heightMeasurementMethod: r.height_measurement_method,
    girth: r.girth,
    girthInputFormat: r.girth_input_format,
    combinedGirthNumberOfTrunks: r.combined_girth_number_of_trunks,
    crownSpread: r.crown_spread,
    crownSpreadInputFormat: r.crown_spread_input_format,
    elevation: r.elevation,
    elevationInputFormat: r.elevation_input_format,
    terrainType: r.terrain_type,
    formType: r.form_type,
    numberOfTrunks: r.number_of_trunks,
    latitude: r.latitude,
    latitudeInputFormat: r.latitude_input_format,
    longitude: r.longitude,
    longitudeInputFormat: r.longitude_input_format,
    generalComments: r.general_comments,
  };
}

function mapTrunkRow(r: {
  id: number;
  tree_id: number;
  girth: number;
  girth_input_format: number;
  girth_measurement_height: number;
  girth_measurement_height_input_format: number;
  height: number;
  height_input_format: number;
  trunk_comments: string;
}): TrunkRecord {
  return {
    id: r.id,
    treeId: r.tree_id,
    girth: r.girth,
    girthInputFormat: r.girth_input_format,
    girthMeasurementHeight: r.girth_measurement_height,
    girthMeasurementHeightInputFormat: r.girth_measurement_height_input_format,
    height: r.height,
    heightInputFormat: r.height_input_format,
    trunkComments: r.trunk_comments,
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listTreesBySite(siteId: number, sql: SqlTag = defaultSql()): Promise<TreeRecord[]> {
  const rows = await sql<RawTreeRow>`
    select id, site_id, type, common_name, scientific_name, status, age_class, age_type, age,
           height, height_input_format, height_measurement_method,
           girth, girth_input_format, combined_girth_number_of_trunks,
           crown_spread, crown_spread_input_format,
           elevation, elevation_input_format,
           terrain_type, form_type, number_of_trunks,
           latitude, latitude_input_format, longitude, longitude_input_format,
           general_comments
    from import_trees
    where site_id = ${siteId}
    order by id asc
  `;
  return rows.map(mapTreeRow);
}

export async function listTrunksByTree(treeId: number, sql: SqlTag = defaultSql()): Promise<TrunkRecord[]> {
  const rows = await sql<{
    id: number;
    tree_id: number;
    girth: number;
    girth_input_format: number;
    girth_measurement_height: number;
    girth_measurement_height_input_format: number;
    height: number;
    height_input_format: number;
    trunk_comments: string;
  }>`
    select id, tree_id, girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
           height, height_input_format, trunk_comments
    from import_trunks
    where tree_id = ${treeId}
    order by id asc
  `;
  return rows.map(mapTrunkRow);
}

/** Scoped read: returns null if the tree doesn't exist or doesn't belong to `tripId`. */
export async function getTree(tripId: number, treeId: number, sql: SqlTag = defaultSql()): Promise<TreeRecord | null> {
  const rows = await sql<RawTreeRow>`
    select t.id, t.site_id, t.type, t.common_name, t.scientific_name, t.status, t.age_class, t.age_type, t.age,
           t.height, t.height_input_format, t.height_measurement_method,
           t.girth, t.girth_input_format, t.combined_girth_number_of_trunks,
           t.crown_spread, t.crown_spread_input_format,
           t.elevation, t.elevation_input_format,
           t.terrain_type, t.form_type, t.number_of_trunks,
           t.latitude, t.latitude_input_format, t.longitude, t.longitude_input_format,
           t.general_comments
    from import_trees t
    join import_sites s on s.id = t.site_id
    where t.id = ${treeId} and s.trip_id = ${tripId}
  `;
  const row = rows[0];
  return row ? mapTreeRow(row) : null;
}

export async function listAllSiteTreesForTrip(
  tripId: number,
  sql: SqlTag = defaultSql(),
): Promise<Record<number, TreeRecord[]>> {
  const rows = await sql<RawTreeRow>`
    select t.id, t.site_id, t.type, t.common_name, t.scientific_name, t.status, t.age_class, t.age_type, t.age,
           t.height, t.height_input_format, t.height_measurement_method,
           t.girth, t.girth_input_format, t.combined_girth_number_of_trunks,
           t.crown_spread, t.crown_spread_input_format,
           t.elevation, t.elevation_input_format,
           t.terrain_type, t.form_type, t.number_of_trunks,
           t.latitude, t.latitude_input_format, t.longitude, t.longitude_input_format,
           t.general_comments
    from import_trees t
    join import_sites s on s.id = t.site_id
    where s.trip_id = ${tripId}
    order by t.site_id asc, t.id asc
  `;
  const bySite: Record<number, TreeRecord[]> = {};
  for (const r of rows) {
    const tree = mapTreeRow(r);
    (bySite[tree.siteId] ??= []).push(tree);
  }
  return bySite;
}

// ---------------------------------------------------------------------------
// Tree creation -- `Site.AddSingleTrunkTree` / `SingleTrunkTree.Create`
// (Site.cs:114-119, SingleTrunkTree.cs:25-71). ALWAYS single-trunk -- see
// lib/import-trees.ts header ("AddTree always calls AddSingleTrunkTree").
// ---------------------------------------------------------------------------

export async function createSingleTrunkTree(
  tripId: number,
  siteId: number,
  userId: number | null,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const owned = await sql<{ id: number }>`select id from import_sites where id = ${siteId} and trip_id = ${tripId}`;
  if (!owned[0]) throw new TreeAccessError("Site not found in this trip.");

  const defaults = await getTripDefaults(tripId, sql);
  const rows = await sql<{ id: number }>`
    insert into import_trees (
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
      terrain_type, terrain_shape_index, landform_index, terrain_comments,
      combined_girth_number_of_trunks
    ) values (
      ${userId}, ${siteId}, ${ImportTreeType.SingleTrunk}, '', null, '', '',
      ${TreeStatus.NotSpecified}, '', ${TreeAgeClass.NotSpecified}, ${TreeAgeType.NotSpecified}, null, '',
      0, ${CoordinatesFormat.Unspecified}, 0, ${CoordinatesFormat.Unspecified}, true,
      0, ${ElevationFormat.Unspecified},
      0, ${DistanceFormat.Unspecified}, ${defaults.heightMeasurementMethod},
      0, ${DistanceFormat.Unspecified},
      0, 1,
      0, ${DistanceFormat.Unspecified},
      0, 1,
      0, ${DistanceFormat.Unspecified},
      '', ${defaults.laserBrand}, ${defaults.clinometerBrand}, '',
      0, ${DistanceFormat.Unspecified}, 0, ${DistanceFormat.Unspecified},
      0, ${DistanceFormat.Unspecified}, '',
      0, ${DistanceFormat.Unspecified}, 0, ${DistanceFormat.Unspecified},
      '', 0, ${DistanceFormat.Unspecified},
      0, 2, '', '',
      0, 2, '', '',
      ${TreeFormType.Single}, 1, '',
      ${TreeTerrainType.NotSpecified}, null, null, '',
      null
    )
    returning id
  `;
  await stampLastSaved(tripId, now, sql);
  return rows[0]!.id;
}

/** `Trip.InitializeTrees` (Trip.cs:108-114): every site with zero trees gets
 * one blank single-trunk tree, unconditionally, on both the GET render and
 * every POST inner action (`ImportController.cs:229,342`). */
export async function initializeTreesForTrip(tripId: number, now: Date, sql: SqlTag = defaultSql()): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const emptySites = await trx<{ id: number }>`
      select s.id from import_sites s
      left join import_trees t on t.site_id = s.id
      where s.trip_id = ${tripId} and t.id is null
    `;
    for (const site of emptySites) {
      await createSingleTrunkTree(tripId, site.id, null, now, trx);
    }
  });
}

// ---------------------------------------------------------------------------
// Tree update -- `SaveTree` (ImportController.cs:236-264), field set per
// lib/import-trees.ts's `NormalizedTreeStep`. Switching `treeType` to
// SingleTrunk deletes any existing trunk rows (SingleTrunkTree carries no
// `Trunks` collection at all -- TreeBase/SingleTrunkTree.cs).
// ---------------------------------------------------------------------------

export interface TreeUpdateFields {
  type: ImportTreeType;
  commonName: string;
  scientificName: string;
  status: TreeStatus;
  ageClass: TreeAgeClass;
  ageType: TreeAgeType;
  age: number | null;
  height: number;
  heightInputFormat: DistanceFormat;
  heightMeasurementMethod: TreeHeightMeasurementMethod;
  girth: number;
  girthInputFormat: DistanceFormat;
  combinedGirthNumberOfTrunks: number | null;
  crownSpread: number;
  crownSpreadInputFormat: DistanceFormat;
  elevation: number;
  elevationInputFormat: ElevationFormat;
  terrainType: TreeTerrainType;
  formType: TreeFormType;
  numberOfTrunks: number | null;
  latitude: number;
  latitudeInputFormat: CoordinatesFormat;
  longitude: number;
  longitudeInputFormat: CoordinatesFormat;
  generalComments: string;
}

export async function updateTree(
  tripId: number,
  treeId: number,
  fields: TreeUpdateFields,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const rows = await trx<{ id: number }>`
      update import_trees t set
        type = ${fields.type},
        common_name = ${fields.commonName},
        scientific_name = ${fields.scientificName},
        status = ${fields.status},
        age_class = ${fields.ageClass},
        age_type = ${fields.ageType},
        age = ${fields.age},
        height = ${fields.height},
        height_input_format = ${fields.heightInputFormat},
        height_measurement_method = ${fields.heightMeasurementMethod},
        girth = ${fields.girth},
        girth_input_format = ${fields.girthInputFormat},
        combined_girth_number_of_trunks = ${fields.combinedGirthNumberOfTrunks},
        crown_spread = ${fields.crownSpread},
        crown_spread_input_format = ${fields.crownSpreadInputFormat},
        elevation = ${fields.elevation},
        elevation_input_format = ${fields.elevationInputFormat},
        terrain_type = ${fields.terrainType},
        form_type = ${fields.formType},
        number_of_trunks = ${fields.numberOfTrunks},
        latitude = ${fields.latitude},
        latitude_input_format = ${fields.latitudeInputFormat},
        longitude = ${fields.longitude},
        longitude_input_format = ${fields.longitudeInputFormat},
        general_comments = ${fields.generalComments}
      from import_sites s
      where t.site_id = s.id and s.trip_id = ${tripId} and t.id = ${treeId}
      returning t.id
    `;
    if (!rows[0]) throw new TreeAccessError();

    if (fields.type === ImportTreeType.SingleTrunk) {
      await trx`delete from import_trunks where tree_id = ${treeId}`;
    }

    // `TreeBase.SetTripDefaults` (TreeBase.cs:81-86), called from `SaveTree`
    // (ImportController.cs:258) -- propagates this tree's own
    // HeightMeasurementMethod back onto the trip's default for subsequently
    // created trees. LaserBrand/ClinometerBrand are also copied in legacy but
    // aren't exposed by this step's UI (file header) so they never change
    // from whatever `createSingleTrunkTree` seeded -- a no-op write, skipped.
    await trx`update import_trips set default_height_measurement_method = ${fields.heightMeasurementMethod} where id = ${tripId}`;

    await stampLastSaved(tripId, now, trx);
  });
}

// ---------------------------------------------------------------------------
// Tree removal -- `Site.RemoveTree` (Site.cs:128-129) + cascade cleanup of
// its trunk rows (`Imports.Trunks.TreeId` has no DB-level cascade in the
// legacy DDL -- Tmd.Migrations/Baseline/CreateSchema.sql declares a plain FK
// -- so the app layer must delete children first, same as legacy's ORM
// cascade-delete mapping would).
// ---------------------------------------------------------------------------

export async function removeTree(tripId: number, treeId: number, now: Date, sql: SqlTag = defaultSql()): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const owned = await trx<{ id: number }>`
      select t.id from import_trees t join import_sites s on s.id = t.site_id
      where t.id = ${treeId} and s.trip_id = ${tripId}
    `;
    if (!owned[0]) throw new TreeAccessError();

    await trx`delete from import_trunks where tree_id = ${treeId}`;
    await trx`delete from import_trees where id = ${treeId}`;
    await stampLastSaved(tripId, now, trx);
  });
}

// ---------------------------------------------------------------------------
// Trunks -- `MultiTrunkTree.AddTrunkMeasurement`/`RemoveTrunkMeasurement`
// (MultiTrunkTree.cs:79-89), `Trunk.Create` (Trunk.cs:39-50). Never reachable
// from the real legacy wizard UI (lib/import-trees.ts header) -- this port
// still implements them per this task's explicit brief, using the domain
// model's own defaults/validation.
// ---------------------------------------------------------------------------

export async function addTrunk(
  tripId: number,
  treeId: number,
  userId: number | null,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const owned = await sql<{ id: number; type: number }>`
    select t.id, t.type from import_trees t join import_sites s on s.id = t.site_id
    where t.id = ${treeId} and s.trip_id = ${tripId}
  `;
  const tree = owned[0];
  if (!tree) throw new TreeAccessError();
  if (tree.type !== ImportTreeType.MultiTrunk) {
    throw new TreeAccessError("Trunks can only be added to multi-trunk trees.");
  }

  const rows = await sql<{ id: number }>`
    insert into import_trunks (
      creator_user_id, tree_id,
      girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
      height, height_input_format,
      height_measurements_distance_top, height_measurements_distance_top_input_format,
      height_measurements_angle_top, height_measurements_angle_top_input_format,
      height_measurements_distance_bottom, height_measurements_distance_bottom_input_format,
      height_measurements_angle_bottom, height_measurements_angle_bottom_input_format,
      height_measurements_vertical_offset, height_measurements_vertical_offset_input_format,
      include_height_distance_and_angle_measurements, trunk_comments
    ) values (
      ${userId}, ${treeId},
      0, ${DistanceFormat.Unspecified}, 0, ${DistanceFormat.Unspecified},
      0, ${DistanceFormat.Unspecified},
      0, 1,
      0, 1,
      0, 1,
      0, 1,
      0, ${DistanceFormat.Unspecified},
      false, ''
    )
    returning id
  `;
  await stampLastSaved(tripId, now, sql);
  return rows[0]!.id;
}

export async function removeTrunk(tripId: number, trunkId: number, now: Date, sql: SqlTag = defaultSql()): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const owned = await trx<{ id: number }>`
      select tr.id from import_trunks tr
      join import_trees t on t.id = tr.tree_id
      join import_sites s on s.id = t.site_id
      where tr.id = ${trunkId} and s.trip_id = ${tripId}
    `;
    if (!owned[0]) throw new TreeAccessError("Trunk not found in this trip.");

    await trx`delete from import_trunks where id = ${trunkId}`;
    await stampLastSaved(tripId, now, trx);
  });
}

export interface TrunkUpdateFields {
  girth: number;
  girthInputFormat: DistanceFormat;
  girthMeasurementHeight: number;
  girthMeasurementHeightInputFormat: DistanceFormat;
  height: number;
  heightInputFormat: DistanceFormat;
  trunkComments: string;
}

export async function updateTrunk(
  tripId: number,
  trunkId: number,
  fields: TrunkUpdateFields,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const rows = await trx<{ id: number }>`
      update import_trunks tr set
        girth = ${fields.girth},
        girth_input_format = ${fields.girthInputFormat},
        girth_measurement_height = ${fields.girthMeasurementHeight},
        girth_measurement_height_input_format = ${fields.girthMeasurementHeightInputFormat},
        height = ${fields.height},
        height_input_format = ${fields.heightInputFormat},
        trunk_comments = ${fields.trunkComments}
      from import_trees t, import_sites s
      where tr.tree_id = t.id and t.site_id = s.id and s.trip_id = ${tripId} and tr.id = ${trunkId}
      returning tr.id
    `;
    if (!rows[0]) throw new TreeAccessError("Trunk not found in this trip.");
    await stampLastSaved(tripId, now, trx);
  });
}
