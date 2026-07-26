// P3-10 Playwright wizard walkthrough (doc 05 §P3-10, doc 07 §8 last
// paragraph). Drives the REAL import wizard UI end to end (Trip -> Sites ->
// Trees -> Review -> Finish) as the throwaway user, typing in oracle trip
// 906's historical data (reconstructed from its still-present `import_*`
// draft rows -- see helpers/oracle.ts + e2e/README.md for why 906), then
// asserts the resulting canonical rows equal that trip's own canonical rows
// by natural key (helpers/scoped-capture.ts, built on
// parity/replay/capture.ts + differ.ts). Closes the loop UI -> parser ->
// engine -> DB.
import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { STATE_FILE, type WalkthroughState } from "./global-setup";
import { loadOracleTrip, type OracleTripPlan } from "./helpers/oracle";
import { openTestSql } from "./helpers/db";
import { captureOwnTripScope, diffOwnTripScopes } from "./helpers/scoped-capture";
import type { SqlTag } from "../db/queries/sql-tag";

const ORACLE_TRIP_ID = 906;

function readState(): WalkthroughState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`walkthrough.e2e.ts: no state file at ${STATE_FILE} -- global-setup did not run.`);
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

test.describe("import wizard walkthrough (oracle trip 906)", () => {
  test("typing trip 906's data through the real wizard reproduces its canonical rows", async ({ page }) => {
    const state = readState();
    const sql = openTestSql();
    let plan: OracleTripPlan;
    try {
      plan = await loadOracleTrip(sql, ORACLE_TRIP_ID);

      // Sanity on the oracle plan itself -- fail fast with a clear message
      // rather than a confusing UI-level failure if trip 906's draft rows
      // ever change shape (e.g. gain a second site).
      expect(plan.sites).toHaveLength(1);
      expect(plan.sites[0]!.trees).toHaveLength(3);

      // -----------------------------------------------------------------
      // 1. Log in as the throwaway import-role user.
      // -----------------------------------------------------------------
      await page.goto("/account/login?callbackUrl=/import");
      await page.locator('[name="email"]').fill(state.email);
      await page.locator('[name="password"]').fill(state.password);
      await page.getByRole("button", { name: "Log in" }).click();
      await page.waitForURL("**/import");

      // -----------------------------------------------------------------
      // 2. Start a new trip.
      // -----------------------------------------------------------------
      await page.getByRole("button", { name: "Start a new trip" }).click();
      await page.waitForURL(/\/import\/\d+\/trip$/);
      const tripMatch = page.url().match(/\/import\/(\d+)\/trip$/);
      if (!tripMatch) throw new Error(`could not parse new trip id from URL ${page.url()}`);
      const newTripId = Number(tripMatch[1]);
      console.log(`[walkthrough] new trip id = ${newTripId} (oracle = ${ORACLE_TRIP_ID})`);

      // -----------------------------------------------------------------
      // 3. Trip step.
      // -----------------------------------------------------------------
      await page.locator('[name="name"]').fill(plan.name);
      await page.locator('[name="date"]').fill(plan.date);
      await page.locator('[name="measurerContactInfo"]').fill(plan.measurerContactInfo);
      if (plan.makeMeasurerContactInfoPublic) {
        await page.locator('[name="makeMeasurerContactInfoPublic"]').check();
      } else {
        await page.locator('[name="makeMeasurerContactInfoPublic"]').uncheck();
      }
      await page.locator('[name="firstMeasurer"]').fill(plan.firstMeasurer);
      await page.locator('[name="secondMeasurer"]').fill(plan.secondMeasurer);
      await page.locator('[name="thirdMeasurer"]').fill(plan.thirdMeasurer);
      await page.locator('[name="website"]').fill(plan.website);
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForURL(/\/import\/\d+\/sites$/);
      await expectNoErrorAlerts(page);

      // -----------------------------------------------------------------
      // 4. Sites step -- exactly one site, auto-created blank and already
      // in edit mode (fails Required validation until filled in).
      // -----------------------------------------------------------------
      const site = plan.sites[0]!;
      await page.locator('[name="name"]').fill(site.name);
      await page.locator('[name="coordinates"]').fill(site.coordinates);
      await page.locator('[name="stateId"]').selectOption({ value: String(site.stateId) });
      await page.locator('[name="county"]').fill(site.county);
      await page.locator('[name="ownershipType"]').fill(site.ownershipType);
      await page.locator('[name="ownershipContactInfo"]').fill(site.ownershipContactInfo);
      if (site.makeOwnershipContactInfoPublic) {
        await page.locator('[name="makeOwnershipContactInfoPublic"]').check();
      } else {
        await page.locator('[name="makeOwnershipContactInfoPublic"]').uncheck();
      }
      await page.locator('[name="comments"]').fill(site.comments);
      await page.getByRole("button", { name: "Save site" }).click();
      await page.waitForURL(/\/import\/\d+\/sites$/);
      await expectNoErrorAlerts(page);

      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForURL(/\/import\/\d+\/trees$/);
      await expectNoErrorAlerts(page);

      // -----------------------------------------------------------------
      // 5. Trees step -- one auto-created blank tree to start; "Add tree"
      // for the remaining two (redirects straight into edit mode).
      // -----------------------------------------------------------------
      await page.getByRole("link", { name: "Edit" }).click();
      await page.waitForURL(/\/import\/\d+\/trees\?edit=\d+$/);
      await fillTreeForm(page, site.trees[0]!);
      await saveTreeForm(page);
      await expectNoErrorAlerts(page);

      for (let i = 1; i < site.trees.length; i++) {
        await page.getByRole("button", { name: "Add tree" }).click();
        await page.waitForURL(/\/import\/\d+\/trees\?edit=\d+$/);
        await fillTreeForm(page, site.trees[i]!);
        await saveTreeForm(page);
        await expectNoErrorAlerts(page);
      }

      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForURL(/\/import\/\d+\/review$/);

      // -----------------------------------------------------------------
      // 6. Review + Finish.
      // -----------------------------------------------------------------
      await expect(page.getByText("Fix these before finishing")).toHaveCount(0);
      await page.getByRole("button", { name: "Finish" }).click();
      await page.waitForURL(/\/import\/history$/, { timeout: 20_000 });

      // -----------------------------------------------------------------
      // 7. Assert: this new trip's own canonical rows equal oracle trip
      // 906's own canonical rows, by natural key (reusing parity/replay's
      // capture + differ modules -- see helpers/scoped-capture.ts).
      // -----------------------------------------------------------------
      const sqlTag = sql as unknown as SqlTag;
      const pre = await captureOwnTripScope(sqlTag, ORACLE_TRIP_ID);
      const post = await captureOwnTripScope(sqlTag, newTripId);

      expect(pre.sites.size, "oracle trip 906 should still attribute exactly one site").toBe(1);
      expect(post.sites.size, "new trip should attribute exactly one site (merged into the same site as 906)").toBe(1);

      const diffs = diffOwnTripScopes(pre, post);
      if (diffs.length > 0) {
        console.error("[walkthrough] unexpected diffs:\n" + JSON.stringify(diffs, null, 2));
      }
      expect(diffs, `walkthrough trip ${newTripId} vs oracle trip ${ORACLE_TRIP_ID}: ${diffs.length} unexpected diff(s), see log above`).toEqual([]);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});

async function expectNoErrorAlerts(page: import("@playwright/test").Page): Promise<void> {
  // Every field-validation message in this wizard is a `<p role="alert">`
  // (Trip/Sites/Trees step forms alike -- see e.g. app/import/[tripId]/trip/page.tsx's
  // `errorFor` rendering). A bare `[role="alert"]` selector also matches
  // Next.js's own persistent route-announcer live region (present on every
  // page, holding the current page title for screen readers) -- scoping to
  // the `p` tag excludes that unrelated element.
  await expect(page.locator('p[role="alert"]')).toHaveCount(0);
}

async function fillTreeForm(
  page: import("@playwright/test").Page,
  tree: OracleTripPlan["sites"][number]["trees"][number],
): Promise<void> {
  await page.locator('[name="commonName"]').fill(tree.commonName);
  await page.locator('[name="scientificName"]').fill(tree.scientificName);
  await page.locator('[name="heightMeasurementMethod"]').selectOption({ value: String(tree.heightMeasurementMethod) });
  await page.locator('[name="height"]').fill(tree.height);
  await page.locator('[name="girth"]').fill(tree.girth);
  await page.locator('[name="crownSpread"]').fill(tree.crownSpread);
  await page.locator('[name="elevation"]').fill(tree.elevation);
  await page.locator('[name="coordinates"]').fill(tree.coordinates);
}

async function saveTreeForm(page: import("@playwright/test").Page): Promise<void> {
  // Not `getByRole("button", { name: "Save" })`: the page footer's unrelated
  // units-preference form (every page in the app) also has a "Save" button,
  // making that locator ambiguous. TreeForm's own submit button is uniquely
  // identified by its `name="intent"` attribute (tree-form.tsx).
  await page.locator('button[name="intent"]').click();
  await page.waitForURL(/\/import\/\d+\/trees$/);
}
