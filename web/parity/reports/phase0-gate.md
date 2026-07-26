# Phase 0 exit gate — TreesDb migration

Gate defined in `docs/migration/07-parity-testing.md` §10, row "Phase 0":
**§7.1 zero diffs on all tables; §7.2 all six views + search TVFs
row-identical; §7.3 suites green; full snapshot capture complete & manifest
committed.**

## 1. Verdict

**All four doc-07 §10 Phase 0 requirements are MET.** Two administrative
items outside that gate row remain open (see §1.5).

| # | Requirement (doc 07 §10) | Status | Evidence |
|---|---|---|---|
| 1 | §7.1 data parity: zero diffs, all tables | **MET** | `reports/data-2026-07-17.md` — 220,224 checks run, 220,224 pass, 0 fail, 0 waived |
| 2 | §7.2 derived parity: 6 views + 3 search TVFs, row-identical | **MET** (10 predeclared waivers) | `reports/derived-2026-07-17.md` — 27,315 checks run, 27,305 pass, 0 fail, 10 waived (all W-001) |
| 3 | §7.3 formatting/algorithm golden suites green | **MET** | `web/lib/**` vitest suites pass locally (run via `pnpm test`; not yet CI-verified, see §1.5) |
| 4 | Full snapshot capture complete + manifest committed | **MET** | `snapshots/README.md` + per-category `manifest.json`; 9,690 requests across 7 captured categories (`autocomplete` 11, `exports` 2,540, `markerinfo` 1,762, `markers` 1,683, `pages` 3,660, `redirects` 4, `search` 30 — sums to 9,690), ~114 MB, per `docs/migration/02-phase0-foundation.md` P0-08 note |

### 1.5 Open administrative items (outside the doc-07 gate row)

- **CI has not yet run.** The working branch
  (`claude/modernize-tech-stack-infra-6z95l8`) is 17 commits ahead of
  `origin` and unpushed; P0-10 (GitHub Actions: lint/typecheck/vitest/build)
  is committed but has never executed against this branch's HEAD.
- **Hosting environments not yet provisioned.** `DATABASE_URL` for Neon (and
  the paired Vercel project) are documented as setup steps in
  `web/README.md` but not yet created — local work has run against LocalDB
  (dump source) and local Postgres 16.9 (ETL target + parity target).

## 2. Method summary

Production data was **not** pulled via a live run against Azure SQL.
Instead, the repo owner supplied a bacpac export,
`Tmd_Production-2026-7-12-0-25.bacpac` (exported 2026-07-12T00:25 local),
which was imported into **LocalDB**. `web/scripts/dump-legacy.ps1` /
`dump-legacy.sql` then ran against that LocalDB import with the
`-UseSqlClient` path (`docs/migration/02-phase0-foundation.md` P0-03 note).
The resulting CSVs were loaded into local **Postgres 16.9** via
`web/scripts/migrate-data.ts` (17/17 tables, 0 errors, 30 FKs validated
clean — `reports/etl-load-2026-07-17.json`), and both the data-parity and
derived-parity suites ran against that load.

**Dump → capture divergence window: 2026-07-12T00:25 → 2026-07-17.** The
legacy snapshot capture (`snapshots/README.md`) ran against the *live*
site `https://www.treesdb.org` on 2026-07-17, between 19:56:55Z and
21:17:39Z UTC — 5 days after the dump instant. Rationale for treating this
as acceptable: the site is the owner's own low-traffic personal database,
so no bulk edits are expected in that window, though individual
sites/trees/species may have been added or corrected. Any parity mismatch
traceable to a mid-window edit (rather than a genuine ETL/app bug) is to be
re-checked against a fresh delta capture at the Phase 4 freeze before being
treated as a real failure.

## 3. Waivers exercised

Only **W-001** (species max-tree tie-breaking, lowest Id — predeclared per
doc 07 §9, no additional repo-owner sign-off required) was exercised, and
only in the derived-parity suite:

- 10 total waived diffs, all `W-001`, all on `Max*TreeId` columns where the
  formatted max value itself matched but the linked tree id differed among
  float32-tied candidates:
  - `measured_species.maxCrownSpreadTreeId`: 2 occurrences
  - `measured_species_by_state.maxHeightTreeId`: 6 occurrences
  - `measured_species_by_state.maxGirthTreeId`: 2 occurrences

(Full list with expected/actual ids in `reports/derived-2026-07-17.json` /
`.md`.) **Zero other waivers** (W-002/W-003/W-004) were invoked — no photo,
export-order, or marker-order comparisons ran in Phase 0 (those are Phase 1
categories per doc 07 §10).

## 4. Findings ledger — parity-proven corrections made during Phase 0

- **CP1252 species-hash encoding**: 3 production species names contain
  U+2019 (curly apostrophe); the species-hash port had to read them via the
  CP1252 byte path (not naive UTF-8) to reproduce legacy's
  `ComputedMeasuredSpeciesId` hash.
