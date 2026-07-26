/**
 * Core "load one table" pipeline, shared by the production CLI
 * (migrate-data.ts, backed by real postgres.js + COPY) and the integration
 * test (backed by PGlite, which has no COPY wire protocol).
 *
 * Why a staging table at all (see doc 02 P0-04 + doc 01 section 2):
 *  1. Every target table's `id` is `generated always as identity`. Loading
 *     legacy Ids verbatim requires `INSERT ... OVERRIDING SYSTEM VALUE`,
 *     which `COPY` cannot express - COPY has no such clause. So the raw
 *     dump data always has to land somewhere COPY *can* write to, and then
 *     get moved into the real table via an INSERT that can specify
 *     OVERRIDING SYSTEM VALUE.
 *  2. Two column types can't be COPY'd directly into their final Postgres
 *     type without corruption:
 *       - `bytea`: the dump's hex encoding has no `\x`/`0x` prefix (SQL
 *         Server `CONVERT(..., 2)` output). Postgres's bytea text-input
 *         parser (`byteain`) would treat an un-prefixed hex string as the
 *         legacy "escape format" and mangle it. Fix: land it in a `text`
 *         staging column, convert with `decode(col, 'hex')` on insert.
 *       - `timestamptz`: the dump's datetimes (`CONVERT(..., 126)`) have no
 *         UTC offset (D-002 - Azure App Service ran UTC, so the *wall
 *         clock* value is UTC, but the text alone doesn't say so). Loading
 *         straight into a `timestamptz` column would have Postgres
 *         interpret the naive string using the session's time zone, which
 *         is fragile (depends on session state the caller might not
 *         control). Fix: land it in `text`, cast explicitly with
 *         `(col::timestamp) AT TIME ZONE 'UTC'`, which is unambiguous
 *         regardless of session settings.
 *  Given (1) already forces a staging step for every table, every staging
 *  column is simply typed `text` uniformly (rather than mixing typed and
 *  untyped staging columns table-by-table) - COPY then never fails on a
 *  type mismatch, and all real validation happens at the INSERT...SELECT
 *  step via explicit CASTs, which raise clear, attributable errors.
 *
 * The COPY vs. staging-INSERT choice of *how data gets into the staging
 * table* is deliberately pluggable (the `fill` callback) so:
 *   - migrate-data.ts (production): fills it by streaming the CSV file
 *     straight into `COPY staging (...) FROM STDIN WITH (FORMAT csv,
 *     HEADER true, NULL 'NULL')` via postgres.js - no re-serialization,
 *     and NULL handling matches the dump's own convention exactly because
 *     it IS Postgres's COPY CSV NULL convention (see csv.ts header comment
 *     and the P0-03 dump tooling's own doc comment).
 *   - migrate-data.test.ts: PGlite exposes no COPY protocol through
 *     postgres.js (or at all, over its in-process query interface), so the
 *     test instead parses a small CSV string with csv.ts and fills the
 *     staging table with plain parameterized `INSERT`s through the same
 *     `SqlExecutor` used everywhere else. This exercises the *exact same*
 *     staging-shape + INSERT...SELECT...OVERRIDING SYSTEM VALUE path the
 *     production loader uses; only the transport differs.
 */
import type { SqlExecutor } from "./executor";
import { assertSpeciesSlugUniqueness } from "./species-slug-assert";
import {
  normalizeSpeciesWhitespace,
  SPECIES_NORMALIZED_TABLES,
  type SpeciesNormalizedTable,
} from "./species-normalize";
import type { ColumnMapping, ColumnType, TableConfig } from "./tables";

export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Resolved column: the legacy CSV header name paired with its config entry,
 * in the CSV's actual column order (not the config's declared order). */
export type ResolvedColumn = ColumnMapping;

/**
 * Match a CSV header row against a table's configured column mappings.
 * Order comes from the header (authoritative - it's what COPY/staging must
 * follow); every header name must have a config entry and vice versa, or
 * this throws with a diagnostic naming the mismatch. This is what makes the
 * loader "drive off the dump header" rather than assuming dump-legacy.sql's
 * column order never changes (P0-03/P0-04 integration note).
 */
export function resolveColumns(
  table: TableConfig,
  header: string[],
): ResolvedColumn[] {
  const byLegacyName = new Map(table.columns.map((c) => [c.legacy, c]));
  const resolved: ResolvedColumn[] = [];
  const seen = new Set<string>();

  for (const name of header) {
    const mapping = byLegacyName.get(name);
    if (!mapping) {
      throw new Error(
        `${table.name}.csv: unrecognized column "${name}" in header - ` +
          `not present in scripts/etl/tables.ts's column mapping for "${table.name}". ` +
          `Update the mapping (the CSV header is authoritative) before loading.`,
      );
    }
    resolved.push(mapping);
    seen.add(name);
  }

  const missing = table.columns
    .map((c) => c.legacy)
    .filter((legacy) => !seen.has(legacy));
  if (missing.length > 0) {
    throw new Error(
      `${table.name}.csv: header is missing expected column(s) ${missing.join(", ")} ` +
        `(per scripts/etl/tables.ts). Either the dump is stale/incomplete or the mapping is out of date.`,
    );
  }

  return resolved;
}

