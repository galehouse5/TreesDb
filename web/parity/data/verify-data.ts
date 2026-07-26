#!/usr/bin/env tsx
/**
 * verify-data.ts - doc 07 §7.1 dump-based data-parity comparator (P0-06).
 * Run with `pnpm tsx web/parity/data/verify-data.ts [options]`.
 *
 * Options:
 *   --dumps <dir>         directory of legacy table dumps (default ../dumps,
 *                          i.e. web/parity/dumps/ - GITIGNORED, PII)
 *   --table <name>        compare only this table (repeatable-ish: pass once;
 *                          default: all 17 tables in ALL_TABLES)
 *   --database-url <url>  Postgres connection string (default: $DATABASE_URL)
 *   --report               write web/parity/reports/data-<date>.{json,md}
 *
 * Implements checks 1-6 of doc 07 §7.1 per table via comparator.ts's
 * `compareTable` (row counts, PK set equality, field-by-field diff,
 * aggregate cross-check, FK orphan check, species-hash recompute for
 * trees/tree_measurements). `users` is compared in full (per doc: "Users
 * compared fully (including hash bytes)") but its report entry is redacted
 * to aggregates only (report.ts's `redactTables`).
 *
 * This tool cannot be exercised against real production data in this
 * environment (no live dump, no reachable Postgres) - its correctness is
 * covered by comparator.test.ts / verify-data.test.ts using hand-built CSV
 * fixtures and a PGlite database seeded to match/mismatch (doc task brief).
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import type { CsvValue } from "./csv";
import { parseCsvRecords } from "./csv";
import { compareTable, type Diff } from "./comparator";
import { postgresAdapter, loadTableAsMap, loadIdSet, type DbAdapter } from "./db-adapter";
import { buildReport, writeReport } from "./report";
import { loadWaivers, type Waiver } from "./waivers";
import { ALL_TABLES, PII_REDACTED_TABLES, PK_CSV, TABLE_SPECS } from "./tables";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DUMPS_DIR = path.join(SCRIPT_DIR, "..", "dumps");
const DEFAULT_REPORTS_DIR = path.join(SCRIPT_DIR, "..", "reports");
const WAIVERS_PATH = path.join(SCRIPT_DIR, "..", "waivers.md");

interface Args {
  dumpsDir: string;
  table?: string;
  databaseUrl?: string;
  report: boolean;
}

function parseCliArgs(argv: string[]): Args {
  const { values } = parseArgs({
    args: argv,
    options: {
      dumps: { type: "string", default: DEFAULT_DUMPS_DIR },
      table: { type: "string" },
      "database-url": { type: "string" },
      report: { type: "boolean", default: false },
    },
    allowPositionals: false,
  });
  return {
    dumpsDir: path.resolve(String(values.dumps)),
    table: values.table ? String(values.table) : undefined,
    databaseUrl: values["database-url"] ? String(values["database-url"]) : process.env.DATABASE_URL,
    report: Boolean(values.report),
  };
}

interface ManifestJson {
  tables?: Record<string, number>;
}

async function loadManifest(dumpsDir: string): Promise<ManifestJson> {
  const manifestPath = path.join(dumpsDir, "manifest.json");
  if (!existsSync(manifestPath)) return {};
  return JSON.parse(await readFile(manifestPath, "utf-8")) as ManifestJson;
}

async function loadDumpAsMap(dumpsDir: string, tableName: string): Promise<Map<number, Record<string, CsvValue>>> {
  const csvPath = path.join(dumpsDir, `${tableName}.csv`);
  if (!existsSync(csvPath)) {
    throw new Error(`verify-data.ts: dump file not found: ${csvPath} (run dump-legacy.ps1 first, or pass --dumps)`);
  }
  const map = new Map<number, Record<string, CsvValue>>();
  for await (const record of parseCsvRecords(csvPath)) {
    const idValue = record[PK_CSV];
    if (idValue === null) throw new Error(`verify-data.ts: ${tableName}.csv has a row with NULL ${PK_CSV}`);
    map.set(Number(idValue), record);
  }
  return map;
}

async function verifyTable(
  adapter: DbAdapter,
  dumpsDir: string,
  manifest: ManifestJson,
  tableName: string,
  referencedIdSets: Map<string, ReadonlySet<number>>,
): Promise<{ diffs: Diff[]; checksRun: number }> {
  const spec = TABLE_SPECS[tableName];
  if (!spec) throw new Error(`verify-data.ts: unknown table ${JSON.stringify(tableName)}`);

  console.log(`-- ${tableName} --`);
  const [dumpRows, dbRows] = await Promise.all([
    loadDumpAsMap(dumpsDir, tableName),
    loadTableAsMap(adapter, tableName),
  ]);

  const result = compareTable(spec, dumpRows, dbRows, manifest.tables?.[tableName], referencedIdSets);
  console.log(`   dump=${dumpRows.size} db=${dbRows.size} diffs=${result.diffs.length} checks=${result.checksRun}`);
  return result;
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.databaseUrl) {
    throw new Error("verify-data.ts: no database URL - pass --database-url or set DATABASE_URL");
  }

  const tables = args.table ? [args.table] : [...ALL_TABLES];
  for (const t of tables) {
    if (!TABLE_SPECS[t]) throw new Error(`verify-data.ts: unknown --table ${JSON.stringify(t)}. Known: ${ALL_TABLES.join(", ")}`);
  }

  const manifest = await loadManifest(args.dumpsDir);
  const adapter = postgresAdapter(args.databaseUrl);

  try {
    // Pre-load every referenced table's id set once, for the FK orphan check (§7.1.6),
    // reusing across all tables being checked this run rather than re-querying per FK column.
    const referencedTableNames = new Set<string>();
    for (const t of tables) {
      for (const col of TABLE_SPECS[t]!.columns) if (col.fk) referencedTableNames.add(col.fk);
    }
    const referencedIdSets = new Map<string, ReadonlySet<number>>();
    for (const t of referencedTableNames) {
      referencedIdSets.set(t, await loadIdSet(adapter, t));
    }

    const allDiffs: Diff[] = [];
    let totalChecks = 0;
    for (const tableName of tables) {
      const { diffs, checksRun } = await verifyTable(adapter, args.dumpsDir, manifest, tableName, referencedIdSets);
      allDiffs.push(...diffs);
      totalChecks += checksRun;
    }

    console.log(`\nverify-data.ts: ${totalChecks} checks run, ${allDiffs.length} diff(s) found across ${tables.length} table(s).`);

    let waivers: Waiver[] = [];
    if (existsSync(WAIVERS_PATH)) waivers = loadWaivers(WAIVERS_PATH);
    const summary = buildReport({
      category: "data",
      checksRun: totalChecks,
      diffs: allDiffs,
      waivers,
      redactTables: [...PII_REDACTED_TABLES],
    });

    if (args.report) {
      const { jsonPath, mdPath } = await writeReport(DEFAULT_REPORTS_DIR, summary);
      console.log(`Report written: ${jsonPath}\n              : ${mdPath}`);
    }
    console.log(`pass=${summary.pass} fail=${summary.fail} waived=${summary.waived}`);

    if (summary.fail > 0) {
      process.exitCode = 1;
    }
  } finally {
    await adapter.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exitCode = 1;
});
