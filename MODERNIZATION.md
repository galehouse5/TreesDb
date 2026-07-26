# TreesDb Modernization & Migration Plan

TreesDb is migrating from ASP.NET MVC 5 / .NET Framework 4.5 on Azure (App
Service + Azure SQL) to Next.js on Vercel with Postgres on Neon. This file is
the overview; the executable, step-by-step specification lives in
[`docs/migration/`](docs/migration/).

**If you are an AI agent (or human) executing this migration: start with
[`docs/migration/00-ground-rules.md`](docs/migration/00-ground-rules.md), and
treat [`docs/migration/01-system-reference.md`](docs/migration/01-system-reference.md)
as the factual reference for how the legacy system behaves.**

## Document map

| Doc | Contents |
|---|---|
| [00-ground-rules.md](docs/migration/00-ground-rules.md) | How to execute this plan: conventions, verification discipline, decision log, what NOT to silently fix |
| [01-system-reference.md](docs/migration/01-system-reference.md) | Legacy system reference: routes, schema, SQL views/functions, domain algorithms (passwords, tokens, units, Rucker index, import merge, photos) |
| [02-phase0-foundation.md](docs/migration/02-phase0-foundation.md) | Scaffold the Next.js app, Postgres schema, ETL from Azure SQL |
| [03-phase1-readonly.md](docs/migration/03-phase1-readonly.md) | The read-only site: browse, search, map, exports, photo display |
| [04-phase2-auth.md](docs/migration/04-phase2-auth.md) | Accounts: registration, login, legacy password compatibility, tokens |
| [05-phase3-import-photos.md](docs/migration/05-phase3-import-photos.md) | Import wizard, merge algorithm, photo upload |
| [06-phase4-cutover.md](docs/migration/06-phase4-cutover.md) | DNS cutover, legacy URL redirects, decommissioning Azure |
| [07-parity-testing.md](docs/migration/07-parity-testing.md) | **Parity verification**: how we prove the new site matches the old one, functionally and data-wise |
| [DECISIONS.md](docs/migration/DECISIONS.md) | Running log of decisions and deliberate deviations from legacy behavior |

## Target stack

| Concern | Current | Target |
|---|---|---|
| Framework | ASP.NET MVC 5.2.3, .NET Framework 4.5 | **Next.js (App Router) + TypeScript + React** |
| Styling / UI | jQuery 1.4.4 + plugin zoo, custom "slate" widgets | **Tailwind CSS + shadcn/ui**, TanStack Table for grids |
| Database | Azure SQL (SQL Server) | **Postgres on Neon** (free tier, scale-to-zero) |
| ORM | NHibernate 3.3.3 + hbm.xml | **Drizzle ORM** |
| Auth | Forms Auth, custom salted-SHA-256 passwords | **Auth.js (NextAuth)** credentials provider, legacy-hash compatible with upgrade-on-login |
| Photo storage | Disk (`PhotoStore/`) or Azure Blob; resized on demand | **Cloudflare R2** originals + **sharp** variants |
| Maps | Google Maps JS (v2-era) | **MapLibre GL** + OpenStreetMap raster tiles |
| CSV | Hand-rolled `TreeCsvExporter` | **csv-stringify / csv-parse** (byte-compatible output — see parity doc) |
| Email | System.Net.Mail + SMTP | **Resend** |
| Errors / logging | ELMAH + log4net → `Logging.Errors` table | Vercel logs + **Sentry** free tier |
| Migrations | FluentMigrator + baseline SQL | **Drizzle Kit** |
| Hosting | Azure App Service | **Vercel Hobby plan** (free, non-commercial) |

Estimated cost: **$0/month** + domain. Free-tier fit (verified mid-2026):
Vercel Hobby (100 GB bandwidth, 1M function invocations/month, non-commercial
only — a free hobby site qualifies); Neon free (0.5 GB storage — ample, photos
live in R2; auto-resume ≈0.5 s, no manual unpause unlike Supabase free);
R2 free (10 GB, zero egress); Resend free (~3k emails/month).

## Phase summary

Each phase has a detailed spec doc and a **parity gate** — objective checks
(defined in [07-parity-testing.md](docs/migration/07-parity-testing.md)) that
must pass before the next phase begins.

- **Phase 0 — Foundation.** Scaffold `web/` (Next.js + Drizzle), port the
  schema to Postgres, ETL all data from Azure SQL, capture legacy snapshots.
  *Gate: 100% data parity (row counts, PK sets, field-level diffs) and 100%
  derived-metrics parity (Rucker indices, species aggregates).*
- **Phase 1 — Read-only site.** Home, browse grids, detail pages, search,
  map, CSV exports, photo display. This is most of the site and none of it
  requires auth. *Gate: export/marker/search/detail-page parity against
  captured snapshots.*
- **Phase 2 — Accounts.** Auth.js with legacy-compatible password
  verification (salt = lowercased email, SHA-256 over UTF-16LE) and silent
  rehash to argon2 on first login; registration; password assistance.
  *Gate: legacy hash test vectors green; migrated fixture users can log in.*
- **Phase 3 — Import wizard & photo upload.** The intricate part: the
  trip→sites→trees wizard and the site/tree merge algorithm.
  *Gate: replay parity — re-running historical imports reproduces the rows
  legacy attributed to those trips — plus a synthetic merge test suite.*
- **Phase 4 — Cutover.** Write freeze, final delta sync, DNS switch, legacy
  URL redirect map, Azure teardown. *Gate: redirect tests + final re-run of
  the full parity suite.*

## Non-goals (for now)

- Visual redesign (port the information architecture onto clean defaults;
  restyle later).
- PostGIS / great-circle geo math (legacy uses planar Euclidean degrees — we
  preserve it; see ground rules on behavior preservation).
- Background jobs, message queues, public API beyond the CSV exports.

## Repo layout during migration

```
/                    ← legacy solution stays put until Phase 4 (never edited)
  TMD/ …
  web/               ← new Next.js app (created in Phase 0)
    app/             routes
    db/              drizzle schema + migrations
    lib/             domain logic (units, rucker, merge, tokens, hashing)
    parity/          capture + verify tooling, corpus, snapshots (see doc 07)
    scripts/         ETL + photo migration
  docs/migration/    this plan
```
