import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Domain logic in lib/ is pure and framework-free (doc 00 §6); run it in the
// fast node environment. Golden-vector suites (units, rucker, merge, hashing,
// tokens) will live alongside their modules under lib/.
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "db/**/*.test.ts",
      "parity/**/*.test.ts",
      // scripts/etl/*.test.ts — P0-04 ETL loader unit + PGlite integration
      // tests (migrate-data.ts's task brief explicitly directs
      // `pnpm vitest run scripts`; this include is required for that to
      // find anything).
      "scripts/**/*.test.ts",
      // app/**/*.test.ts — P1-09 added this pattern for
      // app/api/species/suggest/rank.test.ts (the Jaro/Jaro-Winkler
      // autocomplete-ranking port, which is pure/framework-free logic like
      // lib/** but lives under app/ per that task's file-ownership grant,
      // not lib/**). No pre-existing app/**/*.test.ts files were present
      // before this addition (verified: this was the only test file under
      // app/ at the time) -- purely additive, doesn't affect any other
      // suite's discovery.
      "app/**/*.test.ts",
    ],
    // Many suites boot an in-memory PGlite (WASM Postgres) in beforeAll.
    // At full thread parallelism the concurrent WASM boots contend for CPU
    // and trip the default 10s hook timeout (observed locally: 5 files
    // flake at 20+ workers, all green at 2). Forks + a small worker cap +
    // a generous hook timeout make `pnpm test` deterministic everywhere,
    // including 2-core CI runners.
    pool: "forks",
    maxWorkers: 2,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
