/**
 * Port of `TMD/Controllers/BrowseController.cs` `Locations`/`Species`
 * actions (task P1-03/P1-04, doc 03 §Task notes "P1-03/04", doc 01 §1).
 *
 * ---------------------------------------------------------------------
 * Locations grid (`browseSites`) -- transcribed from:
 *   - BrowseController.cs:234-262 (`Locations` action): page size 40
 *     (`SiteBrowser.PageSize = 40`), params `page`/`sort`/`sortAsc`/
 *     `stateFilter`/`countyFilter`/`siteFilter`, `SortAscending =
 *     !sortAsc.HasValue || sortAsc.Value` (default true), `SortProperty`
 *     resolved by exact (case-sensitive, C# `string.Equals`) match against
 *     the literal strings "State"/"Site"/"County"/"RHI5"/"RHI10"/"RGI5"/
 *     "RGI10"/"LastMeasurement" -- unmatched (incl. absent) -> `null`.
 *   - `TMD.Infrastructure/Repositories/SiteBrowserExtensions.cs`:
 *     `ApplyFilters` (10-25): three independent, ANDed
 *     `Restrictions.Like(col, filter, MatchMode.Anywhere)` predicates
 *     (`Name`/`state.Name`/`County`), each applied only when its filter is
 *     non-empty (`!string.IsNullOrEmpty`). `ApplySorting` (27-50): a column
 *     switch; the `default:` branch (unmatched `SortProperty`, including
 *     `null`) hardcodes `AddOrder(ComputedLastMeasurementDate,
 *     ascending: false)` -- i.e. when `sort` doesn't match a known column,
 *     the grid is ALWAYS ordered by last-measurement descending, and
 *     `sortAsc` is silently ignored for that fallback (it only governs
 *     direction once a column DID match).
 *   - `TMD.Infrastructure/Repositories/CriteriaExtensions.cs`
 *     `ListAllEntitiesByBrowser` (14-69): `TotalEntitiesCount` = count with
 *     the aliaser only (state join), NEVER the filterer -- i.e. always the
 *     grand total, filtered or not. `FilteredEntitiesCount` = `null` when
 *     no filter was supplied at all (`browser.HasFilters` false), else the
 *     filtered count. Page rows = filterer + sorter + pager all applied.
 *
 * SQL Server NULL ordering ("NULL is the lowest possible value" -- ASC
 * puts NULLs first, DESC puts them last) is the OPPOSITE of Postgres's
 * default (NULLS LAST for ASC, NULLS FIRST for DESC), so the nullable
 * numeric/date sort columns (`computed_rhi5/10`, `computed_rgi5/10`,
 * `computed_last_measurement_date`) get explicit `NULLS FIRST`/`NULLS
 * LAST` below to reproduce it.
 *
 * ORDER BY cannot bind a column name or ASC/DESC keyword as a query
 * parameter (sql-tag.ts's flat-template constraint also rules out
 * composing per-column query text at runtime -- see metrics.sql.ts's
 * "written out explicitly" precedent for the same limitation), so the row
 * query is written out twice below (one literal template with every real
 * column's direction hardcoded ASC, one hardcoded DESC) with a `CASE WHEN
 * $sortKey = '<column>' THEN <col> END` per column: exactly one CASE
 * expression is non-NULL for any given request (`sortKey` is a single
 * value), so the other N-1 "inactive" columns contribute constant NULL and
 * cannot affect row order -- letting a single ORDER BY list safely carry
 * all 8 possible columns (plus the hardcoded-descending "default" column
 * and an `id ASC` tiebreak) while only the *branch* (all-ASC vs all-DESC)
 * picks the real direction for whichever column is actually active. The
 * literal `default` fallback line is `DESC NULLS LAST` in BOTH branches,
 * matching the hardcoded-regardless-of-sortAsc legacy behavior above.
 *
 * Tiebreak: legacy has no secondary ORDER BY column for this grid
 * (NHibernate emits a single `ORDER BY <col> ASC|DESC`, nothing else), so
 * ties are whatever SQL Server's physical access path/sort implementation
 * happens to return -- genuinely unspecified, not just undocumented. This
 * port adds `id ASC` as an explicit, documented, deterministic secondary
 * key on BOTH the ascending and descending row-query templates (same
 * rationale as search.sql.ts's `id asc`/`scientific_name asc` tiebreaks),
 * EXCEPT for the `default` sort key (see below), which uses `id DESC`.
 *
 * RESOLVED for `default` only (live-site audit, doc 07 corpus, this task):
 * production-data parity verification found tie groups in the default
 * (LastMeasurementDate-descending, i.e. `/locations` with no `sort` param)
 * sort where legacy's actual tie order is `id DESC`, not `id ASC` -- e.g.
 * site 42393 "College Of The South" before site 41236 "Shakerag Hollow",
 * both dated 2026-02-28 -- confirmed directly against live
 * www.treesdb.org/Browse/Locations (College Of The South listed first).
 * Confirmed via BrowseController.cs:265-272 `RecentTrips`/`Activity` too
 * (`activity.sql.ts`), which shows the same site pair in the same order,
 * consistent with `id DESC` being the right tiebreak for this
 * ComputedLastMeasurementDate-descending physical access path specifically.
 * A PRIOR investigation (see git history) found `id DESC` fixed this pair
 * but broke `sort=State desc` badly (291 cell diffs across many same-state
 * tie groups) when applied UNIFORMLY to every sort column -- that finding
 * still holds and is why `id DESC` is scoped to `sortKey = 'default'` only
 * below (via a `CASE WHEN sortKey = 'default'` pair, mirroring the existing
 * per-column CASE pattern) rather than replacing the shared `id ASC` used
 * by every other column (`site`/`county`/`state`/`rhi*`/`rgi*`/
 * `lastMeasurement` explicit sorts are untouched and still use `id ASC` --
 * only the no-`sort`-param fallback changes). No SQL Server access exists
 * to confirm this is the true general rule (plausibly a different access
 * path/index per sort column, per the prior investigation) -- this remains
 * an empirically-driven, not proven, choice, scoped narrowly to minimize
 * risk to the other (already-matching) sort columns.
 *
 * ---------------------------------------------------------------------
 * Species grid (`browseSpecies`) -- transcribed from:
 *   - BrowseController.cs:209-232 (`Species` action): page size 40,
 *     params `page`/`sort`/`sortAsc`/`botanicalNameFilter`/
 *     `commonNameFilter`, same `SortAscending` formula as Locations, but
 *     `SortProperty` ALWAYS resolves to a real column -- unmatched `sort`
 *     falls back to `SpeciesBrowser.Property.BotanicalName` (NOT `null`),
 *     and (unlike Locations) `SortAscending` is honored even when `sort`
 *     itself is invalid/absent (there's no "hardcoded direction" special
 *     case here -- BrowseController.cs:219 computes it unconditionally).
 *   - `TreeRepository.cs` `SpeciesBrowserExtensions.ApplyFilters` (183-194)
 *     / `ApplySorting` (196-216): same ANDed-LIKE-Anywhere filter shape on
 *     `ScientificName`/`CommonName`; sort switch over the 5
 *     `SpeciesBrowser.Property` values (`BotanicalName`/`CommonName`/
 *     `MaxHeight`/`MaxGirth`/`MaxCrownSpread`), all always-non-null
 *     columns (species maxima are `MAX()` over NOT NULL tree columns --
 *     see measured-species.sql.ts) -- no NULLS FIRST/LAST needed.
 *
 * Per the task brief ("species grid per MeasuredSpecies (use the landed
 * measured-species query or its SQL shape)"), this reuses the already-landed,
 * already-tested `measuredSpecies()` (measured-species.sql.ts, task P0-05)
 * for the underlying per-(scientificName, commonName) aggregation --
 * including its W-001 max-tie-break waiver -- rather than re-deriving that
 * MAX/tied-representative-tree logic here. The species corpus is small
 * (764 rows in the production snapshot used for parity, doc 07 corpus),
 * so filtering/sorting/paging the full result in memory is cheap and, per
 * the task note above, an explicitly sanctioned approach; the `Locations`
 * grid has no equivalent "landed query" to reuse and DOES scale (1370+
 * sites), so it stays a real, filtered/sorted/paged-in-SQL query.
 *
 * D-010 (LIKE metacharacters NOT escaped -- `%`/`_` in filter text act as
 * SQL wildcards, exactly like search.sql.ts's D-010 note): `browseSites`'s
 * filters are real Postgres `ILIKE '%'+filter+'%'` patterns, so this falls
 * out for free. `browseSpecies`'s in-memory filtering is NOT run through
 * SQL, so `likeAnywhereRegExp` below hand-reproduces the same wildcard
 * semantics (`%` -> `.*`, `_` -> `.`, every other regex metacharacter
 * escaped, case-insensitive) so a filter term containing `%`/`_` still
 * behaves like the SQL Server `LIKE` it stands in for.
 */
