/**
 * Parses `web/parity/waivers.md` (doc 07 §9) into structured records and
 * matches comparator Diffs against them, so report.ts can bucket "waived"
 * separately from "failed" - per doc §9, "a waiver never turns a check
 * green silently": waived diffs are still reported, just in their own
 * bucket with counts.
 *
 * Matching strategy (best-effort, since waivers.md is prose, not a machine
 * schema):
 *   1. `Diff.waiverHint`, when the comparator itself set it (currently only
 *      the W-001 tie-break pattern in verify-derived.ts), is checked first
 *      and matches exactly that waiver id - this is the only case with a
 *      real machine-checkable rule (doc §9's own "Comparator rule" text for
 *      W-001).
 *   2. Otherwise, free-text: a waiver applies to a Diff if the waiver's
 *      "Category / artifacts affected" line contains the comparison
 *      `category` token (e.g. "data", "derived") AND the Diff has a `field`
 *      that matches the waiver's "Field(s)" line - either because that line
 *      is empty/unspecified (the waiver covers every field in-category), or
 *      because one of its backtick-quoted tokens matches, treating `*` as a
 *      wildcard (doc's own convention, e.g. waivers.md W-001's
 *      `` `Max*TreeId` ``, meaning MaxHeightTreeId/MaxGirthTreeId/
 *      MaxCrownSpreadTreeId). A Diff with NO `field` (row-count, pk-set)
 *      only matches a waiver whose Field(s) line is itself empty - it never
 *      "matches everything" by omission.
 * None of the four predeclared waivers (W-001..W-004) target this task's
 * `data`/`derived` categories directly except W-001 (which explicitly lists
 * "data (§7.2 MeasuredSpecies... views)" as an affected category) - so in
 * practice bucket (2) is exercised mainly by future waivers; tests inject
 * synthetic waiver text to exercise the matching logic itself.
 */
import { readFileSync } from "node:fs";
import { collapseWhitespace, matchLegacyUrl, splitSpeciesRouteSegment } from "../normalize";
import type { Diff } from "./comparator";

export interface Waiver {
  id: string;
  title: string;
  /** Lowercased tokens parsed from the "Category / artifacts affected" line. */
  categories: string[];
  /** Raw text of the "Field(s)" line, lowercased, for display/debugging. */
  fieldsText: string;
  /** Case-insensitive field-name patterns derived from `fieldsText`'s backtick-quoted tokens (`*` = wildcard). Empty array means "Field(s) unspecified - covers every field". */
  fieldPatterns: RegExp[];
  /** Full section text (for inclusion in reports / debugging). */
  raw: string;
}

