/**
 * migrate-data.ts — P0-04 ETL load.
 *
 * Loads the P0-03 legacy CSV dumps (web/parity/dumps/<table>.csv, one file
 * per migrated table, filename == Postgres table name; see
 * web/scripts/dump-legacy.sql / .ps1, read-only to this task) into Postgres,
 * in FK-dependency order, preserving every legacy Id verbatim.
 *
 * DUMP CSV FORMAT (produced by P0-03; this loader assumes it exactly - see
 * scripts/etl/csv.ts's header comment and dump-legacy.ps1's own comments):
 *   - Header row present, RFC4180 quoting, CRLF, UTF-8 no BOM.
 *   - Every field double-quoted with `""` escaping, EXCEPT a true SQL NULL,
 *     which is written as a bare UNQUOTED 4-character `NULL` token. A real
 *     empty string is `""` (quoted), never bare/unquoted. This is exactly
 *     Postgres's own `COPY ... CSV NULL 'NULL'` convention, so the
 *     production path below streams dump files straight into
 *     `COPY ... WITH (FORMAT csv, HEADER true, NULL 'NULL')` with zero
 *     re-serialization - NULL-vs-empty-string is resolved natively by
 *     Postgres's own CSV reader, not by any JS parsing.
 *   - Reals: 17-digit round-trip decimal strings (no rounding is done here
 *     or should ever be - Postgres's `real` input parser reads the string
 *     directly). Datetimes: ISO 8601 with no UTC offset (SQL Server style
 *     126) - D-002 says the legacy wall-clock value already IS UTC, so
 *     these are reinterpreted explicitly as UTC on load (see
 *     scripts/etl/load-table.ts `castExpr`), never via ambient session tz.
 *   - `photo_references.csv` has 9 columns (no Caption - Photos.References
 *     never had that column in the legacy DB); schema.ts's new nullable
 *     `caption` column is always loaded as SQL NULL (scripts/etl/tables.ts
 *     `pgOnlyColumns`).
 *
 * IDENTITY / OVERRIDING SYSTEM VALUE: every target table's `id` is
 * `generated always as identity`, and legacy Ids must be replayed verbatim
 * (so redirects, exports, and cross-references stay stable). COPY has no
 * `OVERRIDING SYSTEM VALUE` clause, so each table's dump first lands in a
 * same-session TEMP staging table (all-text columns; also where hex->bytea
 * and naive-datetime->UTC-timestamptz conversions happen), then
 * `INSERT ... OVERRIDING SYSTEM VALUE SELECT <casts> FROM staging` moves it
 * into the real table. See scripts/etl/load-table.ts for the full
 * rationale and every SQL string this produces.
 *
 * USAGE
 *   pnpm exec tsx scripts/migrate-data.ts                    # load all 17 tables, FK order
 *   pnpm exec tsx scripts/migrate-data.ts --table sites       # load just one table
 *   pnpm exec tsx scripts/migrate-data.ts --reset              # TRUNCATE ... CASCADE first, then reload
 *   pnpm exec tsx scripts/migrate-data.ts --dry-run             # parse CSVs + report counts, no DB writes/connection
 *   pnpm exec tsx scripts/migrate-data.ts --dumps-dir <path>     # override web/parity/dumps
 *
 * After a real (non-dry-run) load, this also: validates every FK (orphan
 * check, doc 07 §7.1 #6), `setval`s every identity sequence past its max
 * loaded Id, and runs `ANALYZE`. A JSON report is written to
 * web/parity/reports/etl-load-<date>.json.
 *
 * PREREQUISITES: DATABASE_URL set (web/.env.local); dumps present under
 * --dumps-dir (default web/parity/dumps/, gitignored - P0-03 output).
 */

import { createReadStream, existsSync } from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import "dotenv/config";
import { getSql } from "../db/index";
import {
  readCsvHeaderFromFile,
  streamCsvRows,
  type CsvRow,
} from "./etl/csv";
import { makePostgresExecutor, type SqlExecutor } from "./etl/executor";
import {
  buildAnalyzeSql,
  buildOrphanCheckSql,
  buildSetvalSql,
  buildTruncateSql,
  loadTable,
  quoteIdent,
  type LoadTableResult,
  type ResolvedColumn,
} from "./etl/load-table";
import { expectedRowCount, readManifest, type DumpManifest } from "./etl/manifest";
import { FOREIGN_KEYS, LOAD_ORDER, TABLES } from "./etl/tables";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface CliArgs {
  reset: boolean;
  table?: string;
  dryRun: boolean;
  dumpsDir?: string;
  help: boolean;
}

