/**
 * Port of `BrowseController.SpeciesDetails`/`StateDetails`
 * (`TMD/Controllers/BrowseController.cs:84-207`) + their views
 * (`TMD/Views/Browse/{SpeciesDetails,StateDetails}.cshtml` and the 5 grid
 * partials `SpeciesByStateGridPartial`/`SiteSpeciesGridPartial`/
 * `TreesGridPartial`/`StateSpeciesGridPartial`/`SitesGridPartial`) -- task
 * P1-07/P1-08, doc 03 "P1-05..08", doc 01 §1.
 *
 * --- Slug resolution ---------------------------------------------------
 * `resolveSpeciesSlug` reuses the already-tested `measuredSpecies()`
 * (measured-species.sql.ts) -- exactly the set `Trees.MeasuredSpecies`
 * covers, matching legacy's `FindMeasuredSpeciesByName` lookup domain --
 * and re-derives each row's D-011 slug (`lib/slug.ts`) to find the match.
 * Forward-only per that module's own header note; the (Unidentified)
 * placeholder species is just another (scientificName, commonName) pair in
 * this set, no special-casing needed.
 *
 * --- Header maxima (global/state/site scoped) ---------------------------
 * `globalSpeciesMaxima`/`stateSpeciesMaxima`/`siteSpeciesMaxima` are
 * dedicated single-row queries (NOT a reuse of `measuredSpecies*()`'s full
 * per-request result set, which would mean scanning/aggregating every
 * species or every species-in-state on every page load) scoped directly by
 * (scientificName, commonName[, stateId|siteId]) -- same MAX(...)/`CASE WHEN
 * max=0 THEN Invalid(0) ELSE Default(2)`/`MIN(id)`-tiebreak shape as
 * `measured-species.sql.ts` (W-001 waiver: legacy's un-ordered `TOP 1`
 * tie-break is unreproducible; this port picks the lowest id among ties),
 * duplicated here rather than imported for the same reason `db/queries/
 * map.sql.ts`'s header documents for its own private helpers -- different
 * file-ownership boundary, self-contained SQL. `row.number === 0` (no
 * matching trees at all) signals "this scope doesn't have this species" --
 * the 404 gate each legacy `FindMeasuredSpeciesByName*` null-check
 * enforces.
 *
 * --- Recorded states/sites/trees grids -----------------------------------
 * `recordedStatesForSpecies`/`recordedSitesForSpeciesInState`/
 * `recordedTreesForSpeciesInSite` are the "Recorded states" (global,
 * always) / "Recorded sites within {state}" (state-scoped) / "Recorded
 * trees within {site}" (site-scoped) grids' underlying unpaged, unsorted
 * (query-natural order) row sets -- ported from
 * `ListMeasuredSpeciesForStatesByName`/`ListMeasuredSpeciesForSitesByNameAndStateId`
 * (`Order.Asc("state.Name")`/`Order.Asc("site.Name")`, `TreeRepository.cs:99-107,149-156`)
 * and `ListByNameAndSiteId` (`Order.Desc("Height.Feet")`,
 * `TreeRepository.cs:158-164`) respectively. None of these three repo
 * methods has a secondary ORDER BY column in the legacy HQL/criteria, so
 * (as with every other "no documented tiebreak" query in this codebase --
 * `browse-grids.sql.ts`/`export-trees.sql.ts`/etc.) a deterministic `id ASC`
 * secondary key is added here.
 *
 * `SortAndPageInMemory`/`SortInMemory` (`TMD/Extensions/DataTablesGrid.cs:530-544`,
 * already transcribed once in `details.sql.ts`'s `sortSiteSpecies`) is
 * re-implemented here as the single generic `sortAndPage()` helper shared by
 * all 5 embedded grids (the 3 species-details grids above + the 2
 * state-details grids below): `IsNullOrWhiteSpace(column)` -> return rows
 * AS-IS (the SQL-natural order the row query already encodes); else a
 * stable `OrderBy(customRenderer)` -- reproduced as a stable JS `.sort()` --
 * then `.Reverse()` iff `sortAscending` is literally `false` (`true` or
 * absent/undefined both keep ascending order). An unmatched (case-sensitive)
 * `sort` value throws `NotImplementedException()` in legacy (a real 500,
 * part of the corpus's documented "grid-sort-500s" legacy-error bucket) --
 * this port instead degrades to unsorted, the same documented deviation
 * `details.sql.ts`'s `SITE_SPECIES_SORT_KEYS` already established.
 *
 * `.NET`'s `Comparer<object>.Default` sorts `null` before any non-null
 * value (used by the Sites grid's nullable `ComputedRHI5/10`/`ComputedRGI5/10`
 * columns) -- `compareValues` below reproduces that null-first ordering.
 *
 * --- State header + its two grids ----------------------------------------
 * `stateSummary(id)` ports `Mapper.Map<State, BrowseStateModel>` +
 * `ForGeoAreaMetricsMembers()` (`BrowseMapping.cs:74-77`): the state's own
 * persisted `computed_*` columns read DIRECTLY (NOT a live `metrics.sql.ts`
 * recompute) -- same "denormalized-at-import-time" precedent as
 * `details.sql.ts`'s `siteDetails()`. Also carries the state's OWN
 * double/triple-letter code (`BrowseStateModel.Code`, `codeOf()` fallback,
 * `components/details/legacy-format.ts`) AND, separately, its COUNTRY's
 * name/double/triple-letter code (needed by the species-details page's
 * state-scoped "State" `LinkedText` label, which -- per
 * `Views/Shared/DisplayTemplates/State.cshtml`: `"{Name} ({Country.Code})"`
 * -- uses the COUNTRY's code, not the state's own).
 *
 * `stateSpeciesGrid` reuses `measuredSpeciesByState(stateId)`
 * (measured-species.sql.ts, already ordered `scientific_name, common_name`
 * ASC -- exactly `ListMeasuredSpeciesByStateId`'s `Order.Asc("ScientificName")`
 * natural order) + the shared `sortAndPage()` helper (prefix `stateSpecies`,
 * columns BotanicalName/CommonName/MaxHeight/MaxGirth/MaxCrownSpread, per
 * `StateSpeciesGridPartial.cshtml` + `BrowseController.cs:173-183`).
 *
 * `sitesForState(stateId)` is a dedicated query (site name + the 4 metric
 * columns `SitesGridPartial.cshtml` actually shows -- RHI5/RHI10/RGI5/RGI10,
 * conspicuously NOT RHI20/RGI20) ordered `name ASC` (`FindSitesByStateId`,
 * `SiteRepository.cs:113-117`, `Order.Asc("Name")`), `id ASC` tiebreak.
 *
 * KNOWN LEGACY QUIRK (verified against production snapshot
 * `Browse/States/1/Details.extracted.json`: Alabama's Sites grid shows
 * "91.26"/"120.56"/... for RHI5, matching `RuckerIndex.ToString()`'s bare
 * `{FeetBasedValue:0.00}` -- 2dp, ALWAYS feet-basis, no unit suffix --
 * REGARDLESS of the visitor's units cookie): `SitesGridPartial.cshtml`'s
 * `site.ComputedRHI5.ToString()` (`RuckerIndex.cs:26-27`) calls the
 * PARAMETERLESS `ToString()`, which hardcodes `Units.Default` -- unlike
 * every other RHI/RGI row on this same page (the "State" header portlet,
 * and every other page in this app), which correctly call
 * `.ToString(UserSession.Units)`. This is a genuine legacy bug, preserved
 * verbatim: the page (app/states/[id]/page.tsx) formats the Sites grid's
 * RHI/RGI cells via `formatRuckerIndex(value, Units.Default)` unconditionally,
 * ignoring the visitor's actual units cookie, while every other Rucker-index
 * value on the same page uses the real `units` value.
 */
