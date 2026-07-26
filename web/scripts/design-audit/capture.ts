// @ts-nocheck -- dev-only audit tool run via tsx; playwright-core is resolved
// transitively (not a direct devDependency), so its types aren't installed and
// `tsc --noEmit`/`next build` (which sweep scripts/**) would fail on it.
// Visual design-audit screenshot harness. Run with `npx tsx scripts/design-audit/capture.ts`
// from web/. Targets the ALREADY-RUNNING dev server at http://localhost:3000
// (never started/stopped here). Captures full-page PNGs of public, signed-out
// auth, and signed-in/import-wizard pages at two viewports, runs defect
// probes (horizontal overflow, broken images, console errors, tiny clickable
// targets) on every page, and writes docs/design/audit/manifest.md.
//
// CJS-compiled (tsx default) -- no top-level await, everything inside main().
// Uses playwright-core's chromium directly (resolved via @playwright/test's
// own dependency, since this package is not a direct devDependency and we
// must not run `pnpm add`). Reuses e2e/helpers/{db,auth-user}.ts for the
// throwaway import-role user + cleanup, same pattern as e2e/global-setup.ts.

import path from "node:path";
import fs from "node:fs";

// ---------------------------------------------------------------------------
// Module resolution helpers (no pnpm add allowed -- reach into the pnpm
// store via @playwright/test's own dependency graph, and load sharp the
// same way since it's a direct "dependencies" entry already).
// ---------------------------------------------------------------------------
function loadPlaywrightChromium() {
  const testPkgDir = path.dirname(require.resolve("@playwright/test/package.json"));
  const corePath = require.resolve("playwright-core", { paths: [testPkgDir] });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const core = require(corePath) as typeof import("playwright-core");
  return core.chromium;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require("sharp") as typeof import("sharp");

import type { Browser, BrowserContext, Page } from "playwright-core";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BASE_URL = "http://localhost:3000";
const OUT_DIR = path.resolve(__dirname, "..", "..", "..", "docs", "design", "audit");

interface Viewport {
  name: "desktop" | "mobile";
  width: number;
  height: number;
}
const VIEWPORTS: Viewport[] = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const SMALL_TARGET_PX = 24;

// ---------------------------------------------------------------------------
// Manifest data
// ---------------------------------------------------------------------------
interface ScreenshotRecord {
  slug: string;
  file: string;
  url: string;
  viewport: string;
  note?: string;
}
interface OverflowDefect {
  kind: "overflow";
  page: string;
  viewport: string;
  scrollWidth: number;
  innerWidth: number;
}
interface BrokenImageDefect {
  kind: "broken-image";
  page: string;
  viewport: string;
  src: string;
  alt: string;
}
interface ConsoleErrorDefect {
  kind: "console-error";
  page: string;
  viewport: string;
  message: string;
}
interface SmallTargetDefect {
  kind: "small-target";
  page: string;
  viewport: string;
  selector: string;
  text: string;
  width: number;
  height: number;
}
type Defect = OverflowDefect | BrokenImageDefect | ConsoleErrorDefect | SmallTargetDefect;

const manifest: { screenshots: ScreenshotRecord[]; defects: Defect[]; notes: string[] } = {
  screenshots: [],
  defects: [],
  notes: [],
};

function outFile(slug: string, vp: Viewport): string {
  return path.join(OUT_DIR, `${slug}--${vp.name}.png`);
}

// ---------------------------------------------------------------------------
// Probes
// ---------------------------------------------------------------------------
async function probeOverflow(page: Page, pageLabel: string, vpName: string): Promise<void> {
  const result = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  if (result.scrollWidth > result.innerWidth) {
    manifest.defects.push({
      kind: "overflow",
      page: pageLabel,
      viewport: vpName,
      scrollWidth: result.scrollWidth,
      innerWidth: result.innerWidth,
    });
  }
}

async function probeBrokenImages(page: Page, pageLabel: string, vpName: string): Promise<void> {
  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => ({ src: img.src, alt: img.alt })),
  );
  for (const b of broken) {
    manifest.defects.push({ kind: "broken-image", page: pageLabel, viewport: vpName, src: b.src, alt: b.alt });
  }
}

