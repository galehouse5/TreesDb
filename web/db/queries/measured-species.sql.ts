/**
 * Port of Trees.MeasuredSpecies / MeasuredSpeciesBySite / MeasuredSpeciesByState
 * (Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql:28-274) -- task P0-05,
 * doc 02 §P0-05, doc 01 §4.
 *
 * Legacy shape (identical for all three, transcribed from the SQL, not just
 * doc 01's summary): group Trees.Trees by (ScientificName, CommonName)
 * [+ SiteId, resp. Sites.Sites.StateId via a join for the scoped variants].
 * Per group:
 *   - MaxHeight/MaxGirth/MaxCrownSpread = MAX(column). The trees table's
 *     Height/Girth/CrownSpread columns are NOT NULL in both legacy
 *     (baseline DDL) and this port's schema.ts (`real("height").notNull()`
 *     etc.), so MAX() never has to skip NULLs here -- there is no
 *     "how does NULL participate" case to replicate for this table.
 *   - Max*InputFormat = Invalid (0) when the max equals 0, else Default (2)
 *     -- literal `DistanceFormat` encodings, doc 01 §3.
 *   - Max*TreeId = legacy `SELECT TOP 1 Id ... WHERE <col> = <max>` (no
 *     ORDER BY) -- ties broken by physical/index order, which SQL Server
 *     does not guarantee and we cannot reproduce. Waiver W-001: this port
 *     uses `MIN(id)` among the tied trees (lowest id) instead, and is NULL
 *     when the max is 0 (matching the legacy CASE, which returns NULL in
 *     that branch instead of running the TOP 1 subquery at all).
 *   - Number = COUNT(*) of trees in the group.
 *
 * Species identity hash (the legacy view's `Id` column, an MD5-XOR of the
 * grouping keys) is intentionally NOT reproduced here -- D-003: the new app
 * keys species by the natural (ScientificName, CommonName) pair and does
 * not expose the hash. The hash itself is ported separately for ETL/parity
 * use in species-hash.sql.ts.
 */
import { type SqlTag, defaultSql } from "./sql-tag";

export interface MeasuredSpeciesRow {
  scientificName: string;
  commonName: string;
  maxHeight: number;
  maxHeightInputFormat: number;
  maxHeightTreeId: number | null;
  maxGirth: number;
  maxGirthInputFormat: number;
  maxGirthTreeId: number | null;
  maxCrownSpread: number;
  maxCrownSpreadInputFormat: number;
  maxCrownSpreadTreeId: number | null;
  number: number;
}

export interface MeasuredSpeciesBySiteRow extends MeasuredSpeciesRow {
  siteId: number;
}

export interface MeasuredSpeciesByStateRow extends MeasuredSpeciesRow {
  stateId: number;
}

interface RawRow {
  scientific_name: string;
  common_name: string;
  max_height: number;
  max_height_input_format: number;
  max_height_tree_id: number | null;
  max_girth: number;
  max_girth_input_format: number;
  max_girth_tree_id: number | null;
  max_crown_spread: number;
  max_crown_spread_input_format: number;
  max_crown_spread_tree_id: number | null;
  number: number;
}

function mapRow(r: RawRow): MeasuredSpeciesRow {
  return {
    scientificName: r.scientific_name,
    commonName: r.common_name,
    maxHeight: r.max_height,
    maxHeightInputFormat: r.max_height_input_format,
    maxHeightTreeId: r.max_height_tree_id,
    maxGirth: r.max_girth,
    maxGirthInputFormat: r.max_girth_input_format,
    maxGirthTreeId: r.max_girth_tree_id,
    maxCrownSpread: r.max_crown_spread,
    maxCrownSpreadInputFormat: r.max_crown_spread_input_format,
    maxCrownSpreadTreeId: r.max_crown_spread_tree_id,
    number: r.number,
  };
}