import { fround } from "@/lib/units/float32";
import { speciesSlug } from "@/lib/slug";
import { type SqlTag, defaultSql } from "./sql-tag";
import { measuredSpecies, measuredSpeciesByState, type MeasuredSpeciesByStateRow } from "./measured-species.sql";
import { resolveBrowsePageIndex } from "./browse-grids.sql";

export const SPECIES_STATE_GRID_PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Slug resolution
// ---------------------------------------------------------------------------

export interface ResolvedSpecies {
  scientificName: string;
  commonName: string;
}

export async function resolveSpeciesSlug(slug: string, sql: SqlTag = defaultSql()): Promise<ResolvedSpecies | null> {
  const all = await measuredSpecies(sql);
  const match = all.find((r) => speciesSlug(r.scientificName, r.commonName) === slug);
  return match ? { scientificName: match.scientificName, commonName: match.commonName } : null;
}

// ---------------------------------------------------------------------------
// Header maxima (global / state-scoped / site-scoped)
// ---------------------------------------------------------------------------

export interface SpeciesMaximaRow {
  maxHeight: number;
  maxHeightInputFormat: number;
  maxHeightTreeId: number | null;
  maxGirth: number;
  maxGirthInputFormat: number;
  maxGirthTreeId: number | null;
  maxCrownSpread: number;
  maxCrownSpreadInputFormat: number;
  maxCrownSpreadTreeId: number | null;
}