/** CAST expression pulling `columnRef` (a `text` staging column) out into
 * its target Postgres type. See file header for the bytea/timestamptz
 * rationale. */
export function castExpr(type: ColumnType, columnRef: string): string {
  switch (type) {
    case "integer":
      return `${columnRef}::integer`;
    case "smallint":
      return `${columnRef}::smallint`;
    case "real":
      return `${columnRef}::real`;
    case "boolean":
      return `${columnRef}::boolean`;
    case "date":
      return `${columnRef}::date`;
    case "timestamptz":
      // D-002: legacy datetimes have no offset in the dump; the wall-clock
      // value itself is UTC (Azure App Service ran UTC). Cast to a naive
      // timestamp first, then reinterpret it as UTC - independent of
      // whatever time zone the loading session happens to be in.
      return `(${columnRef}::timestamp) AT TIME ZONE 'UTC'`;
    case "bytea":
      // Dump hex has no \x/0x prefix (SQL Server CONVERT(...,2) style).
      return `decode(${columnRef}, 'hex')`;
    case "string":
      // varchar/char: implicit assignment cast from text applies on
      // INSERT ... SELECT. No trimming/case changes (doc 02 P0-04: "no
      // trimming, no case changes, no cleanup").
      return columnRef;
  }
}

export function stagingTableName(table: string): string {
  return `etl_staging_${table}`;
}

/** `CREATE TEMP TABLE etl_staging_<table> (<pg col> text, ...)`. */
export function buildStagingDdl(
  table: string,
  columns: ResolvedColumn[],
): string {
  const cols = columns.map((c) => `${quoteIdent(c.pg)} text`).join(", ");
  return `CREATE TEMP TABLE ${quoteIdent(stagingTableName(table))} (${cols})`;
}

export function buildDropStagingDdl(table: string): string {
  return `DROP TABLE IF EXISTS ${quoteIdent(stagingTableName(table))}`;
}

/**
 * `INSERT INTO <table> (<all target cols>) OVERRIDING SYSTEM VALUE
 *  SELECT <casts>, <NULL for each pgOnlyColumn> FROM etl_staging_<table>`.
 */
export function buildInsertFromStagingSql(
  table: TableConfig,
  columns: ResolvedColumn[],
): string {
  const staging = quoteIdent(stagingTableName(table.name));
  const targetCols = [
    ...columns.map((c) => quoteIdent(c.pg)),
    ...(table.pgOnlyColumns ?? []).map(quoteIdent),
  ];
  const selectExprs = [
    ...columns.map((c) => castExpr(c.type, `${staging}.${quoteIdent(c.pg)}`)),
    ...(table.pgOnlyColumns ?? []).map(() => "NULL"),
  ];
  return (
    `INSERT INTO ${quoteIdent(table.name)} (${targetCols.join(", ")}) ` +
    `OVERRIDING SYSTEM VALUE ` +
    `SELECT ${selectExprs.join(", ")} FROM ${staging}`
  );
}

export interface LoadTableResult {
  table: string;
  stagingRowCount: number;
  insertedRowCount: number;
  expectedRowCount: number | null;
  rowCountMatches: boolean | null;
}

export interface LoadTableParams {
  executor: SqlExecutor;
  table: TableConfig;
  /** CSV header row (column names, in file order). */
  header: string[];
  /** Fills the (already-created) staging table by whatever transport the
   * caller wants - COPY in production, parameterized INSERTs in tests. */
  fill: (stagingTable: string, columns: ResolvedColumn[]) => Promise<void>;
  /** Expected row count from dumps/manifest.json, if available. */
  expectedRowCount?: number | null;
}

/**
 * Loads one table: creates its staging table, fills it (via the caller's
 * transport), moves the data into the real table with
 * `INSERT ... OVERRIDING SYSTEM VALUE`, and reports row counts. Does not
 * itself run FK checks / setval / ANALYZE - see migrate-data.ts, which runs
 * those once after all tables are loaded (or once for a single `--table`).
 *
 * It DOES apply two species-identity steps intrinsic to loading `trees`/
 * `tree_measurements` specifically (as opposed to migrate-data.ts's
 * batch-wide FK/setval/ANALYZE housekeeping), so every caller - the
 * production CLI and the PGlite tests alike - gets them for free from a
 * bare `loadTable()` call, with no separate wiring per caller:
 *   - D-016: `normalizeSpeciesWhitespace` for `table.name` in
 *     `SPECIES_NORMALIZED_TABLES` (species-normalize.ts).
 *   - D-011: `assertSpeciesSlugUniqueness`, once `trees` itself has just
 *     been (re)loaded - throws on a slug collision (fail loudly;
 *     species-slug-assert.ts), so a bad load never silently reaches the app.
 */