function printHelp(): void {
  console.log(`Usage: tsx scripts/migrate-data.ts [options]

Options:
  --table <name>     Load only this table (must be one of the 17 migrated
                      tables; see scripts/etl/tables.ts LOAD_ORDER)
  --reset             TRUNCATE ... CASCADE the table(s) in scope before loading
  --dry-run           Parse CSVs and report row counts only; no DB connection
  --dumps-dir <path>   Override the dumps directory (default web/parity/dumps)
  --help              Show this message

See the header comment in this file for the dump CSV format this assumes.`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { reset: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--table":
        args.table = argv[++i];
        break;
      case "--reset":
        args.reset = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--dumps-dir":
        args.dumpsDir = argv[++i];
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg} (--help for usage)`);
    }
  }
  if (args.table && !TABLES[args.table]) {
    throw new Error(
      `--table "${args.table}" is not a known table. Known tables: ${LOAD_ORDER.join(", ")}`,
    );
  }
  return args;
}

// ---------------------------------------------------------------------------
// Dry run: parse CSVs, report counts, no DB
// ---------------------------------------------------------------------------

async function countCsvDataRows(filePath: string): Promise<number> {
  let count = -1; // the header row doesn't count as data
  for await (const row of streamCsvRows(filePath) as AsyncGenerator<CsvRow>) {
    if (row.length > 0) count++;
  }
  return Math.max(count, 0);
}

async function dryRun(
  dumpsDir: string,
  tables: string[],
  manifest: DumpManifest | null,
): Promise<void> {
  console.log(`[migrate-data] --dry-run: parsing CSVs under ${dumpsDir} (no DB connection)`);
  if (!manifest) {
    console.warn(
      `[migrate-data] no manifest.json found at ${path.join(dumpsDir, "manifest.json")} — row-count cross-check will be skipped`,
    );
  }

  let anyMismatch = false;
  for (const table of tables) {
    const csvPath = path.join(dumpsDir, `${table}.csv`);
    if (!existsSync(csvPath)) {
      console.error(`[migrate-data]   ${table}: MISSING (${csvPath})`);
      anyMismatch = true;
      continue;
    }
    const header = await readCsvHeaderFromFile(csvPath);
    const rowCount = await countCsvDataRows(csvPath);
    const expected = expectedRowCount(manifest, table);
    const matchStr =
      expected === null ? "" : expected === rowCount ? " (matches manifest)" : ` (MISMATCH vs manifest ${expected})`;
    if (expected !== null && expected !== rowCount) anyMismatch = true;
    console.log(
      `[migrate-data]   ${table}: ${rowCount} row(s), ${header.length} column(s)${matchStr}`,
    );
  }

  if (anyMismatch) {
    console.error(`[migrate-data] dry-run found missing file(s) or row-count mismatch(es) — see above.`);
    process.exitCode = 1;
  } else {
    console.log(`[migrate-data] dry-run OK.`);
  }
}

// ---------------------------------------------------------------------------
// Production staging-fill strategy: raw COPY, no JS-side row parsing
// ---------------------------------------------------------------------------

function makeCopyFillStrategy(
  sql: ReturnType<typeof getSql>,
  csvPath: string,
): (staging: string, columns: ResolvedColumn[]) => Promise<void> {
  return async (staging, columns) => {
    const colList = columns.map((c) => quoteIdent(c.pg)).join(", ");
    const copySql = `COPY ${quoteIdent(staging)} (${colList}) FROM STDIN WITH (FORMAT csv, HEADER true, NULL 'NULL')`;
    const writable = await sql.unsafe(copySql).writable();
    await pipeline(createReadStream(csvPath), writable);
  };
}

// ---------------------------------------------------------------------------
// Post-load validation
// ---------------------------------------------------------------------------

interface OrphanCheckResult {
  table: string;
  column: string;
  refTable: string;
  orphans: number;
}

async function runOrphanChecks(
  executor: SqlExecutor,
  tables: string[],
): Promise<OrphanCheckResult[]> {
  const scoped = FOREIGN_KEYS.filter((fk) => tables.includes(fk.table));
  const results: OrphanCheckResult[] = [];
  for (const fk of scoped) {
    const res = await executor.query<{ orphans: number }>(
      buildOrphanCheckSql(fk.table, fk.column, fk.refTable),
    );
    results.push({
      table: fk.table,
      column: fk.column,
      refTable: fk.refTable,
      orphans: Number(res.rows[0]?.orphans ?? 0),
    });
  }
  return results;
}

async function setvalSequences(
  executor: SqlExecutor,
  tables: string[],
): Promise<void> {
  for (const table of tables) {
    await executor.query(buildSetvalSql(table));
  }
}

async function analyzeTables(
  executor: SqlExecutor,
  tables: string[],
): Promise<void> {
  for (const table of tables) {
    await executor.query(buildAnalyzeSql(table));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface Report {
  startedAt: string;
  finishedAt: string;
  dumpsDir: string;
  reset: boolean;
  tablesLoaded: string[];
  loadResults: LoadTableResult[];
  orphanChecks: OrphanCheckResult[];
  errors: string[];
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const dumpsDir = args.dumpsDir
    ? path.resolve(args.dumpsDir)
    : path.join(__dirname, "..", "parity", "dumps");
  const manifest = readManifest(path.join(dumpsDir, "manifest.json"));
  const tablesToLoad = args.table
    ? LOAD_ORDER.filter((t) => t === args.table)
    : LOAD_ORDER;

  if (args.dryRun) {
    await dryRun(dumpsDir, tablesToLoad, manifest);
    return;
  }

  const startedAt = new Date().toISOString();
  const sql = getSql();
  const executor = makePostgresExecutor(sql);
  const errors: string[] = [];

  console.log(
    `[migrate-data] loading ${tablesToLoad.length} table(s) from ${dumpsDir} (reset=${args.reset})`,
  );

  if (args.reset) {
    // Truncate in one statement across the full scope — a single
    // multi-table TRUNCATE handles FK ordering itself via CASCADE, so no
    // need to sequence it manually. RESTART IDENTITY resets the sequence
    // to 1 before reload; setvalSequences() below moves it past the
    // reloaded max Id regardless.
    await executor.query(
      buildTruncateSql(tablesToLoad, { restartIdentity: true }),
    );
    console.log(`[migrate-data] reset: truncated ${tablesToLoad.join(", ")}`);
  }

  const loadResults: LoadTableResult[] = [];
  for (const tableName of tablesToLoad) {
    const table = TABLES[tableName]!;
    const csvPath = path.join(dumpsDir, `${tableName}.csv`);
    if (!existsSync(csvPath)) {
      const msg = `Missing dump CSV for table "${tableName}": ${csvPath}`;
      errors.push(msg);
      console.error(`[migrate-data]   ${msg}`);
      break; // FK order means later tables would fail anyway; stop here.
    }

    const header = await readCsvHeaderFromFile(csvPath);
    console.log(`[migrate-data]   loading ${tableName} ...`);
    try {
      const result = await loadTable({
        executor,
        table,
        header,
        fill: makeCopyFillStrategy(sql, csvPath),
        expectedRowCount: expectedRowCount(manifest, tableName),
      });
      loadResults.push(result);
      const matchStr =
        result.rowCountMatches === null
          ? ""
          : result.rowCountMatches
            ? " (matches manifest)"
            : ` (MISMATCH: manifest says ${result.expectedRowCount})`;
      console.log(
        `[migrate-data]     ${tableName}: ${result.insertedRowCount} row(s) loaded${matchStr}`,
      );
      if (result.rowCountMatches === false) {
        errors.push(
          `${tableName}: row count ${result.insertedRowCount} != manifest ${result.expectedRowCount}`,
        );
      }
    } catch (err) {
      const msg = `Failed loading ${tableName}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[migrate-data]   ${msg}`);
      break;
    }
  }

  const successfullyLoaded = loadResults.map((r) => r.table);

  console.log(`[migrate-data] validating foreign keys...`);
  const orphanChecks = await runOrphanChecks(executor, successfullyLoaded);
  for (const check of orphanChecks) {
    if (check.orphans > 0) {
      const msg = `FK orphan(s): ${check.table}.${check.column} -> ${check.refTable}: ${check.orphans} row(s) with no matching parent`;
      errors.push(msg);
      console.error(`[migrate-data]   ${msg}`);
    }
  }
  if (orphanChecks.every((c) => c.orphans === 0)) {
    console.log(`[migrate-data]   all ${orphanChecks.length} FK constraint(s) clean`);
  }

  console.log(`[migrate-data] setval-ing identity sequences...`);
  await setvalSequences(executor, successfullyLoaded);

  console.log(`[migrate-data] ANALYZE...`);
  await analyzeTables(executor, successfullyLoaded);

  const finishedAt = new Date().toISOString();

  const report: Report = {
    startedAt,
    finishedAt,
    dumpsDir,
    reset: args.reset,
    tablesLoaded: successfullyLoaded,
    loadResults,
    orphanChecks,
    errors,
  };

  const reportsDir = path.join(__dirname, "..", "parity", "reports");
  await fsp.mkdir(reportsDir, { recursive: true });
  const dateStr = startedAt.slice(0, 10);
  const reportPath = path.join(reportsDir, `etl-load-${dateStr}.json`);
  await fsp.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`[migrate-data] report written to ${reportPath}`);

  console.log(
    `[migrate-data] SUMMARY: ${successfullyLoaded.length}/${tablesToLoad.length} table(s) loaded, ${errors.length} error(s)`,
  );

  await sql.end({ timeout: 5 });

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(
    `[migrate-data] fatal: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  process.exitCode = 1;
});
