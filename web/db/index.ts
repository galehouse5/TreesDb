import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Postgres connection + Drizzle client.
 *
 * The client is created lazily so the app can boot (and routes that don't
 * touch the DB can render) even when DATABASE_URL is unset — useful during
 * early Phase 0 before Neon/local Postgres is wired up. Schema lands in
 * db/schema.ts under task P0-02.
 */

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql(): ReturnType<typeof postgres> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set (see web/.env.example)");
  }
  if (!_sql) {
    _sql = postgres(url, { max: 1, prepare: false });
  }
  return _sql;
}

export function getDb() {
  return drizzle(getSql());
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