import { type SqlTag, defaultSql } from "./sql-tag";
import { measuredSpecies, type MeasuredSpeciesRow } from "./measured-species.sql";

export const BROWSE_GRID_PAGE_SIZE = 40;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Non-negative page index; NaN/negative/absent all fall back to 0 (legacy
 * `page ?? 0`, `int?` model binding). Exported so `app/locations/page.tsx`
 * and `app/species/page.tsx` can compute the SAME effective page index
 * `browseSites`/`browseSpecies` used internally, for building correct
 * previous/next pagination links and "Showing X to Y" text via
 * `components/grids/browse-grid.tsx`'s `pageIndex` prop.
 */
export function resolveBrowsePageIndex(page: number | undefined): number {
  if (page === undefined || !Number.isFinite(page) || page < 0) return 0;
  return Math.trunc(page);
}

/** `!sortAsc.HasValue || sortAsc.Value` (BrowseController.cs:219,245): absent -> ascending. */
function resolveRequestedAscending(sortAscending: boolean | undefined): boolean {
  return sortAscending ?? true;
}

// ---------------------------------------------------------------------------
// Locations grid (Sites.Sites x Locations.States)
// ---------------------------------------------------------------------------

export type SiteSortColumn =
  | "site"
  | "county"
  | "state"
  | "rhi5"
  | "rhi10"
  | "rgi5"
  | "rgi10"
  | "lastMeasurement";

