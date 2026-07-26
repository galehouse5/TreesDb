/**
 * Port of `BrowseController.RecentTrips` (`TMD/Controllers/BrowseController.cs:267-272`)
 * -- task P1-13, doc 03 "P1-13", doc 01 §1 (`/Browse/Activity` -> `/activity`).
 *
 * Legacy: `Repositories.Sites.ListRecentSiteVisits(40)`
 * (`TMD.Infrastructure/Repositories/SiteRepository.cs:131-141`) -- an
 * NHibernate `Criteria` query on `SiteVisit` with `State`/`Site`/`Visitors`
 * eager-fetched, `ORDER BY Visited DESC`, `SetMaxResults(maxResults * 2)`,
 * then a `DistinctRootEntity` transformer + in-memory `.Take(maxResults)`.
 *
 * The `maxResults * 2` (fetch 80, then take 40) is an ORM workaround for
 * SQL row inflation caused by the `Visitors` eager fetch-join (each visitor
 * row duplicates its parent SiteVisit row in the flat SQL result set before
 * NHibernate's `DistinctRootEntity` transformer collapses them back). Its
 * own comment says the choice of "2x" is a heuristic ("average site visit
 * has less than two visitors"), not a business rule -- a site visit with
 * 3+ visitors can still cause the top-level ORDER-BY-DESC/LIMIT-80 SQL
 * query to run out of budget before collecting 40 distinct SiteVisit rows,
 * silently truncating the "recent trips" list below 40 when many
 * multi-visitor trips cluster at the top of the date-sorted list. This is
 * an artifact of the ORM's fetch-join pagination technique, not a
 * documented product behavior, and it is NOT on doc 01 §13's authoritative
 * do-not-blindly-fix list (only 4 items, none of which are this) -- so it
 * is not preserved here. This port instead computes a true "40 most recent
 * site visits" directly in SQL (`ORDER BY visited DESC LIMIT 40`, ties
 * broken by `site_visit.id ASC` for determinism -- legacy's tie order for
 * same-date visits is whatever the SQL Server clustered-index scan happened
 * to return, since `AddOrder` only sorts by `Visited`) and fetches each
 * visit's visitors with a separate, unbounded query -- avoiding the
 * inflation problem entirely rather than replicating its accidental
 * undercount.
 *
 * `id ASC` (not `DESC`) confirmed via live-site audit + www.treesdb.org
 * cross-check (this task): www.treesdb.org/Browse/Activity lists site visit
 * "College Of The South" (site_visits.id 47101) before "Shakerag Hollow"
 * (site_visits.id 47102), both visited 2026-02-28 -- i.e. the LOWER id
 * sorts first for this table/query's tie order, opposite of the `id DESC`
 * this port originally guessed. (Note this is the opposite direction from
 * `browse-grids.sql.ts`'s analogous `default`-sort fix, which needs
 * `sites.id DESC` for the same College-Of-The-South-before-Shakerag-Hollow
 * pair -- `sites.id` and `site_visits.id` are different identity sequences
 * with no fixed relationship, so there is no contradiction, just two
 * independently-empirical findings.)
 *
 * Visitor order within a trip: `Sites.hbm.xml`'s `<bag name="Visitors">`
 * collection mapping has no `<order-by>`, so legacy's iteration order is
 * whatever the underlying SQL join happens to return -- in practice the
 * table's natural/clustered order, i.e. `SiteVisitors.Id` ascending (the
 * order rows were originally inserted in). This port orders visitors by
 * `site_visitors.id asc` to match.
 */
import { type SqlTag, defaultSql } from "./sql-tag";

export interface TripVisitor {
  firstName: string;
  lastName: string;
}

export interface RecentTripRow {
  siteVisitId: number;
  /** Raw `YYYY-MM-DD` string (date column) -- no Date/timezone parsing, matching the measurer-activity.sql.ts convention in this directory. */
  visited: string;
  siteId: number;
  siteName: string;
  county: string;
  stateId: number;
  stateName: string;
  visitors: TripVisitor[];
}

interface RawRow {
  site_visit_id: number;
  visited: string;
  site_id: number;
  site_name: string;
  county: string;
  state_id: number;
  state_name: string;
  visitor_id: number | null;
  first_name: string | null;
  last_name: string | null;
}

/**
 * Port of `BrowseController.RecentTrips` / `Repositories.Sites.ListRecentSiteVisits(40)`.
 * `limit` defaults to legacy's hardcoded 40 (`RecentTrips()` never takes a
 * parameter from the caller -- the 40 is baked into the controller action).
 *
 * Implemented as a single query (top-40 visits in a subquery, left-joined
 * to their visitors) rather than a top-level query plus a second
 * `WHERE site_visit_id = ANY(...)` lookup -- `sql-tag.ts`'s contract
 * requires flat, single-level `sql\`...\`` templates with scalar
 * parameters only (no array-typed bind values), so the join is pushed into
 * SQL instead. Rows are grouped back into one `RecentTripRow` per visit in
 * JS, preserving the subquery's order.
 */
export async function recentTrips(
  limit = 40,
  sql: SqlTag = defaultSql(),
): Promise<RecentTripRow[]> {
  const rows = await sql<RawRow>`
    select
      sv.id as site_visit_id,
      sv.visited::text,
      sv.site_id,
      s.name as site_name,
      sv.county,
      sv.state_id,
      st.name as state_name,
      vis.id as visitor_id,
      vis.first_name,
      vis.last_name
    from (
      select * from site_visits order by visited desc, id asc limit ${limit}
    ) sv
    join sites s on s.id = sv.site_id
    join states st on st.id = sv.state_id
    left join site_visitors vis on vis.site_visit_id = sv.id
    order by sv.visited desc, sv.id asc, vis.id asc
  `;

  const tripsBySiteVisitId = new Map<number, RecentTripRow>();
  const order: number[] = [];
  for (const row of rows) {
    let trip = tripsBySiteVisitId.get(row.site_visit_id);
    if (!trip) {
      trip = {
        siteVisitId: row.site_visit_id,
        visited: row.visited,
        siteId: row.site_id,
        siteName: row.site_name,
        county: row.county,
        stateId: row.state_id,
        stateName: row.state_name,
        visitors: [],
      };
      tripsBySiteVisitId.set(row.site_visit_id, trip);
      order.push(row.site_visit_id);
    }
    if (row.first_name !== null && row.last_name !== null) {
      trip.visitors.push({ firstName: row.first_name, lastName: row.last_name });
    }
  }
  return order.map((id) => tripsBySiteVisitId.get(id)!);
}
