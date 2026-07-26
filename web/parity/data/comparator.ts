/**
 * Pure comparator core for doc 07 §7.1 (dump-based data parity). No file or
 * DB I/O here - everything takes already-parsed dump rows (from csv.ts) and
 * already-fetched DB rows (from db-adapter.ts / any driver), so this module
 * is fully unit-testable with hand-built fixtures (see comparator.test.ts).
 *
 * Implements checks 1-6 of doc 07 §7.1:
 *   1. compareRowCounts        - row counts (dump vs manifest vs DB)
 *   2. comparePkSets           - PK set equality, exact missing/extra ids
 *   3. compareRow               - field-by-field row diff
 *   4. aggregateCrossCheck      - per-numeric-column min/max/sum/null-count
 *                                 + per-FK distinct count
 *   5. speciesHashCheck         - recompute computed_measured_species_id
 *   6. fkOrphanCheck            - FK integrity
 *
 * Format-convention decisions (see also tables.ts's file header):
 *   - Datetimes: dump style-126 strings carry no UTC offset. Per D-002
 *     (docs/migration/DECISIONS.md) they ARE UTC wall-clock; this module
 *     appends "Z" before handing them to normalize.ts's toIsoInstant/
 *     dateEquals, because `new Date("2020-05-12T14:23:01.123")` (no
 *     trailing Z) is parsed as LOCAL time by the JS Date constructor, which
 *     would silently corrupt the comparison on any non-UTC machine/CI
 *     runner - normalize.ts is landed/read-only, so the "assume UTC" step
 *     has to happen here, once, at the CSV-value boundary.
 *   - Date-only columns use the same SQL CONVERT style but the underlying
 *     SQL `date` type has no time part, so the dump string is already a
 *     bare "yyyy-MM-dd" - compared with normalize.ts's `dateOnlyEquals`
 *     (plain string equality, doc §6) against a same-shape string derived
 *     from the DB value's UTC calendar fields (postgres.js/PGlite return a
 *     JS Date for `date` columns at UTC midnight, or occasionally a raw
 *     "yyyy-MM-dd" string depending on driver - both are handled).
 *   - bytea: DB drivers return a Buffer (postgres.js) - normalized to
 *     lowercase hex for comparison against the dump's already-lowercase hex.
 *   - NULL vs empty string: the dump's bare NULL token parses to JS `null`
 *     (csv.ts); a real empty string is `""`. Since `"" !== null`, ordinary
 *     strict/nullable equality below already distinguishes them - no special
 *     casing needed, which is itself the point of the NULL-token convention.
 */
import { speciesHash } from "../../lib/species-hash";
import { dateEqualsNullable, dateOnlyEquals, floatEqualsNullable } from "../normalize";
import type { CsvValue } from "./csv";
import { PK_DB, type ColumnSpec, type TableSpec } from "./tables";

export type DiffKind = "row-count" | "pk-missing" | "pk-extra" | "field" | "aggregate" | "fk-orphan" | "species-hash";

export interface Diff {
  kind: DiffKind;
  table: string;
  id?: number;
  field?: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
  /**
   * Set when the comparator itself recognizes a pattern a predeclared
   * waiver covers (currently only W-001's "same value, different tied
   * tree id" shape - see verify-derived.ts). report.ts's waiver matcher
   * checks this before falling back to free-text category/field matching.
   */
  waiverHint?: string;
}

function diff(partial: Omit<Diff, "message"> & { message?: string }): Diff {
  const message =
    partial.message ??
    `${partial.table}${partial.id != null ? `#${partial.id}` : ""}${partial.field ? `.${partial.field}` : ""}: expected ${JSON.stringify(partial.expected)}, got ${JSON.stringify(partial.actual)}`;
  return { ...partial, message };
}

// ---------------------------------------------------------------------------
// 1. Row counts
// ---------------------------------------------------------------------------

export function compareRowCounts(
  table: string,
  dumpCount: number,
  dbCount: number,
  manifestCount?: number,
): Diff[] {
  const diffs: Diff[] = [];
  if (dumpCount !== dbCount) {
    diffs.push(
      diff({
        kind: "row-count",
        table,
        message: `${table}: row count mismatch - dump has ${dumpCount}, DB has ${dbCount}`,
        expected: dumpCount,
        actual: dbCount,
      }),
    );
  }
  if (manifestCount != null && manifestCount !== dumpCount) {
    diffs.push(
      diff({
        kind: "row-count",
        table,
        message: `${table}: dump row count (${dumpCount}) does not match manifest.json (${manifestCount})`,
        expected: manifestCount,
        actual: dumpCount,
      }),
    );
  }
  return diffs;
}

// ---------------------------------------------------------------------------
// 2. PK set equality
// ---------------------------------------------------------------------------

