"use server";

// Import-wizard photo actions -- task P3-08 (doc 05 §P3-08). Ports
// `PhotosController.AddToImportSite`/`AddToImportTree`/`Remove`
// (`TMD/Controllers/PhotosController.cs`) plus a caption edit, for the
// photo galleries on the Sites and Trees steps
// (components/import/photo-gallery.tsx). Legacy posted these over AJAX and
// swapped the gallery partial in place; here each is a server action that
// redirects back to the step page it came from, carrying any error in the
// `photoError` query parameter for the gallery to show.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { assertTripEditable } from "@/db/queries/import-drafts.sql";
import {
  ImportPhotoAccessError,
  addImportPhoto,
  removeImportPhoto,
  updateImportPhotoCaption,
  type ImportPhotoOwner,
} from "@/db/queries/import-photos.sql";
import { PhotoUploadError, preparePhotoUpload } from "@/lib/photos/upload";
import { createPhotoStoreProvider, deletePhotoBlobs } from "@/app/photos/_lib/store";

interface PhotoActionContext {
  tripId: number;
  userId: number;
  owner: ImportPhotoOwner;
  returnTo: string;
}

/** The step page to go back to: only this trip's Sites or Trees step, so a crafted value can't redirect elsewhere. */
function safeReturnTo(raw: string, tripId: number): string {
  const allowed = new RegExp(`^/import/${tripId}/(sites|trees)(\\?[A-Za-z0-9=&_-]*)?$`);
  return allowed.test(raw) ? raw : `/import/${tripId}/sites`;
}

function withParams(path: string, params: Record<string, string>): string {
  const url = new URL(path, "http://local");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return `${url.pathname}${url.search}`;
}

function ownerKey(owner: ImportPhotoOwner): string {
  return owner.kind === "site" ? `site-${owner.siteId}` : `tree-${owner.treeId}`;
}

async function readContext(formData: FormData): Promise<PhotoActionContext> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const tripId = Number(tripIdRaw);
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""), tripId);

  const session = asAppSession(await auth());
  if (!session) redirect(`/account/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch {
    // Same convention as the step actions: go back to the step and let its
    // layout render the not-found/unauthorized outcome.
    redirect(returnTo);
  }

  const ownerId = Number(formData.get("ownerId") ?? "");
  const owner: ImportPhotoOwner =
    formData.get("ownerKind") === "tree" ? { kind: "tree", treeId: ownerId } : { kind: "site", siteId: ownerId };
  return { tripId, userId: session.userId, owner, returnTo };
}

function backWithError(ctx: PhotoActionContext, message: string): never {
  redirect(withParams(ctx.returnTo, { photoError: message, photoOwner: ownerKey(ctx.owner) }));
}

/** `AddToImportSite` / `AddToImportTree`. */
export async function addImportPhotoAction(formData: FormData): Promise<void> {
  const ctx = await readContext(formData);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) backWithError(ctx, "Choose a photo to upload.");

  let prepared;
  try {
    prepared = await preparePhotoUpload(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof PhotoUploadError) backWithError(ctx, err.message);
    throw err;
  }

  const store = createPhotoStoreProvider();
  if (!store.configured) backWithError(ctx, "Photo storage isn't set up yet, so photos can't be added.");

  try {
    await addImportPhoto(
      ctx.tripId,
      ctx.owner,
      ctx.userId,
      { width: prepared.width, height: prepared.height, bytes: prepared.bytes.length, format: prepared.format },
      new Date(),
      (photoId) => store.putOriginal(photoId, prepared.bytes, prepared.contentType),
    );
  } catch (err) {
    if (err instanceof ImportPhotoAccessError) backWithError(ctx, err.message);
    console.error("import photo upload failed", err);
    backWithError(ctx, "The photo couldn't be saved. Please try again.");
  }

  redirect(ctx.returnTo);
}

/** Caption edit (the column is new in this port, db/schema.ts note 5). */
export async function saveImportPhotoCaptionAction(formData: FormData): Promise<void> {
  const ctx = await readContext(formData);
  const referenceId = Number(formData.get("referenceId") ?? "");
  try {
    await updateImportPhotoCaption(ctx.tripId, referenceId, String(formData.get("caption") ?? ""), new Date());
  } catch (err) {
    if (err instanceof ImportPhotoAccessError) backWithError(ctx, err.message);
    throw err;
  }
  redirect(ctx.returnTo);
}

/** `PhotosController.Remove`. */
export async function removeImportPhotoAction(formData: FormData): Promise<void> {
  const ctx = await readContext(formData);
  const referenceId = Number(formData.get("referenceId") ?? "");
  try {
    await deletePhotoBlobs(await removeImportPhoto(ctx.tripId, referenceId, new Date()));
  } catch (err) {
    if (err instanceof ImportPhotoAccessError) backWithError(ctx, err.message);
    throw err;
  }
  redirect(ctx.returnTo);
}
