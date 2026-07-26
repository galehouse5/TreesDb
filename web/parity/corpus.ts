#!/usr/bin/env tsx
/**
 * corpus.ts - builds web/parity/corpus.json from the migrated Postgres DB,
 * per doc 07 §3. Run with `pnpm tsx web/parity/corpus.ts [--out <path>]`.
 *
 * Ownership note (see corpus-schema.ts's file header): that file only
 * defines the Corpus *shape*; this file is the actual producer, owned by
 * this task (P0-06/07 + corpus builder).
 *
 * Determinism: `buildCorpusFromDb` is a pure function of (DB content, seed,
 * clock). Given the same migrated DB, the same corpus.json is produced byte-
 * for-byte on every run: every array is explicitly sorted before
 * serialization, and the one PRNG in use (mulberry32, seeded 424242 per doc
 * §3) is itself deterministic. The `generatedAt` field is the sole
 * wall-clock value in the output; the CLI stamps real time by default, but
 * `buildCorpusFromDb`'s `now` option lets callers (tests, or a
 * "regenerate and diff" CI job) pin it, which is what makes the
 * "same DB -> byte-identical corpus.json" property actually testable - see
 * corpus.test.ts's determinism assertion (two runs, same pinned `now`,
 * `JSON.stringify` output compared).
 *
 * mulberry32: Tomas Wilhelmsson / Tommy Ettinger's public-domain 32-bit PRNG
 * (a `uint32` state, one xorshift-multiply mix per call). Not cryptographic;
 * chosen per doc §3's explicit spec ("150 uniformly pseudo-random with fixed
 * seed 424242 ... document the PRNG: mulberry32 over sorted tree Ids").
 * Reference implementation (the canonical ~6-line version widely cited,
 * reproduced here verbatim so the algorithm itself is auditable without an
 * external dependency - this task may not `pnpm add` anything):
 *
 *   function mulberry32(a) {
 *     return function() {
 *       a |= 0; a = a + 0x6D2B79F5 | 0;
 *       let t = Math.imul(a ^ a >>> 15, 1 | a);
 *       t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
 *       return ((t ^ t >>> 14) >>> 0) / 4294967296;
 *     };
 *   }
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import type {
  AutocompleteEndpoint,
  Corpus,
  CorpusAutocompleteTermEntry,
  CorpusGridStateEntry,
  CorpusPhotoEntry,
  CorpusRedirectEntry,
  CorpusSearchTermEntry,
  CorpusSiteEntry,
  CorpusSpeciesEntry,
  CorpusStateEntry,
  CorpusTreeEntry,
  GridName,
  SiteEdgeCaseTag,
  SpeciesEdgeCaseTag,
  TreeSampleReason,
  UnitsPreference,
} from "./corpus-schema";
import { defaultSql, type SqlTag } from "../db/queries/sql-tag";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_PATH = path.join(SCRIPT_DIR, "corpus.json");

export const RANDOM_TREE_SEED = 424242;
// Distinct, documented derived seeds for the deterministic 20% units subset
// (doc §3: "a 20% subset is also captured under Meters and Yards") - reusing
// the base seed plus a fixed offset per unit, rather than continuing to draw
// from one shared generator, so each subset's membership is independently
// reproducible without depending on draw order from the other steps.
export const UNITS_SUBSET_SEED_METERS = 424242 + 1;
export const UNITS_SUBSET_SEED_YARDS = 424242 + 2;
const UNITS_SUBSET_FRACTION = 0.2;

// ---------------------------------------------------------------------------
// mulberry32 PRNG
// ---------------------------------------------------------------------------

/** Returns a `() => number in [0,1)` generator, seeded deterministically. See file header for algorithm provenance. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic partial Fisher-Yates sample of `count` items from
 * `sortedItems` (assumed already sorted - doc §3: "over sorted tree Ids").
 * The PRNG determines *membership* only; this function's return order is
 * the shuffle's own (not re-sorted) - every call site below re-sorts the
 * picked ids/values itself before adding them to the corpus, so the final
 * corpus.json output stays stable/diff-friendly regardless.
 */
export function seededSample<T>(sortedItems: readonly T[], count: number, seed: number): T[] {
  const rand = mulberry32(seed);
  const arr = [...sortedItems];
  const n = arr.length;
  const k = Math.min(count, n);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rand() * (n - i));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr.slice(0, k);
}

