/**
 * Shared transport abstraction for every db/queries/*.sql.ts module and
 * db/recompute.ts (task P0-05, doc 02 §P0-05 / doc 01 §4).
 *
 * Production code calls every exported query function with no `sql`
 * argument, so the default -- the real postgres.js client returned by
 * `getSql()` in db/index.ts -- is used. Tests inject a PGlite-backed shim
 * (see test-helpers.ts) satisfying the same minimal "callable as a tagged
 * template, resolves to a row array" shape, because postgres.js's
 * wire-protocol client cannot connect to an in-process PGlite instance (no
 * TCP/unix-socket listener), and the optional postgres-wire bridge package
 * for PGlite is not among this task's allowed dependencies (no `pnpm add`).
 *
 * Consequence for every query in db/queries/*.sql.ts and db/recompute.ts:
 * write SQL using ONLY flat, single-level `sql\`...${value}...\`` binding.
 * Never use postgres.js-only features (nested `sql\`fragment\`` composition,
 * the `sql(array)` helper, `.unsafe()`) -- the PGlite shim only understands
 * "one string template, N positional scalar parameters", and using those
 * features would make the production code path diverge from what the tests
 * actually exercise. Optional filters are expressed as
 * `WHERE (${param}::int IS NULL OR col = ${param})` so the query text is
 * static regardless of whether the caller passed a value.
 */
import { getSql } from "../index";

export type SqlTag = (<T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>) & {
  /** Present on the real postgres.js client; absent on the PGlite test shim. */
  begin?: <T>(cb: (trx: SqlTag) => Promise<T>) => Promise<T>;
};

/** The real postgres.js client, narrowed to the minimal SqlTag shape. */
export function defaultSql(): SqlTag {
  return getSql() as unknown as SqlTag;
}

/**
 * Runs `work` inside a transaction when `sql` is the real postgres.js client
 * (which has `.begin`), or plain (untransacted) against the PGlite test shim
 * otherwise -- PGlite is a single embedded instance with no concurrent
 * writers in tests, so atomicity is not observable there regardless.
 */
export async function withTransaction<T>(
  sql: SqlTag,
  work: (trx: SqlTag) => Promise<T>,
): Promise<T> {
  if (typeof sql.begin === "function") {
    return sql.begin((trx) => work(trx));
  }
  return work(sql);
}
