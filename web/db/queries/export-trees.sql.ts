/**
 * Port of `IExportRepository.GetTrees` / `ExportRepository.GetTrees`
 * (TMD.Model/Exports/IExportRepository.cs, TMD.Infrastructure/Repositories/
 * ExportRepository.cs) -- task P1-11, doc 03 P1-11, doc 01 §8.
 *
 * One row per tree, joined to its site/state and (for two fields only) its
 * last measurement / the site's last visit -- see the field-by-field
 * provenance comments on `ExportTreeRow` in `lib/export/tree-csv.ts`, which
 * this function's output is shaped to feed directly.
 *
 * --- Predicates (ExportRepository.cs:18-55, transcribed) ------------------
 * `CreateTreeCriteria` (tree-side, lines 18-28):
 *   - `botanicalNameFilter` -> `ScientificName LIKE %val%` (MatchMode.Anywhere)
 *   - `commonNameFilter`    -> `CommonName LIKE %val%`
 *   - `botanicalName`       -> `ScientificName = val` (exact)
 *   - `commonName`          -> `CommonName = val` (exact)
 *   - `treeId`               -> `Tree.Id = val`
 * `CreateSiteCriteria` (site-side, lines 30-41), applied via an `EXISTS`
 * subquery against the tree's site in legacy (`CreateCompositeTreeCriteria`,
 * lines 43-48) -- reproduced here as plain joined-column predicates instead,
 * which is equivalent because a tree has exactly one site:
 *   - `stateFilter` -> `state.Name LIKE %val%`
 *   - `countyFilter` -> `site.County LIKE %val%`
 *   - `stateId`      -> `state.Id = val`
 *   - `siteFilter`   -> `site.Name LIKE %val%`
 *   - `siteId`       -> `site.Id = val`
 * SQL Server `LIKE` is case-insensitive under the default collation (same
 * finding as search.sql.ts/D-010) -> `ilike` here, with `%`/`_` in the
 * filter value left unescaped (matching NHibernate's `Restrictions.Like`,
 * which does not escape either). `Restrictions.Eq` on a string column is
 * likewise case-insensitive under the default collation -> `lower(col) =
 * lower(val)`, not `ilike` (an exact match must not treat `%`/`_` in the
 * value as wildcards).
 *
 * --- Order (ExportRepository.cs:97-104) ------------------------------------
 * `trees.OrderBy(Site.State.Code).ThenBy(Site.County).ThenBy(Site.Name)
 *   .ThenBy(CommonName).ThenBy(ScientificName).ThenBy(Height.Feet)` -- this
 * runs client-side (LINQ-to-Objects) over the fully materialized `Tree[]`,
 * AFTER the NHibernate criteria queries (which carry no `ORDER BY` of their
 * own) return. `State.Code` (State.cs:25-35) is `DoubleLetterCode` unless
 * blank, else `TripleLetterCode` -- reproduced as
 * `coalesce(nullif(trim(double_letter_code), ''), triple_letter_code)`.
 * There is no seventh key, so ties on all six (state code, county, site
 * name, common name, scientific name, height) fall back to whatever order
 * the untyped SQL Server query happened to return -- unspecified, and not
 * reproducible. Per doc 07 §5.1 ("pin the same ORDER BY... if unstable,
 * order by tree id"), `t.id` is appended as a 7th, deterministic-but-not-
 * legacy tie-break.
 *
 * String-key collation: `.ThenBy` runs in .NET's default *culture-aware*
 * string comparer (Windows NLS linguistic sort under whatever culture the
 * app host was configured with), not an ordinal/byte comparison and not a
 * SQL Server collation. Postgres's default 'C' collation is byte-order
 * (case-SENSITIVE, ASCII-before-extended), which measurably disagrees with
 * the legacy order for real production data: verified against the full
 * unfiltered "All trees" export oracle (`Export/SpeciesByFilters__*.csv`,
 * ~31,000 rows, `?filter=a` binds to nothing so it's genuinely unfiltered),
 * plain 'C'-collation ordering on the four string keys mismatched row order
 * at ~262/30091 positions. Two incremental fixes, both applied above:
 *   1. `lower(...)` on all four string keys (case-insensitive, matching the
 *      D-010/search.sql.ts finding that the whole legacy stack is
 *      case-insensitive by default) -- cut mismatches to ~152.
 *   2. `collate "und-x-icu"` (Postgres's ICU root-locale collation, a
 *      linguistic/Unicode-Collation-Algorithm-style comparison closer in
 *      spirit to Windows NLS than byte order) on top of `lower(...)` -- cut
 *      mismatches further to ~56 (~0.19% of rows).
 * The residual ~56 rows are concentrated in non-US location names carrying
 * distinctive Unicode punctuation (e.g. state "Fez-Meknes, Morocco":
 * `"Province D’Ifrane"` (curly apostrophe, U+2019) legacy-sorts BEFORE
 * `"Province D'errachidia"` (straight apostrophe, U+0027) -- which is NOT
 * reproduced by plain alphabetic/case-insensitive comparison (`e` < `I`
 * would put "errachidia" first) NOR by ICU's `und-x-icu` collation (same
 * result as plain lower()) -- only whatever exact Windows-NLS tailoring the
 * legacy host used produces this order, and that is not portably
 * reproducible in Postgres. This is a genuine W-003 candidate (order
 * instability across incompatible collation systems, not a query bug); see
 * the task report for the exact figures and the recommendation to fold it
 * into doc 07's W-003 waiver (sort both sides by tree id in the
 * comparator) rather than chase exact Windows-NLS parity further.
 *
 * --- Measurers (Tree.Measurers, `tree_measurers.tree_id`-scoped rows) -----
 * `tree_measurers` rows split evenly into two disjoint sets in production
 * data: `measurement_id`-scoped (one row per measurer per measurement) and
 * `tree_id`-scoped (nominally the `.Distinct()`-reduced cache
 * `RecalculateProperties` writes to `Tree.Measurers`, Tree.cs:71-74). This
 * function selects the `tree_id`-scoped rows directly, in `id` order, with
 * NO further de-duplication -- verified against the golden "All trees"
 * export oracle (`parity/snapshots/exports/Export/SpeciesByFilters__*.csv`,
 * tree id 58927: `"Turner Sharp, Turner Sharp, Susan Sharp, Dan Cooley"`),
 * which shows the persisted cache is NOT actually duplicate-free in
 * production (stale rows from before some `RecalculateProperties` run,
 * presumably) -- so reproducing it verbatim (not the aspirationally-clean
 * `.Distinct()` C# source) is what byte-parity requires here.
 */
