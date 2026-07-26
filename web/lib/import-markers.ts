// Pure payload assembly for the import-wizard markers endpoint -- task
// P3-09 (doc 05 §P3-09). Port of `MapController.ImportSiteMarkers`/
// `ImportTreeMarkers` (`TMD/Controllers/MapController.cs:70-113`) +
// `MapMarkerModel.ToJson` (`TMD/Models/Map/MapMarkerModel.cs:16-28`) +
// `MapMapping.cs:63-77`'s `Model.Imports.{Site,TreeBase} -> MapMarkerModel`
// rules -- transcribed in full below.
//
// --- ImportSiteMarkers(id=tripId, siteId) ------------------------------
//   markers.AddRange(from site in trip.Sites
//                     where site.Coordinates.IsValidAndSpecified() && site.Id != siteId
//                     select Map<Site, MapMarkerModel>(site));
//   markers.AddRange(from site in trip.Sites from tree in site.Trees
//                     where tree.Coordinates.IsValidAndSpecified()
//                     select Map<TreeBase, MapMarkerModel>(tree));
//   var calculated = trip.FindSiteById(siteId).CalculateCoordinates();
//   -> { CalculatedCoordinates? , Markers: [...] }
// Note: the tree branch has NO site filter at all (every tree in the trip,
// including ones under the target site itself, are context markers) --
// only the SITE branch excludes the target site's own (about-to-be-placed)
// pin.
//
// --- ImportTreeMarkers(id=tripId, treeId) -------------------------------
//   markers.AddRange(from site in trip.Sites
//                     where site.Coordinates.IsValidAndSpecified()
//                     select Map<Site, MapMarkerModel>(site));           // no siteId exclusion
//   markers.AddRange(from site in trip.Sites from tree in site.Trees
//                     where tree.Coordinates.IsValidAndSpecified() && tree.Id != treeId
//                     select Map<TreeBase, MapMarkerModel>(tree));
//   var calculated = trip.FindTreeById(treeId).CalculateCoordinates();
//
// --- Per-marker mapping (MapMapping.cs:65-77) ---------------------------
//   Site:  Title = site.Name; Position = site.Coordinates (RAW, not
//          calculated -- unlike the canonical Site->MapMarkerModel mapping,
//          which uses CalculatedCoordinates, `db/queries/map.sql.ts`'s file
//          header); MinZoom/MaxZoom are never set for an import marker (no
//          `.ForMember` for them in this CreateMap<>, unlike the canonical
//          Site/Tree/State mappings) -> both null in the JSON, always.
//          DefaultIconUrl = "{Site32_png}?v=2"; IconLoaderAction -> first
//          photo's SmallMapSquare if the site has any (photo_references
//          type=2, `import_site_id`), else the default icon.
//          InfoLoaderAction -> `Map/ImportSiteMarkerInfo?id={tripId}&siteId={id}`
//          -- ported to `/api/import/{tripId}/sites/{id}/info` per this
//          port's URL convention (`/api/map/{sites,trees}/{id}/info`); that
//          route itself is a later task's (not P3-09's) responsibility, this
//          endpoint only needs to emit the URL shape, matching how the
//          canonical `/api/map/markers` route already builds
//          `InfoLoaderUrl` strings independent of this file.
//   Tree:  Title = tree.ScientificName (RAW `import_trees.scientific_name`
//          -- NO "(Unidentified)" fallback at this layer; that fallback is
//          `Measurement.Create`'s job at Finish time, not `MapMapping`'s).
//          Position = tree.CalculatedCoordinates (DIFFERENT from the filter
//          test, which is on the tree's RAW Coordinates -- same
//          raw-vs-calculated split the canonical Tree->MapMarkerModel
//          mapping has, `db/queries/map.sql.ts`'s file header). DefaultIconUrl
//          = "/images/icons/Tree32.png"; IconLoaderAction -> first photo
//          (photo_references type=3, `import_tree_id`) else default.
//          InfoLoaderAction -> ported to `/api/import/{tripId}/trees/{id}/info`.
//
// CalculatedCoordinates: `Site.CalculateCoordinates()` (ignoreContainingTrip
// = false, the full own-coordinates -> own-trees'-bounds -> trip-wide
// fallback cascade) / `TreeBase.CalculateCoordinates()` (own coordinates ->
// containing site's CalculateCoordinates()) -- computed fresh from the
// still-in-progress DRAFT rows at request time (there is no persisted
// `calculated_latitude`/`calculated_longitude` column on
// `import_sites`/`import_trees`, unlike the canonical `sites`/`trees`
// tables), REUSING `lib/merge/graph.ts`'s already-verified cascade
// (`calculateSiteCalculatedCoordinates`/`calculateTreeCalculatedCoordinates`/
// `calculateTripFallbackCoordinates`, additive exports -- see that file's
// header note) rather than re-deriving the formulas here. Included in the
// JSON payload only when `IsValidAndSpecified()` (same gate the marker list
// filter uses) -- otherwise the `CalculatedCoordinates` key is omitted
// entirely, matching legacy's `if (calculatedCoordinates.IsValidAndSpecified())`
// branch (`MapController.cs:82-87,105-110`).
import {
  calculateSiteCalculatedCoordinates,
  calculateTreeCalculatedCoordinates,
  calculateTripFallbackCoordinates,
} from "./merge/graph";
import {
  type CoordinatesFormatCode,
  type CoordinatesInput,
  type ImportSiteInput,
  type ImportTreeInput,
  type TripSiteCoordinatesInput,
  isCoordinatesValidAndSpecified,
} from "./merge/types";
import type { ImportSite } from "../db/queries/import-drafts.sql";
import type { TreeRecord } from "../db/queries/import-trees.sql";