async function probeSmallTargets(page: Page, pageLabel: string, vpName: string): Promise<void> {
  const small = await page.evaluate((minPx: number) => {
    const els = Array.from(document.querySelectorAll('a[href], button, input[type="button"], input[type="submit"], [role="button"]'));
    const out: { selector: string; text: string; width: number; height: number }[] = [];
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue; // not rendered / display:none
      const style = window.getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (rect.width < minPx || rect.height < minPx) {
        const tag = el.tagName.toLowerCase();
        const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : "";
        const cls = (el as HTMLElement).className && typeof (el as HTMLElement).className === "string"
          ? `.${(el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join(".")}`
          : "";
        out.push({
          selector: `${tag}${id}${cls}`,
          text: (el.textContent || (el as HTMLElement).getAttribute?.("aria-label") || "").trim().slice(0, 40),
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        });
      }
    }
    return out;
  }, SMALL_TARGET_PX);
  for (const s of small) {
    manifest.defects.push({ kind: "small-target", page: pageLabel, viewport: vpName, selector: s.selector, text: s.text, width: s.width, height: s.height });
  }
}

function attachConsoleCapture(page: Page, pageLabel: string, vpName: string): void {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      manifest.defects.push({ kind: "console-error", page: pageLabel, viewport: vpName, message: msg.text().slice(0, 300) });
    }
  });
  page.on("pageerror", (err) => {
    manifest.defects.push({ kind: "console-error", page: pageLabel, viewport: vpName, message: `pageerror: ${String(err).slice(0, 300)}` });
  });
}

async function runProbes(page: Page, pageLabel: string, vp: Viewport): Promise<void> {
  // Each probe swallows its own errors -- a crashed/closed page here must
  // not abort whatever capture work is still queued after it.
  await probeOverflow(page, pageLabel, vp.name).catch(() => {});
  await probeBrokenImages(page, pageLabel, vp.name).catch(() => {});
  await probeSmallTargets(page, pageLabel, vp.name).catch(() => {});
}

// ---------------------------------------------------------------------------
// Generic page capture
// ---------------------------------------------------------------------------
async function captureSimplePage(
  context: BrowserContext,
  vp: Viewport,
  slug: string,
  url: string,
  opts?: { waitMs?: number; note?: string; screenshot?: boolean },
): Promise<Page> {
  const page = await context.newPage();
  attachConsoleCapture(page, slug, vp.name);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  } catch {
    // Some pages (e.g. the map) never go fully idle because of long-poll-ish
    // behavior; fall back to a plain load wait.
    await page.goto(url, { waitUntil: "load", timeout: 30_000 }).catch(() => {});
  }
  if (opts?.waitMs) await page.waitForTimeout(opts.waitMs);
  if (opts?.screenshot !== false) {
    const file = outFile(slug, vp);
    await page.screenshot({ path: file, fullPage: true });
    manifest.screenshots.push({ slug, file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note: opts?.note });
  }
  await runProbes(page, slug, vp);
  return page;
}

// ---------------------------------------------------------------------------
// Map page: base capture + marker popup capture via canvas pixel-color
// scanning (MapLibre renders markers into a single WebGL canvas -- there is
// no per-marker DOM node to query/click, so we screenshot the canvas,
// decode it with sharp, and look for pixel clusters matching each marker
// type's known icon color (site = teal ~[35,80,98], tree = dark green
// ~[26,58,1]/[42,95,0], sampled from public/images/icons/{Site,Tree}32.png).
// ---------------------------------------------------------------------------
const ICON_COLORS = {
  state: [[21, 52, 87]],
  site: [[35, 80, 98]],
  tree: [
    [26, 58, 1],
    [42, 95, 0],
  ],
} as const;
const COLOR_TOLERANCE = 26;

function colorDist(a: readonly number[], b: readonly number[]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

interface Blob {
  x: number; // raw pixel coords (canvas screenshot space)
  y: number;
  count: number;
}

/** Scans a canvas screenshot PNG buffer for pixel clusters matching one of
 * `targetColors`, bucketed into a coarse grid so nearby matching pixels
 * (one icon's worth) collapse into a single blob. Returns blobs sorted by
 * distance to the canvas center (nearest first). */
async function findMarkerBlobs(pngBuffer: Buffer, targetColors: readonly (readonly number[])[]): Promise<{ blobs: Blob[]; width: number; height: number }> {
  const { data, info } = await sharp(pngBuffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const bucketSize = 12; // raw px; ~1 icon (icons render ~32-64 raw px depending on dpr)
  const buckets = new Map<string, { sumX: number; sumY: number; count: number }>();
  const step = 2; // sample every 2nd pixel for speed
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * channels;
      const a = data[idx + 3];
      if (a < 200) continue;
      const px = [data[idx], data[idx + 1], data[idx + 2]];
      let matched = false;
      for (const target of targetColors) {
        if (colorDist(px, target) <= COLOR_TOLERANCE) {
          matched = true;
          break;
        }
      }
      if (!matched) continue;
      const bx = Math.floor(x / bucketSize);
      const by = Math.floor(y / bucketSize);
      const key = `${bx},${by}`;
      const b = buckets.get(key) ?? { sumX: 0, sumY: 0, count: 0 };
      b.sumX += x;
      b.sumY += y;
      b.count += 1;
      buckets.set(key, b);
    }
  }
  const MIN_BUCKET_COUNT = 4; // filter out stray 1-2px false positives from tile colors
  const blobs: Blob[] = [];
  for (const b of buckets.values()) {
    if (b.count < MIN_BUCKET_COUNT) continue;
    blobs.push({ x: b.sumX / b.count, y: b.sumY / b.count, count: b.count });
  }
  const cx = width / 2;
  const cy = height / 2;
  blobs.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
  return { blobs, width, height };
}

