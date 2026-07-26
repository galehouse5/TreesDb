/**
 * `pages` + `markerinfo` category comparator (doc 07 §5.4) - pure, no I/O
 * beyond taking already-extracted JSON on both sides (verify.ts is
 * responsible for running the legacy extractor on stored HTML, or reusing
 * the stored `.extracted.json`, and the matching NEW extractor from
 * `extractors/new/index.ts`'s registry on freshly-fetched HTML).
 *
 * This module's own job is the URL -> page-type CLASSIFICATION (which
 * extractor applies to a given manifest artifact, and which new-app path to
 * fetch) plus the deep-compare wiring via `deep-compare.ts`.
 *
 * Classification limitation (documented, not silently papered over): the
 * `pages` category's corpus captures BOTH full detail-page loads AND
 * embedded-grid AJAX-partial fetches (site-species/state-species/
 * state-sites/species-by-state/species-site-species/species-trees grids)
 * under URLs that otherwise look identical to a detail page (same pathname,
 * differing only by sort/page/filter/parameterNamePrefix query params -
 * capture.ts fetches scoped grids straight off `urls.siteDetails`/
 * `urls.stateDetails`/`urls.speciesDetails`, see its `gridStateUrl`).
 * Those six scoped-grid kinds have no dedicated page-type extractor
 * (neither in `extractors/legacy` nor in `extractors/new`'s registry - only
 * the two GLOBAL grids, `locations-grid`/`species-grid`, do) - so any
 * artifact whose query looks grid-shaped is skipped with a clear reason
 * rather than mis-run through the full detail-page extractor.
 */
import { resolveNewPath, resolveSpeciesDetailsPath, type UrlResolveResult } from "./url-resolve";
import type { NewPageType } from "../extractors/new";
import { countLeaves, diffJson } from "./deep-compare";
import { diffsFromMismatches, makeDiff } from "./diff-helpers";
import {
  classifyD016CountOnlyScope,
  classifyD016SpeciesDetailArtifact,
  extractGridEntryTotal,
  identifiesD016MergedPairInAny,
  isD016WhitespaceCollapseEqual,
  W010_WAIVER_ID,
} from "../data/waivers";
import type { Diff } from "../data/comparator";

/** URL-equivalence table entry ids (normalize.ts) that have an associated page-type extractor. */
const ROUTE_ID_TO_PAGE_TYPE: Partial<Record<string, NewPageType>> = {
  "tree-details": "tree-details",
  "site-details": "site-details",
  "state-details": "state-details",
  "species-details": "species-details",
  "site-species-details": "species-details",
  "state-species-details": "species-details",
  "browse-locations": "locations-grid",
  "browse-species-list": "species-grid",
  "map-tree-marker-info": "marker-info-tree",
  "map-site-marker-info": "marker-info-site",
  "map-state-marker-info": "marker-info-state",
};

const DETAIL_PAGE_TYPES = new Set<NewPageType>(["tree-details", "site-details", "state-details", "species-details"]);
const GRID_PAGE_TYPES = new Set<NewPageType>(["locations-grid", "species-grid"]);

/** Query param names that legitimately belong on a detail-page URL (species scoping, search passthrough) - never treated as a grid-partial signal. */
const NON_GRID_QUERY_KEYS = new Set(["siteid", "stateid", "term"]);

function isLikelyGridPartialQuery(legacyUrl: string): boolean {
  const qIndex = legacyUrl.indexOf("?");
  if (qIndex === -1) return false;
  const params = new URLSearchParams(legacyUrl.slice(qIndex + 1));
  for (const key of params.keys()) {
    const k = key.toLowerCase();
    if (NON_GRID_QUERY_KEYS.has(k)) continue;
    if (/sort|page|filter|parameternameprefix/.test(k)) return true;
  }
  return false;
}

/** Forwards a legacy grid URL's query string (sort/sortAsc/filter/page) onto the new path verbatim, stripping the legacy-only AJAX-plumbing `parameterNamePrefix` param. Only used for the two global grids (`locations-grid`/`species-grid`) - detail pages never carry grid query params through to this point (grid-shaped queries on a detail-page URL are classified as scoped-grid-partial and skipped before reaching here). */
function forwardGridQuery(legacyUrl: string, newPath: string): string {
  const qIndex = legacyUrl.indexOf("?");
  if (qIndex === -1) return newPath;
  const params = new URLSearchParams(legacyUrl.slice(qIndex + 1));
  params.delete("parameterNamePrefix");
  const qs = params.toString();
  return qs ? `${newPath}?${qs}` : newPath;
}

