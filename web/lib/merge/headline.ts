// `RecalculateProperties` port for the Phase 3 merge engine -- the
// integration point `types.ts`/`graph.ts` document as owned by this file:
// per-measurement derived numbers (wrapping `derived.ts`'s
// `calculateDerivedValues`) and the Tree/Site headline copy-down (wrapping
// `derived.ts`'s `recalculateTreeProperties` for trees; a from-scratch but
// structurally identical port for sites, since `derived.ts` only implements
// the Tree side -- see its header's "OWNERSHIP BOUNDARY" note, which is
// silent on Site.RecalculateProperties).
//
// Legacy sources (read in full before editing):
//   TMD.Model/Trees/Measurement.cs:122-131 (Measurement.RecalculateProperties)
//   TMD.Model/Trees/Tree.cs:53-78           (Tree.RecalculateProperties)
//   TMD.Model/Sites/Site.cs:39-73           (Site.LastVisit, Calculate
//     (Calculated)Coordinates, Site.RecalculateProperties)
//   TMD.Model/ValueObjects/Name.cs:68-83    (Name equality -- case-SENSITIVE,
//     see predicates.ts's dedup callout)
//
// This module is pure: no DB/Drizzle imports. `engine.ts` is responsible for
// mapping DB rows into the `*ForHeadline` input shapes below (both for a
// freshly-built `SiteGraph`'s in-memory measurements/visits AND for
// existing-tree/existing-site DB rows loaded during a merge) and for
// persisting the returned headline/derived-number fields -- hence
// `applyTreeHeadline`/`applySiteHeadline` accept plain arrays, not
// `TreeGraph`/`SiteGraph` directly ("graphOrRows" per doc 05 §P3-01).

import {
  calculateDerivedValues,
  type DerivedValueInput,
  lastMeasurementOf,
  type NameLike,
  recalculateTreeProperties,
  type RecalculatableMeasurement,
} from "./derived";
import {
  type CoordinatesInput,
  isCoordinatesSpecified,
  type MeasurementDerivedNumbers,
  type NameInput,
  nullCoordinates,
  type PhotoReferenceGraph,
  PhotoReferenceType,
  type PhotoReferenceTypeCode,
  type SiteHeadlineFields,
  type TreeHeadlineFields,
} from "./types";

function retypePhoto(photo: PhotoReferenceGraph, type: PhotoReferenceTypeCode): PhotoReferenceGraph {
  return { type, photoId: photo.photoId, caption: photo.caption };
}

/**
 * `measured`/`visited` are logically date-only values, but DB drivers
 * (postgres.js in production, PGlite in tests) parse a `date` column into a
 * JS `Date` at UTC midnight -- NOT a plain string. `String(aDate)` renders
 * that using the LOCAL timezone's calendar day (e.g. UTC midnight in a
 * negative-offset zone falls on the PREVIOUS local day) plus a
 * locale-formatted, non-ISO tail Postgres cannot parse back
 * ("Sun Jun 14 2020 20:00:00 GMT-0400 (Eastern Daylight Time)" for a stored
 * "2020-06-15"). Read the UTC calendar fields instead to recover the
 * original date regardless of the process's local timezone.
 */
function toDateOnlyString(value: string | number | Date): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// Tree side: applyTreeHeadline
// ---------------------------------------------------------------------------

/**
 * Everything needed, for one measurement, to (a) compute its own derived
 * numbers (`DerivedValueInput`'s four fields) and (b) fold it into the
 * tree-level headline (the rest). Deliberately a flat/plain shape (not
 * `MeasurementGraph` from types.ts) so this function works equally over a
 * freshly-built `SiteGraph`'s single new measurement and over existing
 * `tree_measurements` DB rows loaded by `engine.ts` during a merge --
 * "graphOrRows" per doc 05 §P3-01.
 */
