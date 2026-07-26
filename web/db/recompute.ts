/**
 * Port of dbo.UpdateStaleMetrics + the two staleness triggers
 * (Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql:604-685) -- task P0-05,
 * doc 02 §P0-05, doc 01 §4, D-004.
 *
 * Legacy, transcribed:
 *   - `dbo.UpdateStaleMetrics` (L604-641): for every `Sites.Sites` row with
 *     `AreMetricsStale = 1`, copy the matching `dbo.SiteMetrics` row's
 *     RHI5/10/20, RGI5/10/20, TreesMeasuredCount, LastMeasurementDate,
 *     ContainsEntityWithCoordinates into the `Computed*` columns, clear the
 *     flag, and stamp `LastMetricsUpdateTimestamp = getdate()`. Then the
 *     identical shape for `Locations.States` / `dbo.StateMetrics`. Both
 *     statements run every time the proc is called (app start, lazily by
 *     the repository) -- rows that aren't stale are left untouched.
 *   - `Trees.FlagStaleMetrics_Trees` (L651-663): AFTER INSERT/UPDATE/DELETE
 *     on `Trees.Trees`, flags `Sites.Sites.AreMetricsStale = 1` for every
 *     site id appearing in either `inserted.SiteId` or `deleted.SiteId`
 *     (covers insert, delete, AND update -- including a tree moving between
 *     sites, since both the old and new site ids appear across
 *     inserted/deleted).
 *   - `Sites.FlagStaleMetrics_Sites` (L673-685): same shape, flags
 *     `Locations.States.AreMetricsStale = 1` from `Sites.Sites`
 *     insert/update/delete's `StateId`.
 *
 * D-004: no Postgres triggers -- the same semantics are implemented as
 * plain functions the app calls explicitly after any tree/site mutation
 * (`markSiteStaleForTree`/`markStatesStaleForSite`), plus
 * `recomputeStaleMetrics()` as the on-demand/post-commit recompute step,
 * mirroring `UpdateStaleMetrics` exactly (reusing db/queries/metrics.sql.ts,
 * which is this same task's port of `SiteMetrics`/`StateMetrics`).
 */
import {
  type SiteMetricsRow,
  type StateMetricsRow,
  siteMetrics,
  stateMetrics,
} from "./queries/metrics.sql";
import { type SqlTag, defaultSql, withTransaction } from "./queries/sql-tag";

export interface RecomputeResult {
  sitesUpdated: number;
  statesUpdated: number;
}

async function applySiteMetrics(
  sql: SqlTag,
  id: number,
  m: SiteMetricsRow,
): Promise<void> {
  await sql`
    update sites set
      computed_rhi5 = ${m.rhi5},
      computed_rhi10 = ${m.rhi10},
      computed_rhi20 = ${m.rhi20},
      computed_rgi5 = ${m.rgi5},
      computed_rgi10 = ${m.rgi10},
      computed_rgi20 = ${m.rgi20},
      computed_trees_measured_count = ${m.treesMeasuredCount},
      computed_last_measurement_date = ${m.lastMeasurementDate},
      computed_contains_entity_with_coordinates = ${m.containsEntityWithCoordinates},
      are_metrics_stale = false,
      last_metrics_update_timestamp = now()
    where id = ${id}
  `;
}

async function applyStateMetrics(
  sql: SqlTag,
  id: number,
  m: StateMetricsRow,
): Promise<void> {
  await sql`
    update states set
      computed_rhi5 = ${m.rhi5},
      computed_rhi10 = ${m.rhi10},
      computed_rhi20 = ${m.rhi20},
      computed_rgi5 = ${m.rgi5},
      computed_rgi10 = ${m.rgi10},
      computed_rgi20 = ${m.rgi20},
      computed_trees_measured_count = ${m.treesMeasuredCount},
      computed_last_measurement_date = ${m.lastMeasurementDate},
      computed_contains_entity_with_coordinates = ${m.containsEntityWithCoordinates},
      are_metrics_stale = false,
      last_metrics_update_timestamp = now()
    where id = ${id}
  `;
}

/**
 * Port of `dbo.UpdateStaleMetrics`. Runs in a single transaction (real
 * postgres.js client only -- see sql-tag.ts's `withTransaction`; the PGlite
 * test shim has no `.begin`, so tests run it untransacted, which is
 * immaterial for PGlite's single-instance, no-concurrent-writer model).
 */
export async function recomputeStaleMetrics(
  sql: SqlTag = defaultSql(),
): Promise<RecomputeResult> {
  return withTransaction(sql, async (trx) => {
    // Metrics are computed per stale id, not via one global aggregate pass:
    // siteMetrics/stateMetrics accept an id scope, stale sets are tiny
    // (an import touches 1-3 sites), and the global form made every
    // finishTrip/reimportTrip pay a full-table aggregate (~9s on
    // production data -- measured by the replay harness, 1,694 trips).
    // Same values either way; dbo.UpdateStaleMetrics also only refreshed
    // stale rows.
    const staleSiteIds = (
      await trx<{ id: number }>`select id from sites where are_metrics_stale = true`
    ).map((r) => r.id);
    let sitesUpdated = 0;
    for (const id of staleSiteIds) {
      const [m] = await siteMetrics(id, trx);
      if (!m) continue;
      await applySiteMetrics(trx, id, m);
      sitesUpdated++;
    }

    const staleStateIds = (
      await trx<{ id: number }>`select id from states where are_metrics_stale = true`
    ).map((r) => r.id);
    let statesUpdated = 0;
    for (const id of staleStateIds) {
      const [m] = await stateMetrics(id, trx);
      if (!m) continue;
      await applyStateMetrics(trx, id, m);
      statesUpdated++;
    }

    return { sitesUpdated, statesUpdated };
  });
}

/**
 * Port of `Trees.FlagStaleMetrics_Trees`: flags the given site id(s) as
 * stale. Callers pass the tree's site id after insert/delete, and BOTH the
 * old and new site id after an update that changes `SiteId` (replicating
 * the trigger's `inserted.SiteId OR deleted.SiteId` union).
 */
export async function markSiteStaleForTree(
  siteIds: number | number[],
  sql: SqlTag = defaultSql(),
): Promise<void> {
  const ids = [
    ...new Set(Array.isArray(siteIds) ? siteIds : [siteIds]),
  ].filter((id): id is number => id != null);
  for (const id of ids) {
    await sql`update sites set are_metrics_stale = true where id = ${id}`;
  }
}

/**
 * Port of `Sites.FlagStaleMetrics_Sites`: flags the given state id(s) as
 * stale, analogous to `markSiteStaleForTree`.
 */
export async function markStatesStaleForSite(
  stateIds: number | number[],
  sql: SqlTag = defaultSql(),
): Promise<void> {
  const ids = [
    ...new Set(Array.isArray(stateIds) ? stateIds : [stateIds]),
  ].filter((id): id is number => id != null);
  for (const id of ids) {
    await sql`update states set are_metrics_stale = true where id = ${id}`;
  }
}
