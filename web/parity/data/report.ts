/**
 * Shared report writer for verify-data.ts (§7.1) and verify-derived.ts
 * (§7.2), per doc 07 §1.5 / §9: writes
 * `web/parity/reports/<category>-<YYYY-MM-DD>.json` (pass/fail/waived
 * counts + first 50 diffs verbatim) plus a Markdown summary alongside, and
 * loads waivers.md to bucket waived diffs separately from failures.
 *
 * "Checks" accounting convention (since doc §1.5 asks for pass/fail/waived
 * *counts*, and the comparator core produces a flat Diff[] rather than an
 * explicit pass list): callers pass `checksRun`, the total number of
 * individual checks attempted (row-count check, PK-set check, one
 * field-diff check per row, one aggregate check per numeric/FK column, one
 * FK-orphan check per FK column, one species-hash check per trees/
 * tree_measurements row - see comparator.ts's `compareTable`, which returns
 * this count alongside its diffs). `pass = checksRun - fail - waived`; a
 * single row with three field diffs still counts as one failed check (its
 * row-diff check), with all three Diffs listed under it.
 *
 * PII rule (doc 07 §7.1): for tables named in `redactTables` (i.e. `users`),
 * every diff except "row-count" and "aggregate" kinds has its id/field/
 * expected/actual stripped before being written to the committed report -
 * emails, password hashes, and tokens must never appear in
 * web/parity/reports/.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Diff } from "./comparator";
import { findApplicableWaiver, type Waiver } from "./waivers";

export interface WaivedDiff {
  waiverId: string;
  diff: Diff;
}

export interface ReportSummary {
  category: string;
  generatedAt: string;
  checksRun: number;
  pass: number;
  fail: number;
  waived: number;
  /** First 50 unwaived diffs, verbatim (post PII redaction). */
  diffs: Diff[];
  /** First 50 waived diffs, verbatim (post PII redaction). */
  waivedDiffs: WaivedDiff[];
}

const MAX_LISTED_DIFFS = 50;

function redactDiff(d: Diff): Diff {
  if (d.kind === "row-count" || d.kind === "aggregate") return d;
  return {
    kind: d.kind,
    table: d.table,
    message: `[redacted: PII table] a "${d.kind}" diff occurred - see local (gitignored) dump comparison output for detail, not committed here.`,
  };
}

export interface BuildReportParams {
  category: string;
  checksRun: number;
  diffs: Diff[];
  waivers: Waiver[];
  /** Table names (case-insensitive) whose non-aggregate diffs get redacted before being written (doc §7.1 PII rule). */
  redactTables?: string[];
  /** Overrides `new Date().toISOString()` - tests only, keeps report generation itself deterministic when asserted against. */
  now?: () => Date;
}

export function buildReport(params: BuildReportParams): ReportSummary {
  const redactSet = new Set((params.redactTables ?? []).map((t) => t.toLowerCase()));

  const failDiffs: Diff[] = [];
  const waivedDiffs: WaivedDiff[] = [];

  for (const d of params.diffs) {
    const waiver = findApplicableWaiver(d, params.category, params.waivers);
    const redacted = redactSet.has(d.table.toLowerCase()) ? redactDiff(d) : d;
    if (waiver) waivedDiffs.push({ waiverId: waiver.id, diff: redacted });
    else failDiffs.push(redacted);
  }

  const fail = failDiffs.length;
  const waived = waivedDiffs.length;
  const pass = Math.max(0, params.checksRun - fail - waived);
  const now = params.now ? params.now() : new Date();

  return {
    category: params.category,
    generatedAt: now.toISOString(),
    checksRun: params.checksRun,
    pass,
    fail,
    waived,
    diffs: failDiffs.slice(0, MAX_LISTED_DIFFS),
    waivedDiffs: waivedDiffs.slice(0, MAX_LISTED_DIFFS),
  };
}

function renderMarkdown(summary: ReportSummary): string {
  const lines: string[] = [];
  lines.push(`# Parity report: ${summary.category}`, "");
  lines.push(`Generated: ${summary.generatedAt}`, "");
  lines.push(`| checks run | pass | fail | waived |`);
  lines.push(`|---|---|---|---|`);
  lines.push(`| ${summary.checksRun} | ${summary.pass} | ${summary.fail} | ${summary.waived} |`, "");

  if (summary.diffs.length > 0) {
    lines.push(`## Failures (first ${summary.diffs.length})`, "");
    for (const d of summary.diffs) lines.push(`- \`${d.kind}\` **${d.table}**: ${d.message}`);
    lines.push("");
  } else {
    lines.push("No unwaived failures.", "");
  }

  if (summary.waivedDiffs.length > 0) {
    lines.push(`## Waived (first ${summary.waivedDiffs.length})`, "");
    for (const { waiverId, diff: d } of summary.waivedDiffs) {
      lines.push(`- \`${d.kind}\` **${d.table}** [${waiverId}]: ${d.message}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function writeReport(
  reportsDir: string,
  summary: ReportSummary,
): Promise<{ jsonPath: string; mdPath: string }> {
  const date = summary.generatedAt.slice(0, 10);
  const base = `${summary.category}-${date}`;
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const mdPath = path.join(reportsDir, `${base}.md`);

  await mkdir(reportsDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf-8");
  await writeFile(mdPath, renderMarkdown(summary), "utf-8");

  return { jsonPath, mdPath };
}