export interface PkSetResult {
  missingInDb: number[];
  extraInDb: number[];
}

export function comparePkSets(table: string, dumpIds: Iterable<number>, dbIds: Iterable<number>): { result: PkSetResult; diffs: Diff[] } {
  const dumpSet = new Set(dumpIds);
  const dbSet = new Set(dbIds);
  const missingInDb = [...dumpSet].filter((id) => !dbSet.has(id)).sort((a, b) => a - b);
  const extraInDb = [...dbSet].filter((id) => !dumpSet.has(id)).sort((a, b) => a - b);

  const diffs: Diff[] = [];
  if (missingInDb.length > 0) {
    diffs.push(
      diff({
        kind: "pk-missing",
        table,
        message: `${table}: ${missingInDb.length} id(s) present in dump but missing from DB: ${missingInDb.join(", ")}`,
        expected: missingInDb,
      }),
    );
  }
  if (extraInDb.length > 0) {
    diffs.push(
      diff({
        kind: "pk-extra",
        table,
        message: `${table}: ${extraInDb.length} id(s) present in DB but missing from dump: ${extraInDb.join(", ")}`,
        actual: extraInDb,
      }),
    );
  }
  return { result: { missingInDb, extraInDb }, diffs };
}

// ---------------------------------------------------------------------------
// 3. Field-by-field row diff
// ---------------------------------------------------------------------------

function csvDatetimeToIso(v: string): string {
  return /[zZ]|[+-]\d\d:\d\d$/.test(v) ? v : `${v}Z`;
}

function dbDateOnlyString(v: unknown): string {
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v).slice(0, 10);
}

function dbBytesToHex(v: unknown): string | null {
  if (v == null) return null;
  if (Buffer.isBuffer(v)) return v.toString("hex");
  if (v instanceof Uint8Array) return Buffer.from(v).toString("hex");
  if (typeof v === "string") return (v.startsWith("\\x") ? v.slice(2) : v).toLowerCase();
  return String(v).toLowerCase();
}

function csvBoolToJs(v: CsvValue): boolean | null {
  if (v === null) return null;
  return v === "1" || v.toLowerCase() === "true";
}

function dbBoolToJs(v: unknown): boolean | null {
  if (v == null) return null;
  if (typeof v === "boolean") return v;
  return v === 1 || v === "1" || v === "t" || v === true;
}

function csvIntToJs(v: CsvValue): number | null {
  if (v === null) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) throw new Error(`comparator.ts: unparseable int value ${JSON.stringify(v)}`);
  return n;
}

function dbIntToJs(v: unknown): number | null {
  return v == null ? null : Number(v);
}

/** Compares one column's dump value against its DB counterpart. Returns true when equal. */
function fieldsEqual(type: ColumnSpec["type"], csvValue: CsvValue, dbValue: unknown): boolean {
  switch (type) {
    case "string":
      return csvValue === (dbValue == null ? null : String(dbValue));
    case "int":
      return csvIntToJs(csvValue) === dbIntToJs(dbValue);
    case "float":
      return floatEqualsNullable(csvValue ?? undefined, dbValue == null ? undefined : Number(dbValue));
    case "bool":
      return csvBoolToJs(csvValue) === dbBoolToJs(dbValue);
    case "bytea":
      return (csvValue === null ? null : csvValue.toLowerCase()) === dbBytesToHex(dbValue);
    case "datetime":
      return dateEqualsNullable(csvValue === null ? null : csvDatetimeToIso(csvValue), dbValue == null ? null : (dbValue as string | Date));
    case "dateonly":
      if (csvValue === null || dbValue == null) return csvValue === null && dbValue == null;
      return dateOnlyEquals(csvValue, dbDateOnlyString(dbValue));
  }
}

/** doc §7.1.3: strings byte-equal (no trimming); floats fround-exact; datetimes as instants; booleans 0/1<->false/true; bytea hex-equal. */
export function compareRow(
  table: string,
  id: number,
  csvRow: Record<string, CsvValue>,
  dbRow: Record<string, unknown>,
  columns: ColumnSpec[],
): Diff[] {
  const diffs: Diff[] = [];
  for (const col of columns) {
    const csvValue = csvRow[col.csv];
    if (csvValue === undefined) {
      throw new Error(`comparator.ts: dump row for ${table}#${id} is missing expected CSV column "${col.csv}"`);
    }
    const dbValue = dbRow[col.db];
    if (!fieldsEqual(col.type, csvValue, dbValue)) {
      diffs.push(
        diff({
          kind: "field",
          table,
          id,
          field: col.db,
          expected: csvValue,
          actual: dbValue instanceof Date ? dbValue.toISOString() : Buffer.isBuffer(dbValue) ? dbValue.toString("hex") : dbValue,
        }),
      );
    }
  }
  return diffs;
}

