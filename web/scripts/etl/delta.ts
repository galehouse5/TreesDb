/**
 * Delta sync (doc 06 P4-02 `--delta`): brings an already-loaded Postgres
 * up to date with a fresh legacy dump without truncating it.
 *
 * Built to be run over and over, not just once at cutover: each run makes
 * Postgres match the dump it was given, so the new app can be re-compared
 * against live treesdb.org after every fresh dump (Mitch, 2026-11-20). A run
 * against a dump that's already been applied changes nothing and reports
 * zero inserts/updates.
 *
 * Per table, in LOAD_ORDER (parents before children):
 *   1. The dump CSV lands in the same all-text staging table the full load
 *      uses (load-table.ts), filled by the caller's transport (COPY in
 *      production, parameterized INSERTs in tests).
 *   2. It's cast into a typed "incoming" temp table created `LIKE` the real
 *      table, so every value has the target column's exact type (varchar(n),
 *      char(n), real, ...) and compares like-for-like with what's stored.
 *      (LIKE copies column types and NOT NULLs only: no identity, defaults
 *      or FKs.) The id is made its PRIMARY KEY, which also rejects a dump with a
 *      duplicated id.
 *   3. D-016 species whitespace normalization runs on the incoming copy, so
 *      rows that the full load normalized don't show up as "changed" on
 *      every run.
 *   4. Rows whose id isn't in Postgres are INSERTed (OVERRIDING SYSTEM VALUE,
 *      legacy ids kept). Rows whose id is there but whose dump columns
 *      differ (`ROW(...) IS DISTINCT FROM ROW(...)`, so NULLs compare
 *      sanely) are UPDATEd. Only columns that come from the dump are
 *      written; Postgres-only columns (photo_references.caption) are left
 *      alone on update and NULL on insert, as in the full load.
 * After every table is upserted, rows that are in Postgres but not in the
 * dump (deleted on legacy since the last sync, or created only in the new
 * app) are listed per table. They're deleted only when the caller asks
 * (`--apply-deletes`), children first (reverse LOAD_ORDER) so FK checks
 * pass; otherwise they're reported for review, as doc 06 P4-02 specifies.
 *
 * The dump is the source of truth: anything the new app itself wrote that
 * the dump also has an id for gets overwritten. That's intended while the
 * new app is a pre-cutover mirror; once the new app takes real writes, stop
 * syncing (or stop using --apply-deletes).
 *
 * Everything here goes through the generic SqlExecutor, so the same code
 * runs against Neon (postgres.js, inside one transaction - see
 * migrate-data.ts) and PGlite in delta.test.ts.
 */
import type { SqlExecutor } from "./executor";
import {
  buildDropStagingDdl,
  buildStagingDdl,
  castExpr,
  quoteIdent,
  resolveColumns,
  stagingTableName,
  type ResolvedColumn,
} from "./load-table";
import { assertSpeciesSlugUniqueness } from "./species-slug-assert";
import {
  normalizeSpeciesWhitespaceInTable,
  SPECIES_NORMALIZED_TABLES,
} from "./species-normalize";
import type { TableConfig } from "./tables";

/** How many missing ids to list per table in the report. */
export const MISSING_ID_SAMPLE_SIZE = 25;

export function incomingTableName(table: string): string {
  return `etl_incoming_${table}`;
}

export function buildDropIncomingDdl(table: string): string {
  return `DROP TABLE IF EXISTS ${quoteIdent(incomingTableName(table))}`;
}

/** Typed copy of the real table's shape (no identity, no FKs). */
export function buildIncomingDdl(table: string): string {
  return (
    `CREATE TEMP TABLE ${quoteIdent(incomingTableName(table))} ` +
    `(LIKE ${quoteIdent(table)})`
  );
}

export function buildIncomingPkDdl(table: string): string {
  return `ALTER TABLE ${quoteIdent(incomingTableName(table))} ADD PRIMARY KEY (id)`;
}

