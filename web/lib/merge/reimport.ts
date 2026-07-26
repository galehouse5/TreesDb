// Reimport orchestrator -- doc 01 §10 step 5, `ImportRepository.
// InternalReimport` (ImportRepository.cs:59-67): delete this trip's own
// measurements/visits with the legacy orphan-cleanup semantics, then run
// the same merge core again.
//
// Legacy sources (read in full before editing):
//   TMD.Infrastructure/Repositories/ImportRepository.cs:59-67 (InternalReimport)
//   TMD.Model/Imports/ImportRepository.cs:28-37               (Reimport: guard
//     on `t.IsImported`, AssertIsValid, stamp Imported, InternalReimport)
//   TMD.Infrastructure/Repositories/TreeRepository.cs:24-43    (RemoveMeasurementsByTrip)
//   TMD.Infrastructure/Repositories/SiteRepository.cs:57-78    (RemoveVisitsByTrip)
//   TMD.Infrastructure/Mappings/{Trees,Sites}.hbm.xml          (cascade="all-delete-orphan"
//     on every child bag -- Measurements/Photos/Measurers off Tree,
//     Visits/Trees/Photos/Visitors off Site -- which is what makes deleting
//     a childless tree/site also silently delete its remaining children in
//     legacy; this port must delete those children explicitly first, since
//     none of the corresponding Postgres FKs (schema.ts file-header notes
//     2/4) declare ON DELETE CASCADE.)
//
// ORPHAN-CLEANUP RULES, transcribed verbatim in effect:
//   RemoveMeasurementsByTrip(trip): for every tree with >=1 measurement
//     tagged to this trip, remove exactly those measurements; if the tree
//     is left with ZERO measurements, delete the tree entirely (and its
//     Photos/Measurers, cascade="all-delete-orphan"). Trees.FlagStaleMetrics_
//     Trees fires on that Trees.Trees DELETE -> the tree's (surviving) site
//     is marked stale. A tree that merely loses one of several measurements
//     but survives triggers NOTHING (the trigger is scoped to Trees.Trees
//     row mutations, not Measurements mutations) -- see engine.ts's header
//     DESIGN CHOICE note on why no headline recompute happens here either.
//   RemoveVisitsByTrip(trip): for every site with >=1 visit tagged to this
//     trip, remove exactly those visits; if the site is left with ZERO
//     visits, delete the site entirely (cascading Trees/Photos/Visitors).
//     Sites.FlagStaleMetrics_Sites fires on that Sites.Sites DELETE -> the
//     site's state is marked stale. Because `Site.Create` always adds
//     exactly one visit per trip that ever touches a site (fresh-create OR
//     merge), a site reaching zero visits here means this trip was the
//     ONLY trip that ever touched it -- so by this point
//     `removeMeasurementsByTrip` will already have deleted every tree that
//     site had (each solely fed by this trip's own measurements). The
//     cascade-delete of "remaining" trees below is therefore a defensive
//     safety net matching NHibernate's actual (unconditional)
//     cascade="all-delete-orphan" behavior, not the expected common case.
//   Order matches legacy exactly: measurements/trees cleanup, then
//     visits/sites cleanup, then (after an NHibernate-specific `Flush()`
//     that has no equivalent need in a plain-SQL port) re-import.

import { markSiteStaleForTree, markStatesStaleForSite, recomputeStaleMetrics } from "../../db/recompute";
import { defaultSql, type SqlTag, withTransaction } from "../../db/queries/sql-tag";
import { type FinishTripResult, runImport } from "./engine";

interface TripImportedRow {
  id: number;
  imported: string | null;
}

async function loadTripImportedFlag(sql: SqlTag, tripId: number): Promise<TripImportedRow> {
  const rows = await sql<TripImportedRow>`select id, imported from import_trips where id = ${tripId}`;
  const trip = rows[0];
  if (!trip) throw new Error(`Import trip ${tripId} not found`);
  return trip;
}

/**
 * `TreeRepository.RemoveMeasurementsByTrip` (TreeRepository.cs:24-43).
 *
 * Exported (task P3-07, doc 05 §P3-03..07) for reuse by `db/queries/
 * import-drafts.sql.ts`'s `removeTrip` -- `ImportRepository.Remove(t)`
 * (`TMD.Infrastructure/Repositories/ImportRepository.cs:29-34`) runs this
 * exact same cleanup pair (`RemoveMeasurementsByTrip`/`RemoveVisitsByTrip`)
 * before deleting the trip itself, for BOTH draft and already-imported
 * trips -- no `IsImported` branch in legacy's `Remove`. This is an additive
 * export only (no behavior change) so History's "Remove" action can reuse
 * the identical, already-verified orphan-cleanup logic instead of
 * duplicating it.
 */
