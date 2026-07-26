/**
 * Photo-icon lookup for the import-wizard markers endpoint -- task P3-09
 * (doc 05 §P3-09). Backs `lib/import-markers.ts`'s `IconUrl` field: "first
 * photo" (lowest `photo_references.id`) per import site/tree, mirroring
 * `db/queries/map.sql.ts`'s `allSiteMarkers`/`allTreeMarkers`
 * correlated-subquery convention (same file's header note on "first" =
 * lowest id = the only deterministic stand-in for NHibernate's unordered
 * `IList<IPhoto>`), adapted to a batch (whole-trip) shape here since the
 * caller (the markers route) needs every site's/tree's icon in one request,
 * not a single row.
 *
 * `photo_references.type` 2 = ImportSite, 3 = ImportTree
 * (`lib/merge/types.ts`'s `PhotoReferenceType`, doc 01 §2/§3). P3-08 (photo
 * upload on import trees/sites) is not built yet, so these rows are
 * currently always empty in production -- this still needs to be correct
 * once that task lands, since it changes nothing about IconUrl's shape
 * (`db/queries/map.sql.ts:262-264`'s `siteOrTreeIconUrl` fallback rule).
 */
import type { SqlTag } from "./sql-tag";
import { defaultSql } from "./sql-tag";

export interface ImportMarkerPhotoIcons {
  siteFirstPhotoId: Map<number, number>;
  treeFirstPhotoId: Map<number, number>;
}

export async function importMarkerPhotoIcons(
  tripId: number,
  sql: SqlTag = defaultSql(),
): Promise<ImportMarkerPhotoIcons> {
  const siteRows = await sql<{ import_site_id: number; photo_id: number }>`
    select distinct on (pr.import_site_id) pr.import_site_id, pr.photo_id
    from photo_references pr
    join import_sites s on s.id = pr.import_site_id
    where s.trip_id = ${tripId} and pr.type = 2
    order by pr.import_site_id asc, pr.id asc
  `;
  const treeRows = await sql<{ import_tree_id: number; photo_id: number }>`
    select distinct on (pr.import_tree_id) pr.import_tree_id, pr.photo_id
    from photo_references pr
    join import_trees t on t.id = pr.import_tree_id
    join import_sites s on s.id = t.site_id
    where s.trip_id = ${tripId} and pr.type = 3
    order by pr.import_tree_id asc, pr.id asc
  `;

  return {
    siteFirstPhotoId: new Map(siteRows.map((r) => [r.import_site_id, r.photo_id])),
    treeFirstPhotoId: new Map(treeRows.map((r) => [r.import_tree_id, r.photo_id])),
  };
}
