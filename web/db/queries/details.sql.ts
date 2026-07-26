/**
 * Port of `BrowseController.TreeDetails`/`SiteDetails`
 * (`TMD/Controllers/BrowseController.cs:25-82`) + their views
 * (`TMD/Views/Browse/{TreeDetails,SiteDetails}.cshtml` and partials) --
 * task P1-05/P1-06, doc 03 "P1-05..08", doc 01 §1.
 *
 * --- Tree details -----------------------------------------------------------
 * `treeDetails(id)` returns the tree's own denormalized row (already the
 * last measurement's values, per `Tree.RecalculateProperties()`,
 * `TMD.Model/Trees/Tree.cs:50-73`) PLUS:
 *   - `generalComments`: NOT a `trees` column (`Tree` has no
 *     `GeneralComments` property at all -- `BrowseMapping.cs:29` maps
 *     `BrowseTreeDetailsModel.GeneralComments` from
 *     `src.LastMeasurement.GeneralComments`, i.e. the newest
 *     `tree_measurements` row). Same `order by measured desc, id desc limit
 *     1` lateral-join pattern as `export-trees.sql.ts`'s `lm` CTE (`.Last()`
 *     after a stable ascending `orderby Measured` == the largest id among
 *     ties at the max date).
 *   - `tdi2`/`tdi3` raw division inputs (`maxHeight`/`maxGirth`/
 *     `maxCrownSpread`): NOT persisted anywhere (`Tree.TDI2`/`TDI3`,
 *     `TMD.Model/Trees/Tree.cs:80-81`, are computed properties against the
 *     tree's `GlobalMeasuredSpecies`, i.e. the CURRENT global max
 *     height/girth/crown-spread for its (scientific_name, common_name)
 *     pair) -- computed live via a `trees`-grouped join, mirroring
 *     `db/queries/map.sql.ts`'s `treeAndSpeciesMax`/`calculateTDI2/3`
 *     (duplicated rather than imported -- see that file's header on
 *     cross-file-ownership self-containment; `components/details/
 *     legacy-format.ts`'s `calculateTDI2/3` do the actual division+rounding
 *     from these raw inputs).
 *   - `measurements`: `tree_measurements` rows for this tree, each with its
 *     OWN persisted `ENTSPTS`/`ENTSPTS2`/`ChampionPoints`/
 *     `AbbreviatedChampionPoints`/`Diameter`/`ConicalVolume` (computed once
 *     at import time, `Measurement.RecalculateProperties()`,
 *     `TMD.Model/Trees/Measurement.cs:122-131`, and persisted -- read
 *     directly, not recomputed) PLUS the same kind of live TDI2/TDI3 inputs
 *     (against the MEASUREMENT's own scientific/common name, which for the
 *     common case equals the tree's), its own measurement-scoped measurers
 *     (`tree_measurers.measurement_id`), and its own photo count
 *     (`photo_references` type=7 `tree_measurement_id`-scoped). Ordered
 *     `measured desc` (`orderby measurement.Measured descending` ==
 *     `OrderByDescending(m => m.Measured)`, `BrowseController.cs:31-32`)
 *     with an `id ASC` tiebreak -- NOT `id desc`. LINQ's `OrderByDescending`
 *     is a STABLE sort: elements tied on the sort key keep their ORIGINAL
 *     relative order (ascending id, NHibernate's physical/insertion load
 *     order), which for a descending-by-date sort means the LOWER id comes
 *     FIRST among same-date ties -- verified against the production
 *     snapshot corpus (doc 07 §5.4 `pages` category; an earlier `id desc`
 *     choice here mis-ordered a same-date 2-visit tie on site 40330's
 *     `visits`, see that field's analogous case below). This is the
 *     opposite tiebreak direction from the `general_comments`
 *     "pick-the-single-latest-row" lateral join above (`order by ... desc,
 *     id desc limit 1`), which mirrors `.OrderBy(...).Last()` (ascending
 *     stable sort + take-last == highest id wins the tie) -- a different
 *     LINQ idiom with the opposite tie-winner, not an inconsistency.
 *
 * --- Site details ------------------------------------------------------------
 * `siteDetails(id, {page, sort, sortAscending})` returns the site's own
 * `computed_*` metric columns directly (`IGeoAreaMetricsModel`'s
 * `ForGeoAreaMetricsMembers()`, `TMD/Models/IGeoAreaMetricsModel.cs:24-33`,
 * maps 1:1 from `Site.ComputedRHI5`.../`ComputedTreesMeasuredCount`/
 * `ComputedLastMeasurementDate` -- themselves plain properties backed by the
 * `computed_*` DB columns, doc 01 §4 D-004) -- NOT a live recompute (that's
 * `metrics.sql.ts`'s job, used elsewhere); `county`/`ownershipType`/
 * `ownershipContactInfo`/`makeOwnershipContactInfoPublic` are likewise
 * already-denormalized `sites` columns (`Site.RecalculateProperties()`
 * copies them from `LastVisit`, `TMD.Model/Sites/Site.cs:59-66`) --
 * `lastVisitComments` is the one exception: `BrowseMapping.cs:63` maps
 * `LastVisitComments` from `src.LastVisit.Comments` specifically (not a
 * `sites` column), same `order by visited desc, id desc limit 1` pattern as
 * `Site.LastVisit` (`Site.cs:39-43`: stable ascending `orderby Visited` +
 * `.Last()`).
 *
 * `visits`: every `site_visits` row for this site, newest first
 * (`site.Visits.OrderByDescending(v => v.Visited)`, `BrowseController.cs:56`)
 * with an `id ASC` tiebreak -- same stable-sort reasoning as the
 * `measurements` list above, NOT the `id desc` used by the single-latest-row
 * lateral joins -- each with its own `site_visitors` (visit-scoped,
 * `Visitors` `IList<Name>`).
 *
 * `speciesGrid`: reuses `measuredSpeciesBySite` (`measured-species.sql.ts`,
 * an existing query port -- exactly `Repositories.Trees.
 * ListMeasuredSpeciesBySiteId`, `BrowseController.cs:57`) for the full,
 * UNPAGED per-site species list, then reproduces
 * `SortAndPageInMemory`/`SortInMemory`/`PageInMemory`
 * (`TMD/Extensions/DataTablesGrid.cs:522-543,569-578`) in JS exactly as
 * legacy does it IN MEMORY over the fully-materialized list -- NOT as a SQL
 * `ORDER BY`/`LIMIT`, so the two are faithfully equivalent (same rows, same
 * tie behavior modulo the string-collation caveat noted on
 * `SITE_SPECIES_SORT_KEYS` below). Column switch is
 * `BrowseController.cs:60-67`'s exact (case-sensitive) string set;
 * `sortAscending` semantics are `SortInMemory`'s `!false.Equals(sortAscending)`
 * (literal `false` reverses, `true` OR absent/undefined keeps the query's
 * natural ascending-by-(scientificName,commonName) order) -- NOT the
 * `BrowseGrid` component's own `defaultSortAscending` link-building hint,
 * which only matters for what URL a header click BUILDS, not what the
 * server does with `sortAsc` once present.
 */
