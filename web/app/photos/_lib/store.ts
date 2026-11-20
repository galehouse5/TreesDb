/**
 * Photo blob store for the `/photos/{id}/{size}` route (doc 01 §11, doc 03
 * P1-12) and photo upload (doc 05 P3-08), mirroring legacy's pluggable
 * `IPhotoStoreProvider` (`TMD.Model/Photos/PhotoStoreProvider.cs`) --
 * `DefaultPhotoStoreProvider` (local disk) in dev/self-hosted legacy, or
 * `BlobStoragePhotoStoreProvider` (Azure) in production (the dump
 * manifest's `"photoProvider": "PhotoStore"` confirms the actual legacy
 * production deployment used the local/default provider, not Azure Blob).
 *
 * New app (D-008, D-022): photos live in Vercel Blob (the public store
 * connected to the Vercel project, which injects `BLOB_READ_WRITE_TOKEN`).
 * Keys:
 *   - `photos/{id}`          the original, as uploaded
 *   - `photos/{id}/{size}`   a cached variant, `size` the canonical
 *                            `PhotoSize` name (e.g. `Medium`), written back
 *                            by the route the first time it is requested
 * Same key convention as `scripts/migrate-photos.ts` (the migration-time
 * bulk uploader).
 *
 * With no `BLOB_READ_WRITE_TOKEN` (local dev, CI) every read reports
 * "missing", which drives the same fallback-icon path legacy takes for a
 * missing on-disk blob (`DefaultPhotoStoreProvider.GetReadStream`), and
 * writes throw `PhotoStoreNotConfiguredError`. Tests swap in
 * `InMemoryPhotoStore` via `setPhotoStoreForTests`.
 *
 * The store is public: a blob's URL works without a token. The app never
 * hands those URLs out (every read goes through `/photos/{id}/{size}`, which
 * enforces legacy's view authorization), so an import-draft photo's
 * original is only reachable by someone who already knows the store's
 * host name and the photo id. Accepted in D-022.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";

export interface PhotoStoreProvider {
  /** False when no store is configured: reads report missing, writes throw. */
  readonly configured: boolean;
  /** Returns the original photo's bytes, or `null` if missing / the store isn't configured. */
  fetchOriginal(photoId: number): Promise<Buffer | null>;
  /** Returns a cached variant's bytes, or `null` if not cached yet. */
  fetchVariant(photoId: number, size: string): Promise<Buffer | null>;
  putOriginal(photoId: number, bytes: Buffer, contentType: string): Promise<void>;
  putVariant(photoId: number, size: string, bytes: Buffer, contentType: string): Promise<void>;
  /** Deletes the original and every cached variant. Missing blobs are not an error. */
  deletePhoto(photoId: number): Promise<void>;
}

export class PhotoStoreNotConfiguredError extends Error {
  constructor() {
    super("Photo storage is not configured (BLOB_READ_WRITE_TOKEN is not set).");
    this.name = "PhotoStoreNotConfiguredError";
  }
}

export function originalKey(id: number): string {
  return `photos/${id}`;
}

export function variantKey(id: number, size: string): string {
  return `photos/${id}/${size}`;
}