interface RawMaximaRow {
  max_height: number | null;
  max_height_input_format: number;
  max_height_tree_id: number | null;
  max_girth: number | null;
  max_girth_input_format: number;
  max_girth_tree_id: number | null;
  max_crown_spread: number | null;
  max_crown_spread_input_format: number;
  max_crown_spread_tree_id: number | null;
  number: number;
}

function mapMaximaRow(r: RawMaximaRow): SpeciesMaximaRow {
  return {
    maxHeight: fround(r.max_height ?? 0),
    maxHeightInputFormat: r.max_height_input_format,
    maxHeightTreeId: r.max_height_tree_id,
    maxGirth: fround(r.max_girth ?? 0),
    maxGirthInputFormat: r.max_girth_input_format,
    maxGirthTreeId: r.max_girth_tree_id,
    maxCrownSpread: fround(r.max_crown_spread ?? 0),
    maxCrownSpreadInputFormat: r.max_crown_spread_input_format,
    maxCrownSpreadTreeId: r.max_crown_spread_tree_id,
  };
}

export async function globalSpeciesMaxima(
  scientificName: string,
  commonName: string,
  sql: SqlTag = defaultSql(),
): Promise<SpeciesMaximaRow | null> {
  const rows = await sql<RawMaximaRow>`
    with grouped as (
      select max(height) as max_height, max(girth) as max_girth, max(crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees
      where scientific_name = ${scientificName} and common_name = ${commonName}
    )
    select
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName} and height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName} and girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName} and crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
  `;
  const r = rows[0];
  if (!r || r.number === 0) return null;
  return mapMaximaRow(r);
}

export async function stateSpeciesMaxima(
  scientificName: string,
  commonName: string,
  stateId: number,
  sql: SqlTag = defaultSql(),
): Promise<SpeciesMaximaRow | null> {
  const rows = await sql<RawMaximaRow>`
    with grouped as (
      select max(t.height) as max_height, max(t.girth) as max_girth, max(t.crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees t
      join sites s on s.id = t.site_id
      where t.scientific_name = ${scientificName} and t.common_name = ${commonName} and s.state_id = ${stateId}
    )
    select
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = ${stateId} and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = ${stateId} and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = ${stateId} and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
  `;
  const r = rows[0];
  if (!r || r.number === 0) return null;
  return mapMaximaRow(r);
}

