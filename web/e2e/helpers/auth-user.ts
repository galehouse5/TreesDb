// Throwaway import-role user for the walkthrough's login step. Created via
// direct SQL (not the app's `registerUser` flow) specifically to skip email
// verification -- `attemptLogin` (lib/auth-flow.ts) rejects an unverified
// account, and this user only needs to exist long enough to drive the
// wizard, not to exercise the registration/verification flow itself (that's
// covered elsewhere, doc 04 §P2-04/05). Hashing still goes through the
// REAL argon2 path (`@node-rs/argon2`, same call `lib/account-flows.ts`'s
// `hashPasswordArgon2` makes) so the real credentials-provider `authorize()`
// verify path is genuinely exercised, not bypassed.
import { hash as argon2Hash } from "@node-rs/argon2";
import type { TestSql } from "./db";
import type { SqlTag } from "../../db/queries/sql-tag";
import { USER_ROLE_BITS } from "../../db/queries/auth.sql";

export const THROWAWAY_EMAIL = "e2e-walkthrough@treesdb.invalid";
export const THROWAWAY_PASSWORD = "Walkthrough-Password-1";

export interface ThrowawayUser {
  id: number;
  email: string;
  password: string;
}

const LEGACY_HASH_SENTINEL = Buffer.alloc(32);
const EMAIL_VERIFICATION_SENTINEL = Buffer.alloc(32);

/** Deletes any pre-existing user (and that user's import trips, via
 * `deleteThrowawayUserAndTrips`) at `THROWAWAY_EMAIL` first -- makes setup
 * idempotent across a prior run whose teardown didn't complete (e.g. a
 * killed process), so `npx playwright test` stays repeatable without manual
 * cleanup between runs. */
export async function ensureThrowawayUser(sql: TestSql): Promise<ThrowawayUser> {
  const existing = await sql<{ id: number }[]>`select id from users where email = ${THROWAWAY_EMAIL}`;
  if (existing[0]) {
    await deleteThrowawayUserAndTrips(sql, existing[0].id);
  }

  const passwordArgon2 = await argon2Hash(THROWAWAY_PASSWORD.trim());
  const now = new Date();
  const rows = await sql<{ id: number }[]>`
    insert into users (
      email, firstname, lastname, roles,
      password_hash, password_algo, password_argon2,
      password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
      created, last_login, email_verification_token, email_verified,
      recently_failed_login_attempts, last_failed_login_attempt,
      forgotten_password_assistance_token, forgotten_password_assistance_token_issued, forgotten_password_assistance_token_used
    ) values (
      ${THROWAWAY_EMAIL}, 'Walkthrough', 'User', ${USER_ROLE_BITS.import},
      ${LEGACY_HASH_SENTINEL}, 'argon2id', ${passwordArgon2},
      0, 0, 0, 0, 0,
      ${now}, ${now}, ${EMAIL_VERIFICATION_SENTINEL}, ${now},
      0, null,
      null, null, null
    )
    returning id
  `;
  const id = rows[0]!.id;
  return { id, email: THROWAWAY_EMAIL, password: THROWAWAY_PASSWORD };
}

/** Full cascade delete for the throwaway user: every import trip it created
 * (canonical + draft rows, via the same cascade `removeTrip` uses) then the
 * user row itself. Safe to call with zero trips (no-op loop). */
export async function deleteThrowawayUserAndTrips(sql: TestSql, userId: number): Promise<number[]> {
  const { removeTrip } = await import("../../db/queries/import-drafts.sql");
  const sqlTag = sql as unknown as SqlTag; // same cast convention as parity/replay/run.ts
  const tripRows = await sql<{ id: number }[]>`select id from import_trips where creator_user_id = ${userId} order by id asc`;
  const removedTripIds: number[] = [];
  for (const row of tripRows) {
    await removeTrip(row.id, userId, ["import"], sqlTag);
    removedTripIds.push(row.id);
  }
  await sql`delete from users where id = ${userId}`;
  return removedTripIds;
}
