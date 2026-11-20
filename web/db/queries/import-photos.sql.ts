/**
 * Import-wizard photos -- task P3-08 (doc 05 §P3-08). Ports
 * `PhotosController.AddToImportSite`/`AddToImportTree`/`Remove`
 * (`TMD/Controllers/PhotosController.cs`), `Site.AddPhoto`/`TreeBase.AddPhoto`
 * (`TMD.Model/Imports/Site.cs:137-148`, `TreeBase.cs:307-317`) and the
 * `Imports.SitePhotoReference`/`TreePhotoReference` permissions.
 *
 * Storage: one `photos` row plus one `photo_references` row typed 2
 * (ImportSite, `import_site_id`) or 3 (ImportTree, `import_tree_id`); the
 * bytes go to the photo store at `photos/{id}` (legacy wrote the blob from a
 * NHibernate post-insert listener, `PhotoRepository.cs:17-44`). On Finish,
 * the merge engine re-types these to 5/7 and then 4/6 (lib/merge/graph.ts),
 * pointing at the same `photos` row.
 *
 * Authorization: callers run `assertTripEditable` first (role Import AND
 * trip creator), which is exactly each import reference's
 * `IsAuthorizedToAdd/Remove` (`user.IsAuthorizedToEdit(trip)`). Legacy's
 * `AddTo*` actions actually checked `PhotoReferences.IsAuthorizedToAdd`,
 * whose LINQ (`(from r in this select r.IsAuthorizedToAdd(user)).Count() > 0`,
 * PhotoReference.cs:79-84) counts references rather than true answers, so it
 * passed for any user once the reference existed; the port enforces the
 * per-reference rule it was meant to apply. Every function here also checks
 * that the site/tree/reference belongs to the given trip.
 *
 * Removal: legacy deleted only the reference (`Session.Delete(reference)`)
 * and left the `photos` row and blob behind as an orphan
 * (`PhotoRepository.ListOrphaned`). The port deletes a photo row once no
 * reference points at it and returns its id, so the caller can delete the
 * blobs after the transaction commits. A photo still referenced by a
 * finished trip's canonical site/tree is kept.
 */
import type { SqlTag } from "./sql-tag";
import { defaultSql, withTransaction } from "./sql-tag";

export const ImportPhotoReferenceType = { ImportSite: 2, ImportTree: 3 } as const;

/** `photo_references.caption` is `varchar(1000)`. */
export const MAX_CAPTION_LENGTH = 1000;

export type ImportPhotoOwner = { kind: "site"; siteId: number } | { kind: "tree"; treeId: number };

export interface ImportPhoto {
  referenceId: number;
  photoId: number;
  caption: string | null;
  importSiteId: number | null;
  importTreeId: number | null;
}

export interface NewPhotoRow {
  width: number;
  height: number;
  bytes: number;
  format: number;
}

/** The site/tree/reference isn't part of the trip (or doesn't exist). */
export class ImportPhotoAccessError extends Error {
  constructor() {
    super("That photo, site or tree is not part of this trip.");
    this.name = "ImportPhotoAccessError";
  }
}

async function stampTripLastSaved(tripId: number, now: Date, sql: SqlTag): Promise<void> {
  await sql`update import_trips set last_saved = ${now} where id = ${tripId}`;
}

/** Every import-side photo reference of the trip, oldest first (legacy's bag order). */
export async function listImportPhotosForTrip(tripId: number, sql: SqlTag = defaultSql()): Promise<ImportPhoto[]> {
  const rows = await sql<{
    id: number;
    photo_id: number;
    caption: string | null;
    import_site_id: number | null;
    import_tree_id: number | null;
  }>`
    select r.id, r.photo_id, r.caption, r.import_site_id, r.import_tree_id
    from photo_references r
    left join import_sites s on s.id = r.import_site_id
    left join import_trees t on t.id = r.import_tree_id
    left join import_sites ts on ts.id = t.site_id
    where r.type in (2, 3) and (s.trip_id = ${tripId} or ts.trip_id = ${tripId})
    order by r.id asc
  `;
  return rows.map((r) => ({
    referenceId: r.id,
    photoId: r.photo_id,
    caption: r.caption,
    importSiteId: r.import_site_id,
    importTreeId: r.import_tree_id,
  }));
}

async function assertOwnerInTrip(tripId: number, owner: ImportPhotoOwner, sql: SqlTag): Promise<void> {
  const rows =
    owner.kind === "site"
      ? await sql<{ id: number }>`select id from import_sites where id = ${owner.siteId} and trip_id = ${tripId}`
      : await sql<{ id: number }>`
          select t.id from import_trees t join import_sites s on s.id = t.site_id
          where t.id = ${owner.treeId} and s.trip_id = ${tripId}
        `;
  if (!rows[0]) throw new ImportPhotoAccessError();
}

