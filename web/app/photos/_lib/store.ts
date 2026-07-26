/**
 * Photo blob store provider for the P1-12 `/photos/{id}/{size}` route
 * (doc 01 §11, doc 03 P1-12), mirroring legacy's pluggable
 * `IPhotoStoreProvider` (`TMD.Model/Photos/PhotoStoreProvider.cs`) --
 * `DefaultPhotoStoreProvider` (local disk) in dev/self-hosted legacy, or
 * `BlobStoragePhotoStoreProvider` (Azure) in production (the dump
 * manifest's `"photoProvider": "PhotoStore"` confirms the actual legacy
 * production deployment used the local/default provider, not Azure Blob).
 *
 * New app (D-008, doc 01 §11): originals live in R2 at key `photos/{id}`
 * (same key convention as `scripts/migrate-photos.ts`, which is the
 * migration-time bulk uploader for this same bucket/key scheme). This
 * module only READS `photos/{id}` on demand -- no write-back variant
 * caching (`photos/{id}/{size}`) is implemented here; that belongs to a
 * later phase's upload flow (doc 01 §11 mentions it, but P1 is read-only
 * per doc 03's ground rules) and is left as a TODO.
 *
 * The R2 branch is only active when all four `R2_*` env vars are present
 * (matching `scripts/migrate-photos.ts`'s `Env` contract); otherwise every
 * fetch is treated as "missing", which drives the same fallback-icon path
 * legacy takes for a missing on-disk blob (`DefaultPhotoStoreProvider.
 * GetReadStream`) -- appropriate for this task's environment, since
 * `photos`/`photo_references` have zero rows in the current production
 * dump (see this task's report) and R2 is not wired up yet.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export interface PhotoStoreProvider {
  /** Returns the original photo's bytes, or `null` if missing / the store isn't configured. */
  fetchOriginal(photoId: number): Promise<Buffer | null>;
}

function r2Key(id: number): string {
  return `photos/${id}`;
}

interface R2Env {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function readR2Env(): R2Env | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function isNotFoundError(err: unknown): boolean {
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } } | undefined;
  return e?.name === "NotFound" || e?.name === "NoSuchKey" || e?.$metadata?.httpStatusCode === 404;
}

class R2PhotoStoreProvider implements PhotoStoreProvider {
  private client: S3Client;
  private bucket: string;

  constructor(env: R2Env) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
    });
    this.bucket = env.bucket;
  }

  async fetchOriginal(photoId: number): Promise<Buffer | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: r2Key(photoId) }),
      );
      const bytes = await res.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch (err) {
      if (isNotFoundError(err)) return null;
      throw err;
    }
  }
}

/** Always reports "missing" -- drives the same fallback-icon path as a missing legacy on-disk blob. */
class AlwaysMissingPhotoStoreProvider implements PhotoStoreProvider {
  async fetchOriginal(): Promise<Buffer | null> {
    return null;
  }
}

export function createPhotoStoreProvider(): PhotoStoreProvider {
  const env = readR2Env();
  return env ? new R2PhotoStoreProvider(env) : new AlwaysMissingPhotoStoreProvider();
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