export async function removeMeasurementsByTrip(sql: SqlTag, tripId: number): Promise<void> {
  const measurementRows = await sql<{ id: number; tree_id: number | null }>`
    select id, tree_id from tree_measurements where importing_trip_id = ${tripId}
  `;
  if (measurementRows.length === 0) return;

  const measurementIds = measurementRows.map((r) => r.id);
  const treeIds = [...new Set(measurementRows.map((r) => r.tree_id).filter((id): id is number => id != null))];

  for (const id of measurementIds) {
    await sql`delete from tree_measurers where measurement_id = ${id}`;
    await sql`delete from photo_references where type = 7 and tree_measurement_id = ${id}`;
  }
  for (const id of measurementIds) {
    await sql`delete from tree_measurements where id = ${id}`;
  }

  for (const treeId of treeIds) {
    const countRows = await sql<{ n: number }>`
      select count(*)::int as n from tree_measurements where tree_id = ${treeId}
    `;
    if ((countRows[0]?.n ?? 0) >= 1) continue; // tree survives -- no Trees.Trees mutation, no stale-flag per legacy trigger scope.

    const siteRows = await sql<{ site_id: number }>`select site_id from trees where id = ${treeId}`;
    await sql`delete from tree_measurers where tree_id = ${treeId}`;
    await sql`delete from photo_references where type = 6 and tree_id = ${treeId}`;
    await sql`delete from trees where id = ${treeId}`;
    const siteId = siteRows[0]?.site_id;
    if (siteId != null) await markSiteStaleForTree(siteId, sql);
  }
}

/** `SiteRepository.RemoveVisitsByTrip` (SiteRepository.cs:57-78). Exported -- see `removeMeasurementsByTrip`'s header note. */
export async function removeVisitsByTrip(sql: SqlTag, tripId: number): Promise<void> {
  const visitRows = await sql<{ id: number; site_id: number | null }>`
    select id, site_id from site_visits where importing_trip_id = ${tripId}
  `;
  if (visitRows.length === 0) return;

  const visitIds = visitRows.map((r) => r.id);
  const siteIds = [...new Set(visitRows.map((r) => r.site_id).filter((id): id is number => id != null))];

  for (const id of visitIds) {
    await sql`delete from site_visitors where site_visit_id = ${id}`;
    await sql`delete from photo_references where type = 5 and site_visit_id = ${id}`;
  }
  for (const id of visitIds) {
    await sql`delete from site_visits where id = ${id}`;
  }

  for (const siteId of siteIds) {
    const countRows = await sql<{ n: number }>`
      select count(*)::int as n from site_visits where site_id = ${siteId}
    `;
    if ((countRows[0]?.n ?? 0) >= 1) continue; // site survives -- SiteVisits has no staleness trigger of its own.

    const stateRows = await sql<{ state_id: number }>`select state_id from sites where id = ${siteId}`;

    // Defensive safety net -- see file header note on why this is expected
    // to be a no-op in practice.
    const remainingTrees = await sql<{ id: number }>`select id from trees where site_id = ${siteId}`;
    for (const t of remainingTrees) {
      await sql`delete from tree_measurers where tree_id = ${t.id}`;
      await sql`delete from photo_references where tree_id = ${t.id}`;
      const measurementIds = (
        await sql<{ id: number }>`select id from tree_measurements where tree_id = ${t.id}`
      ).map((m) => m.id);
      for (const mid of measurementIds) {
        await sql`delete from tree_measurers where measurement_id = ${mid}`;
        await sql`delete from photo_references where tree_measurement_id = ${mid}`;
      }
      await sql`delete from tree_measurements where tree_id = ${t.id}`;
      await sql`delete from trees where id = ${t.id}`;
    }

    await sql`delete from site_visitors where site_id = ${siteId}`;
    await sql`delete from photo_references where type = 4 and site_id = ${siteId}`;
    await sql`delete from sites where id = ${siteId}`;
    const stateId = stateRows[0]?.state_id;
    if (stateId != null) await markStatesStaleForSite(stateId, sql);
  }
}

/**
 * `Reimport()` (ImportRepository.cs base class:28-37): guards on
 * `t.IsImported` (throws the mirrored error below if the trip was never
 * imported -- opposite guard from `finishTrip`'s, matching legacy's two
 * distinct methods exactly), then `InternalReimport` (ImportRepository.cs:
 * 59-67): delete-then-import with the orphan-cleanup rules above.
 */
export async function reimportTrip(
  tripId: number,
  sql: SqlTag = defaultSql(),
): Promise<FinishTripResult> {
  return withTransaction(sql, async (trx) => {
    const trip = await loadTripImportedFlag(trx, tripId);
    if (!trip.imported) {
      throw new Error(
        `Unable to reimport trip ${tripId} because it has not yet been imported (matches Reimport()'s InvalidEntityOperationException) -- use finishTrip() instead.`,
      );
    }

    await removeMeasurementsByTrip(trx, tripId);
    await removeVisitsByTrip(trx, tripId);
    // ImportRepository.cs:63-65's Session.Flush() resolves an NHibernate-
    // specific identity-map/cascade hazard ("deleted object would be
    // re-saved by cascade") that has no equivalent in a plain-SQL port --
    // every delete above already committed within this same transaction.

    const result = await runImport(trx, tripId);
    await trx`update import_trips set imported = now() where id = ${tripId}`;
    await recomputeStaleMetrics(trx);
    return result;
  });
}
