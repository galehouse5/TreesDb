/**
 * generate-scraped-vectors.ts -- doc 07 §7.3's "200 real formatted values
 * scraped from legacy pages with their float32 inputs from the dump" golden
 * suite (task P1-12/13/scraped-vectors brief; doc 07 §7.3: "Unit
 * formatting: the reference table (doc 01 §7) plus, generated during
 * capture, 200 real formatted values scraped from legacy pages with their
 * float32 inputs from the dump -- this grounds the suite in actual legacy
 * output, not our reimplementation of it").
 *
 * SOURCES ON DISK (read-only; this script never touches legacy or the DB):
 *   - `web/parity/snapshots/pages/Browse/Trees/{id}/Details.extracted.json`
 *     (313 captured tree detail pages) -- `details` map has Height / Girth
 *     / Crown spread / Diameter / Conical volume formatted strings;
 *     `location.coordinatesValue` has the rendered "lat, long" pair plus
 *     `coordinatesKind` ("specified" -> Latitude/Longitude columns,
 *     "calculated" -> CalculatedLatitude/CalculatedLongitude columns).
 *   - `web/parity/snapshots/pages/Browse/Locations--full.extracted.json`
 *     (the default Locations grid page, 40 sites) -- RHI5/RHI10/RGI5/RGI10
 *     formatted cells, site id recovered from each row's site-name link
 *     href (`/Browse/Sites/{id}/Details`).
 *   - `web/parity/dumps/trees.csv` / `sites.csv` -- the float32 (17-digit
 *     round-trip) raw inputs those formatted strings were rendered from.
 *
 * FIELD -> FORMATTER MAPPING (transcribed from `TMD/Models/Browse/
 * BrowseTreeDetailsModel.cs`'s `[DisplayFormat]` attributes -- read in full
 * for this task):
 *   Height, Crown spread   -> `formatDistance`      (Distance, Default render)
 *   Girth, Diameter          -> `distanceSubunit`      (Distance, SubprefixOnly)
 *   Conical volume             -> `formatVolume`
 *   coordinatesValue's lat/long -> `formatLatitude`/`formatLongitude`, format "DegreesDecimalMinutes" (the only format TreeDetails ever renders coordinates in, confirmed by inspecting every captured coordinatesValue in the corpus)
 *   RHI5/RHI10/RGI5/RGI10        -> `formatRuckerIndex`
 *
 * ELEVATION IS DELIBERATELY EXCLUDED. `BrowseTreeDetailsModel.Elevation`
 * exists, but grepping every `TMD/Views/**\/*.cshtml` for "Elevation" turns
 * up only the Import trip EDITOR form (`ImportTreeModel.cshtml`,
 * `EditorTemplates/Elevation.cshtml`) -- no Browse/Map read-only view ever
 * renders it, confirmed by zero hits for the "Elevation" key across all 313
 * captured tree-details JSONs and every markerinfo JSON. There is no
 * legacy-rendered elevation string anywhere in the captured corpus to
 * scrape; inventing one would mean asserting our own reimplementation
 * against itself, which is exactly what doc 07 §7.3 says this suite must
 * NOT do. `formatElevation` shares `formatDistance`'s exact conversion
 * constants and rounding function (doc 01 §7), and is already covered by
 * `format.test.ts`'s doc-01-§7 reference-table vectors -- so it isn't
 * under-tested, just not represented in *this* scraped file.
 *
 * ENTSPTS/ENTSPTS2/TDI2/TDI3/(Abbreviated)ChampionPoints are also excluded:
 * their `[DisplayFormat(DataFormatString = "{0:0.00}")]` is plain ASP.NET
 * numeric formatting, not a `lib/units/format.ts` export -- out of scope
 * for this suite (which golden-tests that module specifically).
 *
 * SAMPLE SELECTION: every candidate is deduplicated (identical
 * formatter+input+expected), then each category is sorted by input
 * magnitude and evenly-spaced-sampled (not just the first N) so the
 * ~200-vector cap still spans small/large/negative/near-zero/rounding-
 * midpoint-ish values rather than clustering on whatever tree ids happened
 * to sort first.
 *
 * USAGE: `pnpm exec tsx scripts/generate-scraped-vectors.ts` (run from
 * `web/`). Regenerates `lib/units/format.scraped.test.ts` in place.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseCsvRecords } from "../parity/data/csv";
import type { CsvValue } from "../parity/data/csv";
import type { TreeDetailsJson, GridJson } from "../parity/extractors/schema";

const REPO_ROOT = path.resolve(__dirname, "..");
const TREES_CSV = path.join(REPO_ROOT, "parity", "dumps", "trees.csv");
const SITES_CSV = path.join(REPO_ROOT, "parity", "dumps", "sites.csv");
const TREES_SNAPSHOT_DIR = path.join(REPO_ROOT, "parity", "snapshots", "pages", "Browse", "Trees");
const LOCATIONS_GRID_JSON = path.join(
  REPO_ROOT,
  "parity",
  "snapshots",
  "pages",
  "Browse",
  "Locations--full.extracted.json",
);
const OUTPUT_FILE = path.join(REPO_ROOT, "lib", "units", "format.scraped.test.ts");

type FormatterName =
  | "formatDistance"
  | "distanceSubunit"
  | "formatVolume"
  | "formatRuckerIndex"
  | "formatLatitude"
  | "formatLongitude";

interface Vector {
  fn: FormatterName;
  input: number;
  expected: string;
  source: string;
}

function num(v: CsvValue): number {
  if (v === null) throw new Error("unexpected NULL csv value");
  return Number(v);
}

async function loadCsvById(filePath: string): Promise<Map<number, Record<string, CsvValue>>> {
  const byId = new Map<number, Record<string, CsvValue>>();
  for await (const record of parseCsvRecords(filePath)) {
    byId.set(Number(record.Id), record);
  }
  return byId;
}

const NO_DATA_MARKERS = new Set(["(no data)", "(not enough data)", "(none)"]);

/** Reverses `formatDistance`'s Default-render output ("123.5'", "37.63 m", "41.15 yd") back to a bare numeric string -- only used to sanity-check parsing, never to compute the expected string itself (that stays verbatim from the page). */
function looksLikeFormattedDistance(text: string): boolean {
  return /^-?\d+\.\d+'$/.test(text);
}
function looksLikeFormattedSubunit(text: string): boolean {
  return /^-?\d+''$/.test(text);
}
function looksLikeFormattedVolume(text: string): boolean {
  return /^-?\d+\.\d+ ft.$/.test(text); // ft³ (non-ASCII cube char)
}

