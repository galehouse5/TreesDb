#!/usr/bin/env tsx
/**
 * verify-derived.ts - doc 07 §7.2 derived-data parity comparator (P0-07).
 * Run with `pnpm tsx web/parity/data/verify-derived.ts [options]`.
 *
 * Options:
 *   --derived <dir>        directory of committed derived-object dumps
 *                           (default ../snapshots/derived)
 *   --dumps <dir>           directory of raw table dumps, used ONLY for the
 *                           recompute-check's ground truth (Computed* columns
 *                           on sites/states) - default ../dumps (gitignored)
 *   --database-url <url>    Postgres connection string (default $DATABASE_URL)
 *   --report                write web/parity/reports/derived-<date>.{json,md}
 *   --skip-recompute        skip the "set stale -> recompute -> compare"
 *                           step (useful if --dumps isn't available)
 *
 * Wiring: web/db/queries/*.sql.ts (task P0-05) already exists and is landed
 * by the time this task started, so this CLI calls the real query functions
 * directly (measuredSpecies/measuredSpeciesBySite/measuredSpeciesByState,
 * siteMetrics/stateMetrics, measurerActivity, searchSites/searchStates/
 * searchMeasuredSpecies, recomputeStaleMetrics) against a live Postgres
 * connection - no stub/adapter layer needed for THAT part. The comparison
 * logic itself (derived.ts) is still fully decoupled and unit-tested
 * independent of any DB (deliverable requirement), and is additionally
 * exercised end-to-end against a PGlite fixture in verify-derived.test.ts.
 *
 * Cannot be run against real production data in this environment (no live
 * dump, no reachable Postgres, and `web/parity/snapshots/derived/*.csv`
 * haven't been captured yet - they land at P0-03 dump time, run by the repo
 * owner against Azure SQL).
 */
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

import { parseCsvRecords } from "./csv";
import type { Diff } from "./comparator";
import { compareRow } from "./comparator";
import { TABLE_SPECS } from "./tables";
import {
  compareMeasuredSpeciesRows,
  compareMeasurerActivityRows,
  compareMetricsRows,
  compareSearchIdRankRows,
  compareSearchSpeciesRows,
  decodeSearchTermToken,
  parseMeasuredSpeciesRecord,
  parseMeasurerActivityRecord,
  parseMetricsRecord,
  parseSearchRecord,
} from "./derived";
import { buildReport, writeReport } from "./report";
import { loadWaivers, type Waiver } from "./waivers";
import type { SqlTag } from "../../db/queries/sql-tag";
import { measuredSpecies, measuredSpeciesBySite, measuredSpeciesByState } from "../../db/queries/measured-species.sql";
import { siteMetrics, stateMetrics } from "../../db/queries/metrics.sql";
import { measurerActivity } from "../../db/queries/measurer-activity.sql";
import { searchMeasuredSpecies, searchSites, searchStates } from "../../db/queries/search.sql";
import { recomputeStaleMetrics } from "../../db/recompute";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DERIVED_DIR = path.join(SCRIPT_DIR, "..", "snapshots", "derived");
const DEFAULT_DUMPS_DIR = path.join(SCRIPT_DIR, "..", "dumps");
const DEFAULT_REPORTS_DIR = path.join(SCRIPT_DIR, "..", "reports");
const WAIVERS_PATH = path.join(SCRIPT_DIR, "..", "waivers.md");

interface Args {
  derivedDir: string;
  dumpsDir: string;
  databaseUrl?: string;
  report: boolean;
  skipRecompute: boolean;
}

