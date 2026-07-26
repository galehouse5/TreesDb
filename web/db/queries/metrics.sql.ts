/**
 * Port of dbo.SiteMetrics / dbo.StateMetrics
 * (Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql:478-594) -- task P0-05,
 * doc 02 §P0-05, doc 01 §4.
 *
 * Legacy shape, transcribed from the SQL:
 *   - A `species` CTE groups trees by (SiteId, ScientificName) ONLY -- NOT
 *     CommonName (confirmed at CreateObjectsAndTypes.sql:553,
 *     `group by SiteId, ScientificName`; StateMetrics likewise at line 493,
 *     `group by StateId, ScientificName`). This differs from
 *     Trees.MeasuredSpecies*, which groups by the (ScientificName,
 *     CommonName) pair -- doc 01 §4's summary elides this distinction, the
 *     SQL is unambiguous. Per group: MaxHeight = max(Height), MaxGirth =
 *     max(Girth).
 *   - RHI_N / RGI_N (N in {5,10,20}) = average of the top-N species maxima
 *     for that site/state, NULL if the site/state has fewer than N species:
 *     `case when count(*) >= N then sum(x)/count(*) else null end` over
 *     `select top N x from species where ... order by x desc` (no secondary
 *     ORDER BY column in the legacy SQL).
 *
 *     Tie-ordering finding: because the TOP-N subquery both orders by AND
 *     selects the *same* column (MaxHeight/MaxGirth), any tie straddling
 *     the Nth-row boundary is a tie in the value being summed. Whichever
 *     physically-tied row SQL Server's unspecified TOP N happens to pick,
 *     its value is identical to the others tied with it, so `sum(x)/count`
 *     is invariant to the tie-break -- the result is deterministic despite
 *     the missing secondary ORDER BY. This port adds `scientific_name` as a
 *     stable secondary sort key purely for plan/test determinism; it cannot
 *     change the computed RHI/RGI value for the reason above.
 *
 *   - TreesMeasuredCount = count(*) of ALL trees at the site/state
 *     (unrelated to the species grouping -- every tree counts, including
 *     duplicate species).
 *   - LastMeasurementDate = max(LastMeasured) over the same tree set.
 *   - ContainsEntityWithCoordinates: for SiteMetrics, `EXISTS (SELECT * FROM
 *     Sites.Sites WHERE Id = s.Id AND LatitudeInputFormat != 1 AND
 *     LongitudeInputFormat != 1)` -- since Id = s.Id matches exactly one
 *     row (the site itself), this collapses to "this site's own
 *     coordinates are specified" (InputFormat != 1 = Unspecified; per doc
 *     01 §3/§7, Invalid (0) counts as specified -- only Unspecified (1) is
 *     excluded). For StateMetrics, the EXISTS is scoped to `StateId = s.Id`
 *     over ALL sites in that state (line 525-530 vs 585-590) -- "does ANY
 *     site in this state have specified coordinates", not just one site.
 *
 * Float type finding (doc 07 float32-compare rule): in T-SQL, `SUM(real)`
 * returns `real` (4-byte), and `real / int` follows real's higher type
 * precedence, so RHI_N/RGI_N are computed in float32 by the legacy view
 * itself -- doc 01 §4's "average of top-N maxima" doesn't state the
 * arithmetic width, but the SQL does. (Separately, `Locations.States`
 * declares its `ComputedRHI5/10/20`/`ComputedRGI5/10/20` STORAGE columns as
 * SQL Server `float` (8-byte) per M003 -- see schema.ts's file-header note
 * 3 -- but that only affects storage after `UpdateStaleMetrics` copies the
 * already-float32 view output into it; the *computation* is float32 either
 * way.) CORRECTION, proven by production-data parity (P0-07): T-SQL
 * `SUM(real)` returns `float` (8-byte) and ACCUMULATES IN DOUBLE, while
 * PostgreSQL's `sum(real)` accumulates in float4 with per-step rounding --
 * the two diverge by 1 ulp on ~2,400 of 9,516 RHI/RGI values over real
 * data. The port therefore sums `x::float8` (double accumulation,
 * matching T-SQL) and rounds once at the end. Also note:
 * `real / bigint` (count(*) is bigint) has no built-in real/bigint
 * operator, so Postgres implicitly promotes to `double precision` for the
 * division. This port computes the division in double precision (the
 * natural Postgres promotion) and applies an explicit `::real` cast on the
 * final RHI/RGI value, which rounds the mathematically-exact quotient to
 * the nearest float32 -- bit-identical to legacy's native float32 division
 * for all realistic magnitudes (tree heights/girths are small enough that
 * float64-then-round-to-float32 and native float32 arithmetic agree; no
 * divergence is expected, but this is the documented reasoning per the
 * task's "cast aggregates back to real... document your finding"
 * instruction).
 *
 * Implementation note: N (5/10/20) is a compile-time literal, never bound
 * as a query parameter, so the six top-N blocks below are written out
 * explicitly per function rather than built by interpolating a JS-string
 * helper into the `sql\`...\`` template -- interpolating a plain string
 * into a tagged-template hole binds it as a VALUE parameter, not raw SQL
 * text (see sql-tag.ts: only flat scalar parameter binding is supported so
 * the same query works against both the real postgres.js client and the
 * PGlite test shim). The repetition mirrors the legacy SQL's own six
 * near-identical `(select case when count(*) >= N ... )` blocks.
 */
