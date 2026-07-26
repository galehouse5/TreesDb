// Transactional merge orchestrator -- doc 01 §10 steps 1-4, wiring together
// the three finished/owned pure modules (graph.ts, predicates.ts,
// headline.ts) against the real schema (db/schema.ts) inside one DB
// transaction per trip.
//
// Legacy sources (read in full before editing):
//   TMD.Infrastructure/Repositories/ImportRepository.cs:36-43 (InternalImport)
//   TMD.Model/Imports/ImportRepository.cs:20-26              (Import: validate,
//     stamp Imported, InternalImport)
//   TMD.Infrastructure/Repositories/SiteRepository.cs:25-49   (Merge,
//     ListByProximity -- first-match-wins over `foreach`)
//   TMD.Model/Sites/Site.cs:123-139                           (Site.Merge --
//     appends all visits, `Trees.SingleOrDefault(t => t.ShouldMerge(tree))`
//     per incoming tree -- SingleOrDefault THROWS on more than one match,
//     unlike the site-level foreach/first-match)
//   TMD.Model/Trees/Tree.cs:102-110                           (Tree.Merge --
//     appends measurements, then RecalculateProperties)
//
// D-015 (candidate order): site candidates are evaluated ordered by
// ascending `id` (see predicates.ts's `candidateBoundingBox` +
// `SITE_COORDINATE_PROXIMITY_MINUTES`) rather than legacy's unspecified
// repository order.
//
// DESIGN CHOICE (flagged in the task report): legacy's `ImportController.
// Finish` action -- not the repository layer -- decides Import vs Reimport
// based on `trip.IsImported` (TMD/Controllers/ImportController.cs:374-388).
// The repository's own `Import()` has NO guard against being called twice
// (it would double-merge every site). Since there is no UI/controller layer
// yet (P3-06), `finishTrip` here adds an explicit guard refusing to run
// against an already-imported trip (throwing, with a pointer to
// `reimportTrip`) rather than silently double-merging OR silently
// delegating across a circular module boundary (`reimportTrip` lives in
// reimport.ts and itself calls back into this file's `runImport`) --
// matching the task brief's explicitly allowed "already-imported -> reimport
// path OR error" alternative. `reimportTrip` (reimport.ts) mirrors
// `Reimport()`'s own guard exactly: throws if the trip has NOT yet been
// imported.
//
// DESIGN CHOICE (flagged): legacy's `RemoveMeasurementsByTrip`/
// `RemoveVisitsByTrip` (the Reimport delete phase, see reimport.ts) never
// call `RecalculateProperties` on a tree/site that merely LOSES a
// measurement/visit but survives (only fully-orphaned trees/sites get
// deleted). A surviving tree/site's headline can therefore be transiently
// stale until the subsequent re-import's own merge touches it again --
// this port reproduces that exactly (bug-compatible), rather than
// "fixing" it by eagerly recomputing every survivor's headline, because
// doing so would diverge from what replay parity (doc 07 §8) is measured
// against.
//
// computed_measured_species_id (both `trees` and `tree_measurements`):
// `lib/species-hash.ts`'s `speciesHash` (the plain, unscoped hash -- NOT
// the site-/state-scoped variants, which back a different legacy concept,
// the `MeasuredSpeciesBySite`/`ByState` aggregate rows).
//
// D-016: new imports normalize `\s+` runs in CommonName/ScientificName to a
// single space (+ trim) before they ever reach `trees`/`tree_measurements`
// (and therefore the hash above), so the wizard can't recreate the
// whitespace-duplicate-species problem the D-016 one-off cleanup fixed for
// historical data. Applied once, right where `import_trees` rows are read
// (`buildImportTreeInput`) -- NOT to the `import_trees` row itself, which
// stays an exact capture of what the wizard recorded (D-016: "import_*
// staging tables are the historical import log and stay exactly as
// captured"). Consequently every merge/headline computation downstream in
// this file already operates on normalized text.

import { markSiteStaleForTree, markStatesStaleForSite, recomputeStaleMetrics } from "../../db/recompute";
import { defaultSql, type SqlTag, withTransaction } from "../../db/queries/sql-tag";
import { speciesHash } from "../species-hash";
import { buildSiteGraph } from "./graph";
import {
  applySiteHeadline,
  applyTreeHeadline,
  type MeasurementForHeadline,
  type VisitForHeadline,
} from "./headline";
import { candidateBoundingBox, shouldMergeSite, shouldMergeTree, type SiteMergeCandidate, type TreeMergeCandidate } from "./predicates";
import {
  type CoordinatesFormatCode,
  type CoordinatesInput,
  type ImportPhotoInput,
  type ImportSiteInput,
  type ImportTreeInput,
  type ImportTripContext,
  type MeasurementGraph,
  type NameInput,
  PhotoReferenceType,
  type SiteGraph,
  type TreeGraph,
  type TripSiteCoordinatesInput,
} from "./types";

function fmt(n: number): CoordinatesFormatCode {
  return n as CoordinatesFormatCode;
}

