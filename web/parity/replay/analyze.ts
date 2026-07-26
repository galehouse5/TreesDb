#!/usr/bin/env tsx
/**
 * Post-hoc, EVIDENCE-CHECKED failure-bucketing for a replay report (doc 07
 * §8 investigation step: "for each failing trip, investigate individually
 * ... determine ENGINE BUG vs DATA DRIFT"). Not part of the pass/fail
 * harness itself (run.ts/differ.ts are the ground truth) -- classifies each
 * failing trip's diffs against known, INDEPENDENTLY VERIFIABLE data-drift
 * root causes, so a human reviewer only has to look hard at trips whose
 * diffs do NOT already have a confirmed explanation.
 *
 * "Evidence-checked" is load-bearing: every non-trivial bucket below is
 * backed by a query against the LIVE `treesdb` (read-only -- this script
 * never writes) that independently confirms the drift ALREADY existed
 * before replay touched anything, rather than pattern-matching field names
 * alone (which would risk silently waiving a genuine engine bug that
 * happens to produce a similarly-shaped diff). Evidence sets are
 * precomputed in bulk (one query per class, not one per diff/trip) so the
 * full 1,694-trip report classifies in a few seconds.
 *
 * Root causes (task P3-02 round 2 investigation; see the task report for
 * the full citations):
 *   A. `calculated_{latitude,longitude}_input_format` value-only mismatch --
 *      Tmd.Migrations/Y2016/M001_MakeCoordinatesOptional.cs added these
 *      columns to a LIVE legacy database with a hardcoded default of 2
 *      ("Default") and back-filled only the `calculated*=0` case to
 *      Unspecified(1); every pre-existing row's format code was never
 *      computed by application code, just defaulted by the migration.
 *   B. Canonical-table text-field edits never reflected back into the
 *      immutable `import_sites`/`import_trees` staging log (`county`,
 *      `name`, `ownership_type`, `ownership_contact_info`, `comments`,
 *      `trip_report_url`, `make_ownership_contact_info_public`) -- e.g. a
 *      bulk cleanup appended " County" to `sites`/`site_visits.county`
 *      (Hennepin -> Hennepin County) without touching the import log.
 *   C. `champion_points`/`abbreviated_champion_points` off by a couple
 *      ULPs -- the ALREADY-DOCUMENTED x87-vs-SSE2 excess-precision hazard
 *      (lib/merge/derived.ts file header, derived-parity.test.ts row 2343).
 *   D. `tree_measurers` missing-row where the SAME (tree, first, last) pair
 *      already has >1 row in the LIVE `tree_measurers` (measurement_id IS
 *      NULL) table -- production never fully deduped historically;
 *      replay's dedup (matching Tree.cs's current `Distinct()` semantics)
 *      correctly keeps exactly one, "losing" against the live duplicate(s).
 *   E. Pre-2013-09-10 same-visit sibling-tree merge: legacy commit
 *      83a3445e ("Fixed bug preventing measurements of the same tree from
 *      merging correctly when captured within the same visit", 2013-09-10)
 *      changed Site.cs/Tree.cs's same-visit merge behavior. A trip dated
 *      before that fix may have imported two SEPARATE trees sharing
 *      identical name+coordinates (which CURRENT `shouldMergeTree` would
 *      merge); replay -- running today's faithfully-ported algorithm --
 *      consolidates them, shrinking `computed_trees_measured_count` by
 *      one, shifting the surviving tree's headline, and shrinking the
 *      global `trees` count by one. Evidence: the site currently has (in
 *      live `treesdb`) exactly such an un-consolidated duplicate pair.
 *   F. Stale cached site headline (`visit_count`, coordinates) after an
 *      out-of-band deletion of a child `site_visits` row that bypassed
 *      `RecalculateProperties` -- evidence: the site's OWN cached
 *      `visit_count` already disagrees with `count(*) from site_visits`
 *      in the LIVE database, i.e. the staleness predates replay entirely.
 *   G. Taxonomic-name corrections applied to canonical tables only
 *      (Carya tomentosa <-> Carya alba, Quercus montana <-> Quercus
 *      prinus) -- a closed, verified pair list. The paired
 *      `computed_measured_species_id` mismatch on the same row is included
 *      mechanically (it's a hash of the name, so it moves in lockstep).
 *   H. `latitude`/`longitude`/`calculated_latitude`/`calculated_longitude`
 *      off by <= 2 float32 ULP -- same class of hazard as C, applied to
 *      the coordinate-bounds-center averaging formula instead of
 *      champion-points.
 *   I. `import_trees` row that is entirely blank (no name, no
 *      measurements) and was `created` AFTER its trip's own `imported`
 *      timestamp -- proof (not inference) that the row was added via the
 *      wizard's Trees step being reopened well after the trip was
 *      finished (no `IsImported` gate exists on those actions -- verified
 *      in TMD/Controllers/ImportController.cs) and Finish/Reimport was
 *      never invoked again to pick it up. `import_trees` is therefore NOT
 *      an immutable historical log in this specific case; replay
 *      (correctly, faithfully) imports whatever is there today, producing
 *      a real extra tree that was never part of any actual import run.
 *      Verified: ALL 7 blank-`common_name` `import_trees` rows in the
 *      entire database were created after their trip's `imported`
 *      timestamp -- zero counterexamples.
 *   K. Ambiguous-sibling attribution swap -- an ORACLE LIMITATION, not data
 *      drift or an engine bug. A site can legitimately hold several
 *      DISTINCT trees sharing identical (common_name, scientific_name,
 *      unspecified coordinates) -- `shouldMergeTree` never merges them
 *      (both sides must have SPECIFIED coordinates to match), so e.g. 8
 *      separate "White Oak"/"Quercus alba" @ (0,0) trees can coexist at one
 *      site (verified: site 40130, "Wizard Of Oz Oak Grove"). When a
 *      replayed trip touches 2+ of these truly-indistinguishable-by-key
 *      siblings, `matchMultiset`'s positional fallback (natural-keys.ts) has
 *      no principled way to know which recreated tree corresponds to which
 *      original one -- the value SET is faithfully reproduced, just
 *      possibly cross-attributed. Detected mechanically and SAFELY here
 *      (no DB evidence needed): two `value-mismatch` diffs on the same
 *      field are an exact swap iff `d1.expected === d2.actual &&
 *      d1.actual === d2.expected` -- which is only possible if the
 *      underlying two-value multiset is unchanged.
 *
 * Usage: npx tsx parity/replay/analyze.ts [path-to-report.json] [--database-url <url>]
 */
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import postgres from "postgres";
import type { ReplaySummary, TripResult } from "./report";
import type { StructuredDiff } from "./differ";
import { fround } from "../../lib/units/float32";

