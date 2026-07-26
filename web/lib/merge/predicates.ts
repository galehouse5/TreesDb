// Merge-matching predicates -- the exact port of `Site.ShouldMerge`
// (Site.cs:114-121), the `SiteRepository.ListByProximity` bounding-box query
// (SiteRepository.cs:40-49), and `Tree.ShouldMerge` (Tree.cs:112-123).
//
// These are pure predicates over flat, loosely-typed "candidate" shapes
// (`SiteMergeCandidate`/`TreeMergeCandidate` below) rather than over
// `SiteGraph`/`TreeGraph` from types.ts -- both a freshly-built graph (once
// its `headline` has been filled in by derived.ts) and an existing,
// already-persisted `sites`/`trees` DB row satisfy these shapes structurally,
// with no dependency on derived.ts or Drizzle. `findMergeCandidate`'s actual
// DB query (using `candidateBoundingBox` below to scope the WHERE clause,
// then iterating candidates ordered by `id` ascending per D-015 and calling
// `shouldMergeSite`) is the transactional orchestrator's job -- INTEGRATION
// POINT, not implemented here.

import { fround } from "../units/float32";
import { planarDistanceMinutes, roundTotalDegrees } from "../geo/coordinates";
import { type CoordinatesInput, coordinatesEqual, isCoordinatesSpecified } from "./types";

// ---------------------------------------------------------------------------
// Site matching (Site.cs:113-121, SiteRepository.cs:25-49)
// ---------------------------------------------------------------------------

/** `Site.CoordinateMinutesEquivalenceProximity` (Site.cs:113): 25 arc-minutes, both for the merge threshold and the candidate bounding box. */
export const SITE_COORDINATE_PROXIMITY_MINUTES = 25;

export interface SiteMergeCandidate {
  name: string;
  stateId: number;
  county: string;
  calculatedCoordinates: CoordinatesInput;
}

/**
 * `Site.ShouldMerge` (Site.cs:114-121): Name equal (OrdinalIgnoreCase) AND
 * State equal AND County equal (OrdinalIgnoreCase) AND planar distance
 * between `CalculatedCoordinates` <= 25 arc-minutes (legacy: `> 25` returns
 * false, i.e. exactly-25 merges, since the repository's bounding-box `Le`/`Ge`
 * comparisons are inclusive too -- see `candidateBoundingBox`).
 *
 * "OrdinalIgnoreCase" is transcribed as a plain `.toLowerCase()` compare,
 * matching the convention already used elsewhere in this codebase for
 * .NET `OrdinalIgnoreCase` ports (`lib/species-hash.ts`, `lib/account-flows.ts`,
 * `lib/crypto/password.ts`) -- correct for this app's ASCII site/county names.
 *
 * `State.Equals(otherSite.State)` is NHibernate entity equality, i.e. same
 * row/Id; transcribed as `stateId === stateId`.
 */
export function shouldMergeSite(
  existing: SiteMergeCandidate,
  incoming: SiteMergeCandidate,
): boolean {
  if (existing.name.toLowerCase() !== incoming.name.toLowerCase()) return false;
  if (existing.stateId !== incoming.stateId) return false;
  if (existing.county.toLowerCase() !== incoming.county.toLowerCase()) return false;

  const distanceMinutes = planarDistanceMinutes(
    existing.calculatedCoordinates.latitude,
    existing.calculatedCoordinates.longitude,
    incoming.calculatedCoordinates.latitude,
    incoming.calculatedCoordinates.longitude,
  );
  return distanceMinutes <= SITE_COORDINATE_PROXIMITY_MINUTES;
}

export interface BoundingBox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

/**
 * `Latitude.AddMinutes`/`SubtractMinutes` (Latitude.cs:158-176,
 * Longitude.cs:158-176): `TotalDegrees +/- (float)Math.Round(minutes / 60f, 5)`.
 * `minutes / 60f` is float32 division; `Math.Round(double, 5)` widens
 * implicitly and rounds half-to-even in double precision (same rounding
 * `roundTotalDegrees` implements, reused here); the round result narrows
 * back to float32 before the final float32 add/subtract.
 */
function degreesOffsetForMinutes(minutes: number): number {
  return roundTotalDegrees(fround(minutes / 60));
}

function addMinutesToDegrees(totalDegrees: number, minutes: number): number {
  return fround(totalDegrees + degreesOffsetForMinutes(minutes));
}

function subtractMinutesFromDegrees(totalDegrees: number, minutes: number): number {
  return fround(totalDegrees - degreesOffsetForMinutes(minutes));
}

