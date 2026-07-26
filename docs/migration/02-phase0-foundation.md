# 02 — Phase 0: Foundation (scaffold, schema, ETL, capture)

Goal: production data lives in Neon, the Next.js skeleton runs against it,
and the legacy site's behavior is snapshotted. **Nothing user-facing ships
in this phase.**

Checklist (update in-place as tasks land):

- [x] P0-01 scaffold
- [x] P0-02 Drizzle schema
- [x] P0-03 dump tooling + production dump — *run 2026-07-17 against the
      2026-07-12 production bacpac imported into LocalDB (-UseSqlClient
      path; production data contains embedded CR/LF in 4 comment columns)*
- [x] P0-04 ETL load — *17/17 tables into local Postgres 16.9, 0 errors,
      30 FKs clean*
- [x] P0-05 derived-object port (views/queries) — *row-identical to
      production dumps (see P0-07)*
- [x] P0-06 data-parity suite green (doc 07 §7.1) — *220,224 checks,
      0 diffs (report committed, users aggregates only)*
- [x] P0-07 derived-data parity green (doc 07 §7.2) — *27,315 checks over
      6 views + 3 search TVFs × 30 corpus terms: 0 failures, 10 waived
      (predeclared W-001 tie-breaks)*
- [x] P0-08 legacy snapshot capture complete (doc 07 §4) — *9,690 requests,
      ~114 MB across 7 categories, extractors spot-verified against real
      markup; divergence window dump 2026-07-12 → capture 2026-07-17 noted
      in snapshots/README.md. Live-site quirks recorded for Phase 1
      waivers: 16× 500 on specific grid sort columns, 1× 404 on a
      nested-parens species URL*
- [x] P0-09 photo blob migration — *N/A: production Photos.Photos and
      Photos.References contain 0 rows (verified in the bacpac); script
      committed for completeness, nothing to migrate*
- [x] P0-10 CI pipeline — *first run green 2026-07-17 (lint, typecheck,
      334 tests incl. pglite suites, build; Postgres service + synthetic
      seed) after branch push*

## P0-01 Scaffold

- `web/`: `create-next-app` (App Router, TS, Tailwind, ESLint) + shadcn/ui
  init + Drizzle + drizzle-kit + vitest + playwright + tsx.
- `web/.env.example`: `DATABASE_URL`, `R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET/BUCKET`,
  `RESEND_API_KEY`, `AUTH_SECRET`, `LEGACY_BASE_URL`, `SENTRY_DSN`.
- Add `web/parity/dumps/` to `.gitignore` **in this task**.
- Vercel project + Neon project created by repo owner; document setup steps
  in `web/README.md`.
- Acceptance: `pnpm build`, `pnpm test` pass in CI; a `/health` route
  returns DB round-trip time.

## P0-02 Drizzle schema

Translate doc 01 §2 exactly. Conventions:
- Postgres schema `public`, snake_case tables: `users`, `countries`,
  `states`, `sites`, `site_visits`, `site_visitors`, `trees`,
  `tree_measurements`, `tree_measurers`, `known_species`, `photos`,
  `photo_references`, `import_trips`, `import_trip_measurers`,
  `import_sites`, `import_trees`, `import_trunks`.
- Column names snake_case but 1:1 with legacy columns (`latitude`,
  `latitude_input_format`, …). Keep the `computed_*` metric columns as
  real columns maintained by the recompute job (doc 01 §4, D-004).
- Types per the mandatory mapping table (doc 01 §2). All identity columns
  `generated always as identity`; after ETL, `setval` sequences past max
  legacy Id.
- `computed_measured_species_id`: plain integer column **written by the
  ETL and by the app on insert/update** (Postgres generated columns can't
  call md5 helpers immutably across collations portably; app-maintained +
  parity check §7.1.5 is safer). Unique/index set: replicate legacy
  indexes minimally — PKs, `users.email` unique, FKs + indexes on all FK
  columns, index on `(scientific_name, common_name)` for both trees
  tables.
- Keep photo-reference single-table inheritance: one table + `type`
  smallint + nullable owner FKs, CHECK constraint "exactly one owner FK
  non-null for types 2–7".
- Acceptance: `drizzle-kit generate` produces migration SQL; empty-DB
  migrate runs clean; schema snapshot test committed.

## P0-03 Dump tooling (runs against Azure SQL — repo owner executes)

