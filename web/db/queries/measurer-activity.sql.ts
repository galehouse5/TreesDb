/**
 * Port of dbo.MeasurerActivity (CreateObjectsAndTypes.sql:284-300) -- task
 * P0-05, doc 02 §P0-05, doc 01 §4.
 *
 * Legacy SQL, transcribed:
 *   select ... from Trees.Measurers m
 *   join Trees.Trees t on t.Id = m.TreeId
 *   group by m.LastName, m.FirstName
 *
 * Finding not called out in doc 01's summary ("group Trees.Measurers joined
 * via trees by (LastName, FirstName): distinct trees, distinct sites,
 * max(LastMeasured)"): the join is an INNER JOIN on `m.TreeId`, not a join
 * through `m.MeasurementId`. `Trees.Measurers` (this port's
 * `tree_measurers`) is a composite-element bag with a nullable `TreeId` AND
 * a nullable `MeasurementId` (schema.ts: both columns are plain nullable
 * FKs, "no entity identity" per doc 01 §2) -- a measurer row can be
 * attached to a tree directly, OR to one specific measurement of that tree,
 * never necessarily both. Because the join is `ON t.Id = m.TreeId`, any
 * measurer row whose `TreeId` is NULL (i.e. one recorded only against a
 * particular `Trees.Measurements` row via `MeasurementId`) is silently
 * excluded from this view -- such a person's activity is undercounted by
 * this object. This is legacy behavior, preserved verbatim (not a bug this
 * port should "fix").
 */
import { type SqlTag, defaultSql } from "./sql-tag";

export interface MeasurerActivityRow {
  lastName: string;
  firstName: string;
  treesMeasuredCount: number;
  sitesVisitedCount: number;
  lastMeasurementDate: string;
}

interface RawRow {
  last_name: string;
  first_name: string;
  trees_measured_count: number;
  sites_visited_count: number;
  last_measurement_date: string;
}

/** Port of `dbo.MeasurerActivity` (CreateObjectsAndTypes.sql:284-300). */
export async function measurerActivity(
  sql: SqlTag = defaultSql(),
): Promise<MeasurerActivityRow[]> {
  const rows = await sql<RawRow>`
    select
      m.last_name,
      m.first_name,
      count(distinct m.tree_id)::int as trees_measured_count,
      count(distinct t.site_id)::int as sites_visited_count,
      -- Explicit ::text cast: keeps the wire type a deterministic
      -- 'YYYY-MM-DD' string on both the real postgres.js client and the
      -- PGlite test shim, rather than relying on each driver's own "date"
      -- type parsing (which can construct JS Date objects using different,
      -- and in node-postgres's case host-timezone-dependent, conventions).
      max(t.last_measured)::text as last_measurement_date
    from tree_measurers m
    join trees t on t.id = m.tree_id
    group by m.last_name, m.first_name
    order by m.last_name, m.first_name
  `;
  return rows.map((r) => ({
    lastName: r.last_name,
    firstName: r.first_name,
    treesMeasuredCount: r.trees_measured_count,
    sitesVisitedCount: r.sites_visited_count,
    lastMeasurementDate: r.last_measurement_date,
  }));
}
