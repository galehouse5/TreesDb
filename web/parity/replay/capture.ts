/**
 * Pre/post state capture for one trip's replay (doc 07 §8 step 3, doc 05
 * §P3-02). Scoped deliberately narrow for performance (task brief: "avoid
 * full-table scans... filter by importing_trip_id and the affected
 * site/tree ids"): only the sites a trip's OWN rows are attributed to (via
 * `importing_trip_id` on `tree_measurements`/`site_visits`) are captured in
 * full detail, but "in full detail" means the WHOLE site -- every visit and
 * every tree/measurement it currently has, not just this trip's own rows --
 * because `mergeIntoExistingSite`/`mergeIntoExistingTree` recompute the
 * site/tree headline from ALL of their rows, and doc 07 §8 requires proving
 * "leave everything else untouched" for siblings at an affected site too.
 */
import type { SqlTag } from "../../db/queries/sql-tag";
import { candidateBoundingBox } from "../../lib/merge/predicates";
import { fround } from "../../lib/units/float32";
import { filterByExactSiteProximity, type Row } from "./natural-keys";

export interface MeasurementSnapshot {
  measurement: Row;
  measurers: Row[];
  photos: Row[];
}

export interface TreeSnapshot {
  tree: Row;
  /** Tree-level (measurement_id IS NULL) deduped measurers, type-6 photos. */
  measurers: Row[];
  photos: Row[];
  measurements: MeasurementSnapshot[];
}

export interface VisitSnapshot {
  visit: Row;
  visitors: Row[];
  photos: Row[];
}

export interface SiteSnapshot {
  site: Row;
  /** Site-level (site_visit_id IS NULL) deduped visitors, type-4 photos. */
  visitors: Row[];
  photos: Row[];
  visits: VisitSnapshot[];
  trees: TreeSnapshot[];
}

export interface GlobalCounts {
  sites: number;
  states: number;
  trees: number;
  treeMeasurements: number;
  siteVisits: number;
}

export interface TripCaptureScope {
  /** Site ids the trip's own rows are attributed to at the moment of capture (pre: via original importing_trip_id rows; post: via the freshly re-stamped rows the reimport just wrote). */
  siteIds: number[];
  sites: Map<number, SiteSnapshot>;
  /** States referenced by any captured site -- doc's "affected sites'/states' computed metric columns". */
  states: Map<number, Row>;
  globalCounts: GlobalCounts;
}

/** `RemoveMeasurementsByTrip`/`RemoveVisitsByTrip`'s own attribution query, reused here as the ground truth for "which sites does trip T currently touch" -- correct both before a reimport (original rows) and after (the reimport re-stamps every row it (re)writes with the same tripId, so re-running this same query after `reimportTrip` naturally finds wherever the trip's rows now live, even if that's a brand-new site created by the delete+reinsert). */
export async function findTripAffectedSiteIds(sql: SqlTag, tripId: number): Promise<number[]> {
  const fromVisits = await sql<{ site_id: number }>`
    select distinct site_id from site_visits where importing_trip_id = ${tripId} and site_id is not null
  `;
  const fromTrees = await sql<{ site_id: number }>`
    select distinct t.site_id from tree_measurements m
    join trees t on t.id = m.tree_id
    where m.importing_trip_id = ${tripId}
  `;
  const ids = new Set<number>();
  for (const r of fromVisits) ids.add(r.site_id);
  for (const r of fromTrees) ids.add(r.site_id);
  return [...ids].sort((a, b) => a - b);
}

/**
 * Resolves a site by natural identity (name/state/county, case-insensitive)
 * -- the id-churn-tolerant lookup doc 05 §P3-02 requires for a site that was
 * deleted and recreated under a new id. Proximity-scoped to
 * `nearCalculatedCoordinates` via the SAME two-stage filter the merge engine
 * itself uses for merge-candidate matching (`candidateBoundingBox` as a SQL
 * pre-filter, THEN the exact circular `planarDistanceMinutes <= 25'` check,
 * predicates.ts's `shouldMergeSite`) -- required because production
 * legitimately contains multiple DISTINCT sites sharing one
 * name+state+county (e.g. two unrelated "Pennypack Park" entries in
 * Philadelphia County, PA, 40+ miles apart, and two unrelated "Brecksville
 * Reservation" entries in Cuyahoga County, OH, ~0.416 degrees apart -- both
 * found during the task investigation) that `shouldMergeSite` correctly
 * never merges. The bounding box ALONE is not sufficient: it is
 * axis-aligned (per-axis +/- offset, not a true circle -- predicates.ts's
 * own header note), so two sites can sit near its diagonal corner and both
 * fall inside each other's box while still exceeding the true 25' circular
 * distance (confirmed for the Brecksville pair: axis deltas of ~0.4158/
 * ~0.2055 degrees both individually pass a ~0.4167-degree-per-axis box, but
 * the actual `planarDistanceMinutes` between them is ~29.9', over the
 * threshold). Without the exact second-stage check, this lookup would
 * spuriously pull in a genuinely untouched, unrelated sibling site into the
 * post-capture scope, and the caller (differ.ts's site-level
 * `matchMultiset`) would misreport its entire (unchanged) payload as an
 * "extra site" -- harness ambiguity, not a real replay mismatch.
 */