import { fround } from "@/lib/units/float32";
import { type SqlTag, defaultSql } from "./sql-tag";
import { measuredSpeciesBySite, type MeasuredSpeciesBySiteRow } from "./measured-species.sql";
import { resolveBrowsePageIndex } from "./browse-grids.sql";

export const SITE_SPECIES_GRID_PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Tree details
// ---------------------------------------------------------------------------

export interface TdiInputsRaw {
  height: number;
  heightInputFormat: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  maxHeight: number;
  maxGirth: number;
  maxCrownSpread: number;
}

export interface TreeMeasurementRow extends TdiInputsRaw {
  id: number;
  measured: string;
  scientificName: string;
  commonName: string;
  heightMeasurementMethod: number;
  entspts: number | null;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
  diameter: number;
  diameterInputFormat: number;
  conicalVolume: number;
  conicalVolumeInputFormat: number;
  generalComments: string;
  measurers: { firstName: string; lastName: string }[];
  photoCount: number;
}

export interface TreeDetailsRow extends TdiInputsRaw {
  id: number;
  siteId: number;
  siteName: string;
  county: string;
  ownershipType: string;
  stateId: number;
  stateName: string;
  countryDoubleLetterCode: string;
  countryTripleLetterCode: string;
  scientificName: string;
  commonName: string;
  heightMeasurementMethod: number;
  entspts: number | null;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
  diameter: number;
  diameterInputFormat: number;
  conicalVolume: number;
  conicalVolumeInputFormat: number;
  generalComments: string;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  calculatedLatitude: number;
  calculatedLatitudeInputFormat: number;
  calculatedLongitude: number;
  calculatedLongitudeInputFormat: number;
  measurements: TreeMeasurementRow[];
}