// ---------------------------------------------------------------------------
// 4. Aggregate cross-check
// ---------------------------------------------------------------------------

interface NumericAgg {
  min: number | null;
  max: number | null;
  sum: number;
  nullCount: number;
}

function aggFromValues(values: (number | null)[]): NumericAgg {
  let min: number | null = null;
  let max: number | null = null;
  let sum = 0;
  let nullCount = 0;
  for (const v of values) {
    if (v === null) {
      nullCount++;
      continue;
    }
    if (min === null || v < min) min = v;
    if (max === null || v > max) max = v;
    sum += v; // float64 accumulation per doc §7.1.4
  }
  return { min, max, sum, nullCount };
}

/** doc §7.1.4: per numeric column min/max/sum(float64)/null-count, and per-FK distinct count. */
export function aggregateCrossCheck(
  table: string,
  dumpRows: Map<number, Record<string, CsvValue>>,
  dbRows: Map<number, Record<string, unknown>>,
  columns: ColumnSpec[],
): Diff[] {
  const diffs: Diff[] = [];

  for (const col of columns) {
    if (col.db === PK_DB) continue; // PK itself isn't a meaningful "numeric metric" to aggregate.
    if (col.type === "int" || col.type === "float") {
      // For float columns, coerce each value to float32 BEFORE accumulating:
      // the dump carries 17-digit round-trip float64 renderings of the
      // stored real, while Postgres' wire text is the shortest string that
      // round-trips the float4 (e.g. "71.60482"). Both parse to different
      // float64s that fround to the same float32 - so field-by-field
      // comparison passes, but float64 sums of the un-coerced values differ
      // in the tail digits. Summing the fround'ed values keeps both sides'
      // arithmetic identical (float64 accumulation over float32 inputs).
      const coerce = (n: number) => (col.type === "float" ? Math.fround(n) : n);
      const dumpValues = [...dumpRows.values()].map((r) => {
        const raw = r[col.csv];
        if (raw === undefined) throw new Error(`aggregateCrossCheck: missing CSV column ${col.csv} on ${table}`);
        return raw === null ? null : coerce(Number(raw));
      });
      const dbValues = [...dbRows.values()].map((r) => (r[col.db] == null ? null : coerce(Number(r[col.db]))));
      const dumpAgg = aggFromValues(dumpValues);
      const dbAgg = aggFromValues(dbValues);

      if (dumpAgg.nullCount !== dbAgg.nullCount) {
        diffs.push(
          diff({
            kind: "aggregate",
            table,
            field: col.db,
            message: `${table}.${col.db}: null-count mismatch - dump ${dumpAgg.nullCount}, DB ${dbAgg.nullCount}`,
            expected: dumpAgg.nullCount,
            actual: dbAgg.nullCount,
          }),
        );
      }
      const numericEqual = (a: number | null, b: number | null) =>
        a === null || b === null ? a === b : col.type === "float" ? Math.fround(a) === Math.fround(b) : a === b;
      if (!numericEqual(dumpAgg.min, dbAgg.min)) {
        diffs.push(
          diff({
            kind: "aggregate",
            table,
            field: col.db,
            message: `${table}.${col.db}: min mismatch - dump ${dumpAgg.min}, DB ${dbAgg.min}`,
            expected: dumpAgg.min,
            actual: dbAgg.min,
          }),
        );
      }
      if (!numericEqual(dumpAgg.max, dbAgg.max)) {
        diffs.push(
          diff({
            kind: "aggregate",
            table,
            field: col.db,
            message: `${table}.${col.db}: max mismatch - dump ${dumpAgg.max}, DB ${dbAgg.max}`,
            expected: dumpAgg.max,
            actual: dbAgg.max,
          }),
        );
      }
      // Sum compared in float64 per doc §7.1.4 - no fround, allow only exact float64 equality
      // since both sides sum the same underlying values in the same order-independent way.
      if (dumpAgg.sum !== dbAgg.sum) {
        diffs.push(
          diff({
            kind: "aggregate",
            table,
            field: col.db,
            message: `${table}.${col.db}: sum mismatch - dump ${dumpAgg.sum}, DB ${dbAgg.sum}`,
            expected: dumpAgg.sum,
            actual: dbAgg.sum,
          }),
        );
      }
    }

    if (col.fk) {
      const dumpDistinct = new Set(
        [...dumpRows.values()].map((r) => r[col.csv]).filter((v): v is string => v !== null),
      ).size;
      const dbDistinct = new Set(
        [...dbRows.values()].map((r) => r[col.db]).filter((v) => v != null).map(String),
      ).size;
      if (dumpDistinct !== dbDistinct) {
        diffs.push(
          diff({
            kind: "aggregate",
            table,
            field: col.db,
            message: `${table}.${col.db}: distinct FK value count mismatch - dump ${dumpDistinct}, DB ${dbDistinct}`,
            expected: dumpDistinct,
            actual: dbDistinct,
          }),
        );
      }
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// 5. Species-hash recompute check (trees / tree_measurements only)
// ---------------------------------------------------------------------------

/** doc §7.1.5: recompute ComputedMeasuredSpeciesId in TS and compare to the DUMPED value (not the DB's, which is covered by the ordinary field diff already). */
export function speciesHashCheck(
  table: string,
  id: number,
  scientificName: string,
  commonName: string,
  dumpedComputedMeasuredSpeciesId: number,
): Diff[] {
  const recomputed = speciesHash(scientificName, commonName);
  if (recomputed !== dumpedComputedMeasuredSpeciesId) {
    return [
      diff({
        kind: "species-hash",
        table,
        id,
        field: "computed_measured_species_id",
        message: `${table}#${id}: recomputed species hash ${recomputed} does not match dumped value ${dumpedComputedMeasuredSpeciesId} (scientificName=${JSON.stringify(scientificName)}, commonName=${JSON.stringify(commonName)})`,
        expected: recomputed,
        actual: dumpedComputedMeasuredSpeciesId,
      }),
    ];
  }
  return [];
}

// ---------------------------------------------------------------------------
// 6. FK orphan check
// ---------------------------------------------------------------------------

/** doc §7.1.6: every FK column value (non-null) must exist in the referenced table's PK set. */
export function fkOrphanCheck(
  table: string,
  dbRows: Map<number, Record<string, unknown>>,
  column: ColumnSpec,
  referencedIds: ReadonlySet<number>,
): Diff[] {
  if (!column.fk) return [];
  const diffs: Diff[] = [];
  for (const [id, row] of dbRows) {
    const raw = row[column.db];
    if (raw == null) continue;
    const fkValue = Number(raw);
    if (!referencedIds.has(fkValue)) {
      diffs.push(
        diff({
          kind: "fk-orphan",
          table,
          id,
          field: column.db,
          message: `${table}#${id}.${column.db} = ${fkValue} does not exist in ${column.fk}`,
          expected: null,
          actual: fkValue,
        }),
      );
    }
  }
  return diffs;
}

// ---------------------------------------------------------------------------
// Orchestration helper: compares an entire table given fully-materialized
// dump/DB row maps. Returns diffs + a count of distinct "checks" performed
// (used by report.ts to compute pass = checksRun - fail - waived per doc
// §7 requirement of pass/fail/waived counts; see report.ts for the exact
// convention this establishes).
// ---------------------------------------------------------------------------

export interface TableComparisonResult {
  diffs: Diff[];
  checksRun: number;
}

export function compareTable(
  spec: TableSpec,
  dumpRows: Map<number, Record<string, CsvValue>>,
  dbRows: Map<number, Record<string, unknown>>,
  manifestCount?: number,
  referencedIdSets?: Map<string, ReadonlySet<number>>,
): TableComparisonResult {
  const diffs: Diff[] = [];
  let checksRun = 0;

  diffs.push(...compareRowCounts(spec.name, dumpRows.size, dbRows.size, manifestCount));
  checksRun += 1;

  const { diffs: pkDiffs } = comparePkSets(spec.name, dumpRows.keys(), dbRows.keys());
  diffs.push(...pkDiffs);
  checksRun += 1;

  for (const [id, csvRow] of dumpRows) {
    const dbRow = dbRows.get(id);
    if (!dbRow) continue; // already reported as pk-missing above
    diffs.push(...compareRow(spec.name, id, csvRow, dbRow, spec.columns));
    checksRun += 1;
  }

  diffs.push(...aggregateCrossCheck(spec.name, dumpRows, dbRows, spec.columns));
  checksRun += spec.columns.filter((c) => c.db !== PK_DB && (c.type === "int" || c.type === "float")).length;
  checksRun += spec.columns.filter((c) => c.fk).length;

  if (referencedIdSets) {
    for (const col of spec.columns) {
      if (!col.fk) continue;
      const referenced = referencedIdSets.get(col.fk);
      if (!referenced) continue;
      diffs.push(...fkOrphanCheck(spec.name, dbRows, col, referenced));
      checksRun += 1;
    }
  }

  if (spec.name === "trees" || spec.name === "tree_measurements") {
    for (const [id, csvRow] of dumpRows) {
      const scientificName = csvRow["ScientificName"];
      const commonName = csvRow["CommonName"];
      const computed = csvRow["ComputedMeasuredSpeciesId"];
      if (scientificName === null || commonName === null || computed === null) continue;
      diffs.push(...speciesHashCheck(spec.name, id, scientificName, commonName, Number(computed)));
      checksRun += 1;
    }
  }

  return { diffs, checksRun };
}
