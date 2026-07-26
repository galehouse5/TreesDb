/**
 * `markers` category comparator (doc 07 §5.2) - pure, no I/O. Covers both
 * `/Map/AllMarkers` and the per-entity `/Map/{id}/{Tree,Site}Marker`
 * endpoints, which share the identical `{Markers: [...]}` response shape
 * (confirmed against the committed snapshots - a single-marker response is
 * just a one-element `Markers` array).
 *
 * Rules:
 *  - key-order-insensitive (handled naturally - this compares parsed
 *    objects, not raw JSON text).
 *  - numbers compared as float32.
 *  - `Markers` array compared order-INsensitively, keyed by
 *    (Title, Latitude, Longitude) - waiver W-004, predeclared.
 *  - `InfoLoaderUrl` compared via route-shape mapping (url-resolve.ts's
 *    query-id marker-info mapping); `IconUrl` compared by pathname only
 *    (static asset path; legacy appends an incidental `?v=` cache-buster
 *    query on some icons that the new app has no reason to reproduce).
 */
import type { Diff } from "../data/comparator";
import { isD016WhitespaceCollapseEqual } from "../data/waivers";
import { floatEquals } from "../normalize";
import { pathnameOnly } from "./deep-compare";
import { makeDiff } from "./diff-helpers";
import { markerInfoLoaderUrlEquivalent } from "./url-resolve";

export interface MarkerObj {
  Title: string;
  MinZoom: number;
  MaxZoom: number;
  Latitude: number;
  Longitude: number;
  InfoLoaderUrl: string;
  IconUrl: string;
}

export interface MarkersResponse {
  Markers: MarkerObj[];
}

export interface MarkersCompareResult {
  diffs: Diff[];
  checksRun: number;
}

function isMarkersResponse(v: unknown): v is MarkersResponse {
  return typeof v === "object" && v !== null && Array.isArray((v as { Markers?: unknown }).Markers);
}

/** W-004 key: (Title, Latitude, Longitude), float32-coerced coordinates. */
function markerKey(m: MarkerObj): string {
  return `${m.Title}||${Math.fround(m.Latitude)}||${Math.fround(m.Longitude)}`;
}

function bucketByKey(markers: MarkerObj[]): Map<string, MarkerObj[]> {
  const map = new Map<string, MarkerObj[]>();
  for (const m of markers) {
    const k = markerKey(m);
    const bucket = map.get(k);
    if (bucket) bucket.push(m);
    else map.set(k, [m]);
  }
  return map;
}

function compareMatchedFields(label: string, legacy: MarkerObj, next: MarkerObj, diffs: Diff[]): void {
  if (!floatEquals(legacy.MinZoom, next.MinZoom)) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "MinZoom",
        expected: legacy.MinZoom,
        actual: next.MinZoom,
        message: `${label} marker "${legacy.Title}": MinZoom mismatch - expected ${legacy.MinZoom}, got ${next.MinZoom}`,
      }),
    );
  }
  if (!floatEquals(legacy.MaxZoom, next.MaxZoom)) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "MaxZoom",
        expected: legacy.MaxZoom,
        actual: next.MaxZoom,
        message: `${label} marker "${legacy.Title}": MaxZoom mismatch - expected ${legacy.MaxZoom}, got ${next.MaxZoom}`,
      }),
    );
  }
  if (!markerInfoLoaderUrlEquivalent(legacy.InfoLoaderUrl, next.InfoLoaderUrl)) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "InfoLoaderUrl",
        expected: legacy.InfoLoaderUrl,
        actual: next.InfoLoaderUrl,
        message: `${label} marker "${legacy.Title}": InfoLoaderUrl not route-equivalent - legacy ${JSON.stringify(legacy.InfoLoaderUrl)}, new ${JSON.stringify(next.InfoLoaderUrl)}`,
      }),
    );
  }
  if (pathnameOnly(legacy.IconUrl) !== pathnameOnly(next.IconUrl)) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "IconUrl",
        expected: legacy.IconUrl,
        actual: next.IconUrl,
        message: `${label} marker "${legacy.Title}": IconUrl pathname mismatch - legacy ${JSON.stringify(legacy.IconUrl)}, new ${JSON.stringify(next.IconUrl)}`,
      }),
    );
  }
}

/** A marker that found no exact-key (Title, Latitude, Longitude) match, carried alongside its optional tie-ambiguity note for the eventual "missing/extra" diff message - see `compareTiedGroup`. */
interface UnmatchedMarker {
  marker: MarkerObj;
  tieNote: string;
}

