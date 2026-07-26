/**
 * Minimal SQL-execution abstraction shared by the production loader
 * (postgres.js, against real/Neon Postgres) and the integration test
 * (@electric-sql/pglite, in-memory). Only the subset both clients need for
 * everything EXCEPT the COPY transport is exposed here - COPY has no
 * meaningful PGlite equivalent (see load-table.ts), so it's kept out of
 * this interface entirely and wired up separately, only in the production
 * path.
 *
 * PGlite's `.query<T>(text, params)` already returns `{ rows: T[] }`, i.e.
 * a PGlite instance satisfies `SqlExecutor` with zero adapter code -
 * `makePostgresExecutor` below is the only adapter actually needed.
 */
import type postgres from "postgres";

export interface SqlExecutor {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}

/** Wrap a postgres.js `Sql` instance (or transaction handle) as a SqlExecutor. */
export function makePostgresExecutor(
  sql: postgres.Sql | postgres.TransactionSql,
): SqlExecutor {
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const rows = (await sql.unsafe(text, params as never[])) as unknown as T[];
      return { rows };
    },
  };
}
