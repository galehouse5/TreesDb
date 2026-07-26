# P3-10 Playwright wizard walkthrough

Doc 05 §P3-10 / doc 07 §8 last paragraph: a scripted browser run that enters a
**real historical trip's data** through the real import wizard UI (Trip →
Sites → Trees → Review → Finish) and asserts the resulting canonical DB rows
equal that trip's own canonical rows. Closes the loop UI → parser → engine →
DB — the one part of the merge algorithm that replay parity (doc 07 §8) can't
reach, because replay drives the engine directly and never touches a browser.

## How to run

The Next.js dev server must already be running against local Postgres on
`:3000` (this suite never starts/stops it — `playwright.config.ts` has no
`webServer` block, just `baseURL: "http://localhost:3000"`).

```
npx playwright test              # headless chromium, ~10-25s
npx playwright test --trace on   # keep a trace even on a pass, for debugging
npx playwright show-trace test-results/.../trace.zip
```

Runs repeatably: each run's `globalSetup` creates a throwaway login user
(idempotent — deletes any same-named leftover from an interrupted prior run
first) and records a "before" snapshot of global row counts; `globalTeardown`
removes every import trip that user created (via `removeTrip`, "the tested
way" per the task brief) and the user itself, then asserts every count is
back to the pre-run baseline. Nothing is left behind in `treesdb` between
runs, and nothing under `web/e2e/` is required for `pnpm test` (vitest) or
`npx tsc --noEmit` to stay clean — see "Isolation" below.

## The oracle trip: 906

**"St. Joseph's Cemetery, Auburn, NY"** (`import_trips.id = 906`), one of the
960 exact-fixed-point trips in `parity/reports/replay-2026-07-18.json`
(`results[].status === "pass"`, zero float32 drift on reimport). Chosen by
querying the local migrated DB for pass-list trips with:

- 1–2 sites, 2–5 **single-trunk** trees (the real legacy wizard's only
  reachable tree type, and it keeps the walkthrough's field-filling
  reasonably small — see `lib/import-trees.ts`'s header on
  single-vs-multi-trunk reachability),
- every `*_input_format` code directly typable through the wizard's text
  fields (excludes `Default(2)`, which is never produced by parsing free
  text — only by the clinometer sub-form this wizard doesn't expose),
- no whitespace-run species-name collision (D-016 — trip 906's species,
  White Oak/*Quercus alba* and Honeylocust/*Gleditsia triacanthos*, aren't in
  that list).

Trip 906 has exactly one site and three trees, exercising a genuinely mixed
set of formats in one small package:

| field | tree 1 (White Oak) | tree 2 (White Oak) | tree 3 (Honeylocust) |
|---|---|---|---|
| height | `70` DecimalFeet | *unspecified* | `86.3` DecimalFeet |
| girth | `19.88` DecimalFeet | `17.5` **FeetDecimalInches** | `15.083333` **FeetDecimalInches** |
| crown spread | `129.2` DecimalFeet | *unspecified* | *unspecified* |
| elevation | `780` DecimalFeet | *unspecified* | *unspecified* |
| coordinates | DDM, specified | DDM, specified | *unspecified* |

That's Unspecified, DecimalFeet, **and** FeetDecimalInches (the hardest
format to invert — two free parameters, see `helpers/round-trip.ts`) all
exercised, plus the site's own DDM coordinates and one tree with fully
unspecified coordinates (so its two trunk-identity-bearing trees, 1 and 2,
merge into pre-existing canonical trees, while tree 3 — unspecified
coordinates never merge, `lib/merge/predicates.ts`'s `shouldMergeTree` — gets
a brand-new canonical tree row every run, still natural-key-matched against
the original by the differ).

## Typing-script generation

`helpers/oracle.ts` reads trip 906's `import_trips` / `import_trip_measurers`
/ `import_sites` / `import_trees` rows **live** from the DB (never a baked-in
snapshot) and, for every distance/elevation/coordinate field, calls
`helpers/round-trip.ts` to turn the stored float32 value + `*_input_format`
code back into text a user could type — e.g. girth `17.5` stored as
`FeetDecimalInches(3)` becomes `"17' 5.999994277954102''"` (yes, that many
digits — see below), not the flattened `"17.5'"` a naive decimal-feet
formatter would produce.

This is **not** the same job as `lib/import-trees.ts`'s
`distanceToEditableText`/`elevationToEditableText`: those always render
decimal-feet text regardless of the stored format (fine for that file's
"redisplay an editor field" use case), which would silently flip the
reproduced `*_input_format` column — itself a real, compared column — on
every non-decimal-feet field. `round-trip.ts` reimplements the inverse
relationship precisely instead, format-by-format.

Two format families need more than closed-form division:

- **FeetDecimalInches** (2 free parameters: whole feet + inches) and every
  other unit-conversion format (meters/yards/centimeters) have no
  closed-form-exact inverse — `parseDistance`/`parseElevation` round each
  operation to float32 independently, so naive division is only an
  approximation. `round-trip.ts` computes a mathematically reasonable
  candidate, then **searches its nearby float32 neighbors** (bit-exact ULP
  steps) and verifies each one by calling the **real** `parseDistance`/
  `parseElevation`, stopping at the first exact match. Self-verifying by
  construction: a bad candidate just fails the check; if the whole search
  radius fails, it throws loudly at generation time, long before any browser
  opens.
- **Coordinates** turned out to need the same treatment, contrary to a first
  attempt reusing `lib/import-sites.ts`'s `formatStoredCoordinates` (which
  looked like the obvious fit — it exists for exactly "format a persisted
  coordinate back to editable text"). Empirically it isn't exact: it renders
  DDM minutes at a fixed 3 decimal places for human legibility, and
  reparsing that rounded text does **not** always reproduce the original
  float32 (confirmed against trip 906's own site latitude:
  `42.902931213378906` → `"42 54.176"` → reparses to `42.90293884277344`, a
  real, `Object.is`-visible difference). `round-trip.ts`'s own
  `coordinateAxisTypingText` instead searches for whatever-precision
  minutes/seconds text reproduces the target exactly (the parser's regex
  accepts any number of decimal digits, not just 3).

Every generated value is round-trip-verified against the actual app parsers
before the browser ever opens (`helpers/round-trip.ts` throws on failure).

## Spec structure

`walkthrough.e2e.ts`, one test:

1. Log in as the throwaway user (`/account/login`).
2. "Start a new trip" → capture the new trip id from the redirect URL.
3. **Trip step**: fill name/date/measurer-contact/measurers/website from the
   typing plan.
4. **Sites step**: fill the one auto-created blank site's fields (name,
   coordinates, state, county, ownership, comments), save, continue.
5. **Trees step**: edit the one auto-created blank tree (fills
   common/scientific name, height-measurement-method, height/girth/
   crown-spread/elevation/coordinates), save; "Add tree" + fill + save for
   the remaining two; continue.
6. **Review**: assert no blocking "Fix these before finishing" errors; click
   Finish.
7. **Assertion**: capture this new trip's own canonical rows (reusing
   `parity/replay/capture.ts`'s `captureTripScope`, scoped down to rows this
   trip specifically contributed — see `helpers/scoped-capture.ts`'s header
   for why a straight reuse of `captureTripScope` needs that extra scoping
   step for this "duplicate an existing trip's data" scenario, as opposed to
   replay's own "delete-then-reimport the same trip" scenario) and diff them
   against oracle trip 906's own canonical rows the same way, via
   `parity/replay/differ.ts`'s unmodified `diffTripScope` — ids and
   trip-attribution excluded (differ.ts's own exclude-lists plus one more,
   `importing_trip_id` itself, filtered out afterward since it's expected by
   construction here), everything else compared by natural key.

Global setup/teardown (`global-setup.ts`/`global-teardown.ts`) own the
throwaway user and the "verify counts restored" check; the spec itself only
asserts the diff.

## Isolation (why `pnpm test` / `npx tsc --noEmit` don't see this)

- `vitest.config.ts`'s `include` globs (`lib/**`, `db/**`, `parity/**`,
  `scripts/**`, `app/**/*.test.ts`) never match anything under `web/e2e/` —
  confirmed by running `npx vitest run` after adding this suite (still 83
  files / 1582 tests, unchanged). Every spec file here is also named
  `*.e2e.ts` for extra clarity even though it isn't load-bearing for that
  exclusion.
- `web/tsconfig.json`'s `exclude` gained `"e2e"` and `"playwright.config.ts"`
  so `@playwright/test`'s types never leak into the Next.js app build;
  confirmed clean with `npx tsc --noEmit` (no output) after this addition.

## UI bugs found while driving the real forms

None in application code. Two bugs were in this test suite's own first draft
(fixed before landing, not filed against the app):

- A too-broad `[role="alert"]` selector for "assert no validation errors"
  also matched Next.js's own persistent route-announcer live region (present
  on every page, holding the current page title for screen readers) — false
  positive on every navigation. Narrowed to `p[role="alert"]`, which is what
  every real field-validation message in this wizard actually renders as.
- `getByRole("button", { name: "Save" })` for the tree form's submit button
  collided with the page footer's unrelated units-preference "Save" button
  (present on every page). Switched to the tree form's own
  `button[name="intent"]` (unique to `TreeForm`'s submit button).

## Typecheck / vitest status

- `npx tsc --noEmit`: clean.
- `npx vitest run`: 83 files / 1582 tests, all passing, unchanged by this
  task.
- `npx playwright test`: passes repeatably (verified 3 consecutive runs),
  each one's teardown restoring `users`/`import_trips`/`sites`/`states`/
  `trees`/`tree_measurements`/`site_visits` row counts to their pre-run
  values.
