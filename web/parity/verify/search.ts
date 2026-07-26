/**
 * `search` category comparator (doc 07 §5.3) - pure, no I/O.
 *
 * Reimplements the rank formulas from doc 01 §4 ("Search TVFs ... replicate
 * ranking exactly") so the comparator can independently recompute which
 * consecutive rows are RANK-TIED (comparator treats a tied group as a SET,
 * doc §5.3) rather than requiring the exact legacy row order within a tie:
 *   - species: six +1 flags (ScientificName/CommonName x {prefix,suffix,
 *     contains}) - both fields recoverable from the response's
 *     Subject/Description.
 *   - sites: six +1 flags (Name/County x {prefix,suffix,contains}) - County
 *     is recovered by parsing the response's Description
 *     ("{County}, {StateName} ({id})" - first comma-segment). This is a
 *     best-effort text-parse of a DISPLAY string, not the raw column - if
 *     legacy ever changes that description format this heuristic needs a
 *     matching update.
 *   - states: **REDUCED to the three Name-only flags** (prefix/suffix/
 *     contains). Doc 01 §4's full formula adds +2 for an exact
 *     two-/three-letter code match, but the search response never exposes
 *     the state's code (Subject is the state name, Description is the
 *     country) - there is no text in either response to recover it from.
 *     KNOWN LIMITATION: for the handful of corpus terms that are exact
 *     state codes (doc 07 §3: "exact state codes (OH, USA-style 3-letter)")
 *     this under-counts rank for the exactly-matching state row, which can
 *     merge it into an adjacent tie-group it wouldn't legacy-belong to.
 *     Since legacy tie order within a rank group is itself "unspecified SQL
 *     order" (doc §5.3), the practical effect is limited to occasionally
 *     comparing a slightly larger set than legacy's true tie group - still
 *     a same-membership check, not a silent pass/fail flip. A true fix
 *     needs a states-code lookup threaded in from corpus.json; out of this
 *     task's scope (schema/corpus ownership).
 *
 * Message rows ("Show more results" / "No results found", Category
 * `"message"`) are compared for presence/description only, never
 * rank-grouped (doc §5.3: "must appear under the same conditions").
 */
import type { Diff } from "../data/comparator";
import { identifiesD016MergedPairInAny, W010_WAIVER_ID } from "../data/waivers";
import { urlsEquivalent } from "../normalize";
import { makeDiff } from "./diff-helpers";

export interface SearchResultRow {
  Category: string;
  Subject: string;
  Description: string;
  Url: string;
}

function containsFlags(term: string, text: string): number {
  const t = term.toLowerCase();
  const s = text.toLowerCase();
  let r = 0;
  if (s.startsWith(t)) r++;
  if (s.endsWith(t)) r++;
  if (s.includes(t)) r++;
  return r;
}

function countyFromDescription(description: string): string {
  return description.split(",")[0]?.trim() ?? "";
}

/**
 * The `search` category's snapshot manifest only captured the AJAX form of
 * `/Search?term=...` (doc 07 §3's "search terms" corpus entry; confirmed by
 * every stored artifact's `X-Requested-With` capture), which caps each
 * category to 5 results (`app/search/route.ts`'s `AJAX_MAX_RESULTS_PER_
 * CATEGORY`, mirroring legacy `SearchController.cs`). When a rank-tied
 * group's TRUE membership (doc §5.3: "legacy tie-breaking is unspecified
 * SQL order") is larger than this cap, legacy and the new app each keep an
 * arbitrary 5-of-N slice - genuinely different rows can appear on each side
 * even though every one of them ties on the exact same computed rank. See
 * this file's `SEARCH_CAP_TIE_WAIVER_ID` doc comment below and waivers.md's
 * corresponding entry (surfaced by the P1-15 sweep: ~all `search` category
 * "present in X but not Y" diffs fit this exact shape - every affected
 * rank-group is exactly cap-sized on the side(s) it was measured from).
 */
const AJAX_RESULT_CAP = 5;

/**
 * Waiver id for the cap-boundary rank-tie-truncation class described above.
 * Applied as a `waiverHint` (report.ts checks this before free-text
 * category/field matching, see data/waivers.ts) ONLY to "present in legacy
 * but missing from new" / "present in new but not in legacy" diffs whose
 * rank-group hit the AJAX cap on the side it's missing from - never to a
 * Description/Url mismatch on a row that matched by Subject on both sides
 * (those remain hard failures; they're not explainable by cap truncation).
 */
