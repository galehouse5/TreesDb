// D-024: password-free sign-in for Vercel PREVIEW deployments only, so test
// runs (people and Claude) don't need a real account's password every time a
// branch rebuilds. Two locks, both required:
//   1. VERCEL_ENV === "preview" (Vercel sets this itself; it is "production"
//      on the production deployment and undefined locally and in CI), and
//   2. PREVIEW_TEST_LOGIN === "1", an env var set for the Preview target only.
// It signs in as one fixed test account, never as a real user. That account
// has an unguessable random password, so it can't sign in through the normal
// email/password form anywhere, including production (preview and production
// share one database). Previews also stay behind Vercel's own deployment
// protection.
import { randomBytes } from "node:crypto";
import { hash as argon2Hash } from "@node-rs/argon2";
import { decodeRoles, USER_ROLE_BITS, type UserRoleName } from "@/db/queries/auth.sql";
import { defaultSql, type SqlTag } from "@/db/queries/sql-tag";

export const PREVIEW_TEST_EMAIL = "preview-test@treesdb.invalid";
const PREVIEW_TEST_ROLES = USER_ROLE_BITS.import | USER_ROLE_BITS.export;

type EnvLike = Record<string, string | undefined>;

export function isPreviewTestLoginEnabled(env: EnvLike = process.env): boolean {
  return env.VERCEL_ENV === "preview" && env.PREVIEW_TEST_LOGIN === "1";
}

export interface PreviewTestUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: UserRoleName[];
}

/** Finds the preview test account, creating it on first use. */
export async function ensurePreviewTestUser(
  sql: SqlTag = defaultSql(),
  now: Date = new Date(),
): Promise<PreviewTestUser> {
  const existing = await sql<{ id: number; firstname: string; lastname: string; roles: number }>`
    select id, firstname, lastname, roles from users where email = ${PREVIEW_TEST_EMAIL}
  `;
  let row = existing[0];
  if (!row) {
    const passwordArgon2 = await argon2Hash(randomBytes(32).toString("base64"));
    const inserted = await sql<{ id: number; firstname: string; lastname: string; roles: number }>`
      insert into users (
        email, firstname, lastname, roles,
        password_hash, password_algo, password_argon2,
        password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
        created, last_login, email_verification_token, email_verified,
        recently_failed_login_attempts, last_failed_login_attempt,
        forgotten_password_assistance_token, forgotten_password_assistance_token_issued, forgotten_password_assistance_token_used
      ) values (
        ${PREVIEW_TEST_EMAIL}, 'Preview', 'Tester', ${PREVIEW_TEST_ROLES},
        ${Buffer.alloc(32)}, 'argon2id', ${passwordArgon2},
        0, 0, 0, 0, 0,
        ${now}, ${now}, ${Buffer.alloc(32)}, ${now},
        0, null,
        null, null, null
      )
      on conflict do nothing
      returning id, firstname, lastname, roles
    `;
    row = inserted[0];
    if (!row) {
      // Lost a race with a concurrent first sign-in; read the winner's row.
      const again = await sql<{ id: number; firstname: string; lastname: string; roles: number }>`
        select id, firstname, lastname, roles from users where email = ${PREVIEW_TEST_EMAIL}
      `;
      row = again[0]!;
    }
  }
  return {
    id: row.id,
    email: PREVIEW_TEST_EMAIL,
    firstname: row.firstname,
    lastname: row.lastname,
    roles: decodeRoles(row.roles),
  };
}
