// Playwright globalTeardown (doc 05 §P3-10 brief step 4: "remove the
// walkthrough trip's canonical + staging rows and the throwaway user...
// verify counts restored"). Runs once after every test file finishes
// (pass or fail), in the Playwright runner's own Node process.
//
// Removal reuses `db/queries/import-drafts.sql.ts`'s `removeTrip` -- "the
// History Remove action's removeTrip is the tested way", per the brief --
// via `helpers/auth-user.ts`'s `deleteThrowawayUserAndTrips`, which looks up
// every import trip the throwaway user owns (not a single hardcoded trip id)
// so this cleans up correctly whether the spec created exactly one trip,
// failed before creating any, or (a prior interrupted run's leftovers)
// several.
import "./helpers/env";
import fs from "node:fs";
import { openTestSql } from "./helpers/db";
import { deleteThrowawayUserAndTrips } from "./helpers/auth-user";
import { loadGlobalCounts } from "../parity/replay/capture";
import type { SqlTag } from "../db/queries/sql-tag";
import { STATE_FILE, type WalkthroughState } from "./global-setup";

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(STATE_FILE)) {
    console.warn("[global-teardown] no state file found -- global-setup did not run or already cleaned up; nothing to do.");
    return;
  }
  const state: WalkthroughState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));

  const sql = openTestSql();
  try {
    const removedTripIds = await deleteThrowawayUserAndTrips(sql, state.userId);
    console.log(`[global-teardown] removed ${removedTripIds.length} trip(s) [${removedTripIds.join(", ")}] and user ${state.email} (id ${state.userId}).`);

    const [userCountRows, importTripCountRows, global] = await Promise.all([
      sql<{ count: string }[]>`select count(*)::text as count from users`,
      sql<{ count: string }[]>`select count(*)::text as count from import_trips`,
      loadGlobalCounts(sql as unknown as SqlTag),
    ]);
    const after = {
      users: Number(userCountRows[0]!.count),
      importTrips: Number(importTripCountRows[0]!.count),
      sites: global.sites,
      states: global.states,
      trees: global.trees,
      treeMeasurements: global.treeMeasurements,
      siteVisits: global.siteVisits,
    };

    const mismatches: string[] = [];
    for (const key of Object.keys(state.beforeCounts) as (keyof typeof state.beforeCounts)[]) {
      if (state.beforeCounts[key] !== after[key]) {
        mismatches.push(`${key}: before=${state.beforeCounts[key]} after=${after[key]}`);
      }
    }

    if (mismatches.length > 0) {
      throw new Error(`[global-teardown] row counts NOT restored after cleanup:\n${mismatches.join("\n")}`);
    }
    console.log("[global-teardown] row counts restored to pre-walkthrough state -- cleanup verified.");
  } finally {
    await sql.end({ timeout: 5 });
    fs.rmSync(STATE_FILE, { force: true });
  }
}