/**
 * Case-sensitive match against the literal `sort` values the legacy
 * controller recognizes (BrowseController.cs:246-254). `null` = unmatched
 * -> the hardcoded LastMeasurementDate-descending fallback.
 */
function resolveSiteSortColumn(sort: string | undefined): SiteSortColumn | null {
  switch (sort) {
    case "Site":
      return "site";
    case "County":
      return "county";
    case "State":
      return "state";
    case "RHI5":
      return "rhi5";
    case "RHI10":
      return "rhi10";
    case "RGI5":
      return "rgi5";
    case "RGI10":
      return "rgi10";
    case "LastMeasurement":
      return "lastMeasurement";
    default:
      return null;
  }
}

export interface BrowseSitesParams {
  page?: number;
  sort?: string;
  sortAscending?: boolean;
  stateFilter?: string;
  countyFilter?: string;
  siteFilter?: string;
}

export interface BrowseSiteRow {
  id: number;
  name: string;
  county: string;
  stateId: number;
  stateName: string;
  computedRhi5: number | null;
  computedRhi10: number | null;
  computedRgi5: number | null;
  computedRgi10: number | null;
  /** `YYYY-MM-DD` (Postgres `date`, cast `::text` for a deterministic wire shape) or `null`. */
  computedLastMeasurementDate: string | null;
}

export interface BrowseSitesResult {
  rows: BrowseSiteRow[];
  /** Grand total, unaffected by filters (legacy `TotalEntitiesCount`). */
  totalCount: number;
  /** `null` when no filter was supplied at all (legacy `FilteredEntitiesCount`). */
  filteredCount: number | null;
}

interface RawSiteRow {
  id: number;
  name: string;
  county: string;
  state_id: number;
  state_name: string;
  computed_rhi5: number | null;
  computed_rhi10: number | null;
  computed_rgi5: number | null;
  computed_rgi10: number | null;
  computed_last_measurement_date: string | null;
}