export async function siteSpeciesMaxima(
  scientificName: string,
  commonName: string,
  siteId: number,
  sql: SqlTag = defaultSql(),
): Promise<SpeciesMaximaRow | null> {
  const rows = await sql<RawMaximaRow>`
    with grouped as (
      select max(height) as max_height, max(girth) as max_girth, max(crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees
      where scientific_name = ${scientificName} and common_name = ${commonName} and site_id = ${siteId}
    )
    select
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName}
          and site_id = ${siteId} and height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName}
          and site_id = ${siteId} and girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(id) from trees
        where scientific_name = ${scientificName} and common_name = ${commonName}
          and site_id = ${siteId} and crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
  `;
  const r = rows[0];
  if (!r || r.number === 0) return null;
  return mapMaximaRow(r);
}

// ---------------------------------------------------------------------------
// Recorded states / sites / trees grids (unpaged, query-natural order)
// ---------------------------------------------------------------------------

export interface RecordedStateRow extends SpeciesMaximaRow {
  stateId: number;
  stateName: string;
}

export interface RecordedSiteRow extends SpeciesMaximaRow {
  siteId: number;
  siteName: string;
}

export interface RecordedTreeRow {
  id: number;
  height: number;
  heightInputFormat: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
}

interface RawRecordedStateRow extends RawMaximaRow {
  state_id: number;
  state_name: string;
}

interface RawRecordedSiteRow extends RawMaximaRow {
  site_id: number;
  site_name: string;
}

/** Port of `ListMeasuredSpeciesForStatesByName` (`TreeRepository.cs:99-107`), `Order.Asc("state.Name")` + `id ASC` tiebreak. */
export async function recordedStatesForSpecies(
  scientificName: string,
  commonName: string,
  sql: SqlTag = defaultSql(),
): Promise<RecordedStateRow[]> {
  const rows = await sql<RawRecordedStateRow>`
    with grouped as (
      select s.state_id,
        max(t.height) as max_height, max(t.girth) as max_girth, max(t.crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees t
      join sites s on s.id = t.site_id
      where t.scientific_name = ${scientificName} and t.common_name = ${commonName}
      group by s.state_id
    )
    select
      g.state_id, st.name as state_name,
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = g.state_id and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = g.state_id and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2 join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and s2.state_id = g.state_id and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
    join states st on st.id = g.state_id
    order by st.name asc, g.state_id asc
  `;
  return rows.map((r) => ({ ...mapMaximaRow(r), stateId: r.state_id, stateName: r.state_name }));
}

/** Port of `ListMeasuredSpeciesForSitesByNameAndStateId` (`TreeRepository.cs:149-156`), `Order.Asc("site.Name")` + `id ASC` tiebreak. */
export async function recordedSitesForSpeciesInState(
  scientificName: string,
  commonName: string,
  stateId: number,
  sql: SqlTag = defaultSql(),
): Promise<RecordedSiteRow[]> {
  const rows = await sql<RawRecordedSiteRow>`
    with grouped as (
      select t.site_id,
        max(t.height) as max_height, max(t.girth) as max_girth, max(t.crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees t
      join sites s on s.id = t.site_id
      where t.scientific_name = ${scientificName} and t.common_name = ${commonName} and s.state_id = ${stateId}
      group by t.site_id
    )
    select
      g.site_id, si.name as site_name,
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and t2.site_id = g.site_id and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and t2.site_id = g.site_id and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = ${scientificName} and t2.common_name = ${commonName}
          and t2.site_id = g.site_id and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
    join sites si on si.id = g.site_id
    order by si.name asc, g.site_id asc
  `;
  return rows.map((r) => ({ ...mapMaximaRow(r), siteId: r.site_id, siteName: r.site_name }));
}

interface RawRecordedTreeRow {
  id: number;
  height: number;
  height_input_format: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
}

