/**
 * Local-Postgres process helpers for the replay-parity harness (doc 07 §8,
 * doc 05 §P3-02). Not shared with the rest of the app -- these shell out to
 * the `createdb`/`dropdb` binaries (C:\tools\pg16\pgsql\bin per the task
 * brief) because the harness's whole safety model is "operate on a
 * disposable template-copy database, never on `treesdb` itself", which is
 * cheapest to get right with the real `createdb -T` template-copy feature
 * rather than trying to reproduce it over a SQL connection.
 *
 * SAFETY: `dropReplayDb`/`createReplayDb` refuse to touch any name that
 * doesn't start with `treesdb_replay` -- a deliberate guard rail matching
 * the task brief's "never touch the treesdb database itself with writes".
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PG_BIN = process.env.PG_BIN ?? "C:\\tools\\pg16\\pgsql\\bin";
const PG_HOST = process.env.PGHOST ?? "localhost";
const PG_PORT = process.env.PGPORT ?? "5432";
const PG_SUPERUSER = process.env.PGUSER ?? "postgres";
const PG_PASSWORD = process.env.PGPASSWORD ?? "postgres";
const SOURCE_DB = process.env.REPLAY_SOURCE_DB ?? "treesdb";

function assertReplayDbName(name: string): void {
  if (!name.startsWith("treesdb_replay")) {
    throw new Error(
      `pg-tools.ts: refusing to operate on database ${JSON.stringify(name)} -- replay tooling only touches names starting with "treesdb_replay" (safety rail, doc 05 §P3-02 task brief).`,
    );
  }
}

function pgEnv(): NodeJS.ProcessEnv {
  return { ...process.env, PGPASSWORD: PG_PASSWORD };
}

/** `dropdb --if-exists <name>` -- guarded to `treesdb_replay*` names only. */
export async function dropReplayDb(name: string): Promise<void> {
  assertReplayDbName(name);
  await execFileAsync(
    `${PG_BIN}\\dropdb.exe`,
    ["--if-exists", "-U", PG_SUPERUSER, "-h", PG_HOST, "-p", PG_PORT, name],
    { env: pgEnv() },
  );
}

/**
 * `createdb -T <source> <name>` -- a template-copy of the full migrated
 * production database (43 MB, per the task brief), so every full run starts
 * from an identical, known-good, real-data slate.
 */
export async function createReplayDb(name: string, sourceDb: string = SOURCE_DB): Promise<void> {
  assertReplayDbName(name);
  await execFileAsync(
    `${PG_BIN}\\createdb.exe`,
    ["-T", sourceDb, "-U", PG_SUPERUSER, "-h", PG_HOST, "-p", PG_PORT, name],
    { env: pgEnv() },
  );
}

/** Connection string for a replay database, same credentials as the app's local dev DATABASE_URL. */
export function replayDbUrl(name: string): string {
  assertReplayDbName(name);
  return `postgres://${PG_SUPERUSER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${name}`;
}