function parseCliArgs(argv: string[]): Args {
  const { values } = parseArgs({
    args: argv,
    options: {
      derived: { type: "string", default: DEFAULT_DERIVED_DIR },
      dumps: { type: "string", default: DEFAULT_DUMPS_DIR },
      "database-url": { type: "string" },
      report: { type: "boolean", default: false },
      "skip-recompute": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });
  return {
    derivedDir: path.resolve(String(values.derived)),
    dumpsDir: path.resolve(String(values.dumps)),
    databaseUrl: values["database-url"] ? String(values["database-url"]) : process.env.DATABASE_URL,
    report: Boolean(values.report),
    skipRecompute: Boolean(values["skip-recompute"]),
  };
}

async function readAllRecords(filePath: string): Promise<Record<string, string | null>[]> {
  const out: Record<string, string | null>[] = [];
  for await (const r of parseCsvRecords(filePath)) out.push(r);
  return out;
}

interface RunResult {
  diffs: Diff[];
  checksRun: number;
}

async function verifyMeasuredSpeciesViews(derivedDir: string, sql: SqlTag): Promise<RunResult> {
  const diffs: Diff[] = [];
  let checksRun = 0;

  const globalPath = path.join(derivedDir, "measured_species.csv");
  if (existsSync(globalPath)) {
    const dumpRows = (await readAllRecords(globalPath)).map((r) => parseMeasuredSpeciesRecord(r, "global"));
    const newRows = await measuredSpecies(sql);
    diffs.push(...compareMeasuredSpeciesRows("measured_species", dumpRows, newRows));
    checksRun += Math.max(dumpRows.length, newRows.length);
  } else {
    console.warn(`  ! skipping measured_species: ${globalPath} not found`);
  }

  const sitePath = path.join(derivedDir, "measured_species_by_site.csv");
  if (existsSync(sitePath)) {
    const dumpRows = (await readAllRecords(sitePath)).map((r) => parseMeasuredSpeciesRecord(r, "site"));
    const newRows = await measuredSpeciesBySite(undefined, sql);
    diffs.push(...compareMeasuredSpeciesRows("measured_species_by_site", dumpRows, newRows, "siteId"));
    checksRun += Math.max(dumpRows.length, newRows.length);
  } else {
    console.warn(`  ! skipping measured_species_by_site: ${sitePath} not found`);
  }

  const statePath = path.join(derivedDir, "measured_species_by_state.csv");
  if (existsSync(statePath)) {
    const dumpRows = (await readAllRecords(statePath)).map((r) => parseMeasuredSpeciesRecord(r, "state"));
    const newRows = await measuredSpeciesByState(undefined, sql);
    diffs.push(...compareMeasuredSpeciesRows("measured_species_by_state", dumpRows, newRows, "stateId"));
    checksRun += Math.max(dumpRows.length, newRows.length);
  } else {
    console.warn(`  ! skipping measured_species_by_state: ${statePath} not found`);
  }

  return { diffs, checksRun };
}

async function verifyMetrics(derivedDir: string, sql: SqlTag): Promise<RunResult> {
  const diffs: Diff[] = [];
  let checksRun = 0;

  const sitePath = path.join(derivedDir, "site_metrics.csv");
  if (existsSync(sitePath)) {
    const dumpRows = (await readAllRecords(sitePath)).map((r) => parseMetricsRecord(r, "site"));
    const newRows = await siteMetrics(undefined, sql);
    diffs.push(...compareMetricsRows("site_metrics", dumpRows, newRows, "siteId"));
    checksRun += Math.max(dumpRows.length, newRows.length);
  } else {
    console.warn(`  ! skipping site_metrics: ${sitePath} not found`);
  }

  const statePath = path.join(derivedDir, "state_metrics.csv");
  if (existsSync(statePath)) {
    const dumpRows = (await readAllRecords(statePath)).map((r) => parseMetricsRecord(r, "state"));
    const newRows = await stateMetrics(undefined, sql);
    diffs.push(...compareMetricsRows("state_metrics", dumpRows, newRows, "stateId"));
    checksRun += Math.max(dumpRows.length, newRows.length);
  } else {
    console.warn(`  ! skipping state_metrics: ${statePath} not found`);
  }

  return { diffs, checksRun };
}

async function verifyMeasurerActivity(derivedDir: string, sql: SqlTag): Promise<RunResult> {
  const filePath = path.join(derivedDir, "measurer_activity.csv");
  if (!existsSync(filePath)) {
    console.warn(`  ! skipping measurer_activity: ${filePath} not found`);
    return { diffs: [], checksRun: 0 };
  }
  const dumpRows = (await readAllRecords(filePath)).map(parseMeasurerActivityRecord);
  const newRows = await measurerActivity(sql);
  return {
    diffs: compareMeasurerActivityRows("measurer_activity", dumpRows, newRows),
    checksRun: Math.max(dumpRows.length, newRows.length),
  };
}

async function verifySearch(derivedDir: string, sql: SqlTag): Promise<RunResult> {
  const diffs: Diff[] = [];
  let checksRun = 0;
  if (!existsSync(derivedDir)) return { diffs, checksRun };

  const files = await readdir(derivedDir);
  for (const file of files) {
    const m = /^search_(sites|states|measured_species)__(.+)\.csv$/.exec(file);
    if (!m) continue;
    const [, kind, token] = m;
    const term = decodeSearchTermToken(token!);
    const dumpRows = (await readAllRecords(path.join(derivedDir, file))).map(parseSearchRecord);

    if (kind === "sites") {
      const newRows = await searchSites(term, sql);
      diffs.push(...compareSearchIdRankRows(`search_sites/${term}`, dumpRows, newRows));
    } else if (kind === "states") {
      const newRows = await searchStates(term, sql);
      diffs.push(...compareSearchIdRankRows(`search_states/${term}`, dumpRows, newRows));
    } else {
      const newRows = await searchMeasuredSpecies(term, sql);
      diffs.push(...compareSearchSpeciesRows(`search_measured_species/${term}`, dumpRows, newRows));
    }
    checksRun += dumpRows.length;
  }
  return { diffs, checksRun };
}

/**
 * doc §7.2: "compare Computed* columns on Sites/States after running the new
 * recompute job from scratch (set all stale -> recompute -> compare against
 * dumped Computed* values)". Ground truth is the RAW table dump (sites.csv/
 * states.csv), not the derived snapshot - those Computed* values are exactly
 * what the legacy dump captured pre-migration.
 */
async function verifyRecompute(dumpsDir: string, sql: SqlTag): Promise<RunResult> {
  const sitesCsv = path.join(dumpsDir, "sites.csv");
  const statesCsv = path.join(dumpsDir, "states.csv");
  if (!existsSync(sitesCsv) || !existsSync(statesCsv)) {
    console.warn(`  ! skipping recompute check: ${sitesCsv} / ${statesCsv} not found`);
    return { diffs: [], checksRun: 0 };
  }

  await sql`update sites set are_metrics_stale = true`;
  await sql`update states set are_metrics_stale = true`;
  await recomputeStaleMetrics(sql);

  const computedCols = (tableName: "sites" | "states") => TABLE_SPECS[tableName]!.columns.filter((c) => c.db.startsWith("computed_"));

  const diffs: Diff[] = [];
  let checksRun = 0;

  const siteRows = await sql<{ id: number } & Record<string, unknown>>`select * from sites`;
  const siteRowMap = new Map(siteRows.map((r) => [Number(r.id), r as Record<string, unknown>]));
  for (const dumpRecord of await readAllRecords(sitesCsv)) {
    const id = Number(dumpRecord.Id);
    const dbRow = siteRowMap.get(id);
    if (!dbRow) continue;
    diffs.push(...compareRow("sites", id, dumpRecord, dbRow, computedCols("sites")));
    checksRun += 1;
  }

  const stateRows = await sql<{ id: number } & Record<string, unknown>>`select * from states`;
  const stateRowMap = new Map(stateRows.map((r) => [Number(r.id), r as Record<string, unknown>]));
  for (const dumpRecord of await readAllRecords(statesCsv)) {
    const id = Number(dumpRecord.Id);
    const dbRow = stateRowMap.get(id);
    if (!dbRow) continue;
    diffs.push(...compareRow("states", id, dumpRecord, dbRow, computedCols("states")));
    checksRun += 1;
  }

  return { diffs, checksRun };
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.databaseUrl) {
    throw new Error("verify-derived.ts: no database URL - pass --database-url or set DATABASE_URL");
  }

  const pg = postgres(args.databaseUrl, { max: 1, prepare: false });
  const sql = pg as unknown as SqlTag;

  try {
    const allDiffs: Diff[] = [];
    let totalChecks = 0;

    for (const runner of [
      () => verifyMeasuredSpeciesViews(args.derivedDir, sql),
      () => verifyMetrics(args.derivedDir, sql),
      () => verifyMeasurerActivity(args.derivedDir, sql),
      () => verifySearch(args.derivedDir, sql),
    ]) {
      const { diffs, checksRun } = await runner();
      allDiffs.push(...diffs);
      totalChecks += checksRun;
    }

    if (!args.skipRecompute) {
      const { diffs, checksRun } = await verifyRecompute(args.dumpsDir, sql);
      allDiffs.push(...diffs);
      totalChecks += checksRun;
    }

    console.log(`\nverify-derived.ts: ${totalChecks} checks run, ${allDiffs.length} diff(s) found.`);

    let waivers: Waiver[] = [];
    if (existsSync(WAIVERS_PATH)) waivers = loadWaivers(WAIVERS_PATH);
    const summary = buildReport({ category: "derived", checksRun: totalChecks, diffs: allDiffs, waivers });

    if (args.report) {
      const { jsonPath, mdPath } = await writeReport(DEFAULT_REPORTS_DIR, summary);
      console.log(`Report written: ${jsonPath}\n              : ${mdPath}`);
    }
    console.log(`pass=${summary.pass} fail=${summary.fail} waived=${summary.waived}`);

    if (summary.fail > 0) process.exitCode = 1;
  } finally {
    await pg.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exitCode = 1;
});