export type PageClassification =
  | { kind: "resolved"; pageType: NewPageType; newPath: string }
  | { kind: "skip"; reason: string };

/** Classifies one `pages`/`markerinfo` manifest artifact's legacy URL: which page-type extractor applies (if any) and what new-app path to fetch. */
export function classifyPageArtifact(legacyUrl: string): PageClassification {
  const resolved: UrlResolveResult = resolveNewPath(legacyUrl);
  if (resolved.kind === "skip") return resolved;

  const pageType = ROUTE_ID_TO_PAGE_TYPE[resolved.routeId];
  if (!pageType) {
    return {
      kind: "skip",
      reason: `route "${resolved.routeId}" has no associated page-type extractor (not one of the 10 known page types - see extractors/new/index.ts's NewPageType)`,
    };
  }

  if (DETAIL_PAGE_TYPES.has(pageType) && isLikelyGridPartialQuery(legacyUrl)) {
    return {
      kind: "skip",
      reason:
        "URL carries grid sort/page/filter/parameterNamePrefix query params - likely an embedded scoped-grid AJAX-partial fetch reusing the detail-page URL, not a full detail-page load; scoped grids (site-species/state-species/state-sites/species-by-state/species-site-species/species-trees) have no dedicated page-type extractor in this harness",
    };
  }

  if (pageType === "species-details") {
    const scoped = resolveSpeciesDetailsPath(legacyUrl);
    return scoped.kind === "resolved"
      ? { kind: "resolved", pageType, newPath: scoped.newPath }
      : { kind: "resolved", pageType, newPath: resolved.newPath };
  }

  if (GRID_PAGE_TYPES.has(pageType)) {
    return { kind: "resolved", pageType, newPath: forwardGridQuery(legacyUrl, resolved.newPath) };
  }

  return { kind: "resolved", pageType, newPath: resolved.newPath };
}

export interface PageCompareResult {
  diffs: Diff[];
  checksRun: number;
}

/**
 * W-007 (surfaced by the P1-15 sweep, see waivers.md) - the SINGLE largest
 * failure bucket in the pages sweep (416/476 unwaived failures, both from
 * exactly these two URLs: `/locations` 240, `/species` 176). Legacy's grid
 * `ORDER BY` has no secondary tiebreak column (doc 03 P1-03/04 task note),
 * so when many rows tie on the sorted column (the Locations grid's default
 * sort, or whichever column the Species grid is currently sorted by), row
 * order among the tied subset is unspecified SQL order on both sides - the
 * new Postgres query is not guaranteed (or expected) to reproduce it.
 * Comparing the two `rows` arrays strictly positionally (deep-compare.ts's
 * default array semantics) then reports the entire tied block as mismatched
 * cell-by-cell, even when every row is present on both sides with identical
 * cell text - just in a different order. Scoped ONLY to the top-level
 * `rows` array of the two GLOBAL grid page types (`locations-grid`/
 * `species-grid` - the only ones this class was observed on; embedded grids
 * on detail pages are a structurally different shape/JSON key and are not
 * touched here). Implemented as a pre-processing reorder (permute `new`'s
 * rows to align with `legacy`'s row order wherever their `cells` text
 * matches) BEFORE handing off to the existing generic `diffJson` engine, so
 * every other comparison rule (link route-equivalence, float32, etc.)
 * still applies unchanged to the now-aligned rows - deep-compare.ts itself
 * is untouched. A row whose `cells` text doesn't match anything on the
 * other side is left in its original relative position, so a genuine
 * content difference (not just order) still surfaces as a normal diff.
 */
function cellsKey(row: { cells: string[] }): string {
  return JSON.stringify(row.cells);
}

function isGridRowsShape(json: unknown): json is { rows: { cells: string[]; links: unknown[] }[] } {
  return (
    typeof json === "object" &&
    json !== null &&
    Array.isArray((json as { rows?: unknown }).rows) &&
    (json as { rows: unknown[] }).rows.every(
      (r) => typeof r === "object" && r !== null && Array.isArray((r as { cells?: unknown }).cells) && Array.isArray((r as { links?: unknown }).links),
    )
  );
}

const GLOBAL_GRID_PAGE_TYPES = new Set<NewPageType>(["locations-grid", "species-grid"]);

type Grid = { rows: { cells: string[]; links: unknown[] }[] };