import { type SqlTag, defaultSql } from "./sql-tag";
import type { ExportTreeMeasurer, ExportTreeRow } from "../../lib/export/tree-csv";
import { fround } from "../../lib/units/float32";

export interface ExportTreesFilters {
  /** `Trees.Trees` — exact tree id (`Export/Trees/{id}`). */
  treeId?: number;
  /** exact site id (`Export/Sites/{id}`, `Export/Sites/{id}/Species/...`). */
  siteId?: number;
  /** exact state id (`Export/States/{id}`, `Export/States/{id}/Species/...`). */
  stateId?: number;
  /** exact `scientific_name` match (`Export/Species/{bn} ({cn})`). */
  botanicalName?: string;
  /** exact `common_name` match, paired with `botanicalName`. */
  commonName?: string;
  /** contains-match on `scientific_name` (`Export/SpeciesByFilters`). */
  botanicalNameFilter?: string;
  /** contains-match on `common_name` (`Export/SpeciesByFilters`). */
  commonNameFilter?: string;
  /** contains-match on `states.name` (`Export/LocationsByFilters`). */
  stateFilter?: string;
  /** contains-match on `sites.county` (`Export/LocationsByFilters`). */
  countyFilter?: string;
  /** contains-match on `sites.name` (`Export/LocationsByFilters`). */
  siteFilter?: string;
}

interface RawMeasurer {
  firstName: string;
  lastName: string;
}

interface RawRow {
  id: number;
  common_name: string;
  scientific_name: string;
  state_name: string;
  county: string;
  site_name: string;
  site_comments: string;
  ownership_type: string;
  trip_report_url: string;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  elevation: number;
  elevation_input_format: number;
  measurement_count: number;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  tree_comments: string;
  measured_date: string;
  has_photos: boolean;
  measurers: RawMeasurer[] | null;
}

/** `CoordinatesFormat`/`DistanceFormat`/`ElevationFormat` Unspecified (doc 01 §3). */
const UNSPECIFIED_INPUT_FORMAT = 1;

function mapRow(r: RawRow): ExportTreeRow {
  const measurers: ExportTreeMeasurer[] = (r.measurers ?? []).map((m) => ({
    firstName: m.firstName,
    lastName: m.lastName,
  }));
  return {
    id: r.id,
    commonName: r.common_name,
    scientificName: r.scientific_name,
    stateName: r.state_name,
    county: r.county,
    siteName: r.site_name,
    siteComments: r.site_comments,
    ownershipType: r.ownership_type,
    tripReportUrl: r.trip_report_url,
    // `real` (float4) columns need an explicit `fround` after postgres.js
    // hands them back as JS numbers: postgres.js parses Postgres's printed
    // float4 text with `parseFloat`, which yields the nearest *float64* to
    // that decimal text, not necessarily the exact float64 widening of the
    // original float32 bit pattern (verified empirically against the
    // snapshot oracle: tree 2299's stored longitude prints as "-78.77521",
    // but its true float32 value is -78.77520751953125 -- 3-decimal DDM
    // rounding of the un-frounded parse gives ".513", one off from the
    // legacy-correct ".512"). Every other query in this codebase that reads
    // a `real` column applies the same fix (see lib/units/float32.ts's
    // header comment and its callers in map.sql.ts/metrics.sql.ts).
    latitudeDegrees: fround(r.latitude),
    latitudeSpecified: r.latitude_input_format !== UNSPECIFIED_INPUT_FORMAT,
    longitudeDegrees: fround(r.longitude),
    longitudeSpecified: r.longitude_input_format !== UNSPECIFIED_INPUT_FORMAT,
    elevationFeet: fround(r.elevation),
    elevationSpecified: r.elevation_input_format !== UNSPECIFIED_INPUT_FORMAT,
    measurementCount: r.measurement_count,
    heightFeet: fround(r.height),
    heightSpecified: r.height_input_format !== UNSPECIFIED_INPUT_FORMAT,
    heightMeasurementMethod: r.height_measurement_method,
    girthFeet: fround(r.girth),
    girthSpecified: r.girth_input_format !== UNSPECIFIED_INPUT_FORMAT,
    crownSpreadFeet: fround(r.crown_spread),
    crownSpreadSpecified: r.crown_spread_input_format !== UNSPECIFIED_INPUT_FORMAT,
    treeComments: r.tree_comments,
    measurers,
    measuredDate: r.measured_date,
    hasPhotos: r.has_photos,
  };
}

