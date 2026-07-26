# 04 — Phase 2: Accounts & auth

Existing users must log in with their current passwords, unassisted. That
constraint drives everything here. Read doc 01 §6 in full first.

Checklist:

- [x] P2-01 legacy hash + vectors — *satisfied by `web/lib/crypto/password.ts`
      (P0-05 deliverable, predates this phase; all 4 §6.1 vectors +
      create/verify trim asymmetry + policy checks, 14 tests). Path
      differs from the one this doc originally named; kept where P0 put
      it rather than moving.*
- [x] P2-02 SecureToken codec + vectors — *satisfied by
      `web/lib/crypto/secure-token.ts` (P0-05; both §6.3 vectors,
      zero-fill-on-invalid semantics incl. decoded-length guard, 14
      tests).*
- [x] P2-03 Auth.js credentials provider + wrap-and-rehash — *auth.ts /
      auth.config.ts / lib/auth-flow.ts; live-verified: login flips
      legacy-sha256→argon2id, D-012 trim both paths, D-013 rate limit
      (10/hr → 15-min block). NOTE (source-verified): legacy uses ONE
      message "Invalid email or password." for unknown/unverified/wrong
      (AccountController.cs:70-83) — no distinct unverified message.*
- [x] P2-04 registration + email verification — *lib/account-flows.ts +
      lib/email/ (Resend when RESEND_API_KEY set, console dev transport
      otherwise); legacy title-case ported (StringExtensions.cs:24-25,
      all-caps preserved); duplicate-email simplified to reject-any (legacy
      only rejects verified dupes, AccountController.cs:122-132 — accepted
      simplification, documented in code); legacy token URLs
      /Account/{token}/Complete* redirect-implemented now.*
- [x] P2-05 password assistance (reset) — *silent-success on unknown email
      (AccountController.cs:166-188); 1-hour/single-use/zero-token guards
      tested (59/61-min boundary); new hashes always argon2id.*
- [x] P2-06 account edit — *legacy scope mirrored exactly
      (AccountController.cs:229-270): names + password change only, email
      read-only (no email-change UI in legacy — the email-salt rehash
      machinery stays dormant); exact legacy messages incl. "Invalid
      password." (:244); separate name fields continue the P2-04
      divergence, 50-char entity validation identical.*
- [x] P2-07 roles/session claims + route protection — *JWT {userId, roles};
      middleware gates /import/** (anonymous → login redirect w/
      callbackUrl; wrong-role → 401 mirroring legacy UnauthorizedResult,
      AccountController.cs:16-41); exports stay public.*
- [x] P2-08 gate — CLOSED 2026-07-18. *All machine-verifiable
      requirements met (vectors, argon2-flip integration, token
      expiry/single-use, template rendering) AND the production-hash
      smoke passed: Neon migrated, AUTH_SECRET set, auth build promoted
      to production, and the repo owner logged into their real account
      successfully — a real legacy hash verified + wrapped to argon2id
      end to end. See `web/parity/reports/phase2-gate.md`. Only optional
      item outstanding: RESEND_API_KEY for real email sending.*

## P2-01 Legacy hash

`legacyHash(password, email)` = SHA-256 over UTF-16LE bytes of
`password + email.trim().toLowerCase()` (Node: `Buffer.from(str,
"utf16le")`). Tests: the four vectors (doc 01 §6.1), plus:
- verify-path trims the **candidate** password (`" Password1 "` verifies
  against the `Password1` vector);
- create-path comparison is out of scope (no new legacy hashes are ever
  created).
Compare with `crypto.timingSafeEqual`.

## P2-02 Token codec

Exact legacy codec (doc 01 §6.3): 32 random bytes; encode = base64, drop
final `=`, `/`→`_`, `+`→`-`; decode = reverse, append `=`, invalid input →
**32 zero bytes** (do NOT throw — matches legacy so outstanding emailed
links keep working; zero-token never matches a real token). Vectors from
doc 01 §6.3 + round-trip property test.

## P2-03 Login — schema additions & flow

Add columns: `users.password_algo` (`'legacy-sha256' | 'argon2id'`,
default `'legacy-sha256'` for migrated rows), `users.password_argon2`
(text, null). Flow on credentials login:
1. Look up by normalized email (trim+lower — same normalization as
   legacy).
2. Reject unverified email (`email_verified is null`) with the legacy
   message semantics.
3. If `password_algo='legacy-sha256'`: verify via P2-01; on success,
   compute argon2id hash, store, flip algo, null out the legacy metric
   columns. If `'argon2id'`: verify argon2 (candidate **trimmed first**,
   preserving legacy tolerance — D-012).
4. Failed attempts: maintain `recently_failed_login_attempts` +
   `last_failed_login_attempt` with the 1-hour reset (doc 01 §6.2). Add
   **new** rate limiting (D-013: 10 failures/hour → 15-min block) —
   legacy had none; this is a security addition, not a parity break
   (waiver not needed: no legacy-observable behavior changes for
   legitimate flows).
5. Session: JWT with `{ userId, roles }` (bitmask decoded to
   `['import','export','admin']`).

Constraint carried from legacy: **email change on a `legacy-sha256` user
must require the current password and rehash within the same transaction**
(the email is the salt). For argon2 users, email change is free.

## P2-04 / P2-05 Registration & reset

Same flows and token semantics as legacy: registration stores
email-verification token (no expiry), sends Resend email linking
`/account/verify/{token}`; reset issues 1-hour single-use token, link
`/account/reset/{token}`; completing reset creates an **argon2** hash
(new hashes are never legacy-format). Password policy: min 8 chars, ≥2
character classes (legacy policy, doc 01 §6.1) — keep (D-014).
Legacy token URLs (`/Account/{token}/CompleteRegistration|
CompletePasswordAssistance`) redirect to the new routes in the Phase 4
map, but implement the handlers now so emailed legacy links work at
cutover.

## P2-06 / P2-07

Account edit: firstname/lastname (stored title-cased like legacy),
password change (requires current password). Route protection: middleware
gates `/import/**` on role `import`; per-trip creator checks in the data
layer (doc 01 §1 authorization matrix). Anonymous users implicitly have
export rights (legacy behavior — exports stay public).

## Phase 2 exit gate (doc 07 §10)

- Vector suites green (hash, token).
- Integration: fixture users from the CI seed (built from the vectors) log
  in; second login uses the argon2 path (assert `password_algo` flipped
  and legacy verify no longer consulted).
- **Production-hash smoke** (repo owner participates): owner logs into the
  preview site with their real account — the one test that uses a real
  legacy hash end to end.
- Reset-token expiry (61 min → rejected), single-use, zero-token
  rejection tests. Email templates render both links correctly to the
  production origin.
- `phase2-gate.md` committed.