function compareNumbers(a: number, b: number): number {
  return a - b;
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

interface StateRow {
  id: number;
  name: string;
  double_letter_code: string;
  triple_letter_code: string;
  computed_trees_measured_count: number | null;
}

async function buildStates(sql: SqlTag): Promise<{ states: CorpusStateEntry[]; rows: StateRow[] }> {
  const rows = await sql<StateRow>`
    select id, name, double_letter_code, triple_letter_code, computed_trees_measured_count
    from states
    order by id
  `;
  const measured = rows.filter((r) => (r.computed_trees_measured_count ?? 0) > 0);
  const unmeasured = rows.filter((r) => !((r.computed_trees_measured_count ?? 0) > 0)).slice(0, 5);
  const selected = [...measured, ...unmeasured].sort((a, b) => a.id - b.id);
  return {
    states: selected.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.double_letter_code.trim(),
      hasMeasuredTrees: (r.computed_trees_measured_count ?? 0) > 0,
    })),
    rows,
  };
}

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

interface SiteRow {
  id: number;
  name: string;
  state_id: number;
  visit_count: number;
}

async function buildSites(sql: SqlTag): Promise<CorpusSiteEntry[]> {
  const rows = await sql<SiteRow>`select id, name, state_id, visit_count from sites order by id`;
  if (rows.length === 0) return [];

  const speciesCounts = await sql<{ site_id: number; count: number }>`
    select site_id, count(distinct (scientific_name, common_name))::int as count
    from trees
    group by site_id
  `;
  const speciesCountBySite = new Map(speciesCounts.map((r) => [r.site_id, r.count]));

  const maxVisitCount = Math.max(...rows.map((r) => r.visit_count));

  return rows
    .map((r) => {
      const tags: SiteEdgeCaseTag[] = [];
      if (r.visit_count === maxVisitCount && maxVisitCount > 0) tags.push("highest-visit-count");
      const speciesCount = speciesCountBySite.get(r.id) ?? 0;
      if (speciesCount === 4) tags.push("exactly-4-species");
      if (speciesCount >= 20) tags.push("at-least-20-species");
      return {
        id: r.id,
        name: r.name,
        stateId: r.state_id,
        ...(tags.length > 0 ? { edgeCaseTags: tags } : {}),
      };
    })
    .sort((a, b) => a.id - b.id);
}

// ---------------------------------------------------------------------------
// Species (global list, from Trees.MeasuredSpecies grouping - i.e. distinct
// (scientificName, commonName) pairs across `trees`).
// ---------------------------------------------------------------------------

const NON_ASCII_RE = /[^\x00-\x7F]/;

function speciesEdgeCaseTags(scientificName: string, commonName: string): SpeciesEdgeCaseTag[] {
  const tags: SpeciesEdgeCaseTag[] = [];
  const combined = `${scientificName} ${commonName}`;
  if (combined.includes("&")) tags.push("ampersand");
  if (combined.includes("'")) tags.push("apostrophe");
  if (combined.includes("-")) tags.push("hyphen");
  if (combined.includes(".")) tags.push("period");
  if (NON_ASCII_RE.test(combined)) tags.push("non-ascii");
  if (scientificName === "(Unidentified)" || commonName === "(Unidentified)") tags.push("unidentified-placeholder");
  return tags;
}

async function buildSpecies(sql: SqlTag): Promise<CorpusSpeciesEntry[]> {
  const rows = await sql<{ scientific_name: string; common_name: string }>`
    select distinct scientific_name, common_name from trees
    order by scientific_name, common_name
  `;
  return rows.map((r) => {
    const tags = speciesEdgeCaseTags(r.scientific_name, r.common_name);
    return {
      scientificName: r.scientific_name,
      commonName: r.common_name,
      routeSegment: `${r.scientific_name} (${r.common_name})`,
      ...(tags.length > 0 ? { edgeCaseTags: tags } : {}),
    };
  });
}

// ---------------------------------------------------------------------------
// Trees (sampled + explicit edge cases)
// ---------------------------------------------------------------------------