function mapSiteRow(r: RawSiteRow): BrowseSiteRow {
  return {
    id: r.id,
    name: r.name,
    county: r.county,
    stateId: r.state_id,
    stateName: r.state_name,
    computedRhi5: r.computed_rhi5,
    computedRhi10: r.computed_rhi10,
    computedRgi5: r.computed_rgi5,
    computedRgi10: r.computed_rgi10,
    computedLastMeasurementDate: r.computed_last_measurement_date,
  };
}

async function querySitesAscending(
  sql: SqlTag,
  sitePattern: string | null,
  countyPattern: string | null,
  statePattern: string | null,
  sortKey: string,
  limit: number,
  offset: number,
): Promise<RawSiteRow[]> {
  return sql<RawSiteRow>`
    select
      s.id,
      s.name,
      s.county,
      st.id as state_id,
      st.name as state_name,
      s.computed_rhi5,
      s.computed_rhi10,
      s.computed_rgi5,
      s.computed_rgi10,
      s.computed_last_measurement_date::text as computed_last_measurement_date
    from sites s
    join states st on st.id = s.state_id
    where (${sitePattern}::text is null or s.name ilike ${sitePattern})
      and (${countyPattern}::text is null or s.county ilike ${countyPattern})
      and (${statePattern}::text is null or st.name ilike ${statePattern})
    order by
      case when ${sortKey} = 'site' then s.name end asc,
      case when ${sortKey} = 'county' then s.county end asc,
      case when ${sortKey} = 'state' then st.name end asc,
      case when ${sortKey} = 'rhi5' then s.computed_rhi5 end asc nulls first,
      case when ${sortKey} = 'rhi10' then s.computed_rhi10 end asc nulls first,
      case when ${sortKey} = 'rgi5' then s.computed_rgi5 end asc nulls first,
      case when ${sortKey} = 'rgi10' then s.computed_rgi10 end asc nulls first,
      case when ${sortKey} = 'lastMeasurement' then s.computed_last_measurement_date end asc nulls first,
      case when ${sortKey} = 'default' then s.computed_last_measurement_date end desc nulls last,
      s.id asc
    limit ${limit} offset ${offset}
  `;
}

async function querySitesDescending(
  sql: SqlTag,
  sitePattern: string | null,
  countyPattern: string | null,
  statePattern: string | null,
  sortKey: string,
  limit: number,
  offset: number,
): Promise<RawSiteRow[]> {
  return sql<RawSiteRow>`
    select
      s.id,
      s.name,
      s.county,
      st.id as state_id,
      st.name as state_name,
      s.computed_rhi5,
      s.computed_rhi10,
      s.computed_rgi5,
      s.computed_rgi10,
      s.computed_last_measurement_date::text as computed_last_measurement_date
    from sites s
    join states st on st.id = s.state_id
    where (${sitePattern}::text is null or s.name ilike ${sitePattern})
      and (${countyPattern}::text is null or s.county ilike ${countyPattern})
      and (${statePattern}::text is null or st.name ilike ${statePattern})
    order by
      case when ${sortKey} = 'site' then s.name end desc,
      case when ${sortKey} = 'county' then s.county end desc,
      case when ${sortKey} = 'state' then st.name end desc,
      case when ${sortKey} = 'rhi5' then s.computed_rhi5 end desc nulls last,
      case when ${sortKey} = 'rhi10' then s.computed_rhi10 end desc nulls last,
      case when ${sortKey} = 'rgi5' then s.computed_rgi5 end desc nulls last,
      case when ${sortKey} = 'rgi10' then s.computed_rgi10 end desc nulls last,
      case when ${sortKey} = 'lastMeasurement' then s.computed_last_measurement_date end desc nulls last,
      case when ${sortKey} = 'default' then s.computed_last_measurement_date end desc nulls last,
      -- "default" tiebreak is id DESC (see file header); every other
      -- sort column keeps the original id ASC tiebreak.
      case when ${sortKey} = 'default' then s.id end desc,
      case when ${sortKey} != 'default' then s.id end asc
    limit ${limit} offset ${offset}
  `;
}