/** Staging (all text) -> incoming (typed), using the full load's casts. */
export function buildFillIncomingSql(
  table: string,
  columns: ResolvedColumn[],
): string {
  const staging = quoteIdent(stagingTableName(table));
  const cols = columns.map((c) => quoteIdent(c.pg)).join(", ");
  const exprs = columns
    .map((c) => castExpr(c.type, `${staging}.${quoteIdent(c.pg)}`))
    .join(", ");
  return (
    `INSERT INTO ${quoteIdent(incomingTableName(table))} (${cols}) ` +
    `SELECT ${exprs} FROM ${staging}`
  );
}

export function buildInsertNewSql(
  table: TableConfig,
  columns: ResolvedColumn[],
): string {
  const t = quoteIdent(table.name);
  const inc = quoteIdent(incomingTableName(table.name));
  const pgOnly = table.pgOnlyColumns ?? [];
  const targetCols = [
    ...columns.map((c) => quoteIdent(c.pg)),
    ...pgOnly.map(quoteIdent),
  ].join(", ");
  const selectExprs = [
    ...columns.map((c) => `i.${quoteIdent(c.pg)}`),
    ...pgOnly.map(() => "NULL"),
  ].join(", ");
  return (
    `WITH ins AS (` +
    `INSERT INTO ${t} (${targetCols}) OVERRIDING SYSTEM VALUE ` +
    `SELECT ${selectExprs} FROM ${inc} i ` +
    `WHERE NOT EXISTS (SELECT 1 FROM ${t} x WHERE x.id = i.id) ` +
    `RETURNING 1) SELECT count(*)::int AS n FROM ins`
  );
}

export function buildUpdateChangedSql(
  table: TableConfig,
  columns: ResolvedColumn[],
): string | null {
  const t = quoteIdent(table.name);
  const inc = quoteIdent(incomingTableName(table.name));
  const valueCols = columns.filter((c) => c.pg !== "id").map((c) => quoteIdent(c.pg));
  if (valueCols.length === 0) return null;
  const set = valueCols.map((c) => `${c} = i.${c}`).join(", ");
  const current = valueCols.map((c) => `x.${c}`).join(", ");
  const incoming = valueCols.map((c) => `i.${c}`).join(", ");
  return (
    `WITH upd AS (` +
    `UPDATE ${t} AS x SET ${set} FROM ${inc} i ` +
    `WHERE x.id = i.id AND ROW(${current}) IS DISTINCT FROM ROW(${incoming}) ` +
    `RETURNING 1) SELECT count(*)::int AS n FROM upd`
  );
}

export function buildMissingFromDumpSql(table: string): string {
  const t = quoteIdent(table);
  const inc = quoteIdent(incomingTableName(table));
  return (
    `SELECT x.id FROM ${t} x ` +
    `WHERE NOT EXISTS (SELECT 1 FROM ${inc} i WHERE i.id = x.id) ORDER BY x.id`
  );
}

export function buildDeleteMissingSql(table: string): string {
  const t = quoteIdent(table);
  const inc = quoteIdent(incomingTableName(table));
  return (
    `WITH del AS (DELETE FROM ${t} x ` +
    `WHERE NOT EXISTS (SELECT 1 FROM ${inc} i WHERE i.id = x.id) ` +
    `RETURNING 1) SELECT count(*)::int AS n FROM del`
  );
}

export interface DeltaTableResult {
  table: string;
  incomingRowCount: number;
  inserted: number;
  updated: number;
  unchanged: number;
  /** Rows in Postgres whose id isn't in the dump (filled in by findMissing). */
  missingFromDump: number;
  missingIdsSample: number[];
  /** Rows actually deleted (only with --apply-deletes). */
  deleted: number;
  expectedRowCount: number | null;
  rowCountMatches: boolean | null;
}

