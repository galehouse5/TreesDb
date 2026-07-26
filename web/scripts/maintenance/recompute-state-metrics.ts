// One-off maintenance: mark a state's cached metrics stale and run
// recomputeStaleMetrics (db/recompute.ts) to refresh them. Used to clear
// stale-count artifacts left when a test/audit flow deleted rows without
// going through removeTrip's recompute path.
//
//   npx tsx scripts/maintenance/recompute-state-metrics.ts <stateId> [path/to/env-file]
//
// Body lives in main() rather than top level: this package compiles as CJS,
// where top-level await is not available.
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { recomputeStaleMetrics } from "../../db/recompute";

async function main(): Promise<void> {
  const stateId = Number(process.argv[2]);
  if (!Number.isInteger(stateId) || stateId <= 0) {
    console.error("usage: recompute-state-metrics.ts <stateId> [env-file]");
    process.exit(1);
  }
  const envFile = process.argv[3];
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
    const before = await sql`
      select computed_trees_measured_count from states where id = ${stateId}
    `;
    console.log(`state ${stateId} computed_trees_measured_count before:`, JSON.stringify(before));

    await sql`update states set are_metrics_stale = true where id = ${stateId}`;
    const res = await recomputeStaleMetrics(sql as never);
    console.log("recompute result:", JSON.stringify(res));

    const after = await sql`
      select computed_trees_measured_count from states where id = ${stateId}
    `;
    console.log(`state ${stateId} computed_trees_measured_count after:`, JSON.stringify(after));
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
