// Playwright globalSetup (doc 05 §P3-10 brief: "throwaway import-role user...
// create via SQL, see db/queries/auth.sql.ts's USER_ROLE_BITS"). Runs once,
// in the Playwright runner's own Node process, before any test file.
//
// Responsibilities: (1) create the throwaway login user (idempotent -- see
// helpers/auth-user.ts's own header), (2) snapshot global row counts BEFORE
// the walkthrough touches anything, written to a temp-dir state file so
// global-teardown.ts (a SEPARATE process) can verify counts are restored
// afterward ("verify counts restored", doc 05 §P3-10 brief step 4). Uses
// `os.tmpdir()`, not a repo-local path, so no stray file is ever left inside
// the working tree even if a run is interrupted before teardown runs.
import "./helpers/env";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openTestSql } from "./helpers/db";
import { ensureThrowawayUser } from "./helpers/auth-user";
import { loadGlobalCounts } from "../parity/replay/capture";
import type { SqlTag } from "../db/queries/sql-tag";

export const STATE_FILE = path.join(os.tmpdir(), "treesdb-e2e-walkthrough-state.json");

export interface WalkthroughState {
  userId: number;
  email: string;
  password: string;
  beforeCounts: {
    users: number;
    importTrips: number;
    sites: number;
    states: number;
    trees: number;
    treeMeasurements: number;
    siteVisits: number;
  };
}

export default async function globalSetup(): Promise<void> {
  const sql = openTestSql();
  try {
    // Counts are captured BEFORE `ensureThrowawayUser` creates anything
    // (including before its own idempotent delete-if-exists step) -- the
    // "restored" baseline teardown checks against is the state with NO
    // throwaway user at all, matching what teardown leaves behind after it
    // deletes that same user.
    const [userCountRows, importTripCountRows, global] = await Promise.all([
      sql<{ count: string }[]>`select count(*)::text as count from users`,
      sql<{ count: string }[]>`select count(*)::text as count from import_trips`,
      loadGlobalCounts(sql as unknown as SqlTag),
    ]);

    const user = await ensureThrowawayUser(sql);

    const state: WalkthroughState = {
      userId: user.id,
      email: user.email,
      password: user.password,
      beforeCounts: {
        users: Number(userCountRows[0]!.count),
        importTrips: Number(importTripCountRows[0]!.count),
        sites: global.sites,
        states: global.states,
        trees: global.trees,
        treeMeasurements: global.treeMeasurements,
        siteVisits: global.siteVisits,
      },
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
    console.log(`[global-setup] throwaway user ${user.email} (id ${user.id}) ready; before-counts recorded.`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}
