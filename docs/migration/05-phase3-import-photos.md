# 05 — Phase 3: Import wizard, merge, photo upload

The intricate 20%. The merge algorithm is the single riskiest port in the
migration; it is also the best-tested (replay parity, doc 07 §8). Order of
work: **merge engine first, test-first, before any UI.**

Checklist:

- [x] P3-01 `web/lib/merge/` engine + synthetic suite — *derived (19/20
      production rows float32-exact, 1 pinned ULP anomaly), graph,
      predicates, headline, engine, reimport; 415 merge/db tests. Legacy
      quirks preserved bug-compatibly (no recompute on cleanup survivors,
      SingleOrDefault throw, Coordinates-not-Calculated in ShouldMerge).*
- [x] P3-02 replay-parity harness green (doc 07 §8) — *all 1,694
      historical trips: 960 exact fixed points, 734 explained by
      evidence-checked drift buckets W-101..W-110 (parity/waivers.md), 0
      unexplained, 0 engine bugs. Notable: the staging log is NOT
      immutable (legacy wizard lacks an IsImported gate — post-Finish
      edits verified by timestamp); stale-metric recompute scoped per id
      (was a global aggregate per import, ~9s → sweep 350s). Reports:
      parity/reports/replay-2026-07-18.{json,md}.*
- [x] P3-03 import draft model + wizard: Trip step — *import-drafts.sql.ts +
      lib/import-wizard; entry mirrors legacy MenuWidget (bare /Import is a
      dead route); creator-only editability (no admin bypass, verified);
      measurer backward-scan quirk ported.*
- [x] P3-04 Sites step (+ coordinate picker) — *Required/Optional split
      incl. bounds warning + Save-anyway; explicit NHibernate-style remove
      cascade; MapLibre DDM picker round-trips lib/units parsers.*
- [x] P3-05 Trees step — *domain-complete editor (legacy's reachable UI
      was single-trunk-only and its Detailed-edit POST throws
      NotImplementedException — documented in lib/import-trees.ts); TPH
      discriminator, CombinedGirth aliasing, NumberOfTrunks auto-adoption,
      all six enum tables cited; every value via lib/units parse (float32 +
      input-format codes).*
- [x] P3-06 Review + Finish (+ Reimport) — *legacy Finish checks only the
      two structural count minimums (Optional tier never runs at finish;
      legacy 500s on incomplete graphs — port surfaces errors instead);
      live-verified UI → engine → canonical rows → idempotent reimport.*
- [x] P3-07 History / View import — *History's sole inner action is
      Trip.Remove and it works on IMPORTED trips too (unconditional
      ImportRepository.Remove — a true import undo; ported by reusing
      reimport.ts's cleanup exports); View renders from draft rows with no
      IsImported gate, like legacy.*
- [ ] P3-08 photo upload (R2 + sharp) on import trees/sites
- [x] P3-09 import map endpoints — */api/import/[tripId]/markers?site=|tree=
      with legacy's exact payload (MapMarkerModel field set + top-level
      CalculatedCoordinates via graph.ts's cascade, computed fresh — draft
      rows store none); 401/403 auth verified live.*
- [ ] P3-10 Playwright wizard walkthrough
- [ ] P3-11 gate

## P3-01 Merge engine — `web/lib/merge/`

Pure functions + a thin transactional orchestrator. Implement exactly per
doc 01 §10 (read every cited legacy file before coding — especially
`TMD.Model/Sites/Site.cs`, `TMD.Model/Trees/Tree.cs`,
`TMD.Model/Trees/Measurement.cs`,
`TMD.Infrastructure/Repositories/SiteRepository.cs`,
`ImportRepository.cs`, and the `RemoveMeasurementsByTrip` /
`RemoveVisitsByTrip` cleanup rules):

- `buildSiteGraph(importSite, trip)` — domain graph incl. the
  `(Unidentified)` scientific-name default, measurer/visitor copying,
  photo reference re-typing, derived tree properties
  (`RecalculateProperties`: headline values from the **last** measurement;
  transcribe the exact "last" ordering from `Tree.cs`).
