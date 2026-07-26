/**
 * migrate-photos.ts — P0-09 photo blob migration.
 *
 * Copies every photo blob referenced by the (already-migrated) Postgres
 * `photos` table from its legacy store into Cloudflare R2, one object per
 * photo at key `photos/{id}`, with Content-Type derived from the `format`
 * column. The `photos` table is the source of truth for *which* ids should
 * exist — this script never trusts directory/container listings for that.
 *
 * This file contains no PII: it only ever logs integer ids, byte counts,
 * and object keys, never user/caption/email data.
 *
 * PREREQUISITES
 *   - The `photos` table must already be loaded into Postgres (P0-04 ETL).
 *   - DATABASE_URL must point at that (migrated) database.
 *   - R2 credentials must be set: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 *     R2_SECRET_ACCESS_KEY, R2_BUCKET (see web/.env.example).
 *   - For `--source azure-blob` only, also set (these are migration-only,
 *     legacy-side credentials and intentionally NOT in .env.example):
 *       AZURE_BLOB_CONTAINER_URL=https://<account>.blob.core.windows.net/photo-store
 *       AZURE_BLOB_SAS=<container-level SAS query string, with or without leading "?">
 *     (Read + List permissions are enough.)
 *
 * USAGE
 *   Copy the legacy PhotoStore/ directory onto this machine first, then:
 *     pnpm exec tsx scripts/migrate-photos.ts --source dir --dir "E:\PhotoStoreCopy"
 *
 *   Or migrate straight from the production Azure Blob container:
 *     pnpm exec tsx scripts/migrate-photos.ts --source azure-blob
 *
 *   Useful flags (either source):
 *     --skip-existing   HEAD each R2 key first; skip upload if already present
 *                        (upload is otherwise idempotent anyway — PutObject
 *                        overwrites the same key — this just saves time/cost
 *                        on a re-run).
 *     --dry-run          Do everything except the actual R2 PutObject call.
 *     --concurrency N     Promise-pool size (default 4).
 *     --verify            After migrating, also run the verification pass
 *                          (R2 vs DB counts, byte-length sample check).
 *     --verify-only        Skip the migrate step; only run verification
 *                           against whatever is already in R2.
 *     --sample-size N      Verification sample size (default 50).
 *     --seed N              Seed for the verification sample's PRNG, so a
 *                            re-run against the same DB samples the same ids
 *                            (default 42).
 *
 *   Every run (unless --verify-only with nothing to report) writes
 *   web/parity/reports/photo-migration-<date>.json and prints a summary.
 *
 * PHOTO FORMAT → CONTENT-TYPE
 *   `PhotoFormat` enum (TMD.Model/Photos/IPhoto.cs:6-12):
 *     0 NotSpecified, 1 Jpeg, 2 Gif, 3 Png
 *   Content-Type mapping (TMD.Model/Photos/Photo.cs:27-39, the `ContentType`
 *   getter): Jpeg -> image/jpeg, Gif -> image/gif, Png -> image/png.
 *   NotSpecified(0) is rejected by legacy validation
 *   (`[NotEquals(PhotoFormat.NotSpecified...)]`, Photo.cs:24) so it should
 *   never appear in the DB for a persisted photo; if it (or any other
 *   unrecognized value) somehow does, we log a warning and fall back to
 *   application/octet-stream rather than dropping the row.
 *
 * SOURCE BLOB LAYOUT
 *   Both stores (TMD.Model/Photos/DefaultPhotoStoreProvider.cs and
 *   Tmd.WindowsAzure/BlobStoragePhotoStoreProvider.cs) key blobs by bare
 *   `{photoId}` with no extension and no other structure — that's exactly
 *   the shape assumed here (`dir` source: file named `{id}` directly under
 *   the given directory; `azure-blob` source: blob named `{id}` directly in
 *   the container).
 *
 * MISSING-FROM-SOURCE PHOTOS
 *   Legacy silently served an embedded fallback icon when a blob file was
 *   absent (`DefaultPhotoStoreProvider.GetReadStream`, line 40-47) — so a row
 *   existing in the DB doesn't guarantee a blob exists in the store. Any such
 *   id is recorded in the report's `missingIds` and logged; it does NOT fail
 *   the run (per P0-09 acceptance criteria — the repo owner reviews the
 *   list).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSql } from "../db/index";

// ---------------------------------------------------------------------------
// PhotoFormat (TMD.Model/Photos/IPhoto.cs:6-12) -> Content-Type
// (TMD.Model/Photos/Photo.cs:27-39)
// ---------------------------------------------------------------------------

const PHOTO_FORMAT_CONTENT_TYPE: Record<number, string> = {
  1: "image/jpeg", // PhotoFormat.Jpeg
  2: "image/gif", // PhotoFormat.Gif
  3: "image/png", // PhotoFormat.Png
};
const FALLBACK_CONTENT_TYPE = "application/octet-stream";

function contentTypeForFormat(format: number): string {
  const ct = PHOTO_FORMAT_CONTENT_TYPE[format];
  if (!ct) {
    console.warn(
      `[migrate-photos] unexpected photos.format=${format} (expected 1=Jpeg, 2=Gif, 3=Png) — using ${FALLBACK_CONTENT_TYPE}`,
    );
    return FALLBACK_CONTENT_TYPE;
  }
  return ct;
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface CliArgs {
  source: "dir" | "azure-blob";
  dir?: string;
  skipExisting: boolean;
  dryRun: boolean;
  verify: boolean;
  verifyOnly: boolean;
  concurrency: number;
  sampleSize: number;
  seed: number;
  help: boolean;
}

function printHelp(): void {
  console.log(`Usage:
  tsx scripts/migrate-photos.ts --source dir --dir <path> [options]
  tsx scripts/migrate-photos.ts --source azure-blob [options]

Options:
  --skip-existing     HEAD R2 before upload; skip if the key already exists
  --dry-run           Do everything except the R2 PutObject call
  --concurrency N     Promise-pool size (default 4)
  --verify            Also run the verification pass after migrating
  --verify-only       Skip migration; only run the verification pass
  --sample-size N     Verification sample size (default 50)
  --seed N            Seed for the verification sample RNG (default 42)
  --help              Show this message

See the header comment in this file for required environment variables.`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    source: undefined as unknown as CliArgs["source"],
    skipExisting: false,
    dryRun: false,
    verify: false,
    verifyOnly: false,
    concurrency: 4,
    sampleSize: 50,
    seed: 42,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--source": {
        const value = argv[++i];
        if (value !== "dir" && value !== "azure-blob") {
          throw new Error(`--source must be "dir" or "azure-blob", got ${JSON.stringify(value)}`);
        }
        args.source = value;
        break;
      }
      case "--dir":
        args.dir = argv[++i];
        break;
      case "--skip-existing":
        args.skipExisting = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--verify":
        args.verify = true;
        break;
      case "--verify-only":
        args.verifyOnly = true;
        args.verify = true;
        break;
      case "--concurrency": {
        const n = Number(argv[++i]);
        if (Number.isFinite(n) && n >= 1) args.concurrency = Math.floor(n);
        break;
      }
      case "--sample-size": {
        const n = Number(argv[++i]);
        if (Number.isFinite(n) && n >= 0) args.sampleSize = Math.floor(n);
        break;
      }
      case "--seed": {
        const n = Number(argv[++i]);
        if (Number.isFinite(n)) args.seed = Math.floor(n);
        break;
      }
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg} (--help for usage)`);
    }
  }

  if (!args.help) {
    if (!args.source) throw new Error(`--source is required: "dir" or "azure-blob" (--help for usage)`);
    if (args.source === "dir" && !args.dir) {
      throw new Error(`--source dir requires --dir <path to copied PhotoStore/ directory>`);
    }
  }

  return args;
}

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

interface Env {
  DATABASE_URL: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
  AZURE_BLOB_CONTAINER_URL?: string;
  AZURE_BLOB_SAS?: string;
}

function loadEnv(source: CliArgs["source"]): Env {
  const missing: string[] = [];
  const need = (name: string): string => {
    const v = process.env[name];
    if (!v) missing.push(name);
    return v ?? "";
  };

  const DATABASE_URL = need("DATABASE_URL");
  const R2_ACCOUNT_ID = need("R2_ACCOUNT_ID");
  const R2_ACCESS_KEY_ID = need("R2_ACCESS_KEY_ID");
  const R2_SECRET_ACCESS_KEY = need("R2_SECRET_ACCESS_KEY");
  const R2_BUCKET = need("R2_BUCKET");

  let AZURE_BLOB_CONTAINER_URL: string | undefined;
  let AZURE_BLOB_SAS: string | undefined;
  if (source === "azure-blob") {
    AZURE_BLOB_CONTAINER_URL = need("AZURE_BLOB_CONTAINER_URL");
    AZURE_BLOB_SAS = need("AZURE_BLOB_SAS");
  }

  if (missing.length > 0) {
    const lines = [
      `Missing required environment variable(s): ${missing.join(", ")}.`,
      `Set DATABASE_URL and the R2_* vars in web/.env.local (see web/.env.example).`,
    ];
    if (source === "azure-blob" && (missing.includes("AZURE_BLOB_CONTAINER_URL") || missing.includes("AZURE_BLOB_SAS"))) {
      lines.push(
        `AZURE_BLOB_CONTAINER_URL / AZURE_BLOB_SAS are legacy-side migration-only`,
        `credentials and are intentionally not in .env.example. Set them in`,
        `web/.env.local or your shell, e.g.:`,
        `  AZURE_BLOB_CONTAINER_URL=https://<account>.blob.core.windows.net/photo-store`,
        `  AZURE_BLOB_SAS=sv=...&ss=b&...   (container-level Read+List SAS, no leading "?" needed)`,
      );
    }
    throw new Error(lines.join("\n"));
  }

  return {
    DATABASE_URL,
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    AZURE_BLOB_CONTAINER_URL,
    AZURE_BLOB_SAS,
  };
}

// ---------------------------------------------------------------------------
// Photo sources
// ---------------------------------------------------------------------------

interface PhotoSource {
  describe(): string;
  /** Cheap existence check — does not necessarily transfer the blob bytes. */
  exists(id: number): Promise<boolean>;
  /** Fetch raw bytes for a photo id; null if missing from the source (the
   *  legacy-fallback-icon case — see header comment). */
  fetch(id: number): Promise<Buffer | null>;
}

