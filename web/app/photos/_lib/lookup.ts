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
 * So for this route (always anonymous in Phase 1): a photo is viewable iff
 * it has at least one `photo_references` row with `type IN (4,5,6,7)`.
 */
import { getSql } from "@/db/index";

export interface PhotoLookup {
  /** `Photos.Photos.Format` (tinyint 0 NotSpecified / 1 Jpeg / 2 Gif / 3 Png -- TMD.Model/Photos/IPhoto.cs:6-12). */
  format: number;
}

/** Returns the photo's format if viewable by an anonymous user, else `null` (matches legacy's 403, not a 404). */
export async function findViewablePhoto(photoId: number): Promise<PhotoLookup | null> {
  const sql = getSql();
  const rows = await sql<{ format: number }[]>`
    select p.format
    from photos p
    where p.id = ${photoId}
      and exists (
        select 1 from photo_references r
        where r.photo_id = p.id and r.type in (4, 5, 6, 7)
      )
    limit 1
  `;
  return rows[0] ? { format: rows[0].format } : null;
}