// ---------------------------------------------------------------------------
// Bucket A/B/C -- no DB evidence needed (pure field-shape rules, unchanged
// from the shakedown investigation).
// ---------------------------------------------------------------------------

type Bucket =
  | "A-calc-format"
  | "B-text-edit"
  | "C-champion-ulp"
  | "D-dup-measurer"
  | "E-pre2013-sibling-merge"
  | "F-stale-headline"
  | "G-taxonomy-rename"
  | "H-coordinate-ulp"
  | "I-post-finish-blank-tree"
  | "K-ambiguous-sibling-swap";

const CALC_FORMAT_FIELDS = new Set(["calculated_latitude_input_format", "calculated_longitude_input_format"]);
const CHAMPION_FIELDS = new Set(["champion_points", "abbreviated_champion_points"]);
const TEXT_EDIT_FIELDS = new Set(["name", "ownership_type", "ownership_contact_info", "comments", "make_ownership_contact_info_public", "trip_report_url"]);
const COORDINATE_FIELDS = new Set(["latitude", "longitude", "calculated_latitude", "calculated_longitude"]);

/** Taxonomic synonym pairs verified against production (task investigation) -- closed list, never pattern-extended. */
const TAXONOMY_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["Carya tomentosa", "Carya alba"],
  ["Quercus montana", "Quercus prinus"],
];