/**
 * W-007 (tie-order realignment) + W-010 prong 2 (affected-pair allowlist),
 * applied to ONE grid's `rows` arrays (either a whole page's root - the two
 * global grid pages - or one embedded grid field, see `findGridTargets`
 * below for W-010 prong 4's extension to embedded detail-page grids). First
 * aligns new-side rows to legacy's order wherever a `cells`-equal row exists
 * on both sides (W-007, file-header doc comment above `cellsKey`) - then,
 * any row left with NO cells-match on the other side is pulled out into its
 * own dedicated Diff (mirrors verify/search.ts's `compareRowSet` "present in
 * X but missing from Y" pattern) instead of being left for the generic
 * `diffJson` array walk below to report as a bare array-LENGTH mismatch: a
 * length-mismatch diff carries only NUMBERS, not row text, which isn't
 * enough context for data/waivers.ts's `identifiesD016MergedPairInAny` to
 * attribute it to one of the closed D-016 pairs (see that module's doc
 * comment - this is the "extend the diff construction to carry the row's
 * cell text" case waivers.md W-010 calls for). Each dedicated diff is
 * tagged `waiverHint: W010_WAIVER_ID` if-and-only-if ITS OWN row cells
 * identify one of the three pairs (anti-overreach: never because the page
 * merely contains that species elsewhere). Unmatched rows are removed from
 * BOTH arrays before `diffJson` runs, so an attributed (or genuinely
 * differing) row doesn't ALSO trigger a redundant, uninformative
 * array-length-mismatch diff for the same row.
 *
 * `fieldPrefix` is `""` for the root-is-a-grid case (global grid pages,
 * `field: "rows"`) or the embedded grid's own key (e.g. `"speciesGrid"`,
 * `field: "speciesGrid.rows"`) - matches `diffJson`'s own dotted-path
 * convention so a rescued embedded grid's diffs read the same as its
 * sibling fields (`speciesGrid.pageInfo`, etc).
 */
function alignAndSplitOneGrid(
  label: string,
  fieldPrefix: string,
  legacyGrid: Grid,
  newGrid: Grid,
): { matchedLegacyRows: Grid["rows"]; alignedNewRows: Grid["rows"]; unmatchedDiffs: Diff[]; allUnmatchedAttributed: boolean } {
  const rowsField = fieldPrefix ? `${fieldPrefix}.rows` : "rows";
  const rowLabel = fieldPrefix ? `${fieldPrefix} grid row` : "grid row";

  const newByKey = new Map<string, Grid["rows"]>();
  for (const row of newGrid.rows) {
    const k = cellsKey(row);
    const bucket = newByKey.get(k);
    if (bucket) bucket.push(row);
    else newByKey.set(k, [row]);
  }

  const usedNew = new Set<Grid["rows"][number]>();
  const matchedLegacyRows: Grid["rows"] = [];
  const alignedNewRows: Grid["rows"] = [];
  const unmatchedLegacyRows: Grid["rows"] = [];
  for (const legacyRow of legacyGrid.rows) {
    const candidates = newByKey.get(cellsKey(legacyRow));
    const match = candidates?.find((r) => !usedNew.has(r));
    if (match) {
      usedNew.add(match);
      matchedLegacyRows.push(legacyRow);
      alignedNewRows.push(match);
    } else {
      unmatchedLegacyRows.push(legacyRow);
    }
  }
  const unmatchedNewRows = newGrid.rows.filter((r) => !usedNew.has(r));

  const unmatchedDiffs: Diff[] = [];
  for (const row of unmatchedLegacyRows) {
    unmatchedDiffs.push(
      makeDiff({
        artifact: label,
        field: rowsField,
        expected: row,
        message: `${label}: ${rowLabel} ${JSON.stringify(row.cells)} present in legacy but missing from new`,
        waiverHint: identifiesD016MergedPairInAny(row.cells) ? W010_WAIVER_ID : undefined,
      }),
    );
  }
  for (const row of unmatchedNewRows) {
    unmatchedDiffs.push(
      makeDiff({
        artifact: label,
        field: rowsField,
        actual: row,
        message: `${label}: ${rowLabel} ${JSON.stringify(row.cells)} present in new but not in legacy`,
        waiverHint: identifiesD016MergedPairInAny(row.cells) ? W010_WAIVER_ID : undefined,
      }),
    );
  }

  // "if-and-only-if every unmatched row on that grid was itself D-016-attributed" (waivers.md W-010 prong 4) -
  // false when there's nothing unmatched at all (nothing to rescue a pageInfo/count diff FROM).
  const allUnmatchedAttributed = unmatchedDiffs.length > 0 && unmatchedDiffs.every((d) => d.waiverHint === W010_WAIVER_ID);

  return { matchedLegacyRows, alignedNewRows, unmatchedDiffs, allUnmatchedAttributed };
}

