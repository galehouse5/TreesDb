#!/usr/bin/env tsx
/**
 * capture.ts - fetches legacy-site artifacts into web/parity/snapshots/
 * (doc 07 §4). Run with `pnpm tsx web/parity/capture.ts [options]`.
 *
 * Options:
 *   --base-url <url>     legacy site base URL (default https://treesdb.org)
 *   --category <name>    exports|markers|markerinfo|search|autocomplete|pages|photos|redirects|all (default all)
 *   --corpus <path>      path to corpus.json (default web/parity/corpus.json next to this script)
 *   --refresh            re-fetch artifacts that already exist on disk
 *   --limit <n>          cap the number of artifacts fetched this run (for spot-checks)
 *
 * Behavior (doc 07 §2/§4):
 *   - Serial requests, 250ms delay between them, UA "treesdb-migration-parity/1.0".
 *   - Idempotent/resumable: skips artifacts whose raw-body file already
 *     exists on disk, unless --refresh.
 *   - Per artifact: raw body under snapshots/<category>/..., plus a
 *     manifest entry {url, status, contentType, sha256, capturedAt,
 *     savePathBase} appended to snapshots/<category>/manifest.json (deduped
 *     by savePathBase - the on-disk save path, which is 1:1 with the body
 *     file actually written - unless --refresh; NOT by url, since the same
 *     url can legitimately be fetched multiple times for different bodies:
 *     units-cookie variants, and the locations/species grid full-page vs
 *     AJAX-partial fetch of the identical url).
 *   - `markerinfo` and `pages` additionally run the matching legacy
 *     extractor (web/parity/extractors/legacy) and save the extracted JSON
 *     alongside the raw HTML.
 *   - `photos` decodes with sharp and stores ONLY content-type/byte-length/
 *     dimensions - never the image bytes.
 *   - `redirects` never follows redirects; records status + Location header.
 *   - `search` sends `X-Requested-With: XMLHttpRequest`.
 *   - Any corpus entry (state/site/species/tree) named in `corpus.unitsSubset`
 *     is additionally captured with the matching `unitsPreference` cookie.
 *
 * P0-08 (2026-07-17) ran the full legacy-snapshot capture this script
 * performs, against the live site, per doc 07 §4 - spot-check (--limit 5
 * per category) then full run. See web/parity/snapshots/README.md for the
 * dump-vs-capture divergence window. A later phase (doc 07 §4 "the final
 * freeze in Phase 4 re-captures a delta set") will re-run this against the
 * live site again for a delta capture; on that run remember it is
 * resumable and idempotent - existing snapshots are skipped unless
 * --refresh, so a delta run should target specific corpus entries or use
 * --refresh deliberately, not assume a fresh full run is free.
 */
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as cheerio from "cheerio";

import { ALL_PHOTO_SIZES } from "./corpus-schema";
import type {
  Corpus,
  CorpusGridStateEntry,
  PhotoSize,
  UnitsPreference,
} from "./corpus-schema";
import { legacyExtractors, type LegacyPageType } from "./extractors/legacy";
import { parseGrid } from "./extractors/legacy/dom-helpers";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(SCRIPT_DIR, "snapshots");
const USER_AGENT = "treesdb-migration-parity/1.0";
const REQUEST_DELAY_MS = 250;

const ALL_CATEGORIES = [
  "exports",
  "markers",
  "markerinfo",
  "search",
  "autocomplete",
  "pages",
  "photos",
  "redirects",
] as const;
type Category = (typeof ALL_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  baseUrl: string;
  category: Category | "all";
  corpusPath: string;
  refresh: boolean;
  limit?: number;
}