/** Port of `ListByNameAndSiteId` (`TreeRepository.cs:158-164`), `Order.Desc("Height.Feet")` + `id ASC` tiebreak. */
export async function recordedTreesForSpeciesInSite(
  scientificName: string,
  commonName: string,
  siteId: number,
  sql: SqlTag = defaultSql(),
): Promise<RecordedTreeRow[]> {
  const rows = await sql<RawRecordedTreeRow>`
    select id, height, height_input_format, girth, girth_input_format, crown_spread, crown_spread_input_format
    from trees
    where scientific_name = ${scientificName} and common_name = ${commonName} and site_id = ${siteId}
    order by height desc, id asc
  `;
  return rows.map((r) => ({
    id: r.id,
    height: fround(r.height),
    heightInputFormat: r.height_input_format,
    girth: fround(r.girth),
    girthInputFormat: r.girth_input_format,
    crownSpread: fround(r.crown_spread),
    crownSpreadInputFormat: r.crown_spread_input_format,
  }));
}

// ---------------------------------------------------------------------------
// Generic in-memory sort + page (shared by all 5 embedded grids)
// ---------------------------------------------------------------------------

/** `Comparer<object>.Default` semantics: `null` sorts before any non-null value. */
function compareValues(a: string | number | null, b: string | number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

export interface GridPageResult<T> {
  rows: T[];
  pageIndex: number;
  totalCount: number;
}

export interface GridPageParams {
  page?: number;
  sort?: string;
  sortAscending?: boolean;
}

/**
 * `SortAndPageInMemory`/`SortInMemory` (`DataTablesGrid.cs:530-544`): blank
 * `sort` -> query-natural order; else a stable sort on the matched column,
 * reversed iff `sortAscending` is literally `false` (never reversed for the
 * natural/no-sort case -- `SortInMemory`'s `IsNullOrWhiteSpace(column)`
 * short-circuit ignores `sortAscending` entirely when no column matched).
 * Unmatched (case-sensitive) `sort` values degrade to the natural order too,
 * rather than the legacy 500 (`details.sql.ts`'s already-established,
 * documented deviation).
 *
 * `naturalKeyFn` (optional 4th arg): when the caller's "natural" order is
 * itself over a NAME column (state/site/species), this re-sorts the blank/
 * unmatched case via `compareValues`'s `localeCompare` INSTEAD OF trusting
 * the underlying Postgres `ORDER BY`'s plain byte/codepoint collation --
 * same fix, same rationale, as `details.sql.ts`'s `sortSiteSpecies` (read in
 * full for this fix): production-verified (`"Acer ×freemanii".
 * localeCompare("Acer nigrum") < 0`) that Node's ICU-backed `localeCompare`
 * reproduces SQL Server/.NET's near-ignorable-symbol collation, which
 * Postgres's plain `ORDER BY scientific_name`/`ORDER BY name` (this
 * database's `C` locale, confirmed via `select datcollate from pg_database`)
 * does NOT -- verified against the doc 07 corpus: state 33's "Species" grid
 * (`stateSpeciesGrid`) previously showed "Acer ×freemanii" sorted AFTER
 * "Acer saccharum" (byte order, '×' > every ASCII letter) instead of
 * legacy's actual position (right after "Acer griseum", symbol treated as
 * near-ignorable), cascading a page's worth of row-shift diffs.
 * Callers whose natural order is a NUMERIC column (`recordedTreesForSpeciesInSite`'s
 * height-descending order has no name-collation exposure) omit this
 * argument and keep the original raw-passthrough behavior -- forcing an
 * ascending name-based natural key onto a naturally-DESCENDING numeric
 * order would be wrong, not just unnecessary.
 */
export function sortAndPage<T>(
  rows: T[],
  keyFns: Record<string, (r: T) => string | number | null>,
  params: GridPageParams,
  naturalKeyFn?: (r: T) => string | number | null,
): GridPageResult<T> {
  const matchedKeyFn = params.sort ? keyFns[params.sort] : undefined;
  let ordered = rows;
  if (matchedKeyFn) {
    ordered = [...rows].sort((a, b) => compareValues(matchedKeyFn(a), matchedKeyFn(b)));
    if (params.sortAscending === false) ordered = ordered.reverse();
  } else if (naturalKeyFn) {
    ordered = [...rows].sort((a, b) => compareValues(naturalKeyFn(a), naturalKeyFn(b)));
  }
  const pageIndex = resolveBrowsePageIndex(params.page);
  const start = pageIndex * SPECIES_STATE_GRID_PAGE_SIZE;
  return { rows: ordered.slice(start, start + SPECIES_STATE_GRID_PAGE_SIZE), pageIndex, totalCount: rows.length };
}

/** `SpeciesByStateGridPartial.cshtml` / `TreeRepository.cs:99-104`'s inline sort switch: State/MaxHeight/MaxGirth/MaxCrownSpread. */
export const RECORDED_STATES_SORT_KEYS: Record<string, (r: RecordedStateRow) => string | number | null> = {
  State: (r) => r.stateName,
  MaxHeight: (r) => r.maxHeight,
  MaxGirth: (r) => r.maxGirth,
  MaxCrownSpread: (r) => r.maxCrownSpread,
};

/** `SiteSpeciesGridPartial.cshtml` / `TreeRepository.cs:145-148`'s inline sort switch: Site/MaxHeight/MaxGirth/MaxCrownSpread. */
export const RECORDED_SITES_SORT_KEYS: Record<string, (r: RecordedSiteRow) => string | number | null> = {
  Site: (r) => r.siteName,
  MaxHeight: (r) => r.maxHeight,
  MaxGirth: (r) => r.maxGirth,
  MaxCrownSpread: (r) => r.maxCrownSpread,
};

/** `TreesGridPartial.cshtml` / `BrowseController.cs:122-125`'s sort switch: Height/Girth/CrownSpread. */
export const RECORDED_TREES_SORT_KEYS: Record<string, (r: RecordedTreeRow) => string | number | null> = {
  Height: (r) => r.height,
  Girth: (r) => r.girth,
  CrownSpread: (r) => r.crownSpread,
};

/** `StateSpeciesGridPartial.cshtml` / `BrowseController.cs:176-181`'s sort switch: BotanicalName/CommonName/MaxHeight/MaxGirth/MaxCrownSpread. */
export const STATE_SPECIES_SORT_KEYS: Record<string, (r: MeasuredSpeciesByStateRow) => string | number | null> = {
  BotanicalName: (r) => r.scientificName,
  CommonName: (r) => r.commonName,
  MaxHeight: (r) => r.maxHeight,
  MaxGirth: (r) => r.maxGirth,
  MaxCrownSpread: (r) => r.maxCrownSpread,
};

export async function stateSpeciesGrid(
  stateId: number,
  params: GridPageParams,
  sql: SqlTag = defaultSql(),
): Promise<GridPageResult<MeasuredSpeciesByStateRow>> {
  const all = await measuredSpeciesByState(stateId, sql);
  // Natural order = BotanicalName ascending (`Order.Asc("ScientificName")`,
  // `ListMeasuredSpeciesByStateId`) -- re-sorted via localeCompare, not
  // trusted from `measuredSpeciesByState`'s own Postgres `ORDER BY`; see
  // `sortAndPage`'s header.
  return sortAndPage(all, STATE_SPECIES_SORT_KEYS, params, STATE_SPECIES_SORT_KEYS.BotanicalName);
}

// ---------------------------------------------------------------------------
// Sites-within-state grid
// ---------------------------------------------------------------------------

export interface StateSiteRow {
  id: number;
  name: string;
  computedRhi5: number | null;
  computedRhi10: number | null;
  computedRgi5: number | null;
  computedRgi10: number | null;
}

interface RawStateSiteRow {
  id: number;
  name: string;
  computed_rhi5: number | null;
  computed_rhi10: number | null;
  computed_rgi5: number | null;
  computed_rgi10: number | null;
}

function froundOrNull(v: number | null): number | null {
  return v === null ? null : fround(v);
}

/** `SitesGridPartial.cshtml` / `FindSitesByStateId` (`SiteRepository.cs:113-117`), `Order.Asc("Name")` + `id ASC` tiebreak. Only 4 metric columns (RHI5/RHI10/RGI5/RGI10 -- no RHI20/RGI20), matching the legacy partial exactly. */
export async function sitesForState(stateId: number, sql: SqlTag = defaultSql()): Promise<StateSiteRow[]> {
  const rows = await sql<RawStateSiteRow>`
    select id, name, computed_rhi5, computed_rhi10, computed_rgi5, computed_rgi10
    from sites
    where state_id = ${stateId}
    order by name asc, id asc
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    computedRhi5: froundOrNull(r.computed_rhi5),
    computedRhi10: froundOrNull(r.computed_rhi10),
    computedRgi5: froundOrNull(r.computed_rgi5),
    computedRgi10: froundOrNull(r.computed_rgi10),
  }));
}

/** `SitesGridPartial.cshtml`'s inline sort switch: Site/RHI5/RHI10/RGI5/RGI10 (`BrowseController.cs:193-198`). */
export const STATE_SITES_SORT_KEYS: Record<string, (r: StateSiteRow) => string | number | null> = {
  Site: (r) => r.name,
  RHI5: (r) => r.computedRhi5,
  RHI10: (r) => r.computedRhi10,
  RGI5: (r) => r.computedRgi5,
  RGI10: (r) => r.computedRgi10,
};

export async function sitesForStateGrid(
  stateId: number,
  params: GridPageParams,
  sql: SqlTag = defaultSql(),
): Promise<GridPageResult<StateSiteRow>> {
  const all = await sitesForState(stateId, sql);
  // Natural order = Name ascending (`Order.Asc("Name")`, `FindSitesByStateId`)
  // -- re-sorted via localeCompare, not trusted from `sitesForState`'s own
  // Postgres `ORDER BY`; see `sortAndPage`'s header.
  return sortAndPage(all, STATE_SITES_SORT_KEYS, params, STATE_SITES_SORT_KEYS.Site);
}

// ---------------------------------------------------------------------------
// State header summary
// ---------------------------------------------------------------------------

export interface StateSummaryRow {
  id: number;
  name: string;
  /** The state's OWN double/triple-letter code (`BrowseStateModel.Code`'s `codeOf()` fallback input -- NOT the country's). */
  doubleLetterCode: string;
  tripleLetterCode: string;
  countryName: string;
  /** The COUNTRY's double/triple-letter code -- used by the species-details page's state-scoped "State" `LinkedText` label (`State.cshtml`: `"{Name} ({Country.Code})"`), NOT this row's own `doubleLetterCode`/`tripleLetterCode`. */
  countryDoubleLetterCode: string;
  countryTripleLetterCode: string;
  computedRhi5: number | null;
  computedRhi10: number | null;
  computedRhi20: number | null;
  computedRgi5: number | null;
  computedRgi10: number | null;
  computedRgi20: number | null;
  computedTreesMeasuredCount: number | null;
  computedLastMeasurementDate: string | null;
  /** Persisted `NE`/`SW` bounds (`Locations.hbm.xml`'s `CoordinateBounds` component mapping -- NE/SW `Latitude`/`Longitude`'s `InputFormat` is NOT a mapped column, so it always hydrates to `CoordinatesFormat.Default` for a loaded State/Country; see this file's page-level caller for the "Coordinates" row's always-specified, always-Default-format rendering this implies). */
  neLatitude: number;
  neLongitude: number;
  swLatitude: number;
  swLongitude: number;
}

interface RawStateSummaryRow {
  id: number;
  name: string;
  double_letter_code: string;
  triple_letter_code: string;
  country_name: string;
  country_double: string;
  country_triple: string;
  computed_rhi5: number | null;
  computed_rhi10: number | null;
  computed_rhi20: number | null;
  computed_rgi5: number | null;
  computed_rgi10: number | null;
  computed_rgi20: number | null;
  computed_trees_measured_count: number | null;
  computed_last_measurement_date: string | null;
  ne_latitude: number;
  ne_longitude: number;
  sw_latitude: number;
  sw_longitude: number;
}

export async function stateSummary(id: number, sql: SqlTag = defaultSql()): Promise<StateSummaryRow | null> {
  const rows = await sql<RawStateSummaryRow>`
    select
      st.id, st.name, st.double_letter_code, st.triple_letter_code,
      c.name as country_name, c.double_letter_code as country_double, c.triple_letter_code as country_triple,
      st.computed_rhi5, st.computed_rhi10, st.computed_rhi20,
      st.computed_rgi5, st.computed_rgi10, st.computed_rgi20,
      st.computed_trees_measured_count,
      st.computed_last_measurement_date::text as computed_last_measurement_date,
      st.ne_latitude, st.ne_longitude, st.sw_latitude, st.sw_longitude
    from states st
    join countries c on c.id = st.country_id
    where st.id = ${id}
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    doubleLetterCode: r.double_letter_code,
    tripleLetterCode: r.triple_letter_code,
    countryName: r.country_name,
    countryDoubleLetterCode: r.country_double,
    countryTripleLetterCode: r.country_triple,
    computedRhi5: froundOrNull(r.computed_rhi5),
    computedRhi10: froundOrNull(r.computed_rhi10),
    computedRhi20: froundOrNull(r.computed_rhi20),
    computedRgi5: froundOrNull(r.computed_rgi5),
    computedRgi10: froundOrNull(r.computed_rgi10),
    computedRgi20: froundOrNull(r.computed_rgi20),
    computedTreesMeasuredCount: r.computed_trees_measured_count,
    computedLastMeasurementDate: r.computed_last_measurement_date,
    neLatitude: fround(r.ne_latitude),
    neLongitude: fround(r.ne_longitude),
    swLatitude: fround(r.sw_latitude),
    swLongitude: fround(r.sw_longitude),
  };
}