export async function findSiteByIdentity(
  sql: SqlTag,
  stateId: number,
  name: string,
  county: string,
  nearCalculatedCoordinates: { latitude: number; longitude: number },
): Promise<Row[]> {
  const lat = fround(nearCalculatedCoordinates.latitude);
  const lng = fround(nearCalculatedCoordinates.longitude);
  const box = candidateBoundingBox({
    latitude: lat,
    latitudeInputFormat: 2,
    longitude: lng,
    longitudeInputFormat: 2,
  });
  const candidates = await sql<Row>`
    select * from sites
    where state_id = ${stateId} and lower(name) = lower(${name}) and lower(county) = lower(${county})
      and calculated_latitude between ${box.minLatitude} and ${box.maxLatitude}
      and calculated_longitude between ${box.minLongitude} and ${box.maxLongitude}
    order by id asc
  `;
  return filterByExactSiteProximity(candidates, lat, lng);
}

function groupByNumberField<T extends Row>(rows: readonly T[], field: string): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const row of rows) {
    const key = row[field];
    if (key === null || key === undefined) continue;
    const k = Number(key);
    const bucket = map.get(k);
    if (bucket) bucket.push(row);
    else map.set(k, [row]);
  }
  return map;
}

/**
 * Batched per-site loader -- doc 05 §P3-02's performance note ("avoid
 * full-table scans... keep per-trip work lean"). An earlier version issued
 * one query per child row (measurers/photos per measurement/visit), an O(N)
 * round-trip pattern that made a single trip with a few dozen rows take
 * several seconds; this version issues a small, CONSTANT number of queries
 * per site (one per child table, scoped with `= ANY(...)` over this site's
 * own tree/measurement/visit ids) regardless of how many trees/measurements
 * the site has, then groups the results in memory.
 */