interface RawTreeRow {
  id: number;
  site_id: number;
  site_name: string;
  county: string;
  ownership_type: string;
  state_id: number;
  state_name: string;
  country_double: string;
  country_triple: string;
  scientific_name: string;
  common_name: string;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  entspts: number | null;
  entspts2: number | null;
  champion_points: number | null;
  abbreviated_champion_points: number | null;
  diameter: number;
  diameter_input_format: number;
  conical_volume: number;
  conical_volume_input_format: number;
  general_comments: string;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  calculated_latitude: number;
  calculated_latitude_input_format: number;
  calculated_longitude: number;
  calculated_longitude_input_format: number;
  max_height: number;
  max_girth: number;
  max_crown_spread: number;
}

interface RawMeasurementRow {
  id: number;
  measured: string;
  scientific_name: string;
  common_name: string;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  entspts: number | null;
  entspts2: number | null;
  champion_points: number | null;
  abbreviated_champion_points: number | null;
  diameter: number;
  diameter_input_format: number;
  conical_volume: number;
  conical_volume_input_format: number;
  general_comments: string;
  max_height: number;
  max_girth: number;
  max_crown_spread: number;
  photo_count: number;
  measurers: { firstName: string; lastName: string }[] | null;
}

/** `real` columns come back from postgres.js text-parsed as float64; `fround` narrows to the true float32 (see export-trees.sql.ts's header for the tree 2299 worked example). */
function froundOrNull(v: number | null): number | null {
  return v === null ? null : fround(v);
}

