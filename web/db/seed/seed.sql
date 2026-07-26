-- CI seed data — synthetic fixtures only.
--
-- Scope: this file currently seeds ONLY the `users` table (3 synthetic
-- fixture rows). It is run by .github/workflows/ci.yml against the
-- Postgres 16 service container, after migrations (task P0-02) have been
-- applied, so integration tests and any parity `verify.ts` categories that
-- don't need full production data can run in CI without touching real
-- user PII.
--
-- BLOCKED: public-data tables (countries, states, sites, site_visits,
-- site_visitors, trees, tree_measurements, tree_measurers, known_species,
-- photos, photo_references, import_trips, import_trip_measurers,
-- import_sites, import_trees, import_trunks) are NOT seeded here. That
-- seed is blocked on the production dump (task P0-03) landing in
-- web/parity/dumps/ and the P0-04 ETL load — see db/seed/README.md for
-- what gets added and when (doc 02 §P0-10).
--
-- Column list / row values are built from docs/migration/01-system-reference.md
-- §6.1 (password vectors) and §2 (Users.Users row). See db/seed/README.md
-- and inline TODOs below for anything guessed rather than read directly
-- off the doc.
--
-- Idempotent: safe to run multiple times against the same database
-- (ON CONFLICT DO NOTHING keyed on the fixed ids).

BEGIN;

-- Column order/nullability transcribed from doc 01 §2 "Users.Users" row:
--   Email, Firstname, Lastname, Roles, PasswordHash,
--   PasswordNumerics/Uppercase/Lowercase/Specials/Length,
--   Created, LastLogin, EmailVerificationToken, EmailVerified,
--   RecentlyFailedLoginAttempts, LastFailedLoginAttempt,
--   ForgottenPasswordAssistanceToken, …TokenIssued, …TokenUsed
-- snake_case per P0-02 conventions (doc 02 §P0-02).
--
-- TODO(P0-02 review): doc 01 §2 marks nullability with a trailing `?` for
-- EmailVerified, LastFailedLoginAttempt, ForgottenPasswordAssistanceToken(+
-- Issued/Used) only. LastLogin and EmailVerificationToken are NOT marked
-- nullable there, so they're treated as NOT NULL below (LastLogin gets a
-- placeholder timestamp, not NULL) — confirm this matches the actual
-- db/schema.ts column definitions once P0-02 lands, and drop this TODO.
INSERT INTO users (
  id,
  email,
  firstname,
  lastname,
  roles,
  password_hash,
  password_numerics,
  password_uppercase,
  password_lowercase,
  password_specials,
  password_length,
  created,
  last_login,
  email_verification_token,
  email_verified,
  recently_failed_login_attempts,
  last_failed_login_attempt,
  forgotten_password_assistance_token,
  forgotten_password_assistance_token_issued,
  forgotten_password_assistance_token_used
)
OVERRIDING SYSTEM VALUE
VALUES
  -- alice@example.com / password "Password1" (doc 01 §6.1 row 1)
  -- composition: 1 upper (P), 7 lower (assword), 1 numeric (1), 0 special, length 9
  (
    1,
    'alice@example.com',
    'Alice',
    'Anderson',
    3,
    '\x974bcde0bd9738e8fda880914e25a67e855d107a29774ad7aecd92638b3e3e5f',
    1, 1, 7, 0, 9,
    '2020-01-01T00:00:00Z',
    '2020-01-01T00:00:00Z',
    -- TODO: arbitrary synthetic 32-byte token (not a doc-cited vector) —
    -- reused the doc 01 §6.3 SecureToken example bytes 0x00..0x1f for a
    -- deterministic, easy-to-recognize value.
    '\x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    '2020-01-01T00:00:00Z',
    0,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  -- bob@treesdb.org / password "correct horse battery staple" (doc 01 §6.1 row 2)
  -- composition: 0 upper, 25 lower, 0 numeric, 3 special (the 3 spaces), length 28
  (
    2,
    'bob@treesdb.org',
    'Bob',
    'Baker',
    3,
    '\x15b5b75e8cf8a1637ee6d297bbcf5dfd15a5630c7bce077dc13f8424df90c775',
    0, 0, 25, 3, 28,
    '2020-01-02T00:00:00Z',
    '2020-01-02T00:00:00Z',
    -- TODO: arbitrary synthetic 32-byte token (0x20..0x3f), not a doc-cited vector.
    '\x202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f',
    '2020-01-02T00:00:00Z',
    0,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  -- carol@example.com / password "Tr0ub4dor&3" (doc 01 §6.1 row 3; email
  -- stored normalized — raw input "  Carol@Example.COM  " trims+lowercases
  -- to this value per doc 01 §2 Email column note)
  -- composition: 1 upper (T), 6 lower (r,u,b,d,o,r), 3 numeric (0,4,3), 1 special (&), length 11
  (
    3,
    'carol@example.com',
    'Carol',
    'Carter',
    3,
    '\x25c3ef82258912347ce37c5478c134e8f7f00cac34a0b9652535f7ac1854990e',
    3, 1, 6, 1, 11,
    '2020-01-03T00:00:00Z',
    '2020-01-03T00:00:00Z',
    -- TODO: arbitrary synthetic 32-byte token (0x40..0x5f), not a doc-cited vector.
    '\x404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f',
    '2020-01-03T00:00:00Z',
    0,
    NULL,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Keep the identity sequence past the fixture ids so any later INSERTs
-- (without OVERRIDING SYSTEM VALUE) in the same CI run don't collide.
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

COMMIT;
