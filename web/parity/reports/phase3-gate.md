# Phase 3 exit gate — import wizard, merge, photos

Gate defined in `docs/migration/05-phase3-import-photos.md` (doc 07 §10
row "Phase 3"). Status as of 2026-07-18: **every machine-verifiable
requirement MET; two items pending** (§3).

## 1. Requirements

| Requirement | Status | Evidence |
|---|---|---|
| Replay parity 100% (or named waivers) | MET | All 1,694 historical imported trips: 960 exact fixed points, 734 explained by evidence-checked drift buckets **W-101..W-110** (`parity/waivers.md`; every bucket rule requires positive DB/git evidence), 0 unexplained, **0 engine bugs**. `parity/reports/replay-2026-07-18.{json,md}`. Sweep runs in ~6 min (per-id stale-metric scoping) |
| Synthetic merge suite green | MET | 30+ dedicated engine/predicate tests: 25.0′ boundary merges / 25.1′ misses, 1-ulp float32 coordinate separation, county mismatch, accumulation, reimport idempotence, orphan cleanup, stale-flag propagation; derived formulas pinned to 20 production rows (19/20 float32-exact, 1 documented ULP anomaly) |
| Playwright wizard walkthrough green | MET | `e2e/walkthrough.e2e.ts`: historical trip 906 typed through the real UI (mixed input formats incl. FeetDecimalInches + DDM), finished, canonical rows equal the original's by natural key (replay differ reused); 3 consecutive green runs with count-restoration teardown |
| §7.2 derived-data parity re-run green | MET | `verify-derived.ts` post-merge-code: **27,315 checks, 0 unwaived, 64 waived** (D-016/W-010: merged-pair view rows + retired/introduced species hashes; W-001 tie ids). `parity/reports/derived-2026-07-18.{json,md}` |
| `phase3-gate.md` committed | MET | this file |

Wizard scope delivered (P3-03..07, 09): Trip / Sites (+ MapLibre DDM
coordinate picker) / Trees (domain-complete single+multi-trunk editor) /
Review / Finish / Reimport / History (incl. the imported-trip Remove =
true import undo) / View / import marker API — each step live-verified
against the dev server with legacy-source-cited semantics and full
throwaway-row cleanup. 1,582-test suite green, typecheck/build clean.

## 2. Notable legacy findings (all documented at the cited code sites)

- The staging log is NOT immutable: legacy's wizard actions have no
  IsImported gate, so finished trips' import rows can be (and were)
  edited post-Finish — proven by created>imported timestamps (W-109).
- Legacy's reachable Trees UI never exposed multi-trunk trees; its
  "Detailed edit" POST throws NotImplementedException in production.
- History Remove works on imported trips (unconditional
  ImportRepository.Remove — deletes the trip's canonical contribution
  with orphan cleanup).
- Finish validates only the two structural count minimums; an incomplete
  graph 500s in legacy (the port surfaces validation instead).
- Legacy's Distance cm-parsing branch crashes (misnamed regex group);
  ported correctly per ground rules §3.

## 3. Pending

1. **P3-08 photo upload** — blocked on Cloudflare R2 credentials from the
   repo owner (bucket + access key/secret + endpoint). Note: production
   currently has zero photo rows, so no data migration accompanies this —
   it is new-upload capability only.
2. **Repo-owner review** of the W-101..W-110 replay drift ledger
   (`parity/waivers.md`) — each entry carries its evidence; sign-off
   formally closes the replay gate's "investigated, named waiver" clause.