class DirPhotoSource implements PhotoSource {
  constructor(private readonly rootPath: string) {}

  describe(): string {
    return `dir:${this.rootPath}`;
  }

  private blobPath(id: number): string {
    return path.join(this.rootPath, String(id));
  }

  async exists(id: number): Promise<boolean> {
    try {
      await fs.access(this.blobPath(id));
      return true;
    } catch {
      return false;
    }
  }

  async fetch(id: number): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.blobPath(id));
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, "&");
}

class AzureBlobPhotoSource implements PhotoSource {
  private readonly containerUrl: string;
  private readonly sas: string;
  private namesPromise: Promise<Set<string>> | null = null;

  constructor(containerUrl: string, sas: string) {
    this.containerUrl = containerUrl.replace(/\/$/, "");
    this.sas = sas.replace(/^\?/, "");
  }

  describe(): string {
    return `azure-blob:${this.containerUrl}`;
  }

  /**
   * List all blob names in the container via the REST "List Blobs" API
   * (https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs),
   * paging via <NextMarker>. Minimal regex-based XML parsing (no XML
   * dependency available) — sufficient because blob names here are always
   * bare integers, never containing markup characters.
   */
  private listNames(): Promise<Set<string>> {
    if (!this.namesPromise) this.namesPromise = this.listNamesUncached();
    return this.namesPromise;
  }

