/**
 * Credentials-login flow - task P2-03 (doc 04 §P2-03, doc 01 §6).
 *
 * Pure, pglite-testable orchestration on top of the "dumb" data functions in
 * db/queries/auth.sql.ts and the legacy hash port in lib/crypto/password.ts.
 * This is the ONLY place that decides which branch to take, when to rehash,
 * and whether a login attempt is rate-limited -- kept out of both the SQL
 * layer (whose header explicitly disclaims that policy) and the Auth.js
 * provider (auth.ts), so it can be unit-tested without spinning up a server.
 *
 * --- Flow (doc 04 §P2-03 steps 1-5) ---------------------------------------
 * 1. Look up by normalized (trim+lower) email -- `findUserByEmail` already
 *    applies the same normalization legacy uses when storing (doc 01 §2).
 * 2. Reject unverified email (`email_verified is null`) -- legacy message
 *    semantics: `AccountController.Logon` (TMD/Controllers/AccountController.cs:70-75)
 *    uses the exact same "Invalid email or password." ModelState error for
 *    an unknown email AND an unverified one (and, per lines 76-83, a wrong
 *    password too) -- legacy deliberately does not distinguish any of these
 *    to callers. This function still discriminates the reason in its return
 *    value (needed for bookkeeping and for testing), but callers rendering
 *    the legacy-equivalent message to the *user* should treat 'unknown',
 *    'unverified', and 'bad-password' as the same displayed message (see
 *    app/account/login/page.tsx).
 * 3. D-013 rate limit check -- BEFORE the password check, so a blocked
 *    account never even reaches password verification (and never gets an
 *    extra bookkeeping increment for the blocked attempt). Legacy
 *    (`User.AttemptLogon`, TMD.Model/Users/User.cs:139-157) never enforced
 *    a hard lockout at all (doc 01 §13); this is a net-new security
 *    addition (D-013), not a parity break, so it intentionally sits ahead
 *    of the parity-preserving password-verification step.
 *    Semantics (D-013, doc 04 §P2-03 step 4): >= 10 recorded failures whose
 *    1-hour "memory window" (the same window `recordFailedLogin`/legacy's
 *    `FailedLoginMemoryDuration` uses to decide whether to reset the
 *    counter, doc 01 §6.2) is still alive, blocks logins for 15 minutes
 *    counted from `last_failed_login_attempt`. Both conditions are checked
 *    explicitly (even though the 15-minute test is strictly tighter than
 *    the 1-hour one) to keep the two independent design constraints
 *    ("is the failure count even still meaningful" vs. "has the block
 *    period elapsed") legible at the call site.
 * 4. Password algo dispatch:
 *    - 'legacy-sha256': verify via `verifyPassword` (P2-01, SHA-256 over
 *      UTF-16LE(password + trim(lower(email))), candidate trimmed).
 *      On success: compute an argon2id hash of the TRIMMED candidate
 *      (D-012 -- the trim tolerance must keep applying after the upgrade,
 *      so the stored hash is of the same string that was actually
 *      verified), flip the user to argon2id (`upgradePasswordHash`), then
 *      record the successful login. Both writes share a transaction where
 *      the underlying `sql` supports one (see `withTransaction`).
 *    - 'argon2id': verify with `@node-rs/argon2`'s `verify()` against the
 *      TRIMMED candidate (D-012 -- same tolerance extended to the new
 *      algorithm, not just preserved for legacy rows).
 *    Any failure -> `recordFailedLogin` + reason 'bad-password'.
 * 5. Roles: `findUserByEmail` already decodes the bitmask (doc 04 §P2-03
 *    step 5 / db/queries/auth.sql.ts `decodeRoles`) into
 *    `['import','export','admin']`-shaped names -- passed straight through.
 */
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { verifyPassword } from "./crypto/password";
import {
  findUserByEmail,
  recordFailedLogin,
  recordSuccessfulLogin,
  upgradePasswordHash,
  type UserRoleName,
} from "@/db/queries/auth.sql";
import { defaultSql, withTransaction, type SqlTag } from "@/db/queries/sql-tag";

