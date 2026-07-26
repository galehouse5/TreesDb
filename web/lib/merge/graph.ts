// Domain-graph construction for the Phase 3 merge engine -- the exact port
// of `Site.Create` / `SiteVisit.Create` / `Tree.Create` / `Measurement.Create`
// (doc 01 §10 step 1).
//
// Legacy sources (read in full before editing):
//   TMD.Model/Sites/Site.cs:144-163        (Site.Create)
//   TMD.Model/Sites/SiteVisit.cs:35-58     (SiteVisit.Create)
//   TMD.Model/Trees/Tree.cs:125-136        (Tree.Create)
//   TMD.Model/Trees/Measurement.cs:138-160 (Measurement.Create)
//   TMD.Model/Imports/Site.cs:49-69        (Site.CanCalculateCoordinates/CalculateCoordinates)
//   TMD.Model/Imports/TreeBase.cs:122-132  (TreeBase.CanCalculateCoordinates/CalculateCoordinates)
//   TMD.Model/Imports/Trip.cs:75-85        (Trip.CanCalculateCoordinates/CalculateCoordinates)
//   TMD.Model/ValueObjects/CoordinateBounds.cs (Extend/Center, the averaging
//     engine both the Site- and Trip-level fallbacks share)
//
// OWNERSHIP BOUNDARY: this file does NOT compute `RecalculateProperties`
// (Tree/Site headline copy-down) or the per-measurement derived numbers
// (Diameter/ENTSPTS/ENTSPTS2/ChampionPoints/AbbreviatedChampionPoints/
// ConicalVolume) -- see types.ts's header comment. Both are always left
// `null` here; that is the documented integration point for
// `web/lib/merge/derived.ts` (owned by a parallel task).
//
// PHOTO RE-TYPING (doc 01 §2 `Photos.References.Type`, §11): every photo
// reference is re-typed twice as an import cascades into the canonical
// domain. This file implements only the FIRST hop (the second belongs to
// the RecalculateProperties cascade, i.e. derived.ts):
//
//   | Source (import)              | Hop 1 (this file)                | Hop 2 (derived.ts, RecalculateProperties)     |
//   |-------------------------------|-----------------------------------|------------------------------------------------|
//   | type 2 `ImportSite` photo     | -> type 5 `SiteVisit` photo        | -> type 4 `Site` photo (from `LastVisit.Photos`) |
//   | (`SiteVisit.Create`, SiteVisit.cs:56)                              | (`Site.RecalculateProperties`, Site.cs:66)     |
//   | type 3 `ImportTree` photo     | -> type 7 `TreeMeasurement` photo  | -> type 6 `Tree` photo (from `LastMeasurement.Photos`) |
//   | (`Measurement.Create`, Measurement.cs:158)                         | (`Tree.RecalculateProperties`, Tree.cs:71-72)  |

import { fround } from "../units/float32";
import {
  type CoordinatesFormatCode,
  type CoordinatesInput,
  coordinatesInputFormat,
  type ImportPhotoInput,
  type ImportSiteInput,
  type ImportTreeInput,
  type ImportTripContext,
  isCoordinatesSpecified,
  isCoordinatesValidAndSpecified,
  type MeasurementGraph,
  nullCoordinates,
  type PhotoReferenceGraph,
  PhotoReferenceType,
  type PhotoReferenceTypeCode,
  type SiteGraph,
  type SiteVisitGraph,
  type TreeGraph,
  type TripSiteCoordinatesInput,
} from "./types";

// ---------------------------------------------------------------------------
// CoordinateBounds port (CoordinateBounds.cs) -- the min/max/center engine
// shared by both the site-level ("this site's own trees") and trip-level
// ("this trip's other sites") coordinate fallback tiers.
// ---------------------------------------------------------------------------

interface BoundsAccumulator {
  north: number;
  east: number;
  south: number;
  west: number;
  /** `lastExtensionCoordinatesFormat` (CoordinateBounds.cs:15,73): overwritten on every successful `Extend`, so the LAST valid+specified coordinate in iteration order wins -- not re-sorted. */
  format: CoordinatesFormatCode;
}

