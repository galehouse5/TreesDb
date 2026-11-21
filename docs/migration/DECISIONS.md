# Decision Log

Append-only. Format per ground rules §4. Seeded with the decisions already
made in this plan; the executor appends from D-016 onward.

## D-001: Target stack
- Phase: planning. Decision: Next.js App Router + TS / Vercel Hobby /
  Neon Postgres / Drizzle / Auth.js / R2 / sharp / MapLibre+OSM / Resend /
  Sentry. Rationale in MODERNIZATION.md. (R2 replaced by Vercel Blob, D-022.)

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
- Amended by D-022: the store is Vercel Blob, and variants are cached on
  first request rather than all at upload.
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
  on change, and those sit in the W-006 legacy-error bucket.
- Resolved (repo owner, 2026-11-21): keep legacy's rule until after
  cutover. A measurement uses its own species while some tree still carries
  that name; "always use the tree's current species" is not adopted, since
  it would change TDI on pages legacy renders. Renames became the
  species/synonym table (D-019).

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
- Update 2026-11-21: the migration job's unresolved-species report named
  legacy species 555512959 as "Quecus montana" / Chestnut Oak, a
  misspelling on one measurement of tree 134862. It is the third
  `SPECIES_SYNONYMS` entry, mapped to Quercus montana. All three legacy
  alert ids now resolve.

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

## D-022: Photos in Vercel Blob instead of Cloudflare R2
- Date / phase: 2026-11-20, Phase 3 (P3-08). Amends D-001 and D-008.
- Context: P3-08 was blocked on R2 credentials. Production has zero photo
  rows, so nothing has to move, and a store inside the Vercel project keeps
  the infrastructure to Vercel + Neon with no Cloudflare account or keys to
  manage.
- Decision (repo owner, 2026-11-20):
  - Photos live in the public Vercel Blob store `treesdb-photos` (iad1),
    connected to the `treesdb` project for every environment. Vercel injects
    `BLOB_READ_WRITE_TOKEN`; the `R2_*` variables and `@aws-sdk/client-s3`
    are gone.
  - Keys are unchanged: the original at `photos/{id}`, variants at
    `photos/{id}/{size}` (canonical `PhotoSize` name). `scripts/
    migrate-photos.ts` writes the same keys.
  - Variants are generated on first request and written back, instead of
    all eleven at upload. Most sizes are never requested for a given photo,
    and Blob's Hobby allowance counts operations as well as bytes. Variants
    made from the fallback icon are never cached.
  - With no token (local dev, CI) reads miss and fall back to the legacy
    icon, and writes fail with a clear "not configured" error. Tests use an
    in-memory store.
- Trade-offs: on Hobby, going over the 1 GB storage or 10 GB monthly
  transfer limit pauses Blob for 30 days instead of billing (R2 allowed 10 GB
  with free egress). The long `Cache-Control` on `/photos/...` keeps
  repeat views off Blob. The store is public, so a blob's URL works without
  a token; the app never exposes those URLs and serves every photo through
  `/photos/{id}/{size}`, which keeps legacy's view authorization, so an
  import-draft photo is only reachable by someone who knows the store's
  host name and the photo id.
- Parity impact: none (storage location only; W-002 still covers encoder
  differences).

## D-023: Import photo upload details (P3-08)
- Date / phase: 2026-11-20, Phase 3 (P3-08). Builds on D-022.
- Upload cap 4 MB, not legacy's 5 MB (`Photo.MaxBytes`): a Vercel function
  accepts at most a 4.5 MB request body, and the upload is a server action
  (`next.config.ts` raises its body limit to 4.5 MB). Legacy's 5 MB check
  still applies to the stored bytes. A direct-to-Blob client upload would
  lift the cap if large phone photos turn out to matter.
- Formats are sniffed from the bytes with sharp: JPEG, PNG and GIF only,
  with legacy's "Photo must be in a proper format." message. JPEG and PNG
  are re-encoded after applying the EXIF orientation, as legacy re-saved
  every upload; this also drops camera metadata (GPS, serial numbers) from
  the stored original. GIFs are stored unchanged.
- Authorization is the trip-editor rule (role Import and trip creator) for
  add, caption and remove. Legacy's `AddTo*` actions checked
  `PhotoReferences.IsAuthorizedToAdd`, whose LINQ counts references rather
  than true answers, so it passed for any signed-in user; the port applies
  the per-reference rule it was written to express. Every action also
  checks that the site, tree or reference belongs to the trip.
  `removeImportSite` gained the same site-in-trip check (it previously
  trusted the posted site id).
- Viewing: the trip's editor can view the trip's draft photos (types 2/3),
  as legacy's per-reference `IsAuthorizedToView` says; the route caches
  those privately for five minutes. Anonymous viewing is unchanged (types
  4-7 only).