export async function treeDetails(id: number, sql: SqlTag = defaultSql()): Promise<TreeDetailsRow | null> {
  // Perf audit 2026-07: same shape as siteDetails below -- the tree row and
  // its measurement rows are independent, so pipeline them together
  // (≈1 round trip instead of 2 sequential ones).
  const rowsPromise = sql<RawTreeRow>`
    with global_species as (
      select scientific_name, common_name,
        max(height) as max_height, max(girth) as max_girth, max(crown_spread) as max_crown_spread
      from trees
      group by scientific_name, common_name
    )
    select
      t.id, t.site_id,
      s.name as site_name, s.county, s.ownership_type,
      st.id as state_id, st.name as state_name,
      c.double_letter_code as country_double, c.triple_letter_code as country_triple,
      t.scientific_name, t.common_name,
      t.height, t.height_input_format, t.height_measurement_method,
      t.girth, t.girth_input_format,
      t.crown_spread, t.crown_spread_input_format,
      t.entspts, t.entspts2, t.champion_points, t.abbreviated_champion_points,
      t.diameter, t.diameter_input_format,
      t.conical_volume, t.conical_volume_input_format,
      coalesce(lm.general_comments, '') as general_comments,
      t.latitude, t.latitude_input_format, t.longitude, t.longitude_input_format,
      t.calculated_latitude, t.calculated_latitude_input_format,
      t.calculated_longitude, t.calculated_longitude_input_format,
      gs.max_height, gs.max_girth, gs.max_crown_spread
    from trees t
    join sites s on s.id = t.site_id
    join states st on st.id = s.state_id
    join countries c on c.id = st.country_id
    join global_species gs on gs.scientific_name = t.scientific_name and gs.common_name = t.common_name
    left join lateral (
      select tm.general_comments
      from tree_measurements tm
      where tm.tree_id = t.id
      order by tm.measured desc, tm.id desc
      limit 1
    ) lm on true
    where t.id = ${id}
  `;
  const measurementRowsPromise = sql<RawMeasurementRow>`
    with global_species as (
      select scientific_name, common_name,
        max(height) as max_height, max(girth) as max_girth, max(crown_spread) as max_crown_spread
      from trees
      group by scientific_name, common_name
    )
    select
      tm.id, tm.measured::text as measured, tm.scientific_name, tm.common_name,
      tm.height, tm.height_input_format, tm.height_measurement_method,
      tm.girth, tm.girth_input_format,
      tm.crown_spread, tm.crown_spread_input_format,
      tm.entspts, tm.entspts2, tm.champion_points, tm.abbreviated_champion_points,
      tm.diameter, tm.diameter_input_format,
      tm.conical_volume, tm.conical_volume_input_format,
      tm.general_comments,
      gs.max_height, gs.max_girth, gs.max_crown_spread,
      (select count(*)::int from photo_references pr where pr.type = 7 and pr.tree_measurement_id = tm.id) as photo_count,
      (
        select coalesce(
          json_agg(json_build_object('firstName', mm.first_name, 'lastName', mm.last_name) order by mm.id),
          '[]'::json
        )
        from tree_measurers mm
        where mm.measurement_id = tm.id
      ) as measurers
    from tree_measurements tm
    left join global_species gs on gs.scientific_name = tm.scientific_name and gs.common_name = tm.common_name
    where tm.tree_id = ${id}
    order by tm.measured desc, tm.id asc
  `;
  const [rows, measurementRows] = await Promise.all([rowsPromise, measurementRowsPromise]);
  const r = rows[0];
  if (!r) return null;

  const measurements: TreeMeasurementRow[] = measurementRows.map((m) => ({
    id: m.id,
    measured: m.measured,
    scientificName: m.scientific_name,
    commonName: m.common_name,
    height: fround(m.height),
    heightInputFormat: m.height_input_format,
    heightMeasurementMethod: m.height_measurement_method,
    girth: fround(m.girth),
    girthInputFormat: m.girth_input_format,
    crownSpread: fround(m.crown_spread),
    crownSpreadInputFormat: m.crown_spread_input_format,
    entspts: froundOrNull(m.entspts),
    entspts2: froundOrNull(m.entspts2),
    championPoints: froundOrNull(m.champion_points),
    abbreviatedChampionPoints: froundOrNull(m.abbreviated_champion_points),
    diameter: fround(m.diameter),
    diameterInputFormat: m.diameter_input_format,
    conicalVolume: fround(m.conical_volume),
    conicalVolumeInputFormat: m.conical_volume_input_format,
    generalComments: m.general_comments,
    maxHeight: fround(m.max_height ?? 0),
    maxGirth: fround(m.max_girth ?? 0),
    maxCrownSpread: fround(m.max_crown_spread ?? 0),
    measurers: m.measurers ?? [],
    photoCount: m.photo_count,
  }));

  return {
    id: r.id,
    siteId: r.site_id,
    siteName: r.site_name,
    county: r.county,
    ownershipType: r.ownership_type,
    stateId: r.state_id,
    stateName: r.state_name,
    countryDoubleLetterCode: r.country_double,
    countryTripleLetterCode: r.country_triple,
    scientificName: r.scientific_name,
    commonName: r.common_name,
    height: fround(r.height),
    heightInputFormat: r.height_input_format,
    heightMeasurementMethod: r.height_measurement_method,
    girth: fround(r.girth),
    girthInputFormat: r.girth_input_format,
    crownSpread: fround(r.crown_spread),
    crownSpreadInputFormat: r.crown_spread_input_format,
    entspts: froundOrNull(r.entspts),
    entspts2: froundOrNull(r.entspts2),
    championPoints: froundOrNull(r.champion_points),
    abbreviatedChampionPoints: froundOrNull(r.abbreviated_champion_points),
    diameter: fround(r.diameter),
    diameterInputFormat: r.diameter_input_format,
    conicalVolume: fround(r.conical_volume),
    conicalVolumeInputFormat: r.conical_volume_input_format,
    generalComments: r.general_comments,
    latitude: fround(r.latitude),
    latitudeInputFormat: r.latitude_input_format,
    longitude: fround(r.longitude),
    longitudeInputFormat: r.longitude_input_format,
    calculatedLatitude: fround(r.calculated_latitude),
    calculatedLatitudeInputFormat: r.calculated_latitude_input_format,
    calculatedLongitude: fround(r.calculated_longitude),
    calculatedLongitudeInputFormat: r.calculated_longitude_input_format,
    maxHeight: fround(r.max_height),
    maxGirth: fround(r.max_girth),
    maxCrownSpread: fround(r.max_crown_spread),
    measurements,
  };
}

// ---------------------------------------------------------------------------
// Site details
// ---------------------------------------------------------------------------

export interface SiteVisitRow {
  id: number;
  visited: string;
  comments: string;
  tripReportUrl: string;
  visitors: { firstName: string; lastName: string }[];
  photoCount: number;
}

export interface SiteDetailsRow {
  id: number;
  name: string;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  stateId: number;
  stateName: string;
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
  lastVisitComments: string;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  calculatedLatitude: number;
  calculatedLatitudeInputFormat: number;
  calculatedLongitude: number;
  calculatedLongitudeInputFormat: number;
  visits: SiteVisitRow[];
}

interface RawSiteRow {
  id: number;
  name: string;
  county: string;
  ownership_type: string;
  ownership_contact_info: string;
  make_ownership_contact_info_public: boolean;
  state_id: number;
  state_name: string;
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
  last_visit_comments: string;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  calculated_latitude: number;
  calculated_latitude_input_format: number;
  calculated_longitude: number;
  calculated_longitude_input_format: number;
}