/**
 * DB drivers (postgres.js in production, PGlite in tests) parse a `date`
 * column into a JS `Date` at UTC midnight, not a plain string. Recover the
 * "YYYY-MM-DD" calendar date via the UTC getters -- local-timezone getters
 * (or `String(date)`/`.toISOString()` after any local-time manipulation)
 * can land on the wrong calendar day in negative-UTC-offset zones, and
 * `String(date)`'s locale format embeds a timezone abbreviation Postgres
 * cannot parse back on a later INSERT/UPDATE (caught by this test suite:
 * a stored "2020-06-15" round-tripped through `String()` became
 * "Sun Jun 14 2020 20:00:00 GMT-0400 (Eastern Daylight Time)", which
 * PGlite's own date parser then rejected).
 */
function toDateOnlyString(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return value;
}

/** D-016: collapse internal whitespace runs (+ trim) -- see file header. */
function normalizeSpeciesText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export interface FinishTripResult {
  sitesInserted: number;
  sitesMerged: number;
  treesInserted: number;
  treesMerged: number;
  measurementsInserted: number;
}

function emptyResult(): FinishTripResult {
  return { sitesInserted: 0, sitesMerged: 0, treesInserted: 0, treesMerged: 0, measurementsInserted: 0 };
}

// ---------------------------------------------------------------------------
// Trip / import_* loaders
// ---------------------------------------------------------------------------

interface TripRow {
  id: number;
  date: string | Date | null;
  website: string;
  imported: string | null;
}

async function loadTripRow(sql: SqlTag, tripId: number): Promise<TripRow> {
  const rows = await sql<TripRow>`
    select id, date, website, imported from import_trips where id = ${tripId}
  `;
  const trip = rows[0];
  if (!trip) throw new Error(`Import trip ${tripId} not found`);
  return trip;
}

async function loadTripMeasurers(sql: SqlTag, tripId: number): Promise<NameInput[]> {
  const rows = await sql<{ first_name: string; last_name: string }>`
    select first_name, last_name from import_trip_measurers where trip_id = ${tripId} order by id asc
  `;
  return rows.map((r) => ({ firstName: r.first_name, lastName: r.last_name }));
}

/** `Trip.AssertIsValid(ValidationTag.Required)` (ImportRepository.cs:22,33): `Trip.Date` is `[NotNull]`. */
async function buildTripContext(sql: SqlTag, trip: TripRow): Promise<ImportTripContext> {
  if (!trip.date) {
    throw new Error(
      `Import trip ${trip.id} has no date set (Trip.Date is Required before Import()/Reimport())`,
    );
  }
  const measurers = await loadTripMeasurers(sql, trip.id);
  return { id: trip.id, date: toDateOnlyString(trip.date), website: trip.website, measurers };
}

interface ImportSiteRow {
  id: number;
  name: string;
  state_id: number | null;
  county: string;
  ownership_type: string;
  ownership_contact_info: string;
  make_ownership_contact_info_public: boolean;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  comments: string;
}

async function loadImportSites(sql: SqlTag, tripId: number): Promise<ImportSiteRow[]> {
  return sql<ImportSiteRow>`
    select id, name, state_id, county, ownership_type, ownership_contact_info,
      make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
    from import_sites where trip_id = ${tripId} order by id asc
  `;
}

interface ImportTreeRow {
  id: number;
  site_id: number;
  common_name: string;
  scientific_name: string;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  elevation: number;
  elevation_input_format: number;
  general_comments: string;
}

async function loadImportTrees(sql: SqlTag, importSiteId: number): Promise<ImportTreeRow[]> {
  return sql<ImportTreeRow>`
    select id, site_id, common_name, scientific_name,
      height, height_input_format, height_measurement_method,
      girth, girth_input_format, crown_spread, crown_spread_input_format,
      latitude, latitude_input_format, longitude, longitude_input_format,
      elevation, elevation_input_format, general_comments
    from import_trees where site_id = ${importSiteId} order by id asc
  `;
}

async function loadImportSitePhotos(sql: SqlTag, importSiteId: number): Promise<ImportPhotoInput[]> {
  const rows = await sql<{ photo_id: number; caption: string | null }>`
    select photo_id, caption from photo_references where type = 2 and import_site_id = ${importSiteId} order by id asc
  `;
  return rows.map((r) => ({ photoId: r.photo_id, caption: r.caption }));
}

async function loadImportTreePhotos(sql: SqlTag, importTreeId: number): Promise<ImportPhotoInput[]> {
  const rows = await sql<{ photo_id: number; caption: string | null }>`
    select photo_id, caption from photo_references where type = 3 and import_tree_id = ${importTreeId} order by id asc
  `;
  return rows.map((r) => ({ photoId: r.photo_id, caption: r.caption }));
}

