// Self-contained Postgres connection for e2e infrastructure (global-setup,
// global-teardown, and the walkthrough spec each open and close their own --
// they run in separate Node processes under Playwright, so there is no
// shared module-level singleton to reuse the way db/index.ts's `getSql()`
// gets away with inside the single long-running Next.js server process).
//
// Deliberately a THIN wrapper, not a reimplementation: the returned client is
// the same `postgres` package the app itself uses (`postgres(url, { max: 1,
// prepare: false })`, matching db/index.ts's own options), and satisfies
// db/queries/sql-tag.ts's `SqlTag` shape directly (tagged-template callable,
// `.begin` present) -- so it can be passed straight into
// parity/replay/capture.ts's `captureTripScope`/`findTripAffectedSiteIds`
// and any db/queries/*.sql.ts function exactly like `defaultSql()` would be,
// per the task brief's "reuse capture/differ modules" instruction.
import "./env";
import postgres from "postgres";

export type TestSql = ReturnType<typeof postgres>;

export function openTestSql(): TestSql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set -- expected in web/.env.local (see e2e/helpers/env.ts)");
  }
  return postgres(url, { max: 1, prepare: false });
}
