/**
 * Login / account data layer -- task P2-03 (doc 04 §P2-03, doc 01 §6).
 * Pure SQL functions, no Auth.js imports: the credentials provider (a later
 * task) composes these with lib/auth/legacy-hash.ts (P2-01, legacy SHA-256
 * verify) and lib/auth/token.ts (P2-02, SecureToken codec) to implement the
 * actual login / wrap-and-rehash / password-reset / email-verification
 * flows. Every function here is a "dumb" data operation -- which branch to
 * take, when to rehash, rate limiting (D-013), etc. is upstream policy, not
 * this file's job.
 *
 * --- Roles bitmask --------------------------------------------------------
 * `TMD.Model/Users/UserRoles.cs:12-16`:
 *   None = 0x0, Import = 0x1, Export = 0x2, Admin = 0x4, Registered = 0x8
 * `Registered` is a real flag value but is never persisted/set anywhere in
 * the legacy codebase (doc 01 §1) -- `decodeRoles` intentionally has no
 * branch for it, matching the session-claim role list doc 04 §P2-03 step 5
 * specifies (`['import','export','admin']`).
 *
 * --- NOT NULL columns the doc's wording says to "null out" -----------------
 * Doc 04 §P2-03 step 3 says a successful legacy-hash verify should "flip
 * algo, null out the legacy metric columns"; doc 04's P2-03 task list says
 * `markEmailVerified` should "clear the verification token". Both target
 * columns are declared NOT NULL in db/schema.ts (`password_numerics/
 * _uppercase/_lowercase/_specials/_length` all `.notNull().default(0)`;
 * `email_verification_token` `.notNull()`) -- this task owns only
 * *additions* to the users table (`password_algo`/`password_argon2`), not
 * loosening those existing constraints, so literal SQL NULL is not an
 * option here without a schema change outside this task's file ownership.
 * Faithful-in-spirit substitutes, used below:
 *   - `upgradePasswordHash` resets the five metric columns to their own
 *     NOT-NULL default (0) rather than NULL -- D-005 already says these
 *     columns are unmaintained post-upgrade and slated for a future drop;
 *     zero is the value that means "no composition data" while satisfying
 *     the constraint today.
 *   - `markEmailVerified` overwrites the token with the 32-zero-byte
 *     sentinel value doc 01 §6.3 / doc 04 P2-02 already define as the
 *     codec's own "never matches a real token" invalid-input result
 *     (`ZERO_TOKEN` below) -- functionally "cleared" (no stored token can
 *     ever validate again) without violating NOT NULL.
 * Both call sites are flagged inline; a future task that actually drops
 * these columns (per D-005) can simplify accordingly.
 */
import type { SqlTag } from "./sql-tag";
import { defaultSql } from "./sql-tag";

// ---------------------------------------------------------------------------
// Roles bitmask
// ---------------------------------------------------------------------------

/** `TMD.Model/Users/UserRoles.cs:12-16` -- Import/Export/Admin bits actually persisted. */
export const USER_ROLE_BITS = {
  import: 0x1,
  export: 0x2,
  admin: 0x4,
} as const;

export type UserRoleName = "import" | "export" | "admin";

/** Bitmask -> role name list, in `['import','export','admin']` order (doc 04 §P2-03 step 5). */
export function decodeRoles(bitmask: number): UserRoleName[] {
  const roles: UserRoleName[] = [];
  if ((bitmask & USER_ROLE_BITS.import) === USER_ROLE_BITS.import) roles.push("import");
  if ((bitmask & USER_ROLE_BITS.export) === USER_ROLE_BITS.export) roles.push("export");
  if ((bitmask & USER_ROLE_BITS.admin) === USER_ROLE_BITS.admin) roles.push("admin");
  return roles;
}

// ---------------------------------------------------------------------------
// findUserByEmail
// ---------------------------------------------------------------------------

export interface AuthUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: UserRoleName[];
  passwordHash: Buffer;
  passwordAlgo: string;
  passwordArgon2: string | null;
  emailVerified: Date | null;
  recentlyFailedLoginAttempts: number;
  lastFailedLoginAttempt: Date | null;
}

interface RawAuthUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: number;
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
  email_verified: Date | null;
  recently_failed_login_attempts: number;
  last_failed_login_attempt: Date | null;
}

/**
 * Normalized lookup: trim+lower the candidate email, compare against
 * trim+lower(users.email) -- same normalization legacy applies when storing
 * (doc 01 §2 "Email ... stored trimmed+lowercased"), applied again here on
 * the stored side too so this stays correct even against any row that
 * predates strict normalization at write time.
 */