/** Port of `Trees.MeasuredSpecies` (CreateObjectsAndTypes.sql:28-96). */
export async function measuredSpecies(
  sql: SqlTag = defaultSql(),
): Promise<MeasuredSpeciesRow[]> {
  const rows = await sql<RawRow>`
    with grouped as (
      select
        scientific_name,
        common_name,
        max(height) as max_height,
        max(girth) as max_girth,
        max(crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees
      group by scientific_name, common_name
    )
    select
      g.scientific_name,
      g.common_name,
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
    order by g.scientific_name, g.common_name
  `;
  return rows.map(mapRow);
}

/**
 * Port of `Trees.MeasuredSpeciesBySite` (CreateObjectsAndTypes.sql:106-181).
 * `siteId` is an addition (not present on the legacy view, which always
 * returns every site's rows) restricting the grouping to one site.
 */
export async function measuredSpeciesBySite(
  siteId?: number,
  sql: SqlTag = defaultSql(),
): Promise<MeasuredSpeciesBySiteRow[]> {
  const rows = await sql<RawRow & { site_id: number }>`
    with grouped as (
      select
        scientific_name,
        common_name,
        site_id,
        max(height) as max_height,
        max(girth) as max_girth,
        max(crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees
      where (${siteId ?? null}::int is null or site_id = ${siteId ?? null})
      group by scientific_name, common_name, site_id
    )
    select
      g.site_id,
      g.scientific_name,
      g.common_name,
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.site_id = g.site_id
          and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.site_id = g.site_id
          and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and t2.site_id = g.site_id
          and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
    order by g.site_id, g.scientific_name, g.common_name
  `;
  return rows.map((r) => ({ ...mapRow(r), siteId: r.site_id }));
}

/**
 * Port of `Trees.MeasuredSpeciesByState` (CreateObjectsAndTypes.sql:191-274).
 * `stateId` is an addition, as with `measuredSpeciesBySite`.
 */
export async function measuredSpeciesByState(
  stateId?: number,
  sql: SqlTag = defaultSql(),
): Promise<MeasuredSpeciesByStateRow[]> {
  const rows = await sql<RawRow & { state_id: number }>`
    with grouped as (
      select
        t.scientific_name,
        t.common_name,
        s.state_id,
        max(t.height) as max_height,
        max(t.girth) as max_girth,
        max(t.crown_spread) as max_crown_spread,
        count(*)::int as number
      from trees t
      join sites s on s.id = t.site_id
      where (${stateId ?? null}::int is null or s.state_id = ${stateId ?? null})
      group by t.scientific_name, t.common_name, s.state_id
    )
    select
      g.state_id,
      g.scientific_name,
      g.common_name,
      g.max_height,
      case when g.max_height = 0 then 0 else 2 end as max_height_input_format,
      case when g.max_height = 0 then null else (
        select min(t2.id) from trees t2
        join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and s2.state_id = g.state_id
          and t2.height = g.max_height
      ) end as max_height_tree_id,
      g.max_girth,
      case when g.max_girth = 0 then 0 else 2 end as max_girth_input_format,
      case when g.max_girth = 0 then null else (
        select min(t2.id) from trees t2
        join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and s2.state_id = g.state_id
          and t2.girth = g.max_girth
      ) end as max_girth_tree_id,
      g.max_crown_spread,
      case when g.max_crown_spread = 0 then 0 else 2 end as max_crown_spread_input_format,
      case when g.max_crown_spread = 0 then null else (
        select min(t2.id) from trees t2
        join sites s2 on s2.id = t2.site_id
        where t2.scientific_name = g.scientific_name
          and t2.common_name = g.common_name
          and s2.state_id = g.state_id
          and t2.crown_spread = g.max_crown_spread
      ) end as max_crown_spread_tree_id,
      g.number
    from grouped g
    order by g.state_id, g.scientific_name, g.common_name
  `;
  return rows.map((r) => ({ ...mapRow(r), stateId: r.state_id }));
}