interface GridTarget {
  /** "" = the page's root IS the grid (the two global grid pages); otherwise the top-level property name (e.g. "speciesGrid", "sitesGrid", "recordedTreesGrid"). */
  key: string;
  legacyGrid: Grid;
  newGrid: Grid;
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * W-010 prong 4's extension point: finds every grid needing alignment in
 * ONE page JSON pair.
 *
 * For the two GLOBAL grid page types, the page's root itself IS the grid -
 * matches the ORIGINAL W-007 scope exactly (a root that merely LOOKS
 * grid-shaped on some other page type is deliberately NOT treated as one;
 * real detail-page roots never do, but a synthetic/malformed shape
 * shouldn't accidentally get order-insensitive treatment it wasn't asking
 * for). For every OTHER page type, scans the root's direct top-level
 * properties for ones that are grid-shaped on BOTH sides (embedded
 * detail-page grids - `SiteDetailsJson.speciesGrid`,
 * `StateDetailsJson.speciesGrid`/`sitesGrid`,
 * `SpeciesDetailsJson.recordedStatesGrid`/`recordedSitesGrid`/
 * `recordedTreesGrid`, schema.ts - found structurally by NAME here, not
 * hardcoded, so any future grid field is covered automatically, and a page
 * type with no grid fields at all simply yields zero targets). Only ONE
 * level deep, deliberately NOT a general recursive walk - grids are never
 * nested inside one another or inside an array in the real schema, and a
 * bounded, predictable scan avoids false-positives on unrelated nested
 * data. A target is only returned when BOTH sides have a grid at that
 * position - a structural mismatch (grid on one side only) is left for the
 * generic `diffJson` walk to report as an ordinary type/shape diff.
 */
function findGridTargets(pageType: NewPageType, legacyJson: unknown, newJson: unknown): GridTarget[] {
  if (GLOBAL_GRID_PAGE_TYPES.has(pageType)) {
    if (isGridRowsShape(legacyJson) && isGridRowsShape(newJson)) {
      return [{ key: "", legacyGrid: legacyJson, newGrid: newJson }];
    }
    return [];
  }

  if (!isPlainRecord(legacyJson) || !isPlainRecord(newJson)) return [];
  const targets: GridTarget[] = [];
  for (const key of new Set([...Object.keys(legacyJson), ...Object.keys(newJson)])) {
    const lv = legacyJson[key];
    const nv = newJson[key];
    if (isGridRowsShape(lv) && isGridRowsShape(nv)) targets.push({ key, legacyGrid: lv, newGrid: nv });
  }
  return targets;
}

/**
 * Runs `alignAndSplitOneGrid` over every grid `findGridTargets` finds in
 * this page pair, returning a patched (grids' `.rows` replaced with the
 * matched-only, aligned arrays) copy of both sides for the generic
 * `diffJson` walk, plus the collected per-row unmatched diffs, the set of
 * grid field-prefixes where EVERY unmatched row was D-016-attributed
 * (waivers.md W-010 prong 4's pageInfo/count-diff condition), and the set
 * of grid field-prefixes that had ANY row diff at all regardless of
 * attribution (prong 6's precondition - it applies ONLY to a grid with ZERO
 * row diffs; a grid with row diffs, attributed or not, is prong 4's alone)
 * - applied by the caller once the full diff list exists.
 */
function alignAndSplitAllGrids(
  pageType: NewPageType,
  label: string,
  legacyJson: unknown,
  newJson: unknown,
): {
  legacyJson: unknown;
  newJson: unknown;
  unmatchedDiffs: Diff[];
  fullyAttributedGridPrefixes: Set<string>;
  gridPrefixesWithRowDiffs: Set<string>;
} {
  const targets = findGridTargets(pageType, legacyJson, newJson);
  if (targets.length === 0) {
    return { legacyJson, newJson, unmatchedDiffs: [], fullyAttributedGridPrefixes: new Set(), gridPrefixesWithRowDiffs: new Set() };
  }

  let patchedLegacy = legacyJson as Record<string, unknown>;
  let patchedNew = newJson as Record<string, unknown>;
  const unmatchedDiffs: Diff[] = [];
  const fullyAttributedGridPrefixes = new Set<string>();
  const gridPrefixesWithRowDiffs = new Set<string>();

  for (const target of targets) {
    const result = alignAndSplitOneGrid(label, target.key, target.legacyGrid, target.newGrid);
    unmatchedDiffs.push(...result.unmatchedDiffs);
    if (result.unmatchedDiffs.length > 0) gridPrefixesWithRowDiffs.add(target.key);
    if (result.allUnmatchedAttributed) fullyAttributedGridPrefixes.add(target.key);

    if (target.key === "") {
      patchedLegacy = { ...patchedLegacy, rows: result.matchedLegacyRows };
      patchedNew = { ...patchedNew, rows: result.alignedNewRows };
    } else {
      patchedLegacy = { ...patchedLegacy, [target.key]: { ...target.legacyGrid, rows: result.matchedLegacyRows } };
      patchedNew = { ...patchedNew, [target.key]: { ...target.newGrid, rows: result.alignedNewRows } };
    }
  }

  return { legacyJson: patchedLegacy, newJson: patchedNew, unmatchedDiffs, fullyAttributedGridPrefixes, gridPrefixesWithRowDiffs };
}

/** Strips a `.<suffix>` (or bare `suffix`, for the root-grid case) field name down to its grid prefix; null when `field` isn't shaped like that grid field at all. Shared by prong 4's `pageInfo`/`rows` rescue and prong 6's `pageInfo`-only rescue below. */
function gridFieldPrefix(field: string | undefined, suffix: string): string | null {
  if (!field) return null;
  if (field === suffix) return "";
  if (field.endsWith(`.${suffix}`)) return field.slice(0, -(suffix.length + 1));
  return null;
}

/** True when `field` is the `pageInfo` or `rows` field of a grid whose prefix is in `fullyAttributedGridPrefixes` - waivers.md W-010 prong 4's "pageInfo / row-count diff...if-and-only-if every unmatched row on that grid was itself D-016-attributed" rule. */
function isRescuableGridSummaryField(field: string | undefined, fullyAttributedGridPrefixes: Set<string>): boolean {
  const pageInfoPrefix = gridFieldPrefix(field, "pageInfo");
  if (pageInfoPrefix !== null && fullyAttributedGridPrefixes.has(pageInfoPrefix)) return true;
  const rowsPrefix = gridFieldPrefix(field, "rows");
  return rowsPrefix !== null && fullyAttributedGridPrefixes.has(rowsPrefix);
}

/**
 * W-010 prong 6 (count-only diffs from off-page merged rows, waivers.md's
 * entry): true when `diff` is a grid `pageInfo` diff whose OWN grid had NO
 * row diffs at all (prong 6's precondition - a grid with row diffs, even a
 * partially-attributed one, is prong 4's alone; see `alignAndSplitAllGrids`'s
 * `gridPrefixesWithRowDiffs`), `label` matches one of the two closed prong-6
 * scopes (`classifyD016CountOnlyScope`, data/waivers.ts), and the exact
 * legacy-minus-new entry-count delta equals that scope's expected delta.
 * Any other count-only diff, or a delta that doesn't match precisely,
 * returns false - it still fails normally, exactly as the waiver requires.
 */
function isRescuableByCountOnlyScope(label: string, diff: { field?: string; expected?: unknown; actual?: unknown }, gridPrefixesWithRowDiffs: Set<string>): boolean {
  const prefix = gridFieldPrefix(diff.field, "pageInfo");
  if (prefix === null || gridPrefixesWithRowDiffs.has(prefix)) return false;

  const scope = classifyD016CountOnlyScope(label);
  if (!scope) return false;

  const expectedTotal = extractGridEntryTotal(diff.expected);
  const actualTotal = extractGridEntryTotal(diff.actual);
  if (expectedTotal === null || actualTotal === null) return false;

  return expectedTotal - actualTotal === scope.expectedDelta;
}

/**
 * W-005 (surfaced by the P1-15 sweep, see waivers.md): `treesdb.org` is
 * Cloudflare-fronted, and Cloudflare's email-obfuscation feature rewrites
 * any visible email text server-side into a decoy `<a href="/cdn-cgi/l/
 * email-protection#<hex>">[email&#160;protected]</a>` (real address hidden
 * in the href/data-cfemail hex, decoded client-side by an injected
 * script) - `capture.ts` only fetches raw HTML (no JS execution), so a
 * legacy-side text extractor (which pulls the anchor's TEXT content, not
 * its href - the `cdn-cgi` path itself never appears in extracted text)
 * sees the literal decoy string, reflecting the CAPTURE artifact rather
 * than real page content (a real visitor's browser runs Cloudflare's
 * script and sees the actual email, exactly what the new app's extracted
 * field shows). Confirmed live: site-details `summary["Ownership
 * contact"]` on several sites - captured HTML's `[email&#160;protected]`
 * (U+00A0 nbsp between the words) collapses to this exact literal string
 * via `collapseWhitespace` (JS `\s` matches nbsp).
 */
const CLOUDFLARE_EMAIL_PROTECTION_PLACEHOLDER = "[email protected]";

function isCloudflareEmailProtectionPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.includes(CLOUDFLARE_EMAIL_PROTECTION_PLACEHOLDER);
}

