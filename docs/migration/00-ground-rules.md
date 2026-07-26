# 00 — Ground Rules for Executing This Migration

These rules exist because the executor (human or AI) will face hundreds of
small judgment calls. The defaults below resolve most of them. When in doubt,
**preserve legacy behavior and record the question in `DECISIONS.md`** rather
than improvising.

## 1. Sources of truth, in order

1. **The legacy code** in `TMD/`, `TMD.Model/`, `TMD.Infrastructure/`,
   `Tmd.Migrations/`. If this plan and the code disagree, the code wins —
   fix the plan doc in the same commit and note it in `DECISIONS.md`.
2. **Captured snapshots** of the live legacy site (see doc 07). These are the
   behavioral oracle.
3. This plan.

Never trust memory of "how ASP.NET usually does it" over what this codebase
actually does. This app is idiosyncratic (email-as-password-salt, float32
columns, planar geo math, MD5-derived IDs).

## 2. Never touch the legacy projects

- Do not edit, reformat, upgrade, or delete anything under `TMD*`,
  `Tmd.*`, or `ThirdPartyAssemblies/`. The legacy app must stay exactly
  as-deployed until Phase 4 teardown.
- All new code goes in `web/`. All plan docs in `docs/migration/`.

## 3. Preserve behavior — including the weird parts

The reference doc (01) flags several legacy **bugs and quirks**. The default
is: *preserve observable behavior users depend on; do not replicate dead or
broken code paths; when unsure, ask via `DECISIONS.md`.* Specifically:

**Must preserve exactly** (things that break data or logins if "fixed"):
- Password hashing scheme for existing users (§6 of doc 01). Verification
  must trim the candidate password (legacy `VerifyPassword` trims; hashes
  were created untrimmed — preserve the asymmetry for verification).
- Float32 (`real`) storage precision for all measurements and coordinates.
  Use Postgres `real`, and `Math.fround` in TypeScript before comparing or
  formatting. Never widen to double — formatted output and merge equality
  depend on float32 values.
- Coordinate parsing rounds to 5 decimal places of degrees with .NET
  `Math.Round` semantics (**banker's rounding / half-to-even**).
- The Rucker index formula, including the "NULL when fewer than N species"
  rule and per-species `max(Height)`/`max(Girth)` over `Trees.Trees`.
- Unit display formats and rounding (feet 1 dp with `'`, meters 2 dp,
  Rucker feet 2 dp / metric 3 dp, etc. — full table in doc 01 §7).
- Site/tree merge thresholds: 25 arc-minute planar proximity, name/state/
  county case-insensitive equality, exact coordinate equality for trees.
- Integer encodings of all enum columns (`DistanceFormat`,
  `CoordinatesFormat`, `TreeStatus`, roles bitmask, photo-reference
  discriminators…). The values are load-bearing (views test `!= 1`).

**Do NOT replicate** (record each in `DECISIONS.md` when encountered):
- The broken centimeters parse branch in `Distance.Create` (wrong regex
  group + wrong factor — effectively dead). New parser may support cm
  correctly.
- `SmallMapSquare.Size` returning the wrong enum member (display-only bug).
- `Volume.ToString(format)` ignoring its format argument.
- The `HeightMeasurements.Offset` cos-term bug (display-only; the Height
  formula itself must be preserved).
- Non-constant-time hash/token comparisons — new code uses
  `crypto.timingSafeEqual`.
- The dead `Import/New` route.
- Browser-compatibility gate (`IncompatibleBrowser`) — drop entirely.

## 4. Decision log

`docs/migration/DECISIONS.md` is append-only. Every entry:

```
## D-014: <short title>
- Date / phase:
- Context: <what forced a choice>
- Decision: <what was chosen>
- Legacy behavior: <what the old app did, file:line>
- Parity impact: <none | waiver W-xxx filed>
```

Deviations that change observable output additionally require a **waiver**
in `web/parity/waivers.md` (doc 07 §9) so the parity suite can account for
them. No silent behavioral drift, ever.

## 5. Verification discipline

- **A task is done when its checks pass, not when the code compiles.** Every
  task in the phase docs lists acceptance checks; run them and paste results
  into the commit message or PR description.
- Work test-first for anything in `web/lib/` (domain logic): transcribe the
  legacy rule into a failing test (using the golden vectors from doc 07),
  then implement.
- Keep the parity suite green: once a parity category passes at the end of a
  phase, later work must not regress it. Re-run affected categories after
  changes to queries, formatting, or schema.
- Do not proceed past a phase gate with failing checks. If a check cannot
  pass (e.g. live-site capture unavailable), stop and record what is blocked
  and why in `DECISIONS.md`, and surface it to the repo owner.

## 6. Coding conventions for `web/`

- TypeScript strict mode; no `any` in `lib/` or `db/`.
- Next.js App Router; server components by default; client components only
  for the map, grids' interactive controls, and forms that need them.
- All DB access through Drizzle in `web/db/queries/` — no inline SQL in
  route files (named exceptions: the search-ranking and metrics queries,
  which live in `web/db/queries/*.sql.ts` with the SQL visible).
- Domain logic (`web/lib/`) must be pure and framework-free: units,
  coordinates, rucker, merge, hashing, token codec. Everything in `lib/`
  has unit tests.
- Money-path formatting (anything a user sees or an export emits) goes
  through `web/lib/format.ts` — one implementation, used by pages, partial
  grids, CSV, and marker info alike, mirroring how legacy funnels through
  the value objects' `ToString(Units)`.
- Environment variables documented in `web/.env.example`; never commit
  secrets or production connection strings.

## 7. Data handling

- Production dumps (see doc 02) contain user emails and password hashes.
  They live under `web/parity/dumps/` which is **gitignored** — verify the
  gitignore entry exists before the first dump lands. Never commit them.
- Golden snapshot files (doc 07) contain only data the public site already
  serves; they are committed.
- The `Logging.Errors` table is not migrated.

## 8. Git & delivery

- Branch: work happens on the designated migration branch; commit per task
  with the task ID from the phase doc in the subject
  (e.g. `P1-07: species detail page + extractor parity`).
- Update the checklist at the top of the active phase doc in the same
  commit that completes a task.
- Small PRs per phase are preferred over one mega-PR; the parity report for
  the phase gate goes in the final PR of the phase.