/** Converts a doc-convention field token (e.g. `` `Max*TreeId` `` with `*` as an any-characters wildcard) into an anchored, case-insensitive RegExp. */
function fieldTokenToRegExp(token: string): RegExp {
  const escaped = token.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function parseFieldPatterns(fieldsLine: string): RegExp[] {
  const backtickTokens = [...fieldsLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  if (backtickTokens.length > 0) return backtickTokens.map(fieldTokenToRegExp);
  const trimmed = fieldsLine.trim();
  return trimmed === "" ? [] : [fieldTokenToRegExp(trimmed)];
}

const HEADER_RE = /^## (W-\d+): (.+)$/m;

export function parseWaivers(markdown: string): Waiver[] {
  const parts = markdown.split(HEADER_RE);
  const waivers: Waiver[] = [];
  // parts = [preamble, id1, title1, body1, id2, title2, body2, ...]
  for (let i = 1; i < parts.length; i += 3) {
    const id = parts[i];
    const title = parts[i + 1];
    const body = parts[i + 2];
    if (!id || title === undefined || body === undefined) break;
    const categoryLine = /Category\s*\/\s*artifacts affected:\s*(.+)/.exec(body)?.[1] ?? "";
    const fieldsLine = /Field\(s\):\s*(.+)/.exec(body)?.[1] ?? "";
    const categories = categoryLine
      .toLowerCase()
      .split(/[`,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    waivers.push({
      id,
      title: title.trim(),
      categories,
      fieldsText: fieldsLine.toLowerCase().trim(),
      fieldPatterns: parseFieldPatterns(fieldsLine),
      raw: `## ${id}: ${title.trim()}\n${body.trim()}`,
    });
  }
  return waivers;
}

export function loadWaivers(waiversMdPath: string): Waiver[] {
  return parseWaivers(readFileSync(waiversMdPath, "utf-8"));
}

/** Finds the first waiver (in file order) that covers `diff` under `category`. Returns null if none applies. */
export function findApplicableWaiver(diff: Diff, category: string, waivers: Waiver[]): Waiver | null {
  if (diff.waiverHint) {
    const byHint = waivers.find((w) => w.id === diff.waiverHint);
    if (byHint) return byHint;
  }
  const cat = category.toLowerCase();
  for (const w of waivers) {
    const categoryMatches = w.categories.some((c) => c.includes(cat));
    if (!categoryMatches) continue;
    const fieldMatches =
      w.fieldPatterns.length === 0 || (diff.field !== undefined && w.fieldPatterns.some((p) => p.test(diff.field!)));
    if (fieldMatches) return w;
  }
  return null;
}

// ---------------------------------------------------------------------------
// W-010 (D-016 species whitespace-duplicate cleanup, waivers.md W-010) - the
// two mechanical prongs live here per that entry's own "Comparator rule"
// text ("two mechanical prongs in parity/data/waivers.ts"); verify/pages.ts,
// verify/search.ts and verify/exports.ts call these at the specific
// diff-construction sites where they have the row/cell text needed to apply
// them (this module has no I/O and never sees a raw page/export artifact
// itself), then set `Diff.waiverHint` themselves - findApplicableWaiver's
// existing hint-priority check above (bucket 1) then buckets the result
// "waived", same as W-001/W-005/W-009 already do.
// ---------------------------------------------------------------------------

export const W010_WAIVER_ID = "W-010";

/**
 * Prong 1 (whitespace-collapse equality): true when `expected` (legacy) and
 * `actual` (new) are both strings, not already equal, and become equal once
 * whitespace runs are collapsed to a single space on BOTH sides - the exact
 * D-016 cleanup rule (`\s+` -> single space, docs/migration/DECISIONS.md
 * D-016). Reuses normalize.ts's `collapseWhitespace` rather than
 * reimplementing it - same rule, single source of truth. Non-string values
 * never match; this prong is scoped to raw text cells (waivers.md W-010:
 * "raw name text differing only by internal whitespace runs"), not numbers
 * or structured values.
 */
export function isD016WhitespaceCollapseEqual(expected: unknown, actual: unknown): boolean {
  if (typeof expected !== "string" || typeof actual !== "string") return false;
  if (expected === actual) return false; // not a diff in the first place
  return collapseWhitespace(expected) === collapseWhitespace(actual);
}

/**
 * Prong 2 (affected-pair allowlist): the CLOSED list of D-016 merge pairs
 * (collapsed form), exactly as decided - never pattern-extended beyond these
 * three (waivers.md W-010: "the allowlist is closed").
 */
export const D016_MERGED_PAIRS: ReadonlyArray<{ botanicalName: string; commonName: string }> = [
  { botanicalName: "Cercis siliquastrum", commonName: "Judas-Tree" },
  { botanicalName: "Crataegus spp.", commonName: "Hawthorn" },
  { botanicalName: "Cupressus sempervirens", commonName: "Italian Cypress" },
];

/**
 * True when `text` contains BOTH the collapsed botanical name AND the
 * collapsed common name of one of the closed `D016_MERGED_PAIRS` (case-
 * insensitive - row-text casing isn't part of the identity contract).
 * ANTI-OVERREACH: callers must pass ONLY the specific row/entry's own text
 * (grid row cells, a search result's Subject+Description, ...) - never a
 * whole page's text - so a diff is tagged only when the row/entry ITSELF is
 * identified as one of the three pairs, not merely because the page also
 * mentions that species elsewhere (waivers.md W-010's explicit rule).
 */
export function identifiesD016MergedPair(text: string): boolean {
  const collapsed = collapseWhitespace(text).toLowerCase();
  return D016_MERGED_PAIRS.some(
    (p) => collapsed.includes(p.botanicalName.toLowerCase()) && collapsed.includes(p.commonName.toLowerCase()),
  );
}

/** Convenience wrapper over `identifiesD016MergedPair` for callers holding the row/entry's text as several separate fields (grid row `cells`, a search row's Subject/Description, ...) rather than one pre-joined string. */
export function identifiesD016MergedPairInAny(texts: ReadonlyArray<string | undefined | null>): boolean {
  return identifiesD016MergedPair(texts.filter((t): t is string => typeof t === "string").join(" "));
}

/**
 * D-016's one collision-free RENAME (waivers.md W-010: "the renamed
 * Quercus  x mutabilis... NOT in D016_MERGED_PAIRS since it merged with
 * nothing"). Separate from `D016_MERGED_PAIRS` because it has no clean-twin
 * counterpart to absorb into - only prong 3's export-artifact allowlist
 * below needs to distinguish the two; prong 1 (whitespace-collapse
 * equality) already covers this rename everywhere else (a plain cell-text
 * diff, same as any other whitespace-only change).
 */
export const D016_RENAMED_PAIRS: ReadonlyArray<{ botanicalName: string; commonName: string }> = [
  { botanicalName: "Quercus x mutabilis", commonName: "Hybrid Oak" },
];

export type D016SpeciesExportArtifactKind = "duplicate-variant" | "clean-twin";

/** True when `pairs` contains an entry whose (botanicalName, commonName) matches, case-insensitively, once both sides are already whitespace-collapsed. Shared by the export (prong 3) and page (prong 5) closed-artifact classifiers below. */
function pairsInclude(pairs: ReadonlyArray<{ botanicalName: string; commonName: string }>, collapsedBotanicalName: string, collapsedCommonName: string): boolean {
  return pairs.some(
    (p) => p.botanicalName.toLowerCase() === collapsedBotanicalName.toLowerCase() && p.commonName.toLowerCase() === collapsedCommonName.toLowerCase(),
  );
}

/** Strips a scheme+authority prefix (if present), returning the bare (still percent-ENCODED) pathname - manifest snapshot URLs are always absolute (`https://www.treesdb.org/...`); a bare path is accepted defensively. Shared by both closed-artifact classifiers below. */
function rawPathnameOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0]!;
  }
}