- **T-SQL `SUM(real)` double-accumulation vs Postgres `float4`**: legacy's
  SQL Server accumulates `SUM(real)` internally as `float` (double); the
  Postgres port had to cast to `::float8` before summing for RHI/RGI to
  match, or float32 rounding drifted.
- **SQL Server ANSI-padding trailing-space equality**: `searchStates`
  needed an explicit `rtrim` to reproduce SQL Server's
  trailing-space-insensitive string equality under ANSI_PADDING.
- **Embedded CR/LF in 4 comment columns**: production data contains raw
  CR/LF inside comment fields, which forced the dump tooling onto the
  SqlClient path (`-UseSqlClient`) rather than plain `sqlcmd`/`bcp` CSV
  output.
- **Materialized `ComputedMeasuredSpecies*` cache tables**: production
  maintains these as materialized cache tables, not views; verified fresh
  (0 diffs) against the source-view recomputation before being trusted as
  ETL input.
- **Production has zero photos**: `Photos.Photos` and `Photos.References`
  both contain 0 rows in the bacpac. P0-09 (photo blob migration) is
  therefore N/A for Phase 0 — script committed for completeness, nothing to
  migrate, and the `photos` capture category is consequently a no-op (no
  manifest entries).

## 5. Known open items for Phase 1

- **Live-legacy 500s on specific grid sort columns** — 16 requests in the
  `pages` capture returned HTTP 500 (`snapshots/pages/manifest.json`), all
  on three grids: `Browse/Sites/436/Details` site-species grid
  (sort=`ScientificName`/`Number`); `Browse/States/1/Details` state-species
  grid (`stateSpeciesSort`=`ScientificName`/`Number`) and state-sites grid
  (`sitesSort`=`Name`/`VisitCount`/`TreesMeasuredCount`); and
  `Browse/Species/Abies alba (Silver Fir)/Details?...&stateId=1`
  (`stateSpeciesSort`=`Number`) — each both sort directions. Needs a
  Phase 1 decision: reproduce the 500 faithfully, or waive and fix forward.
- **Nested-parens species URL 404** — `Vitis labrusca (Northern Fox Grape
  (Vine))/Details`; 9 further 404s on `Browse/Species/Abies alba (Silver
  Fir)/Details?...&siteId=436` trees-sub-grid variants, keyed to the same
  site 436 as the 500s above, plausibly the same underlying legacy bug.
  Needs a redirect/routing decision before the Phase 4 redirect-map gate
  (doc 07 §5.6).
- **Corpus TODOs**: 9 species-site mispaired grid entries and duplicate
  autocomplete terms flagged during corpus construction — not yet
  independently re-verified against an on-disk artifact as part of this
  report; carry forward for Phase 1 corpus cleanup.
- **200-scraped-formatting-values golden vectors** (doc 07 §7.3) — not yet
  generated from the captured pages. The corpus/capture exists
  (`snapshots/pages/`); extracting the 200 real formatted values + their
  float32 inputs from the dump into `web/lib/**` golden vectors is
  outstanding work for Phase 1.

## 6. Reproduction commands

All suites below run against **local Postgres 16.9** (no Neon dependency
yet). From `web/`:

```bash
# ETL load (idempotent; --reset TRUNCATEs + reloads; needs DATABASE_URL in .env.local
# and dumps under web/parity/dumps/, gitignored, from P0-03)
pnpm tsx scripts/migrate-data.ts --reset

# Data parity (doc 07 §7.1) — reads web/parity/dumps/ (gitignored, PII)
pnpm tsx web/parity/data/verify-data.ts --report

# Derived parity (doc 07 §7.2) — reads web/parity/snapshots/derived/ (committed)
pnpm tsx web/parity/data/verify-derived.ts --report

# Formatting/algorithm golden suites (doc 07 §7.3), and all other vitest suites
pnpm test

# Legacy snapshot capture — resumable/idempotent, skips artifacts already on disk
pnpm tsx web/parity/capture.ts --base-url https://www.treesdb.org --category all
# add --refresh to force re-fetch of already-captured artifacts
```

---

## Addendum — 2026-07-17 (same day, post-gate)

Both administrative items from §1.5 are now closed:

- **CI**: branch pushed to GitHub; first Actions run **green** (lint,
  typecheck, 334 tests against the Postgres service container + synthetic
  seed, build).
- **Hosting**: Neon provisioned via the Vercel Marketplace (project
  `treesdb`, plan free_v3) and connected to the `treesdb-web` project.
  Migrations + the ETL ran against Neon (17/17 tables, 0 errors, 30 FKs
  clean) over the unpooled connection, and both parity suites were re-run
  **against Neon** with results identical to the local run: verify-data
  220,224 checks / 0 diffs; verify-derived 27,315 checks / 0 failures /
  10 W-001 waived. Production deployment at https://treesdb-web.vercel.app
  serves `/health` `{"status":"ok"}` with a live DB round-trip.

Phase 0 is closed with no open items. Phase 1 may begin.