/** `Imports.Site.State` is `[NotNull]` Required-tagged despite the nullable DB column (schema.ts note 1). */
async function buildImportSiteInput(sql: SqlTag, row: ImportSiteRow): Promise<ImportSiteInput> {
  if (row.state_id == null) {
    throw new Error(`Import site ${row.id} has no state set (Imports.Site.State is Required before Import()/Reimport())`);
  }
  const photos = await loadImportSitePhotos(sql, row.id);
  return {
    id: row.id,
    name: row.name,
    stateId: row.state_id,
    county: row.county,
    ownershipType: row.ownership_type,
    ownershipContactInfo: row.ownership_contact_info,
    makeOwnershipContactInfoPublic: row.make_ownership_contact_info_public,
    coordinates: {
      latitude: row.latitude,
      latitudeInputFormat: fmt(row.latitude_input_format),
      longitude: row.longitude,
      longitudeInputFormat: fmt(row.longitude_input_format),
    },
    comments: row.comments,
    photos,
  };
}

async function buildImportTreeInput(sql: SqlTag, row: ImportTreeRow): Promise<ImportTreeInput> {
  const photos = await loadImportTreePhotos(sql, row.id);
  return {
    id: row.id,
    commonName: normalizeSpeciesText(row.common_name),
    scientificName: normalizeSpeciesText(row.scientific_name),
    height: row.height,
    heightInputFormat: row.height_input_format,
    heightMeasurementMethod: row.height_measurement_method,
    girth: row.girth,
    girthInputFormat: row.girth_input_format,
    crownSpread: row.crown_spread,
    crownSpreadInputFormat: row.crown_spread_input_format,
    coordinates: {
      latitude: row.latitude,
      latitudeInputFormat: fmt(row.latitude_input_format),
      longitude: row.longitude,
      longitudeInputFormat: fmt(row.longitude_input_format),
    },
    elevation: row.elevation,
    elevationInputFormat: row.elevation_input_format,
    generalComments: row.general_comments,
    photos,
  };
}

// ---------------------------------------------------------------------------
// Merge-candidate queries
// ---------------------------------------------------------------------------

interface SiteCandidateRow {
  id: number;
  name: string;
  state_id: number;
  county: string;
  calculated_latitude: number;
  calculated_latitude_input_format: number;
  calculated_longitude: number;
  calculated_longitude_input_format: number;
}

/**
 * `SiteRepository.Merge` (SiteRepository.cs:25-38): candidates ordered by
 * ascending `id` (D-015), first `shouldMergeSite` match wins (a plain
 * `foreach`/`return`, NOT `SingleOrDefault` -- unlike the tree-level match
 * below).
 */
async function findMergeCandidateSiteId(
  sql: SqlTag,
  incoming: SiteMergeCandidate,
): Promise<number | null> {
  const box = candidateBoundingBox(incoming.calculatedCoordinates);
  const rows = await sql<SiteCandidateRow>`
    select id, name, state_id, county, calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format
    from sites
    where calculated_latitude between ${box.minLatitude} and ${box.maxLatitude}
      and calculated_longitude between ${box.minLongitude} and ${box.maxLongitude}
    order by id asc
  `;
  for (const row of rows) {
    const existing: SiteMergeCandidate = {
      name: row.name,
      stateId: row.state_id,
      county: row.county,
      calculatedCoordinates: {
        latitude: row.calculated_latitude,
        latitudeInputFormat: fmt(row.calculated_latitude_input_format),
        longitude: row.calculated_longitude,
        longitudeInputFormat: fmt(row.calculated_longitude_input_format),
      },
    };
    if (shouldMergeSite(existing, incoming)) return row.id;
  }
  return null;
}

interface TreeCandidateRow {
  id: number;
  common_name: string;
  scientific_name: string;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
}

/**
 * `Site.Merge` (Site.cs:132): `Trees.SingleOrDefault(t => t.ShouldMerge(tree))`
 * -- throws if MORE THAN ONE existing tree at the site matches (unlike the
 * site-level first-match-wins search). Ordered by ascending `id` for
 * determinism (no legacy-specified order either way, since exactly zero or
 * one match is expected).
 */
async function findMergeCandidateTreeId(
  sql: SqlTag,
  siteId: number,
  incoming: TreeMergeCandidate,
): Promise<number | null> {
  const rows = await sql<TreeCandidateRow>`
    select id, common_name, scientific_name, latitude, latitude_input_format, longitude, longitude_input_format
    from trees where site_id = ${siteId} order by id asc
  `;
  const matches: number[] = [];
  for (const row of rows) {
    const existing: TreeMergeCandidate = {
      commonName: row.common_name,
      scientificName: row.scientific_name,
      coordinates: {
        latitude: row.latitude,
        latitudeInputFormat: fmt(row.latitude_input_format),
        longitude: row.longitude,
        longitudeInputFormat: fmt(row.longitude_input_format),
      },
    };
    if (shouldMergeTree(existing, incoming)) matches.push(row.id);
  }
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous tree merge at site ${siteId}: ${matches.length} existing trees match (Tree.ShouldMerge, Tree.cs:112-123) -- legacy's Trees.SingleOrDefault throws in this case.`,
    );
  }
  return matches[0] ?? null;
}

