# TreesDb — web/ (Next.js migration target)

The modern rebuild of TreesDb: **Next.js (App Router) + TypeScript + Tailwind +
Drizzle ORM + Postgres**. See [`../MODERNIZATION.md`](../MODERNIZATION.md) for the
overview and [`../docs/migration/`](../docs/migration/) for the executable plan.
This is **Phase 0 (foundation)** — a running skeleton; nothing user-facing ships yet.

## Prerequisites

- Node 20+ (Node 24 in use here) and **pnpm** (`corepack enable`).
- A Postgres database for `DATABASE_URL` — either:
  - **Local**: a local Postgres 16 (`postgres://postgres:postgres@localhost:5432/treesdb`), or
  - **Neon** (target hosting): create a project at neon.tech, use the pooled connection string.

## Setup

```bash
pnpm install
cp .env.example .env.local   # then fill in DATABASE_URL (others optional for now)
```

Environment variables are documented in [`.env.example`](.env.example). Never
commit real secrets or production connection strings.

## Local dev

```bash
pnpm dev         # http://localhost:3000
```

Health check (proves the app boots; reports DB round-trip time once
`DATABASE_URL` is set): <http://localhost:3000/health>

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` / `pnpm start` | production build / serve |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` / `pnpm test:watch` | Vitest (domain-logic + parity suites) |
| `pnpm db:generate` | Drizzle Kit: generate migration SQL from `db/schema.ts` |
| `pnpm db:migrate` | apply migrations |
| `pnpm db:studio` | Drizzle Studio |

## Layout

```
web/
  app/            Next.js App Router routes (app/health is the P0-01 probe)
  db/             Drizzle client (index.ts) + schema (schema.ts, filled in P0-02)
  lib/            pure domain logic — units, coordinates, rucker, merge, hashing (later phases)
  parity/         capture + verify tooling; parity/dumps/ is gitignored (production data)
  scripts/        ETL + photo migration (tsx)
```

## Hosting setup (repo owner)

- **Neon**: create a project; put the pooled URL in Vercel env + local `.env.local`.
- **Vercel**: import the repo, set the root directory to `web/`, add env vars from
  `.env.example`. Hobby plan (free, non-commercial).

Status of Phase 0 tasks lives at the top of
[`../docs/migration/02-phase0-foundation.md`](../docs/migration/02-phase0-foundation.md).
