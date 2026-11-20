# Decision Log

Append-only. Format per ground rules §4. Seeded with the decisions already
made in this plan; the executor appends from D-016 onward.

## D-001: Target stack
- Phase: planning. Decision: Next.js App Router + TS / Vercel Hobby /
  Neon Postgres / Drizzle / Auth.js / R2 / sharp / MapLibre+OSM / Resend /
  Sentry. Rationale in MODERNIZATION.md.

## D-002: Legacy datetime interpretation
- Context: legacy code uses `DateTime.Now`; Azure App Service default TZ
  is UTC, so stored datetimes are UTC wall-clock.
- Decision: ETL loads `datetime` as `timestamptz` assuming UTC. **Repo
  owner should confirm** the App Service never had WEBSITE_TIME_ZONE set;
  if it did, adjust the ETL offset and re-run.
- Parity impact: none if assumption holds; date-only fields unaffected.

## D-003: Species identity
- Context: legacy derives species IDs from an MD5-XOR hash (doc 01 §4).
- Decision: new app keys species by (ScientificName, CommonName) natural
  pair + slug (D-011). The hash is still implemented for ETL parity
  checks; it is not exposed in URLs or APIs.
- Parity impact: none observable (legacy never exposed the hash in URLs).

## D-004: Metrics recompute mechanism
- Context: legacy uses DB triggers + `UpdateStaleMetrics` proc.
- Decision: same stale-flag columns and recompute semantics, implemented
  as an app-level job run in the import/edit transaction (+ on-demand
  fallback). No Postgres triggers.
- Parity impact: none (computed values identical; verified §7.2).

## D-005: Password metric columns
- Decision: PasswordNumerics/Uppercase/Lowercase/Specials/Length are
  migrated as data but not maintained for argon2-upgraded users; dropped
  in a post-migration cleanup once all active users are upgraded.

## D-006: Units preference stays an anonymous cookie
- Same name (`unitsPreference`), values, 10-year expiry. Visitors keep
  their preference across the cutover.

## D-007: Map marker JSON contract preserved; info popups re-implemented
- Markers keep the legacy JSON shape (parity §5.2). Info popups move from
  HTML partials to components fed by JSON with the same displayed fields
  (extractor parity §5.4).

## D-008: Photos — originals in R2, variants generated at upload + cached
- Legacy resized on every request. New app precomputes/caches variants in
  R2 under `photos/{id}/{size}`. Same size table and crop/fit math.
- Parity impact: W-002 (pixel-level encoder differences; dimensions and
  content-type parity enforced).

## D-009: Email templates modernized
- Wording/design free to change; token URL contract and 1-hour reset
  validity preserved.

## D-010: Search LIKE metacharacters not escaped
- Legacy passes raw terms into LIKE patterns (`%`/`_` act as wildcards).
  Preserved for parity. Revisit post-migration as a UX improvement.

## D-011: Species slug scheme
- `slugify(bn) + '--' + slugify(cn)`; ETL asserts global uniqueness.

## D-012: Password trim tolerance retained on verify path
- Legacy trims candidate passwords at verification. Retained for both
  legacy-sha256 and argon2 paths so behavior doesn't change mid-upgrade.

## D-013: Login rate limiting added (security addition)
- Legacy counted failures but never blocked. New: 10 failures/hour per
  account → 15-minute block. Not a parity break for legitimate flows.

## D-014: Password policy preserved
- Min 8 chars, ≥2 of 4 character classes — unchanged.

## D-015: Site merge candidate order made deterministic
- Legacy: first match in unspecified repository order. New: candidates
  evaluated by ascending site Id. Replay parity (doc 07 §8) validates no
  historical trip is sensitive to this; if one is, resolve there.

## D-017: `/` redirect stays temporary — exact legacy 302 (repo owner, 2026-07-18)
- Context: Phase 1 shipped `/` → `/map` as a 308 via `permanentRedirect()`
  (W-008 documented the 302-vs-308 gap; doc 07 §5.6 had assumed a 301 at
  cutover).