/**
 * BUGFIX (surfaced by the P1-15 sweep): a tied `(Title, Latitude,
 * Longitude)` group (multiple distinct trees sharing an identical species
 * title at the exact same float32-rounded coordinate - e.g. multi-trunk
 * imports) previously had its members zipped by ARRAY INDEX within the
 * group. Since W-004 already establishes that order is not meaningful
 * (neither across the whole `Markers` array nor, by the same logic, within
 * a tied sub-group), index-zipping silently cross-paired distinct tree ids
 * that both legacy and new emitted in a different internal order - e.g.
 * legacy [23989, 23988] vs new [23988, 23989] reported as two false
 * InfoLoaderUrl mismatches even though the SET of trees at that key was
 * identical. Fixed by finding a structural (all-fields-equal) match for
 * each legacy marker among the still-unmatched new markers in the group,
 * instead of assuming position i on one side corresponds to position i on
 * the other. Only genuine content differences (wrong id set, wrong
 * MinZoom/MaxZoom/IconUrl) still produce a diff.
 *
 * Markers with no structural match are NOT immediately turned into
 * missing/extra diffs here - they're collected into `unmatchedLegacy`/
 * `unmatchedNew` instead, so `compareMarkers` can run the W-010 title-
 * rename rescue (below) across the FULL unmatched set before anything is
 * finalized as a genuine diff.
 */
function compareTiedGroup(
  label: string,
  legacyGroup: MarkerObj[],
  nextGroup: MarkerObj[],
  diffs: Diff[],
  unmatchedLegacy: UnmatchedMarker[],
  unmatchedNew: UnmatchedMarker[],
): void {
  if (legacyGroup.length === 1 && nextGroup.length === 1) {
    compareMatchedFields(label, legacyGroup[0]!, nextGroup[0]!, diffs);
    return;
  }

  const usedNext = new Set<number>();
  for (const lm of legacyGroup) {
    let matchedIdx = -1;
    for (let j = 0; j < nextGroup.length; j++) {
      if (usedNext.has(j)) continue;
      const nm = nextGroup[j]!;
      if (
        floatEquals(lm.MinZoom, nm.MinZoom) &&
        floatEquals(lm.MaxZoom, nm.MaxZoom) &&
        markerInfoLoaderUrlEquivalent(lm.InfoLoaderUrl, nm.InfoLoaderUrl) &&
        pathnameOnly(lm.IconUrl) === pathnameOnly(nm.IconUrl)
      ) {
        matchedIdx = j;
        break;
      }
    }
    if (matchedIdx === -1) {
      const tieNote = nextGroup.length > 1 ? ` (no structural match among ${nextGroup.length} tied candidates)` : "";
      unmatchedLegacy.push({ marker: lm, tieNote });
    } else {
      usedNext.add(matchedIdx);
    }
  }
  for (let j = 0; j < nextGroup.length; j++) {
    if (usedNext.has(j)) continue;
    const nm = nextGroup[j]!;
    const tieNote = legacyGroup.length > 1 ? ` (no structural match among ${legacyGroup.length} tied candidates)` : "";
    unmatchedNew.push({ marker: nm, tieNote });
  }
}

/**
 * W-010 (D-016 species whitespace-duplicate cleanup, waivers.md's entry,
 * prong 1's marker clause): the D-016 rename of "Quercus  x mutabilis" ->
 * "Quercus x mutabilis" changes the Title half of the W-004 (Title,
 * Latitude, Longitude) key, so the exact-key bucketing above leaves the
 * legacy and new markers for the SAME tree unmatched (surfaced as a false
 * "present in legacy but missing from new" + "present in new but not in
 * legacy" pair at identical coordinates). Rescues any unmatched legacy/new
 * marker pair that agrees exactly on (Latitude, Longitude) - float32,
 * matching the key's own coordinate comparison - and whose Titles are
 * whitespace-collapse-equal (data/waivers.ts's `isD016WhitespaceCollapseEqual`).
 * Pairwise-unambiguous: a candidate pair is rescued ONLY when it's the
 * unique qualifying match on BOTH sides - if two+ unmatched markers share a
 * coordinate, none of them are guessed at, and they fall through to the
 * normal missing/extra diffs below. Rescued pairs are treated as MATCHED
 * (no diff for the pairing itself, per the waiver text) and run through the
 * ordinary field-by-field comparison, so a genuine remaining difference
 * (MinZoom, IconUrl, ...) still surfaces normally.
 */