Provide `web/scripts/dump-legacy.sql` + `dump-legacy.ps1` (sqlcmd/bcp
wrapper) that the repo owner runs against the production Azure SQL DB. Per
table: explicit column list, `ORDER BY Id`, CSV with header, quoted fields,
UTF-8. Formatting rules exactly as doc 07 §7.1 (ISO datetimes via style
126, floats via `CONVERT(varchar(50), CAST(col AS float), 3)`, binary as
lowercase hex via `CONVERT(varchar(max), col, 2)` lowercased).
Also dump the derived objects (doc 07 §7.2 list) and the search-TVF corpus
evaluations, and `SELECT` the deployed `Web.config` photo-provider setting
(or repo owner confirms manually) to locate the photo originals.
Output lands in `web/parity/dumps/` (gitignored) except the derived-object
CSVs which go to `web/parity/snapshots/derived/` (public data, committed).

Acceptance: dumps present for all 17 migrated tables (the 18 effective
tables minus `Logging.Errors`) + 6 views + 3 TVF evaluations; row counts
recorded in `dumps/manifest.json`.

## P0-04 ETL load — `web/scripts/migrate-data.ts`

- Streams each CSV into Postgres with `COPY` (pg `copy from stdin`), in FK
  dependency order; identity inserts via `OVERRIDING SYSTEM VALUE`.
- Value transforms only where the type mapping demands (bit→bool,
  hex→bytea, datetime→timestamptz **as UTC** per D-002). No trimming, no
  case changes, no "cleanup".
- After load: validate FKs, `setval` sequences, `ANALYZE`.
- Idempotent: `--reset` drops and reloads.
- Acceptance: loads production dump with zero errors; doc 07 §7.1 checks
  1–2 (counts + PK sets) green.

## P0-05 Port the derived objects

Implement per doc 01 §4, as SQL in `web/db/queries/*.sql.ts`:
`measuredSpecies(siteId?/stateId?)`, `siteMetrics`, `stateMetrics`,
`measurerActivity`, `searchSites/States/MeasuredSpecies(term)` (with the
exact rank flags; escape LIKE metacharacters the way SQL Server did —
i.e. **not at all**: legacy passes the raw term into LIKE patterns, so
`%`/`_` behave as wildcards; preserve, note D-010), and the recompute job
`recomputeStaleMetrics()` (updates `computed_*` where `are_metrics_stale`).
Include the species-hash function (TS + SQL) with its unit vector.

Acceptance: doc 07 §7.2 parity green — every derived view row-identical to
the legacy dumps over production data.

## P0-06 / P0-07 Data-parity suite

Build `web/parity/data/` per doc 07 §7.1 and run to green. Commit the
report (aggregates only for `users`).

## P0-08 Legacy snapshot capture

Build `corpus.ts`, `capture.ts`, and the legacy extractors (doc 07 §§3–5),
then run full capture against the live site. Manual spot-check 5 artifacts
per category against the browser before bulk run. Commit snapshots +
manifest. **Do this as soon as data is dumped — same-day, to minimize
drift** (the site is low-write; record the dump and capture timestamps in
the manifest).

## P0-09 Photo blob migration — `web/scripts/migrate-photos.ts`

- Source: whichever store production uses (P0-03 determines: `PhotoStore/`
  directory on the App Service or Azure Blob container). Blobs are named
  `{photoId}` with no extension.
- Copy every photo id present in the `photos` table to R2 key
  `photos/{id}`, content-type from the `format` column.
- Verify: count match; sample 50 → byte-length equals `photos.bytes`
  column; log ids missing from the store (legacy served a fallback icon —
  list them, don't fail).
- Acceptance: verification report committed; missing-photo list reviewed
  by repo owner.

## P0-10 CI

GitHub Actions: lint, typecheck, vitest (includes all golden-vector
suites), build. Postgres service container + a **committed public-data
seed** (all tables except `users`, which gets 3 synthetic fixture rows
built from the doc 01 §6.1 vectors) so integration tests and, later,
parity `verify.ts` categories that don't need full production data can run
in CI. Full-data parity runs remain a local/Neon-branch activity at phase
gates.

## Phase 0 exit gate

Doc 07 §10 row "Phase 0": data parity zero-diff, derived parity green,
golden suites green, capture complete. Produce
`web/parity/reports/phase0-gate.md` summarizing all of it.
