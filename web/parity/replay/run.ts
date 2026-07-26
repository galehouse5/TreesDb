#!/usr/bin/env tsx
/**
 * Replay-parity harness runner (doc 07 §8, doc 05 §P3-02). For every
 * historical imported trip, on a disposable local-Postgres copy of the full
 * migrated production database: capture the trip's current scope, run the
 * real `reimportTrip` (delete-then-reimport, the exact same code path a
 * user hits from History), capture the scope again, diff by natural key,
 * then ROLLBACK -- so every trip replays against the identical starting
 * state and the harness never actually mutates `treesdb_replay` for the
 * next trip (let alone `treesdb` itself, which this file never opens a
 * connection to).
 *
 * Usage (from web/):
 *   npx tsx parity/replay/run.ts                  # full sweep, all imported trips
 *   npx tsx parity/replay/run.ts --limit 20        # shake out harness bugs first
 *   npx tsx parity/replay/run.ts --trip 4021       # a single trip, verbose
 *   npx tsx parity/replay/run.ts --skip-passed     # resume, skipping trips a prior checkpoint marked pass
 *   npx tsx parity/replay/run.ts --no-recreate     # reuse the existing treesdb_replay (skip the template-copy step)
 *
 * Only a `--limit`/`--trip` run skips the *dated* report (it always writes
 * the rolling checkpoint) -- the dated `replay-<date>.{json,md}` under
 * parity/reports/ is reserved for full, untruncated sweeps (the actual
 * phase-gate artifact, doc 07 §10).
 */
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

import type { SqlTag } from "../../db/queries/sql-tag";
import { reimportTrip } from "../../lib/merge/reimport";
import { captureTripScope, type SiteIdentityLookup } from "./capture";
import { diffTripScope } from "./differ";
import { createReplayDb, dropReplayDb, replayDbUrl } from "./pg-tools";
import {
  loadCheckpointResults,
  MAX_DIFFS_PER_TRIP,
  summarize,
  writeReport,
  type TripResult,
} from "./report";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(SCRIPT_DIR, "..", "reports");
const DEFAULT_REPLAY_DB = "treesdb_replay";
const CHECKPOINT_PATH = path.join(REPORTS_DIR, "replay-checkpoint.json");
const CHECKPOINT_EVERY = 100;

interface Args {
  limit?: number;
  trip?: number[];
  replayDb: string;
  skipPassed: boolean;
  noRecreate: boolean;
}