function isTaxonomyPair(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  return TAXONOMY_PAIRS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

/** float32 ULP at `v` (distance to the next-representable float32 value) -- a magnitude-relative tolerance, not a fixed epsilon (doc 07 §6 forbids those; a ULP bound is the smallest possible non-zero float32 difference at that magnitude, so it can't hide real formula drift). */
function float32Ulp(v: number): number {
  const f = Math.fround(v);
  if (f === 0) return 1.401298464324817e-45; // smallest positive subnormal float32
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, f);
  const bits = view.getUint32(0);
  view.setUint32(0, f > 0 ? bits + 1 : bits - 1);
  return Math.abs(view.getFloat32(0) - f);
}

function isWithinUlps(expected: unknown, actual: unknown, maxUlps: number): boolean {
  if (typeof expected !== "number" || typeof actual !== "number") return false;
  const diff = Math.abs(fround(expected) - fround(actual));
  return diff <= maxUlps * float32Ulp(expected);
}

// ---------------------------------------------------------------------------
// Bulk evidence sets (D/E/F/I) -- one query per class, precomputed once.
// ---------------------------------------------------------------------------

interface Evidence {
  /** "$treeId $firstName $lastName" keys with >1 tree-level tree_measurers row live today (bucket D). */
  dupMeasurers: Set<string>;
  /** siteIds that currently contain 2+ trees sharing (common_name, scientific_name, latitude, longitude) live today (bucket E). */
  dupCoordSites: Set<number>;
  /** tripId -> date (for the pre-2013-09-10 test, bucket E). */
  tripDates: Map<number, string | null>;
  /** siteIds whose cached `visit_count` already disagrees with the live `site_visits` count (bucket F). */
  staleVisitCountSites: Set<number>;
  /** tripIds with a blank `import_trees` row created after the trip's own `imported` timestamp (bucket I). */
  postFinishBlankTreeTrips: Set<number>;
}

const M001_CUTOVER = "2013-09-10"; // TMD.Model/Sites/Site.cs, Tree.cs -- commit 83a3445e