async function loadSiteSnapshot(sql: SqlTag, siteId: number): Promise<SiteSnapshot | undefined> {
  const siteRows = await sql<Row>`select * from sites where id = ${siteId}`;
  const site = siteRows[0];
  if (!site) return undefined;

  const [siteVisitorsAll, visitRows, treeRows] = await Promise.all([
    sql<Row>`select * from site_visitors where site_id = ${siteId} order by id asc`,
    sql<Row>`select * from site_visits where site_id = ${siteId} order by id asc`,
    sql<Row>`select * from trees where site_id = ${siteId} order by id asc`,
  ]);
  const siteVisitors = siteVisitorsAll.filter((r) => r.site_visit_id === null);

  const visitIds = visitRows.map((v) => Number(v.id));
  const treeIds = treeRows.map((t) => Number(t.id));

  const [sitePhotos, visitVisitorsAll, visitPhotosAll, measurementRowsAll] = await Promise.all([
    sql<Row>`select * from photo_references where type = 4 and site_id = ${siteId} order by id asc`,
    visitIds.length > 0
      ? sql<Row>`select * from site_visitors where site_visit_id = any(${visitIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
    visitIds.length > 0
      ? sql<Row>`select * from photo_references where type = 5 and site_visit_id = any(${visitIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
    treeIds.length > 0
      ? sql<Row>`select * from tree_measurements where tree_id = any(${treeIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
  ]);
  const visitVisitorsByVisit = groupByNumberField(visitVisitorsAll, "site_visit_id");
  const visitPhotosByVisit = groupByNumberField(visitPhotosAll, "site_visit_id");
  const visits: VisitSnapshot[] = visitRows.map((visit) => {
    const visitId = Number(visit.id);
    return {
      visit,
      visitors: visitVisitorsByVisit.get(visitId) ?? [],
      photos: visitPhotosByVisit.get(visitId) ?? [],
    };
  });

  const measurementIds = measurementRowsAll.map((m) => Number(m.id));
  const [treeMeasurersAll, treePhotosAll, measMeasurersAll, measPhotosAll] = await Promise.all([
    treeIds.length > 0
      ? sql<Row>`select * from tree_measurers where tree_id = any(${treeIds}) and measurement_id is null order by id asc`
      : Promise.resolve<Row[]>([]),
    treeIds.length > 0
      ? sql<Row>`select * from photo_references where type = 6 and tree_id = any(${treeIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
    measurementIds.length > 0
      ? sql<Row>`select * from tree_measurers where measurement_id = any(${measurementIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
    measurementIds.length > 0
      ? sql<Row>`select * from photo_references where type = 7 and tree_measurement_id = any(${measurementIds}) order by id asc`
      : Promise.resolve<Row[]>([]),
  ]);
  const treeMeasurersByTree = groupByNumberField(treeMeasurersAll, "tree_id");
  const treePhotosByTree = groupByNumberField(treePhotosAll, "tree_id");
  const measMeasurersByMeasurement = groupByNumberField(measMeasurersAll, "measurement_id");
  const measPhotosByMeasurement = groupByNumberField(measPhotosAll, "tree_measurement_id");
  const measurementsByTree = groupByNumberField(measurementRowsAll, "tree_id");

  const trees: TreeSnapshot[] = treeRows.map((tree) => {
    const treeId = Number(tree.id);
    const measurements: MeasurementSnapshot[] = (measurementsByTree.get(treeId) ?? []).map((measurement) => {
      const measId = Number(measurement.id);
      return {
        measurement,
        measurers: measMeasurersByMeasurement.get(measId) ?? [],
        photos: measPhotosByMeasurement.get(measId) ?? [],
      };
    });
    return {
      tree,
      measurers: treeMeasurersByTree.get(treeId) ?? [],
      photos: treePhotosByTree.get(treeId) ?? [],
      measurements,
    };
  });

  return { site, visitors: siteVisitors, photos: sitePhotos, visits, trees };
}

export async function loadGlobalCounts(sql: SqlTag): Promise<GlobalCounts> {
  const rows = await sql<{
    sites: number;
    states: number;
    trees: number;
    tree_measurements: number;
    site_visits: number;
  }>`
    select
      (select count(*)::int from sites) as sites,
      (select count(*)::int from states) as states,
      (select count(*)::int from trees) as trees,
      (select count(*)::int from tree_measurements) as tree_measurements,
      (select count(*)::int from site_visits) as site_visits
  `;
  const r = rows[0]!;
  return {
    sites: r.sites,
    states: r.states,
    trees: r.trees,
    treeMeasurements: r.tree_measurements,
    siteVisits: r.site_visits,
  };
}

export interface SiteIdentityLookup {
  stateId: number;
  name: string;
  county: string;
  calculatedLatitude: number;
  calculatedLongitude: number;
}

/**
 * Captures the full scope for a trip: every site it's currently attributed
 * to (`findTripAffectedSiteIds`), each of those sites in full detail, the
 * states they belong to, and cheap global row counts (the "untouched-scope
 * safety" smoke check doc 05 §P3-02 asks for).
 *
 * `extraIdentities` (used for the POST capture only, populated from the PRE
 * snapshot's own sites) additionally re-resolves each pre-affected site by
 * natural identity even if the reimport no longer attributes any row to it
 * -- the case where a changed merge context sends the trip's rows to a
 * DIFFERENT site than before (doc 07 §8's "the site-matching context
 * changed since the original import"). Without this, a site the trip
 * abandons would never be re-examined post-reimport at all, silently
 * hiding exactly the kind of drift replay parity exists to catch.
 */
export async function captureTripScope(
  sql: SqlTag,
  tripId: number,
  extraIdentities: readonly SiteIdentityLookup[] = [],
): Promise<TripCaptureScope> {
  const siteIds = new Set(await findTripAffectedSiteIds(sql, tripId));
  for (const identity of extraIdentities) {
    const rows = await findSiteByIdentity(sql, identity.stateId, identity.name, identity.county, {
      latitude: identity.calculatedLatitude,
      longitude: identity.calculatedLongitude,
    });
    for (const row of rows) siteIds.add(Number(row.id));
  }

  const sites = new Map<number, SiteSnapshot>();
  const stateIds = new Set<number>();
  for (const siteId of siteIds) {
    const snap = await loadSiteSnapshot(sql, siteId);
    if (snap) {
      sites.set(siteId, snap);
      stateIds.add(Number(snap.site.state_id));
    }
  }
  const states = new Map<number, Row>();
  for (const stateId of stateIds) {
    const rows = await sql<Row>`select * from states where id = ${stateId}`;
    if (rows[0]) states.set(stateId, rows[0]);
  }
  const globalCounts = await loadGlobalCounts(sql);
  return { siteIds: [...siteIds].sort((a, b) => a - b), sites, states, globalCounts };
}