export interface ImportMarkerJson {
  Title: string;
  MinZoom: number | null;
  MaxZoom: number | null;
  Latitude: number;
  Longitude: number;
  InfoLoaderUrl: string;
  IconUrl: string;
}

export interface ImportMarkersPayload {
  CalculatedCoordinates?: { Latitude: number; Longitude: number };
  Markers: ImportMarkerJson[];
}

export type ImportMarkersError = "site-not-found" | "tree-not-found";

export interface ImportMarkersData {
  tripId: number;
  sites: ImportSite[];
  treesBySite: Record<number, TreeRecord[]>;
  /** `import_site_id -> photo_id` for that site's lowest-`id` `photo_references` row (type 2), if any. */
  siteFirstPhotoId: Map<number, number>;
  /** `import_tree_id -> photo_id` for that tree's lowest-`id` `photo_references` row (type 3), if any. */
  treeFirstPhotoId: Map<number, number>;
}

const DEFAULT_SITE_ICON = "/images/icons/Site32.png?v=2";
const DEFAULT_TREE_ICON = "/images/icons/Tree32.png";

function iconUrl(photoId: number | undefined, defaultUrl: string): string {
  return photoId == null ? defaultUrl : `/photos/${photoId}/SmallMapSquare`;
}

/** `ImportSite`/`TreeRecord`'s `*InputFormat` fields are typed via `lib/units/parse-coordinates.ts`'s real TS `enum CoordinatesFormat` (numerically identical to, but a distinct nominal type from, `lib/merge/types.ts`'s `CoordinatesFormatCode` literal union) -- same DB-row -> merge-input bridge `lib/merge/engine.ts`'s own `fmt()` helper performs. */
function fmt(n: number): CoordinatesFormatCode {
  return n as CoordinatesFormatCode;
}

function siteCoordinates(s: ImportSite): CoordinatesInput {
  return {
    latitude: s.latitude,
    latitudeInputFormat: fmt(s.latitudeInputFormat),
    longitude: s.longitude,
    longitudeInputFormat: fmt(s.longitudeInputFormat),
  };
}

function treeCoordinates(t: TreeRecord): CoordinatesInput {
  return {
    latitude: t.latitude,
    latitudeInputFormat: fmt(t.latitudeInputFormat),
    longitude: t.longitude,
    longitudeInputFormat: fmt(t.longitudeInputFormat),
  };
}

function toImportSiteInput(s: ImportSite): ImportSiteInput {
  return {
    id: s.id,
    name: s.name,
    // `ImportSiteInput.stateId` is non-null (finish-time validation gate,
    // see that interface's own doc comment); a still-draft site's
    // `state_id` can be null in the DB, but neither coordinate-cascade
    // function this file calls ever reads `stateId` -- 0 is a safe,
    // never-observed placeholder.
    stateId: s.stateId ?? 0,
    county: s.county,
    ownershipType: s.ownershipType,
    ownershipContactInfo: s.ownershipContactInfo,
    makeOwnershipContactInfoPublic: s.makeOwnershipContactInfoPublic,
    coordinates: siteCoordinates(s),
    comments: s.comments,
    photos: [],
  };
}

function toImportTreeInput(t: TreeRecord): ImportTreeInput {
  return {
    id: t.id,
    commonName: t.commonName,
    scientificName: t.scientificName,
    height: t.height,
    heightInputFormat: t.heightInputFormat,
    heightMeasurementMethod: t.heightMeasurementMethod,
    girth: t.girth,
    girthInputFormat: t.girthInputFormat,
    crownSpread: t.crownSpread,
    crownSpreadInputFormat: t.crownSpreadInputFormat,
    coordinates: treeCoordinates(t),
    elevation: t.elevation,
    elevationInputFormat: t.elevationInputFormat,
    generalComments: t.generalComments,
    photos: [],
  };
}

function siteMarkerJson(tripId: number, site: ImportSite, photoId: number | undefined): ImportMarkerJson {
  const c = siteCoordinates(site);
  return {
    Title: site.name,
    MinZoom: null,
    MaxZoom: null,
    Latitude: c.latitude,
    Longitude: c.longitude,
    InfoLoaderUrl: `/api/import/${tripId}/sites/${site.id}/info`,
    IconUrl: iconUrl(photoId, DEFAULT_SITE_ICON),
  };
}