async function main() {
  const treesById = await loadCsvById(TREES_CSV);
  const sitesById = await loadCsvById(SITES_CSV);

  const vectors: Vector[] = [];
  const dirs = readdirSync(TREES_SNAPSHOT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const dir of dirs) {
    const jsonPath = path.join(TREES_SNAPSHOT_DIR, dir.name, "Details.extracted.json");
    let json: TreeDetailsJson;
    try {
      json = JSON.parse(readFileSync(jsonPath, "utf8")) as TreeDetailsJson;
    } catch {
      continue;
    }
    const treeId = json.treeId;
    const tree = treesById.get(treeId);
    if (!tree) continue;
    const details = json.details;
    const source = `Trees/${treeId}/Details.extracted.json`;

    const height = details["Height"];
    if (height && !NO_DATA_MARKERS.has(height) && looksLikeFormattedDistance(height)) {
      vectors.push({ fn: "formatDistance", input: num(tree.Height), expected: height, source: `${source} details.Height` });
    }
    const crownSpread = details["Crown spread"];
    if (crownSpread && !NO_DATA_MARKERS.has(crownSpread) && looksLikeFormattedDistance(crownSpread)) {
      vectors.push({
        fn: "formatDistance",
        input: num(tree.CrownSpread),
        expected: crownSpread,
        source: `${source} details["Crown spread"]`,
      });
    }
    const girth = details["Girth"];
    if (girth && !NO_DATA_MARKERS.has(girth) && looksLikeFormattedSubunit(girth)) {
      vectors.push({ fn: "distanceSubunit", input: num(tree.Girth), expected: girth, source: `${source} details.Girth` });
    }
    const diameter = details["Diameter"];
    if (diameter && !NO_DATA_MARKERS.has(diameter) && looksLikeFormattedSubunit(diameter)) {
      vectors.push({
        fn: "distanceSubunit",
        input: num(tree.Diameter),
        expected: diameter,
        source: `${source} details.Diameter`,
      });
    }
    const volume = details["Conical volume"];
    if (volume && !NO_DATA_MARKERS.has(volume) && looksLikeFormattedVolume(volume)) {
      vectors.push({
        fn: "formatVolume",
        input: num(tree.ConicalVolume),
        expected: volume,
        source: `${source} details["Conical volume"]`,
      });
    }

    // Coordinates: "41 32.518, -079 38.983" -- split on ", ".
    const coordText = json.location?.coordinatesValue;
    if (coordText && !NO_DATA_MARKERS.has(coordText) && coordText.includes(", ")) {
      const [latText, lngText] = coordText.split(", ");
      if (latText && lngText) {
        const kind = json.location.coordinatesKind;
        const latCol = kind === "calculated" ? "CalculatedLatitude" : "Latitude";
        const lngCol = kind === "calculated" ? "CalculatedLongitude" : "Longitude";
        vectors.push({
          fn: "formatLatitude",
          input: num(tree[latCol]),
          expected: latText,
          source: `${source} location.coordinatesValue (${kind}, lat)`,
        });
        vectors.push({
          fn: "formatLongitude",
          input: num(tree[lngCol]),
          expected: lngText,
          source: `${source} location.coordinatesValue (${kind}, long)`,
        });
      }
    }
  }

  // RHI5/RHI10/RGI5/RGI10 from the default Locations grid page.
  const gridJson: GridJson = JSON.parse(readFileSync(LOCATIONS_GRID_JSON, "utf8"));
  const RHI_COLUMNS: { cellIndex: number; csvColumn: string }[] = [
    { cellIndex: 3, csvColumn: "ComputedRHI5" },
    { cellIndex: 4, csvColumn: "ComputedRHI10" },
    { cellIndex: 5, csvColumn: "ComputedRGI5" },
    { cellIndex: 6, csvColumn: "ComputedRGI10" },
  ];
  for (const row of gridJson.rows) {
    const siteLink = row.links[0];
    const match = siteLink?.href?.match(/\/Sites\/(\d+)\/Details/);
    if (!match) continue;
    const siteId = Number(match[1]);
    const site = sitesById.get(siteId);
    if (!site) continue;
    for (const { cellIndex, csvColumn } of RHI_COLUMNS) {
      const cell = row.cells[cellIndex];
      if (!cell || cell === "-") continue;
      const raw = site[csvColumn];
      if (raw === null || raw === undefined) continue;
      vectors.push({
        fn: "formatRuckerIndex",
        input: num(raw),
        expected: cell,
        source: `Locations--full.extracted.json site ${siteId} column ${csvColumn}`,
      });
    }
  }

  // Dedupe (same formatter+input+expected).
  const seen = new Set<string>();
  const deduped = vectors.filter((v) => {
    const key = `${v.fn}|${v.input}|${v.expected}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Stratified, magnitude-diverse cap per category.
  const byFn = new Map<FormatterName, Vector[]>();
  for (const v of deduped) {
    const list = byFn.get(v.fn) ?? [];
    list.push(v);
    byFn.set(v.fn, list);
  }

  const CATEGORY_CAP: Record<FormatterName, number> = {
    formatDistance: 50,
    distanceSubunit: 50,
    formatVolume: 28,
    formatLatitude: 22,
    formatLongitude: 22,
    formatRuckerIndex: 30,
  };

  const finalVectors: Vector[] = [];
  for (const [fn, list] of byFn) {
    const sorted = [...list].sort((a, b) => a.input - b.input);
    const cap = CATEGORY_CAP[fn];
    if (sorted.length <= cap) {
      finalVectors.push(...sorted);
      continue;
    }
    // Evenly-spaced sample across the sorted magnitude range.
    const step = sorted.length / cap;
    for (let i = 0; i < cap; i++) {
      finalVectors.push(sorted[Math.floor(i * step)]!);
    }
  }

  console.log(`Collected ${deduped.length} deduplicated candidate vectors across ${byFn.size} formatters.`);
  for (const [fn, list] of byFn) {
    console.log(`  ${fn}: ${list.length} candidates -> ${Math.min(list.length, CATEGORY_CAP[fn])} selected`);
  }
  console.log(`Total selected: ${finalVectors.length}`);

  writeOutput(finalVectors);
}

function writeOutput(vectors: Vector[]) {
  const byFn = new Map<FormatterName, Vector[]>();
  for (const v of vectors) {
    const list = byFn.get(v.fn) ?? [];
    list.push(v);
    byFn.set(v.fn, list);
  }

  const lines: string[] = [];
  lines.push("// GENERATED FILE -- do not hand-edit. Regenerate with:");
  lines.push("//   pnpm exec tsx scripts/generate-scraped-vectors.ts   (run from web/)");
  lines.push("//");
  lines.push("// doc 07 §7.3's scraped-values golden suite: real formatted strings scraped");
  lines.push("// from captured legacy pages (web/parity/snapshots/pages/**), paired with");
  lines.push("// their float32 raw inputs from the production dump");
  lines.push("// (web/parity/dumps/{trees,sites}.csv). See");
  lines.push("// web/scripts/generate-scraped-vectors.ts's header for the full field ->");
  lines.push("// formatter mapping, source files, and why Elevation is excluded (no legacy");
  lines.push("// Browse/Map page ever renders it -- see that file's header).");
  lines.push("//");
  lines.push(`// Generated: ${new Date().toISOString().slice(0, 10)}. ${vectors.length} vectors.`);
  lines.push("import { describe, expect, it } from \"vitest\";");
  lines.push("import {");
  lines.push("  distanceSubunit,");
  lines.push("  formatDistance,");
  lines.push("  formatRuckerIndex,");
  lines.push("  formatVolume,");
  lines.push("  Units,");
  lines.push("} from \"./format\";");
  lines.push("import { formatLatitude, formatLongitude } from \"../geo/coordinates\";");
  lines.push("");

  const DISTANCE_LIKE: FormatterName[] = ["formatDistance", "distanceSubunit", "formatVolume", "formatRuckerIndex"];

  for (const fn of DISTANCE_LIKE) {
    const list = byFn.get(fn);
    if (!list || list.length === 0) continue;
    lines.push(`describe("${fn} - scraped legacy values (doc 07 §7.3)", () => {`);
    for (const v of list) {
      const title = `${v.input} -> ${JSON.stringify(v.expected)} (${v.source})`;
      lines.push(`  it(${JSON.stringify(title)}, () => {`);
      lines.push(`    expect(${fn}(${JSON.stringify(v.input)}, Units.Feet)).toBe(${JSON.stringify(v.expected)});`);
      lines.push(`  });`);
    }
    lines.push("});");
    lines.push("");
  }

  for (const fn of ["formatLatitude", "formatLongitude"] as FormatterName[]) {
    const list = byFn.get(fn);
    if (!list || list.length === 0) continue;
    lines.push(`describe("${fn} - scraped legacy values (doc 07 §7.3, DegreesDecimalMinutes)", () => {`);
    for (const v of list) {
      const title = `${v.input} -> ${JSON.stringify(v.expected)} (${v.source})`;
      lines.push(`  it(${JSON.stringify(title)}, () => {`);
      lines.push(
        `    expect(${fn}(${JSON.stringify(v.input)}, "DegreesDecimalMinutes")).toBe(${JSON.stringify(v.expected)});`,
      );
      lines.push(`  });`);
    }
    lines.push("});");
    lines.push("");
  }

  writeFileSync(OUTPUT_FILE, lines.join("\n") + "\n", "utf8");
  console.log(`Wrote ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