export interface MeasurementForHeadline extends DerivedValueInput {
  /** `Measurement.Measured` (Tree.cs:40's sort key). */
  measured: string | number | Date;
  commonName: string;
  scientificName: string;
  heightMeasurementMethod: number;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  elevation: number;
  elevationInputFormat: number;
  /** Raw (undeduped) copy of the trip's measurers for this one measurement (Measurement.cs:156). */
  measurers: readonly NameLike[];
  /** Type 7 `TreeMeasurement` photos already re-typed by graph.ts's hop 1. */
  photos: readonly PhotoReferenceGraph[];
}

export interface TreeHeadlineResult {
  /** Parallel to the input array -- `derivedNumbers[i]` is `measurements[i]`'s own numbers. */
  derivedNumbers: MeasurementDerivedNumbers[];
  headline: TreeHeadlineFields;
}

function toDerivedNumbers(input: DerivedValueInput): MeasurementDerivedNumbers {
  const d = calculateDerivedValues(input);
  return {
    diameter: d.diameter.feet,
    diameterInputFormat: d.diameter.inputFormat,
    entspts: d.entspts,
    conicalVolume: d.conicalVolume.cubicFeet,
    conicalVolumeInputFormat: d.conicalVolume.inputFormat,
    entspts2: d.entspts2,
    championPoints: d.championPoints,
    abbreviatedChampionPoints: d.abbreviatedChampionPoints,
  };
}

/**
 * `Measurement.RecalculateProperties` (per-measurement derived numbers) +
 * `Tree.RecalculateProperties` (Tree.cs:53-78, headline copy-down from
 * `LastMeasurement` + the coordinate cascades + deduped Measurers +
 * MeasurementCount), for ALL of a tree's measurements at once (both a
 * brand-new tree's sole measurement, and an existing tree's full
 * measurement set with a newly-appended one -- `engine.ts` decides which).
 * Photo hop 2 (type 7 `TreeMeasurement` -> type 6 `Tree`, Tree.cs:71-72):
 * re-types the SAME measurement `lastMeasurementOf` (and therefore
 * `recalculateTreeProperties`) picks as "last", guaranteeing the two never
 * disagree on which measurement is authoritative.
 *
 * Throws if `measurements` is empty (matches `lastMeasurementOf`/
 * `Tree.LastMeasurement`'s `.Last()` throwing on an empty sequence).
 */