/**
 * Port of `ExportRepository.GetTrees` -- one row per tree, all filters
 * ANDed together (only the endpoint-appropriate subset is ever populated by
 * a given caller/route, but the query itself is generically composable,
 * matching the legacy repository).
 */
export async function getExportTrees(
  filters: ExportTreesFilters = {},
  sql: SqlTag = defaultSql(),
): Promise<ExportTreeRow[]> {
  const treeId = filters.treeId ?? null;
  const siteId = filters.siteId ?? null;
  const stateId = filters.stateId ?? null;
  const botanicalName = filters.botanicalName ?? null;
  const commonName = filters.commonName ?? null;
  const botanicalNamePattern = filters.botanicalNameFilter ? `%${filters.botanicalNameFilter}%` : null;
  const commonNamePattern = filters.commonNameFilter ? `%${filters.commonNameFilter}%` : null;
  const statePattern = filters.stateFilter ? `%${filters.stateFilter}%` : null;
  const countyPattern = filters.countyFilter ? `%${filters.countyFilter}%` : null;
  const sitePattern = filters.siteFilter ? `%${filters.siteFilter}%` : null;

  const rows = await sql<RawRow>`
    select
      t.id,
      t.common_name,
      t.scientific_name,
      st.name as state_name,
      s.county,
      s.name as site_name,
      coalesce(lv.comments, '') as site_comments,
      s.ownership_type,
      coalesce(lv.trip_report_url, '') as trip_report_url,
      t.latitude,
      t.latitude_input_format,
      t.longitude,
      t.longitude_input_format,
      t.elevation,
      t.elevation_input_format,
      (select count(*)::int from tree_measurements m where m.tree_id = t.id) as measurement_count,
      t.height,
      t.height_input_format,
      t.height_measurement_method,
      t.girth,
      t.girth_input_format,
      t.crown_spread,
      t.crown_spread_input_format,
      coalesce(lm.general_comments, '') as tree_comments,
      t.last_measured::text as measured_date,
      exists (
        select 1 from photo_references pr
        where pr.type = 7 and pr.tree_measurement_id = lm.id
      ) as has_photos,
      (
        select coalesce(
          json_agg(json_build_object('firstName', tm2.first_name, 'lastName', tm2.last_name) order by tm2.id),
          '[]'::json
        )
        from tree_measurers tm2
        where tm2.tree_id = t.id
      ) as measurers
    from trees t
    join sites s on s.id = t.site_id
    join states st on st.id = s.state_id
    left join lateral (
      select sv.comments, sv.trip_report_url
      from site_visits sv
      where sv.site_id = s.id
      order by sv.visited desc, sv.id desc
      limit 1
    ) lv on true
    left join lateral (
      select tm.id, tm.general_comments
      from tree_measurements tm
      where tm.tree_id = t.id
      order by tm.measured desc, tm.id desc
      limit 1
    ) lm on true
    where (${treeId}::int is null or t.id = ${treeId})
      and (${siteId}::int is null or s.id = ${siteId})
      and (${stateId}::int is null or st.id = ${stateId})
      and (${botanicalName}::text is null or lower(t.scientific_name) = lower(${botanicalName}))
      and (${commonName}::text is null or lower(t.common_name) = lower(${commonName}))
      and (${botanicalNamePattern}::text is null or t.scientific_name ilike ${botanicalNamePattern})
      and (${commonNamePattern}::text is null or t.common_name ilike ${commonNamePattern})
      and (${statePattern}::text is null or st.name ilike ${statePattern})
      and (${countyPattern}::text is null or s.county ilike ${countyPattern})
      and (${sitePattern}::text is null or s.name ilike ${sitePattern})
    order by
      coalesce(nullif(trim(st.double_letter_code), ''), st.triple_letter_code),
      lower(s.county) collate "und-x-icu",
      lower(s.name) collate "und-x-icu",
      lower(t.common_name) collate "und-x-icu",
      lower(t.scientific_name) collate "und-x-icu",
      t.height,
      t.id
  `;
  return rows.map(mapRow);
}