interface CanvasBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Scans the canvas for `kind` markers and returns page-space (CSS px)
 * coordinates for every match found, nearest-to-canvas-center first. */
async function scanCanvasFor(page: Page, canvasLocator: ReturnType<Page["locator"]>, box: CanvasBox, kind: keyof typeof ICON_COLORS): Promise<{ x: number; y: number }[]> {
  const png = await canvasLocator.screenshot();
  const { blobs, width } = await findMarkerBlobs(png, ICON_COLORS[kind]);
  const dpr = width / box.width;
  return blobs.map((b) => ({ x: box.x + b.x / dpr, y: box.y + b.y / dpr }));
}

/**
 * Zooms the map IN, centered on a specific screen point, via a real
 * `wheel` gesture (MapLibre's default scrollZoom interaction re-centers on
 * the cursor position -- unlike the +/- zoom control, which zooms around
 * whatever the CURRENT map center is). This matters: the map's initial
 * center (`fitBounds` over every marker's bbox, map-view.tsx) is a
 * geometric average that can land far from any actual data -- zooming in
 * place from there very often converges on empty ocean/rural land with no
 * markers at all (confirmed empirically while building this script: after
 * 7 in-place zoom-control clicks from the initial center, the canvas was
 * ~99% open-water tile color). Anchoring each zoom step on a screen point
 * that's already ON a marker keeps the view converging toward real data.
 */
async function wheelZoomAt(page: Page, x: number, y: number, ticks: number): Promise<void> {
  await page.mouse.move(x, y);
  for (let i = 0; i < ticks; i++) {
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(220);
  }
  await page.waitForTimeout(700);
}

/**
 * Converges from `start` toward a visible `target` marker by repeatedly
 * wheel-zooming in small increments, re-anchoring on the nearest `bridge`-
 * colored marker after each increment (bridge markers are visible over a
 * wider zoom range than target markers, so they're the reliable "keep
 * heading toward real data" signal while target markers aren't on screen
 * yet). Stops and returns the target's screen coordinates as soon as any
 * target-colored marker appears; gives up after `maxRounds` increments
 * (each `ticksPerRound` wheel ticks) if the trail goes cold (no bridge
 * marker either -- i.e. zoomed into empty space).
 */
async function convergeToMarker(
  page: Page,
  canvasLocator: ReturnType<Page["locator"]>,
  box: CanvasBox,
  start: { x: number; y: number },
  target: keyof typeof ICON_COLORS,
  bridge: keyof typeof ICON_COLORS,
  maxRounds: number,
  ticksPerRound: number,
): Promise<{ x: number; y: number } | null> {
  let cur = start;
  for (let round = 0; round < maxRounds; round++) {
    try {
      await wheelZoomAt(page, cur.x, cur.y, ticksPerRound);
      const targets = await scanCanvasFor(page, canvasLocator, box, target);
      if (targets.length > 0) return targets[0]!;
      const bridges = await scanCanvasFor(page, canvasLocator, box, bridge);
      if (bridges.length === 0) return null; // zoomed into empty space -- trail went cold
      cur = bridges[0]!;
    } catch {
      return null; // browser/GPU crash mid-round -- degrade to "not found"
    }
  }
  return null;
}

async function measureCloseButton(page: Page, pageLabel: string, vpName: string): Promise<{ width: number; height: number } | null> {
  const btn = page.locator(".maplibregl-popup-close-button");
  const box = await btn.boundingBox().catch(() => null);
  if (!box) return null;
  const w = Math.round(box.width * 100) / 100;
  const h = Math.round(box.height * 100) / 100;
  manifest.notes.push(`Map popup close button (${pageLabel}, ${vpName}): ${w}px x ${h}px (clickable box).`);
  if (w < SMALL_TARGET_PX || h < SMALL_TARGET_PX) {
    manifest.defects.push({
      kind: "small-target",
      page: pageLabel,
      viewport: vpName,
      selector: ".maplibregl-popup-close-button",
      text: "×",
      width: w,
      height: h,
    });
  }
  return { width: w, height: h };
}

