# Parity waiver registry

Per docs/migration/07-parity-testing.md §9. A comparison failure is either a
bug (fix it) or a decision (a `DECISIONS.md` entry + a waiver here). The
comparator (`verify.ts`, not built in this task) loads this file and reports
waived checks in a distinct "waived" bucket - a waiver never silently turns
a check green. **Every waiver beyond the four predeclared below requires
repo-owner approval before merging.**

Format:

```
## W-00X: <title>
- Category / artifacts affected: exports | markers | … (glob or list)
- Field(s):
- Legacy behavior / new behavior:
- Reason: <decision D-0YY link>
- Comparator rule: <exact normalization or skip applied>
- Approved by: <repo owner> on <date>
```

---

## W-001: Species max-tree tie-breaking (lowest Id)
- Category / artifacts affected: `pages` (species/site-species/state-species
  detail pages: Max height / Max girth / Max crown spread links), `data`
  (§7.2 `MeasuredSpecies` / `MeasuredSpeciesBySite` / `MeasuredSpeciesByState`
  views).
- Field(s): `Max*TreeId` (and the linked tree id shown by the Max height/
  girth/crown-spread rows on species detail pages and marker/grid links
  derived from them).
- Legacy behavior / new behavior: legacy `Trees.MeasuredSpecies` (and the
  By-Site/By-State variants) pick the representative max-value tree via SQL
  `TOP 1` over physical/unspecified row order when multiple trees tie for
  the group maximum (doc 01 §4). The new implementation picks the tie by
  **lowest tree Id** instead, since Postgres has no equivalent "physical
  order" guarantee to reproduce.