/**
 * `SiteRepository.ListByProximity` (SiteRepository.cs:40-49): the candidate
 * bounding box is built directly from `CalculatedCoordinates.{Latitude,
 * Longitude}.{Add,Subtract}Minutes(minutesDistance)` -- an independent
 * per-axis +/- offset, NOT derived from `planarDistanceMinutes`'s circular
 * formula. Query comparisons are `Le`/`Ge` (inclusive), so a candidate
 * sitting exactly on the box edge is included; combined with
 * `shouldMergeSite`'s `<= 25` (also inclusive), a site at exactly 25' is
 * both selected as a candidate and matched.
 */
export function candidateBoundingBox(
  calculatedCoordinates: CoordinatesInput,
  minutesDistance: number = SITE_COORDINATE_PROXIMITY_MINUTES,
): BoundingBox {
  return {
    minLatitude: subtractMinutesFromDegrees(calculatedCoordinates.latitude, minutesDistance),
    maxLatitude: addMinutesToDegrees(calculatedCoordinates.latitude, minutesDistance),
    minLongitude: subtractMinutesFromDegrees(calculatedCoordinates.longitude, minutesDistance),
    maxLongitude: addMinutesToDegrees(calculatedCoordinates.longitude, minutesDistance),
  };
}

// ---------------------------------------------------------------------------
// Tree matching (Tree.cs:112-123)
// ---------------------------------------------------------------------------

export interface TreeMergeCandidate {
  commonName: string;
  scientificName: string;
  coordinates: CoordinatesInput;
}

/**
 * `Tree.ShouldMerge` (Tree.cs:112-123): CommonName equal (OrdinalIgnoreCase)
 * AND ScientificName equal (OrdinalIgnoreCase) AND both trees' `Coordinates`
 * specified AND `Coordinates.Equals` -- exact float32 `TotalDegrees`
 * equality per axis (`Coordinates.cs:75-79`, `Latitude/Longitude.cs:55-59`:
 * `this.TotalDegrees.Equals(other.TotalDegrees)`), NO epsilon/tolerance. A
 * single float32 ULP of difference on either axis fails the match.
 *
 * "Specified" (both the task brief's explicit question and Tree.cs:118):
 * `Coordinates.IsSpecified` = `Latitude.IsSpecified || Longitude.IsSpecified`
 * (an OR across axes), each axis specified iff its `InputFormat !=
 * Unspecified(1)` -- see `isCoordinatesSpecified` in types.ts. Note this is
 * NOT the stricter `IsValidAndSpecified` gate the import-side
 * `CalculateCoordinates` cascade uses (graph.ts) -- `ShouldMerge` never
 * checks for `Invalid(0)`.
 */
export function shouldMergeTree(
  existing: TreeMergeCandidate,
  incoming: TreeMergeCandidate,
): boolean {
  if (existing.commonName.toLowerCase() !== incoming.commonName.toLowerCase()) return false;
  if (existing.scientificName.toLowerCase() !== incoming.scientificName.toLowerCase()) return false;

  if (!isCoordinatesSpecified(existing.coordinates) || !isCoordinatesSpecified(incoming.coordinates)) {
    return false;
  }

  return coordinatesEqual(existing.coordinates, incoming.coordinates);
}

// ---------------------------------------------------------------------------
// Visitor/measurer dedup (documentation only -- see the callout below)
// ---------------------------------------------------------------------------

/**
 * NOT executed by this module. `Site.RecalculateProperties`
 * (Site.cs:68-71): `Visitors.RemoveAll().AddRange((from visit in Visits from
 * visitor in visit.Visitors select visitor).Distinct())` -- LINQ `Distinct()`
 * over `Name`, which uses `Name.Equals`/`GetHashCode`
 * (`TMD.Model/ValueObjects/Name.cs:68-83`): two `Name`s are equal iff
 * `FirstName` and `LastName` are equal by the default (ordinal,
 * case-SENSITIVE) `string.Equals` -- NOT `OrdinalIgnoreCase` like the
 * site/tree text-field predicates above. Since `Name.Create` always
 * title-cases both parts on the way in (`OrEmptyAndTrimToTitleCase`,
 * `Name.cs:58-59`) every `Name` that ever reaches a visit/measurement is
 * already normalized, so in practice this reduces to an exact
 * (first name, last name) pair match post-title-casing. The equivalent
 * `Tree.RecalculateProperties` dedup (Tree.cs:73-75) over `Measurers` uses
 * the identical `Name.Equals` rule. Both dedups are part of
 * `RecalculateProperties` and therefore owned by `web/lib/merge/derived.ts`,
 * not this file (see types.ts's `SiteHeadlineFieldsPlaceholder.visitors` /
 * `TreeHeadlineFieldsPlaceholder.measurers`).
 */