const SEARCH_CAP_TIE_WAIVER_ID = "W-009";

/** doc 01 §4 rank formulas, recomputed from response text (see file header for the states-code limitation). */
export function computeRank(term: string, row: SearchResultRow): number {
  switch (row.Category) {
    case "species":
      return containsFlags(term, row.Subject) + containsFlags(term, row.Description);
    case "sites":
      return containsFlags(term, row.Subject) + containsFlags(term, countyFromDescription(row.Description));
    case "states":
      return containsFlags(term, row.Subject);
    default:
      return 0;
  }
}

export interface RankGroup {
  category: string;
  rank: number;
  rows: SearchResultRow[];
}

/** Partitions the non-message rows into consecutive same-(category,rank) groups, preserving legacy's own emitted order across groups. */
export function buildRankGroups(term: string, rows: SearchResultRow[]): RankGroup[] {
  const groups: RankGroup[] = [];
  for (const row of rows) {
    if (row.Category === "message") continue;
    const rank = computeRank(term, row);
    const last = groups[groups.length - 1];
    if (last && last.category === row.Category && last.rank === rank) {
      last.rows.push(row);
    } else {
      groups.push({ category: row.Category, rank, rows: [row] });
    }
  }
  return groups;
}

function compareRowSet(label: string, groupLabel: string, legacyRows: SearchResultRow[], newRows: SearchResultRow[], diffs: Diff[]): void {
  const newBySubject = new Map(newRows.map((r) => [r.Subject, r] as const));
  const matchedSubjects = new Set<string>();
  // A group hitting the AJAX cap on either side means BOTH sides' true
  // (untruncated) tied membership is unknowable from this artifact alone -
  // see AJAX_RESULT_CAP's doc comment.
  const atCapBoundary = legacyRows.length === AJAX_RESULT_CAP || newRows.length === AJAX_RESULT_CAP;

  for (const legacyRow of legacyRows) {
    const newRow = newBySubject.get(legacyRow.Subject);
    if (!newRow) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "results",
          expected: legacyRow,
          message: `${label} ${groupLabel}: result "${legacyRow.Subject}" (${legacyRow.Category}) present in legacy but missing from new`,
          // W-010 (D-016 merged pairs) takes priority over the W-009
          // cap-boundary heuristic when the row itself identifies one of
          // the closed D-016 pairs - a definitive attribution beats a
          // "might be a truncated tie" guess.
          waiverHint: identifiesD016MergedPairInAny([legacyRow.Subject, legacyRow.Description])
            ? W010_WAIVER_ID
            : atCapBoundary
              ? SEARCH_CAP_TIE_WAIVER_ID
              : undefined,
        }),
      );
      continue;
    }
    matchedSubjects.add(legacyRow.Subject);
    if (legacyRow.Description !== newRow.Description) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "Description",
          expected: legacyRow.Description,
          actual: newRow.Description,
          message: `${label} ${groupLabel}: "${legacyRow.Subject}" Description mismatch - expected ${JSON.stringify(legacyRow.Description)}, got ${JSON.stringify(newRow.Description)}`,
        }),
      );
    }
    if (!urlsEquivalent(legacyRow.Url, newRow.Url)) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "Url",
          expected: legacyRow.Url,
          actual: newRow.Url,
          message: `${label} ${groupLabel}: "${legacyRow.Subject}" Url not route-equivalent - legacy ${JSON.stringify(legacyRow.Url)}, new ${JSON.stringify(newRow.Url)}`,
        }),
      );
    }
  }
  for (const newRow of newRows) {
    if (matchedSubjects.has(newRow.Subject)) continue;
    diffs.push(
      makeDiff({
        artifact: label,
        field: "results",
        actual: newRow,
        message: `${label} ${groupLabel}: result "${newRow.Subject}" (${newRow.Category}) present in new but not in legacy`,
        waiverHint: identifiesD016MergedPairInAny([newRow.Subject, newRow.Description])
          ? W010_WAIVER_ID
          : atCapBoundary
            ? SEARCH_CAP_TIE_WAIVER_ID
            : undefined,
      }),
    );
  }
}

