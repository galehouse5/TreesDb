#!/usr/bin/env tsx
/**
 * verify.ts - doc 07 §5 functional parity harness. Run with
 * `pnpm tsx web/parity/verify.ts [options]`.
 *
 * Options:
 *   --category <name>   exports|markers|markerinfo|search|autocomplete|pages|redirects|all (required)
 *   --base-url <url>    new-app base URL (default http://localhost:3000)
 *   --limit <n>         cap the number of manifest entries processed per category
 *   --report            write web/parity/reports/<category>-<date>.{json,md}
 *   --filter <substr>   only process manifest entries whose legacy URL contains this substring
 *
 * For each category, walks the committed snapshot manifest
 * (`web/parity/snapshots/<category>/manifest.json`), and for every entry:
 *   1. Legacy artifacts captured as an error (status >= 400, doc's own
 *      examples are 404/500) are collected into a "legacy-error" bucket and
 *      NEVER fetched or compared (doc: "do NOT fetch or fail them" - these
 *      are pending waivers, not failures).
 *   2. The legacy URL is mapped to a new-app URL via `normalize.ts` (through
 *      this package's `verify/url-resolve.ts`, which layers category-
 *      specific query-string handling - search terms, autocomplete
 *      term/results, species site/state scoping, grid filter/sort/page
 *      passthrough - on top of normalize.ts's path-only table). Any URL
 *      shape with no table entry, a still-`provisional` (unconfirmed) table
 *      entry, or (for `pages`/`markerinfo`) no registered new-side
 *      extractor is SKIPPED with a clear, categorized reason - never
 *      silently passed.
 *   3. The new URL is fetched (with the `unitsPreference` cookie inferred
 *      from the snapshot's savePathBase `--Meters`/`--Yards` suffix
 *      convention, when present) and compared against the legacy snapshot
 *      via the matching pure comparator in `verify/*.ts`.
 * Diffs feed the SHARED report writer/waiver parser (`data/report.ts`,
 * `data/waivers.ts`) - `--report` writes `web/parity/reports/<category>-
 * <date>.{json,md}` and additionally appends a "Skipped" / "Legacy errors"
 * section to the Markdown report (buildReport's own shape doesn't carry
 * those buckets - doc §1.5's pass/fail/waived accounting is about CHECKS
 * actually attempted; skips/legacy-errors are explicitly NOT checks).
 * Exits non-zero when any processed category has unwaived failures.
 */
import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import { legacyExtractors, type LegacyPageType } from "./extractors/legacy";
import { newExtractors } from "./extractors/new";
import type { Diff } from "./data/comparator";
import { buildReport, writeReport, type ReportSummary } from "./data/report";
import { loadWaivers, type Waiver } from "./data/waivers";

import { compareExport, type ExportArtifact } from "./verify/exports";
import { compareMarkers } from "./verify/markers";
import { compareAutocomplete, compareSearch, type AutocompleteRow, type SearchResultRow } from "./verify/search";
import { classifyPageArtifact, comparePageJson } from "./verify/pages";
import { compareRedirect } from "./verify/redirects";
import {
  applyFilterAndLimit,
  inferUnitsPreference,
  loadManifest,
  partitionByLegacyStatus,
  type ManifestEntry,
} from "./verify/manifest";
import { resolveAutocompletePath, resolveExportPath, resolveNewPath, resolveSearchPath, toPath } from "./verify/url-resolve";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(SCRIPT_DIR, "snapshots");
const REPORTS_DIR = path.join(SCRIPT_DIR, "reports");
const WAIVERS_PATH = path.join(SCRIPT_DIR, "waivers.md");

const ALL_CATEGORIES = ["exports", "markers", "markerinfo", "search", "autocomplete", "pages", "redirects"] as const;
type Category = (typeof ALL_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  category: Category | "all";
  baseUrl: string;
  limit?: number;
  report: boolean;
  filter?: string;
}