export interface SyncTableDeltaParams {
  executor: SqlExecutor;
  table: TableConfig;
  header: string[];
  fill: (stagingTable: string, columns: ResolvedColumn[]) => Promise<void>;
  expectedRowCount?: number | null;
}

async function count(executor: SqlExecutor, text: string): Promise<number> {
  const res = await executor.query<{ n: string | number }>(text);
  return Number(res.rows[0]?.n ?? 0);
}

/**
 * Upserts one table from its dump. Leaves the incoming temp table in place
 * (findMissing/deleteMissing need it after every table is upserted); call
 * dropIncoming when the run is done.
 */
export async function syncTableDelta(
  params: SyncTableDeltaParams,
): Promise<DeltaTableResult> {
  const { executor, table, header, fill } = params;
  const columns = resolveColumns(table, header);

  await executor.query(buildDropStagingDdl(table.name));
  await executor.query(buildStagingDdl(table.name, columns));
  await fill(stagingTableName(table.name), columns);

  await executor.query(buildDropIncomingDdl(table.name));
  await executor.query(buildIncomingDdl(table.name));
  await executor.query(buildFillIncomingSql(table.name, columns));
  await executor.query(buildDropStagingDdl(table.name));
  await executor.query(buildIncomingPkDdl(table.name));

  if ((SPECIES_NORMALIZED_TABLES as readonly string[]).includes(table.name)) {
    await normalizeSpeciesWhitespaceInTable(executor, incomingTableName(table.name));
  }

  const incomingRowCount = await count(
    executor,
    `SELECT count(*) AS n FROM ${quoteIdent(incomingTableName(table.name))}`,
  );
  const inserted = await count(executor, buildInsertNewSql(table, columns));
  const updateSql = buildUpdateChangedSql(table, columns);
  const updated = updateSql ? await count(executor, updateSql) : 0;

  if (table.name === "trees") {
    await assertSpeciesSlugUniqueness(executor);
  }

  const expectedRowCount = params.expectedRowCount ?? null;
  return {
    table: table.name,
    incomingRowCount,
    inserted,
    updated,
    unchanged: incomingRowCount - inserted - updated,
    missingFromDump: 0,
    missingIdsSample: [],
    deleted: 0,
    expectedRowCount,
    rowCountMatches:
      expectedRowCount === null ? null : expectedRowCount === incomingRowCount,
  };
}

/** Ids in Postgres that the dump doesn't have, for one synced table. */
export async function findMissing(
  executor: SqlExecutor,
  table: string,
): Promise<number[]> {
  const res = await executor.query<{ id: number }>(buildMissingFromDumpSql(table));
  return res.rows.map((r) => Number(r.id));
}

/** Deletes the rows findMissing would list. Call children before parents. */
export async function deleteMissing(
  executor: SqlExecutor,
  table: string,
): Promise<number> {
  return count(executor, buildDeleteMissingSql(table));
}

export async function dropIncoming(
  executor: SqlExecutor,
  table: string,
): Promise<void> {
  await executor.query(buildDropIncomingDdl(table));
}

/**
 * After every table in `tables` (LOAD_ORDER order) has been upserted: fills
 * in each result's missing-row counts, and with `applyDeletes` deletes those
 * rows children-first. Mutates and returns `results`.
 */
export async function reconcileMissing(
  executor: SqlExecutor,
  results: DeltaTableResult[],
  options: { applyDeletes: boolean },
): Promise<DeltaTableResult[]> {
  for (const result of results) {
    const ids = await findMissing(executor, result.table);
    result.missingFromDump = ids.length;
    result.missingIdsSample = ids.slice(0, MISSING_ID_SAMPLE_SIZE);
  }
  if (options.applyDeletes) {
    for (const result of [...results].reverse()) {
      if (result.missingFromDump > 0) {
        result.deleted = await deleteMissing(executor, result.table);
      }
    }
  }
  return results;
}
