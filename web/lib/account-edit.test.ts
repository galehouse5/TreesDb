/**
 * P2-06 account-edit tests (pglite, doc 04 §P2-06).
 */
import type { PGlite } from "@electric-sql/pglite";
import { verify as argon2Verify } from "@node-rs/argon2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb, pgliteSqlTag } from "@/db/queries/test-helpers";
import type { SqlTag } from "@/db/queries/sql-tag";
import { hashPassword } from "@/lib/crypto/password";
import { changePassword, updateProfile } from "./account-edit";

interface RawUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
}

async function insertUser(
  db: PGlite,
  overrides: Partial<{
    email: string;
    firstname: string;
    lastname: string;
    passwordHash: Buffer;
    passwordAlgo: string;
    passwordArgon2: string | null;
  }> = {},
): Promise<number> {
  const email = overrides.email ?? "alice@example.com";
  const passwordAlgo = overrides.passwordAlgo ?? "legacy-sha256";
  const passwordHash =
    overrides.passwordHash ??
    (passwordAlgo === "legacy-sha256" ? hashPassword("Password1", email) : Buffer.alloc(32));
  const r = await db.query<{ id: number }>(
    `insert into users (
       email, firstname, lastname, roles,
       password_hash, password_algo, password_argon2,
       password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
       created, last_login, email_verification_token, email_verified,
       recently_failed_login_attempts, last_failed_login_attempt
     ) values (
       $1, $2, $3, 3,
       $4, $5, $6,
       1, 1, 7, 0, 9,
       now(), now(), $7, now(),
       0, null
     ) returning id`,
    [
      email,
      overrides.firstname ?? "Alice",
      overrides.lastname ?? "Anderson",
      passwordHash,
      passwordAlgo,
      overrides.passwordArgon2 ?? null,
      Buffer.alloc(32, 0xab),
    ],
  );
  return r.rows[0]!.id;
}

async function rawUser(db: PGlite, id: number): Promise<RawUserRow> {
  const r = await db.query<RawUserRow>(`select * from users where id = $1`, [id]);
  return r.rows[0]!;
}

describe("account-edit", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("updateProfile", () => {
    it("title-cases first/last name on update", async () => {
      const id = await insertUser(db, { email: "titlecase@example.com" });

      const result = await updateProfile(id, "jamie", "fox", sql);

      expect(result).toEqual({ success: true, firstname: "Jamie", lastname: "Fox" });
      const row = await rawUser(db, id);
      expect(row.firstname).toBe("Jamie");
      expect(row.lastname).toBe("Fox");
    });

    it("rejects a first name over 50 characters (User.cs:26 Length(50))", async () => {
      const id = await insertUser(db, { email: "longfirst@example.com" });

      const result = await updateProfile(id, "a".repeat(51), "Fox", sql);

      expect(result).toEqual({
        success: false,
        error: "invalid-firstname",
        message: "First name must not exceed 50 characters.",
      });
    });

    it("rejects a last name over 50 characters (User.cs:34 Length(50))", async () => {
      const id = await insertUser(db, { email: "longlast@example.com" });

      const result = await updateProfile(id, "Jamie", "b".repeat(51), sql);

      expect(result).toEqual({
        success: false,
        error: "invalid-lastname",
        message: "Last name must not exceed 50 characters.",
      });
    });

    it("returns not-found for an unknown user id", async () => {
      const result = await updateProfile(999_999, "Jamie", "Fox", sql);
      expect(result).toEqual({
        success: false,
        error: "not-found",
        message: "Account not found.",
      });
    });
  });

  describe("changePassword", () => {
    it("legacy-sha256 user: verifies current password via the legacy path, then upgrades the row to argon2id", async () => {
      const id = await insertUser(db, {
        email: "legacy@example.com",
        passwordAlgo: "legacy-sha256",
      });

      const result = await changePassword(id, "Password1", "NewPassw0rd!", sql);

      expect(result).toEqual({ success: true });
      const row = await rawUser(db, id);
      expect(row.password_algo).toBe("argon2id");
      expect(row.password_argon2).not.toBeNull();
      expect(await argon2Verify(row.password_argon2!, "NewPassw0rd!")).toBe(true);
    });

    it("argon2id user: verifies current password via argon2 (trimmed candidate, D-012)", async () => {
      const { hash: argon2Hash } = await import("@node-rs/argon2");
      const existingHash = await argon2Hash("CurrentPass1");
      const id = await insertUser(db, {
        email: "argon@example.com",
        passwordAlgo: "argon2id",
        passwordArgon2: existingHash,
      });

      const result = await changePassword(id, "  CurrentPass1  ", "AnotherPass2!", sql);

      expect(result).toEqual({ success: true });
      const row = await rawUser(db, id);
      expect(row.password_algo).toBe("argon2id");
      expect(await argon2Verify(row.password_argon2!, "AnotherPass2!")).toBe(true);
    });

    it("rejects a wrong current password with the legacy message (AccountController.cs:244)", async () => {
      const id = await insertUser(db, {
        email: "wrongpass@example.com",
        passwordAlgo: "legacy-sha256",
      });

      const result = await changePassword(id, "WrongPassword1", "NewPassw0rd!", sql);

      expect(result).toEqual({
        success: false,
        error: "invalid-current-password",
        message: "Invalid password.",
      });
      const row = await rawUser(db, id);
      expect(row.password_algo).toBe("legacy-sha256"); // unchanged -- no upgrade on failure
    });

    it("rejects a new password that fails the policy check", async () => {
      const id = await insertUser(db, {
        email: "policyfail@example.com",
        passwordAlgo: "legacy-sha256",
      });

      const result = await changePassword(id, "Password1", "alllowercase", sql);

      expect(result).toEqual({
        success: false,
        error: "invalid-new-password",
        message: "Your password must contain two character types.",
      });
    });

    it("returns not-found for an unknown user id", async () => {
      const result = await changePassword(999_999, "whatever", "NewPassw0rd!", sql);
      expect(result).toEqual({
        success: false,
        error: "not-found",
        message: "Account not found.",
      });
    });
  });
});