function parseCliArgs(argv: string[]): Args {
  const { values } = parseArgs({
    args: argv,
    options: {
      "base-url": { type: "string", default: "https://treesdb.org" },
      category: { type: "string", default: "all" },
      corpus: { type: "string", default: path.join(SCRIPT_DIR, "corpus.json") },
      refresh: { type: "boolean", default: false },
      limit: { type: "string" },
    },
    allowPositionals: false,
  });

  const category = String(values.category);
  if (category !== "all" && !(ALL_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(
      `--category must be one of: all, ${ALL_CATEGORIES.join(", ")} (got ${JSON.stringify(category)})`,
    );
  }

  return {
    baseUrl: String(values["base-url"]).replace(/\/+$/, ""),
    category: category as Args["category"],
    corpusPath: path.resolve(String(values.corpus)),
    refresh: Boolean(values.refresh),
    limit: values.limit ? Number(values.limit) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Corpus loading
// ---------------------------------------------------------------------------

async function loadCorpus(corpusPath: string): Promise<Corpus> {
  if (!existsSync(corpusPath)) {
    throw new Error(
      [
        `capture.ts: corpus file not found at ${corpusPath}`,
        "",
        "corpus.json is generated by corpus.ts from the migrated Postgres data",
        "(a separate, schema-dependent task - see docs/migration/07-parity-testing.md §3).",
        "Generate it first, or pass --corpus <path> to point at an existing one.",
      ].join("\n"),
    );
  }
  const raw = await readFile(corpusPath, "utf-8");
  return JSON.parse(raw) as Corpus;
}

// ---------------------------------------------------------------------------
// Legacy URL builders (doc 01 §1 route surface)
// ---------------------------------------------------------------------------

/** Percent-encodes a species route segment while keeping literal parentheses (doc 01 §1: "Species URLs literally contain a space and parentheses"). */
function encodeSpeciesSegment(routeSegment: string): string {
  return encodeURIComponent(routeSegment).replace(/%28/g, "(").replace(/%29/g, ")");
}

function qs(params: Record<string, string>): string {
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : "";
}

const urls = {
  treeDetails: (base: string, id: number) => `${base}/Browse/Trees/${id}/Details`,
  siteDetails: (base: string, id: number, params: Record<string, string> = {}) =>
    `${base}/Browse/Sites/${id}/Details${qs(params)}`,
  stateDetails: (base: string, id: number, params: Record<string, string> = {}) =>
    `${base}/Browse/States/${id}/Details${qs(params)}`,
  speciesDetails: (
    base: string,
    routeSegment: string,
    scope: { siteId?: number; stateId?: number } = {},
    params: Record<string, string> = {},
  ) => {
    const scopeParams: Record<string, string> = { ...params };
    if (scope.siteId != null) scopeParams.siteId = String(scope.siteId);
    if (scope.stateId != null) scopeParams.stateId = String(scope.stateId);
    return `${base}/Browse/Species/${encodeSpeciesSegment(routeSegment)}/Details${qs(scopeParams)}`;
  },
  browseLocations: (base: string, params: Record<string, string> = {}) => `${base}/Browse/Locations${qs(params)}`,
  browseSpecies: (base: string, params: Record<string, string> = {}) => `${base}/Browse/Species${qs(params)}`,
  browseActivity: (base: string) => `${base}/Browse/Activity`,
  exportTrees: (base: string, id: number) => `${base}/Export/Trees/${id}`,
  exportSites: (base: string, id: number) => `${base}/Export/Sites/${id}`,
  exportStates: (base: string, id: number) => `${base}/Export/States/${id}`,
  exportSpecies: (base: string, routeSegment: string) => `${base}/Export/Species/${encodeSpeciesSegment(routeSegment)}`,
  exportSitesSpecies: (base: string, siteId: number, routeSegment: string) =>
    `${base}/Export/Sites/${siteId}/Species/${encodeSpeciesSegment(routeSegment)}`,
  exportStatesSpecies: (base: string, stateId: number, routeSegment: string) =>
    `${base}/Export/States/${stateId}/Species/${encodeSpeciesSegment(routeSegment)}`,
  exportSpeciesByFilters: (base: string, params: Record<string, string>) => `${base}/Export/SpeciesByFilters${qs(params)}`,
  exportLocationsByFilters: (base: string, params: Record<string, string>) =>
    `${base}/Export/LocationsByFilters${qs(params)}`,
  allMarkers: (base: string) => `${base}/Map/AllMarkers`,
  treeMarker: (base: string, id: number) => `${base}/Map/${id}/TreeMarker`,
  siteMarker: (base: string, id: number) => `${base}/Map/${id}/SiteMarker`,
  markerInfo: (base: string, kind: "State" | "Site" | "Tree", id: number) => `${base}/Map/${id}/${kind}MarkerInfo`,
  search: (base: string, term: string) => `${base}/Search${qs({ term })}`,
  autocomplete: (base: string, endpoint: "commonName" | "scientificName", term: string, results?: number) => {
    const action =
      endpoint === "commonName"
        ? "FindKnownSpeciesWithSimilarCommonName"
        : "FindKnownSpeciesWithSimilarScientificName";
    const params: Record<string, string> = { term };
    if (results != null) params.results = String(results);
    return `${base}/Trees/${action}${qs(params)}`;
  },
  photo: (base: string, id: number, size: PhotoSize) => `${base}/Photos/${id}/${size}`,
};

/** Builds the legacy URL(s) for one corpus grid-state entry: the page URL and, for `parameterNamePrefix`-aware AJAX fetches, the same URL with `parameterNamePrefix` added (TMD/Controllers/BrowseController.cs checks `Request.IsAjaxRequest() && "<prefix>".Equals(parameterNamePrefix)`). */
function gridStateUrl(base: string, entry: CorpusGridStateEntry): string {
  const params = { ...entry.params };
  if (entry.parameterNamePrefix) params.parameterNamePrefix = entry.parameterNamePrefix;
  switch (entry.grid) {
    case "locations":
      return urls.browseLocations(base, params);
    case "species":
      return urls.browseSpecies(base, params);
    case "site-species":
      if (entry.entityId == null) throw new Error(`grid state ${entry.description}: site-species needs entityId`);
      return urls.siteDetails(base, entry.entityId, params);
    case "state-species":
    case "state-sites":
      if (entry.entityId == null) throw new Error(`grid state ${entry.description}: ${entry.grid} needs entityId`);
      return urls.stateDetails(base, entry.entityId, params);
    case "species-by-state":
      if (!entry.speciesRouteSegment) throw new Error(`grid state ${entry.description}: missing speciesRouteSegment`);
      return urls.speciesDetails(base, entry.speciesRouteSegment, { stateId: entry.scopeStateId }, params);
    case "species-site-species":
      if (!entry.speciesRouteSegment) throw new Error(`grid state ${entry.description}: missing speciesRouteSegment`);
      return urls.speciesDetails(base, entry.speciesRouteSegment, { stateId: entry.scopeStateId }, params);
    case "species-trees":
      if (!entry.speciesRouteSegment) throw new Error(`grid state ${entry.description}: missing speciesRouteSegment`);
      return urls.speciesDetails(
        base,
        entry.speciesRouteSegment,
        { siteId: entry.scopeSiteId, stateId: entry.scopeStateId },
        params,
      );
  }
}

// ---------------------------------------------------------------------------
// Fetch + disk plumbing
// ---------------------------------------------------------------------------

interface ManifestEntry {
  url: string;
  status: number;
  contentType: string | null;
  sha256: string;
  capturedAt: string;
  /**
   * The on-disk save path (no extension) this entry's body was written to -
   * doubles as the manifest dedup/resume key. The same `url` can be fetched
   * multiple times with different bodies (units cookie variants - doc 07 §3
   * unitsSubset; the `locations`/`species` grid full-page vs AJAX-partial
   * fetch of the identical URL): matching manifest entries by `url` alone
   * silently collapsed those into one record even though N distinct files
   * were written to disk (bug found during P0-08 spot-check on the units
   * axis, then again on the ajax axis - generalized here to savePathBase,
   * which is 1:1 with the file actually on disk by construction, instead of
   * enumerating every dimension that can vary a fetch for the same URL).
   */
  savePathBase: string;
}

interface FetchOptions {
  ajax?: boolean;
  unitsPreference?: UnitsPreference;
  manual302?: boolean; // don't follow redirects
}

function sanitizeSegment(s: string): string {
  const cleaned = s.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_");
  return cleaned.length > 0 ? cleaned.slice(0, 120) : "_";
}

/**
 * Derives a stable, collision-resistant relative save path (no extension)
 * from a legacy URL.
 *
 * Deliberately parsed from the literal `url` string rather than via
 * `new URL(url).pathname` / `.search`: the WHATWG URL parser silently
 * normalizes the path it returns (e.g. a literal space becomes `%20`),
 * which previously collapsed the `redirects` category's deliberately
 * distinct raw-vs-percent-encoded species-URL corpus entries (doc 07 §3/
 * §5.6 - "including the species URLs containing spaces/parentheses in both
 * raw and percent-encoded forms") into a single save path even though they
 * are two separate corpus entries with two separate captured responses
 * (bug found during P0-08 full capture; fixed here).
 */
function urlToSavePathBase(url: string, unitsPreference?: UnitsPreference): string {
  const originMatch = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/?#]*/);
  const afterOrigin = originMatch ? url.slice(originMatch[0].length) : url;
  const queryIndex = afterOrigin.indexOf("?");
  const rawPath = queryIndex === -1 ? afterOrigin : afterOrigin.slice(0, queryIndex);
  const rawQuery = queryIndex === -1 ? "" : afterOrigin.slice(queryIndex);
  const segments = rawPath.split("/").filter(Boolean).map(sanitizeSegment);
  let base = segments.length > 0 ? segments.join("/") : "root";
  if (rawQuery) {
    const hash = createHash("sha256").update(rawQuery).digest("hex").slice(0, 10);
    base += `__q${hash}`;
  }
  if (unitsPreference && unitsPreference !== "Feet" && unitsPreference !== "Default") {
    base += `--${unitsPreference}`;
  }
  return base;
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readManifest(category: Category): Promise<ManifestEntry[]> {
  const manifestPath = path.join(SNAPSHOTS_DIR, category, "manifest.json");
  if (!existsSync(manifestPath)) return [];
  return JSON.parse(await readFile(manifestPath, "utf-8")) as ManifestEntry[];
}

async function writeManifest(category: Category, entries: ManifestEntry[]): Promise<void> {
  const manifestPath = path.join(SNAPSHOTS_DIR, category, "manifest.json");
  await ensureDir(manifestPath);
  await writeFile(manifestPath, JSON.stringify(entries, null, 2) + "\n", "utf-8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CaptureContext {
  refresh: boolean;
  limit?: number;
  fetched: number;
  manifests: Map<Category, ManifestEntry[]>;
}

async function getManifest(ctx: CaptureContext, category: Category): Promise<ManifestEntry[]> {
  if (!ctx.manifests.has(category)) {
    ctx.manifests.set(category, await readManifest(category));
  }
  return ctx.manifests.get(category)!;
}

function budgetExhausted(ctx: CaptureContext): boolean {
  return ctx.limit != null && ctx.fetched >= ctx.limit;
}

async function throttledFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  await sleep(REQUEST_DELAY_MS);
  const headers: Record<string, string> = { "User-Agent": USER_AGENT };
  if (options.ajax) headers["X-Requested-With"] = "XMLHttpRequest";
  if (options.unitsPreference) headers.Cookie = `unitsPreference=${options.unitsPreference}`;
  return fetch(url, {
    headers,
    redirect: options.manual302 ? "manual" : "follow",
  });
}

/**
 * Fetches one artifact and writes raw body + manifest entry. Skips
 * (resumable) if the raw-body file already exists, unless ctx.refresh.
 * Returns the raw body buffer + response when actually fetched, or null
 * when skipped.
 */
async function captureArtifact(
  ctx: CaptureContext,
  category: Category,
  url: string,
  savePathBase: string,
  extension: string,
  options: FetchOptions = {},
): Promise<{ body: Buffer; response: Response } | null> {
  if (budgetExhausted(ctx)) return null;

  const bodyPath = path.join(SNAPSHOTS_DIR, category, `${savePathBase}.${extension}`);
  const manifest = await getManifest(ctx, category);
  // Matched on savePathBase, not url (see ManifestEntry doc comment): the
  // same url can be fetched multiple times for genuinely different bodies
  // (units cookie variants; grid full-page vs AJAX-partial fetch of the
  // identical URL), and savePathBase is 1:1 with the file actually written.
  const existingEntry = manifest.find((e) => e.savePathBase === savePathBase);

  if (existsSync(bodyPath) && existingEntry && !ctx.refresh) {
    return null; // idempotent/resumable skip
  }

  const response = await throttledFetch(url, options);
  ctx.fetched += 1;
  const body = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash("sha256").update(body).digest("hex");
  const contentType = response.headers.get("content-type");

  await ensureDir(bodyPath);
  await writeFile(bodyPath, body);

  const entry: ManifestEntry = {
    url,
    status: response.status,
    contentType,
    sha256,
    capturedAt: new Date().toISOString(),
    savePathBase,
  };
  const withoutOld = manifest.filter((e) => e.savePathBase !== savePathBase);
  withoutOld.push(entry);
  ctx.manifests.set(category, withoutOld);

  return { body, response };
}

/** Runs the matching legacy extractor on HTML and writes the extracted JSON next to the raw HTML. */
async function extractAndSave(
  category: Category,
  savePathBase: string,
  pageType: LegacyPageType,
  html: string,
): Promise<void> {
  const extractor = legacyExtractors[pageType];
  try {
    const extracted = extractor(html);
    const jsonPath = path.join(SNAPSHOTS_DIR, category, `${savePathBase}.extracted.json`);
    await ensureDir(jsonPath);
    await writeFile(jsonPath, JSON.stringify(extracted, null, 2) + "\n", "utf-8");
  } catch (err) {
    console.error(`  ! extractor '${pageType}' failed for ${savePathBase}: ${(err as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Category runners
// ---------------------------------------------------------------------------

async function runExports(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  for (const site of corpus.sites) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportSites(base, site.id);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  for (const state of corpus.states) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportStates(base, state.id);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  for (const species of corpus.species) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportSpecies(base, species.routeSegment);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  for (const tree of corpus.trees) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportTrees(base, tree.id);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  for (const pair of corpus.siteSpeciesPairs) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportSitesSpecies(base, pair.siteId, pair.speciesRouteSegment);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  for (const pair of corpus.stateSpeciesPairs) {
    if (budgetExhausted(ctx)) return;
    const url = urls.exportStatesSpecies(base, pair.stateId, pair.speciesRouteSegment);
    await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
  }
  // Filtered exports: derived from any "filtered" locations/species grid states in the corpus.
  for (const g of corpus.gridStates) {
    if (budgetExhausted(ctx)) return;
    if (g.grid === "locations" && /filter/i.test(g.description)) {
      const url = urls.exportLocationsByFilters(base, g.params);
      await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
    }
    if (g.grid === "species" && /filter/i.test(g.description)) {
      const url = urls.exportSpeciesByFilters(base, g.params);
      await captureArtifact(ctx, "exports", url, urlToSavePathBase(url), "csv");
    }
  }
}

async function runMarkers(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  const allMarkersUrl = urls.allMarkers(base);
  await captureArtifact(ctx, "markers", allMarkersUrl, urlToSavePathBase(allMarkersUrl), "json");

  for (const tree of corpus.trees) {
    if (budgetExhausted(ctx)) return;
    const url = urls.treeMarker(base, tree.id);
    await captureArtifact(ctx, "markers", url, urlToSavePathBase(url), "json");
  }
  for (const site of corpus.sites) {
    if (budgetExhausted(ctx)) return;
    const url = urls.siteMarker(base, site.id);
    await captureArtifact(ctx, "markers", url, urlToSavePathBase(url), "json");
  }
}

async function runMarkerInfo(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  const kinds: { kind: "State" | "Site" | "Tree"; ids: number[]; pageType: LegacyPageType }[] = [
    { kind: "State", ids: corpus.states.map((s) => s.id), pageType: "marker-info-state" },
    { kind: "Site", ids: corpus.sites.map((s) => s.id), pageType: "marker-info-site" },
    { kind: "Tree", ids: corpus.trees.map((t) => t.id), pageType: "marker-info-tree" },
  ];
  for (const { kind, ids, pageType } of kinds) {
    for (const id of ids) {
      if (budgetExhausted(ctx)) return;
      const url = urls.markerInfo(base, kind, id);
      const savePathBase = urlToSavePathBase(url);
      const result = await captureArtifact(ctx, "markerinfo", url, savePathBase, "html");
      if (result) {
        await extractAndSave("markerinfo", savePathBase, pageType, result.body.toString("utf-8"));
      }
    }
  }
}

async function runSearch(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  for (const entry of corpus.searchTerms) {
    if (budgetExhausted(ctx)) return;
    const url = urls.search(base, entry.term);
    await captureArtifact(ctx, "search", url, urlToSavePathBase(url), "json", { ajax: true });
  }
}

async function runAutocomplete(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  for (const entry of corpus.autocompleteTerms) {
    if (budgetExhausted(ctx)) return;
    const url = urls.autocomplete(base, entry.endpoint, entry.term, entry.results);
    await captureArtifact(ctx, "autocomplete", url, urlToSavePathBase(url), "json");
  }
}

async function runPages(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  const unitsFor = (kind: "tree" | "site" | "state" | "species", key: number | string): UnitsPreference[] => {
    const subsets = corpus.unitsSubset.filter((s) => {
      if (kind === "tree") return s.treeIds.includes(key as number);
      if (kind === "site") return s.siteIds.includes(key as number);
      if (kind === "state") return s.stateIds.includes(key as number);
      return s.speciesRouteSegments.includes(key as string);
    });
    return ["Feet" as UnitsPreference, ...subsets.map((s) => s.unitsPreference)];
  };

  // Detail pages, one per corpus entity, at default grid params (Feet, plus any units subset).
  for (const tree of corpus.trees) {
    for (const unitsPreference of unitsFor("tree", tree.id)) {
      if (budgetExhausted(ctx)) return;
      const url = urls.treeDetails(base, tree.id);
      const options = unitsPreference === "Feet" ? {} : { unitsPreference };
      const savePathBase = urlToSavePathBase(url, unitsPreference === "Feet" ? undefined : unitsPreference);
      const result = await captureArtifact(ctx, "pages", url, savePathBase, "html", options);
      if (result) await extractAndSave("pages", savePathBase, "tree-details", result.body.toString("utf-8"));
    }
  }
  for (const site of corpus.sites) {
    for (const unitsPreference of unitsFor("site", site.id)) {
      if (budgetExhausted(ctx)) return;
      const url = urls.siteDetails(base, site.id);
      const options = unitsPreference === "Feet" ? {} : { unitsPreference };
      const savePathBase = urlToSavePathBase(url, unitsPreference === "Feet" ? undefined : unitsPreference);
      const result = await captureArtifact(ctx, "pages", url, savePathBase, "html", options);
      if (result) await extractAndSave("pages", savePathBase, "site-details", result.body.toString("utf-8"));
    }
  }
  for (const state of corpus.states) {
    for (const unitsPreference of unitsFor("state", state.id)) {
      if (budgetExhausted(ctx)) return;
      const url = urls.stateDetails(base, state.id);
      const options = unitsPreference === "Feet" ? {} : { unitsPreference };
      const savePathBase = urlToSavePathBase(url, unitsPreference === "Feet" ? undefined : unitsPreference);
      const result = await captureArtifact(ctx, "pages", url, savePathBase, "html", options);
      if (result) await extractAndSave("pages", savePathBase, "state-details", result.body.toString("utf-8"));
    }
  }
  for (const species of corpus.species) {
    for (const unitsPreference of unitsFor("species", species.routeSegment)) {
      if (budgetExhausted(ctx)) return;
      const url = urls.speciesDetails(base, species.routeSegment);
      const options = unitsPreference === "Feet" ? {} : { unitsPreference };
      const savePathBase = urlToSavePathBase(url, unitsPreference === "Feet" ? undefined : unitsPreference);
      const result = await captureArtifact(ctx, "pages", url, savePathBase, "html", options);
      if (result) await extractAndSave("pages", savePathBase, "species-details", result.body.toString("utf-8"));
    }
  }
  // Scoped species pages (site/state).
  for (const pair of corpus.siteSpeciesPairs) {
    if (budgetExhausted(ctx)) return;
    const url = urls.speciesDetails(base, pair.speciesRouteSegment, { siteId: pair.siteId });
    const savePathBase = urlToSavePathBase(url);
    const result = await captureArtifact(ctx, "pages", url, savePathBase, "html");
    if (result) await extractAndSave("pages", savePathBase, "species-details", result.body.toString("utf-8"));
  }
  for (const pair of corpus.stateSpeciesPairs) {
    if (budgetExhausted(ctx)) return;
    const url = urls.speciesDetails(base, pair.speciesRouteSegment, { stateId: pair.stateId });
    const savePathBase = urlToSavePathBase(url);
    const result = await captureArtifact(ctx, "pages", url, savePathBase, "html");
    if (result) await extractAndSave("pages", savePathBase, "species-details", result.body.toString("utf-8"));
  }

  // Browse/Activity - raw HTML only; no extractor owned by this task (not in the P0-08 extractor list).
  if (!budgetExhausted(ctx)) {
    const url = urls.browseActivity(base);
    await captureArtifact(ctx, "pages", url, urlToSavePathBase(url), "html");
  }

  // Explicit grid states (doc 07 §3): full page load for the two global
  // grids, AJAX-partial fetch for every grid state (global and scoped).
  for (const entry of corpus.gridStates) {
    if (budgetExhausted(ctx)) return;
    const url = gridStateUrl(base, entry);

    if (entry.grid === "locations" || entry.grid === "species") {
      const pageType: LegacyPageType = entry.grid === "locations" ? "locations-grid" : "species-grid";
      const fullSavePathBase = `${urlToSavePathBase(url)}--full`;
      const fullResult = await captureArtifact(ctx, "pages", url, fullSavePathBase, "html");
      if (fullResult) await extractAndSave("pages", fullSavePathBase, pageType, fullResult.body.toString("utf-8"));

      if (budgetExhausted(ctx)) return;
      const ajaxSavePathBase = `${urlToSavePathBase(url)}--ajax`;
      const ajaxResult = await captureArtifact(ctx, "pages", url, ajaxSavePathBase, "html", { ajax: true });
      if (ajaxResult) await extractAndSave("pages", ajaxSavePathBase, pageType, ajaxResult.body.toString("utf-8"));
      continue;
    }

    // Scoped grids embedded in detail pages: only reachable as a bare AJAX
    // partial fragment (the full page is already covered by the entity's
    // default-params detail-page fetch above). Extracted generically with
    // `parseGrid` - all DataTablesGrid partials share identical markup, so
    // no page-type-specific extractor is needed here (see capture.ts
    // module doc / final report for why locations-grid/species-grid stay
    // the only two dedicated "grid" extractors).
    const savePathBase = urlToSavePathBase(url);
    const result = await captureArtifact(ctx, "pages", url, savePathBase, "html", { ajax: true });
    if (result) {
      try {
        const $ = cheerio.load(result.body.toString("utf-8"));
        const extracted = parseGrid($, $(".dataTablesGrid").first());
        const jsonPath = path.join(SNAPSHOTS_DIR, "pages", `${savePathBase}.extracted.json`);
        await ensureDir(jsonPath);
        await writeFile(jsonPath, JSON.stringify(extracted, null, 2) + "\n", "utf-8");
      } catch (err) {
        console.error(`  ! grid extraction failed for ${savePathBase}: ${(err as Error).message}`);
      }
    }
  }
}

async function runPhotos(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  for (const photo of corpus.photos) {
    const sizes = photo.sizes ?? ALL_PHOTO_SIZES;
    for (const size of sizes) {
      if (budgetExhausted(ctx)) return;
      const url = urls.photo(base, photo.id, size);
      const savePathBase = urlToSavePathBase(url);

      const bodyPath = path.join(SNAPSHOTS_DIR, "photos", `${savePathBase}.json`);
      const manifest = await getManifest(ctx, "photos");
      if (existsSync(bodyPath) && manifest.some((e) => e.savePathBase === savePathBase) && !ctx.refresh) continue;

      const response = await throttledFetch(url);
      ctx.fetched += 1;
      const buffer = Buffer.from(await response.arrayBuffer());
      const sha256 = createHash("sha256").update(buffer).digest("hex");
      const contentType = response.headers.get("content-type");

      let width: number | null = null;
      let height: number | null = null;
      try {
        const meta = await sharp(buffer).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch (err) {
        console.error(`  ! sharp could not decode ${url}: ${(err as Error).message}`);
      }

      // Deliberately NOT writing the image bytes - only content-type/byte-length/dimensions (doc 07 §4).
      const record = { url, contentType, byteLength: buffer.length, width, height };
      await ensureDir(bodyPath);
      await writeFile(bodyPath, JSON.stringify(record, null, 2) + "\n", "utf-8");

      const entry: ManifestEntry = {
        url,
        status: response.status,
        contentType,
        sha256,
        capturedAt: new Date().toISOString(),
        savePathBase,
      };
      ctx.manifests.set("photos", [...manifest.filter((e) => e.savePathBase !== savePathBase), entry]);
    }
  }
}

async function runRedirects(ctx: CaptureContext, base: string, corpus: Corpus): Promise<void> {
  const defaults = [
    { legacyPath: "/", description: "root redirects to /Map" },
    { legacyPath: "/Main", description: "legacy Main controller root" },
  ];
  for (const entry of [...defaults, ...corpus.redirects]) {
    if (budgetExhausted(ctx)) return;
    const url = `${base}${entry.legacyPath}`;
    const savePathBase = urlToSavePathBase(url);

    const bodyPath = path.join(SNAPSHOTS_DIR, "redirects", `${savePathBase}.json`);
    const manifest = await getManifest(ctx, "redirects");
    if (existsSync(bodyPath) && manifest.some((e) => e.savePathBase === savePathBase) && !ctx.refresh) continue;

    const response = await throttledFetch(url, { manual302: true });
    ctx.fetched += 1;
    const record = {
      url,
      description: entry.description,
      status: response.status,
      location: response.headers.get("location"),
    };
    await ensureDir(bodyPath);
    await writeFile(bodyPath, JSON.stringify(record, null, 2) + "\n", "utf-8");

    const entryManifest: ManifestEntry = {
      url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      sha256: createHash("sha256").update(JSON.stringify(record)).digest("hex"),
      capturedAt: new Date().toISOString(),
      savePathBase,
    };
    ctx.manifests.set("redirects", [...manifest.filter((e) => e.savePathBase !== savePathBase), entryManifest]);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const RUNNERS: Record<Category, (ctx: CaptureContext, base: string, corpus: Corpus) => Promise<void>> = {
  exports: runExports,
  markers: runMarkers,
  markerinfo: runMarkerInfo,
  search: runSearch,
  autocomplete: runAutocomplete,
  pages: runPages,
  photos: runPhotos,
  redirects: runRedirects,
};

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const corpus = await loadCorpus(args.corpusPath);

  const categories: Category[] = args.category === "all" ? [...ALL_CATEGORIES] : [args.category];

  const ctx: CaptureContext = {
    refresh: args.refresh,
    limit: args.limit,
    fetched: 0,
    manifests: new Map(),
  };

  console.log(
    `capture.ts: base=${args.baseUrl} categories=${categories.join(",")} corpus=${args.corpusPath} refresh=${args.refresh} limit=${args.limit ?? "none"}`,
  );

  for (const category of categories) {
    if (budgetExhausted(ctx)) break;
    console.log(`-- ${category} --`);
    await RUNNERS[category](ctx, args.baseUrl, corpus);
    const manifest = ctx.manifests.get(category);
    if (manifest) await writeManifest(category, manifest);
  }

  console.log(`capture.ts: done. ${ctx.fetched} artifact(s) fetched this run.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