/** Port of `BrowseController.Locations` (BrowseController.cs:234-262). */
export async function browseSites(
  params: BrowseSitesParams,
  sql: SqlTag = defaultSql(),
): Promise<BrowseSitesResult> {
  const page = resolveBrowsePageIndex(params.page);
  const sitePattern = params.siteFilter ? `%${params.siteFilter}%` : null;
  const countyPattern = params.countyFilter ? `%${params.countyFilter}%` : null;
  const statePattern = params.stateFilter ? `%${params.stateFilter}%` : null;
  const hasFilters = sitePattern !== null || countyPattern !== null || statePattern !== null;

  const resolvedColumn = resolveSiteSortColumn(params.sort);
  const sortKey = resolvedColumn ?? "default";
  // Locations' `default:` sort branch hardcodes descending regardless of
  // `sortAsc` (SiteBrowserExtensions.cs:47-48) -- only honor the requested
  // direction once a real column matched.
  const ascending = resolvedColumn !== null ? resolveRequestedAscending(params.sortAscending) : false;

  const offset = page * BROWSE_GRID_PAGE_SIZE;
  // Perf audit 2026-07: rows + both counts are independent queries -- one
  // pipelined batch instead of rows-then-counts (2 sequential round trips).
  const [rawRows, totalRows, filteredRows] = await Promise.all([
    ascending
      ? querySitesAscending(sql, sitePattern, countyPattern, statePattern, sortKey, BROWSE_GRID_PAGE_SIZE, offset)
      : querySitesDescending(sql, sitePattern, countyPattern, statePattern, sortKey, BROWSE_GRID_PAGE_SIZE, offset),
    sql<{ count: number }>`select count(*)::int as count from sites s join states st on st.id = s.state_id`,
    hasFilters
      ? sql<{ count: number }>`
          select count(*)::int as count
          from sites s
          join states st on st.id = s.state_id
          where (${sitePattern}::text is null or s.name ilike ${sitePattern})
            and (${countyPattern}::text is null or s.county ilike ${countyPattern})
            and (${statePattern}::text is null or st.name ilike ${statePattern})
        `
      : Promise.resolve<{ count: number }[]>([]),
  ]);

  return {
    rows: rawRows.map(mapSiteRow),
    totalCount: totalRows[0]?.count ?? 0,
    filteredCount: hasFilters ? (filteredRows[0]?.count ?? 0) : null,
  };
}

// ---------------------------------------------------------------------------
// Species grid (Trees.MeasuredSpecies, filtered/sorted/paged in memory)
// ---------------------------------------------------------------------------

export type SpeciesSortColumn = "botanicalName" | "commonName" | "maxHeight" | "maxGirth" | "maxCrownSpread";

/** Case-sensitive match; unmatched (incl. absent) -> `"botanicalName"` (BrowseController.cs:220-225 -- always resolves, unlike Locations). */
function resolveSpeciesSortColumn(sort: string | undefined): SpeciesSortColumn {
  switch (sort) {
    case "BotanicalName":
      return "botanicalName";
    case "CommonName":
      return "commonName";
    case "MaxHeight":
      return "maxHeight";
    case "MaxGirth":
      return "maxGirth";
    case "MaxCrownSpread":
      return "maxCrownSpread";
    default:
      return "botanicalName";
  }
}

/**
 * Emulates Postgres `ILIKE '%' + filter + '%'` (D-010: `%`/`_` inside
 * `filter` are wildcards, not escaped) as a case-insensitive JS RegExp,
 * for the in-memory species filter. Every other regex metacharacter in
 * `filter` is escaped so it matches literally, exactly like SQL `LIKE`
 * treats any character other than `%`/`_` as literal.
 */
function likeAnywhereRegExp(filter: string): RegExp {
  const escaped = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withWildcards = escaped.replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp(withWildcards, "i");
}

function comparePrimarySpecies(a: MeasuredSpeciesRow, b: MeasuredSpeciesRow, column: SpeciesSortColumn): number {
  switch (column) {
    case "botanicalName":
      return a.scientificName.localeCompare(b.scientificName, undefined, { sensitivity: "base" });
    case "commonName":
      return a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" });
    case "maxHeight":
      return a.maxHeight - b.maxHeight;
    case "maxGirth":
      return a.maxGirth - b.maxGirth;
    case "maxCrownSpread":
      return a.maxCrownSpread - b.maxCrownSpread;
  }
}

