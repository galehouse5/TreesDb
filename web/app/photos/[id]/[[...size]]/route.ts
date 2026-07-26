/**
 * GET /photos/{id}/{size?} -- port of `PhotosController.ViewPhoto`
 * (`TMD/Controllers/PhotosController.cs:24-33`), doc 01 §1/§11, doc 03
 * P1-12, doc 07 §5.5.
 *
 * `size` is an optional catch-all (`[[...size]]`) so `/photos/{id}` alone
 * resolves too, matching legacy's `size` parameter defaulting to
 * `PhotoSize.Original` when the route segment is absent. Only a single
 * extra segment is meaningful (legacy's route is `Photos/{id}/{size}`,
 * exactly one optional segment) -- more than one, or a segment that
 * doesn't case-insensitively match one of the 11 `PhotoSize` enum names,
 * is treated as not-found. (Legacy's own behavior for an unparseable
 * `PhotoSize` route value is an ASP.NET MVC model-binding edge case with
 * no clear single answer -- not replicated; 404 is this port's own,
 * documented choice for that edge, distinct from the id-not-viewable case
 * below, which legacy DOES have a definite, faithfully-ported answer for.)
 *
 * AUTHORIZATION / MISSING-ID BEHAVIOR -- see `_lib/lookup.ts`'s header for
 * the full trace through legacy: an id with no viewable
 * `photo_references` row (which includes every id today -- `photos` and
 * `photo_references` both have zero rows in the current production dump)
 * gets legacy's `UnauthorizedResult` (403), NOT the missing-file
 * fallback-icon path. That icon fallback is a DIFFERENT case: an existing,
 * viewable photo row whose underlying blob is missing from the store
 * (`_lib/store.ts`) -- unreachable with today's data, but implemented here
 * for forward correctness once real photos exist.
 *
 * CACHE-CONTROL -- doc 03 P1-12 calls for a long `Cache-Control` on
 * successful image responses (variants are otherwise regenerated with
 * sharp on every request -- no R2 write-back variant cache is implemented
 * in this phase, see `_lib/store.ts`'s header; that's a TODO for a later
 * phase's upload flow). The 403 response is explicitly NOT cached.
 */
import { NextResponse } from "next/server";
import {
  canonicalizePhotoSizeName,
  normalizePhotoBuffer,
  type PhotoOutputFormat,
} from "@/lib/photos/photo-size";
import { createPhotoStoreProvider, getFallbackIconBytes } from "../../_lib/store";
import { findViewablePhoto } from "../../_lib/lookup";

// `PhotoFormat` (TMD.Model/Photos/IPhoto.cs:6-12) -> Content-Type
// (`Photo.ContentType`, Photo.cs:27-39) -> sharp output format.
const PHOTO_FORMAT: Record<number, { contentType: string; sharpFormat: PhotoOutputFormat }> = {
  1: { contentType: "image/jpeg", sharpFormat: "jpeg" },
  2: { contentType: "image/gif", sharpFormat: "gif" },
  3: { contentType: "image/png", sharpFormat: "png" },
};

const LONG_CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; size?: string[] }> },
) {
  const { id: idParam, size: sizeSegments } = await params;

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return new NextResponse(null, { status: 404 });
  }

  if (sizeSegments && sizeSegments.length > 1) {
    return new NextResponse(null, { status: 404 });
  }
  const sizeName = canonicalizePhotoSizeName(sizeSegments?.[0] ?? "Original");
  if (!sizeName) {
    return new NextResponse(null, { status: 404 });
  }

  const photo = await findViewablePhoto(id);
  if (!photo) {
    // Faithful port of legacy's `UnauthorizedResult` -- see this file's
    // header. Not cached; not a 404 (the id may well exist, just isn't
    // publicly viewable).
    return new NextResponse("Unauthorized", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const formatInfo = PHOTO_FORMAT[photo.format];
  if (!formatInfo) {
    // `PhotoFormat.NotSpecified` (0) or an unrecognized value -- legacy's
    // `Photo.ContentType`/`ImageFormat` getters `throw new
    // NotImplementedException()` here (a 500 in legacy). Validation
    // (`[NotEquals(PhotoFormat.NotSpecified...)]`) means this should never
    // actually occur for a persisted photo.
    return new NextResponse(null, { status: 500 });
  }

  const store = createPhotoStoreProvider();
  const original = await store.fetchOriginal(id);
  const sourceBytes = original ?? (await getFallbackIconBytes());

  const outputBytes = await normalizePhotoBuffer(sourceBytes, sizeName, formatInfo.sharpFormat);

  return new NextResponse(new Uint8Array(outputBytes), {
    status: 200,
    headers: {
      "Content-Type": formatInfo.contentType,
      "Content-Length": String(outputBytes.length),
      "Cache-Control": LONG_CACHE_CONTROL,
    },
  });
}
