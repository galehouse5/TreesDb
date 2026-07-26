// Loads web/.env.local (DATABASE_URL) before any DB-touching e2e helper runs.
// Import this as the FIRST import in global-setup.ts, global-teardown.ts,
// and the walkthrough spec itself -- dotenv only needs to run once per
// process, but importing it repeatedly is a harmless no-op (dotenv doesn't
// override already-set vars by default).
//
// Playwright's config/global-setup/global-teardown and each test worker are
// separate Node processes, so this file's module-level side effect (calling
// `config()`) needs to happen again in each -- there is no single shared
// process to rely on, unlike a normal `import "dotenv/config"` inside one
// long-running app server.
import path from "node:path";
import { config } from "dotenv";

config({ path: path.join(__dirname, "..", "..", ".env.local") });
