// Cheap "does this public page's record exist?" checks for the detail
// routes' layouts (app/trees/[id], app/sites/[id], app/states/[id]).
//
// Each of those segments has a loading.tsx, which wraps the page in a
// Suspense boundary. Next.js sends the response headers (status 200) as
// soon as that boundary's fallback streams, so a notFound() inside the
// page could only render the not-found UI under a 200: a soft 404 that
// search engines index. Legacy answered a real 404. The segment layout
// renders before the boundary, so a notFound() there still sets the 404
// status; these single-row primary-key lookups keep that wait short and
// leave the page's own heavier queries behind the skeleton as before.
//
// The joins mirror the page queries' inner joins (details.sql.ts
// treeDetails/siteDetails, species-state-details.sql.ts stateSummary), so
// "exists" here means exactly "the page will find a row".
import { type SqlTag, defaultSql } from "./sql-tag";

export async function treeExists(id: number, sql: SqlTag = defaultSql()): Promise<boolean> {
  const rows = await sql<{ one: number }>`
    select 1 as one
    from trees t
    join sites s on s.id = t.site_id
    join states st on st.id = s.state_id
    join countries c on c.id = st.country_id
    where t.id = ${id}
  `;
  return rows.length > 0;
}

export async function siteExists(id: number, sql: SqlTag = defaultSql()): Promise<boolean> {
  const rows = await sql<{ one: number }>`
    select 1 as one
    from sites s
    join states st on st.id = s.state_id
    join countries c on c.id = st.country_id
    where s.id = ${id}
  `;
  return rows.length > 0;
}

export async function stateExists(id: number, sql: SqlTag = defaultSql()): Promise<boolean> {
  const rows = await sql<{ one: number }>`
    select 1 as one
    from states st
    join countries c on c.id = st.country_id
    where st.id = ${id}
  `;
  return rows.length > 0;
}

/** Positive int32 ids only, matching the pages' own guard. */
export function parseDetailId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}