/**
 * Deterministic tiebreak (legacy has none for this grid -- see file
 * header: NHibernate/`SpeciesBrowserExtensions.ApplySorting` emits a single
 * `ORDER BY <col> ASC|DESC`, nothing else -- SQL Server's tie order is
 * genuinely unspecified). Direction: ALWAYS ascending scientificName/
 * commonName, regardless of the requested primary direction -- i.e. this
 * function's own natural comparator, applied unmodified whether the
 * primary sort is ascending or descending (see the two call sites below:
 * only the primary comparison gets negated for a descending request, this
 * tiebreak never does). Matches `measuredSpecies()`'s own underlying
 * grouped-CTE order (`order by g.scientific_name, g.common_name` ASC,
 * measured-species.sql.ts).
 *
 * Chosen empirically: production-data parity verification against the doc
 * 07 corpus (6 sampled sort/direction combinations, each with real tied
 * rows) was run against three candidate tiebreak policies -- (1) negate
 * the tiebreak together with the primary (i.e. it flips with direction),
 * (2) always the OPPOSITE of the requested direction, (3) always ascending
 * (this one). Total mismatched grid cells across the 6 samples: (1) 522,
 * (2) 684, (3) 84 -- (3) wins by a wide margin but is NOT a perfect match
 * (some tied clusters, e.g. many species sharing MaxHeight/MaxGirth 0,
 * still land in a different relative order than legacy's actual SQL
 * Server physical order). Kept as the best available empirical
 * approximation, not a proven invariant -- flagged as a residual gap in
 * the final task report, same class of issue as `browseSites`'s `id ASC`
 * tiebreak waiver above.
 */
function compareTiebreakSpecies(a: MeasuredSpeciesRow, b: MeasuredSpeciesRow): number {
  return (
    a.scientificName.localeCompare(b.scientificName, undefined, { sensitivity: "base" }) ||
    a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" })
  );
}

export interface BrowseSpeciesParams {
  page?: number;
  sort?: string;
  sortAscending?: boolean;
  botanicalNameFilter?: string;
  commonNameFilter?: string;
}

export interface BrowseSpeciesResult {
  rows: MeasuredSpeciesRow[];
  /** Grand total, unaffected by filters. */
  totalCount: number;
  /** `null` when no filter was supplied at all. */
  filteredCount: number | null;
}

/** Port of `BrowseController.Species` (BrowseController.cs:209-232). */
export async function browseSpecies(
  params: BrowseSpeciesParams,
  sql: SqlTag = defaultSql(),
): Promise<BrowseSpeciesResult> {
  const page = resolveBrowsePageIndex(params.page);
  const botanicalRegExp = params.botanicalNameFilter ? likeAnywhereRegExp(params.botanicalNameFilter) : null;
  const commonRegExp = params.commonNameFilter ? likeAnywhereRegExp(params.commonNameFilter) : null;
  const hasFilters = botanicalRegExp !== null || commonRegExp !== null;

  const all = await measuredSpecies(sql);
  const filtered = hasFilters
    ? all.filter(
        (r) =>
          (botanicalRegExp === null || botanicalRegExp.test(r.scientificName)) &&
          (commonRegExp === null || commonRegExp.test(r.commonName)),
      )
    : all;

  const column = resolveSpeciesSortColumn(params.sort);
  const ascending = resolveRequestedAscending(params.sortAscending);
  const sorted = [...filtered].sort((a, b) => {
    const primary = comparePrimarySpecies(a, b, column);
    if (primary !== 0) return ascending ? primary : -primary;
    return compareTiebreakSpecies(a, b);
  });

  const offset = page * BROWSE_GRID_PAGE_SIZE;
  const rows = sorted.slice(offset, offset + BROWSE_GRID_PAGE_SIZE);

  return {
    rows,
    totalCount: all.length,
    filteredCount: hasFilters ? filtered.length : null,
  };
}