async function buildTrees(sql: SqlTag): Promise<CorpusTreeEntry[]> {
  const entries: CorpusTreeEntry[] = [];
  const push = (ids: number[], reason: TreeSampleReason) => {
    for (const id of [...new Set(ids)].sort(compareNumbers)) entries.push({ id, reason });
  };

  const topHeight = await sql<{ id: number }>`
    select id from trees order by height desc, id asc limit 100
  `;
  push(topHeight.map((r) => r.id), "top-100-height");

  const topGirth = await sql<{ id: number }>`
    select id from trees order by girth desc, id asc limit 50
  `;
  push(topGirth.map((r) => r.id), "top-50-girth");

  const allIds = await sql<{ id: number }>`select id from trees order by id`;
  const sortedIds = allIds.map((r) => r.id);
  push(seededSample(sortedIds, 150, RANDOM_TREE_SEED), "random-seed-424242");

  const unspecifiedCoords = await sql<{ id: number }>`
    select id from trees where latitude_input_format = 1 order by id limit 20
  `;
  push(unspecifiedCoords.map((r) => r.id), "unspecified-coordinates");

  // "Invalid" (InputFormat = 0) on any of the measurement InputFormat columns - doc §3 names
  // "InputFormat" generically; trees carry several independent *_input_format columns
  // (height/girth/crownSpread/elevation/diameter, in addition to lat/long which have their
  // own dedicated "unspecified-coordinates" edge case above), so this covers all of them.
  const invalidFormat = await sql<{ id: number }>`
    select id from trees
    where height_input_format = 0
       or girth_input_format = 0
       or crown_spread_input_format = 0
       or elevation_input_format = 0
       or diameter_input_format = 0
    order by id limit 20
  `;
  push(invalidFormat.map((r) => r.id), "invalid-input-format");

  const mostMeasurements = await sql<{ tree_id: number }>`
    select tree_id from tree_measurements
    where tree_id is not null
    group by tree_id
    order by count(*) desc, tree_id asc
    limit 1
  `;
  push(mostMeasurements.map((r) => r.tree_id), "most-measurements");

  const hasPhotos = await sql<{ id: number }>`
    select distinct t.id
    from trees t
    left join photo_references pr_tree on pr_tree.tree_id = t.id
    left join tree_measurements tm on tm.tree_id = t.id
    left join photo_references pr_measurement on pr_measurement.tree_measurement_id = tm.id
    where pr_tree.id is not null or pr_measurement.id is not null
    order by t.id
    limit 20
  `;
  push(hasPhotos.map((r) => r.id), "has-photos");

  // Multi-trunk-imported tree: BEST EFFORT. The final `trees` table has no persisted
  // lineage back to the `import_trees` row(s) it was merged from (the ETL/merge doesn't
  // keep that FK - see doc 01 §10 / web/db/schema.ts's import_* tables), so this can only
  // be approximated by matching (scientificName, commonName) plus site NAME between a
  // multi-trunk `import_trees` row and a final `trees` row at a same-named site. TODO:
  // if a real lineage column is ever added, replace this heuristic with a direct join.
  const multiTrunk = await sql<{ id: number }>`
    select t.id
    from trees t
    join sites s on s.id = t.site_id
    where exists (
      select 1 from import_trees it
      join import_sites ims on ims.id = it.site_id
      where coalesce(it.number_of_trunks, 0) > 1
        and it.scientific_name = t.scientific_name
        and it.common_name = t.common_name
        and ims.name = s.name
    )
    order by t.id
    limit 1
  `;
  push(multiTrunk.map((r) => r.id), "multi-trunk-import");

  return entries;
}

// ---------------------------------------------------------------------------
// Search terms (30, doc §3 categories)
// ---------------------------------------------------------------------------

