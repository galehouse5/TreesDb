/**
 * P2-03 attemptLogin tests (pglite, doc 04 §P2-03 / doc 01 §6).
 *
 * Local insert/read helpers duplicated from db/queries/auth.test.ts's
 * pattern rather than added to db/queries/test-helpers.ts, to respect this
 * task's file-ownership boundary (lib/auth-flow.ts + its test only).
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hash as argon2Hash } from "@node-rs/argon2";
import { hashPassword } from "./crypto/password";
import { attemptLogin } from "./auth-flow";
import type { SqlTag } from "@/db/queries/sql-tag";
import { createTestDb, pgliteSqlTag } from "@/db/queries/test-helpers";

interface InsertUserOverrides {
  email: string;
  firstname: string;
  lastname: string;
  roles: number;
  passwordHash: Buffer;
  passwordAlgo: string;
  passwordArgon2: string | null;
  emailVerified: Date | null;
  recentlyFailedLoginAttempts: number;
  lastFailedLoginAttempt: Date | null;
}

async function insertUser(db: PGlite, overrides: Partial<InsertUserOverrides> = {}): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into users (
       email, firstname, lastname, roles,
       password_hash, password_algo, password_argon2,
       password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
       created, last_login, email_verification_token, email_verified,
       recently_failed_login_attempts, last_failed_login_attempt
     ) values (
       $1, $2, $3, $4,
       $5, $6, $7,
       0, 0, 0, 0, 0,
       now(), now(), $8, $9,
       $10, $11
     ) returning id`,
    [
      overrides.email ?? "alice@example.com",
      overrides.firstname ?? "Alice",
      overrides.lastname ?? "Anderson",
      overrides.roles ?? 3,
      overrides.passwordHash ??
        hashPassword("Password1", overrides.email ?? "alice@example.com"),
      overrides.passwordAlgo ?? "legacy-sha256",
      overrides.passwordArgon2 ?? null,
      Buffer.alloc(32, 0xab),
      overrides.emailVerified === undefined ? new Date("2020-01-01T00:00:00Z") : overrides.emailVerified,
      overrides.recentlyFailedLoginAttempts ?? 0,
      overrides.lastFailedLoginAttempt ?? null,
    ],
  );
  return r.rows[0]!.id;
}

interface RawUserRow {
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
  recently_failed_login_attempts: number;
  last_failed_login_attempt: Date | null;
  last_login: Date;
}

async function rawUser(db: PGlite, id: number): Promise<RawUserRow> {
  const r = await db.query<RawUserRow>(`select * from users where id = $1`, [id]);
  return r.rows[0]!;
}

describe("attemptLogin", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("returns 'unknown' for an email with no match, no bookkeeping side effect", async () => {
    const result = await attemptLogin("nobody@example.com", "whatever", new Date(), sql);
    expect(result).toEqual({ ok: false, reason: "unknown" });
  });

  it("rejects an unverified user with 'unverified' before ever touching the password", async () => {
    const id = await insertUser(db, { email: "unverified@example.com", emailVerified: null });
    // Wrong password on purpose -- if the implementation checked password
    // before verification status, this would come back 'bad-password'.
    const result = await attemptLogin("unverified@example.com", "TotallyWrong1", new Date(), sql);
    expect(result).toEqual({ ok: false, reason: "unverified" });
    const row = await rawUser(db, id);
    expect(row.recently_failed_login_attempts).toBe(0);
  });

  describe("legacy-sha256 path", () => {
    it("succeeds on the doc 01 §6.1 vector, flips password_algo to argon2id, and a subsequent login no longer consults the (now stale) legacy hash", async () => {
      const email = "legacy-success@example.com";
      const id = await insertUser(db, {
        email,
        passwordHash: hashPassword("Password1", email),
        passwordAlgo: "legacy-sha256",
      });

      const now = new Date("2024-01-01T00:00:00Z");
      const result = await attemptLogin(email, "Password1", now, sql);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.id).toBe(id);
        expect(result.user.email).toBe(email);
        expect(result.user.roles).toEqual(["import", "export"]);
      }

      const afterFirstLogin = await rawUser(db, id);
      expect(afterFirstLogin.password_algo).toBe("argon2id");
      expect(afterFirstLogin.password_argon2).not.toBeNull();
      expect(afterFirstLogin.last_login.toISOString()).toBe(now.toISOString());

      // Tamper with the legacy hash column directly -- if the second login
      // (correctly) ignores it now that password_algo is 'argon2id', this
      // has no effect on the outcome.
      await db.query(`update users set password_hash = $1 where id = $2`, [
        Buffer.alloc(32, 0xff),
        id,
      ]);

      const secondNow = new Date("2024-01-02T00:00:00Z");
      const secondResult = await attemptLogin(email, "Password1", secondNow, sql);
      expect(secondResult).toEqual({
        ok: true,
        user: { id, email, firstname: "Alice", lastname: "Anderson", roles: ["import", "export"] },
      });
    });

    it("trims the candidate before verifying (D-012) and stores the argon2 hash of the TRIMMED password", async () => {
      const email = "legacy-trim@example.com";
      await insertUser(db, {
        email,
        passwordHash: hashPassword("Password1", email),
        passwordAlgo: "legacy-sha256",
      });

      const result = await attemptLogin(email, "  Password1  ", new Date(), sql);
      expect(result.ok).toBe(true);

      // Future logins must verify against the TRIMMED candidate under the
      // new argon2 hash too (D-012 extended past the upgrade).
      const rowAfter = await db.query<{ id: number; password_argon2: string }>(
        `select id, password_argon2 from users where email = $1`,
        [email],
      );
      const { id, password_argon2: storedArgon2 } = rowAfter.rows[0]!;
      const untrimmedMatches = await import("@node-rs/argon2").then((m) =>
        m.verify(storedArgon2, "  Password1  "),
      );
      const trimmedMatches = await import("@node-rs/argon2").then((m) =>
        m.verify(storedArgon2, "Password1"),
      );
      expect(trimmedMatches).toBe(true);
      // The stored hash is of the trimmed string, so verifying against it
      // with the untrimmed candidate directly (bypassing attemptLogin's own
      // trim) should fail -- confirming what's stored really is the trimmed
      // hash, not the raw one.
      expect(untrimmedMatches).toBe(false);
      expect(id).toBeGreaterThan(0);
    });

    it("records a failed attempt and returns 'bad-password' on a wrong password, without touching password_algo", async () => {
      const email = "legacy-badpw@example.com";
      const id = await insertUser(db, {
        email,
        passwordHash: hashPassword("Password1", email),
        passwordAlgo: "legacy-sha256",
      });

      const now = new Date("2024-01-01T12:00:00Z");
      const result = await attemptLogin(email, "WrongPassword1", now, sql);
      expect(result).toEqual({ ok: false, reason: "bad-password" });

      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(1);
      expect(row.last_failed_login_attempt!.toISOString()).toBe(now.toISOString());
      expect(row.password_algo).toBe("legacy-sha256");
    });
  });

  describe("argon2id path", () => {
    it("verifies the trimmed candidate against the stored argon2 hash (D-012) and records success", async () => {
      const email = "argon-success@example.com";
      const storedHash = await argon2Hash("Password1");
      const id = await insertUser(db, {
        email,
        passwordAlgo: "argon2id",
        passwordArgon2: storedHash,
      });

      const now = new Date("2024-05-01T00:00:00Z");
      const result = await attemptLogin(email, "  Password1  ", now, sql);
      expect(result).toEqual({
        ok: true,
        user: { id, email, firstname: "Alice", lastname: "Anderson", roles: ["import", "export"] },
      });

      const row = await rawUser(db, id);
      expect(row.last_login.toISOString()).toBe(now.toISOString());
      expect(row.password_algo).toBe("argon2id");
    });

    it("records a failed attempt on a wrong password", async () => {
      const email = "argon-badpw@example.com";
      const storedHash = await argon2Hash("Password1");
      const id = await insertUser(db, {
        email,
        passwordAlgo: "argon2id",
        passwordArgon2: storedHash,
      });

      const result = await attemptLogin(email, "WrongPassword1", new Date(), sql);
      expect(result).toEqual({ ok: false, reason: "bad-password" });
      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(1);
    });
  });

  describe("D-013 rate limiting", () => {
    it("blocks on the 10th recorded failure while the block window (15 min) is still open", async () => {
      const email = "rate-block@example.com";
      const now = new Date("2024-06-01T12:00:00Z");
      const lastFailure = new Date(now.getTime() - 14 * 60_000); // 14 min ago
      const id = await insertUser(db, {
        email,
        passwordAlgo: "legacy-sha256",
        passwordHash: hashPassword("Password1", email),
        recentlyFailedLoginAttempts: 10,
        lastFailedLoginAttempt: lastFailure,
      });

      // Correct password on purpose -- still must be blocked, proving the
      // rate-limit check runs before password verification.
      const result = await attemptLogin(email, "Password1", now, sql);
      expect(result).toEqual({ ok: false, reason: "rate-limited" });

      // Blocked attempts are not recorded as an additional failure.
      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(10);
      expect(row.last_failed_login_attempt!.toISOString()).toBe(lastFailure.toISOString());
      expect(id).toBeGreaterThan(0);
    });

    it("unblocks 15+ minutes after the last recorded failure even though the 1-hour memory window is still alive", async () => {
      const email = "rate-unblock@example.com";
      const now = new Date("2024-06-01T12:00:00Z");
      const lastFailure = new Date(now.getTime() - 16 * 60_000); // 16 min ago (< 1h, > 15min)
      await insertUser(db, {
        email,
        passwordAlgo: "legacy-sha256",
        passwordHash: hashPassword("Password1", email),
        recentlyFailedLoginAttempts: 10,
        lastFailedLoginAttempt: lastFailure,
      });

      const result = await attemptLogin(email, "Password1", now, sql);
      expect(result.ok).toBe(true);
    });

    it("does not block when the 1-hour memory window has gone stale, even with >= 10 recorded failures", async () => {
      const email = "rate-stale@example.com";
      const now = new Date("2024-06-01T12:00:00Z");
      const lastFailure = new Date(now.getTime() - 61 * 60_000); // 61 min ago (window stale)
      await insertUser(db, {
        email,
        passwordAlgo: "legacy-sha256",
        passwordHash: hashPassword("Password1", email),
        recentlyFailedLoginAttempts: 10,
        lastFailedLoginAttempt: lastFailure,
      });

      const result = await attemptLogin(email, "Password1", now, sql);
      expect(result.ok).toBe(true);
    });

    it("does not block below the 10-failure threshold even within the 15-minute window", async () => {
      const email = "rate-under-threshold@example.com";
      const now = new Date("2024-06-01T12:00:00Z");
      const lastFailure = new Date(now.getTime() - 5 * 60_000);
      await insertUser(db, {
        email,
        passwordAlgo: "legacy-sha256",
        passwordHash: hashPassword("Password1", email),
        recentlyFailedLoginAttempts: 9,
        lastFailedLoginAttempt: lastFailure,
      });

      const result = await attemptLogin(email, "Password1", now, sql);
      expect(result.ok).toBe(true);
    });
  });

  describe("role decoding", () => {
    it("decodes all three role bits through to the successful-login result", async () => {
      const email = "admin-user@example.com";
      await insertUser(db, {
        email,
        passwordAlgo: "legacy-sha256",
        passwordHash: hashPassword("Password1", email),
        roles: 7,
      });

      const result = await attemptLogin(email, "Password1", new Date(), sql);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.roles).toEqual(["import", "export", "admin"]);
      }
    });
  });
});