/**
 * Prong 3 (affected species-export artifact allowlist, waivers.md W-010):
 * classifies a `/Export/Species/{bn} ({cn})` artifact's LEGACY url against
 * the closed 7-artifact D-016 list (the 3 merged pairs' two URL variants
 * each, plus the one renamed pair's single surviving double-space URL) -
 * never pattern-extended beyond it (returns null for anything else,
 * including non-species export URLs).
 *
 * Reads the LITERAL url segment (percent-decoded, whitespace untouched) -
 * exports mirror legacy's `{bn} ({cn})` segment verbatim, NOT the D-011
 * slug (normalize.ts's "export-species" table entry) - so the segment's
 * own whitespace tells us which of the two URL variants this is:
 *   - "duplicate-variant": the segment carries extra whitespace runs (the
 *     double-space URL) - D-016 merged/renamed this species away, so the
 *     new app has nothing to serve under this literal URL (header-only
 *     body expected).
 *   - "clean-twin": the segment is ALREADY whitespace-collapsed AND names
 *     one of the three merged pairs - D-016 folded the duplicate's trees
 *     INTO this species, so the new app's body carries strictly more rows
 *     (legacy rows must be a subset of the new rows).
 * A collapsed, already-clean renamed-pair URL (no double-space counterpart
 * exists in the closed list) returns null - out of prong 3's scope, same as
 * any ordinary export artifact.
 */