async function clickAndCapturePopup(page: Page, at: { x: number; y: number }, slug: string, vp: Viewport, note: string): Promise<boolean> {
  try {
    await page.mouse.click(at.x, at.y);
    await page.waitForSelector(".maplibregl-popup", { timeout: 2000 });
  } catch {
    return false;
  }
  await page.waitForTimeout(600); // let the popup's own fetch(InfoLoaderUrl) resolve
  const file = outFile(slug, vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug, file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note });
  await measureCloseButton(page, slug, vp.name);
  await runProbes(page, slug, vp);
  return true;
}

async function captureMap(context: BrowserContext, vp: Viewport): Promise<void> {
  const slug = "map";
  const page = await context.newPage();
  attachConsoleCapture(page, slug, vp.name);
  await page.goto(`${BASE_URL}/map`, { waitUntil: "load", timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const baseFile = outFile(slug, vp);
  await page.screenshot({ path: baseFile, fullPage: true });
  manifest.screenshots.push({ slug, file: path.relative(path.resolve(__dirname, "..", "..", ".."), baseFile), url: page.url(), viewport: vp.name });
  await runProbes(page, slug, vp);

  const canvas = page.locator(".maplibregl-canvas");
  let box: CanvasBox | null = null;
  try {
    box = await canvas.boundingBox();
  } catch {
    box = null;
  }
  if (!box) {
    manifest.notes.push(`map-popup-site--${vp.name} / map-popup-tree--${vp.name}: canvas not found; NOT captured.`);
    await page.close().catch(() => {});
    return;
  }

  // Anchor candidates: every visible STATE marker at the initial (whole-US)
  // zoom, nearest-to-center first. State markers are the ONLY marker kind
  // guaranteed visible at the initial fitBounds zoom, and (unlike the
  // fitBounds center itself) each one sits on real, on-land data.
  let stateAnchors: { x: number; y: number }[] = [];
  try {
    stateAnchors = await scanCanvasFor(page, canvas, box, "state");
  } catch (err) {
    manifest.notes.push(`map-popup-site--${vp.name}: initial state-marker scan failed (${String(err).slice(0, 150)}); NOT captured.`);
  }

  // --- Site marker popup -------------------------------------------------
  // Each phase is independently try/catched: a GPU/browser crash triggered
  // by repeated canvas-screenshot readbacks at deep zoom (observed in
  // practice under headless software WebGL) must degrade to "not
  // captured, noted" rather than abort the whole run.
  let siteScreenPos: { x: number; y: number } | null = null;
  if (stateAnchors.length > 0) {
    try {
      siteScreenPos = await convergeToMarker(page, canvas, box, stateAnchors[0]!, "site", "state", 8, 4);
      if (siteScreenPos) {
        const ok = await clickAndCapturePopup(page, siteScreenPos, "map-popup-site", vp, "site marker popup, found by wheel-zooming in from a state marker anchor and re-targeting on canvas pixel-color matches each round");
        if (ok) {
          await page.locator(".maplibregl-popup-close-button").click().catch(() => {});
          await page.waitForTimeout(300);
        } else {
          manifest.notes.push(`map-popup-site--${vp.name}: a site-colored marker was located but the click didn't open a popup; NOT captured.`);
          siteScreenPos = null;
        }
      } else {
        manifest.notes.push(`map-popup-site--${vp.name}: wheel-zoom convergence from the nearest state marker never revealed a site marker (or the browser crashed mid-convergence); NOT captured.`);
      }
    } catch (err) {
      manifest.notes.push(`map-popup-site--${vp.name}: capture aborted by an error (likely a browser/GPU crash): ${String(err).slice(0, 200)}; NOT captured.`);
    }
  } else {
    manifest.notes.push(`map-popup-site--${vp.name}: no state markers found at the initial zoom to anchor a zoom-in from; NOT captured.`);
  }

  // --- Tree marker popup --------------------------------------------------
  // Continues converging from wherever the site marker was found (trees
  // are more sparsely geocoded than sites -- only individually-measured
  // trees with their own coordinates get a marker, doc 03 P1-10 zoom
  // bands -- so this can legitimately fail even with a good anchor).
  try {
    const treeAnchor = siteScreenPos ?? stateAnchors[0] ?? null;
    if (treeAnchor) {
      const treeScreenPos = await convergeToMarker(page, canvas, box, treeAnchor, "tree", "site", 8, 4);
      if (treeScreenPos) {
        const ok = await clickAndCapturePopup(page, treeScreenPos, "map-popup-tree", vp, "tree marker popup, found by wheel-zooming in further and re-targeting on canvas pixel-color matches each round");
        if (!ok) manifest.notes.push(`map-popup-tree--${vp.name}: a tree-colored marker was located but the click didn't open a popup; NOT captured.`);
      } else {
        manifest.notes.push(`map-popup-tree--${vp.name}: wheel-zoom convergence never revealed a tree marker within budget (this area's sites may not have individually-geocoded trees); NOT captured.`);
      }
    } else {
      manifest.notes.push(`map-popup-tree--${vp.name}: no anchor available (no site or state marker found earlier); NOT captured.`);
    }
  } catch (err) {
    manifest.notes.push(`map-popup-tree--${vp.name}: capture aborted by an error (likely a browser/GPU crash): ${String(err).slice(0, 200)}; NOT captured.`);
  }

  await page.close().catch(() => {});
}

// ---------------------------------------------------------------------------
// Species detail (dynamic: click the first link from /species)
// ---------------------------------------------------------------------------
async function captureSpeciesDetail(context: BrowserContext, vp: Viewport): Promise<void> {
  const slug = "species-detail";
  const page = await context.newPage();
  attachConsoleCapture(page, slug, vp.name);
  await page.goto(`${BASE_URL}/species`, { waitUntil: "networkidle", timeout: 30_000 });
  const link = page.locator('a[href^="/species/"]').first();
  const href = await link.getAttribute("href");
  if (!href) {
    manifest.notes.push(`species-detail--${vp.name}: no species link found on /species; NOT captured.`);
    await page.close();
    return;
  }
  await link.click();
  await page.waitForURL(/\/species\//, { timeout: 15_000 }).catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  const file = outFile(slug, vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug, file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note: `first species link from /species (href=${href})` });
  await runProbes(page, slug, vp);
  await page.close();
}

// ---------------------------------------------------------------------------
// Signed-out auth pages
// ---------------------------------------------------------------------------
async function captureAuthSignedOut(context: BrowserContext, vp: Viewport): Promise<void> {
  await captureSimplePage(context, vp, "sign-in", `${BASE_URL}/account`, { note: "redirect target of /account while signed out" }).then((p) => p.close());
  await captureSimplePage(context, vp, "register", `${BASE_URL}/account/register`).then((p) => p.close());
  await captureSimplePage(context, vp, "password-assistance", `${BASE_URL}/account/password-assistance`).then((p) => p.close());
}

// ---------------------------------------------------------------------------
// Signed-in + import wizard
// ---------------------------------------------------------------------------
interface ThrowawayUserHandle {
  id: number;
  email: string;
  password: string;
}

async function signIn(page: Page, user: ThrowawayUserHandle): Promise<void> {
  await page.goto(`${BASE_URL}/account/login?callbackUrl=/account`, { waitUntil: "networkidle" });
  await page.locator('[name="email"]').fill(user.email);
  await page.locator('[name="password"]').fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/account", { timeout: 15_000 });
}

async function captureSignedInAndImport(context: BrowserContext, vp: Viewport, user: ThrowawayUserHandle): Promise<number | null> {
  const page = await context.newPage();
  attachConsoleCapture(page, "account-signed-in", vp.name);
  await signIn(page, user);
  await page.waitForTimeout(300);

  let file = outFile("account-signed-in", vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug: "account-signed-in", file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name });
  await runProbes(page, "account-signed-in", vp);

  // --- Import home -----------------------------------------------------
  // /import (app/import/page.tsx) auto-redirects straight to
  // /import/{id}/trip when the user already has an unfinished trip -- e.g.
  // a leftover from a prior viewport's run of this same flow, if cleanup
  // hasn't happened yet between viewports. Handle both shapes rather than
  // assuming the "Start a new trip" button is always present.
  await page.goto(`${BASE_URL}/import`, { waitUntil: "networkidle", timeout: 30_000 });
  file = outFile("import-home", vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug: "import-home", file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name });
  await runProbes(page, "import-home", vp);

  // --- Step 1: trip form ------------------------------------------------
  let tripId: number | null = null;
  const alreadyOnTripStep = page.url().match(/\/import\/(\d+)\/trip$/);
  if (alreadyOnTripStep) {
    tripId = Number(alreadyOnTripStep[1]);
    manifest.notes.push(`Import wizard: /import auto-redirected to an existing unfinished trip id=${tripId} (viewport=${vp.name}) instead of showing "Start a new trip" -- reused it rather than the (absent) button.`);
  } else {
    await page.getByRole("button", { name: "Start a new trip" }).click();
    await page.waitForURL(/\/import\/\d+\/trip$/, { timeout: 15_000 });
    const tripMatch = page.url().match(/\/import\/(\d+)\/trip$/);
    tripId = tripMatch ? Number(tripMatch[1]) : null;
    manifest.notes.push(`Import wizard throwaway trip created: id=${tripId} (viewport=${vp.name}), owner user id=${user.id}. Deleted in cleanup.`);
  }

  file = outFile("import-step-1", vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug: "import-step-1", file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note: "trip step" });
  await runProbes(page, "import-step-1", vp);

  // Fill minimal plausible trip fields and advance.
  await page.locator('[name="name"]').fill("Design Audit Test Trip");
  await page.locator('[name="date"]').fill("2024-06-01");
  await page.locator('[name="measurerContactInfo"]').fill("audit@example.invalid");
  await page.locator('[name="firstMeasurer"]').fill("Audit, Design");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL(/\/import\/\d+\/sites$/, { timeout: 15_000 });

  // --- Step 2: sites step -----------------------------------------------
  file = outFile("import-step-2", vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug: "import-step-2", file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note: "sites step (auto-created blank site, in edit mode)" });
  await runProbes(page, "import-step-2", vp);

  // Fill minimal plausible site fields and advance to trees step.
  await page.locator('[name="name"]').fill("Design Audit Test Site");
  await page.locator('[name="coordinates"]').fill("42.9,-75.5"); // within NY, avoids the out-of-state-bounds warning
  await page.locator('[name="stateId"]').selectOption({ value: "32" }).catch(() => {});
  await page.locator('[name="county"]').fill("Audit County");
  await page.locator('[name="ownershipType"]').fill("Public").catch(() => {});
  await page.getByRole("button", { name: "Save site" }).click();
  await page.waitForURL(/\/import\/\d+\/sites$/, { timeout: 15_000 });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL(/\/import\/\d+\/trees$/, { timeout: 15_000 });

  // --- Step 3: trees step -------------------------------------------------
  await page.waitForTimeout(300);
  file = outFile("import-step-3", vp);
  await page.screenshot({ path: file, fullPage: true });
  manifest.screenshots.push({ slug: "import-step-3", file: path.relative(path.resolve(__dirname, "..", "..", ".."), file), url: page.url(), viewport: vp.name, note: "trees step" });
  await runProbes(page, "import-step-3", vp);

  await page.close();
  return tripId;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { openTestSql } = require("../../e2e/helpers/db") as typeof import("../../e2e/helpers/db");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ensureThrowawayUser, deleteThrowawayUserAndTrips } = require("../../e2e/helpers/auth-user") as typeof import("../../e2e/helpers/auth-user");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { removeTrip } = require("../../db/queries/import-drafts.sql") as typeof import("../../db/queries/import-drafts.sql");

  const sql = openTestSql();

  // Sites 32/1 named in the brief don't exist in this DB snapshot; substitute
  // real ids (discovered via a one-off query during setup). 41183 is the
  // site with the most site_visits rows (9) -- the closest present-day
  // analog to the removed "subsites" concept (M005_RemoveSubsiteTables.cs
  // dropped the Subsites tables entirely; db/schema.ts's header comments
  // confirm there is no subsite relation left to query).
  const SITE_PRIMARY_ID = 436;
  const SITE_MULTI_VISIT_ID = 41183;
  manifest.notes.push(
    `Brief specified /sites/32 (and fallback /sites/1) for the "site" and "site with subsites" captures; neither id exists in this DB snapshot. Substituted /sites/${SITE_PRIMARY_ID} (site-detail) and /sites/${SITE_MULTI_VISIT_ID} (site-detail-alt, the site with the most site_visits rows -- subsites were removed from the schema entirely by legacy migration M005_RemoveSubsiteTables.cs, so "most visits" is the closest present-day analog).`,
  );

  let chromium = loadPlaywrightChromium();
  let browser: Browser = await chromium.launch();

  /** Re-launches the browser if a prior crash disconnected it. Every
   * top-level phase below is isolated with try/catch + this check so one
   * phase's browser/GPU crash (observed in practice with headless
   * software-WebGL canvas readbacks -- see captureMap) can't take down the
   * rest of the run. */
  async function ensureBrowser(): Promise<void> {
    if (!browser.isConnected()) {
      manifest.notes.push("Browser process disconnected (crashed) -- relaunched to continue the remaining captures.");
      browser = await chromium.launch();
    }
  }

  /** Runs `fn` with a fresh context for `vp`, tolerating a crash: logs a
   * note and moves on rather than aborting the whole run. */
  async function withContext(vp: Viewport, label: string, fn: (context: BrowserContext) => Promise<void>): Promise<void> {
    try {
      await ensureBrowser();
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
      try {
        await fn(context);
      } finally {
        await context.close().catch(() => {});
      }
    } catch (err) {
      manifest.notes.push(`${label} (${vp.name}): top-level capture error, skipped: ${String(err).slice(0, 300)}`);
    }
  }

  // Runs one capture call in isolation: a failure in any single page must
  // not skip the rest of the batch (each call is independent I/O against
  // the same still-open context).
  async function safe(label: string, vpName: string, fn: () => Promise<unknown>): Promise<void> {
    try {
      await fn();
    } catch (err) {
      manifest.notes.push(`${label}--${vpName}: capture error, skipped: ${String(err).slice(0, 300)}`);
    }
  }

  try {
    for (const vp of VIEWPORTS) {
      await withContext(vp, "public pages", async (context) => {
        await safe("locations", vp.name, () => captureSimplePage(context, vp, "locations", `${BASE_URL}/locations`).then((p) => p.close()));
        await safe("species", vp.name, () => captureSimplePage(context, vp, "species", `${BASE_URL}/species`).then((p) => p.close()));
        await safe("site-detail", vp.name, () => captureSimplePage(context, vp, "site-detail", `${BASE_URL}/sites/${SITE_PRIMARY_ID}`).then((p) => p.close()));
        await safe("site-detail-alt", vp.name, () => captureSimplePage(context, vp, "site-detail-alt", `${BASE_URL}/sites/${SITE_MULTI_VISIT_ID}`, { note: "site with the most site_visits rows -- subsites concept no longer exists in schema" }).then((p) => p.close()));
        await safe("state-detail", vp.name, () => captureSimplePage(context, vp, "state-detail", `${BASE_URL}/states/32`).then((p) => p.close()));
        await safe("tree-detail", vp.name, () => captureSimplePage(context, vp, "tree-detail", `${BASE_URL}/trees/2343`).then((p) => p.close()));
        await safe("species-detail", vp.name, () => captureSpeciesDetail(context, vp));
        await safe("search", vp.name, () => captureSimplePage(context, vp, "search", `${BASE_URL}/search?term=oak`).then((p) => p.close()));
        await safe("activity", vp.name, () => captureSimplePage(context, vp, "activity", `${BASE_URL}/activity`).then((p) => p.close()));
        await safe("not-found", vp.name, () => captureSimplePage(context, vp, "not-found", `${BASE_URL}/this-page-does-not-exist`).then((p) => p.close()));
        await safe("auth-signed-out", vp.name, () => captureAuthSignedOut(context, vp));
      });

      // Map interaction is the crash-prone phase (repeated WebGL canvas
      // readbacks under headless software rendering) -- isolated in its
      // own context/withContext call so a crash here never loses the
      // (already-captured) public-page work above.
      await withContext(vp, "map", (context) => captureMap(context, vp));

      writeManifest(); // flush after every viewport so a later crash can't erase this progress
    }

    // --- Signed-in + import wizard (needs its own throwaway user) --------
    // Wrapped in its own try/catch (not just try/finally): if
    // ensureThrowawayUser or the capture flow itself throws, the already-
    // captured public/map screenshots and their manifest entries above
    // must still make it to disk.
    try {
      const user = await ensureThrowawayUser(sql);
      manifest.notes.push(`Created throwaway import-role user id=${user.id} (${user.email}) via e2e/helpers/auth-user.ts's ensureThrowawayUser (same helper e2e/global-setup.ts uses).`);
      try {
        for (const vp of VIEWPORTS) {
          // Each viewport's trip is deleted immediately after that
          // viewport's capture (not batched to the very end): /import
          // (app/import/page.tsx) auto-redirects straight into an
          // existing UNFINISHED trip instead of showing "Start a new
          // trip" -- without this, the second viewport's flow would land
          // back on the first viewport's half-filled trip instead of a
          // fresh one.
          let tripId: number | null = null;
          await withContext(vp, "signed-in + import wizard", async (context) => {
            tripId = await captureSignedInAndImport(context, vp, user);
          });
          if (tripId !== null) {
            const sqlTag = sql as unknown as import("../../db/queries/sql-tag").SqlTag;
            await removeTrip(tripId, user.id, ["import"], sqlTag).catch((err: unknown) => {
              manifest.notes.push(`Failed to remove trip ${tripId} between viewports: ${String(err).slice(0, 200)} (will retry via final deleteThrowawayUserAndTrips cleanup).`);
            });
          }
          writeManifest();
        }
      } finally {
        const removedTripIds = await deleteThrowawayUserAndTrips(sql, user.id);
        manifest.notes.push(
          `Cleanup: deleteThrowawayUserAndTrips(sql, ${user.id}) removed trip id(s) [${removedTripIds.join(", ")}] via db/queries/import-drafts.sql.ts's removeTrip (cascade of import_* draft rows + any merged canonical rows), then \`delete from users where id = ${user.id}\`.`,
        );
      }
    } catch (err) {
      manifest.notes.push(`Signed-in + import wizard flow failed: ${String(err).slice(0, 300)}`);
    }
  } finally {
    await browser.close().catch(() => {});
    await sql.end({ timeout: 5 });
    writeManifest();
  }
}

