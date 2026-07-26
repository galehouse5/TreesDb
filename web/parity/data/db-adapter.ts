/**
 * Thin DB access abstraction shared by verify-data.ts / verify-derived.ts,
 * so the same table-loading code works against a real Postgres (postgres.js,
 * Neon/local, at phase-gate time) and against an in-memory PGlite instance
 * (unit/integration tests, this task's vitest suites - no real DB available
 * in this environment). Deliberately minimal: one method, "run this static
 * SQL text, get back an array of row objects" - table names interpolated
 * into `sqlText` always come from this task's own fixed TABLE_SPECS/derived
 * registries, never from user input, so plain string SQL is safe here.
 */
import type { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";

export interface DbAdapter {
  queryAll<T = Record<string, unknown>>(sqlText: string): Promise<T[]>;
  close(): Promise<void>;
}

/** Real Postgres (Neon / local) via the `postgres` package. */
export function postgresAdapter(connectionString: string): DbAdapter {
  const sql = postgres(connectionString, { max: 1, prepare: false });
  return {
    async queryAll<T>(sqlText: string): Promise<T[]> {
      const rows = await sql.unsafe(sqlText);
      return rows as unknown as T[];
    },
    async close(): Promise<void> {
      await sql.end({ timeout: 5 });
    },
  };
}

/** PGlite (in-memory Postgres) - used by tests; caller owns the PGlite instance's lifecycle. */
export function pgliteAdapter(db: PGlite): DbAdapter {
  return {
    async queryAll<T>(sqlText: string): Promise<T[]> {
      const res = await db.query<T>(sqlText);
      return res.rows;
    },
    async close(): Promise<void> {
      // No-op: PGlite lifecycle is owned by the caller (tests close it themselves).
    },
  };
}

/** Loads an entire table into a Map keyed by its `id` column - fine at this dataset's scale (doc 02 §P0-03: "hundreds of sites, tens of thousands of trees/measurements at most"). */
export async function loadTableAsMap(adapter: DbAdapter, tableName: string): Promise<Map<number, Record<string, unknown>>> {
  const rows = await adapter.queryAll<Record<string, unknown>>(`select * from ${tableName}`);
  const map = new Map<number, Record<string, unknown>>();
  for (const row of rows) {
    map.set(Number(row.id), row);
  }
  return map;
}

/** Loads just the `id` column of a table as a Set - used for FK-orphan reference sets. */
export async function loadIdSet(adapter: DbAdapter, tableName: string): Promise<Set<number>> {
  const rows = await adapter.queryAll<{ id: number | string }>(`select id from ${tableName}`);
  return new Set(rows.map((r) => Number(r.id)));
}