/**
 * `(hi + (hi < lo ? 360 : 0) - lo) / 2 + lo` (CoordinateBounds.cs:104-107),
 * float32 per operation (the C# fields are `float`). Used for both the
 * latitude (north/south) and longitude (east/west) axes -- same formula
 * shape, different operand pair.
 */
function circularCenter(hi: number, lo: number): number {
  const wrap = hi < lo ? 360 : 0;
  const step1 = fround(hi + wrap);
  const step2 = fround(step1 - lo);
  const step3 = fround(step2 / 2);
  return fround(step3 + lo);
}

/**
 * `CoordinateBounds.Create(coords).Center` (CoordinateBounds.cs:161-169,
 * 92-117): folds `Extend` (gated on `IsValidAndSpecified`, CoordinateBounds.cs:71)
 * over every candidate, then returns the resulting box's center, or
 * `Coordinates.Null()` if nothing ever extended the box.
 */
function coordinateBoundsCenter(coords: CoordinatesInput[]): CoordinatesInput {
  let acc: BoundsAccumulator | null = null;
  for (const c of coords) {
    if (!isCoordinatesValidAndSpecified(c)) continue;
    const format = coordinatesInputFormat(c);
    acc =
      acc === null
        ? { north: c.latitude, east: c.longitude, south: c.latitude, west: c.longitude, format }
        : {
            north: Math.max(c.latitude, acc.north),
            east: Math.max(c.longitude, acc.east),
            south: Math.min(c.latitude, acc.south),
            west: Math.min(c.longitude, acc.west),
            format,
          };
  }
  if (acc === null) return nullCoordinates();
  return {
    latitude: circularCenter(acc.north, acc.south),
    latitudeInputFormat: acc.format,
    longitude: circularCenter(acc.east, acc.west),
    longitudeInputFormat: acc.format,
  };
}

// ---------------------------------------------------------------------------
// Import-side CalculateCoordinates cascade (Imports/{Site,TreeBase,Trip}.cs).
// ---------------------------------------------------------------------------

/**
 * `Site.CalculateCoordinates(ignoreContainingTrip=true)` /
 * `Trip.CalculateCoordinates`'s per-site term (Imports/Site.cs:57-69, used
 * with `ignoreContainingTrip=true` so it never recurses into the trip
 * fallback): own coordinates if valid+specified, else the center of this
 * site's trees' own coordinates, else `Null()`.
 */
function calculateSiteOwnCoordinates(
  coordinates: CoordinatesInput,
  treeCoordinates: CoordinatesInput[],
): CoordinatesInput {
  if (isCoordinatesValidAndSpecified(coordinates)) return coordinates;
  return coordinateBoundsCenter(treeCoordinates);
}

/**
 * `Trip.CalculateCoordinates()` (Imports/Trip.cs:80-85): the center across
 * every site in the trip, each reduced via `calculateSiteOwnCoordinates`
 * (i.e. `ignoreContainingTrip=true` per site -- sites that can't calculate
 * anything on their own contribute `Null()`, which `coordinateBoundsCenter`
 * skips, matching legacy's `.Where(s => s.CanCalculateCoordinates(true))`
 * pre-filter exactly).
 *
 * Exported so an orchestrator can compute this once per trip (over ALL its
 * sites) and pass the result into every per-site `buildSiteGraph` call via
 * `otherSitesInTrip` / directly as the fallback; including the site
 * currently being built in the input list is harmless (see `buildSiteGraph`).
 */
export function calculateTripFallbackCoordinates(
  sites: TripSiteCoordinatesInput[],
): CoordinatesInput {
  const perSite = sites.map((s) => calculateSiteOwnCoordinates(s.coordinates, s.treeCoordinates));
  return coordinateBoundsCenter(perSite);
}

