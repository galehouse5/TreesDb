/**
 * Reads web/parity/dumps/manifest.json (written by P0-03's dump-legacy.ps1)
 * so the loader can cross-check post-load row counts against the dump's own
 * recorded counts. Optional: the loader must still work (with a warning) if
 * the manifest is absent, since a hand-assembled dumps/ directory (e.g. in
 * local testing) may not have one.
 */
import { existsSync, readFileSync } from "node:fs";

export interface DumpManifest {
  server?: string;
  database?: string;
  dumpStartedUtc?: string;
  dumpFinishedUtc?: string;
  photoProvider?: string;
  csvNullConvention?: string;
  tables?: Record<string, number>;
  derived?: Record<string, number>;
  searchRowCounts?: Record<string, number>;
}

export function readManifest(manifestPath: string): DumpManifest | null {
  if (!existsSync(manifestPath)) return null;
  // Strip a UTF-8 BOM if present -- Windows PowerShell 5.1's
  // `Set-Content -Encoding UTF8` (used by dump-legacy.ps1 historically)
  // always writes one, and JSON.parse rejects it.
  const raw = readFileSync(manifestPath, "utf8").replace(/^﻿/, "");
  return JSON.parse(raw) as DumpManifest;
}

/** Expected row count for `table` per the manifest, or `null` if unknown
 * (manifest missing, or table not listed in it). */
export function expectedRowCount(
  manifest: DumpManifest | null,
  table: string,
): number | null {
  const count = manifest?.tables?.[table];
  return typeof count === "number" ? count : null;
}