function treeMarkerJson(tripId: number, tree: TreeRecord, photoId: number | undefined): ImportMarkerJson {
  const c = treeCoordinates(tree);
  return {
    Title: tree.scientificName,
    MinZoom: null,
    MaxZoom: null,
    Latitude: c.latitude,
    Longitude: c.longitude,
    InfoLoaderUrl: `/api/import/${tripId}/trees/${tree.id}/info`,
    IconUrl: iconUrl(photoId, DEFAULT_TREE_ICON),
  };
}

/** `Trip.CalculateCoordinates()`'s input: every site in the trip reduced to its own coordinates + its own trees' coordinates. */
function tripFallbackInput(sites: ImportSite[], treesBySite: Record<number, TreeRecord[]>): CoordinatesInput {
  const input: TripSiteCoordinatesInput[] = sites.map((s) => ({
    coordinates: siteCoordinates(s),
    treeCoordinates: (treesBySite[s.id] ?? []).map(treeCoordinates),
  }));
  return calculateTripFallbackCoordinates(input);
}

function withCalculatedCoordinates(markers: ImportMarkerJson[], calculated: CoordinatesInput): ImportMarkersPayload {
  const payload: ImportMarkersPayload = { Markers: markers };
  if (isCoordinatesValidAndSpecified(calculated)) {
    payload.CalculatedCoordinates = { Latitude: calculated.latitude, Longitude: calculated.longitude };
  }
  return payload;
}

/** Port of `MapController.ImportSiteMarkers(id, siteId)` -- see file header. */
export function buildImportSiteMarkers(
  data: ImportMarkersData,
  targetSiteId: number,
): ImportMarkersPayload | ImportMarkersError {
  const { tripId, sites, treesBySite, siteFirstPhotoId, treeFirstPhotoId } = data;
  const targetSite = sites.find((s) => s.id === targetSiteId);
  if (!targetSite) return "site-not-found";

  const markers: ImportMarkerJson[] = [];
  for (const site of sites) {
    if (site.id === targetSiteId) continue;
    if (!isCoordinatesValidAndSpecified(siteCoordinates(site))) continue;
    markers.push(siteMarkerJson(tripId, site, siteFirstPhotoId.get(site.id)));
  }
  for (const site of sites) {
    for (const tree of treesBySite[site.id] ?? []) {
      if (!isCoordinatesValidAndSpecified(treeCoordinates(tree))) continue;
      markers.push(treeMarkerJson(tripId, tree, treeFirstPhotoId.get(tree.id)));
    }
  }

  const tripFallback = tripFallbackInput(sites, treesBySite);
  const targetTrees = treesBySite[targetSiteId] ?? [];
  const calculated = calculateSiteCalculatedCoordinates(
    toImportSiteInput(targetSite),
    targetTrees.map(toImportTreeInput),
    tripFallback,
  );

  return withCalculatedCoordinates(markers, calculated);
}

/** Port of `MapController.ImportTreeMarkers(id, treeId)` -- see file header. */
export function buildImportTreeMarkers(
  data: ImportMarkersData,
  targetTreeId: number,
): ImportMarkersPayload | ImportMarkersError {
  const { tripId, sites, treesBySite, siteFirstPhotoId, treeFirstPhotoId } = data;

  let targetTree: TreeRecord | undefined;
  for (const list of Object.values(treesBySite)) {
    targetTree = list.find((t) => t.id === targetTreeId);
    if (targetTree) break;
  }
  if (!targetTree) return "tree-not-found";
  const targetSite = sites.find((s) => s.id === targetTree!.siteId);
  if (!targetSite) return "tree-not-found"; // defensive: FK integrity guarantees this in practice

  const markers: ImportMarkerJson[] = [];
  for (const site of sites) {
    if (!isCoordinatesValidAndSpecified(siteCoordinates(site))) continue;
    markers.push(siteMarkerJson(tripId, site, siteFirstPhotoId.get(site.id)));
  }
  for (const site of sites) {
    for (const tree of treesBySite[site.id] ?? []) {
      if (tree.id === targetTreeId) continue;
      if (!isCoordinatesValidAndSpecified(treeCoordinates(tree))) continue;
      markers.push(treeMarkerJson(tripId, tree, treeFirstPhotoId.get(tree.id)));
    }
  }

  const tripFallback = tripFallbackInput(sites, treesBySite);
  const siteTrees = treesBySite[targetSite.id] ?? [];
  const siteCalculated = calculateSiteCalculatedCoordinates(
    toImportSiteInput(targetSite),
    siteTrees.map(toImportTreeInput),
    tripFallback,
  );
  const calculated = calculateTreeCalculatedCoordinates(toImportTreeInput(targetTree), siteCalculated);

  return withCalculatedCoordinates(markers, calculated);
}
