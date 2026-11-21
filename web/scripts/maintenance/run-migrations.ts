// Applies pending Drizzle migrations (db/migrations/) to the database in
// DATABASE_URL_UNPOOLED (falling back to DATABASE_URL), read from the
// environment or from an env file passed as argv[2]. Same env-file pattern
// as run-d016.ts. Idempotent: Drizzle's migrator records applied entries
// in drizzle.__drizzle_migrations and skips them on re-run.
//
// After migrating it runs syncSpecies (D-019), so a database that just got
// the species tables (0002/0003) has them filled from `trees` straight away
// rather than at the next trip removal or import. Also idempotent.
//
//   npx tsx scripts/maintenance/run-migrations.ts [path/to/env-file]
//
// Body lives in main() rather than top level: this package compiles as
// CJS, where top-level await is not available.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { syncSpecies } from "../../db/species";
import { withTransaction, type SqlTag } from "../../db/queries/sql-tag";

async function main(): Promise<void> {
  const envFile = process.argv[2];
  if (envFile) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)="?([^"]*)"?\s*$/);
      if (m) process.env[m[1]!] ??= m[2]!;
    }
  }

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL_UNPOOLED / DATABASE_URL available");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(sql), {
      migrationsFolder: join(__dirname, "..", "..", "db", "migrations"),
    });
    const cols = await sql`
      select column_name from information_schema.columns
      where table_name = 'users'
        and column_name in ('password_algo', 'password_argon2')
      order by 1`;
    console.log(
      `migrations applied; users auth columns present: ${cols.map((c) => c.column_name).join(", ") || "NONE (unexpected)"}`,
    );
    const sync = await withTransaction(sql as unknown as SqlTag, (trx) => syncSpecies(trx));
    const [counts] = await sql<{ species: number; synonyms: number }[]>`
      select (select count(*)::int from species) as species,
             (select count(*)::int from species_synonyms) as synonyms`;
    console.log(
      `species synced: ${sync.inserted} added, ${sync.deleted} removed, ` +
        `${sync.synonymsApplied} synonym(s) applied; now ${counts!.species} species, ${counts!.synonyms} synonyms`,
    );
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