// ---------------------------------------------------------------------------
// Reload-for-recompute loaders (existing DB rows -> headline.ts input shape)
// ---------------------------------------------------------------------------

interface SiteVisitRow {
  id: number;
  visited: string | Date;
  ownership_type: string;
  ownership_contact_info: string;
  make_ownership_contact_info_public: boolean;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  calculated_latitude: number;
  calculated_latitude_input_format: number;
  calculated_longitude: number;
  calculated_longitude_input_format: number;
}

async function loadSiteVisitsForHeadline(sql: SqlTag, siteId: number): Promise<VisitForHeadline[]> {
  const rows = await sql<SiteVisitRow>`
    select id, visited, ownership_type, ownership_contact_info, make_ownership_contact_info_public,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format
    from site_visits where site_id = ${siteId} order by id asc
  `;
  const result: VisitForHeadline[] = [];
  for (const row of rows) {
    const visitors = await sql<{ first_name: string; last_name: string }>`
      select first_name, last_name from site_visitors where site_visit_id = ${row.id} order by id asc
    `;
    const photos = await sql<{ photo_id: number; caption: string | null }>`
      select photo_id, caption from photo_references where type = 5 and site_visit_id = ${row.id} order by id asc
    `;
    result.push({
      visited: toDateOnlyString(row.visited),
      ownershipType: row.ownership_type,
      coordinates: {
        latitude: row.latitude,
        latitudeInputFormat: fmt(row.latitude_input_format),
        longitude: row.longitude,
        longitudeInputFormat: fmt(row.longitude_input_format),
      },
      calculatedCoordinates: {
        latitude: row.calculated_latitude,
        latitudeInputFormat: fmt(row.calculated_latitude_input_format),
        longitude: row.calculated_longitude,
        longitudeInputFormat: fmt(row.calculated_longitude_input_format),
      },
      ownershipContactInfo: row.ownership_contact_info,
      makeOwnershipContactInfoPublic: row.make_ownership_contact_info_public,
      visitors: visitors.map((v) => ({ firstName: v.first_name, lastName: v.last_name })),
      photos: photos.map((p) => ({ type: PhotoReferenceType.SiteVisit, photoId: p.photo_id, caption: p.caption })),
    });
  }
  return result;
}

interface TreeMeasurementRow {
  id: number;
  measured: string | Date;
  common_name: string;
  scientific_name: string;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  calculated_latitude: number;
  calculated_latitude_input_format: number;
  calculated_longitude: number;
  calculated_longitude_input_format: number;
  elevation: number;
  elevation_input_format: number;
}