/** One year: keys are immutable per photo id (a removed photo's id is never reused). */
const BLOB_CACHE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export class VercelBlobPhotoStore implements PhotoStoreProvider {
  readonly configured = true;

  constructor(private readonly token: string) {}

  private async read(pathname: string): Promise<Buffer | null> {
    const res = await get(pathname, { access: "public", token: this.token });
    if (!res || res.statusCode !== 200) return null;
    return streamToBuffer(res.stream);
  }

  private async write(pathname: string, bytes: Buffer, contentType: string): Promise<void> {
    await put(pathname, bytes, {
      access: "public",
      token: this.token,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: BLOB_CACHE_MAX_AGE_SECONDS,
    });
  }

  fetchOriginal(photoId: number): Promise<Buffer | null> {
    return this.read(originalKey(photoId));
  }

  fetchVariant(photoId: number, size: string): Promise<Buffer | null> {
    return this.read(variantKey(photoId, size));
  }

  putOriginal(photoId: number, bytes: Buffer, contentType: string): Promise<void> {
    return this.write(originalKey(photoId), bytes, contentType);
  }

  putVariant(photoId: number, size: string, bytes: Buffer, contentType: string): Promise<void> {
    return this.write(variantKey(photoId, size), bytes, contentType);
  }

  async deletePhoto(photoId: number): Promise<void> {
    const urls: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${variantKey(photoId, "")}`, cursor, token: this.token });
      urls.push(...page.blobs.map((b) => b.url));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    // `del` accepts pathnames too; the original is deleted by pathname so a
    // missing listing entry (eventual consistency) can't leave it behind.
    await del([originalKey(photoId), ...urls], { token: this.token });
  }
}

/** No store configured: reads miss (fallback icon), writes fail loudly. */
class UnconfiguredPhotoStore implements PhotoStoreProvider {
  readonly configured = false;
  async fetchOriginal(): Promise<Buffer | null> {
    return null;
  }
  async fetchVariant(): Promise<Buffer | null> {
    return null;
  }
  async putOriginal(): Promise<void> {
    throw new PhotoStoreNotConfiguredError();
  }
  async putVariant(): Promise<void> {
    throw new PhotoStoreNotConfiguredError();
  }
  async deletePhoto(): Promise<void> {
    throw new PhotoStoreNotConfiguredError();
  }
}

/** Test double: a Map keyed exactly like the real store. */
export class InMemoryPhotoStore implements PhotoStoreProvider {
  readonly configured = true;
  readonly objects = new Map<string, { bytes: Buffer; contentType: string }>();

  async fetchOriginal(photoId: number): Promise<Buffer | null> {
    return this.objects.get(originalKey(photoId))?.bytes ?? null;
  }
  async fetchVariant(photoId: number, size: string): Promise<Buffer | null> {
    return this.objects.get(variantKey(photoId, size))?.bytes ?? null;
  }
  async putOriginal(photoId: number, bytes: Buffer, contentType: string): Promise<void> {
    this.objects.set(originalKey(photoId), { bytes, contentType });
  }
  async putVariant(photoId: number, size: string, bytes: Buffer, contentType: string): Promise<void> {
    this.objects.set(variantKey(photoId, size), { bytes, contentType });
  }
  async deletePhoto(photoId: number): Promise<void> {
    const prefix = variantKey(photoId, "");
    for (const key of [...this.objects.keys()]) {
      if (key === originalKey(photoId) || key.startsWith(prefix)) this.objects.delete(key);
    }
  }
}

let testOverride: PhotoStoreProvider | null = null;

/** Tests only: route every `createPhotoStoreProvider()` call to `store` (null restores env-based selection). */
export function setPhotoStoreForTests(store: PhotoStoreProvider | null): void {
  testOverride = store;
}

export function createPhotoStoreProvider(): PhotoStoreProvider {
  if (testOverride) return testOverride;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? new VercelBlobPhotoStore(token) : new UnconfiguredPhotoStore();
}

/**
 * Deletes the blobs of photos whose rows were just deleted. Best effort: a
 * failure is logged and leaves an unreferenced blob behind, never an error
 * for the user (the rows are already gone).
 */
export async function deletePhotoBlobs(photoIds: readonly number[]): Promise<void> {
  if (photoIds.length === 0) return;
  const store = createPhotoStoreProvider();
  if (!store.configured) return;
  for (const id of photoIds) {
    try {
      await store.deletePhoto(id);
    } catch (err) {
      console.error(`photo ${id}: deleting its blobs failed`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Fallback icon (legacy: `TMD.Model/Photos/icon.png`, served as an embedded
// assembly resource by `DefaultPhotoStoreProvider.GetReadStream` whenever
// the on-disk blob file for an existing `Photo` row is missing -- doc 01
// §11 "missing file falls back to an embedded icon.png"). Copied verbatim
// (byte-for-byte) to `web/public/photo-fallback-icon.png` for this port.
// ---------------------------------------------------------------------------

let fallbackIconBytes: Buffer | null = null;

export async function getFallbackIconBytes(): Promise<Buffer> {
  if (!fallbackIconBytes) {
    fallbackIconBytes = await readFile(path.join(process.cwd(), "public", "photo-fallback-icon.png"));
  }
  return fallbackIconBytes;
}
