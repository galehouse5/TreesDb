// Playwright config for the P3-10 wizard walkthrough (doc 05 §P3-10, doc 07
// §8 last paragraph). This project's only Playwright suite lives under
// web/e2e/**; `pnpm test` (vitest) never sees these files -- vitest.config.ts's
// `include` globs are scoped to lib/**, db/**, parity/**, scripts/**, and
// app/**/*.test.ts only, none of which match anything under e2e/, and this
// suite's own files are named `*.e2e.ts` for extra clarity.
//
// Points at the ALREADY-RUNNING dev server (task brief: "never start/stop/
// restart it") via `baseURL` -- deliberately no `webServer` block.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
