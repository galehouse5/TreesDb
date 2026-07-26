// Runner for d016-species-whitespace-cleanup.sql. Targets the connection
// string in DATABASE_URL_UNPOOLED (falling back to DATABASE_URL), read from
// the environment or from an env file passed as argv[2]. See the .sql file
// and DECISIONS.md D-016 for scope; the script is idempotent.
//
//   npx tsx scripts/maintenance/run-d016.ts [path/to/env-file]
//
// Body lives in main() rather than top level: this package compiles as
// CJS, where top-level await is not available.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

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

  const sqlText = readFileSync(
    join(__dirname, "d016-species-whitespace-cleanup.sql"),
    "utf8",
  );

  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql.unsafe(sqlText);
    const rows = await sql`
      select scientific_name, common_name, count(*) trees,
             count(distinct computed_measured_species_id) hashes
      from trees
      where (scientific_name, common_name) in
        (('Cercis siliquastrum','Judas-Tree'),
         ('Crataegus spp.','Hawthorn'),
         ('Cupressus sempervirens','Italian Cypress'),
         ('Quercus x mutabilis','Hybrid Oak'))
      group by 1, 2 order by 1`;
    const leftover = await sql`
      select count(*)::int n from (
        select 1 from trees where scientific_name ~ '\\s\\s' or common_name ~ '\\s\\s'
        union all
        select 1 from tree_measurements where scientific_name ~ '\\s\\s' or common_name ~ '\\s\\s'
      ) x`;
    console.log("post-cleanup state:");
    for (const r of rows)
      console.log(`  ${r.scientific_name} / ${r.common_name}: ${r.trees} trees, ${r.hashes} distinct hash`);
    console.log(`  rows still containing whitespace runs: ${leftover[0]!.n}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