interface RawVisitRow {
  id: number;
  visited: string;
  comments: string;
  trip_report_url: string;
  visitors: { firstName: string; lastName: string }[] | null;
  photo_count: number;
}

export interface SiteSpeciesGridParams {
  page?: number;
  sort?: string;
  sortAscending?: boolean;
}

export interface SiteSpeciesGridResult {
  rows: MeasuredSpeciesBySiteRow[];
  pageIndex: number;
  totalCount: number;
}

/**
 * `BrowseController.SiteDetails`'s column switch (`BrowseController.cs:60-67`):
 * case-sensitive exact match against these 5 literal strings; anything else
 * (including a differently-cased match, or absent/blank) leaves the list in
 * its query-natural order (`SortInMemory`'s `IsNullOrWhiteSpace(column)`
 * short-circuit -- unmatched non-blank strings hit `SortAndPageInMemory`'s
 * `customRendererFinder` which `throw new NotImplementedException()`, but
 * `EntityGridModel`/`DataTablesGrid` only ever generate a `sort` value from
 * one of a column's own known ids, so an arbitrary unmatched string can only
 * arrive via a hand-edited URL -- treating it as "unsorted" rather than
 * throwing is this port's deliberate, documented choice, matching the
 * spirit of every other query in this codebase that degrades gracefully on
 * out-of-domain input).
 */
const SITE_SPECIES_SORT_KEYS: Record<string, (r: MeasuredSpeciesBySiteRow) => string | number> = {
  BotanicalName: (r) => r.scientificName,
  CommonName: (r) => r.commonName,
  MaxHeight: (r) => r.maxHeight,
  MaxGirth: (r) => r.maxGirth,
  MaxCrownSpread: (r) => r.maxCrownSpread,
};

/**
 * `SortInMemory` (`DataTablesGrid.cs:530-544`): `OrderBy(customRenderer)`
 * (stable) then `.Reverse()` iff `sortAscending` is literally `false` --
 * `true` OR absent/`null` both keep ascending order. String comparisons use
 * `localeCompare` here (JS has no direct equivalent of .NET's
 * culture-aware `Comparer<object>.Default`); for the small (site-scoped,
 * typically single-digit-to-low-tens rows) species lists this grid ever
 * shows, this is not expected to visibly diverge -- flagged as a residual
 * risk akin to `export-trees.sql.ts`'s documented collation caveat, not
 * verified byte-for-byte against every possible tie order.
 */
/**
 * When `sort` doesn't match a known column (including absent -- the "no
 * sort" case), `SortInMemory` leaves the repository's OWN row order
 * untouched. That order is not itself alphabetical by contract -- it's
 * whatever `Trees.MeasuredSpeciesBySite`'s underlying SQL Server query
 * happens to return -- but empirically (verified against the doc 07 §5.4
 * production snapshot corpus) it IS locale-aware alphabetical by
 * scientific name, INCLUDING SQL Server/.NET's collation treatment of
 * symbol characters as low-weight/near-ignorable: e.g. "Acer ×freemanii"
 * (U+00D7 MULTIPLICATION SIGN) sorts as if it were "Acer freemanii" --
 * BEFORE "Acer nigrum"/"Acer rubrum"/"Acer saccharum", not after (plain
 * byte/codepoint order, which `measuredSpeciesBySite`'s own Postgres
 * `order by scientific_name` uses, puts '×' > every ASCII letter, sorting
 * it LAST instead). Verified corpus sites 722/948/1019/39052/39618/39829/
 * 40114/40120/40134/40455/41884/42142/42342 (every hybrid-species site in
 * the corpus) all confirm this ordering. Node's ICU-backed
 * `String.localeCompare` reproduces it exactly (`"Acer ×freemanii".
 * localeCompare("Acer nigrum") < 0`), so this port re-sorts by
 * (scientificName, commonName) via `localeCompare` for the "no sort"
 * default INSTEAD OF trusting `measuredSpeciesBySite`'s own plain-collation
 * `ORDER BY` -- confined to this function (not a change to
 * `measured-species.sql.ts`, out of this task's file ownership; that
 * function's own `ORDER BY` remains correct/unchanged for its OTHER
 * callers, e.g. exports).
 */
