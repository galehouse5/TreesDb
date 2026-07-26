# 06 — Phase 4: Cutover & decommission

Checklist:

- [x] P4-01 redirect map implemented + tested — *lib/legacy-redirects.ts
      driven directly off parity/normalize.ts's equivalence table (no
      transcription; Edge-safe), case-insensitive middleware matching, all
      doc shapes incl. nested-parens species + scoped species + 302
      exports + token routes; 54 table-driven tests, redirects parity
      category 6/6. Deliberate exclusions documented in the file header
      (bare /Browse 404s in legacy itself; per-entity /Map/{id}/*Marker
      has no new target). Note: Next edge middleware rejects bare relative
      Location headers — NextResponse.redirect used, still emits relative
      on the wire, D-017 intact.*
- [ ] P4-02 write freeze + final delta sync
- [ ] P4-03 DNS cutover
- [ ] P4-04 post-cutover verification + monitoring window
- [ ] P4-05 Azure teardown + archives

## P4-01 Legacy URL redirects

Implement in Next.js middleware (patterns with spaces/parens need runtime
matching; `next.config` redirects can't express them all). Source of truth
is the URL-equivalence table in `web/parity/normalize.ts` — same table,
now emitting 301s. Must handle:

- `/Browse/Trees/{id}/Details` → `/trees/{id}` (same for Sites/States)
- `/Browse/Species/{bn} ({cn})/Details` → `/species/{slug}` — decode both
  raw-space and `%20`/`+` encodings; parenthesis-in-name edge cases (a
  common name containing parens) resolved by **last** ` (` split, matching
  the legacy route binder; unresolvable → 404 page with search box
- scoped species (`/Browse/Sites/{id}/Species/...`) → `/species/{slug}?site={id}`
- `/Browse/Locations`, `/Browse/Species`, `/Browse` → new list pages
- `/Export/...` all eight shapes → `/export/...` equivalents (**302**, and
  the target still serves the same CSV)
- `/Map`, `/Map/AllMarkers`, marker/info URLs → new routes (marker JSON
  URLs get 301s too; any cached legacy clients die at DNS switch anyway)
- `/Photos/{id}/{size}` → `/photos/{id}/{size}`
- `/Account/{token}/CompleteRegistration|CompletePasswordAssistance` →
  new token routes (emailed links!)
- `/Search?term=` → `/search?term=`
- case-insensitivity: legacy IIS routes were case-insensitive — middleware
  matches case-insensitively
- everything else → 404

Tests: table-driven over every mapped shape (incl. encoding variants) +
parity category `redirects` (doc 07 §5.6).

## P4-02 Freeze & final sync

1. Announce read-only window to users (site banner on legacy — repo owner).
2. Repo owner disables Import role writes on legacy (maintenance mode
   switch in Web.config) — reads stay up.
3. Re-run the dump (P0-03) → diff against Neon with the data-parity suite
   → apply the delta (ETL upsert mode `--delta`: insert missing Ids,
   update changed rows, report deletes for manual review).
4. Photo delta: copy blobs for new photo Ids.
5. Data-parity aggregates re-run → zero diff. Re-capture the `exports` and
   `markers` snapshot categories and re-verify against the new app (data
   changed since Phase 1's gate).

## P4-03 DNS

- Add `treesdb.org` (+ `www`) to the Vercel project; lower TTL a day
  ahead; switch A/CNAME; keep the legacy App Service running (it still
  serves stragglers on cached DNS, read-only).
- HSTS + HTTP→HTTPS on Vercel (default).

## P4-04 Post-cutover

- Production smoke: parity `exports` + `markers` categories against
  `https://treesdb.org`; redirect suite against production; login smoke
  (repo owner); one real import end-to-end (repo owner submits a small
  trip; verify merge + metrics + map).
- Watch Sentry + Vercel logs for 2 weeks; 404 log review at day 2 and day
  14 → add any missed legacy URL shapes to the redirect map.

## P4-05 Teardown & archives (repo owner, after the monitoring window)

- Final `.bacpac` export of Azure SQL → cold storage (repo owner's
  choice; R2 works). Keep forever.
- Blob container archive → R2 `legacy-archive/`.
- Delete App Service, SQL database, storage account, App Service plan.
- Tag the repo `legacy-final` on the pre-migration mainline; the legacy
  projects can then be removed from the default branch in a follow-up
  cleanup (`git rm` TMD* etc.) — history preserves them.
- Update README: new stack, dev setup, link to this plan as historical
  record.