/** D-013: >= this many recorded failures, within the block window below, blocks login. */
const RATE_LIMIT_FAILURE_THRESHOLD = 10;
/** Same 1-hour "is the failure count still meaningful" window as `recordFailedLogin` (doc 01 §6.2). */
const RATE_LIMIT_MEMORY_WINDOW_MS = 60 * 60 * 1000;
/** D-013: block duration counted from `last_failed_login_attempt`. */
const RATE_LIMIT_BLOCK_DURATION_MS = 15 * 60 * 1000;

export interface AttemptLoginUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: UserRoleName[];
}

export type AttemptLoginFailureReason = "unknown" | "unverified" | "bad-password" | "rate-limited";

export type AttemptLoginResult =
  | { ok: true; user: AttemptLoginUser }
  | { ok: false; reason: AttemptLoginFailureReason };

/**
 * Runs the full credentials-login flow described above. `now` is a
 * parameter (not `new Date()` internally) so tests can drive exact
 * rate-limit-boundary timing, matching the convention already established
 * by `recordFailedLogin`/`recordSuccessfulLogin` in db/queries/auth.sql.ts.
 */
export async function attemptLogin(
  email: string,
  candidatePassword: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<AttemptLoginResult> {
  const row = await findUserByEmail(email, sql);
  if (!row) {
    return { ok: false, reason: "unknown" };
  }

  if (row.emailVerified === null) {
    return { ok: false, reason: "unverified" };
  }

  if (row.lastFailedLoginAttempt !== null) {
    const msSinceLastFailure = now.getTime() - row.lastFailedLoginAttempt.getTime();
    const memoryWindowAlive = msSinceLastFailure < RATE_LIMIT_MEMORY_WINDOW_MS;
    const withinBlockPeriod = msSinceLastFailure < RATE_LIMIT_BLOCK_DURATION_MS;
    if (
      row.recentlyFailedLoginAttempts >= RATE_LIMIT_FAILURE_THRESHOLD &&
      memoryWindowAlive &&
      withinBlockPeriod
    ) {
      return { ok: false, reason: "rate-limited" };
    }
  }

  const trimmedCandidate = candidatePassword.trim();
  let passwordOk: boolean;

  if (row.passwordAlgo === "legacy-sha256") {
    // verifyPassword trims the candidate itself (P2-01); pass the raw
    // candidate so its own trim-asymmetry-preserving logic stays in charge.
    passwordOk = verifyPassword(candidatePassword, row.email, row.passwordHash);
  } else if (row.passwordAlgo === "argon2id" && row.passwordArgon2 !== null) {
    try {
      passwordOk = await argon2Verify(row.passwordArgon2, trimmedCandidate);
    } catch {
      // Malformed/corrupt stored hash -- treat as a failed verification
      // rather than a 500, same externally-observable effect as "wrong
      // password" and safe to record as a normal failed attempt.
      passwordOk = false;
    }
  } else {
    // Defensive: password_algo is a free-text column (db/schema.ts), so a
    // future/foreign value or a null password_argon2 on an 'argon2id' row
    // should fail closed rather than throw.
    passwordOk = false;
  }

  if (!passwordOk) {
    await recordFailedLogin(row.id, now, sql);
    return { ok: false, reason: "bad-password" };
  }

  if (row.passwordAlgo === "legacy-sha256") {
    const upgradedHash = await argon2Hash(trimmedCandidate);
    await withTransaction(sql, async (trx) => {
      await upgradePasswordHash(row.id, upgradedHash, trx);
      await recordSuccessfulLogin(row.id, now, trx);
    });
  } else {
    await recordSuccessfulLogin(row.id, now, sql);
  }

  return {
    ok: true,
    user: {
      id: row.id,
      email: row.email,
      firstname: row.firstname,
      lastname: row.lastname,
      roles: row.roles,
    },
  };
}