async function buildSearchTerms(sql: SqlTag): Promise<CorpusSearchTermEntry[]> {
  const entries: CorpusSearchTermEntry[] = [];
  const seen = new Set<string>();
  // Rejects empty/whitespace-only terms (problem: a blank TripleLetterCode row could
  // otherwise produce a "" search term) and silently de-duplicates so fallback chains
  // (`a ?? b ?? c`) over small/fixture DBs can't add the same term twice.
  const add = (term: string, tag: CorpusSearchTermEntry["tag"]): void => {
    if (term.trim().length === 0) return;
    if (seen.has(term)) return;
    seen.add(term);
    entries.push({ term, tag });
  };

  const states = await sql<{ double_letter_code: string; triple_letter_code: string; name: string }>`
    select double_letter_code, triple_letter_code, name from states order by id limit 10
  `;
  const sites = await sql<{ name: string; county: string | null }>`select name, county from sites order by id limit 10`;
  const species = await sql<{ scientific_name: string; common_name: string }>`
    select distinct scientific_name, common_name from trees order by scientific_name limit 10
  `;

  if (states[0]) add(states[0].double_letter_code.trim(), "exact-state-code-2");

  // Problem 1 fix: a state row can have a blank/empty TripleLetterCode (production data
  // has at least one), so the exact-state-code-3 term must come from a dedicated query
  // filtered to non-empty, non-whitespace codes rather than "the 2nd state row, whatever
  // its code happens to be".
  const tripleCodeState = await sql<{ triple_letter_code: string }>`
    select triple_letter_code from states
    where triple_letter_code is not null and length(trim(triple_letter_code)) > 0
    order by id limit 1
  `;
  if (tripleCodeState[0]) add(tripleCodeState[0].triple_letter_code.trim(), "exact-state-code-3");

  if (states[0]) add(states[0].name.slice(0, Math.max(3, Math.floor(states[0].name.length / 2))), "state-name-fragment");
  if (states[1]) add(states[1].name.slice(0, Math.max(3, Math.floor(states[1].name.length / 2))), "state-name-fragment");

  if (sites[0]) add(sites[0].name.slice(0, 4), "site-name-prefix");
  if (sites[1] ?? sites[0]) add((sites[1] ?? sites[0]!).name.slice(-4), "site-name-suffix");
  if (sites[2] ?? sites[0]) {
    const name = (sites[2] ?? sites[0]!).name;
    add(name.slice(Math.floor(name.length / 3), Math.floor(name.length / 3) + 3) || name, "site-name-infix");
  }

  if (species[0]) add(species[0].scientific_name.slice(0, 5), "species-fragment-botanical");
  if (species[1] ?? species[0]) add((species[1] ?? species[0]!).common_name.slice(0, 5), "species-fragment-common");
  if (species[2] ?? species[0]) add((species[2] ?? species[0]!).scientific_name.slice(-5), "species-fragment-botanical");
  if (species[3] ?? species[0]) add((species[3] ?? species[0]!).common_name.slice(-5), "species-fragment-common");

  add("zzz_no_such_term_zzz", "zero-hits");

  // >25-hit term: prefer a single common vowel, which is likely to exceed 25 hits across
  // names/counties/species at any nontrivial data scale; falls back gracefully (still a
  // valid, if small, result set) against tiny fixture DBs used in tests.
  add("e", "over-25-hits");

  add("%", "like-metacharacter-percent");
  add("_", "like-metacharacter-underscore");

  if (sites[0]) add(mixedCase(sites[0].name), "mixed-case");
  if (species[0]) add(mixedCase(species[0].common_name), "mixed-case");

  // Doc §3 wants 30 terms covering diverse real categories - no zero-hit padding beyond
  // the single intentional zero-hits term above. Every addition below is queried directly
  // from the migrated data (never a synthetic "fillerN" placeholder).

  // Extra site-name suffix/prefix/infix fragments, beyond the core three above - different
  // rows AND different slice widths/offsets than the core ones, so fallback chains over a
  // small site list still add a genuinely distinct substring rather than colliding.
  const extraSuffixSite = sites[5] ?? sites[2] ?? sites[0];
  if (extraSuffixSite) add(extraSuffixSite.name.slice(-3), "site-name-suffix");
  const extraPrefixSite = sites[7] ?? sites[4] ?? sites[0];
  if (extraPrefixSite) add(extraPrefixSite.name.slice(0, 3), "site-name-prefix");
  const extraInfixSite = sites[6] ?? sites[3] ?? sites[1] ?? sites[0];
  if (extraInfixSite) {
    const name = extraInfixSite.name;
    const start = Math.min(Math.ceil((name.length * 2) / 3), Math.max(0, name.length - 3));
    add(name.slice(start, start + 3) || name, "site-name-infix");
  }

  // species-fragment-both: a fragment that is simultaneously a substring of some row's
  // scientificName AND some (possibly different) row's commonName - doc §3's "species
  // fragments hitting both botanical and common names". Found by taking every distinct
  // genus (first word of scientificName) and checking whether it also occurs inside any
  // commonName, over the FULL distinct species set (not just the 10-row sample above) so
  // small/large DBs alike get the best real answer available. Iteration is over a sorted,
  // de-duplicated genus list, so the pick is fully deterministic.
  const allSpecies = await sql<{ scientific_name: string; common_name: string }>`
    select distinct scientific_name, common_name from trees order by scientific_name, common_name
  `;
  const genusByLower = new Map<string, string>();
  for (const s of allSpecies) {
    const genus = s.scientific_name.split(" ")[0] ?? "";
    const lower = genus.toLowerCase();
    if (genus.length >= 3 && !genusByLower.has(lower)) genusByLower.set(lower, genus);
  }
  const commonHaystack = allSpecies.map((s) => s.common_name.toLowerCase()).join(" ");
  let bothTerm: string | undefined;
  for (const lower of [...genusByLower.keys()].sort()) {
    if (commonHaystack.includes(lower)) {
      bothTerm = genusByLower.get(lower)!;
      break;
    }
  }
  if (bothTerm) {
    add(bothTerm, "species-fragment-both");
  } else {
    // Best-effort fallback for DBs too small to have any genus/commonName overlap (e.g.
    // corpus.test.ts's PGlite fixture) - a distinct slice offset from the other
    // species-fragment-* terms above, so it doesn't collide with them.
    const fallbackSpecies = species[4] ?? species[1] ?? species[0];
    if (fallbackSpecies) add(fallbackSpecies.scientific_name.slice(1, 4), "species-fragment-both");
  }

  // over-25-hits term that isn't just "e": score a short list of common English words
  // against real site names/counties, state names, and species names, and take whichever
  // scores highest (ties broken by list order) - on production-scale data this reliably
  // clears 25 hits; on tiny fixtures it still deterministically picks the best available.
  const OVER_25_CANDIDATES = ["Park", "School", "Creek", "Lake", "Cemetery", "Church", "Road", "Forest"] as const;
  let bestOver25Term: string = OVER_25_CANDIDATES[0];
  let bestOver25Count = -1;
  for (const candidate of OVER_25_CANDIDATES) {
    const pattern = `%${candidate}%`;
    const rows = await sql<{ count: number }>`
      select (
        (select count(*)::int from sites where name ilike ${pattern} or county ilike ${pattern})
        + (select count(*)::int from states where name ilike ${pattern})
        + (select count(distinct (scientific_name, common_name))::int from trees where scientific_name ilike ${pattern} or common_name ilike ${pattern})
      )::int as count
    `;
    const count = rows[0]?.count ?? 0;
    if (count > bestOver25Count) {
      bestOver25Count = count;
      bestOver25Term = candidate;
    }
  }
  add(bestOver25Term, "over-25-hits");

  // County-name fragments: exercises the county ilike arms of searchSites (a distinct
  // code path from site.name), using up to 2 distinct non-empty, non-whitespace counties.
  const counties = await sql<{ county: string }>`
    select distinct county from sites
    where county is not null and length(trim(county)) > 0
    order by county limit 10
  `;
  const county0 = counties[0];
  if (county0) {
    const c = county0.county.trim();
    add(c.slice(0, Math.max(3, Math.floor(c.length / 2))), "county-name-fragment");
  }
  const county1 = counties[1] ?? counties[0];
  if (county1) add(county1.county.trim().slice(-4), "county-name-fragment");

  // Fill any remaining slots (there are 24 required terms above; production-scale data
  // easily has 6+ more distinct real fragments to spare) with additional real, data-driven
  // fragments cycling through whatever states/sites/species rows haven't been used yet.
  // Capped at 30 total so it can never crowd out the required terms added above.
  const fillers: [string, CorpusSearchTermEntry["tag"]][] = [
    ...states.slice(2).map((s): [string, CorpusSearchTermEntry["tag"]] => [s.name.slice(0, 4), "state-name-fragment"]),
    ...sites.slice(3).map((s): [string, CorpusSearchTermEntry["tag"]] => [s.name.slice(0, 3), "site-name-prefix"]),
    ...species.slice(4).map((s): [string, CorpusSearchTermEntry["tag"]] => [s.scientific_name.slice(0, 4), "species-fragment-botanical"]),
  ];
  for (const [term, tag] of fillers) {
    if (entries.length >= 30) break;
    if (term) add(term, tag);
  }

  // Deterministic non-empty safety net so the corpus is always exactly 30 terms even
  // against a DB too small/sparse for the above to yield 30 unique real values (e.g. tiny
  // test fixtures). Never expected to engage against production-scale data, and never
  // tagged "zero-hits" - doc §3 wants exactly one intentional zero-hit term, added above.
  let padIndex = 0;
  while (entries.length < 30) {
    add(`pad-term-${padIndex}`, "fallback-pad");
    padIndex++;
  }

  return entries.slice(0, 30);
}