function rescueRenamedTitleMatches(
  label: string,
  unmatchedLegacy: UnmatchedMarker[],
  unmatchedNew: UnmatchedMarker[],
  diffs: Diff[],
): { rescuedLegacy: Set<number>; rescuedNew: Set<number> } {
  const candidates: { i: number; j: number }[] = [];
  for (let i = 0; i < unmatchedLegacy.length; i++) {
    const lm = unmatchedLegacy[i]!.marker;
    for (let j = 0; j < unmatchedNew.length; j++) {
      const nm = unmatchedNew[j]!.marker;
      if (
        Math.fround(lm.Latitude) === Math.fround(nm.Latitude) &&
        Math.fround(lm.Longitude) === Math.fround(nm.Longitude) &&
        isD016WhitespaceCollapseEqual(lm.Title, nm.Title)
      ) {
        candidates.push({ i, j });
      }
    }
  }

  const legacyCandidateCount = new Map<number, number>();
  const newCandidateCount = new Map<number, number>();
  for (const c of candidates) {
    legacyCandidateCount.set(c.i, (legacyCandidateCount.get(c.i) ?? 0) + 1);
    newCandidateCount.set(c.j, (newCandidateCount.get(c.j) ?? 0) + 1);
  }

  const rescuedLegacy = new Set<number>();
  const rescuedNew = new Set<number>();
  for (const c of candidates) {
    if (legacyCandidateCount.get(c.i) !== 1 || newCandidateCount.get(c.j) !== 1) continue; // ambiguous on at least one side - leave unrescued
    rescuedLegacy.add(c.i);
    rescuedNew.add(c.j);
    compareMatchedFields(label, unmatchedLegacy[c.i]!.marker, unmatchedNew[c.j]!.marker, diffs);
  }
  return { rescuedLegacy, rescuedNew };
}

export function compareMarkers(label: string, legacy: unknown, next: unknown): MarkersCompareResult {
  const diffs: Diff[] = [];

  if (!isMarkersResponse(legacy) || !isMarkersResponse(next)) {
    diffs.push(
      makeDiff({
        artifact: label,
        message: `${label}: expected both sides to be a {"Markers": [...]} object - legacy ${isMarkersResponse(legacy) ? "ok" : "malformed"}, new ${isMarkersResponse(next) ? "ok" : "malformed"}`,
      }),
    );
    return { diffs, checksRun: 1 };
  }

  const legacyBuckets = bucketByKey(legacy.Markers);
  const nextBuckets = bucketByKey(next.Markers);

  const unmatchedLegacy: UnmatchedMarker[] = [];
  const unmatchedNew: UnmatchedMarker[] = [];

  // `compareTiedGroup` handles the full group on each side (matched pairs,
  // legacy-only, AND new-only) in one pass - see its doc comment. Passing
  // it pre-sliced/length-clamped groups would just reintroduce the same
  // "arbitrary subset" ambiguity this fix removes, at the group-size-
  // mismatch boundary instead of within equal-length groups.
  for (const [key, legacyGroup] of legacyBuckets) {
    const nextGroup = nextBuckets.get(key) ?? [];
    compareTiedGroup(label, legacyGroup, nextGroup, diffs, unmatchedLegacy, unmatchedNew);
    nextBuckets.delete(key);
  }
  // Remaining keys are ones legacy never had at all - genuinely "extra in new" (until/unless the W-010 rescue below claims one).
  for (const [, remaining] of nextBuckets) {
    for (const m of remaining) unmatchedNew.push({ marker: m, tieNote: "" });
  }

  const { rescuedLegacy, rescuedNew } = rescueRenamedTitleMatches(label, unmatchedLegacy, unmatchedNew, diffs);

  for (let i = 0; i < unmatchedLegacy.length; i++) {
    if (rescuedLegacy.has(i)) continue;
    const { marker: lm, tieNote } = unmatchedLegacy[i]!;
    diffs.push(
      makeDiff({
        artifact: label,
        field: "Markers",
        expected: lm,
        actual: undefined,
        message: `${label}: marker "${lm.Title}" (${lm.Latitude}, ${lm.Longitude}) present in legacy but missing from new${tieNote}`,
      }),
    );
  }
  for (let j = 0; j < unmatchedNew.length; j++) {
    if (rescuedNew.has(j)) continue;
    const { marker: nm, tieNote } = unmatchedNew[j]!;
    diffs.push(
      makeDiff({
        artifact: label,
        field: "Markers",
        expected: undefined,
        actual: nm,
        message: `${label}: marker "${nm.Title}" (${nm.Latitude}, ${nm.Longitude}) present in new but not in legacy${tieNote}`,
      }),
    );
  }

  return { diffs, checksRun: Math.max(legacy.Markers.length, next.Markers.length, 1) };
}
