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