async function findReferenceInTrip(
  tripId: number,
  referenceId: number,
  sql: SqlTag,
): Promise<{ id: number; photoId: number }> {
  const rows = await sql<{ id: number; photo_id: number }>`
    select r.id, r.photo_id
    from photo_references r
    left join import_sites s on s.id = r.import_site_id
    left join import_trees t on t.id = r.import_tree_id
    left join import_sites ts on ts.id = t.site_id
    where r.id = ${referenceId} and r.type in (2, 3) and (s.trip_id = ${tripId} or ts.trip_id = ${tripId})
  `;
  if (!rows[0]) throw new ImportPhotoAccessError();
  return { id: rows[0].id, photoId: rows[0].photo_id };
}

/**
 * Adds a photo to an import site or tree. `writeBlob(photoId)` stores the
 * bytes once the id exists; if it throws, the rows are removed again (and
 * the transaction rolls back) so no row points at a missing blob.
 */
export async function addImportPhoto(
  tripId: number,
  owner: ImportPhotoOwner,
  creatorUserId: number,
  photo: NewPhotoRow,
  now: Date,
  writeBlob: (photoId: number) => Promise<void>,
  sql: SqlTag = defaultSql(),
): Promise<{ photoId: number; referenceId: number }> {
  return withTransaction(sql, async (trx) => {
    await assertOwnerInTrip(tripId, owner, trx);

    const inserted = await trx<{ id: number }>`
      insert into photos (creator_user_id, created, width, height, bytes, format)
      values (${creatorUserId}, ${now}, ${photo.width}, ${photo.height}, ${photo.bytes}, ${photo.format})
      returning id
    `;
    const photoId = inserted[0]!.id;
    const ref =
      owner.kind === "site"
        ? await trx<{ id: number }>`
            insert into photo_references (type, import_site_id, photo_id)
            values (${ImportPhotoReferenceType.ImportSite}, ${owner.siteId}, ${photoId}) returning id
          `
        : await trx<{ id: number }>`
            insert into photo_references (type, import_tree_id, photo_id)
            values (${ImportPhotoReferenceType.ImportTree}, ${owner.treeId}, ${photoId}) returning id
          `;
    const referenceId = ref[0]!.id;

    try {
      await writeBlob(photoId);
    } catch (err) {
      await trx`delete from photo_references where id = ${referenceId}`;
      await trx`delete from photos where id = ${photoId}`;
      throw err;
    }

    await stampTripLastSaved(tripId, now, trx);
    return { photoId, referenceId };
  });
}

/** Sets (or, when blank, clears) a reference's caption. */
export async function updateImportPhotoCaption(
  tripId: number,
  referenceId: number,
  caption: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  const trimmed = caption.trim().slice(0, MAX_CAPTION_LENGTH);
  await withTransaction(sql, async (trx) => {
    const ref = await findReferenceInTrip(tripId, referenceId, trx);
    await trx`update photo_references set caption = ${trimmed === "" ? null : trimmed} where id = ${ref.id}`;
    await stampTripLastSaved(tripId, now, trx);
  });
}

/**
 * Deletes each given photo whose last reference is gone. Returns the ids
 * deleted, whose blobs the caller should remove after commit.
 */
export async function deleteOrphanedPhotos(photoIds: readonly number[], sql: SqlTag): Promise<number[]> {
  const deleted: number[] = [];
  for (const id of new Set(photoIds)) {
    const rows = await sql<{ id: number }>`
      delete from photos p
      where p.id = ${id} and not exists (select 1 from photo_references r where r.photo_id = p.id)
      returning p.id
    `;
    if (rows[0]) deleted.push(rows[0].id);
  }
  return deleted;
}

/** Removes one import photo reference. Returns the photo ids left unreferenced (now deleted). */
export async function removeImportPhoto(
  tripId: number,
  referenceId: number,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<number[]> {
  return withTransaction(sql, async (trx) => {
    const ref = await findReferenceInTrip(tripId, referenceId, trx);
    await trx`delete from photo_references where id = ${ref.id}`;
    const orphaned = await deleteOrphanedPhotos([ref.photoId], trx);
    await stampTripLastSaved(tripId, now, trx);
    return orphaned;
  });
}

/**
 * Deletes the import photo references of one import site and its trees (the
 * `Photos` bags legacy's ORM cascade removed with the site, Imports.hbm.xml).
 * Returns the affected photo ids; the caller deletes orphans afterwards.
 */
export async function deleteImportSitePhotoReferences(siteId: number, sql: SqlTag): Promise<number[]> {
  const rows = await sql<{ photo_id: number }>`
    delete from photo_references
    where (type = 2 and import_site_id = ${siteId})
       or (type = 3 and import_tree_id in (select id from import_trees where site_id = ${siteId}))
    returning photo_id
  `;
  return rows.map((r) => r.photo_id);
}

/** Same as `deleteImportSitePhotoReferences`, for one import tree. */
export async function deleteImportTreePhotoReferences(treeId: number, sql: SqlTag): Promise<number[]> {
  const rows = await sql<{ photo_id: number }>`
    delete from photo_references where type = 3 and import_tree_id = ${treeId} returning photo_id
  `;
  return rows.map((r) => r.photo_id);
}