async function loadEvidence(databaseUrl: string): Promise<Evidence> {
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    const dupMeasurerRows = await sql<{ tree_id: number; first_name: string; last_name: string }[]>`
      select tree_id, first_name, last_name
      from tree_measurers
      where measurement_id is null
      group by tree_id, first_name, last_name
      having count(*) > 1
    `;
    const dupMeasurers = new Set(dupMeasurerRows.map((r) => `${r.tree_id} ${r.first_name} ${r.last_name}`));

    const dupCoordRows = await sql<{ site_id: number }[]>`
      select site_id
      from trees
      group by site_id, common_name, scientific_name, latitude, longitude
      having count(*) > 1
    `;
    const dupCoordSites = new Set(dupCoordRows.map((r) => r.site_id));

    // `to_char` (not a bare `date` select) sidesteps the postgres.js `date`
    // column hazard documented throughout this codebase (e.g. engine.ts's
    // `toDateOnlyString`): the driver parses `date` into a JS `Date` at UTC
    // midnight, not a plain string, which a naive string comparison against
    // M001_CUTOVER would silently and permanently fail on.
    const tripDateRows = await sql<{ id: number; date: string | null }[]>`
      select id, to_char(date, 'YYYY-MM-DD') as date from import_trips
    `;
    const tripDates = new Map(tripDateRows.map((r) => [r.id, r.date]));

    const staleVisitRows = await sql<{ id: number }[]>`
      select s.id
      from sites s
      join (select site_id, count(*)::int as n from site_visits group by site_id) actual on actual.site_id = s.id
      where s.visit_count <> actual.n
    `;
    const staleVisitCountSites = new Set(staleVisitRows.map((r) => r.id));

    const blankTreeRows = await sql<{ trip_id: number }[]>`
      select distinct s.trip_id
      from import_trees it
      join import_sites s on s.id = it.site_id
      join import_trips t on t.id = s.trip_id
      where it.common_name = '' and t.imported is not null and it.created > t.imported
    `;
    const postFinishBlankTreeTrips = new Set(blankTreeRows.map((r) => r.trip_id));

    return { dupMeasurers, dupCoordSites, tripDates, staleVisitCountSites, postFinishBlankTreeTrips };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

// ---------------------------------------------------------------------------
// Per-diff classification (self-contained buckets A/B/C/D/G/H -- no
// cross-diff reasoning needed beyond the taxonomy-rename sibling lookup).
// ---------------------------------------------------------------------------

function classifyDiff(d: StructuredDiff, ev: Evidence, siblingScientificNameIsTaxonomyPair: boolean): Bucket | null {
  if (d.kind === "value-mismatch" && d.field) {
    if (CALC_FORMAT_FIELDS.has(d.field)) return "A-calc-format";

    if (d.field === "county" && typeof d.expected === "string" && typeof d.actual === "string") {
      if (d.expected === `${d.actual} County` || d.actual === `${d.expected} County`) return "B-text-edit";
    }
    if (TEXT_EDIT_FIELDS.has(d.field)) return "B-text-edit";

    if (CHAMPION_FIELDS.has(d.field) && isWithinUlps(d.expected, d.actual, 2)) return "C-champion-ulp";

    if (d.field === "scientific_name" && isTaxonomyPair(d.expected, d.actual)) return "G-taxonomy-rename";
    if (d.field === "computed_measured_species_id" && siblingScientificNameIsTaxonomyPair) return "G-taxonomy-rename";

    // A coordinate diff on a site already independently confirmed stale via
    // visit_count is attributed to F (DB-confirmed pre-existing staleness),
    // checked BEFORE the H ULP heuristic even though a small drift might
    // also pass H -- F is the more specific, better-evidenced explanation.
    if (COORDINATE_FIELDS.has(d.field) && d.context?.siteId != null && ev.staleVisitCountSites.has(d.context.siteId)) return "F-stale-headline";
    if (COORDINATE_FIELDS.has(d.field) && isWithinUlps(d.expected, d.actual, 2)) return "H-coordinate-ulp";
    if (d.field === "visit_count" && d.context?.siteId != null && ev.staleVisitCountSites.has(d.context.siteId)) return "F-stale-headline";
  }

  if (d.kind === "missing-row" && d.entity === "tree-measurer" && d.context?.treeId != null) {
    const expected = d.expected as { first_name?: string; last_name?: string } | undefined;
    if (expected?.first_name && expected.last_name) {
      const key = `${d.context.treeId} ${expected.first_name} ${expected.last_name}`;
      if (ev.dupMeasurers.has(key)) return "D-dup-measurer";
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Trip-level classification -- buckets E and I require reasoning across the
// WHOLE trip (a date/evidence test AND a confinement test), not a single
// diff in isolation.
// ---------------------------------------------------------------------------

interface TripClassification {
  tripId: number;
  status: TripResult["status"];
  fullyExplained: boolean;
  buckets: Record<string, number>;
  unexplainedDiffs: StructuredDiff[];
}

/** True if diff `d` is plausibly part of an E-shaped consolidation at a site already confirmed (via `dupCoordSites`) to hold an un-merged duplicate pair -- covers the site/state metric shift, the surviving tree's headline shift, the absorbed tree's "missing-row", and the absorbed measurement's "extra-row"/measurer-bag changes. */
function isEConfined(d: StructuredDiff, dupCoordSiteIds: ReadonlySet<number>): boolean {
  // State-level diffs never carry a siteId (differ.ts's state comparison is
  // top-level, not nested under any one site) -- a tree-count cascade onto
  // the state is still plausibly confined as long as SOME other diff in the
  // same trip is anchored to a confirmed dup-coord site (the caller's
  // `.every()` over the WHOLE diff set is what actually enforces that; a
  // state-only diff set with no site/tree evidence would never reach here
  // in practice since every real E case also touches its site).
  if (d.entity === "state") return d.field === "computed_trees_measured_count";

  const siteId = d.context?.siteId;
  if (siteId == null || !dupCoordSiteIds.has(siteId)) return false;
  if (d.entity === "site" && typeof d.field === "string" && (d.field === "computed_trees_measured_count" || d.field.startsWith("computed_rhi") || d.field.startsWith("computed_rgi"))) return true;
  if (d.entity === "tree") return true; // headline shift (value-mismatch) or the absorbed sibling (missing-row)
  if (d.entity === "measurement") return true; // the absorbed sibling's own measurement joining the survivor
  if (d.entity === "tree-measurer" || d.entity === "photo-reference") return true; // measurer/photo bag reshuffled by the consolidation
  return false;
}

/** True if diff `d` is plausibly the cascading shape of an extra blank/(Unidentified) tree (bucket I): the tree itself, or a count/metric shift on its site or state. */
function isIConfined(d: StructuredDiff): boolean {
  if (d.entity === "state" && d.field === "computed_trees_measured_count") return true;
  if (d.entity === "site" && typeof d.field === "string" && (d.field === "computed_trees_measured_count" || d.field.startsWith("computed_rhi") || d.field.startsWith("computed_rgi"))) return true;
  if (d.entity === "tree" && d.kind === "extra-row") {
    const actual = d.actual as { common_name?: string; scientific_name?: string } | undefined;
    return actual?.common_name === "" && actual?.scientific_name === "(Unidentified)";
  }
  return false;
}

/**
 * Bucket F's "whole site replacement" shape: a site's cached headline
 * (typically `visit_count`/coordinates) was already stale in the live DB
 * (per `staleVisitCountSites`), and the drift is large enough that
 * `siteIdentityKey`'s coordinate-rounding treats the freshly-recomputed
 * site as a DIFFERENT identity from its own pre-image -- showing up as a
 * "missing-row site" (the stale pre-image) paired with an "extra-row site"
 * (the freshly recomputed one) instead of a field-level diff. Matched by
 * name+state+county (the part of identity that never actually changed).
 */
function consumeFSiteReplacementPairs(diffs: readonly StructuredDiff[], staleVisitCountSites: ReadonlySet<number>): Set<StructuredDiff> {
  const consumed = new Set<StructuredDiff>();
  const missing = diffs.filter((d) => d.kind === "missing-row" && d.entity === "site" && d.context?.siteId != null && staleVisitCountSites.has(d.context.siteId));
  const extra = diffs.filter((d) => d.kind === "extra-row" && d.entity === "site");
  for (const m of missing) {
    const exp = m.expected as { name?: unknown; state_id?: unknown; county?: unknown } | undefined;
    const match = extra.find((e) => {
      if (consumed.has(e)) return false;
      const act = e.actual as { name?: unknown; state_id?: unknown; county?: unknown } | undefined;
      return !!exp && !!act && act.name === exp.name && act.state_id === exp.state_id && act.county === exp.county;
    });
    if (match) {
      consumed.add(m);
      consumed.add(match);
    }
  }
  return consumed;
}

/**
 * Bucket K: pairs of `value-mismatch` diffs on the same field that are
 * exact opposites of each other (`d1.expected === d2.actual && d1.actual
 * === d2.expected`). This is a SAFE, evidence-free rule: an exact swap is
 * only possible if the two-value multiset itself is unchanged between pre
 * and post -- it cannot mask a genuine single-sided value change (that
 * would leave one side unmatched). Restricted to `entity` values where
 * cross-sibling ambiguity is actually possible (tree/measurement/
 * tree-measurer/site-visitor -- never site/state, which are matched by a
 * key that already includes coordinates).
 */
const SWAPPABLE_ENTITIES = new Set(["tree", "measurement", "tree-measurer", "site-visitor"]);

function consumeSwapPairs(diffs: readonly StructuredDiff[]): Set<StructuredDiff> {
  const consumed = new Set<StructuredDiff>();
  const candidates = diffs.filter((d) => d.kind === "value-mismatch" && SWAPPABLE_ENTITIES.has(d.entity));
  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i]!;
    if (consumed.has(a)) continue;
    for (let j = i + 1; j < candidates.length; j++) {
      const b = candidates[j]!;
      if (consumed.has(b)) continue;
      if (a.field === b.field && a.expected === b.actual && a.actual === b.expected) {
        consumed.add(a);
        consumed.add(b);
        break;
      }
    }
  }
  return consumed;
}

function classifyTrip(r: TripResult, ev: Evidence): TripClassification {
  const diffs = r.diffs ?? [];
  const buckets: Record<string, number> = {};

  // Bucket G needs to know, per trip, whether a sibling scientific_name diff
  // on the SAME row (measurementId, falling back to treeId) is itself a
  // confirmed taxonomy-pair rename, before a computed_measured_species_id
  // diff on that same row can ride along.
  const taxonomyRenamedKeys = new Set<string>();
  for (const d of diffs) {
    if (d.kind === "value-mismatch" && d.field === "scientific_name" && isTaxonomyPair(d.expected, d.actual)) {
      const key = d.context?.measurementId != null ? `m${d.context.measurementId}` : d.context?.treeId != null ? `t${d.context.treeId}` : null;
      if (key) taxonomyRenamedKeys.add(key);
    }
  }

  const afterSimpleBuckets: StructuredDiff[] = [];
  for (const d of diffs) {
    const key = d.context?.measurementId != null ? `m${d.context.measurementId}` : d.context?.treeId != null ? `t${d.context.treeId}` : null;
    const siblingIsTaxonomyPair = key != null && taxonomyRenamedKeys.has(key);
    const b = classifyDiff(d, ev, siblingIsTaxonomyPair);
    if (b) buckets[b] = (buckets[b] ?? 0) + 1;
    else afterSimpleBuckets.push(d);
  }

  // Bucket K: exact-swap pairs among ambiguous (unspecified-coordinate)
  // siblings -- safe to apply unconditionally, before any evidence-gated
  // bucket, since a matched pair can only exist if the value multiset is
  // provably unchanged (see consumeSwapPairs's own doc comment).
  const swapPairs = consumeSwapPairs(afterSimpleBuckets);
  const afterK = afterSimpleBuckets.filter((d) => !swapPairs.has(d));
  if (swapPairs.size > 0) buckets["K-ambiguous-sibling-swap"] = swapPairs.size;

  // Bucket E: date test AND confinement test, applied to whatever's left.
  const tripDate = ev.tripDates.get(r.tripId);
  const isPre2013 = typeof tripDate === "string" && tripDate < M001_CUTOVER;
  let afterE = afterK;
  if (isPre2013 && afterK.length > 0 && afterK.every((d) => isEConfined(d, ev.dupCoordSites))) {
    buckets["E-pre2013-sibling-merge"] = afterK.length;
    afterE = [];
  }

  // Bucket I: evidence test (a confirmed post-Finish blank tree exists for
  // this trip) AND confinement test, applied to whatever's left after E.
  let afterI = afterE;
  if (ev.postFinishBlankTreeTrips.has(r.tripId) && afterE.length > 0 && afterE.every(isIConfined)) {
    buckets["I-post-finish-blank-tree"] = afterE.length;
    afterI = [];
  }

  // Bucket F (whole-site-replacement shape): evidence-matched missing/extra
  // site pairs, applied to whatever's left after E and I.
  const fPairs = consumeFSiteReplacementPairs(afterI, ev.staleVisitCountSites);
  const afterF = afterI.filter((d) => !fPairs.has(d));
  if (fPairs.size > 0) buckets["F-stale-headline"] = (buckets["F-stale-headline"] ?? 0) + fPairs.size;

  const globalCountDiffs = r.globalCountDiffs ?? [];
  const globalCountsExplainedByE = (buckets["E-pre2013-sibling-merge"] ?? 0) > 0 && globalCountDiffs.every((g) => g.field === "trees" || g.field === "treeMeasurements" || g.field === "sites");
  const globalCountsExplainedByI = (buckets["I-post-finish-blank-tree"] ?? 0) > 0 && globalCountDiffs.every((g) => g.field === "trees" || g.field === "treeMeasurements");
  const globalCountsOk = globalCountDiffs.length === 0 || globalCountsExplainedByE || globalCountsExplainedByI;

  return {
    tripId: r.tripId,
    status: r.status,
    fullyExplained: r.status === "fail" && afterF.length === 0 && globalCountsOk,
    buckets,
    unexplainedDiffs: afterF,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: { "database-url": { type: "string" } },
    allowPositionals: true,
  });
  const reportPath = positionals[0] ?? "parity/reports/replay-checkpoint.json";
  const databaseUrl = values["database-url"] ?? process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("analyze.ts: no database URL -- pass --database-url or set DATABASE_URL");

  const summary = JSON.parse(await readFile(reportPath, "utf-8")) as ReplaySummary;
  const evidence = await loadEvidence(databaseUrl);

  const classifications = summary.results.map((r) => classifyTrip(r, evidence));

  const pass = classifications.filter((c) => c.status === "pass").length;
  const engineErrors = classifications.filter((c) => c.status === "engine-error");
  const failing = classifications.filter((c) => c.status === "fail");
  const fullyExplained = failing.filter((c) => c.fullyExplained);
  const needsReview = failing.filter((c) => !c.fullyExplained);

  const bucketTripCounts: Record<string, number[]> = {};
  for (const c of fullyExplained) {
    for (const b of Object.keys(c.buckets)) {
      (bucketTripCounts[b] ??= []).push(c.tripId);
    }
  }

  console.log(`Report: ${reportPath}`);
  console.log(`Total trips: ${summary.results.length}`);
  console.log(`  pass:                  ${pass}`);
  console.log(`  fail, fully explained: ${fullyExplained.length}`);
  console.log(`  fail, needs review:    ${needsReview.length}`);
  console.log(`  engine-error:          ${engineErrors.length}`);
  console.log("");
  console.log("Per-bucket trip counts (a trip may land in multiple buckets):");
  for (const [b, trips] of Object.entries(bucketTripCounts).sort()) {
    console.log(`  ${b}: ${trips.length} trip(s) -- e.g. ${trips.slice(0, 10).join(", ")}`);
  }

  if (engineErrors.length > 0) {
    console.log(`\n=== engine-error trips (${engineErrors.length}) ===`);
    for (const c of engineErrors) {
      const full = summary.results.find((r) => r.tripId === c.tripId);
      console.log(`  trip ${c.tripId}: ${full?.error?.slice(0, 300)}`);
    }
  }

  if (needsReview.length > 0) {
    console.log(`\n=== trips needing individual review (${needsReview.length}) ===`);
    for (const c of needsReview) {
      console.log(`  trip ${c.tripId}: ${c.unexplainedDiffs.length} unexplained diff(s)`);
      for (const d of c.unexplainedDiffs.slice(0, 5)) {
        console.log(`    - ${d.kind} ${d.entity} ${d.identity}${d.field ? ` field=${d.field} expected=${JSON.stringify(d.expected)} actual=${JSON.stringify(d.actual)}` : ""}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exitCode = 1;
});