- `findMergeCandidate(db, siteGraph)` — ±25′ bounding box on calculated
  coordinates, then `shouldMergeSite` predicate (name/state/county
  case-insensitive + planar distance ≤ 25′). **Candidate iteration order:**
  legacy takes the first match in repository order; new impl orders
  candidates by Id ascending (deterministic) — record D-015; replay parity
  will reveal if any historical trip is sensitive to this.
- `mergeSite`, `shouldMergeTree` (exact float32 coordinate equality — the
  comparison is `fround(a) === fround(b)` on stored values, no epsilon),
  `mergeTree` (append measurements), visitor dedup.
- Derived per-measurement numbers (ENTSPTS, ENTSPTS2, ChampionPoints,
  AbbreviatedChampionPoints, ConicalVolume): transcribe formulas from
  `Measurement.cs`/`Tree.cs` with unit tests pinned to production values
  pulled from the migrated DB (pick 20 measurement rows across methods and
  assert recomputation reproduces the stored numbers — a mini-parity check
  that validates the transcription **before** replay runs).
- `reimportTrip(db, tripId)` — delete-then-import with legacy orphan
  cleanup semantics.
- Metrics: mark affected sites/states stale; run `recomputeStaleMetrics`
  in the same transaction.

Synthetic suite: the case list in doc 07 §8 (threshold boundaries, 1-ulp
coordinate difference, county mismatch, accumulation, idempotent
reimport, stale-flag propagation), plus property test: import then
reimport ≡ import.

## P3-02 Replay parity

Build `web/parity/replay/` per doc 07 §8 and run over **all** historical
imported trips on a Neon branch. Gate: 100% clean or per-trip investigated
waivers. Do not start UI work (P3-03+) until replay is green — UI built on
a wrong engine is rework.

## P3-03..07 Wizard UI

- Drafts live in the `import_*` tables exactly like legacy (autosave via
  server actions, `last_saved`). Multi-step: Trip → Sites → Trees → Review
  → Finish; steps navigable back; server-side validation mirrors the
  legacy model validators (read the `TMD.Model/Imports` validation
  attributes; keep required-on-finish vs allowed-while-draft distinction —
  legacy validates with the `Import` ruleset tag only at finish).
- Value parsing uses `web/lib/units.ts` parsers (the legacy input formats:
  `12' 6''`, `40 m`, DDM coordinates, etc.) and records `*_input_format`
  codes faithfully — they drive later display and "specified" logic.
- Coordinate picker: MapLibre modal writing DDM text into the field
  (legacy parity of stored value, not of widget). Site coordinates may be
  omitted → calculated from trees (transcribe
  `CalculateCoordinates` from `TMD.Model/Imports/Site.cs`/`Trip.cs`).
- Trees step: single vs multi-trunk types; multi-trunk trunk list with
  per-trunk girth/height + `CombinedGirthNumberOfTrunks`; per-tree
  status/age/terrain/form enums (integer codes per doc 01 §3).
- Finish: transaction around merge engine; success → History. Reimport
  path for already-imported trips (legacy allows re-finishing).
- History: user's trips, imported state, remove (draft) — legacy
  History POST inner actions.
- View: read-only rendering of a finished trip.

## P3-08 Photo upload

Route-handler upload (5 MB cap, jpeg/gif/png sniffed not just
extension), original → R2 `photos/{id}`, DB row with width/height/bytes/
format, reference row typed to import tree/site (types 2/3). Caption +
remove with the legacy authorization semantics (uploader/trip-creator).
On finish, references re-typed to types 4–7 exactly as the merge engine
dictates (doc 01 §10 step 1).

## P3-09 Import map endpoints

`/api/import/{tripId}/markers?site=|tree=` mirroring legacy
ImportSite/TreeMarkers incl. `CalculatedCoordinates` in the payload and
trip-editor authorization.

## P3-10 Playwright walkthrough

Script enters a chosen historical trip's data through the real UI on a
Neon branch (from Trip step through Finish), then asserts the resulting
rows equal that trip's replay-parity output. This closes the loop
UI → parser → engine → DB.

## Phase 3 exit gate (doc 07 §10)

Replay 100% (or named waivers), synthetic suite green, walkthrough green,
derived-data parity (doc 07 §7.2) re-run green, `phase3-gate.md`
committed.