  private async listNamesUncached(): Promise<Set<string>> {
    const names = new Set<string>();
    let marker = "";
    for (;;) {
      const qs = new URLSearchParams({ restype: "container", comp: "list" });
      if (marker) qs.set("marker", marker);
      const url = `${this.containerUrl}?${qs.toString()}&${this.sas}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Azure list blobs failed: HTTP ${res.status} ${res.statusText} — check AZURE_BLOB_CONTAINER_URL/AZURE_BLOB_SAS`,
        );
      }
      const xml = await res.text();
      for (const m of xml.matchAll(/<Name>([^<]*)<\/Name>/g)) {
        names.add(decodeXmlEntities(m[1]));
      }
      const nextMatch = xml.match(/<NextMarker>([^<]*)<\/NextMarker>/);
      const next = nextMatch?.[1] ?? "";
      if (!next) break;
      marker = next;
    }
    return names;
  }

  async exists(id: number): Promise<boolean> {
    const names = await this.listNames();
    return names.has(String(id));
  }

  async fetch(id: number): Promise<Buffer | null> {
    if (!(await this.exists(id))) return null;
    const url = `${this.containerUrl}/${encodeURIComponent(String(id))}?${this.sas}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Azure blob GET ${id} failed: HTTP ${res.status} ${res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }
}

// ---------------------------------------------------------------------------
// R2 (S3-compatible) destination
// ---------------------------------------------------------------------------

function r2Key(id: number): string {
  return `photos/${id}`;
}

function createR2Client(env: Env): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function isNotFoundError(err: unknown): boolean {
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } } | undefined;
  return e?.name === "NotFound" || e?.$metadata?.httpStatusCode === 404;
}

async function r2Head(client: S3Client, bucket: string, key: string): Promise<{ exists: boolean; contentLength?: number }> {
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { exists: true, contentLength: res.ContentLength };
  } catch (err) {
    if (isNotFoundError(err)) return { exists: false };
    throw err;
  }
}

async function r2Put(client: S3Client, bucket: string, key: string, body: Buffer, contentType: string): Promise<void> {
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

/**
 * Lists objects under the `photos/` prefix, restricted to top-level
 * `photos/{id}` keys (a plain integer id, no further path segments). This
 * intentionally excludes any future per-size variant keys the app may write
 * later (doc 01 §11 D-008: `photos/{id}/{size}`), so a count comparison
 * against the DB stays meaningful regardless of when this script is run
 * relative to that feature landing.
 */
async function r2ListPhotoKeys(client: S3Client, bucket: string): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const topLevelKey = /^photos\/\d+$/;
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: "photos/", ContinuationToken: token }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key && topLevelKey.test(obj.Key) && obj.Size != null) {
        result.set(obj.Key, obj.Size);
      }
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return result;
}

// ---------------------------------------------------------------------------
// Concurrency helper — simple promise pool
// ---------------------------------------------------------------------------

async function runPool<T>(items: readonly T[], concurrency: number, worker: (item: T, index: number) => Promise<void>): Promise<void> {
  let next = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length) || 1);
  const runners = Array.from({ length: workerCount }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) for a reproducible verification sample
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleIds(ids: readonly number[], n: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const pool = [...ids];
  const sample: number[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    sample.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return sample;
}

// ---------------------------------------------------------------------------
// Migration pass
// ---------------------------------------------------------------------------

interface PhotoRow {
  id: number;
  bytes: number;
  format: number;
}

interface MigrationStats {
  dbTotal: number;
  uploaded: number;
  skippedExisting: number;
  missingFromSource: number[];
  errors: { id: number; error: string }[];
}

async function migrate(
  rows: readonly PhotoRow[],
  source: PhotoSource,
  r2: S3Client,
  bucket: string,
  args: CliArgs,
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    dbTotal: rows.length,
    uploaded: 0,
    skippedExisting: 0,
    missingFromSource: [],
    errors: [],
  };

  let processed = 0;
  const logProgress = () => {
    processed++;
    if (processed % 25 === 0 || processed === rows.length) {
      console.log(
        `[migrate-photos] ${processed}/${rows.length} processed ` +
          `(uploaded=${stats.uploaded} skipped=${stats.skippedExisting} ` +
          `missing=${stats.missingFromSource.length} errors=${stats.errors.length})`,
      );
    }
  };

  await runPool(rows, args.concurrency, async (row) => {
    try {
      const key = r2Key(row.id);

      if (args.skipExisting) {
        const head = await r2Head(r2, bucket, key);
        if (head.exists) {
          stats.skippedExisting++;
          return;
        }
      }

      const blob = await source.fetch(row.id);
      if (blob === null) {
        stats.missingFromSource.push(row.id);
        return;
      }

      if (!args.dryRun) {
        await r2Put(r2, bucket, key, blob, contentTypeForFormat(row.format));
      }
      stats.uploaded++;
    } catch (err) {
      stats.errors.push({ id: row.id, error: err instanceof Error ? err.message : String(err) });
    } finally {
      logProgress();
    }
  });

  stats.missingFromSource.sort((a, b) => a - b);
  return stats;
}

// ---------------------------------------------------------------------------
// Verification pass
// ---------------------------------------------------------------------------

interface SampleCheck {
  id: number;
  dbBytes: number;
  r2Bytes: number | null;
  match: boolean;
}

interface VerifyResult {
  dbCount: number;
  r2Count: number;
  countsMatch: boolean;
  sampleChecks: SampleCheck[];
  missingFromSource: number[];
}

async function verify(
  rows: readonly PhotoRow[],
  source: PhotoSource,
  r2: S3Client,
  bucket: string,
  args: CliArgs,
): Promise<VerifyResult> {
  console.log(`[migrate-photos] verify: listing R2 objects under photos/ ...`);
  const r2Keys = await r2ListPhotoKeys(r2, bucket);
  const dbCount = rows.length;
  const r2Count = r2Keys.size;

  const rowsById = new Map(rows.map((r) => [r.id, r] as const));
  const sampledIds = sampleIds(
    rows.map((r) => r.id),
    args.sampleSize,
    args.seed,
  );
  const sampleChecks: SampleCheck[] = sampledIds.map((id) => {
    const row = rowsById.get(id)!;
    const r2Bytes = r2Keys.get(r2Key(id)) ?? null;
    return { id, dbBytes: row.bytes, r2Bytes, match: r2Bytes === row.bytes };
  });

  console.log(`[migrate-photos] verify: checking source-store presence for ${rows.length} id(s)...`);
  const missingFromSource: number[] = [];
  let checked = 0;
  await runPool(rows, args.concurrency, async (row) => {
    const present = await source.exists(row.id);
    if (!present) missingFromSource.push(row.id);
    checked++;
    if (checked % 25 === 0 || checked === rows.length) {
      console.log(`[migrate-photos] verify: source presence ${checked}/${rows.length} checked`);
    }
  });
  missingFromSource.sort((a, b) => a - b);

  return {
    dbCount,
    r2Count,
    countsMatch: dbCount === r2Count,
    sampleChecks,
    missingFromSource,
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

interface Report {
  startedAt: string;
  finishedAt: string;
  mode: "migrate" | "migrate+verify" | "verify-only";
  source: { type: CliArgs["source"]; location: string };
  dryRun: boolean;
  skipExisting: boolean;
  counts: {
    dbTotal: number;
    uploaded: number | null;
    skippedExisting: number | null;
    errors: number | null;
    r2Total: number | null;
    countsMatch: boolean | null;
  };
  missingIds: number[];
  sampleChecks: SampleCheck[];
  errors: { id: number; error: string }[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const env = loadEnv(args.source);
  const r2 = createR2Client(env);
  const source: PhotoSource =
    args.source === "dir" ? new DirPhotoSource(args.dir!) : new AzureBlobPhotoSource(env.AZURE_BLOB_CONTAINER_URL!, env.AZURE_BLOB_SAS!);

  const sql = getSql();
  const startedAt = new Date().toISOString();

  console.log(
    `[migrate-photos] source=${source.describe()} bucket=${env.R2_BUCKET} ` +
      `dryRun=${args.dryRun} skipExisting=${args.skipExisting} verify=${args.verify} verifyOnly=${args.verifyOnly}`,
  );

  let rows: PhotoRow[];
  try {
    rows = await sql<PhotoRow[]>`select id, bytes, format from photos order by id`;
  } catch (err) {
    throw new Error(
      `Failed to query the "photos" table — has the DB migration (P0-04) run yet? ` +
        `Underlying error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  console.log(`[migrate-photos] ${rows.length} photo row(s) in DB`);

  let migrationStats: MigrationStats | null = null;
  if (!args.verifyOnly) {
    migrationStats = await migrate(rows, source, r2, env.R2_BUCKET, args);
    console.log(
      `[migrate-photos] migration complete: uploaded=${migrationStats.uploaded} ` +
        `skippedExisting=${migrationStats.skippedExisting} ` +
        `missingFromSource=${migrationStats.missingFromSource.length} errors=${migrationStats.errors.length}`,
    );
  }

  let verifyResult: VerifyResult | null = null;
  if (args.verify) {
    verifyResult = await verify(rows, source, r2, env.R2_BUCKET, args);
    const sampleMismatches = verifyResult.sampleChecks.filter((c) => !c.match).length;
    console.log(
      `[migrate-photos] verify: dbCount=${verifyResult.dbCount} r2Count=${verifyResult.r2Count} ` +
        `countsMatch=${verifyResult.countsMatch} sampleChecked=${verifyResult.sampleChecks.length} ` +
        `sampleMismatches=${sampleMismatches} missingFromSource=${verifyResult.missingFromSource.length}`,
    );
  }

  const finishedAt = new Date().toISOString();

  const missingIds = Array.from(
    new Set<number>([...(migrationStats?.missingFromSource ?? []), ...(verifyResult?.missingFromSource ?? [])]),
  ).sort((a, b) => a - b);

  const mode: Report["mode"] = args.verifyOnly ? "verify-only" : args.verify ? "migrate+verify" : "migrate";

  const report: Report = {
    startedAt,
    finishedAt,
    mode,
    source: { type: args.source, location: source.describe() },
    dryRun: args.dryRun,
    skipExisting: args.skipExisting,
    counts: {
      dbTotal: rows.length,
      uploaded: migrationStats?.uploaded ?? null,
      skippedExisting: migrationStats?.skippedExisting ?? null,
      errors: migrationStats?.errors.length ?? null,
      r2Total: verifyResult?.r2Count ?? null,
      countsMatch: verifyResult?.countsMatch ?? null,
    },
    missingIds,
    sampleChecks: verifyResult?.sampleChecks ?? [],
    errors: migrationStats?.errors ?? [],
  };

  const reportsDir = path.join(__dirname, "..", "parity", "reports");
  await fs.mkdir(reportsDir, { recursive: true });
  const dateStr = startedAt.slice(0, 10);
  const reportPath = path.join(reportsDir, `photo-migration-${dateStr}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`[migrate-photos] report written to ${reportPath}`);
  console.log(
    `[migrate-photos] SUMMARY: dbTotal=${rows.length} uploaded=${report.counts.uploaded ?? "-"} ` +
      `skipped=${report.counts.skippedExisting ?? "-"} missingFromSource=${missingIds.length} ` +
      `errors=${report.counts.errors ?? "-"} r2Total=${report.counts.r2Total ?? "-"} ` +
      `countsMatch=${report.counts.countsMatch ?? "-"}`,
  );
  if (missingIds.length > 0) {
    console.log(`[migrate-photos] ids missing from source store (legacy served fallback icon): ${missingIds.join(", ")}`);
  }

  await sql.end({ timeout: 5 });

  if ((migrationStats?.errors.length ?? 0) > 0) {
    console.error(`[migrate-photos] completed with ${migrationStats!.errors.length} error(s) — see the report for details.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`[migrate-photos] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
  process.exitCode = 1;
});