function sortSiteSpecies(rows: MeasuredSpeciesBySiteRow[], sort: string | undefined, sortAscending: boolean | undefined) {
  const keyFn = (sort && SITE_SPECIES_SORT_KEYS[sort]) || SITE_SPECIES_SORT_KEYS.BotanicalName!;
  const sorted = [...rows].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (typeof ka === "number" && typeof kb === "number") return ka - kb;
    return String(ka).localeCompare(String(kb));
  });
  if (sort && SITE_SPECIES_SORT_KEYS[sort] && sortAscending === false) sorted.reverse();
  return sorted;
}

export async function siteSpeciesGrid(
  siteId: number,
  params: SiteSpeciesGridParams,
  sql: SqlTag = defaultSql(),
): Promise<SiteSpeciesGridResult> {
  const all = await measuredSpeciesBySite(siteId, sql);
  const sorted = sortSiteSpecies(all, params.sort, params.sortAscending);
  const pageIndex = resolveBrowsePageIndex(params.page);
  const start = pageIndex * SITE_SPECIES_GRID_PAGE_SIZE;
  return {
    rows: sorted.slice(start, start + SITE_SPECIES_GRID_PAGE_SIZE),
    pageIndex,
    totalCount: all.length,
  };
}

export async function siteDetails(id: number, sql: SqlTag = defaultSql()): Promise<SiteDetailsRow | null> {
  // Perf audit 2026-07: the site row and its visit rows are independent
  // queries (the second only filters on the same `id`), so fire them
  // together -- postgres.js pipelines both over the single connection,
  // ≈1 network round trip instead of 2. The visitRows work is discarded
  // when the site doesn't exist; an indexed miss is negligible next to the
  // saved round trip on every real page load.
  const rowsPromise = sql<RawSiteRow>`
    select
      s.id, s.name, s.county, s.ownership_type, s.ownership_contact_info, s.make_ownership_contact_info_public,
      st.id as state_id, st.name as state_name,
      c.double_letter_code as country_double, c.triple_letter_code as country_triple,
      s.computed_rhi5, s.computed_rhi10, s.computed_rhi20,
      s.computed_rgi5, s.computed_rgi10, s.computed_rgi20,
      s.computed_trees_measured_count,
      s.computed_last_measurement_date::text as computed_last_measurement_date,
      coalesce(lv.comments, '') as last_visit_comments,
      s.latitude, s.latitude_input_format, s.longitude, s.longitude_input_format,
      s.calculated_latitude, s.calculated_latitude_input_format,
      s.calculated_longitude, s.calculated_longitude_input_format
    from sites s
    join states st on st.id = s.state_id
    join countries c on c.id = st.country_id
    left join lateral (
      select sv.comments
      from site_visits sv
      where sv.site_id = s.id
      order by sv.visited desc, sv.id desc
      limit 1
    ) lv on true
    where s.id = ${id}
  `;
  const visitRowsPromise = sql<RawVisitRow>`
    select
      sv.id, sv.visited::text as visited, sv.comments, sv.trip_report_url,
      (
        select coalesce(
          json_agg(json_build_object('firstName', v.first_name, 'lastName', v.last_name) order by v.id),
          '[]'::json
        )
        from site_visitors v
        where v.site_visit_id = sv.id
      ) as visitors,
      (select count(*)::int from photo_references pr where pr.type = 5 and pr.site_visit_id = sv.id) as photo_count
    from site_visits sv
    where sv.site_id = ${id}
    order by sv.visited desc, sv.id asc
  `;
  const [rows, visitRows] = await Promise.all([rowsPromise, visitRowsPromise]);
  const r = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    name: r.name,
    county: r.county,
    ownershipType: r.ownership_type,
    ownershipContactInfo: r.ownership_contact_info,
    makeOwnershipContactInfoPublic: r.make_ownership_contact_info_public,
    stateId: r.state_id,
    stateName: r.state_name,
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
    lastVisitComments: r.last_visit_comments,
    latitude: fround(r.latitude),
    latitudeInputFormat: r.latitude_input_format,
    longitude: fround(r.longitude),
    longitudeInputFormat: r.longitude_input_format,
    calculatedLatitude: fround(r.calculated_latitude),
    calculatedLatitudeInputFormat: r.calculated_latitude_input_format,
    calculatedLongitude: fround(r.calculated_longitude),
    calculatedLongitudeInputFormat: r.calculated_longitude_input_format,
    visits: visitRows.map((v) => ({
      id: v.id,
      visited: v.visited,
      comments: v.comments,
      tripReportUrl: v.trip_report_url,
      visitors: v.visitors ?? [],
      photoCount: v.photo_count,
    })),
  };
}
