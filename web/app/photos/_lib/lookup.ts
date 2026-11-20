/**
 * DB lookup for the `/photos/{id}/{size}` route (doc 03 P1-12).
 *
 * Authorization mirrors `PhotosController.ViewPhoto` (`TMD/Controllers/
 * PhotosController.cs:24-33`) EXACTLY, including a finding from reading it
 * closely rather than guessing (see this task's report for the full
 * writeup): legacy does NOT return its "missing file" fallback-icon
 * behavior for an unknown/nonexistent photo id. It returns
 * `UnauthorizedResult` (403) instead, via this path:
 *
 *   var photo = Repositories.Photos.FindById(id);                 // NHibernate `Session.Get` -> null if no such row, does NOT throw
 *   if (!Repositories.Photos.ListAllReferencesByPhotoId(id)
 *         .IsAuthorizedToView(User)) { return new UnauthorizedResult(); }
 *
 * `PhotoReferences.IsAuthorizedToView` (`TMD.Model/Photos/PhotoReference.cs:
 * 72-78`) is `(from reference in this select reference.IsAuthorizedToView(user)).Count() > 0`
 * -- for an id with ZERO reference rows (i.e. it doesn't exist, or exists
 * but is orphaned), this LINQ query is vacuously `false` -- 403, not the
 * icon fallback (the icon fallback only fires later, inside
 * `Photo.Get(size)`, for a photo whose ROW exists and IS referenced, but
 * whose on-disk blob file is missing -- a completely different failure
 * mode). The 403 check runs and can short-circuit before `photo.Get(size)`
 * (the fallback-icon code path) is ever reached.
 *
 * Per-reference-type `IsAuthorizedToView` for an ANONYMOUS user (Phase 1
 * has no auth/session system yet -- doc 01 §1 "Photos-view/Trees/Main is
 * anonymous"), from every override in the legacy solution
 * (`Photos.References.Type` discriminator, doc 01 §2):
 *   1 Public            (PublicPhotoReference)            -> false (inherits PhotoReferenceBase's default; unused/dead type in practice)
 *   2 ImportSite         (Imports.SitePhotoReference)       -> `user.IsAuthorizedToEdit(Site.Trip)` -> false for anonymous
 *   3 ImportTree          (Imports.TreePhotoReference)       -> `user.IsAuthorizedToEdit(Tree.Site.Trip)` -> false for anonymous
 *   4 Site                (Sites.SitePhotoReference)         -> true
 *   5 SiteVisit            (Sites.SiteVisitPhotoReference)     -> true
 *   6 Tree                  (Trees.TreePhotoReference)           -> true
 *   7 TreeMeasurement        (Trees.TreeMeasurementPhotoReference) -> true
 * So for an anonymous user: a photo is viewable iff it has at least one
 * `photo_references` row with `type IN (4,5,6,7)`.
 *
 * P3-08 adds the signed-in case for import-draft photos (types 2/3): the
 * trip's editor (role Import AND trip creator, `user.IsAuthorizedToEdit
 * (trip)`, the same rule as `assertTripEditable`) can view them, so the
 * wizard can show its own thumbnails. Such a photo is reported as not
 * public, and the route caches it privately.
 */
import { defaultSql, type SqlTag } from "@/db/queries/sql-tag";

export interface PhotoLookup {
  /** `Photos.Photos.Format` (tinyint 0 NotSpecified / 1 Jpeg / 2 Gif / 3 Png -- TMD.Model/Photos/IPhoto.cs:6-12). */
  format: number;
  /** True when anyone may view it (a type 4-7 reference); false when only the import trip's editor may. */
  isPublic: boolean;
}

/** The signed-in user, when there is one. */
export interface PhotoViewer {
  userId: number;
  roles: string[];
}

/** Returns the photo's format if `viewer` (or anyone) may view it, else `null` (matches legacy's 403, not a 404). */
export async function findViewablePhoto(
  photoId: number,
  viewer: PhotoViewer | null = null,
  sql: SqlTag = defaultSql(),
): Promise<PhotoLookup | null> {
  const editorId = viewer && viewer.roles.includes("import") ? viewer.userId : null;
  const rows = await sql<{ format: number; is_public: boolean; is_editor: boolean }>`
    select
      p.format,
      exists (
        select 1 from photo_references r
        where r.photo_id = p.id and r.type in (4, 5, 6, 7)
      ) as is_public,
      exists (
        select 1
        from photo_references r
        left join import_sites s on s.id = r.import_site_id
        left join import_trees t on t.id = r.import_tree_id
        left join import_sites ts on ts.id = t.site_id
        join import_trips tr on tr.id = coalesce(s.trip_id, ts.trip_id)
        where r.photo_id = p.id and r.type in (2, 3) and tr.creator_user_id = ${editorId}::int
      ) as is_editor
    from photos p
    where p.id = ${photoId}
    limit 1
  `;
  const row = rows[0];
  if (!row || (!row.is_public && !row.is_editor)) return null;
  return { format: row.format, isPublic: row.is_public };
}