- Decision: keep the redirect TEMPORARY so the default landing page can
  change later — permanent redirects are cached indefinitely by browsers,
  pinning returning visitors. Implemented as a root route handler
  (`app/route.ts`) hand-rolling `302` + relative `Location: /map`, which
  is byte-exact legacy parity (MainController.cs Index() → MVC 302).
- Parity impact: none — the `redirects` category now passes 6/6 with no
  waiver; W-008 withdrawn as superseded.

## D-016: Whitespace-run species duplicates cleaned up (repo owner, 2026-07-18)
- Context: production data holds 4 species name pairs containing an
  internal double space; 3 of them ("Cercis  siliquastrum"/Judas-Tree,
  "Crataegus  spp."/Hawthorn, Cupressus sempervirens/"Italian  Cypress")
  are data-entry duplicates of an existing single-space species. Legacy's
  identity hash (trim+lower, no internal collapse) treated each variant as
  a distinct species; under D-011 slugify (which collapses whitespace
  runs) the 3 duplicated pairs collide with their clean twins — the P1-15
  sweep's largest residual failure class (48 page checks).
- Decision: data cleanup, not slug suffixing or waiving the collision —
  normalize whitespace runs (`\s+` → single space) in
  `trees`/`tree_measurements` `scientific_name`/`common_name`, recomputing
  `computed_measured_species_id` for changed rows. The 4th pair
  ("Quercus  x mutabilis", no clean twin) is normalized under the same
  uniform rule. `known_species` was already clean; `import_*` staging
  tables are the historical import log and stay exactly as captured.
  One-off migration: `scripts/maintenance/d016-species-whitespace-cleanup.sql`
  (applied to local pg + Neon); the ETL applies the same normalization on
  load so a bacpac re-run reproduces it, and the D-011 slug-uniqueness
  assertion fails loudly on any future collision.
- Parity impact: legacy shows the duplicate variants as separate species
  (extra grid/search rows, split tree counts: 1+1, 38+1, 5+1); the new app
  shows one merged species each. Divergence is deliberate and waived as
  W-010 (parity/waivers.md), scoped to exactly these name pairs plus
  whitespace-collapse-equal text cells.

## D-018: Measurements under a retired species name fall back to the tree's species for TDI
- Date / phase: 2026-11-19, post-Phase 1.
- Context: legacy production has thrown `NHibernate.ObjectNotFoundException`
  on `/Browse/Trees/{id}/Details` since 2016 for at least six trees.
  `Measurement.Species` resolves through
  `Measurements.ComputedMeasuredSpeciesId` (hash of the measurement's own
  names, CreateSchema.sql:683) into the view `Trees.MeasuredSpecies`, which
  only has rows for name pairs some tree currently carries
  (CreateObjectsAndTypes.sql:28). After a taxonomic rename the tree takes
  the new name from its latest measurement (`Tree.RecalculateProperties`),
  older measurements keep the old one, and once no tree carries the old
  name, mapping `TDI3` for those measurements throws. Two of the three
  missing ids are the W-107 renames: 1790989718 = Carya alba / Mockernut
  Hickory, 1344794096 = Quercus prinus / Chestnut Oak (555512959 is not yet
  identified). The port's `treeDetails` left-joined `global_species` on the
  measurement's own names, so these rows got maxima of 0 and rendered TDI
  as "(not enough data)".
- Decision: when the measurement's own name pair has no `global_species`
  row, use the maxima of the tree's current species. When it does have a
  row, it is used exactly as legacy did.
- Legacy behavior: HTTP 500 on these tree pages (ELMAH alert per request),
  BrowseController.cs:39 → Measurement.cs:134.
- Parity impact: none on compared artifacts. Only pages that legacy fails
  on change, and those sit in the W-006 legacy-error bucket. Open for the
  repo owner: whether old measurements should always use the tree's current
  species (a visible change wherever the old name is still carried by other
  trees), and whether renames should become a species/synonym table.

## D-019: A species table with synonyms for renamed species
- Date / phase: 2026-11-20, post-Phase 1. Follows D-018; the repo owner
  asked for the species/synonym table D-018 left open.