export function classifyD016SpeciesExportArtifact(legacyUrl: string): D016SpeciesExportArtifactKind | null {
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(rawPathnameOf(legacyUrl));
  } catch {
    decodedPathname = rawPathnameOf(legacyUrl);
  }

  const routeMatch = /^\/Export\/Species\/(.+)$/.exec(decodedPathname);
  if (!routeMatch) return null;
  const segment = splitSpeciesRouteSegment(routeMatch[1]!);
  if (!segment) return null;
  const { scientificName, commonName } = segment;

  const collapsedBn = collapseWhitespace(scientificName);
  const collapsedCn = collapseWhitespace(commonName);
  const isLiteralAlreadyCollapsed = scientificName === collapsedBn && commonName === collapsedCn;

  if (pairsInclude(D016_MERGED_PAIRS, collapsedBn, collapsedCn)) return isLiteralAlreadyCollapsed ? "clean-twin" : "duplicate-variant";
  if (pairsInclude(D016_RENAMED_PAIRS, collapsedBn, collapsedCn) && !isLiteralAlreadyCollapsed) return "duplicate-variant";
  return null;
}

/** Legacy URL-equivalence-table route ids (normalize.ts) that resolve to a species-details page - the global form and both scoped forms. The query-param-scoped shape (`/Browse/Species/{bn (cn)}/Details?siteId=`/`?stateId=`) resolves to the SAME "species-details" route id as the global form, since `matchLegacyUrl` matches pathname only. */
const SPECIES_DETAIL_ROUTE_IDS = new Set(["species-details", "site-species-details", "state-species-details"]);

/**
 * Prong 5 (affected species detail artifacts, waivers.md W-010): true when
 * `legacyUrl`'s PATHNAME identifies one of the closed D-016 pairs - either
 * variant spelling (double-space or clean), merged OR renamed - on
 * `/Browse/Species/{bn (cn)}/Details` or either scoped form
 * (`/Browse/Sites/{id}/Species/.../Details`,
 * `/Browse/States/{id}/Species/.../Details`).
 *
 * Query string is deliberately ignored (`matchLegacyUrl` strips it before
 * matching) - this is exactly right for "including...their grid-permutation
 * query-string variants" (waivers.md's own phrasing): sort/page/filter/
 * siteId/stateId params never change WHICH species page this is, only how
 * its embedded grids are sorted/paged - a concern prong 4 already owns.
 * Unlike prong 3 (which distinguishes duplicate-variant vs. clean-twin
 * because exports serve different bodies for each), prong 5 does NOT
 * distinguish the two: on a page, BOTH url variants land on a page whose
 * content is observably shaped by the D-016 merge (the double-space url
 * resolves to the SAME merged page as the clean one), so any diff on either
 * is definitionally attributable per the waiver text.
 */
export function classifyD016SpeciesDetailArtifact(legacyUrl: string): boolean {
  const match = matchLegacyUrl(rawPathnameOf(legacyUrl));
  if (!match || !SPECIES_DETAIL_ROUTE_IDS.has(match.entry.id)) return false;

  const segmentRaw = match.params.species;
  if (!segmentRaw) return false;
  const segment = splitSpeciesRouteSegment(segmentRaw);
  if (!segment) return false;

  const collapsedBn = collapseWhitespace(segment.scientificName);
  const collapsedCn = collapseWhitespace(segment.commonName);
  return pairsInclude(D016_MERGED_PAIRS, collapsedBn, collapsedCn) || pairsInclude(D016_RENAMED_PAIRS, collapsedBn, collapsedCn);
}

/**
 * Replicates `db/queries/browse-grids.sql.ts`'s `likeAnywhereRegExp` (D-010:
 * `%`/`_` inside `filter` act as SQL `LIKE` wildcards, not escaped; every
 * other regex metacharacter IS escaped so it matches literally) - this
 * module has no dependency on `db/queries` (data/verify layering, and that
 * file isn't owned by this task), so the predicate is mirrored here
 * verbatim per waivers.md W-010 prong 6's own instruction ("replicate that
 * predicate over the 3 pairs").
 */
function likeAnywhereMatches(text: string, filter: string): boolean {
  const escaped = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp(pattern, "i").test(text);
}

/** The one state-detail scope prong 6(b) covers (North Carolina) - verified data-side: the merged Crataegus duplicate lived at site 41043 in this state, alongside 10 clean-variant Crataegus trees, so this is the ONE state whose species-grid total legitimately drops by 1 with the causal row off the visible page (waivers.md W-010 prong 6). */
const D016_PRONG6_STATE_ID = 25;

