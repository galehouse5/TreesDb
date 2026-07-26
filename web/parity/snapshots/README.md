# Legacy snapshot capture — divergence window (P0-08)

## Timestamps

- **Production data dump**: `Tmd_Production-2026-7-12-0-25.bacpac`, exported
  **2026-07-12T00:25** (local; the migrated Postgres data and `corpus.json`
  describe this instant).
- **Legacy snapshot capture** (this directory): run against the live legacy
  site (`https://www.treesdb.org`) on **2026-07-17**, between
  `2026-07-17T19:56:55Z` and `2026-07-17T21:17:39Z` (spot-checks, full
  capture, and two small resumed/refreshed follow-up runs after fixing bugs
  found in `capture.ts` during the pass — see below).

## Divergence window

**5 days** between the dump instant (2026-07-12T00:25) and this capture
(2026-07-17). The site is the owner's own low-traffic personal database; no
bulk edits are expected in that window, but individual sites/trees/species
may have been added, corrected, or measured in the interim.

**Any parity mismatch that traces back to a mid-window edit (rather than a
genuine ETL or app bug) should be re-checked against a fresh delta capture
in Phase 4** before being treated as a real failure — do not assume a diff
is a bug without first checking whether the underlying legacy record was
touched between 2026-07-12T00:25 and 2026-07-17.

## Capture scope

All 8 categories captured against the live site per doc 07 §4: `exports`,
`markers`, `markerinfo`, `search`, `autocomplete`, `pages`, `photos`,
`redirects`. `photos` is an intentional no-op (corpus has 0 photos — legacy
production has none). See the P0-08 task report for full per-category
artifact/manifest counts, the two `capture.ts` bugs found and fixed during
this pass (manifest-entry collisions on same-URL variants, keyed by
`savePathBase` now instead of `url`), and the real legacy-site anomalies
recorded as-is (a handful of 404s/500s reflecting genuine current legacy
behavior, not capture defects).
