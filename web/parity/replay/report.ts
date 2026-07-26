/**
 * Report writer for the replay-parity harness (doc 07 §8, doc 05 §P3-02).
 * Mirrors parity/data/report.ts's shape (pass/fail counts, JSON + Markdown,
 * capped diff listing) adapted to "one check per trip" rather than "one
 * check per table row" -- doc's own gate framing ("100% of trips replay
 * clean or carry an investigated, named waiver") is per-trip, not per-field.
 *
 * Size discipline (task brief: "no 50MB reports"): a PASSING trip's record
 * is just `{tripId, status, ms}`; only FAILING/erroring trips carry their
 * full diff list, capped at `MAX_DIFFS_PER_TRIP` each.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FieldDiff } from "./natural-keys";
import type { StructuredDiff } from "./differ";

export type TripStatus = "pass" | "fail" | "engine-error";

export interface TripResult {
  tripId: number;
  status: TripStatus;
  ms: number;
  diffCount: number;
  /** Present only for fail/engine-error -- capped at MAX_DIFFS_PER_TRIP. */
  diffs?: StructuredDiff[];
  globalCountDiffs?: FieldDiff[];
  error?: string;
}

export interface ReplaySummary {
  generatedAt: string;
  replayDb: string;
  totalTrips: number;
  pass: number;
  fail: number;
  engineErrors: number;
  durationMs: number;
  results: TripResult[];
}

export const MAX_DIFFS_PER_TRIP = 40;

export function summarize(replayDb: string, results: TripResult[], durationMs: number, now: () => Date = () => new Date()): ReplaySummary {
  let pass = 0;
  let fail = 0;
  let engineErrors = 0;
  for (const r of results) {
    if (r.status === "pass") pass++;
    else if (r.status === "fail") fail++;
    else engineErrors++;
  }
  return {
    generatedAt: now().toISOString(),
    replayDb,
    totalTrips: results.length,
    pass,
    fail,
    engineErrors,
    durationMs,
    results,
  };
}

function renderMarkdown(summary: ReplaySummary): string {
  const lines: string[] = [];
  lines.push("# Replay-parity report", "");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Replay database: \`${summary.replayDb}\``);
  lines.push(`Duration: ${(summary.durationMs / 1000).toFixed(1)}s`, "");
  lines.push(`| total trips | pass | fail | engine errors |`);
  lines.push(`|---|---|---|---|`);
  lines.push(`| ${summary.totalTrips} | ${summary.pass} | ${summary.fail} | ${summary.engineErrors} |`, "");

  const failing = summary.results.filter((r) => r.status !== "pass");
  if (failing.length === 0) {
    lines.push("All trips replayed clean.", "");
  } else {
    lines.push(`## Failing / errored trips (${failing.length})`, "");
    for (const r of failing) {
      lines.push(`### Trip ${r.tripId} — ${r.status} (${r.diffCount} diff(s), ${r.ms}ms)`, "");
      if (r.error) lines.push(`Engine error: \`${r.error}\``, "");
      if (r.globalCountDiffs && r.globalCountDiffs.length > 0) {
        lines.push("Global count diffs:");
        for (const d of r.globalCountDiffs) lines.push(`- **${d.field}**: expected ${d.expected}, actual ${d.actual}`);
        lines.push("");
      }
      if (r.diffs && r.diffs.length > 0) {
        for (const d of r.diffs) {
          const fieldPart = d.field ? ` field \`${d.field}\`: expected ${JSON.stringify(d.expected)}, actual ${JSON.stringify(d.actual)}` : "";
          lines.push(`- \`${d.kind}\` **${d.entity}** ${d.identity}${fieldPart}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

export async function writeReport(reportsDir: string, summary: ReplaySummary, dateOverride?: string): Promise<{ jsonPath: string; mdPath: string }> {
  const date = dateOverride ?? summary.generatedAt.slice(0, 10);
  const base = `replay-${date}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const mdPath = path.join(reportsDir, `${base}.md`);

  await mkdir(reportsDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf-8");
  await writeFile(mdPath, renderMarkdown(summary), "utf-8");

  return { jsonPath, mdPath };
}

/** For `--skip-passed`: loads a prior checkpoint/report and returns the set of trip ids that already passed. */
export async function loadPassedTripIds(checkpointPath: string): Promise<Set<number>> {
  try {
    const raw = await readFile(checkpointPath, "utf-8");
    const parsed = JSON.parse(raw) as ReplaySummary;
    return new Set(parsed.results.filter((r) => r.status === "pass").map((r) => r.tripId));
  } catch {
    return new Set();
  }
}

/** Prior results (all statuses) from a checkpoint, keyed by tripId -- used to carry forward passed trips' minimal records when `--skip-passed` re-runs only the rest. */
export async function loadCheckpointResults(checkpointPath: string): Promise<Map<number, TripResult>> {
  try {
    const raw = await readFile(checkpointPath, "utf-8");
    const parsed = JSON.parse(raw) as ReplaySummary;
    return new Map(parsed.results.map((r) => [r.tripId, r]));
  } catch {
    return new Map();
  }
}
