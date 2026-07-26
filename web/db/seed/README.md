# db/seed/

CI-only seed data, run by `.github/workflows/ci.yml` against the ephemeral
Postgres 16 service container (never against Neon/production).

## What's here now

`seed.sql` — 3 synthetic `users` rows (`alice@example.com`,
`bob@treesdb.org`, `carol@example.com`), built from the password test
vectors in `docs/migration/01-system-reference.md` §6.1. Plain SQL (not
Drizzle) so this doesn't depend on `web/db/schema.ts`, which is written by
a parallel task (P0-02). Wrapped in a transaction, idempotent
(`ON CONFLICT (id) DO NOTHING`, fixed ids 1–3 via `OVERRIDING SYSTEM
VALUE`).

Applied by CI only when migration SQL exists yet
(`hashFiles('web/db/migrations/**/*.sql')`) — see the "Run migrations" /
"Seed database" steps in `../../.github/workflows/ci.yml`. Until P0-02's
migrations land, these steps are skipped and don't fail the build.

## What's blocked / coming later

Public-data tables — `countries`, `states`, `sites`, `site_visits`,
`site_visitors`, `trees`, `tree_measurements`, `tree_measurers`,
`known_species`, `photos`, `photo_references`, `import_trips`,
`import_trip_measurers`, `import_sites`, `import_trees`, `import_trunks`
— are **not** seeded here. Per `docs/migration/02-phase0-foundation.md`
§P0-10, that data has no PII and could in principle be committed, but it
depends on:

1. **P0-03** (production dump) landing in `web/parity/dumps/` (gitignored)
   and `web/parity/snapshots/derived/` (committed, public data only).
2. **P0-04** (ETL load, `web/scripts/migrate-data.ts`) — the same loader
   used for the real migration, run against the CI Postgres instance (or a
   trimmed/representative subset of it) to produce a committable
   public-data seed.

Once that lands, this directory should gain a second seed artifact (e.g.
`seed-public.sql` or a generated fixture derived from the dump) and the CI
workflow's seed step should apply it after `seed.sql`. Until then, `users`
is the only table CI integration tests can rely on having rows in.

## Why `users` only, and why synthetic

`users` contains real PII in production, so it's the one table that can
never be seeded from the dump into a public/CI-visible fixture. Doc 02
§P0-10 calls for exactly this: all tables except `users` get a committed
public-data seed (blocked, see above); `users` gets 3 synthetic fixture
rows built from the doc 01 §6.1 password vectors instead, so password
hashing / login golden-vector tests have real rows to exercise in CI.