/**
 * `Site.CalculateCoordinates(ignoreContainingTrip=false)` (Imports/Site.cs:
 * 57-69, the full cascade `SiteVisit.Create` actually calls): own
 * coordinates, else own trees' bounds, else the trip-wide fallback.
 *
 * Exported (task P3-09, doc 05 §P3-09) for reuse by `lib/import-markers.ts`:
 * `MapController.ImportSiteMarkers`/`ImportTreeMarkers`
 * (`TMD/Controllers/MapController.cs:70-113`) compute `CalculatedCoordinates`
 * via this exact same cascade (`trip.FindSiteById(siteId).
 * CalculateCoordinates()`) at request time, from the still-in-progress draft
 * rows -- there is no persisted `calculated_latitude`/`calculated_longitude`
 * column on `import_sites`/`import_trees` to read instead (unlike the
 * canonical `sites`/`trees` tables). Additive export only, no behavior
 * change.
 */
export function calculateSiteCalculatedCoordinates(
  site: ImportSiteInput,
  trees: ImportTreeInput[],
  tripFallbackCoordinates: CoordinatesInput,
): CoordinatesInput {
  const own = calculateSiteOwnCoordinates(
    site.coordinates,
    trees.map((t) => t.coordinates),
  );
  return isCoordinatesSpecified(own) ? own : tripFallbackCoordinates;
}

/**
 * `TreeBase.CalculateCoordinates(ignoreContainingSite=false)`
 * (Imports/TreeBase.cs:127-132, the cascade `Measurement.Create` calls):
 * own coordinates if valid+specified, else the containing site's calculated
 * coordinates (which already encodes its own full cascade, so no separate
 * `CanCalculateCoordinates` gate is needed here -- if the site cascade
 * bottomed out, `siteCalculatedCoordinates` is already `Coordinates.Null()`).
 *
 * Exported for `lib/import-markers.ts` -- see `calculateSiteCalculatedCoordinates`'s export note.
 */
export function calculateTreeCalculatedCoordinates(
  tree: ImportTreeInput,
  siteCalculatedCoordinates: CoordinatesInput,
): CoordinatesInput {
  if (isCoordinatesValidAndSpecified(tree.coordinates)) return tree.coordinates;
  return siteCalculatedCoordinates;
}

// ---------------------------------------------------------------------------
// Photo re-typing (hop 1 only -- see header comment).
// ---------------------------------------------------------------------------

function retypePhoto(photo: ImportPhotoInput, type: PhotoReferenceTypeCode): PhotoReferenceGraph {
  return { type, photoId: photo.photoId, caption: photo.caption };
}

// ---------------------------------------------------------------------------
// buildSiteGraph
// ---------------------------------------------------------------------------

/**
 * `Tree.Create(importedTree)` + its sole `Measurement.Create(importedTree)`
 * (Tree.cs:125-136, Measurement.cs:138-160). Headline/derived-number fields
 * are left `null` -- integration point for derived.ts.
 */