function compareMessageRows(label: string, legacyRows: SearchResultRow[], newRows: SearchResultRow[], diffs: Diff[]): void {
  const legacyMsgs = new Set(legacyRows.filter((r) => r.Category === "message").map((r) => r.Description));
  const newMsgs = new Set(newRows.filter((r) => r.Category === "message").map((r) => r.Description));
  for (const m of legacyMsgs) {
    if (!newMsgs.has(m)) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "message-row",
          expected: m,
          message: `${label}: message row ${JSON.stringify(m)} present in legacy but missing from new`,
        }),
      );
    }
  }
  for (const m of newMsgs) {
    if (!legacyMsgs.has(m)) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "message-row",
          actual: m,
          message: `${label}: message row ${JSON.stringify(m)} present in new but not in legacy`,
        }),
      );
    }
  }
}

export interface SearchCompareResult {
  diffs: Diff[];
  checksRun: number;
}

export function compareSearch(label: string, term: string, legacyRows: SearchResultRow[], newRows: SearchResultRow[]): SearchCompareResult {
  const diffs: Diff[] = [];
  const legacyGroups = buildRankGroups(term, legacyRows);
  const newGroups = buildRankGroups(term, newRows);

  const n = Math.max(legacyGroups.length, newGroups.length);
  for (let i = 0; i < n; i++) {
    const lg = legacyGroups[i];
    const ng = newGroups[i];
    const groupLabel = `rank-group[${i}]`;
    if (!lg || !ng) {
      const present = lg ?? ng!;
      diffs.push(
        makeDiff({
          artifact: label,
          field: "rank-group",
          message: `${label}: ${groupLabel} (category=${present.category}, rank=${present.rank}, ${present.rows.length} row(s)) present on ${lg ? "legacy" : "new"} side only`,
        }),
      );
      continue;
    }
    if (lg.category !== ng.category) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "rank-group-category",
          expected: lg.category,
          actual: ng.category,
          message: `${label}: ${groupLabel} category mismatch - legacy ${lg.category}, new ${ng.category} (rank grouping diverged - remaining groups not compared)`,
        }),
      );
      break;
    }
    compareRowSet(label, groupLabel, lg.rows, ng.rows, diffs);
  }

  compareMessageRows(label, legacyRows, newRows, diffs);

  return { diffs, checksRun: Math.max(legacyRows.length, newRows.length, 1) };
}

// ---------------------------------------------------------------------------
// autocomplete
// ---------------------------------------------------------------------------

/**
 * `autocomplete` category comparator. Doc 01 gives no ranking formula for
 * `Trees.KnownSpecies` autocomplete (unlike the fully-specified search
 * TVFs above), so legacy's row order cannot be independently reproduced -
 * compared as an unordered SET of (value, the other name field) pairs
 * instead of a ranked list. This is a deliberate simplification (see file
 * header's search-comparator note on the same class of problem).
 */
export interface AutocompleteRow {
  value: string;
  label?: string;
  ScientificName?: string;
  CommonName?: string;
}

function autocompleteKey(r: AutocompleteRow): string {
  return `${r.value}||${r.ScientificName ?? r.CommonName ?? ""}`;
}

export interface AutocompleteCompareResult {
  diffs: Diff[];
  checksRun: number;
}

export function compareAutocomplete(label: string, legacyRows: AutocompleteRow[], newRows: AutocompleteRow[]): AutocompleteCompareResult {
  const diffs: Diff[] = [];
  const legacySet = new Map(legacyRows.map((r) => [autocompleteKey(r), r] as const));
  const newSet = new Map(newRows.map((r) => [autocompleteKey(r), r] as const));

  for (const [key, row] of legacySet) {
    if (!newSet.has(key)) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "results",
          expected: row,
          message: `${label}: suggestion ${JSON.stringify(row.value)} present in legacy but missing from new`,
        }),
      );
    }
  }
  for (const [key, row] of newSet) {
    if (!legacySet.has(key)) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "results",
          actual: row,
          message: `${label}: suggestion ${JSON.stringify(row.value)} present in new but not in legacy`,
        }),
      );
    }
  }

  return { diffs, checksRun: Math.max(legacyRows.length, newRows.length, 1) };
}