export async function loadTable(
  params: LoadTableParams,
): Promise<LoadTableResult> {
  const { executor, table, header, fill } = params;
  const columns = resolveColumns(table, header);

  await executor.query(buildDropStagingDdl(table.name));
  await executor.query(buildStagingDdl(table.name, columns));

  await fill(stagingTableName(table.name), columns);

  const stagingCountRes = await executor.query<{ n: string | number }>(
    `SELECT count(*) AS n FROM ${quoteIdent(stagingTableName(table.name))}`,
  );
  const stagingRowCount = Number(stagingCountRes.rows[0]?.n ?? 0);

  await executor.query(buildInsertFromStagingSql(table, columns));

  await executor.query(buildDropStagingDdl(table.name));

  if ((SPECIES_NORMALIZED_TABLES as readonly string[]).includes(table.name)) {
    await normalizeSpeciesWhitespace(executor, table.name as SpeciesNormalizedTable);
  }
  if (table.name === "trees") {
    await assertSpeciesSlugUniqueness(executor);
  }

  const expectedRowCount = params.expectedRowCount ?? null;

  return {
    table: table.name,
    stagingRowCount,
    insertedRowCount: stagingRowCount,
    expectedRowCount,
    rowCountMatches:
      expectedRowCount === null ? null : expectedRowCount === stagingRowCount,
  };
}

/**
 * Staging-fill strategy used by tests (and available as a slow-path
 * fallback): parses `csvText` with csv.ts and INSERTs rows into the
 * staging table in batches via the generic SqlExecutor. Every value is
 * passed through as a bound parameter (`$1, $2, ...`); NULL-vs-empty-string
 * is resolved by csv.ts's `fieldToNullableString` before this ever sees the
 * row, so the executor just sees JS `null` or `string`.
 */
export function makeInsertFillStrategy(
  executor: SqlExecutor,
  rows: (string | null)[][],
  batchSize = 500,
) {
  return async (staging: string, columns: ResolvedColumn[]): Promise<void> => {
    if (rows.length === 0) return;
    const colList = columns.map((c) => quoteIdent(c.pg)).join(", ");
    for (let start = 0; start < rows.length; start += batchSize) {
      const batch = rows.slice(start, start + batchSize);
      const valuesSql: string[] = [];
      const params: (string | null)[] = [];
      for (const row of batch) {
        const placeholders = row.map((_, i) => `$${params.length + i + 1}`);
        valuesSql.push(`(${placeholders.join(", ")})`);
        params.push(...row);
      }
      await executor.query(
        `INSERT INTO ${quoteIdent(staging)} (${colList}) VALUES ${valuesSql.join(", ")}`,
        params,
      );
    }
  };
}

/** Builds the orphan-check SQL for one FK (doc 07 section 7.1 #6). */
export function buildOrphanCheckSql(
  childTable: string,
  childColumn: string,
  refTable: string,
): string {
  return (
    `SELECT count(*)::int AS orphans FROM ${quoteIdent(childTable)} c ` +
    `WHERE c.${quoteIdent(childColumn)} IS NOT NULL ` +
    `AND NOT EXISTS (SELECT 1 FROM ${quoteIdent(refTable)} p WHERE p.id = c.${quoteIdent(childColumn)})`
  );
}

/** `setval(pg_get_serial_sequence(table,'id'), max(id), max(id) is not null)`. */
export function buildSetvalSql(table: string): string {
  const t = quoteLiteral(table);
  return (
    `SELECT setval(pg_get_serial_sequence(${t}, 'id'), ` +
    `COALESCE((SELECT max(id) FROM ${quoteIdent(table)}), 1), ` +
    `(SELECT max(id) FROM ${quoteIdent(table)}) IS NOT NULL)`
  );
}

export function buildAnalyzeSql(table: string): string {
  return `ANALYZE ${quoteIdent(table)}`;
}

export function buildTruncateSql(
  tables: string[],
  options: { restartIdentity?: boolean } = {},
): string {
  const list = tables.map(quoteIdent).join(", ");
  const restart = options.restartIdentity ? "RESTART IDENTITY " : "";
  return `TRUNCATE TABLE ${list} ${restart}CASCADE`;
}
