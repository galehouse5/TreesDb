# Phase 2 exit gate — accounts & auth

Gate defined in `docs/migration/04-phase2-auth.md` §"Phase 2 exit gate"
(doc 07 §10 row "Phase 2"). **GATE CLOSED 2026-07-18**: all
machine-verifiable requirements met, and the production-hash smoke
passed — the repo owner promoted the auth build to production
(Neon migrated, AUTH_SECRET set) and logged into their real account at
treesdb.vercel.app successfully, exercising a real legacy hash end to
end (verify → argon2id wrap-and-rehash). §3's operator steps are done
except the optional RESEND_API_KEY (email flows fall back to the console
transport until provided).

## 1. Requirements

| Requirement | Status | Evidence |
|---|---|---|
| Vector suites green (hash, token) | MET | `lib/crypto/` 28 tests: all 4 doc-01 §6.1 password vectors (incl. email-normalization + non-ASCII), create/verify trim asymmetry, both §6.3 token vectors both directions, zero-fill-on-invalid incl. decoded-length guard |
| Fixture users log in; second login uses argon2 path | MET | `lib/auth-flow.test.ts` (12 pglite tests): legacy-sha256 login succeeds → `password_algo` flips to `argon2id`; follow-up login verified via argon2 with the legacy hash tampered (proving the legacy path is no longer consulted); D-012 trim tolerance holds on both paths. Also live-verified against the dev server via the full CSRF/credentials-callback flow (session JSON carries `userId` + decoded roles) |
| Reset-token expiry / single-use / zero-token | MET | `lib/account-flows.test.ts` (23 tests): 59-min accepted / 61-min rejected boundary, second use rejected, zero-token short-circuits before any DB query; completed reset stores argon2 (never legacy-format) |
| Email templates render both links correctly | MET (render); real send pending key | `lib/email/templates.ts` tests render `/account/verify/{token}` and `/account/password-assistance/{token}` with the token embedded; origin chain `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost. Live sending requires `RESEND_API_KEY` (console transport exercised in dev) |
| Production-hash smoke (repo owner, real account) | **MET** (2026-07-18) | Repo owner logged into production with their real legacy account — see header |
| `phase2-gate.md` committed | MET | this file |

Additional (not gate-mandated, delivered): D-013 rate limiting
(10 failures/hour → 15-min block, boundary-tested), P2-06 account edit
(legacy scope mirrored: read-only email, exact legacy messages), P2-07
middleware (`/import/**` gated; wrong-role → 401 mirroring legacy
`UnauthorizedResult`; exports stay public), legacy token URLs
`/Account/{token}/CompleteRegistration|CompletePasswordAssistance`
redirect-implemented ahead of the Phase 4 map.

Quality sweep: 937-test suite green (64 files), `tsc --noEmit` clean,
eslint 0 errors. Legacy behaviors were re-derived from TMD source with
citations in code (notably: login uses ONE message "Invalid email or
password." for unknown/unverified/wrong — `AccountController.cs:70-83`;
account-edit's bad-current-password message is `"Invalid password."` —
`AccountController.cs:244`; title-casing preserves all-caps words —
`StringExtensions.cs:24-25`).

## 2. Documented divergences (all in code comments at the cited sites)

- Duplicate-email registration rejects ANY duplicate; legacy only rejects
  verified duplicates (`AccountController.cs:122-132`). Accepted
  simplification.
- `markEmailVerified` overwrites the verification token with the 32-zero
  sentinel (column is NOT NULL); repeat-verify reads "not found" instead
  of legacy's "already verified".
- Argon2 hashes are computed over the TRIMMED password at create AND
  verify (D-012 consistency); legacy's create-path was untrimmed, but no
  legacy-created argon2 hashes exist, so the asymmetry is preserved only
  where it matters (the legacy-sha256 verify path).
- Account edit uses separate firstname/lastname fields (continuing the
  P2-04 registration divergence) instead of legacy's single
  "Lastname, Firstname" combined field; persisted-entity validation
  (50-char limits) is identical.

## 3. Pending operator steps (blocked on repo owner)

1. **Neon migration** — the `password_algo`/`password_argon2` columns must
   exist in Neon before any deploy of this code serves logins:
   `cd C:\dev\treesdb\web; npx tsx scripts/maintenance/run-migrations.ts <env-file>`
   (same env-file pattern as run-d016; idempotent).
2. **Vercel env** — set `AUTH_SECRET` (generate a fresh 32-byte value) for
   Production (and Preview); optionally `RESEND_API_KEY` + `EMAIL_FROM`
   to enable real email sending (flows fall back to a console transport
   without it — registration/reset are then not completable by real
   users, acceptable for a preview).
3. **Production-hash smoke** — after deploying a preview: repo owner logs
   in with their real account at `/account/login`. This is the one test
   that exercises a real legacy hash end to end; on success their row
   flips to argon2id (verify `password_algo` in Neon). Gate closes on
   this sign-off.