/**
 * `CoordinateBounds.cs:92-117` `recomputeIfNeeded()`'s center formula
 * (duplicated from `db/queries/map.sql.ts`'s private, unexported
 * `boundsMidpoint` -- same cross-file-ownership self-containment rationale
 * that file's own header documents for its private helpers): applied
 * independently per axis with float32 discipline (doc 07 §6):
 * `(edge1 + (edge1 < edge2 ? 360f : 0f) - edge2) / 2f + edge2`.
 *
 * FIX (beyond the formula above, which is only the raw sum): legacy's
 * `CoordinateBounds.Center` getter doesn't stop at that raw arithmetic --
 * it constructs the result via `Coordinates.Create(rawLat, rawLng, format)`
 * -> `Longitude.Create(float, format)` (`Longitude.cs:122-136`), which
 * normalizes any value outside +/-180 back into range
 * (`degrees > 180 ? -360+degrees : degrees < -180 ? 360+degrees : degrees`)
 * -- a longitude midpoint that crosses the antimeridian overshoots past 180
 * (e.g. Alaska, state 62: NE longitude -129.9742, SW longitude 172.1155 ->
 * raw sum ~201, un-normalized) and MUST be wrapped back, or it renders as
 * the raw overshoot ("201 04.239") instead of legacy's actual "-158 55.761".
 * Verified against the production snapshot corpus (state 62). Latitude
 * never needs this in practice (a real bounding box's latitude midpoint
 * always stays within +/-90, well inside +/-180), so applying the same
 * wrap unconditionally to both axes is safe -- a no-op for latitude, the
 * fix for longitude. NOTE: `map.sql.ts`'s own (unexported, not imported
 * here) `boundsMidpoint` was the source this was duplicated from and does
 * NOT include this normalization -- out of this file's ownership to fix,
 * flagged here for that file's/task's owner (likely the same latent bug
 * affecting Alaska's map-marker longitude).
 */
export function boundsMidpoint(edge1: number, edge2: number): number {
  const e1 = fround(edge1);
  const e2 = fround(edge2);
  const offset = e1 < e2 ? 360 : 0;
  const sum = fround(fround(e1) + offset);
  const diff = fround(sum - e2);
  const half = fround(diff / 2);
  const raw = fround(half + e2);
  if (raw > 180) return fround(raw - 360);
  if (raw < -180) return fround(raw + 360);
  return raw;
}