- Removal deletes the `photos` row and its blobs once no reference points
  at it. Legacy deleted only the reference and left an orphan
  (`PhotoRepository.ListOrphaned`). A photo a finished trip copied to its
  canonical site or tree is kept. Removing a site, tree or whole trip now
  deletes its draft photo references too (the ORM cascade legacy relied on).
- Captions: `photo_references.caption` (new column, schema note 5) is
  editable per photo on the gallery and carried to the canonical
  references on Finish by the merge engine.
- Parity impact: none on compared artifacts (production has no photos).
- sharp is pinned to Next's own `^0.34.5`. With 0.35 alongside Next's 0.34,
  Vercel's file tracing left out 0.35's `libvips-cpp.so`, so every page that
  loads sharp (the import Sites and Trees steps, `/photos`) failed with
  ERR_DLOPEN_FAILED on the first preview (2026-11-21). One copy traces
  correctly.

## D-024: Password-free test sign-in on preview deployments (2026-11-21)

- Why: the repo owner asked to cut sign-in friction for testing, since each
  preview has its own address and needs a fresh sign-in with a real
  account's password.
- What: a second Auth.js credentials provider, `preview-test`, signs in as
  one fixed account, `preview-test@treesdb.invalid` ("Preview Tester",
  roles import + export), created on first use. The login page shows a
  "Sign in as preview tester" button when it is enabled
  (`lib/preview-login.ts`).
- Locks: enabled only when `VERCEL_ENV === "preview"` (set by Vercel; it is
  `production` on production and unset locally and in CI) AND
  `PREVIEW_TEST_LOGIN === "1"`, set in Vercel for the Preview target only.
  The provider isn't registered otherwise, and `authorize()` checks again.
  Tests pin refusal in production, development, locally, and without the
  flag.
- Preview and production share one Neon database, so the account row
  exists in production too. Its password is a random 32-byte value nobody
  knows, so it can't sign in through the normal form anywhere (tested).
  Previews also stay behind Vercel deployment protection.
- Imports made as the test account are throwaway; delete them after each
  test (History > Remove).

## D-025: Main map offers legacy's four map types, from key-free tile services (2026-11-21)

- Why: legacy's map let people switch Terrain, Road, Satellite and Hybrid
  (TMD/js/Map/Widgets.js:4-6); the new map had streets only.
- What: a Map / Terrain / Satellite / Hybrid switch on /map
  (`components/map/basemaps.ts`). Streets is OSM (unchanged), Terrain is
  OpenTopoMap, Satellite is Esri World Imagery (already used by the import
  coordinate picker), Hybrid is Esri imagery plus Esri's boundaries-and-places
  labels. None needs an API key or account, in keeping with simple infra.
- Default stays streets, not legacy's Terrain: the streets layer was tuned in
  the map UX audit so markers stand out. Easy to flip in `DEFAULT_BASEMAP`.
- Caveat for the owner: OpenTopoMap and Esri's public tiles are free for
  light, attributed use but have no uptime promise. If traffic grows or terms
  tighten, swap in a keyed provider (MapTiler, Stadia) in that one file.

## D-026: Import wizard redisplay state is sealed, not plain JSON in the URL (2026-11-21)

- Why: a failed save on the Trip, Sites or Trees step redirected with
  everything typed, measurer contact info included, as readable JSON in
  `?state=`, so it landed in browser history, Vercel request logs and
  Referer headers. Legacy redisplayed in the same POST and never did this.
- What: `lib/redisplay-state.ts` seals the same state with AES-256-GCM
  (key derived from AUTH_SECRET) and the pages open it. Tampered, malformed
  or over-an-hour-old values are ignored and the saved draft shows. The
  round trip and error display are otherwise unchanged.
- Considered: a flash cookie. Rejected because server components can't
  clear a cookie on read, and tree state can exceed the 4 KB cookie limit.

## D-027: "Remember me on this computer" and a 7-day session, like legacy (2026-11-21)

- Why: legacy's sign-in had the box (Logon.cshtml:29-30) and issued a
  persistent cookie only when ticked (AccountController.cs:85); its ticket
  lasted 7 days, sliding (Web.config forms timeout=10080). The new app had
  no box and always kept people signed in for Auth.js's default 30 days.
- What: the box is back, unticked by default as in legacy. Unticked, the
  login action re-sets Auth.js's session cookie without an expiry and sets a
  `treesdb.session-only` marker; middleware.ts strips the expiry again
  whenever Auth.js refreshes the cookie while the marker is present
  (`lib/session-persistence.ts`). Session maxAge is now 7 days.
- Effect on existing sessions: a token signed with the old 30-day maxAge is
  re-issued at 7 days on its next refresh; nobody is signed out at deploy.
- The preview tester button (D-024) doesn't use the box; it keeps the
  persistent cookie.