export function applyTreeHeadline(
  measurements: readonly MeasurementForHeadline[],
): TreeHeadlineResult {
  const derivedNumbers = measurements.map(toDerivedNumbers);

  const recalculatable: RecalculatableMeasurement[] = measurements.map((m, i) => {
    const dn = derivedNumbers[i]!;
    return {
      measured: m.measured,
      commonName: m.commonName,
      scientificName: m.scientificName,
      height: m.height,
      heightInputFormat: m.heightInputFormat,
      girth: m.girth,
      girthInputFormat: m.girthInputFormat,
      crownSpread: m.crownSpread,
      crownSpreadInputFormat: m.crownSpreadInputFormat,
      heightMeasurementMethod: m.heightMeasurementMethod,
      latitude: m.coordinates.latitude,
      latitudeInputFormat: m.coordinates.latitudeInputFormat,
      longitude: m.coordinates.longitude,
      longitudeInputFormat: m.coordinates.longitudeInputFormat,
      calculatedLatitude: m.calculatedCoordinates.latitude,
      calculatedLatitudeInputFormat: m.calculatedCoordinates.latitudeInputFormat,
      calculatedLongitude: m.calculatedCoordinates.longitude,
      calculatedLongitudeInputFormat: m.calculatedCoordinates.longitudeInputFormat,
      elevation: m.elevation,
      elevationInputFormat: m.elevationInputFormat,
      diameter: dn.diameter,
      diameterInputFormat: dn.diameterInputFormat,
      entspts: dn.entspts,
      conicalVolume: dn.conicalVolume,
      conicalVolumeInputFormat: dn.conicalVolumeInputFormat,
      entspts2: dn.entspts2,
      championPoints: dn.championPoints,
      abbreviatedChampionPoints: dn.abbreviatedChampionPoints,
      measurers: m.measurers,
    };
  });

  const th = recalculateTreeProperties(recalculatable);

  // Same stable-sort-by-Measured, last-element tie-break as
  // recalculateTreeProperties's internal lastMeasurementOf call -- reusing
  // the exported function (rather than re-deriving the index some other
  // way) guarantees this always agrees with `th`'s own choice of "last".
  const lastWrapped = lastMeasurementOf(
    measurements.map((m, index) => ({ measured: m.measured, index })),
  );
  const lastPhotos = measurements[lastWrapped.index]!.photos;

  return {
    derivedNumbers,
    headline: {
      lastMeasured: toDateOnlyString(th.lastMeasured),
      commonName: th.commonName,
      scientificName: th.scientificName,
      height: th.height,
      heightInputFormat: th.heightInputFormat,
      heightMeasurementMethod: th.heightMeasurementMethod,
      girth: th.girth,
      girthInputFormat: th.girthInputFormat,
      crownSpread: th.crownSpread,
      crownSpreadInputFormat: th.crownSpreadInputFormat,
      coordinates: {
        latitude: th.latitude,
        latitudeInputFormat: th.latitudeInputFormat as CoordinatesInput["latitudeInputFormat"],
        longitude: th.longitude,
        longitudeInputFormat: th.longitudeInputFormat as CoordinatesInput["longitudeInputFormat"],
      },
      calculatedCoordinates: {
        latitude: th.calculatedLatitude,
        latitudeInputFormat: th.calculatedLatitudeInputFormat as CoordinatesInput["latitudeInputFormat"],
        longitude: th.calculatedLongitude,
        longitudeInputFormat: th.calculatedLongitudeInputFormat as CoordinatesInput["longitudeInputFormat"],
      },
      elevation: th.elevation,
      elevationInputFormat: th.elevationInputFormat,
      diameter: th.diameter,
      diameterInputFormat: th.diameterInputFormat,
      entspts: th.entspts,
      conicalVolume: th.conicalVolume,
      conicalVolumeInputFormat: th.conicalVolumeInputFormat,
      entspts2: th.entspts2,
      championPoints: th.championPoints,
      abbreviatedChampionPoints: th.abbreviatedChampionPoints,
      photos: lastPhotos.map((p) => retypePhoto(p, PhotoReferenceType.Tree)),
      measurers: th.measurers,
      measurementCount: th.measurementCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Site side: applySiteHeadline
// ---------------------------------------------------------------------------

export interface VisitForHeadline {
  /** `SiteVisit.Visited` (Site.cs:39-43's sort key). */
  visited: string | number | Date;
  ownershipType: string;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  /** Raw (undeduped) copy of the trip's measurers for this one visit (SiteVisit.cs:53). */
  visitors: readonly NameInput[];
  /** Type 5 `SiteVisit` photos already re-typed by graph.ts's hop 1. */
  photos: readonly PhotoReferenceGraph[];
}

/**
 * `Site.CalculateCoordinates`/`CalculateCalculatedCoordinates` (Site.cs:
 * 45-57): identical shape to `Tree.CalculateCoordinates` (derived.ts) but
 * over visits -- stable-sort ascending by `Visited`, walk from the end,
 * return the first (chronologically last) visit whose coordinates are
 * specified; `Coordinates.Null()` if none. Not reused from derived.ts
 * because that module's version is hard-coupled to `RecalculatableMeasurement`'s
 * flat `latitudeInputFormat`-style field names, whereas visits carry a
 * nested `coordinates`/`calculatedCoordinates` pair (matching
 * `SiteVisitGraph`'s shape) -- small enough to duplicate the ~10-line
 * pattern rather than reshape one side to fit the other.
 */
function calculateSiteCoordinates<K extends "coordinates" | "calculatedCoordinates">(
  visits: readonly VisitForHeadline[],
  key: K,
): CoordinatesInput {
  const sorted = visits
    .map((v, index) => ({ v, index }))
    .sort((a, b) => {
      const diff = new Date(a.v.visited).getTime() - new Date(b.v.visited).getTime();
      return diff !== 0 ? diff : a.index - b.index;
    })
    .map((x) => x.v);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const c = sorted[i]![key];
    if (isCoordinatesSpecified(c)) return c;
  }
  return nullCoordinates();
}

/**
 * `Site.LastVisit` (Site.cs:39-43): stable-sort ascending by `Visited`, take
 * the last element -- identical tie-break shape to `Tree.LastMeasurement`
 * (ties broken by original array order, NOT re-sorted by Id). Reuses
 * `derived.ts`'s `lastMeasurementOf` via a `{measured: visited}` wrapper so
 * the exact same stable-sort/tie-break logic backs both Tree and Site
 * "last" semantics -- not re-derived here.
 */
function lastVisitIndex(visits: readonly VisitForHeadline[]): number {
  const wrapped = lastMeasurementOf(
    visits.map((v, index) => ({ measured: v.visited, index })),
  );
  return wrapped.index;
}

/**
 * `Site.RecalculateProperties`'s Visitors dedup (Site.cs:68-71):
 * `Visits.SelectMany(v => v.Visitors).Distinct()` -- iterates visits in
 * their given (array) order, then each visit's visitors in their given
 * order; `Distinct()` keeps first occurrence. `Name` equality is exact
 * (case-SENSITIVE) FirstName+LastName match (Name.cs:68-83) -- see
 * predicates.ts's dedup callout. Structurally identical to derived.ts's
 * `dedupMeasurers`, duplicated here (site Visitors vs tree Measurers are
 * different bags in the legacy model) rather than sharing one generic
 * helper across the ownership boundary.
 */
function dedupVisitors(visits: readonly VisitForHeadline[]): NameInput[] {
  const seen = new Set<string>();
  const result: NameInput[] = [];
  for (const v of visits) {
    for (const visitor of v.visitors) {
      const key = `${visitor.firstName} ${visitor.lastName}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(visitor);
      }
    }
  }
  return result;
}

/**
 * `Site.RecalculateProperties` (Site.cs:59-73): OwnershipType/
 * OwnershipContactInfo/MakeOwnershipContactInfoPublic copied from
 * `LastVisit`; Coordinates/CalculatedCoordinates from the full
 * `CalculateCoordinates`/`CalculateCalculatedCoordinates` cascade over ALL
 * visits (NOT just the last one -- same "OR, not just LastVisit" shape as
 * the Tree side); Photos re-typed (type 5 -> type 4) from ONLY the last
 * visit's photos; VisitCount = `visits.length`; Visitors deduped across ALL
 * visits. Called with a brand-new site's sole visit, or an existing site's
 * full visit set plus a newly-appended one -- `engine.ts` decides which.
 *
 * Throws if `visits` is empty (matches `Site.LastVisit`'s `.Last()`
 * throwing on an empty sequence, via `lastMeasurementOf`).
 */
export function applySiteHeadline(
  visits: readonly VisitForHeadline[],
): SiteHeadlineFields {
  const last = visits[lastVisitIndex(visits)];
  if (!last) {
    throw new Error(
      "applySiteHeadline: visits must be non-empty (Site.cs:39-43's `.Last()` throws InvalidOperationException on an empty sequence)",
    );
  }

  return {
    ownershipType: last.ownershipType,
    coordinates: calculateSiteCoordinates(visits, "coordinates"),
    calculatedCoordinates: calculateSiteCoordinates(visits, "calculatedCoordinates"),
    ownershipContactInfo: last.ownershipContactInfo,
    makeOwnershipContactInfoPublic: last.makeOwnershipContactInfoPublic,
    photos: last.photos.map((p) => retypePhoto(p, PhotoReferenceType.Site)),
    visitCount: visits.length,
    visitors: dedupVisitors(visits),
  };
}