/**
 * Deep-compares one page/markerinfo artifact's already-extracted legacy and
 * new JSON (doc §5.4: verbatim formatted strings, float32 numbers,
 * URL-equivalent hrefs - all handled by deep-compare.ts). `pageType`, when
 * passed (verify.ts always has it from `classifyPageArtifact` - the
 * parameter is optional only so existing/unit-test call sites that don't
 * care about W-007/W-010 keep working unchanged, matching the pre-existing
 * "no-op when pageType is omitted" contract), gates the W-007/W-010 grid
 * work above: the ROOT-is-a-grid case stays scoped to exactly the two
 * global grid page types (unchanged from before this task), while the
 * embedded-grid scan (W-010 prong 4) runs for every OTHER defined page type
 * - it's a structural, name-agnostic scan (`findGridTargets`) that simply
 * finds zero targets on page types with no grid-shaped fields, so this
 * doesn't need (or want) a hardcoded detail-page-type allowlist.
 *
 * W-010 prong 1 (whitespace-collapse equality) is checked on every leaf
 * mismatch `diffJson` finds, regardless of page type - it covers a plain
 * detail-page text field just as much as a matched grid row's cell (see
 * data/waivers.ts's `isD016WhitespaceCollapseEqual`). W-010 prong 5
 * (affected species detail artifacts) is checked first and, when it
 * applies, overrides every other tag on this artifact - see
 * `classifyD016SpeciesDetailArtifact`'s doc comment.
 */