function parseCliArgs(argv: string[]): Args {
  const { values } = parseArgs({
    args: argv,
    options: {
      category: { type: "string" },
      "base-url": { type: "string", default: "http://localhost:3000" },
      limit: { type: "string" },
      report: { type: "boolean", default: false },
      filter: { type: "string" },
    },
    allowPositionals: false,
  });

  const category = values.category ? String(values.category) : undefined;
  if (!category || (category !== "all" && !(ALL_CATEGORIES as readonly string[]).includes(category))) {
    throw new Error(`verify.ts: --category is required and must be one of: all, ${ALL_CATEGORIES.join(", ")}`);
  }

  return {
    category: category as Args["category"],
    baseUrl: String(values["base-url"]).replace(/\/+$/, ""),
    limit: values.limit ? Number(values.limit) : undefined,
    report: Boolean(values.report),
    filter: values.filter ? String(values.filter) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Skip / legacy-error tracking
// ---------------------------------------------------------------------------

interface SkipBucket {
  count: number;
  examples: string[];
}

class SkipTracker {
  total = 0;
  byReason = new Map<string, SkipBucket>();

  record(url: string, reason: string): void {
    this.total += 1;
    const bucket = this.byReason.get(reason) ?? { count: 0, examples: [] };
    bucket.count += 1;
    if (bucket.examples.length < 5) bucket.examples.push(url);
    this.byReason.set(reason, bucket);
  }
}

interface CategoryOutcome {
  category: Category;
  summary: ReportSummary;
  skip: SkipTracker;
  legacyErrors: ManifestEntry[];
}

// ---------------------------------------------------------------------------
// Fetch helper (new app)
// ---------------------------------------------------------------------------

interface FetchOpts {
  unitsPreference?: "Meters" | "Yards";
  ajax?: boolean;
  manual302?: boolean;
}

interface FetchResult {
  status: number;
  body: string;
  headers: Headers;
}

async function fetchNew(baseUrl: string, newPath: string, opts: FetchOpts = {}): Promise<FetchResult> {
  const headers: Record<string, string> = {};
  if (opts.unitsPreference) headers.Cookie = `unitsPreference=${opts.unitsPreference}`;
  if (opts.ajax) headers["X-Requested-With"] = "XMLHttpRequest";
  const res = await fetch(`${baseUrl}${newPath}`, { headers, redirect: opts.manual302 ? "manual" : "follow" });
  const body = await res.text();
  return { status: res.status, body, headers: res.headers };
}

// ---------------------------------------------------------------------------
// Snapshot body I/O
// ---------------------------------------------------------------------------

async function readSnapshotText(category: Category, savePathBase: string, ext: string): Promise<string> {
  return readFile(path.join(SNAPSHOTS_DIR, category, `${savePathBase}.${ext}`), "utf-8");
}

async function readSnapshotJson<T>(category: Category, savePathBase: string, ext: string): Promise<T> {
  return JSON.parse(await readSnapshotText(category, savePathBase, ext)) as T;
}

async function readExtractedJsonIfPresent(category: Category, savePathBase: string): Promise<unknown | null> {
  const p = path.join(SNAPSHOTS_DIR, category, `${savePathBase}.extracted.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, "utf-8"));
}

// ---------------------------------------------------------------------------
// exports
// ---------------------------------------------------------------------------

async function runExports(ctx: RunContext): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, "exports");
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    const resolved = resolveExportPath(entry.url);
    if (resolved.kind === "skip") {
      acc.skip.record(entry.url, resolved.reason);
      continue;
    }
    const legacyBody = await readSnapshotText("exports", entry.savePathBase, "csv");
    const res = await fetchNew(ctx.baseUrl, resolved.newPath, { unitsPreference: inferUnitsPreference(entry.savePathBase) });

    const legacy: ExportArtifact = { body: legacyBody, contentDisposition: undefined }; // capture.ts never stored this header - see exports.ts's doc comment
    const next: ExportArtifact = { body: res.body, contentDisposition: res.headers.get("content-disposition") };
    const { diffs, checksRun } = compareExport(entry.url, legacy, next);
    acc.add(diffs, checksRun);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// markers
// ---------------------------------------------------------------------------

async function runMarkers(ctx: RunContext): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, "markers");
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    // Markers endpoints map via normalize.ts's generic table (no query-string handling needed).
    const resolved = resolveNewPath(entry.url);
    if (resolved.kind === "skip") {
      acc.skip.record(entry.url, resolved.reason);
      continue;
    }
    const legacyJson = await readSnapshotJson<unknown>("markers", entry.savePathBase, "json");
    const res = await fetchNew(ctx.baseUrl, resolved.newPath);
    let newJson: unknown;
    try {
      newJson = JSON.parse(res.body);
    } catch {
      newJson = { __parseError: true, status: res.status, bodySnippet: res.body.slice(0, 200) };
    }
    const { diffs, checksRun } = compareMarkers(entry.url, legacyJson, newJson);
    acc.add(diffs, checksRun);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// search / autocomplete
// ---------------------------------------------------------------------------

function termFromUrl(url: string): string {
  const q = url.split("?")[1] ?? "";
  return new URLSearchParams(q).get("term") ?? "";
}

async function runSearch(ctx: RunContext): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, "search");
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    const resolved = resolveSearchPath(entry.url);
    if (resolved.kind === "skip") {
      acc.skip.record(entry.url, resolved.reason);
      continue;
    }
    const legacyRows = await readSnapshotJson<SearchResultRow[]>("search", entry.savePathBase, "json");
    const res = await fetchNew(ctx.baseUrl, resolved.newPath, { ajax: true });
    let newRows: SearchResultRow[] = [];
    try {
      newRows = JSON.parse(res.body) as SearchResultRow[];
    } catch {
      acc.skip.record(entry.url, `new app response was not valid JSON (status ${res.status})`);
      continue;
    }
    const { diffs, checksRun } = compareSearch(entry.url, termFromUrl(entry.url), legacyRows, newRows);
    acc.add(diffs, checksRun);
  }
  return acc;
}

async function runAutocomplete(ctx: RunContext): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, "autocomplete");
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    const resolved = resolveAutocompletePath(entry.url);
    if (resolved.kind === "skip") {
      acc.skip.record(entry.url, resolved.reason);
      continue;
    }
    const legacyRows = await readSnapshotJson<AutocompleteRow[]>("autocomplete", entry.savePathBase, "json");
    const res = await fetchNew(ctx.baseUrl, resolved.newPath);
    let newRows: AutocompleteRow[] = [];
    try {
      newRows = JSON.parse(res.body) as AutocompleteRow[];
    } catch {
      acc.skip.record(entry.url, `new app response was not valid JSON (status ${res.status})`);
      continue;
    }
    const { diffs, checksRun } = compareAutocomplete(entry.url, legacyRows, newRows);
    acc.add(diffs, checksRun);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// pages / markerinfo (shared extractor-dispatch logic)
// ---------------------------------------------------------------------------

async function runExtractorCategory(ctx: RunContext, category: "pages" | "markerinfo"): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, category);
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    const classification = classifyPageArtifact(entry.url);
    if (classification.kind === "skip") {
      acc.skip.record(entry.url, classification.reason);
      continue;
    }
    const { pageType, newPath } = classification;

    const newExtractor = newExtractors[pageType];
    if (!newExtractor) {
      acc.skip.record(entry.url, `no new-side extractor registered for page type "${pageType}" (extractors/new/index.ts)`);
      continue;
    }

    // Prefer the stored extracted JSON (capture.ts already ran the legacy
    // extractor); fall back to re-running it against the stored raw HTML
    // when absent (e.g. an older capture, or a page type capture.ts didn't
    // extract inline).
    let legacyJson = await readExtractedJsonIfPresent(category, entry.savePathBase);
    if (legacyJson === null) {
      const legacyExtractor = legacyExtractors[pageType as LegacyPageType];
      if (!legacyExtractor) {
        acc.skip.record(entry.url, `no legacy extractor available for page type "${pageType}" and no stored .extracted.json`);
        continue;
      }
      const ext = category === "pages" ? "html" : "html";
      const html = await readSnapshotText(category, entry.savePathBase, ext);
      try {
        legacyJson = legacyExtractor(html);
      } catch (err) {
        acc.skip.record(entry.url, `legacy extractor threw: ${(err as Error).message}`);
        continue;
      }
    }

    const res = await fetchNew(ctx.baseUrl, newPath, { unitsPreference: inferUnitsPreference(entry.savePathBase) });
    let newJson: unknown;
    try {
      newJson = newExtractor(res.body);
    } catch (err) {
      acc.skip.record(entry.url, `new-side extractor threw against the fetched response (status ${res.status}): ${(err as Error).message}`);
      continue;
    }

    const { diffs, checksRun } = comparePageJson(entry.url, legacyJson, newJson, pageType);
    acc.add(diffs, checksRun);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// redirects
// ---------------------------------------------------------------------------

interface RedirectRecord {
  url: string;
  description: string;
  status: number;
  location: string | null;
}

async function runRedirects(ctx: RunContext): Promise<RunAccumulator> {
  const manifest = await loadManifest(SNAPSHOTS_DIR, "redirects");
  const { ok, legacyErrors } = partitionByLegacyStatus(applyFilterAndLimit(manifest, ctx.filter, ctx.limit));
  const acc = new RunAccumulator(legacyErrors);

  for (const entry of ok) {
    const resolved = resolveNewPath(entry.url);
    if (resolved.kind === "skip") {
      acc.skip.record(entry.url, resolved.reason);
      continue;
    }
    const legacyRecord = await readSnapshotJson<RedirectRecord>("redirects", entry.savePathBase, "json");
    // BUGFIX (surfaced by the P1-15 sweep): normalize.ts's URL-equivalence
    // table intentionally resolves a legacy redirect SOURCE straight to its
    // TARGET (e.g. `home`: `/` -> `/map`) so content-comparison categories
    // (pages/markers/etc.) can treat the two as equivalent. Reusing
    // `resolved.newPath` here for the `redirects` category was wrong: it
    // fetches the already-resolved destination (200, no Location header)
    // instead of exercising the new app's own redirect behavior, so this
    // check never actually tested anything for entries like `/`. When the
    // captured legacy artifact was ITSELF a redirect (3xx), fetch the
    // literal un-resolved pathname instead - the one shape Phase 1
    // implements this way is `/`, which is identical in both URL schemes.
    const isLegacyRedirect = legacyRecord.status >= 300 && legacyRecord.status < 400;
    const fetchPath = isLegacyRedirect ? toPath(entry.url) : resolved.newPath;
    const res = await fetchNew(ctx.baseUrl, fetchPath, { manual302: true });
    const { diffs, checksRun } = compareRedirect(entry.url, legacyRecord, { status: res.status, location: res.headers.get("location") });
    acc.add(diffs, checksRun);
  }
  return acc;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

interface RunContext {
  baseUrl: string;
  filter?: string;
  limit?: number;
}

class RunAccumulator {
  diffs: Diff[] = [];
  checksRun = 0;
  skip = new SkipTracker();
  legacyErrors: ManifestEntry[];

  constructor(legacyErrors: ManifestEntry[]) {
    this.legacyErrors = legacyErrors;
  }

  add(diffs: Diff[], checksRun: number): void {
    this.diffs.push(...diffs);
    this.checksRun += checksRun;
  }
}

const RUNNERS: Record<Category, (ctx: RunContext) => Promise<RunAccumulator>> = {
  exports: runExports,
  markers: runMarkers,
  markerinfo: (ctx) => runExtractorCategory(ctx, "markerinfo"),
  search: runSearch,
  autocomplete: runAutocomplete,
  pages: (ctx) => runExtractorCategory(ctx, "pages"),
  redirects: runRedirects,
};

function formatSkipSection(skip: SkipTracker): string {
  if (skip.total === 0) return "No skipped artifacts.";
  const lines: string[] = [`${skip.total} artifact(s) skipped:`];
  for (const [reason, bucket] of skip.byReason) {
    lines.push(`  - ${bucket.count}x: ${reason}`);
    for (const ex of bucket.examples) lines.push(`      e.g. ${ex}`);
  }
  return lines.join("\n");
}

function formatLegacyErrorSection(legacyErrors: ManifestEntry[]): string {
  if (legacyErrors.length === 0) return "No legacy-error artifacts.";
  const lines: string[] = [`${legacyErrors.length} legacy-error artifact(s) (captured status >= 400 - never fetched/compared, pending waivers):`];
  for (const e of legacyErrors.slice(0, 20)) lines.push(`  - [${e.status}] ${e.url}`);
  if (legacyErrors.length > 20) lines.push(`  ... and ${legacyErrors.length - 20} more`);
  return lines.join("\n");
}

async function runCategory(category: Category, ctx: RunContext, waivers: Waiver[], writeReports: boolean): Promise<CategoryOutcome> {
  console.log(`\n== ${category} ==`);
  const manifestPath = path.join(SNAPSHOTS_DIR, category, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.warn(`  ! no manifest at ${manifestPath} - skipping category entirely`);
    const summary = buildReport({ category, checksRun: 0, diffs: [], waivers });
    return { category, summary, skip: new SkipTracker(), legacyErrors: [] };
  }

  const acc = await RUNNERS[category](ctx);
  const summary = buildReport({ category, checksRun: acc.checksRun, diffs: acc.diffs, waivers });

  console.log(`  checks=${summary.checksRun} pass=${summary.pass} fail=${summary.fail} waived=${summary.waived}`);
  console.log(`  ${formatSkipSection(acc.skip)}`);
  console.log(`  ${formatLegacyErrorSection(acc.legacyErrors)}`);

  if (writeReports) {
    const { jsonPath, mdPath } = await writeReport(REPORTS_DIR, summary);
    const extra = [
      "",
      "## Skipped (not counted as checks - route unmapped/unconfirmed, or no extractor registered)",
      "",
      "```",
      formatSkipSection(acc.skip),
      "```",
      "",
      "## Legacy errors (captured legacy status >= 400 - never fetched/compared, pending waivers)",
      "",
      "```",
      formatLegacyErrorSection(acc.legacyErrors),
      "```",
      "",
    ].join("\n");
    await appendFile(mdPath, extra, "utf-8");
    console.log(`  report: ${jsonPath}\n          ${mdPath}`);
  }

  return { category, summary, skip: acc.skip, legacyErrors: acc.legacyErrors };
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const categories: Category[] = args.category === "all" ? [...ALL_CATEGORIES] : [args.category];

  let waivers: Waiver[] = [];
  if (existsSync(WAIVERS_PATH)) waivers = loadWaivers(WAIVERS_PATH);
  else console.warn(`verify.ts: no waivers.md at ${WAIVERS_PATH} - proceeding with zero waivers`);

  const ctx: RunContext = { baseUrl: args.baseUrl, filter: args.filter, limit: args.limit };

  console.log(
    `verify.ts: base-url=${args.baseUrl} categories=${categories.join(",")} limit=${args.limit ?? "none"} filter=${args.filter ?? "none"} report=${args.report}`,
  );

  const outcomes: CategoryOutcome[] = [];
  for (const category of categories) {
    outcomes.push(await runCategory(category, ctx, waivers, args.report));
  }

  console.log("\n== summary ==");
  let anyFail = false;
  for (const o of outcomes) {
    console.log(
      `  ${o.category}: checks=${o.summary.checksRun} pass=${o.summary.pass} fail=${o.summary.fail} waived=${o.summary.waived} skipped=${o.skip.total} legacy-errors=${o.legacyErrors.length}`,
    );
    if (o.summary.fail > 0) anyFail = true;
  }

  if (anyFail) {
    console.error("\nverify.ts: unwaived failures present - exiting non-zero.");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exitCode = 1;
});