function parseCliArgs(argv: string[]): Args {
  const { values } = parseArgs({
    args: argv,
    options: {
      limit: { type: "string" },
      trip: { type: "string" },
      "replay-db": { type: "string", default: DEFAULT_REPLAY_DB },
      "skip-passed": { type: "boolean", default: false },
      "no-recreate": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });
  return {
    limit: values.limit ? Number(values.limit) : undefined,
    trip: values.trip ? String(values.trip).split(",").map(Number) : undefined,
    replayDb: String(values["replay-db"]),
    skipPassed: Boolean(values["skip-passed"]),
    noRecreate: Boolean(values["no-recreate"]),
  };
}

class RollbackSentinel extends Error {
  constructor(public readonly payload: TripResult) {
    super("replay-rollback (expected control-flow signal, not a real error)");
  }
}

function realBegin(sql: SqlTag): NonNullable<SqlTag["begin"]> {
  if (!sql.begin) throw new Error("run.ts requires a real postgres.js client (SqlTag.begin missing)");
  return sql.begin;
}

/**
 * One trip's full replay cycle inside a single rolled-back transaction:
 * capture pre-state, run the real `reimportTrip`, capture post-state (also
 * re-resolving every pre-affected site by natural identity, in case the
 * trip's rows moved to a different site), diff, then always ROLLBACK by
 * throwing `RollbackSentinel` -- the one control-flow path every branch
 * below funnels into, so the transaction is never accidentally committed.
 */
async function replayOneTrip(sql: SqlTag, tripId: number): Promise<TripResult> {
  const start = Date.now();
  const begin = realBegin(sql);

  try {
    await begin(async (trx) => {
      const pre = await captureTripScope(trx, tripId);

      let engineError: unknown;
      try {
        await reimportTrip(tripId, trx);
      } catch (e) {
        engineError = e;
      }

      if (engineError) {
        throw new RollbackSentinel({
          tripId,
          status: "engine-error",
          ms: Date.now() - start,
          diffCount: 0,
          error: engineError instanceof Error ? (engineError.stack ?? engineError.message) : String(engineError),
        });
      }

      const extraIdentities: SiteIdentityLookup[] = [...pre.sites.values()].map((s) => ({
        stateId: Number(s.site.state_id),
        name: String(s.site.name),
        county: String(s.site.county),
        calculatedLatitude: Number(s.site.calculated_latitude),
        calculatedLongitude: Number(s.site.calculated_longitude),
      }));
      const post = await captureTripScope(trx, tripId, extraIdentities);
      const { diffs, globalCountDiffs } = diffTripScope(pre, post);
      const diffCount = diffs.length + globalCountDiffs.length;

      throw new RollbackSentinel({
        tripId,
        status: diffCount === 0 ? "pass" : "fail",
        ms: Date.now() - start,
        diffCount,
        diffs: diffCount > 0 ? diffs.slice(0, MAX_DIFFS_PER_TRIP) : undefined,
        globalCountDiffs: globalCountDiffs.length > 0 ? globalCountDiffs : undefined,
      });
    });
  } catch (e) {
    if (e instanceof RollbackSentinel) return e.payload;
    throw e;
  }
  throw new Error(`replayOneTrip(${tripId}): transaction unexpectedly committed instead of rolling back`);
}

async function loadImportedTripIds(sql: SqlTag, args: Args): Promise<number[]> {
  if (args.trip) return args.trip;
  const rows = await sql<{ id: number }>`
    select id from import_trips where imported is not null order by id asc
  `;
  const ids = rows.map((r) => r.id);
  return args.limit ? ids.slice(0, args.limit) : ids;
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const isFullSweep = !args.limit && !args.trip;

  if (!args.noRecreate) {
    console.log(`Recreating ${args.replayDb} from template (createdb -T treesdb)...`);
    await dropReplayDb(args.replayDb);
    await createReplayDb(args.replayDb);
  }

  const rawSql = postgres(replayDbUrl(args.replayDb), { max: 1, prepare: false });
  const sql = rawSql as unknown as SqlTag;

  try {
    const tripIds = await loadImportedTripIds(sql, args);
    console.log(`${tripIds.length} trip(s) to replay.`);

    const prior = args.skipPassed ? await loadCheckpointResults(CHECKPOINT_PATH) : new Map<number, TripResult>();

    const results: TripResult[] = [];
    const start = Date.now();
    let processed = 0;

    for (const tripId of tripIds) {
      const carried = prior.get(tripId);
      if (args.skipPassed && carried?.status === "pass") {
        results.push(carried);
        continue;
      }

      let result: TripResult;
      try {
        result = await replayOneTrip(sql, tripId);
      } catch (e) {
        // A genuinely unexpected harness/DB error (not an engine error inside
        // the trip's own transaction, not the sentinel) -- record it and
        // keep going rather than aborting the whole sweep.
        result = {
          tripId,
          status: "engine-error",
          ms: 0,
          diffCount: 0,
          error: `harness error (not from reimportTrip itself): ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`,
        };
      }
      results.push(result);
      processed++;

      if (result.status !== "pass") {
        console.log(`  trip ${tripId}: ${result.status} (${result.diffCount} diff(s))`);
      }
      if (processed % CHECKPOINT_EVERY === 0) {
        console.log(`... ${processed}/${tripIds.length} processed (${Date.now() - start}ms elapsed)`);
        const checkpoint = summarize(args.replayDb, results, Date.now() - start);
        await writeReport(REPORTS_DIR, checkpoint, "checkpoint");
      }
    }

    const durationMs = Date.now() - start;
    const summary = summarize(args.replayDb, results, durationMs);
    console.log(
      `\nDone: ${summary.totalTrips} trips, ${summary.pass} pass, ${summary.fail} fail, ${summary.engineErrors} engine error(s), ${(durationMs / 1000).toFixed(1)}s.`,
    );

    await writeReport(REPORTS_DIR, summary, "checkpoint");
    if (isFullSweep) {
      const { jsonPath, mdPath } = await writeReport(REPORTS_DIR, summary);
      console.log(`Report written: ${jsonPath}\n              : ${mdPath}`);
    }

    if (summary.fail > 0 || summary.engineErrors > 0) process.exitCode = 1;
  } finally {
    await rawSql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : err);
  process.exitCode = 1;
});
