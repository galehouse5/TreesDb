/**
 * Snapshot manifest I/O + a few small pure helpers extracted for unit
 * testing (doc 07 §4's `capture.ts` writes `snapshots/<category>/
 * manifest.json`; this reads it back for `verify.ts`).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Mirrors capture.ts's private `ManifestEntry` (not exported there). */
export interface ManifestEntry {
  url: string;
  status: number;
  contentType: string | null;
  sha256: string;
  capturedAt: string;
  savePathBase: string;
}

export async function loadManifest(snapshotsDir: string, category: string): Promise<ManifestEntry[]> {
  const manifestPath = path.join(snapshotsDir, category, "manifest.json");
  const raw = await readFile(manifestPath, "utf-8");
  return JSON.parse(raw) as ManifestEntry[];
}

/**
 * Splits manifest entries into ones the legacy site itself served
 * successfully (status < 400 - worth fetching/comparing against the new
 * app) vs. ones that were already an error on the legacy side (doc: "skip
 * legacy artifacts whose captured status was 404/500 ... do NOT fetch or
 * fail them"). Generalized from the doc's "404/500" examples to any >= 400
 * status, since any legacy error status is equally "nothing to compare
 * against" - a captured 403/502/etc. is exactly as uninformative as a
 * 404/500 for parity purposes.
 */
export function partitionByLegacyStatus<T extends { status: number }>(entries: T[]): { ok: T[]; legacyErrors: T[] } {
  const ok: T[] = [];
  const legacyErrors: T[] = [];
  for (const e of entries) {
    (e.status >= 400 ? legacyErrors : ok).push(e);
  }
  return { ok, legacyErrors };
}

/** Applies `--filter <substring>` (matched against the legacy URL) and `--limit N`, in that order. */
export function applyFilterAndLimit<T extends { url: string }>(entries: T[], filter?: string, limit?: number): T[] {
  const filtered = filter ? entries.filter((e) => e.url.includes(filter)) : entries;
  return limit != null ? filtered.slice(0, limit) : filtered;
}

/** Recovers the `unitsPreference` cookie value from a savePathBase, per capture.ts's `urlToSavePathBase` convention: `--Meters`/`--Yards` appended as the final suffix (Feet/Default are never suffixed - implicit). */
export function inferUnitsPreference(savePathBase: string): "Meters" | "Yards" | undefined {
  const m = /--(Meters|Yards)$/.exec(savePathBase);
  return m ? (m[1] as "Meters" | "Yards") : undefined;
}