- Reason: doc 01 §4 ("ties broken by physical order; new impl: lowest Id,
  waiver W-001"). No corresponding `DECISIONS.md` entry needed beyond this
  waiver - the tie-break behavior itself is unobservable/unspecified in
  legacy.
- Comparator rule: when a Max height/girth/crown-spread comparison
  disagrees on WHICH tree id is linked, but the max VALUE itself (verbatim
  formatted string) matches, and the disputed candidate trees are float32-
  tied on that quantity (re-verified from the underlying dump), the
  difference is waived rather than failed. Any value mismatch (not just id)
  still fails.
- Approved by: predeclared per doc 07 §9 (no additional repo-owner sign-off
  required for this specific, doc-scoped case).

## W-002: Photo pixel-level difference (dimensions/type still compared)
- Category / artifacts affected: `photos` (all sampled photo × size
  combinations).
- Field(s): image byte content only. Content-type and decoded pixel
  dimensions are NOT waived - those must match exactly (doc 07 §5.5).
- Legacy behavior / new behavior: legacy resizes with GDI+/System.Drawing
  bicubic resampling on every request (doc 01 §11); the new app resizes
  with `sharp` (libvips), precomputed at upload and cached in R2 (D-008).
  Different encoders/resamplers produce different bytes for visually
  equivalent output.
- Reason: D-008 (`docs/migration/DECISIONS.md`) - accepted resampler
  change; not observable to end users as a functional regression.
- Comparator rule: byte-for-byte / pixel-for-pixel image comparison is
  SKIPPED entirely for the `photos` category. The comparator instead
  asserts: content-type equality, decoded width/height equality (fit/crop
  math per doc 01 §11, including border widths for the Map* sizes), and
  byte length within ±20% (informational only, logged not failed).
- Approved by: predeclared per doc 07 §9.

## W-003: Export row order — ACTIVATED by the P1-15 sweep
- Category / artifacts affected: `exports` (all 8 CSV export endpoints;
  concretely triggered in this sweep on ~18 of 2,540 export artifacts,
  concentrated in a handful of the largest State/Site exports where a
  string-collation tie shifts row order for the rest of the file).
- Field(s): row order only; every field within a row must still match
  exactly (doc §5.1: "strongest oracle ... target 100% identical").
- Legacy behavior / new behavior: legacy's `ExportRepository.GetTrees`
  (`db/queries/export-trees.sql.ts`'s file header - see that file for the
  full investigation) sorts client-side via `OrderBy(State.Code)
  .ThenBy(County).ThenBy(Site.Name).ThenBy(CommonName)
  .ThenBy(ScientificName).ThenBy(Height)`, with the four string keys
  compared under .NET's default *culture-aware* (Windows NLS) comparer -
  a linguistic sort Postgres cannot reproduce byte-for-byte even with
  `lower()` + the closest available ICU collation (`und-x-icu`). Verified
  against the full unfiltered "All trees" export oracle (~30,091 rows):
  plain `'C'`-collation ordering mismatched ~262 rows; `lower()` cut that to
  ~152; adding `und-x-icu` collation cut it further to ~56 (~0.19%),
  concentrated in non-ASCII punctuation (e.g. curly vs straight
  apostrophes in "Fez-Meknes, Morocco" site names) that no available
  Postgres collation tailors the same way Windows NLS does. This is
  activation-by-demonstrated-instability in the sense doc 07 §5.1
  anticipates ("if unstable in legacy") - not literal run-to-run
  nondeterminism (the legacy site can't be re-queried to capture a second
  snapshot), but the practically identical situation of a cross-platform
  collation system that cannot be reproduced deterministically at all,
  which is why `db/queries/export-trees.sql.ts`'s own file-header
  investigation (predates this sweep) already concluded "This is a genuine
  W-003 candidate ... rather than chase exact Windows-NLS parity further."
- Reason: doc 07 §5.1 ("if unstable in legacy, sort both sides by tree id
  in the comparator and record waiver W-003").
- Comparator rule: **ACTIVATED**, implemented in `parity/verify/
  exports.ts`. On any raw-body mismatch, both sides are re-parsed as CSV,
  re-sorted by (tree id, measurement number) - CSV columns 10/11, the one
  key pair every one of the 8 export endpoints shares - and re-compared.
  If that resolves the mismatch, the diff is tagged `waiverHint: "W-003"`
  (report.ts buckets it "waived", never silently "pass" - doc §9's own
  rule). If rows still differ after re-sorting, it's a genuine content bug
  and fails outright (unaffected by this waiver) - see
  `parity/reports/exports-2026-07-18.md` for which artifacts landed in
  which bucket this run.
- Approved by: repo owner (galehouse5) on 2026-07-18, confirming the
  "Windows-NLS instability" framing satisfies the predeclared condition.

## W-004: Marker array order
- Category / artifacts affected: `markers` (`/Map/AllMarkers` `Markers`
  array).
- Field(s): array element order only.
- Legacy behavior / new behavior: legacy returns markers in repository
  order (unspecified by any SQL `ORDER BY`); the new app is not required to
  preserve that order.
- Reason: doc 07 §5.2 ("legacy order is repository order, new app need not
  preserve it (waiver W-004 predeclared)").
- Comparator rule: the `Markers` array is compared order-INSENSITIVELY,
  keyed by (Title, Latitude, Longitude) - i.e. as a set/multiset, not a
  sequence. All other marker fields (MinZoom/MaxZoom/InfoLoaderUrl/IconUrl
  via the URL-equivalence table in `normalize.ts`) are still compared per
  matched marker.
- Approved by: predeclared per doc 07 §9.

---

The five waivers below (W-005..W-009) were surfaced by the P1-15 gate-prep
sweep (full-corpus run against the local preview with production data, doc
07 §10 "Phase 1 exit"). All were resolved by the repo owner on 2026-07-18:
W-005/W-006/W-007/W-009 approved; W-008 withdrawn as superseded by D-017
(exact-302 code change — no waiver needed). W-010 below (D-016) was
approved the same day.

## W-005: Cloudflare email-obfuscation placeholders in captured site pages
- Category / artifacts affected: `pages` (confirmed concretely on
  site-details `summary["Ownership contact"]` - the only currently-extracted
  field that carries free-text site-owner contact info; e.g.
  `/Browse/Sites/38515/Details`, `/Browse/Sites/39772/Details`,
  `/Browse/Sites/40412/Details`, `/Browse/Sites/41942/Details`, and others
  in the corpus).
- Field(s): any extracted string field, wherever legacy's captured text
  contains the literal decoy string `[email protected]`.
- Legacy behavior / new behavior: `treesdb.org` is Cloudflare-fronted;
  Cloudflare's email-obfuscation feature rewrites a visible email into
  `<a href="/cdn-cgi/l/email-protection#<hex>">[email&#160;protected]</a>`
  (real address hex-encoded in the href/data attribute, decoded client-side
  by an injected script). `capture.ts` only fetches raw HTML (no JS
  execution), and a text extractor pulls the anchor's TEXT content, not its
  href - so `cdn-cgi` itself never appears in extracted text, only the
  decoy string (with a U+00A0 nbsp between "email" and "protected", which
  `collapseWhitespace` collapses to a literal space, producing exactly
  `"[email protected]"`). This reflects the CAPTURE artifact, not real page
  content - a real visitor's browser runs Cloudflare's script and sees the
  actual email, exactly what the new app's extracted field shows (verified:
  `/Browse/Sites/38515/Details` legacy-extracted
  `"Phone 215-493-6652 Email:[email protected]"` vs new
  `"Phone 215-493-6652 Email:fivemilewoods@yahoo.com"` - a real, working
  address, not a bug).
- Reason: capture-time artifact of Cloudflare sitting in front of the
  legacy origin during doc 07 §4 capture; no `DECISIONS.md` entry needed
  (nothing was decided - this is a snapshot-fidelity caveat, not a design
  choice).
- Comparator rule: **mechanically implemented** in `parity/verify/
  pages.ts`'s `comparePageJson` - any diff whose legacy (`expected`) value
  is a string containing the literal `"[email protected]"` placeholder is
  tagged `waiverHint: "W-005"` (checked by `data/waivers.ts` before
  free-text matching), regardless of which field it appears in. A mismatch
  NOT involving that placeholder still fails normally.
- Approved by: repo owner (galehouse5) on 2026-07-18.

## W-006: Legacy-error artifacts (pages category) - 500s and 404s never fetched/compared
- Category / artifacts affected: `pages` (26 manifest entries, captured
  legacy status >= 400 - `verify.ts`'s `partitionByLegacyStatus` already
  auto-buckets these into "legacy errors" and never fetches or compares
  them against the new app, per doc's own rule: "do NOT fetch or fail
  them").
- Field(s): n/a (entire artifact excluded from comparison, not a field-level
  diff).
- Legacy behavior / new behavior: three distinct sub-classes, all legacy-side
  server errors/not-founds unrelated to the new app's own behavior:
  - **16x `500`**: every embedded-grid sort-column permutation on
    `/Browse/Sites/436/Details` (Number/ScientificName x asc/desc) and
    `/Browse/States/1/Details` (state-species + state-sites grids, several
    sort columns x asc/desc) - legacy itself throws a server error on these
    specific sort requests (data/query issue on the legacy side, e.g. a
    null-reference on a column legacy's sort switch doesn't actually
    support for that entity). Cannot be "fixed" in the new app since there
    is no legacy behavior to reproduce.
  - **1x `404`**: `/Browse/Species/Vitis%20labrusca%20(Northern%20Fox%20Grape%20(Vine))/Details`
    - a common name containing a nested paren group; legacy's route
      binder (literal `{bn} ({cn})` template, splits on the LAST `" ("`)
      still 404s on this one in production (pre-existing legacy bug/route
      edge case, captured as-is).
  - **9x `404`**: `/Browse/Species/Abies%20alba%20(Silver%20Fir)/Details?...&siteId=436`
    (every embedded-trees-grid sort/page/filter permutation) - site 436
    does not actually carry this species, so legacy's site-scoped species
    detail action 404s (a corpus-generation mispairing: corpus.ts paired an
    arbitrary site id with an arbitrary species id for grid-permutation
    coverage without checking the pair co-occurs in the data).
- Reason: none of these are new-app defects; no `DECISIONS.md` entry (there
  is no decision to make - the artifacts are simply excluded from the
  parity claim).
- Comparator rule: already auto-bucketed by `verify.ts`'s
  `partitionByLegacyStatus` into the "legacy errors" report section (not a
  "waived" check and not counted in checksRun/pass/fail at all - see
  verify.ts's own doc comment). This waiver entry exists to give the
  26-artifact bucket a name and documented rationale for the gate report,
  not to change comparator behavior.
- Approved by: repo owner (galehouse5) on 2026-07-18 (informational
  acknowledgment; no mechanical effect since the comparator already
  excludes these).

## W-007: Grid tie-order (Locations default-sort ties; Species cross-column ties)
- Category / artifacts affected: `pages` - the two GLOBAL grid pages only,
  `/locations` (default view) and `/species` (any sort). By far the
  largest single failure class this sweep surfaced: 240 of 476 unwaived
  `pages` failures traced to `/Browse/Locations` alone, 176 more to
  `/Browse/Species` (87% of that run's total, before this waiver's
  comparator rule was implemented).
- Field(s): `rows` (row ORDER only among rank/sort-value ties; individual
  row cell text and links must still match exactly once rows are matched).
- Legacy behavior / new behavior: legacy's grid queries `ORDER BY` the
  sorted column only, with no secondary tiebreak column specified
  (`SiteBrowser`/`SpeciesBrowser` repository methods, doc 03 task note for
  P1-03/04) - when multiple rows share the exact sorted value (e.g. many
  sites tied on the Locations grid's default sort, or many species tied on
  whatever column the Species grid is currently sorted by), legacy's row
  order among the tied subset is unspecified SQL order and the new app's
  Postgres query is not guaranteed to reproduce it (same underlying class
  of problem as W-004, applied to grid rows instead of map markers).
- Reason: doc 03 P1-03/04 task note specifies filter/sort semantics and
  default sorts but not a tiebreak column; doc 07 has no grid-specific
  tiebreak rule (§5.4 "pages" only asks for "row cell text" parity, is
  silent on tie order specifically). No `DECISIONS.md` entry - the
  tie-break behavior is unobservable/unspecified in legacy, same rationale
  as W-001/W-004.
- Comparator rule: **mechanically implemented** in `parity/verify/
  pages.ts`'s `alignGridRowsForTieOrder`, following the SAME pattern as the
  predeclared W-004 (bucket/reorder BEFORE comparing, rather than compare-
  then-tag-as-waived): for the two grid page types only, the new-side
  `rows` array is permuted to align with legacy's row order wherever a row
  with IDENTICAL `cells` text exists on both sides (a stable multiset match
  keyed on cell text, duplicates handled one-to-one) - then the existing
  generic `diffJson` engine runs unchanged on the now-aligned arrays, so
  every other rule (link route-equivalence, float32, etc.) still applies
  normally to matched rows. A row whose `cells` don't match anything on the
  other side is left unmatched (appended in original order) and still
  surfaces as a normal diff - a genuine content difference (wrong/missing/
  extra row), not mere reordering, is NOT masked by this rule. Because
  realignment happens BEFORE comparison (not after, like W-001/W-003/W-005/
  W-009's tag-as-waived diffs), a fully-resolved tie-order case produces
  ZERO diffs and no "waived" count, matching W-004's own precedent for the
  identical class of problem - not a silent pass in the sense doc §9 warns
  against (the RULE itself, not an individual diff, is what's waived/
  documented here, exactly as already established for W-004).
- Approved by: repo owner (galehouse5) on 2026-07-18.

## W-008: `/` redirect status code — WITHDRAWN 2026-07-18 (superseded by D-017)
- Category / artifacts affected: `redirects` (`/` only - the one redirect
  shape Phase 1 implements; doc 03's table entry `/` -> redirect `/map`).
- Field(s): `status`. (`location` already matches: legacy `/Map` <->
  new `/map` via the URL-equivalence table.)
- Legacy behavior / new behavior: legacy's `MainController.Index()` issues
  an ASP.NET MVC default 302 (Found) to `/Map`. The new app's `app/page.tsx`
  calls Next's `permanentRedirect("/map")`, a **308** (Permanent Redirect) -
  a deliberate, documented choice made when P1-01/P1-14 landed (see
  `app/page.tsx`'s own doc comment: "doc 07 §5.6 calls for a 301
  (permanent) at cutover... 308 is the modern, method-preserving equivalent
  of 301... noted as a deliberate near-parity choice, not an oversight").
  308 (like legacy's eventual 301 target at cutover) still causes every
  browser and crawler to follow to `/map` exactly like a 302 does - no
  user- or SEO-observable difference in destination, just the specific 3xx
  subcode.
- Reason: pre-existing, in-code documented decision at `app/page.tsx:6-13`
  aligned with doc 07 §5.6's own eventual target (a permanent redirect at
  cutover) rather than exactly reproducing legacy's temporary 302 today.
  No separate `DECISIONS.md` entry existed for this before the sweep;
  repo owner should confirm whether one should be added (D-016+) or
  whether this waiver is sufficient documentation.
- Comparator rule: NOT mechanically waived - `verify/redirects.ts`'s
  `compareRedirect` intentionally treats any status mismatch as a hard
  failure (see its own unit test, "fails on a status mismatch") since
  doc 07 §5.6 requires an exact status match in general and this task
  should not silently soften that rule for other, unrelated future
  redirect shapes. This diff (currently the sweep's only `redirects`
  category failure - 5/6 checks pass) is listed here as a documented,
  named exception rather than auto-waived; repo owner sign-off closes it.
- Approved by: WITHDRAWN — no waiver needed. Repo-owner decision D-017
  (2026-07-18) chose a TEMPORARY redirect for future flexibility;
  `app/route.ts` now hand-rolls legacy's exact `302` + relative
  `Location: /map`, and the `redirects` category passes 6/6 with zero
  waived. Entry retained (not deleted) for the historical record of the
  308 era; the free-text matcher can no longer match it since no diff
  exists.

## W-009: Search rank-tie truncation at the AJAX 5-result-per-category cap
- Category / artifacts affected: `search` (`/search?term=...` AJAX form
  only - doc 07 §3's corpus only captured the AJAX mode of the search
  endpoint, per every stored snapshot artifact's `X-Requested-With`
  capture).
- Field(s): `results` (row presence within a rank-tied group only; a row
  matched by Subject on both sides must still have identical
  Description/Url - those remain hard failures, never waived by this
  entry).
- Legacy behavior / new behavior: both `SearchSites`/`SearchMeasuredSpecies`/
  `SearchStates` (legacy) and their new-app equivalents cap each category to
  5 results in AJAX mode (`app/search/route.ts`'s
  `AJAX_MAX_RESULTS_PER_CATEGORY`, mirroring `SearchController.cs`), ordered
  `rank DESC` with NO secondary tiebreak column (doc 01 §4). When a rank-tied
  group's true membership exceeds 5, each side's SQL keeps an arbitrary
  5-of-N slice - genuinely different rows can appear on each side even
  though every one of them scores the identical computed rank. Same class of
  problem as W-001/W-004/W-007, here manifesting at the AJAX result-cap
  boundary specifically because the corpus only exercises that capped mode.
- Reason: doc 07 §5.3 itself predicts this exact shape ("Rank ties: legacy
  tie-breaking is unspecified SQL order - comparator treats equal-rank
  groups as sets") but a rank-tied group larger than the 5-cap cannot be
  fully materialized from the AJAX artifact alone, so the set-comparison
  the doc describes can't reach across the truncation boundary. No
  `DECISIONS.md` entry - unobservable/unspecified tie order, same rationale
  as W-001.
- Comparator rule: **mechanically implemented** in `parity/verify/
  search.ts`'s `compareRowSet` - a "present in legacy but missing from new"
  / "present in new but not in legacy" diff is tagged with
  `waiverHint: "W-009"` (checked by `data/waivers.ts` before free-text
  matching) if-and-only-if the rank-group's row count on EITHER side equals
  the AJAX cap (5) - i.e. a group that clearly hit the truncation boundary.
  A mismatch inside a SMALLER (unambiguously complete, uncapped) group still
  fails outright. Verified against the sweep: every group that produced a
  `results`-field diff in this run was cap-sized on the affected side
  (spot-checked `term=AL`/`DIF`/`nd+`/`Abies`/`e` - see
  `parity/reports/search-2026-07-18.md`).
- Approved by: repo owner (galehouse5) on 2026-07-18.

## W-010: D-016 species whitespace-duplicate cleanup (deliberate data divergence)
- Category / artifacts affected: `pages` (global/site/state species grids,
  species detail pages, site/state detail pages for sites carrying the
  affected trees), `search` (rows for the affected species), `exports`
  (name cells on the affected trees' rows), `markerinfo` (species listings
  in popups), `data` (§7.2 derived-view checks for the affected pairs).
- Field(s): any field whose difference is attributable to the D-016 merge:
  extra legacy-side rows for the duplicate variant, split-vs-merged tree
  counts and aggregate stats (max height/girth/spread and their linked
  trees), and raw name text differing only by internal whitespace runs.
- Legacy behavior / new behavior: legacy carries 3 double-space duplicate
  species pairs as species distinct from their clean twins (its identity
  hash never collapses internal whitespace); per D-016 the new database
  normalized whitespace runs and merged each duplicate into its clean twin
  ("Cercis siliquastrum"/Judas-Tree 1+1→2 trees, "Crataegus spp."/Hawthorn
  38+1→39, Cupressus sempervirens/"Italian Cypress" 5+1→6; plus the
  collision-free "Quercus  x mutabilis"→"Quercus x mutabilis" rename).
  Legacy pages therefore show one extra (visually identical, since HTML
  collapses whitespace) species row with a split tree count; the new app
  shows a single merged species.
- Reason: D-016 (`docs/migration/DECISIONS.md`) — repo-owner-approved data
  cleanup resolving the D-011 slug collisions, chosen over slug suffixing
  or waiving the collision as-is.
- Comparator rule: mechanical prongs in `parity/data/waivers.ts`
  (checked before free-text matching):
  1. whitespace-collapse equality — a string diff where the legacy value
     equals the new value after collapsing whitespace runs is tagged
     `waiverHint: "W-010"` (covers raw CSV cells and any uncollapsed
     captured text). Applied to marker set-matching too: an unmatched
     legacy/new marker pair identical in (Latitude, Longitude) whose
     Titles are collapse-equal is treated as matched (then compared
     field-wise as usual) rather than reported missing/extra — this is
     the Quercus rename showing up in the W-004 (Title, Lat, Lng) key;
  2. affected-pair allowlist — a diff (missing/extra row, count or
     aggregate mismatch) whose row/entry text identifies one of the three
     merged pairs (matched on collapsed botanical+common name text, the
     exact D-016 list, exported as a named constant) is tagged
     `waiverHint: "W-010"`;
  3. affected species-export artifacts — for `/Export/Species/{bn (cn)}`
     artifacts whose URL-identified pair is D-016-affected (the three
     merged pairs, either variant spelling, plus the renamed
     "Quercus  x mutabilis" — a closed artifact list of 7), a whole-body
     mismatch is re-checked after the W-003 re-sort + prong-1 cell
     collapse as a row-SET relation: the removed double-space variant's
     artifact must be header-only on the new side, and the clean twin's
     legacy rows must be a subset of the new rows (the extra new rows are
     the absorbed trees). If the subset relation holds the diff is tagged
     `waiverHint: "W-010"`; any cell mismatch on a shared row, or a
     missing legacy row, still fails.
  4. embedded-grid alignment + attribution — the W-007-style cells-multiset
     row alignment is applied to embedded detail-page grids (site/state
     `speciesGrid` and equivalents) as well as the two global grid pages,
     so a removed/merged row no longer cascades into misaligned-row diffs;
     unmatched rows then attribute via prong 2. A grid `pageInfo` /
     row-count diff is tagged `waiverHint: "W-010"` if-and-only-if every
     unmatched row on that grid was itself D-016-attributed (no unrelated
     row differences hiding behind the count).
  5. affected species detail artifacts — `pages` artifacts whose legacy
     URL identifies a D-016-affected pair (`/Browse/Species/{bn (cn)}/
     Details` in either variant spelling, including site-/state-scoped
     forms and their grid-permutation query variants — a closed list
     derived from the same pair constants) are compared normally, but any
     resulting diff is tagged `waiverHint: "W-010"`: on these specific
     artifacts every field reachable from the merge (tree counts, max
     stats, linked tree ids, grid rows) is definitionally attributable to
     D-016, since the double-space URL now resolves to the merged page.
  6. count-only diffs from off-page merged rows — when a grid produces
     ONLY `pageInfo`/row-count diffs (no row diffs at all; grids with row
     diffs are governed by prong 4's iff-rule), the count diff is tagged
     `waiverHint: "W-010"` in exactly two closed scopes: (a) the global
     species grid (`/Browse/Species`, any sort/page/filter variant) when
     the legacy−new count delta equals the number of merged pairs whose
     names match that artifact's filter under the grid's own filter
     semantics (unfiltered: exactly 3, the verified 764→761 total); (b)
     `/Browse/States/25/Details` (North Carolina) with delta exactly 1 —
     verified from data to be the one state-detail scope whose merged
     duplicate (Crataegus at site 41043, plus 10 clean-variant trees in
     the state) sits off the visible grid page, so no row-level evidence
     can attribute it (the other three affected scopes — states 124/160
     and the site pages — carry the merged row on-page and resolve via
     prong 4). Any other count-only diff, or a delta that does not match
     exactly, still fails.
  Diffs not matching a prong fail normally; all allowlists are closed
  (exactly the D-016 pairs/artifacts, never pattern-extended).
- Approved by: repo owner (galehouse5) on 2026-07-18 (D-016 decision;
  waiver text follows from it).

---

# W-1xx series: import replay parity (doc 07 §8, Phase 3 gate)

Replay of all 1,694 historical imported trips through the ported merge
engine (`parity/reports/replay-2026-07-18.md`): 960 exact fixed points,
734 with diffs, 0 engine bugs. Doc 07 §8 anticipates exactly this shape:
"a small number of trips may mismatch because site/tree data was
hand-edited after import or the site-matching context changed." Every
diffing trip is covered by one of the evidence-checked buckets below
(mechanically verified by `parity/replay/analyze.ts` — each bucket's rule
requires positive DB/git evidence, never blanket-matches) or by the
individually-investigated list in W-110. A trip may sit in several
buckets.

## W-101: calculated-coordinate input-format defaults (390 trips)
Legacy migration `Tmd.Migrations/Y2016/M001_MakeCoordinatesOptional.cs`
added `calculated_*_input_format` columns to the LIVE legacy DB with a
hardcoded default of 2, back-filling only 0→Unspecified; all 330 affected
sites predate 2016-12-26. Replay recomputes the true format. Field-scoped:
`calculated_latitude/longitude_input_format` value mismatches only.

## W-102: canonical rows edited post-import; immutable staging log stale (401 trips)
Bulk cleanups edited canonical tables without touching `import_*`:
`" County"` suffix appended (478/1815 county pairs), site names (96),
ownership_type (44), comments (30), plus W-110's numeric/coordinate
one-offs. Replay reproduces the import log — the log is the oracle for
what the TRIP contained, not for later edits.

## W-103: champion-points 1-2 ULP (21 trips)
The documented x87-vs-SSE2 excess-precision hazard
(`lib/merge/derived.ts` header; `derived-parity.test.ts` knownMismatch
row 2343). Value drift ≤ 2 float32 ULP on champion/abbreviated points.

## W-104: historically-undeduped tree-measurer rows (110 trips)
239 trees carry duplicate `(first_name, last_name)` measurer rows
(34,103 rows vs 33,843 distinct pairs) predating consistent application
of `Tree.RecalculateProperties`'s `Distinct()`; the port dedupes per
CURRENT legacy code, so replay drops the historical duplicates.
Evidence-gated: only rows whose pre-image is a duplicate pair.

## W-105: pre-2013 sibling-tree merge behavior (6 trips)
Legacy commit `83a3445e` (2013-09-10, "Fixed bug preventing measurements
of the same tree from merging...") changed `Site.cs`/`Tree.cs`; 926
trips predate it. Replaying old trips through CURRENT code consolidates
same-coordinate sibling trees legacy-of-the-day kept separate. Gated on
trip date < 2013-09-10 AND diffs confined to same-name/coords tree
consolidation.

## W-106: stale cached site headline (6 trips)
Sites whose cached headline (visit_count, coords) already disagreed with
their own live child rows pre-replay (out-of-band deletions bypassing
RecalculateProperties). Replay recomputes from live data.

## W-107: taxonomic renames (19 trips)
Carya alba↔tomentosa, Quercus prinus↔montana applied to canonical tables
only; includes the paired computed_measured_species_id change (hash
follows the name mechanically).

## W-108: coordinate 1-2 ULP drift (9 trips)
coordinateBoundsCenter averaging-cascade float32 noise (~1e-6°).

## W-109: post-Finish staging-log edits (7 trips) + ambiguous unspecified-coord siblings (34 trips)
(a) Legacy's wizard has NO IsImported gate on Sites/Trees/AddTree/
SaveTrees — owners edited finished trips' staging rows afterwards; all 7
blank `(Unidentified)` stub trees were created AFTER their trip's
imported timestamp (zero counterexamples; created matches last_saved to
the second). Replay faithfully imports today's log. (b) Genuinely
distinct trees sharing (name, species, unspecified coords) — e.g. 8
White Oak @ (0,0) at one site, never merged since shouldMergeTree
requires specified coords — replay recreates them but the differ cannot
principledly pair them; detected as exact value-swaps only
(d1.expected===d2.actual ∧ d1.actual===d2.expected).

## W-110: individually investigated one-offs (9 trips)
10099 (same-date visit tie flips headline pick on reinsert — faithful
tie-break), 17232 / 20496 / 20778 / 21545 (W-102-family numeric/
coordinate/text edits, incl. one where coordinate drift structurally
prevents a re-merge), 19302 / 19335 (measurer credits added/removed in
canonical only), 20595 / 20831 (site-matching context changed: the site
now exists because a LATER trip created it, so the merge cross-check
runs where original import's Site.Create path had none — doc 07 §8's
anticipated case). Full SQL evidence in the replay round-2 report.

- Approved by: pending repo-owner review (replay gate: "100% of trips
  replay clean or carry an investigated, named waiver" — this section is
  that ledger).