function mixedCase(s: string): string {
  return s
    .split("")
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
}

// ---------------------------------------------------------------------------
// Autocomplete terms (10 per endpoint, doc §3)
// ---------------------------------------------------------------------------

async function buildAutocompleteTerms(sql: SqlTag): Promise<CorpusAutocompleteTermEntry[]> {
  const species = await sql<{ scientific_name: string; common_name: string }>`
    select distinct scientific_name, common_name from trees order by scientific_name limit 10
  `;

  const forEndpoint = (endpoint: AutocompleteEndpoint): CorpusAutocompleteTermEntry[] => {
    const names = species.map((s) => (endpoint === "commonName" ? s.common_name : s.scientific_name));
    const entries: CorpusAutocompleteTermEntry[] = [];
    if (names[0]) entries.push({ endpoint, term: names[0]!.slice(0, 1), tag: "one-character" });
    entries.push({ endpoint, term: "zzznosuchspecieszzz", tag: "no-match" });
    for (const name of names.slice(1, 9)) {
      entries.push({ endpoint, term: name.slice(0, Math.min(4, name.length)) });
    }
    let i = 0;
    while (entries.length < 10) {
      entries.push({ endpoint, term: `filler${i}` });
      i++;
    }
    return entries.slice(0, 10);
  };

  return [...forEndpoint("commonName"), ...forEndpoint("scientificName")];
}