function buildTreeGraph(
  importTree: ImportTreeInput,
  siteCalculatedCoordinates: CoordinatesInput,
  trip: ImportTripContext,
): TreeGraph {
  const calculatedCoordinates = calculateTreeCalculatedCoordinates(
    importTree,
    siteCalculatedCoordinates,
  );

  // Measurement.cs:146: `importedTree.ScientificName.NullIfEmpty() ?? "(Unidentified)"`.
  // `NullIfEmpty` is `string.IsNullOrEmpty` (Extensions/StringExtensions.cs:13)
  // -- null-or-empty-string, NOT whitespace. The import-side setter
  // (`TreeBase.ScientificName`, TreeBase.cs:111-117) already runs
  // `OrEmptyAndTrimToSentenceCase`, so a whitespace-only entry is already
  // normalized to `""` by the time it reaches storage; testing for exact
  // `""` here is therefore equivalent to legacy's `IsNullOrEmpty` in
  // practice, and exactly what legacy does formally.
  const scientificName =
    importTree.scientificName === "" ? "(Unidentified)" : importTree.scientificName;

  const measurement: MeasurementGraph = {
    sourceImportTreeId: importTree.id,
    measured: trip.date,
    commonName: importTree.commonName,
    scientificName,
    height: importTree.height,
    heightInputFormat: importTree.heightInputFormat,
    heightMeasurementMethod: importTree.heightMeasurementMethod,
    girth: importTree.girth,
    girthInputFormat: importTree.girthInputFormat,
    crownSpread: importTree.crownSpread,
    crownSpreadInputFormat: importTree.crownSpreadInputFormat,
    coordinates: importTree.coordinates,
    calculatedCoordinates,
    elevation: importTree.elevation,
    elevationInputFormat: importTree.elevationInputFormat,
    generalComments: importTree.generalComments,
    // Measurement.cs:156: `new List<Name>(importedTree.Site.Trip.Measurers)` -- a
    // straight copy, not deduped (dedup only happens later, at
    // `Tree.RecalculateProperties`, over ALL of a tree's measurements --
    // derived.ts's job).
    measurers: [...trip.measurers],
    // Measurement.cs:158: import type 3 -> TreeMeasurement type 7.
    photos: importTree.photos.map((p) => retypePhoto(p, PhotoReferenceType.TreeMeasurement)),
    derivedNumbers: null,
  };

  return {
    sourceImportTreeId: importTree.id,
    measurements: [measurement],
    headline: null,
  };
}

/**
 * `Site.Create(importedSite)` (Site.cs:144-163): one `SiteVisit.Create`
 * (SiteVisit.cs:35-58) plus one `Tree.Create` per import tree
 * (Tree.cs:125-136). Headline fields (`RecalculateProperties`) are left
 * `null` -- integration point for derived.ts.
 *
 * `otherSitesInTrip` feeds the last-resort trip-wide coordinate fallback
 * (`Trip.CalculateCoordinates`, only reached when this site has neither its
 * own coordinates nor any tree with its own coordinates); it may include
 * this same site's data (harmless -- see `calculateTripFallbackCoordinates`)
 * and defaults to `[]` (trip fallback then resolves to `Coordinates.Null()`,
 * same as legacy when a trip's sites collectively have no coordinates at
 * all).
 */
export function buildSiteGraph(
  importSite: ImportSiteInput,
  importTrees: ImportTreeInput[],
  trip: ImportTripContext,
  otherSitesInTrip: TripSiteCoordinatesInput[] = [],
): SiteGraph {
  const tripFallbackCoordinates = calculateTripFallbackCoordinates(otherSitesInTrip);
  const siteCalculatedCoordinates = calculateSiteCalculatedCoordinates(
    importSite,
    importTrees,
    tripFallbackCoordinates,
  );

  const visit: SiteVisitGraph = {
    visited: trip.date,
    name: importSite.name,
    stateId: importSite.stateId,
    county: importSite.county,
    ownershipType: importSite.ownershipType,
    ownershipContactInfo: importSite.ownershipContactInfo,
    makeOwnershipContactInfoPublic: importSite.makeOwnershipContactInfoPublic,
    coordinates: importSite.coordinates,
    calculatedCoordinates: siteCalculatedCoordinates,
    comments: importSite.comments,
    // SiteVisit.cs:53: `new List<Name>(importedSite.Trip.Measurers)` -- straight
    // copy, not deduped (dedup is `Site.RecalculateProperties`, derived.ts's job).
    visitors: [...trip.measurers],
    tripReportUrl: trip.website,
    // SiteVisit.cs:56: import type 2 -> SiteVisit type 5.
    photos: importSite.photos.map((p) => retypePhoto(p, PhotoReferenceType.SiteVisit)),
  };

  const trees = importTrees.map((importTree) =>
    buildTreeGraph(importTree, siteCalculatedCoordinates, trip),
  );

  return {
    sourceImportSiteId: importSite.id,
    name: importSite.name,
    stateId: importSite.stateId,
    county: importSite.county,
    visits: [visit],
    trees,
    headline: null,
  };
}