import { type SqlTag, defaultSql } from "./sql-tag";

export interface MetricsRow {
  rhi5: number | null;
  rhi10: number | null;
  rhi20: number | null;
  rgi5: number | null;
  rgi10: number | null;
  rgi20: number | null;
  treesMeasuredCount: number;
  lastMeasurementDate: string | null;
  containsEntityWithCoordinates: boolean;
}

export interface SiteMetricsRow extends MetricsRow {
  siteId: number;
}

export interface StateMetricsRow extends MetricsRow {
  stateId: number;
}

interface RawMetricsRow {
  rhi5: number | null;
  rhi10: number | null;
  rhi20: number | null;
  rgi5: number | null;
  rgi10: number | null;
  rgi20: number | null;
  trees_measured_count: number;
  last_measurement_date: string | null;
  contains_entity_with_coordinates: boolean;
}

function mapMetricsRow(r: RawMetricsRow): MetricsRow {
  return {
    rhi5: r.rhi5,
    rhi10: r.rhi10,
    rhi20: r.rhi20,
    rgi5: r.rgi5,
    rgi10: r.rgi10,
    rgi20: r.rgi20,
    treesMeasuredCount: r.trees_measured_count,
    lastMeasurementDate: r.last_measurement_date,
    containsEntityWithCoordinates: r.contains_entity_with_coordinates,
  };
}

/** Port of `dbo.SiteMetrics` (CreateObjectsAndTypes.sql:544-594). */
export async function siteMetrics(
  siteId?: number,
  sql: SqlTag = defaultSql(),
): Promise<SiteMetricsRow[]> {
  const rows = await sql<RawMetricsRow & { site_id: number }>`
    with species as (
      select site_id, scientific_name, max(height) as max_height, max(girth) as max_girth
      from trees
      group by site_id, scientific_name
    )
    select
      s.id as site_id,
      (select case when count(*) >= 5 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where site_id = s.id order by max_height desc, scientific_name limit 5) x) as rhi5,
      (select case when count(*) >= 10 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where site_id = s.id order by max_height desc, scientific_name limit 10) x) as rhi10,
      (select case when count(*) >= 20 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where site_id = s.id order by max_height desc, scientific_name limit 20) x) as rhi20,
      (select case when count(*) >= 5 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where site_id = s.id order by max_girth desc, scientific_name limit 5) x) as rgi5,
      (select case when count(*) >= 10 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where site_id = s.id order by max_girth desc, scientific_name limit 10) x) as rgi10,
      (select case when count(*) >= 20 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where site_id = s.id order by max_girth desc, scientific_name limit 20) x) as rgi20,
      (select count(*)::int from trees where site_id = s.id) as trees_measured_count,
      -- ::text cast: deterministic string across both transports, see
      -- measurer-activity.sql.ts's comment on the same pattern.
      (select max(last_measured)::text from trees where site_id = s.id) as last_measurement_date,
      (s.latitude_input_format <> 1 and s.longitude_input_format <> 1) as contains_entity_with_coordinates
    from sites s
    where (${siteId ?? null}::int is null or s.id = ${siteId ?? null})
    order by s.id
  `;
  return rows.map((r) => ({ ...mapMetricsRow(r), siteId: r.site_id }));
}

/** Port of `dbo.StateMetrics` (CreateObjectsAndTypes.sql:478-534). */
export async function stateMetrics(
  stateId?: number,
  sql: SqlTag = defaultSql(),
): Promise<StateMetricsRow[]> {
  const rows = await sql<RawMetricsRow & { state_id: number }>`
    with trees_in_state as (
      select s.state_id, t.height, t.girth, t.last_measured, t.scientific_name
      from trees t
      join sites s on s.id = t.site_id
    ),
    species as (
      select state_id, scientific_name, max(height) as max_height, max(girth) as max_girth
      from trees_in_state
      group by state_id, scientific_name
    )
    select
      st.id as state_id,
      (select case when count(*) >= 5 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where state_id = st.id order by max_height desc, scientific_name limit 5) x) as rhi5,
      (select case when count(*) >= 10 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where state_id = st.id order by max_height desc, scientific_name limit 10) x) as rhi10,
      (select case when count(*) >= 20 then (sum(x.max_height::float8) / count(*))::real else null end
       from (select max_height from species where state_id = st.id order by max_height desc, scientific_name limit 20) x) as rhi20,
      (select case when count(*) >= 5 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where state_id = st.id order by max_girth desc, scientific_name limit 5) x) as rgi5,
      (select case when count(*) >= 10 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where state_id = st.id order by max_girth desc, scientific_name limit 10) x) as rgi10,
      (select case when count(*) >= 20 then (sum(x.max_girth::float8) / count(*))::real else null end
       from (select max_girth from species where state_id = st.id order by max_girth desc, scientific_name limit 20) x) as rgi20,
      (select count(*)::int from trees_in_state where state_id = st.id) as trees_measured_count,
      (select max(last_measured)::text from trees_in_state where state_id = st.id) as last_measurement_date,
      exists (
        select 1 from sites
        where state_id = st.id
          and latitude_input_format <> 1
          and longitude_input_format <> 1
      ) as contains_entity_with_coordinates
    from states st
    where (${stateId ?? null}::int is null or st.id = ${stateId ?? null})
    order by st.id
  `;
  return rows.map((r) => ({ ...mapMetricsRow(r), stateId: r.state_id }));
}