- Context: legacy has no species table. A species exists only while some
  tree carries its (scientific, common) name pair, so a taxonomic rename
  silently orphans older measurements (D-018). Nothing records that
  Carya alba became Carya tomentosa, so the next rename fails the same way
  and nobody hears about it until a page 500s.
- Decision:
  - `species` holds one row per name pair a tree carries, with its D-011
    slug. `syncSpecies` (db/species.ts) keeps it in step with `trees`, in
    app code per D-004, inside every transaction that writes trees: import
    Finish, reimport, import removal, and the ETL full load and delta.
  - `species_synonyms` maps a retired name pair to the species it became
    (FK to `species`). The known renames are the `SPECIES_SYNONYMS` seed in
    db/species.ts (the two W-107 renames), so adding one is a reviewed
    one-line change.
  - The tree page resolves a measurement's maxima by its own species, then
    its synonym's species, then the tree's species (the D-018 fallback,
    now a last resort).
  - The ETL fails on any measurement name pair that resolves to neither a
    species nor a synonym, listing the pair and its tree ids.
    `--allow-unresolved-species` reports them instead of failing, for loads
    that must go ahead while a rename is being identified (legacy id
    555512959 is still unknown).
- Deferred: `species_id` FK columns on `trees` and `tree_measurements`.
  The name pairs stay the source of truth for now because the full ETL
  load is not transactional and the delta loader is still changing; adding
  the columns is a follow-up once both settle.
- Legacy behavior: unchanged where legacy works. Pages legacy 500s on now
  render with the renamed species' maxima.
- Parity impact: none on compared artifacts (same W-006 bucket as D-018).

## D-020: Server-side Sentry, off until a DSN is set

- Context: legacy mails every server error via ELMAH. The new app only
  logged to the console, so an outage (e.g. the database unreachable, as
  on 2026-11-15) would go unnoticed after cutover. Sentry was planned
  (MODERNIZATION.md, P0-01's `SENTRY_DSN`) but not installed.
- Decision: `@sentry/nextjs` wired through `instrumentation.ts`
  (`register` + `onRequestError`), gated on `SENTRY_DSN` by
  `lib/sentry.ts`. Errors only (no tracing), `sendDefaultPii: false`.
  Server side only, like ELMAH; no `withSentryConfig` wrapper or source
  map upload, so the build needs no Sentry token.
- Owner action: create the Sentry project and set `SENTRY_DSN` in Vercel.
- Parity impact: none.
## D-021: Species names match case-insensitively and are trimmed on load
- Date / phase: 2026-11-20, post-Phase 1. Follows D-016 and D-019.
- Context: legacy's species identity is a hash of `lower(trim(name))`
  (D-018), so a measurement typed "quercus alba" belongs to Quercus alba.
  The port matched names exactly, so a case-only difference would have sent
  that measurement to the D-018 fallback, and after D-019 failed the ETL as
  an "unresolved" name. The ETL's D-016 step also collapsed whitespace runs
  without trimming, while the import path trims.
- Decision:
  - Every species name match in the new app (`species`,
    `species_synonyms`, the tree page's TDI maxima, the ETL's unresolved
    check) compares `lower()` of both names. `ux_species_names` and
    `ux_species_synonyms_names` are unique on `lower()` of the pair, so a
    case variant can't become a second species (migration 0003).
  - Stored case is never rewritten: pages show names as entered, and the
    import path already applies legacy's sentence/title casing.
  - The ETL's D-016 step now also trims and turns lone tabs/newlines into a
    space (`computed_measured_species_id` is unaffected, since legacy's hash
    trims too).
- Also, per the D-018 plan: the ETL's unresolved-species error now gives
  each pair's legacy species id, so legacy alert ids map to names (the
  next full load will name 555512959 if it is still in the data); the tree
  page logs one `[species] unresolved measurement species` warning when it
  has to use the D-018 fallback, and with Sentry on (D-020) reports it as a
  warning fingerprinted by name pair, so a rename is one Sentry issue
  rather than legacy's alert per request; and e2e/legacy-error-trees.e2e.ts covers
  the six trees whose legacy page 500s.
- Parity impact: none on compared artifacts. Whitespace-only differences
  are already waived (W-010); case-variant measurement names resolve to the
  same species legacy resolved them to.