// ---------------------------------------------------------------------------
// Grid states (doc §3: default + every sortable column asc/desc on page 0,
// one deep page, one filtered view - per grid).
//
// BEST EFFORT: the exact sortable-column set and filter parameter names for
// each DataTablesGrid are defined in the legacy .cshtml views, which are
// outside this task's reading scope. The column names below are the
// corresponding domain fields per doc 01/07 (site/species/state metrics) -
// TODO(P0-08 capture spot-check): confirm/adjust against the live grid's
// actual `data-sort-column` attributes during the mandated 5-artifact manual
// spot-check (doc 07 §4) before bulk capture.
// ---------------------------------------------------------------------------

const GRID_SORT_COLUMNS: Record<GridName, string[]> = {
  locations: ["Name", "State", "VisitCount", "TreesMeasuredCount"],
  species: ["ScientificName", "CommonName", "Number", "MaxHeight", "MaxGirth"],
  "site-species": ["ScientificName", "CommonName", "Number", "MaxHeight", "MaxGirth"],
  "state-species": ["ScientificName", "CommonName", "Number", "MaxHeight", "MaxGirth"],
  "state-sites": ["Name", "VisitCount", "TreesMeasuredCount"],
  "species-by-state": ["State", "Number", "MaxHeight"],
  "species-site-species": ["ScientificName", "CommonName", "MaxHeight"],
  "species-trees": ["Height", "Girth", "LastMeasured"],
};

const GRID_PREFIX: Record<GridName, string> = {
  locations: "",
  species: "",
  "site-species": "",
  "state-species": "stateSpecies",
  "state-sites": "sites",
  "species-by-state": "stateSpecies",
  "species-site-species": "siteSpecies",
  "species-trees": "trees",
};

function gridStatesFor(
  grid: GridName,
  scope: { entityId?: number; speciesRouteSegment?: string; scopeSiteId?: number; scopeStateId?: number } = {},
): CorpusGridStateEntry[] {
  const prefix = GRID_PREFIX[grid];
  const p = (name: string) => (prefix ? `${prefix}${name}` : name.charAt(0).toLowerCase() + name.slice(1));
  const base = { grid, parameterNamePrefix: prefix, ...scope };

  const entries: CorpusGridStateEntry[] = [
    { ...base, description: "default", params: {} },
    { ...base, description: "page:2", params: { [p("Page")]: "2" } },
    { ...base, description: "filtered:example", params: { [p("Filter")]: "a" } },
  ];
  for (const column of GRID_SORT_COLUMNS[grid]) {
    entries.push({ ...base, description: `sort:${column} asc`, params: { [p("Sort")]: column, [p("SortAsc")]: "true" } });
    entries.push({ ...base, description: `sort:${column} desc`, params: { [p("Sort")]: column, [p("SortAsc")]: "false" } });
  }
  return entries;
}