export async function findUserByEmail(
  email: string,
  sql: SqlTag = defaultSql(),
): Promise<AuthUserRow | null> {
  const normalized = email.trim().toLowerCase();
  const rows = await sql<RawAuthUserRow>`
    select
      id, email, firstname, lastname, roles,
      password_hash, password_algo, password_argon2,
      email_verified, recently_failed_login_attempts, last_failed_login_attempt
    from users
    where lower(trim(email)) = ${normalized}
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    firstname: r.firstname,
    lastname: r.lastname,
    roles: decodeRoles(r.roles),
    // Coerce to a real Buffer: the real postgres.js client already returns
    // one, but PGlite's driver returns a plain Uint8Array for bytea columns
    // -- Buffer.from() on an existing Buffer is a cheap, allocation-free
    // no-op (same underlying bytes), so this is safe for both transports.
    passwordHash: Buffer.from(r.password_hash),
    passwordAlgo: r.password_algo,
    passwordArgon2: r.password_argon2,
    emailVerified: r.email_verified,
    recentlyFailedLoginAttempts: r.recently_failed_login_attempts,
    lastFailedLoginAttempt: r.last_failed_login_attempt,
  };
}

// ---------------------------------------------------------------------------
// Login bookkeeping (doc 01 §6.2, `User.AttemptLogon`, `User.cs:139-157`)
// ---------------------------------------------------------------------------

/**
 * Failed-login bookkeeping. Legacy: `LastFailedLogonAttempt <
 * DateTime.Now.Subtract(FailedLoginMemoryDuration)` resets the counter to 0
 * (nullable-DateTime `<` is false when null, so a never-failed-before user
 * takes the same "no reset" path -- but its counter default is already 0)
 * before incrementing by 1 -- net effect for both "never failed" and
 * "last failure > 1h ago" is landing on exactly 1. `now` is a parameter
 * (not SQL `now()`) for testability, per this task's spec.
 */
export async function recordFailedLogin(
  userId: number,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      recently_failed_login_attempts = case
        when last_failed_login_attempt is null
          or last_failed_login_attempt < ${now}::timestamptz - interval '1 hour'
          then 1
        else recently_failed_login_attempts + 1
      end,
      last_failed_login_attempt = ${now}
    where id = ${userId}
  `;
}

/** Successful login: stamp `last_login`, reset the failed-attempt counter. */
export async function recordSuccessfulLogin(
  userId: number,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      last_login = ${now},
      recently_failed_login_attempts = 0
    where id = ${userId}
  `;
}

// ---------------------------------------------------------------------------
// Password upgrade (doc 04 §P2-03 step 3)
// ---------------------------------------------------------------------------

/**
 * Flips a legacy-sha256 user to argon2id after a successful legacy-hash
 * verify. `password_hash` (the legacy SHA-256 bytes) is deliberately left
 * untouched -- kept for audit (D-005) -- only the new argon2 hash, the algo
 * flag, and the (now-unmaintained, D-005) password-composition metrics
 * change. See this file's header note on why the metrics are reset to 0
 * rather than SQL NULL.
 */
export async function upgradePasswordHash(
  userId: number,
  argon2Hash: string,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      password_argon2 = ${argon2Hash},
      password_algo = 'argon2id',
      password_numerics = 0,
      password_uppercase = 0,
      password_lowercase = 0,
      password_specials = 0,
      password_length = 0
    where id = ${userId}
  `;
}

// ---------------------------------------------------------------------------
// Email change with rehash (doc 04 "Constraint carried from legacy")
// ---------------------------------------------------------------------------

/**
 * Dumb data function: sets `email` and, when provided, the corresponding
 * hash column(s) -- in one UPDATE so the constraint from doc 04 ("email
 * change on a legacy-sha256 user must require the current password and
 * rehash within the same transaction -- the email is the salt") can never
 * observe an intermediate state where the email changed but the hash didn't.
 * Pass `null` for a hash argument to leave that column unchanged (e.g. an
 * argon2 user's email change, which doc 04 says is "free" -- no rehash
 * needed since argon2 hashes aren't salted by the email). Policy (deciding
 * *whether* a rehash is required/which hash(es) to pass) lives upstream in
 * the credentials-provider / account-edit code that calls this.
 */