function writeManifest(): void {
  const lines: string[] = [];
  lines.push("# Design audit manifest");
  lines.push("");
  lines.push(`Generated ${new Date().toISOString()} by \`web/scripts/design-audit/capture.ts\` against ${BASE_URL}.`);
  lines.push("");
  lines.push("## Screenshots");
  lines.push("");
  lines.push("| Slug | Viewport | File | URL | Note |");
  lines.push("|---|---|---|---|---|");
  for (const s of manifest.screenshots) {
    lines.push(`| ${s.slug} | ${s.viewport} | \`${s.file.replace(/\\/g, "/")}\` | ${s.url} | ${s.note ?? ""} |`);
  }
  lines.push("");
  lines.push(`Total screenshots: ${manifest.screenshots.length}`);
  lines.push("");

  lines.push("## Notes / capture caveats");
  lines.push("");
  for (const n of manifest.notes) lines.push(`- ${n}`);
  lines.push("");

  lines.push("## Defects");
  lines.push("");

  const overflow = manifest.defects.filter((d): d is OverflowDefect => d.kind === "overflow");
  lines.push(`### Horizontal overflow (${overflow.length})`);
  lines.push("");
  if (overflow.length) {
    lines.push("| Page | Viewport | scrollWidth | innerWidth |");
    lines.push("|---|---|---|---|");
    for (const d of overflow) lines.push(`| ${d.page} | ${d.viewport} | ${d.scrollWidth} | ${d.innerWidth} |`);
  } else {
    lines.push("None found.");
  }
  lines.push("");

  const broken = manifest.defects.filter((d): d is BrokenImageDefect => d.kind === "broken-image");
  lines.push(`### Broken images (${broken.length})`);
  lines.push("");
  if (broken.length) {
    lines.push("| Page | Viewport | src | alt |");
    lines.push("|---|---|---|---|");
    for (const d of broken) lines.push(`| ${d.page} | ${d.viewport} | ${d.src} | ${d.alt} |`);
  } else {
    lines.push("None found.");
  }
  lines.push("");

  const consoleErrors = manifest.defects.filter((d): d is ConsoleErrorDefect => d.kind === "console-error");
  lines.push(`### Console / page errors (${consoleErrors.length})`);
  lines.push("");
  if (consoleErrors.length) {
    lines.push("| Page | Viewport | Message |");
    lines.push("|---|---|---|");
    for (const d of consoleErrors) lines.push(`| ${d.page} | ${d.viewport} | ${d.message.replace(/\|/g, "\\|")} |`);
  } else {
    lines.push("None found.");
  }
  lines.push("");

  const small = manifest.defects.filter((d): d is SmallTargetDefect => d.kind === "small-target");
  lines.push(`### Clickable targets under ${SMALL_TARGET_PX}x${SMALL_TARGET_PX}px (${small.length})`);
  lines.push("");
  if (small.length) {
    lines.push("| Page | Viewport | Selector | Text | Width | Height |");
    lines.push("|---|---|---|---|---|---|");
    for (const d of small) lines.push(`| ${d.page} | ${d.viewport} | \`${d.selector}\` | ${d.text.replace(/\|/g, "\\|")} | ${d.width} | ${d.height} |`);
  } else {
    lines.push("None found.");
  }
  lines.push("");

  const manifestPath = path.join(OUT_DIR, "manifest.md");
  fs.writeFileSync(manifestPath, lines.join("\n"), "utf8");
  console.log(`\nWrote manifest: ${manifestPath}`);
  console.log(`Total screenshots: ${manifest.screenshots.length}`);
  console.log(`Defects: overflow=${overflow.length} broken-images=${broken.length} console-errors=${consoleErrors.length} small-targets=${small.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