function buildGridStates(sites: CorpusSiteEntry[], states: CorpusStateEntry[], species: CorpusSpeciesEntry[]): CorpusGridStateEntry[] {
  const entries: CorpusGridStateEntry[] = [];
  entries.push(...gridStatesFor("locations"));
  entries.push(...gridStatesFor("species"));

  const site = sites[0];
  if (site) entries.push(...gridStatesFor("site-species", { entityId: site.id }));

  const state = states[0];
  if (state) {
    entries.push(...gridStatesFor("state-species", { entityId: state.id }));
    entries.push(...gridStatesFor("state-sites", { entityId: state.id }));
  }

  const sp = species[0];
  if (sp && state) entries.push(...gridStatesFor("species-by-state", { speciesRouteSegment: sp.routeSegment, scopeStateId: state.id }));
  if (sp && site) {
    entries.push(...gridStatesFor("species-site-species", { speciesRouteSegment: sp.routeSegment, scopeSiteId: site.id }));
    entries.push(...gridStatesFor("species-trees", { speciesRouteSegment: sp.routeSegment, scopeSiteId: site.id }));
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

async function buildPhotos(sql: SqlTag): Promise<CorpusPhotoEntry[]> {
  // Deliberately not filtered to sampled tree/site ids: array-typed bind parameters aren't
  // guaranteed to round-trip identically through the PGlite test shim (sql-tag.ts: only flat
  // scalar params are supported everywhere this task's tooling needs to run), and doc §4 only
  // requires "20 corpus photos" without mandating they align 1:1 with the tree/site sample.
  const rows = await sql<{ photo_id: number }>`
    select distinct photo_id from photo_references order by photo_id limit 20
  `;
  return rows.map((r) => ({ id: r.photo_id }));
}

// ---------------------------------------------------------------------------
// Redirects (minimal representative set - full Phase 4 redirect corpus is a
// separate, later task per doc 06; this seeds the field so the Corpus shape
// is satisfied and a couple of the doc §5.6 special-character cases are
// covered from day one).
// ---------------------------------------------------------------------------

function buildRedirects(species: CorpusSpeciesEntry[]): CorpusRedirectEntry[] {
  const entries: CorpusRedirectEntry[] = [
    { legacyPath: "/", description: "root redirects to /Map" },
    { legacyPath: "/Main", description: "legacy Main controller root" },
  ];
  const specialCharSpecies = species.find((s) => s.edgeCaseTags && s.edgeCaseTags.length > 0);
  if (specialCharSpecies) {
    entries.push({
      legacyPath: `/Browse/Species/${specialCharSpecies.routeSegment}/Details`,
      description: "species details, raw special characters",
    });
    entries.push({
      legacyPath: `/Browse/Species/${encodeURIComponent(specialCharSpecies.routeSegment)}/Details`,
      description: "species details, percent-encoded",
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// siteSpeciesPairs / stateSpeciesPairs
// ---------------------------------------------------------------------------

async function buildPairs(
  sql: SqlTag,
  sites: CorpusSiteEntry[],
  states: CorpusStateEntry[],
  species: CorpusSpeciesEntry[],
): Promise<{ siteSpeciesPairs: Corpus["siteSpeciesPairs"]; stateSpeciesPairs: Corpus["stateSpeciesPairs"] }> {
  const siteSpeciesPairs: Corpus["siteSpeciesPairs"] = [];
  const stateSpeciesPairs: Corpus["stateSpeciesPairs"] = [];

  const taggedSpecies = species.filter((s) => s.edgeCaseTags && s.edgeCaseTags.length > 0).slice(0, 6);
  const candidateSpecies = taggedSpecies.length > 0 ? taggedSpecies : species.slice(0, 3);

  for (const sp of candidateSpecies) {
    const siteRow = await sql<{ site_id: number }>`
      select site_id from trees where scientific_name = ${sp.scientificName} and common_name = ${sp.commonName}
      order by site_id limit 1
    `;
    if (siteRow[0] && sites.some((s) => s.id === siteRow[0]!.site_id)) {
      siteSpeciesPairs.push({ siteId: siteRow[0].site_id, speciesRouteSegment: sp.routeSegment });
    }

    const stateRow = await sql<{ state_id: number }>`
      select s.state_id from trees t join sites s on s.id = t.site_id
      where t.scientific_name = ${sp.scientificName} and t.common_name = ${sp.commonName}
      order by s.state_id limit 1
    `;
    if (stateRow[0] && states.some((s) => s.id === stateRow[0]!.state_id)) {
      stateSpeciesPairs.push({ stateId: stateRow[0].state_id, speciesRouteSegment: sp.routeSegment });
    }
  }

  return { siteSpeciesPairs, stateSpeciesPairs };
}

// ---------------------------------------------------------------------------
// Units subset (doc §3: "a 20% subset is also captured under Meters and
// Yards"). Deterministic 20% sample of each entity category via mulberry32,
// seeded distinctly per unit (see UNITS_SUBSET_SEED_* above).
// ---------------------------------------------------------------------------

function buildUnitsSubsetFor(
  unitsPreference: Extract<UnitsPreference, "Meters" | "Yards">,
  seed: number,
  treeIds: number[],
  siteIds: number[],
  stateIds: number[],
  speciesRouteSegments: string[],
): Corpus["unitsSubset"][number] {
  const take = (ids: readonly number[]) => seededSample(ids, Math.ceil(ids.length * UNITS_SUBSET_FRACTION), seed).sort(compareNumbers);
  const takeStr = (items: readonly string[]) =>
    seededSample(items, Math.ceil(items.length * UNITS_SUBSET_FRACTION), seed).sort();
  return {
    unitsPreference,
    treeIds: take(treeIds),
    siteIds: take(siteIds),
    stateIds: take(stateIds),
    speciesRouteSegments: takeStr(speciesRouteSegments),
  };
}

// ---------------------------------------------------------------------------
// Top-level builder
// ---------------------------------------------------------------------------

export interface BuildCorpusOptions {
  /** Overrides the wall clock for `generatedAt` - pass a fixed value for reproducible/testable output. Defaults to real time. */
  now?: () => Date;
}

export async function buildCorpusFromDb(sql: SqlTag, options: BuildCorpusOptions = {}): Promise<Corpus> {
  const { states } = await buildStates(sql);
  const sites = await buildSites(sql);
  const species = await buildSpecies(sql);
  const trees = await buildTrees(sql);
  const searchTerms = await buildSearchTerms(sql);
  const autocompleteTerms = await buildAutocompleteTerms(sql);
  const gridStates = buildGridStates(sites, states, species);
  const treeIds = [...new Set(trees.map((t) => t.id))].sort(compareNumbers);
  const photos = await buildPhotos(sql);
  const redirects = buildRedirects(species);
  const { siteSpeciesPairs, stateSpeciesPairs } = await buildPairs(sql, sites, states, species);

  const siteIds = sites.map((s) => s.id);
  const stateIds = states.map((s) => s.id);
  const speciesRouteSegments = species.map((s) => s.routeSegment);
  const unitsSubset: Corpus["unitsSubset"] = [
    buildUnitsSubsetFor("Meters", UNITS_SUBSET_SEED_METERS, treeIds, siteIds, stateIds, speciesRouteSegments),
    buildUnitsSubsetFor("Yards", UNITS_SUBSET_SEED_YARDS, treeIds, siteIds, stateIds, speciesRouteSegments),
  ];

  const now = options.now ? options.now() : new Date();

  return {
    generatedAt: now.toISOString(),
    states,
    sites,
    species,
    trees,
    searchTerms,
    autocompleteTerms,
    gridStates,
    photos,
    redirects,
    siteSpeciesPairs,
    stateSpeciesPairs,
    unitsSubset,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      out: { type: "string", default: DEFAULT_OUT_PATH },
    },
    allowPositionals: false,
  });
  const outPath = path.resolve(String(values.out));

  const sql = defaultSql();
  const corpus = await buildCorpusFromDb(sql);
  await writeFile(outPath, `${JSON.stringify(corpus, null, 2)}\n`, "utf-8");
  console.log(
    `corpus.ts: wrote ${outPath} (states=${corpus.states.length} sites=${corpus.sites.length} species=${corpus.species.length} trees=${corpus.trees.length} searchTerms=${corpus.searchTerms.length})`,
  );
}

// Robust "is this module the CLI entry point" check (cross-platform: on
// Windows, `import.meta.url` is a `file:///C:/...` URL while
// `process.argv[1]` is a plain `C:\...` path - naive string concatenation
// comparison silently never matches there, so main() would never run).
const isDirectlyExecuted = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
})();

if (isDirectlyExecuted) {
  main()
    .catch((err) => {
      console.error(err instanceof Error ? (err.stack ?? err.message) : err);
      process.exitCode = 1;
    })
    .finally(async () => {
      // Close the shared postgres.js pool -- without this the open
      // connection keeps the event loop alive and the CLI never exits.
      const { getSql, hasDatabaseUrl } = await import("../db");
      if (hasDatabaseUrl()) await getSql().end({ timeout: 5 });
    });
}