export async function changeEmailWithRehash(
  userId: number,
  newEmail: string,
  newLegacyHash: Buffer | null,
  argon2Hash: string | null,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      email = ${newEmail},
      password_hash = coalesce(${newLegacyHash}::bytea, password_hash),
      password_argon2 = coalesce(${argon2Hash}::text, password_argon2)
    where id = ${userId}
  `;
}

// ---------------------------------------------------------------------------
// Password-assistance tokens (doc 01 §6.3)
// ---------------------------------------------------------------------------

/**
 * Issues a new password-assistance token: sets the token + issued timestamp,
 * clears any previous `used` stamp (both nullable columns -- no NOT NULL
 * workaround needed here, unlike the email-verification token below).
 */
export async function issuePasswordAssistanceToken(
  userId: number,
  tokenBytes: Buffer,
  issued: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      forgotten_password_assistance_token = ${tokenBytes},
      forgotten_password_assistance_token_issued = ${issued},
      forgotten_password_assistance_token_used = null
    where id = ${userId}
  `;
}

/** Stamps a password-assistance token as used (single-use enforcement, doc 01 §6.3). */
export async function consumePasswordAssistanceToken(
  userId: number,
  used: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set forgotten_password_assistance_token_used = ${used}
    where id = ${userId}
  `;
}

// ---------------------------------------------------------------------------
// Email verification (doc 01 §6.3)
// ---------------------------------------------------------------------------

/**
 * `email_verification_token` is declared NOT NULL (db/schema.ts) -- see this
 * file's header note. 32 zero bytes is doc 01 §6.3 / doc 04 P2-02's own
 * codec sentinel for "invalid token", which by construction never equals a
 * real (random, non-zero-w.h.p.) issued token, so overwriting with it is
 * indistinguishable in effect from clearing the token.
 */
export const ZERO_TOKEN: Buffer = Buffer.alloc(32);

export async function setEmailVerificationToken(
  userId: number,
  tokenBytes: Buffer,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set email_verification_token = ${tokenBytes}
    where id = ${userId}
  `;
}