async function loadTreeMeasurementsForHeadline(sql: SqlTag, treeId: number): Promise<MeasurementForHeadline[]> {
  const rows = await sql<TreeMeasurementRow>`
    select id, measured, common_name, scientific_name,
      height, height_input_format, height_measurement_method,
      girth, girth_input_format, crown_spread, crown_spread_input_format,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      elevation, elevation_input_format
    from tree_measurements where tree_id = ${treeId} order by id asc
  `;
  const result: MeasurementForHeadline[] = [];
  for (const row of rows) {
    const measurers = await sql<{ first_name: string; last_name: string }>`
      select first_name, last_name from tree_measurers where measurement_id = ${row.id} order by id asc
    `;
    const photos = await sql<{ photo_id: number; caption: string | null }>`
      select photo_id, caption from photo_references where type = 7 and tree_measurement_id = ${row.id} order by id asc
    `;
    result.push({
      measured: toDateOnlyString(row.measured),
      commonName: row.common_name,
      scientificName: row.scientific_name,
      height: row.height,
      heightInputFormat: row.height_input_format,
      heightMeasurementMethod: row.height_measurement_method,
      girth: row.girth,
      girthInputFormat: row.girth_input_format,
      crownSpread: row.crown_spread,
      crownSpreadInputFormat: row.crown_spread_input_format,
      coordinates: {
        latitude: row.latitude,
        latitudeInputFormat: fmt(row.latitude_input_format),
        longitude: row.longitude,
        longitudeInputFormat: fmt(row.longitude_input_format),
      },
      calculatedCoordinates: {
        latitude: row.calculated_latitude,
        latitudeInputFormat: fmt(row.calculated_latitude_input_format),
        longitude: row.calculated_longitude,
        longitudeInputFormat: fmt(row.calculated_longitude_input_format),
      },
      elevation: row.elevation,
      elevationInputFormat: row.elevation_input_format,
      measurers: measurers.map((m) => ({ firstName: m.first_name, lastName: m.last_name })),
      photos: photos.map((p) => ({ type: PhotoReferenceType.TreeMeasurement, photoId: p.photo_id, caption: p.caption })),
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Persistence: new tree / append-to-existing-tree
// ---------------------------------------------------------------------------

async function insertMeasurement(
  sql: SqlTag,
  tripId: number,
  treeId: number,
  measurement: MeasurementGraph,
  result: FinishTripResult,
): Promise<number> {
  const dn = measurement.derivedNumbers;
  if (!dn) throw new Error("insertMeasurement: derivedNumbers must be filled in before persisting");
  const speciesId = speciesHash(measurement.scientificName, measurement.commonName);
  const rows = await sql<{ id: number }>`
    insert into tree_measurements (
      tree_id, importing_trip_id, computed_measured_species_id, measured, common_name, scientific_name,
      height, height_input_format, height_measurement_method,
      girth, girth_input_format, crown_spread, crown_spread_input_format,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      elevation, elevation_input_format, general_comments,
      diameter, diameter_input_format, entspts, conical_volume, conical_volume_input_format, entspts2, champion_points, abbreviated_champion_points
    ) values (
      ${treeId}, ${tripId}, ${speciesId}, ${measurement.measured}, ${measurement.commonName}, ${measurement.scientificName},
      ${measurement.height}, ${measurement.heightInputFormat}, ${measurement.heightMeasurementMethod},
      ${measurement.girth}, ${measurement.girthInputFormat}, ${measurement.crownSpread}, ${measurement.crownSpreadInputFormat},
      ${measurement.coordinates.latitude}, ${measurement.coordinates.latitudeInputFormat}, ${measurement.coordinates.longitude}, ${measurement.coordinates.longitudeInputFormat},
      ${measurement.calculatedCoordinates.latitude}, ${measurement.calculatedCoordinates.latitudeInputFormat}, ${measurement.calculatedCoordinates.longitude}, ${measurement.calculatedCoordinates.longitudeInputFormat},
      ${measurement.elevation}, ${measurement.elevationInputFormat}, ${measurement.generalComments},
      ${dn.diameter}, ${dn.diameterInputFormat}, ${dn.entspts}, ${dn.conicalVolume}, ${dn.conicalVolumeInputFormat}, ${dn.entspts2}, ${dn.championPoints}, ${dn.abbreviatedChampionPoints}
    ) returning id
  `;
  const measurementId = rows[0]!.id;
  result.measurementsInserted++;

  for (const m of measurement.measurers) {
    await sql`insert into tree_measurers (tree_id, measurement_id, first_name, last_name) values (${null}, ${measurementId}, ${m.firstName}, ${m.lastName})`;
  }
  for (const p of measurement.photos) {
    await sql`insert into photo_references (type, tree_measurement_id, photo_id, caption) values (${p.type}, ${measurementId}, ${p.photoId}, ${p.caption})`;
  }
  return measurementId;
}

async function insertNewTree(
  sql: SqlTag,
  tripId: number,
  siteId: number,
  tree: TreeGraph,
  result: FinishTripResult,
): Promise<void> {
  const h = tree.headline;
  if (!h) throw new Error("insertNewTree: headline must be filled in before persisting");
  const speciesId = speciesHash(h.scientificName, h.commonName);
  const rows = await sql<{ id: number }>`
    insert into trees (
      site_id, computed_measured_species_id, last_measured, common_name, scientific_name,
      height, height_input_format, height_measurement_method,
      girth, girth_input_format, crown_spread, crown_spread_input_format,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      elevation, elevation_input_format,
      diameter, diameter_input_format, entspts, conical_volume, conical_volume_input_format, entspts2, champion_points, abbreviated_champion_points
    ) values (
      ${siteId}, ${speciesId}, ${h.lastMeasured}, ${h.commonName}, ${h.scientificName},
      ${h.height}, ${h.heightInputFormat}, ${h.heightMeasurementMethod},
      ${h.girth}, ${h.girthInputFormat}, ${h.crownSpread}, ${h.crownSpreadInputFormat},
      ${h.coordinates.latitude}, ${h.coordinates.latitudeInputFormat}, ${h.coordinates.longitude}, ${h.coordinates.longitudeInputFormat},
      ${h.calculatedCoordinates.latitude}, ${h.calculatedCoordinates.latitudeInputFormat}, ${h.calculatedCoordinates.longitude}, ${h.calculatedCoordinates.longitudeInputFormat},
      ${h.elevation}, ${h.elevationInputFormat},
      ${h.diameter}, ${h.diameterInputFormat}, ${h.entspts}, ${h.conicalVolume}, ${h.conicalVolumeInputFormat}, ${h.entspts2}, ${h.championPoints}, ${h.abbreviatedChampionPoints}
    ) returning id
  `;
  const treeId = rows[0]!.id;
  result.treesInserted++;

  for (const m of h.measurers) {
    await sql`insert into tree_measurers (tree_id, measurement_id, first_name, last_name) values (${treeId}, ${null}, ${m.firstName}, ${m.lastName})`;
  }
  for (const p of h.photos) {
    await sql`insert into photo_references (type, tree_id, photo_id, caption) values (${p.type}, ${treeId}, ${p.photoId}, ${p.caption})`;
  }

  await insertMeasurement(sql, tripId, treeId, tree.measurements[0]!, result);
  await markSiteStaleForTree(siteId, sql);
}

async function mergeIntoExistingTree(
  sql: SqlTag,
  tripId: number,
  treeId: number,
  siteId: number,
  measurement: MeasurementGraph,
  result: FinishTripResult,
): Promise<void> {
  await insertMeasurement(sql, tripId, treeId, measurement, result);
  result.treesMerged++;

  const allMeasurements = await loadTreeMeasurementsForHeadline(sql, treeId);
  const { headline: h } = applyTreeHeadline(allMeasurements);
  const speciesId = speciesHash(h.scientificName, h.commonName);

  await sql`
    update trees set
      last_measured = ${h.lastMeasured}, common_name = ${h.commonName}, scientific_name = ${h.scientificName},
      computed_measured_species_id = ${speciesId},
      height = ${h.height}, height_input_format = ${h.heightInputFormat}, height_measurement_method = ${h.heightMeasurementMethod},
      girth = ${h.girth}, girth_input_format = ${h.girthInputFormat}, crown_spread = ${h.crownSpread}, crown_spread_input_format = ${h.crownSpreadInputFormat},
      latitude = ${h.coordinates.latitude}, latitude_input_format = ${h.coordinates.latitudeInputFormat},
      longitude = ${h.coordinates.longitude}, longitude_input_format = ${h.coordinates.longitudeInputFormat},
      calculated_latitude = ${h.calculatedCoordinates.latitude}, calculated_latitude_input_format = ${h.calculatedCoordinates.latitudeInputFormat},
      calculated_longitude = ${h.calculatedCoordinates.longitude}, calculated_longitude_input_format = ${h.calculatedCoordinates.longitudeInputFormat},
      elevation = ${h.elevation}, elevation_input_format = ${h.elevationInputFormat},
      diameter = ${h.diameter}, diameter_input_format = ${h.diameterInputFormat}, entspts = ${h.entspts},
      conical_volume = ${h.conicalVolume}, conical_volume_input_format = ${h.conicalVolumeInputFormat},
      entspts2 = ${h.entspts2}, champion_points = ${h.championPoints}, abbreviated_champion_points = ${h.abbreviatedChampionPoints}
    where id = ${treeId}
  `;

  // Tree-level Measurers bag is fully replaced on every RecalculateProperties
  // (NHibernate `RemoveAll().AddRange(...)`, Tree.cs:73-75) -- delete + re-insert.
  await sql`delete from tree_measurers where tree_id = ${treeId} and measurement_id is null`;
  for (const m of h.measurers) {
    await sql`insert into tree_measurers (tree_id, measurement_id, first_name, last_name) values (${treeId}, ${null}, ${m.firstName}, ${m.lastName})`;
  }
  // Tree-level photos (type 6), likewise fully replaced.
  await sql`delete from photo_references where tree_id = ${treeId} and type = 6`;
  for (const p of h.photos) {
    await sql`insert into photo_references (type, tree_id, photo_id, caption) values (${p.type}, ${treeId}, ${p.photoId}, ${p.caption})`;
  }

  await markSiteStaleForTree(siteId, sql);
}

// ---------------------------------------------------------------------------
// Persistence: new site / append-to-existing-site
// ---------------------------------------------------------------------------

async function insertNewSite(
  sql: SqlTag,
  tripId: number,
  graph: SiteGraph,
  result: FinishTripResult,
): Promise<void> {
  const h = graph.headline;
  if (!h) throw new Error("insertNewSite: headline must be filled in before persisting");

  const siteRows = await sql<{ id: number }>`
    insert into sites (
      state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, name,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      visit_count
    ) values (
      ${graph.stateId}, ${graph.county}, ${h.ownershipType}, ${h.ownershipContactInfo}, ${h.makeOwnershipContactInfoPublic}, ${graph.name},
      ${h.coordinates.latitude}, ${h.coordinates.latitudeInputFormat}, ${h.coordinates.longitude}, ${h.coordinates.longitudeInputFormat},
      ${h.calculatedCoordinates.latitude}, ${h.calculatedCoordinates.latitudeInputFormat}, ${h.calculatedCoordinates.longitude}, ${h.calculatedCoordinates.longitudeInputFormat},
      ${h.visitCount}
    ) returning id
  `;
  const siteId = siteRows[0]!.id;
  result.sitesInserted++;

  const visit = graph.visits[0]!;
  const visitRows = await sql<{ id: number }>`
    insert into site_visits (
      site_id, importing_trip_id, visited, name, state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      comments, trip_report_url
    ) values (
      ${siteId}, ${tripId}, ${visit.visited}, ${visit.name}, ${visit.stateId}, ${visit.county}, ${visit.ownershipType}, ${visit.ownershipContactInfo}, ${visit.makeOwnershipContactInfoPublic},
      ${visit.coordinates.latitude}, ${visit.coordinates.latitudeInputFormat}, ${visit.coordinates.longitude}, ${visit.coordinates.longitudeInputFormat},
      ${visit.calculatedCoordinates.latitude}, ${visit.calculatedCoordinates.latitudeInputFormat}, ${visit.calculatedCoordinates.longitude}, ${visit.calculatedCoordinates.longitudeInputFormat},
      ${visit.comments}, ${visit.tripReportUrl}
    ) returning id
  `;
  const visitId = visitRows[0]!.id;

  for (const v of visit.visitors) {
    await sql`insert into site_visitors (site_id, site_visit_id, first_name, last_name) values (${null}, ${visitId}, ${v.firstName}, ${v.lastName})`;
  }
  for (const p of visit.photos) {
    await sql`insert into photo_references (type, site_visit_id, photo_id, caption) values (${p.type}, ${visitId}, ${p.photoId}, ${p.caption})`;
  }
  for (const v of h.visitors) {
    await sql`insert into site_visitors (site_id, site_visit_id, first_name, last_name) values (${siteId}, ${null}, ${v.firstName}, ${v.lastName})`;
  }
  for (const p of h.photos) {
    await sql`insert into photo_references (type, site_id, photo_id, caption) values (${p.type}, ${siteId}, ${p.photoId}, ${p.caption})`;
  }

  for (const tree of graph.trees) {
    await insertNewTree(sql, tripId, siteId, tree, result);
  }

  await markStatesStaleForSite(graph.stateId, sql);
}

async function mergeIntoExistingSite(
  sql: SqlTag,
  tripId: number,
  siteId: number,
  stateId: number,
  graph: SiteGraph,
  result: FinishTripResult,
): Promise<void> {
  const incomingVisit = graph.visits[0]!;
  const visitRows = await sql<{ id: number }>`
    insert into site_visits (
      site_id, importing_trip_id, visited, name, state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public,
      latitude, latitude_input_format, longitude, longitude_input_format,
      calculated_latitude, calculated_latitude_input_format, calculated_longitude, calculated_longitude_input_format,
      comments, trip_report_url
    ) values (
      ${siteId}, ${tripId}, ${incomingVisit.visited}, ${incomingVisit.name}, ${incomingVisit.stateId}, ${incomingVisit.county}, ${incomingVisit.ownershipType}, ${incomingVisit.ownershipContactInfo}, ${incomingVisit.makeOwnershipContactInfoPublic},
      ${incomingVisit.coordinates.latitude}, ${incomingVisit.coordinates.latitudeInputFormat}, ${incomingVisit.coordinates.longitude}, ${incomingVisit.coordinates.longitudeInputFormat},
      ${incomingVisit.calculatedCoordinates.latitude}, ${incomingVisit.calculatedCoordinates.latitudeInputFormat}, ${incomingVisit.calculatedCoordinates.longitude}, ${incomingVisit.calculatedCoordinates.longitudeInputFormat},
      ${incomingVisit.comments}, ${incomingVisit.tripReportUrl}
    ) returning id
  `;
  const visitId = visitRows[0]!.id;
  result.sitesMerged++;

  for (const v of incomingVisit.visitors) {
    await sql`insert into site_visitors (site_id, site_visit_id, first_name, last_name) values (${null}, ${visitId}, ${v.firstName}, ${v.lastName})`;
  }
  for (const p of incomingVisit.photos) {
    await sql`insert into photo_references (type, site_visit_id, photo_id, caption) values (${p.type}, ${visitId}, ${p.photoId}, ${p.caption})`;
  }

  const allVisits = await loadSiteVisitsForHeadline(sql, siteId);
  const h = applySiteHeadline(allVisits);

  await sql`
    update sites set
      ownership_type = ${h.ownershipType},
      ownership_contact_info = ${h.ownershipContactInfo},
      make_ownership_contact_info_public = ${h.makeOwnershipContactInfoPublic},
      latitude = ${h.coordinates.latitude}, latitude_input_format = ${h.coordinates.latitudeInputFormat},
      longitude = ${h.coordinates.longitude}, longitude_input_format = ${h.coordinates.longitudeInputFormat},
      calculated_latitude = ${h.calculatedCoordinates.latitude}, calculated_latitude_input_format = ${h.calculatedCoordinates.latitudeInputFormat},
      calculated_longitude = ${h.calculatedCoordinates.longitude}, calculated_longitude_input_format = ${h.calculatedCoordinates.longitudeInputFormat},
      visit_count = ${h.visitCount}
    where id = ${siteId}
  `;

  await sql`delete from site_visitors where site_id = ${siteId} and site_visit_id is null`;
  for (const v of h.visitors) {
    await sql`insert into site_visitors (site_id, site_visit_id, first_name, last_name) values (${siteId}, ${null}, ${v.firstName}, ${v.lastName})`;
  }
  await sql`delete from photo_references where site_id = ${siteId} and type = 4`;
  for (const p of h.photos) {
    await sql`insert into photo_references (type, site_id, photo_id, caption) values (${p.type}, ${siteId}, ${p.photoId}, ${p.caption})`;
  }

  await markStatesStaleForSite(stateId, sql);

  for (const tree of graph.trees) {
    const measurement = tree.measurements[0]!;
    const incomingTreeCandidate: TreeMergeCandidate = {
      commonName: measurement.commonName,
      scientificName: measurement.scientificName,
      // Tree.ShouldMerge (Tree.cs:118) checks Coordinates, NOT
      // CalculatedCoordinates -- the tree's own headline coordinates,
      // already the CalculateCoordinates() cascade result.
      coordinates: tree.headline!.coordinates,
    };
    const matchedTreeId = await findMergeCandidateTreeId(sql, siteId, incomingTreeCandidate);
    if (matchedTreeId == null) {
      await insertNewTree(sql, tripId, siteId, tree, result);
    } else {
      await mergeIntoExistingTree(sql, tripId, matchedTreeId, siteId, measurement, result);
    }
  }
}

// ---------------------------------------------------------------------------
// Per-site orchestration + the shared merge core
// ---------------------------------------------------------------------------

async function processSiteGraph(
  sql: SqlTag,
  tripId: number,
  graph: SiteGraph,
  result: FinishTripResult,
): Promise<void> {
  const h = graph.headline;
  if (!h) throw new Error("processSiteGraph: headline must be filled in before persisting");

  const incoming: SiteMergeCandidate = {
    name: graph.name,
    stateId: graph.stateId,
    county: graph.county,
    calculatedCoordinates: h.calculatedCoordinates,
  };
  const matchedSiteId = await findMergeCandidateSiteId(sql, incoming);

  if (matchedSiteId == null) {
    await insertNewSite(sql, tripId, graph, result);
  } else {
    await mergeIntoExistingSite(sql, tripId, matchedSiteId, graph.stateId, graph, result);
  }
}

/**
 * The shared merge core (doc 01 §10 steps 1-4), reused by both `finishTrip`
 * (fresh import) and `reimportTrip` (reimport.ts, delete-then-import) --
 * mirrors `ImportRepository.InternalImport` (ImportRepository.cs:36-43).
 * For each of the trip's sites: build the full domain graph (graph.ts),
 * fill in headline/derived-number fields (headline.ts), find (or fail to
 * find) a merge candidate (predicates.ts), and either insert or merge.
 * Does NOT stamp `import_trips.imported` or run `recomputeStaleMetrics` --
 * callers do that once, after this returns, inside the same transaction.
 */
export async function runImport(sql: SqlTag, tripId: number): Promise<FinishTripResult> {
  const trip = await loadTripRow(sql, tripId);
  const context = await buildTripContext(sql, trip);
  const siteRows = await loadImportSites(sql, tripId);

  const siteInputs: ImportSiteInput[] = [];
  const treeInputsBySite = new Map<number, ImportTreeInput[]>();
  for (const row of siteRows) {
    const siteInput = await buildImportSiteInput(sql, row);
    siteInputs.push(siteInput);
    const treeRows = await loadImportTrees(sql, row.id);
    const treeInputs: ImportTreeInput[] = [];
    for (const treeRow of treeRows) {
      treeInputs.push(await buildImportTreeInput(sql, treeRow));
    }
    treeInputsBySite.set(row.id, treeInputs);
  }

  // Trip.CalculateCoordinates()'s per-site fallback tier (graph.ts):
  // reduced coordinates for every site in the trip, computed once and
  // reused across every buildSiteGraph call below.
  const allSitesCoords: TripSiteCoordinatesInput[] = siteInputs.map((s) => ({
    coordinates: s.coordinates,
    treeCoordinates: (treeInputsBySite.get(s.id) ?? []).map((t) => t.coordinates),
  }));

  const result = emptyResult();
  for (const siteInput of siteInputs) {
    const treeInputs = treeInputsBySite.get(siteInput.id) ?? [];
    const graph = buildSiteGraph(siteInput, treeInputs, context, allSitesCoords);

    for (const tree of graph.trees) {
      const { derivedNumbers, headline } = applyTreeHeadline(tree.measurements);
      tree.measurements[0]!.derivedNumbers = derivedNumbers[0]!;
      tree.headline = headline;
    }
    graph.headline = applySiteHeadline(graph.visits);

    await processSiteGraph(sql, tripId, graph, result);
  }

  return result;
}

/**
 * `ImportController.Finish` -> `Import()` (ImportRepository.cs base class
 * :20-26) when the trip has not yet been imported. See this file's header
 * DESIGN CHOICE note for why this throws (rather than delegating) when
 * already imported -- use `reimportTrip` (reimport.ts) in that case.
 */
export async function finishTrip(
  tripId: number,
  sql: SqlTag = defaultSql(),
): Promise<FinishTripResult> {
  return withTransaction(sql, async (trx) => {
    const trip = await loadTripRow(trx, tripId);
    if (trip.imported) {
      throw new Error(
        `Import trip ${tripId} is already imported; use reimportTrip() to re-finish it.`,
      );
    }
    const result = await runImport(trx, tripId);
    await trx`update import_trips set imported = now() where id = ${tripId}`;
    await recomputeStaleMetrics(trx);
    return result;
  });
}