export function comparePageJson(label: string, legacyJson: unknown, newJson: unknown, pageType?: NewPageType): PageCompareResult {
  const gridSplit = pageType !== undefined ? alignAndSplitAllGrids(pageType, label, legacyJson, newJson) : null;
  const compareLegacyJson = gridSplit ? gridSplit.legacyJson : legacyJson;
  const compareNewJson = gridSplit ? gridSplit.newJson : newJson;

  const mismatches = diffJson(compareLegacyJson, compareNewJson);
  const fullyAttributedGridPrefixes = gridSplit?.fullyAttributedGridPrefixes ?? new Set<string>();
  const gridPrefixesWithRowDiffs = gridSplit?.gridPrefixesWithRowDiffs ?? new Set<string>();

  // W-010 prong 5: on a closed list of D-016-affected species detail
  // artifacts, every diff is definitionally attributable - see
  // classifyD016SpeciesDetailArtifact's doc comment (data/waivers.ts).
  const isD016AffectedDetailArtifact = classifyD016SpeciesDetailArtifact(label);

  const diffs = [
    ...(gridSplit?.unmatchedDiffs ?? []).map((d) => (isD016AffectedDetailArtifact ? { ...d, waiverHint: W010_WAIVER_ID } : d)),
    ...diffsFromMismatches(label, mismatches).map((d) => {
      if (isD016AffectedDetailArtifact) return { ...d, waiverHint: W010_WAIVER_ID };
      if (isCloudflareEmailProtectionPlaceholder(d.expected)) return { ...d, waiverHint: "W-005" };
      if (isD016WhitespaceCollapseEqual(d.expected, d.actual)) return { ...d, waiverHint: W010_WAIVER_ID };
      if (isRescuableGridSummaryField(d.field, fullyAttributedGridPrefixes)) return { ...d, waiverHint: W010_WAIVER_ID };
      if (isRescuableByCountOnlyScope(label, d, gridPrefixesWithRowDiffs)) return { ...d, waiverHint: W010_WAIVER_ID };
      return d;
    }),
  ];
  const checksRun = Math.max(countLeaves(legacyJson), countLeaves(newJson));
  return { diffs, checksRun };
}