/** Marks the email verified and clears the verification token (see `ZERO_TOKEN` above). */
export async function markEmailVerified(
  userId: number,
  when: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      email_verified = ${when},
      email_verification_token = ${ZERO_TOKEN}
    where id = ${userId}
  `;
}

// ---------------------------------------------------------------------------
// User creation (task P2-04, doc 04 §P2-04) -- APPENDED for this task; every
// function above this point is pre-existing (P2-03) and untouched, per this
// task's file-ownership rule ("append only, never edit existing functions").
// ---------------------------------------------------------------------------

export interface CreateUserInput {
  /** Caller normalizes (trim+lower) -- same convention `findUserByEmail` reads back with. */
  email: string;
  /**
   * Caller title-cases (see `lib/account-flows.ts` `legacyTitleCase`, which
   * ports `TMD.Model/Users/User.cs`'s `Firstname`/`Lastname` setters,
   * `User.cs:25-39`). This function stores whatever it's given verbatim --
   * title-casing is policy, not this "dumb data" layer's job (file header).
   */
  firstname: string;
  lastname: string;
  /**
   * argon2id hash of the password (trimmed -- D-012, see account-flows.ts).
   * New accounts never get a legacy-sha256 row: doc 04 §P2-04/05 "new hashes
   * are never legacy-format".
   */
  passwordArgon2: string;
  /** 32 raw token bytes -- doc 01 §6.3, no expiry, single value per user. */
  emailVerificationToken: Buffer;
  now: Date;
}

/**
 * `password_hash bytea NOT NULL` (db/schema.ts) has no legacy-format
 * equivalent for a brand-new argon2-only account -- there is no password to
 * hash with the legacy SHA-256(password+email) scheme (doc 01 §6.1), and
 * this column can't be SQL NULL. 32 zero bytes is used as an explicit
 * "not a real legacy hash" sentinel: `password_algo='argon2id'` always
 * correctly discriminates which hash column is authoritative for a row
 * (same discriminator convention `password_algo` already uses elsewhere in
 * this file), so this sentinel value is never actually consulted by any
 * verify path.
 */
const NEW_ACCOUNT_LEGACY_HASH_SENTINEL: Buffer = Buffer.alloc(32);

/**
 * Inserts a brand-new registered user, porting `User.Create` +
 * `AccountController.Register` POST's insert shape
 * (`TMD/Controllers/AccountController.cs:104-143`,
 * `TMD.Model/Users/User.cs:162-180`). Roles = `Import|Export` = 3
 * (`TMD.Model/Users/UserRoles.cs:12-16`), the same bitmask every legacy
 * registration gets (`User.cs:178`). Dumb insert only -- duplicate-email
 * rejection, password policy, title-casing, and argon2 hashing are upstream
 * policy in `lib/account-flows.ts` (this file's header philosophy).
 */
export async function createUser(
  input: CreateUserInput,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const rows = await sql<{ id: number }>`
    insert into users (
      email, firstname, lastname, roles,
      password_hash, password_algo, password_argon2,
      password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
      created, last_login, email_verification_token, email_verified,
      recently_failed_login_attempts, last_failed_login_attempt,
      forgotten_password_assistance_token, forgotten_password_assistance_token_issued, forgotten_password_assistance_token_used
    ) values (
      ${input.email}, ${input.firstname}, ${input.lastname}, 3,
      ${NEW_ACCOUNT_LEGACY_HASH_SENTINEL}, 'argon2id', ${input.passwordArgon2},
      0, 0, 0, 0, 0,
      ${input.now}, ${input.now}, ${input.emailVerificationToken}, null,
      0, null,
      null, null, null
    )
    returning id
  `;
  return rows[0]!.id;
}

// ---------------------------------------------------------------------------
// Token lookups (task P2-04/P2-05, doc 01 §6.3) -- ports
// `UserRepository.InternalFindByEmailVerificationToken` /
// `InternalFindByForgottenPasswordAssistanceToken`
// (`TMD.Model/Users/UserRepository.cs:8-22`): legacy decodes the
// URL-encoded token then looks up by raw byte equality; same shape here.
// Byte-equality is done in SQL (there's no way to index-scan for a
// constant-time comparison) -- the policy layer (`lib/account-flows.ts`)
// still routes every token through `secure-token.ts`'s
// zero-fill-on-invalid `decodeToken` and short-circuits the
// all-zero-sentinel case before ever reaching these queries.
// ---------------------------------------------------------------------------

export interface EmailVerificationLookupRow {
  id: number;
  emailVerified: Date | null;
}

export async function findUserByEmailVerificationToken(
  tokenBytes: Buffer,
  sql: SqlTag = defaultSql(),
): Promise<EmailVerificationLookupRow | null> {
  const rows = await sql<{ id: number; email_verified: Date | null }>`
    select id, email_verified
    from users
    where email_verification_token = ${tokenBytes}
  `;
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, emailVerified: r.email_verified };
}

export interface PasswordAssistanceLookupRow {
  id: number;
  forgottenPasswordAssistanceTokenIssued: Date | null;
  forgottenPasswordAssistanceTokenUsed: Date | null;
}

// ---------------------------------------------------------------------------
// Account edit (task P2-06, doc 04 §P2-06) -- APPENDED for this task; every
// function above this point is pre-existing (P2-03/P2-04/P2-05) and
// untouched, per this task's file-ownership rule ("append only, never edit
// existing functions").
// ---------------------------------------------------------------------------

export interface AccountUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  passwordHash: Buffer;
  passwordAlgo: string;
  passwordArgon2: string | null;
}

interface RawAccountUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
}

/**
 * Looks up the session-bound user by id (as opposed to `findUserByEmail`,
 * used by the login flow) -- backs `lib/account-edit.ts`'s `updateProfile`/
 * `changePassword`, which operate on the already-authenticated
 * `session.userId` rather than a submitted email.
 */
export async function findUserById(
  id: number,
  sql: SqlTag = defaultSql(),
): Promise<AccountUserRow | null> {
  const rows = await sql<RawAccountUserRow>`
    select id, email, firstname, lastname, password_hash, password_algo, password_argon2
    from users
    where id = ${id}
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    firstname: r.firstname,
    lastname: r.lastname,
    // Coerce to a real Buffer -- see findUserByEmail's identical comment above.
    passwordHash: Buffer.from(r.password_hash),
    passwordAlgo: r.password_algo,
    passwordArgon2: r.password_argon2,
  };
}

/**
 * Dumb update: stores whatever it's given verbatim -- title-casing (`User.cs`'s
 * `Firstname`/`Lastname` setters, ported as `legacyTitleCase`) and the
 * `Length(50)` validation message are upstream policy in
 * `lib/account-edit.ts` (this file's header philosophy), not this layer's job.
 */
export async function updateUserNames(
  userId: number,
  firstname: string,
  lastname: string,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update users set
      firstname = ${firstname},
      lastname = ${lastname}
    where id = ${userId}
  `;
}

export async function findUserByPasswordAssistanceToken(
  tokenBytes: Buffer,
  sql: SqlTag = defaultSql(),
): Promise<PasswordAssistanceLookupRow | null> {
  const rows = await sql<{
    id: number;
    forgotten_password_assistance_token_issued: Date | null;
    forgotten_password_assistance_token_used: Date | null;
  }>`
    select id, forgotten_password_assistance_token_issued, forgotten_password_assistance_token_used
    from users
    where forgotten_password_assistance_token = ${tokenBytes}
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    forgottenPasswordAssistanceTokenIssued: r.forgotten_password_assistance_token_issued,
    forgottenPasswordAssistanceTokenUsed: r.forgotten_password_assistance_token_used,
  };
}