/** True when `legacyUrl` is the global species grid (`/Browse/Species`, any sort/page/filter query variant) - prong 6 scope (a). */
function isGlobalSpeciesGridArtifact(legacyUrl: string): boolean {
  return matchLegacyUrl(rawPathnameOf(legacyUrl))?.entry.id === "browse-species-list";
}

/** True when `legacyUrl` is exactly `/Browse/States/25/Details` (North Carolina) - prong 6 scope (b), a single closed artifact. */
function isD016Prong6StateScopeArtifact(legacyUrl: string): boolean {
  const match = matchLegacyUrl(rawPathnameOf(legacyUrl));
  return match?.entry.id === "state-details" && match.params.id === String(D016_PRONG6_STATE_ID);
}

/**
 * Prong 6 scope (a)'s expected delta: the count of `D016_MERGED_PAIRS`
 * matching THIS artifact's OWN filter query params under the species grid's
 * real filter semantics (`db/queries/browse-grids.sql.ts`'s `browseSpecies`:
 * independent `botanicalNameFilter`/`commonNameFilter`, each an ILIKE-
 * anywhere predicate, ANDed together only when both are present - a pair
 * counts iff it passes BOTH filters that were actually supplied). Neither
 * filter present (the corpus's own `?filter=a` param is not a name either
 * side's real query recognizes, so every captured species-grid artifact is
 * effectively unfiltered) -> every pair counts, matching the verified
 * unfiltered 764->761 delta of exactly 3.
 */
function expectedD016MergedPairCountForSpeciesGridFilter(legacyUrl: string): number {
  const q = new URLSearchParams(legacyUrl.split("?")[1] ?? "");
  const botanicalFilter = q.get("botanicalNameFilter");
  const commonFilter = q.get("commonNameFilter");
  if (!botanicalFilter && !commonFilter) return D016_MERGED_PAIRS.length;
  return D016_MERGED_PAIRS.filter(
    (p) =>
      (!botanicalFilter || likeAnywhereMatches(p.botanicalName, botanicalFilter)) &&
      (!commonFilter || likeAnywhereMatches(p.commonName, commonFilter)),
  ).length;
}

export type D016CountOnlyRescueScope = "global-species-grid" | "state-25";

/**
 * Prong 6 (count-only diffs from off-page merged rows, waivers.md W-010):
 * classifies `legacyUrl` against the two CLOSED scopes this prong covers,
 * returning the exact expected legacy-minus-new count delta for whichever
 * scope matches (or null for every other artifact - never pattern-
 * extended). Callers (verify/pages.ts) apply this ONLY when a grid's own
 * diff set is `pageInfo`/count-only (zero row diffs at all) - a grid WITH
 * row diffs is governed by prong 4's iff-rule instead, never this one; that
 * precondition is this function's caller's responsibility, not checked
 * here (this function only answers "which scope, what delta").
 */
export function classifyD016CountOnlyScope(legacyUrl: string): { scope: D016CountOnlyRescueScope; expectedDelta: number } | null {
  if (isGlobalSpeciesGridArtifact(legacyUrl)) {
    return { scope: "global-species-grid", expectedDelta: expectedD016MergedPairCountForSpeciesGridFilter(legacyUrl) };
  }
  if (isD016Prong6StateScopeArtifact(legacyUrl)) {
    return { scope: "state-25", expectedDelta: 1 };
  }
  return null;
}

/** Extracts the trailing "of N entries" total from a grid `pageInfo` string (schema.ts's `GridJson.pageInfo`, e.g. `"Showing 1 to 40 of 764 entries"`). Returns null when unparseable (the `"No entries"` / `"...(filtered from N total entries)"` shapes doc 07 §5.4 documents) - extraction failure simply means prong 6 doesn't apply, not an error. */
export function extractGridEntryTotal(pageInfo: unknown): number | null {
  if (typeof pageInfo !== "string") return null;
  const m = /of (\d+) entries/.exec(pageInfo);
  return m ? Number(m[1]) : null;
}
