/**
 * P2-03 auth.sql.ts tests (pglite, doc 04 §P2-03 / doc 01 §6).
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ZERO_TOKEN,
  changeEmailWithRehash,
  consumePasswordAssistanceToken,
  createUser,
  decodeRoles,
  findUserByEmail,
  findUserByEmailVerificationToken,
  findUserById,
  findUserByPasswordAssistanceToken,
  issuePasswordAssistanceToken,
  markEmailVerified,
  recordFailedLogin,
  recordSuccessfulLogin,
  setEmailVerificationToken,
  updateUserNames,
  upgradePasswordHash,
} from "./auth.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, pgliteSqlTag } from "./test-helpers";

// Local, test-only insert/read helpers -- kept in this file rather than
// added to the shared test-helpers.ts to respect this task's file-ownership
// boundary (only auth.sql.ts (+ test) is owned here), same pattern as
// details.test.ts.

async function insertUser(
  db: PGlite,
  overrides: Partial<{
    email: string;
    firstname: string;
    lastname: string;
    roles: number;
    passwordHash: Buffer;
    passwordAlgo: string;
    passwordArgon2: string | null;
    passwordNumerics: number;
    passwordUppercase: number;
    passwordLowercase: number;
    passwordSpecials: number;
    passwordLength: number;
    emailVerified: Date | null;
    recentlyFailedLoginAttempts: number;
    lastFailedLoginAttempt: Date | null;
  }> = {},
): Promise<number> {
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
       $8, $9, $10, $11, $12,
       now(), now(), $13, $14,
       $15, $16
     ) returning id`,
    [
      overrides.email ?? "alice@example.com",
      overrides.firstname ?? "Alice",
      overrides.lastname ?? "Anderson",
      overrides.roles ?? 3,
      overrides.passwordHash ??
        Buffer.from(
          "974bcde0bd9738e8fda880914e25a67e855d107a29774ad7aecd92638b3e3e5",
          "hex",
        ),
      overrides.passwordAlgo ?? "legacy-sha256",
      overrides.passwordArgon2 ?? null,
      overrides.passwordNumerics ?? 1,
      overrides.passwordUppercase ?? 1,
      overrides.passwordLowercase ?? 7,
      overrides.passwordSpecials ?? 0,
      overrides.passwordLength ?? 9,
      Buffer.alloc(32, 0xab),
      overrides.emailVerified === undefined ? new Date("2020-01-01T00:00:00Z") : overrides.emailVerified,
      overrides.recentlyFailedLoginAttempts ?? 0,
      overrides.lastFailedLoginAttempt ?? null,
    ],
  );
  return r.rows[0]!.id;
}

interface RawUserRow {
  email: string;
  firstname: string;
  lastname: string;
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
  password_numerics: number;
  password_uppercase: number;
  password_lowercase: number;
  password_specials: number;
  password_length: number;
  last_login: Date;
  email_verified: Date | null;
  email_verification_token: Buffer;
  recently_failed_login_attempts: number;
  last_failed_login_attempt: Date | null;
  forgotten_password_assistance_token: Buffer | null;
  forgotten_password_assistance_token_issued: Date | null;
  forgotten_password_assistance_token_used: Date | null;
}

async function rawUser(db: PGlite, id: number): Promise<RawUserRow> {
  const r = await db.query<RawUserRow>(`select * from users where id = $1`, [id]);
  return r.rows[0]!;
}

describe("auth.sql", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("decodeRoles", () => {
    it("decodes the persisted bitmask values (TMD.Model/Users/UserRoles.cs:12-16: Import=1, Export=2, Admin=4)", () => {
      expect(decodeRoles(0)).toEqual([]);
      expect(decodeRoles(1)).toEqual(["import"]);
      expect(decodeRoles(2)).toEqual(["export"]);
      expect(decodeRoles(4)).toEqual(["admin"]);
      expect(decodeRoles(3)).toEqual(["import", "export"]);
      expect(decodeRoles(7)).toEqual(["import", "export", "admin"]);
    });

    it("never decodes the Registered=8 bit (declared in the enum but never persisted, doc 01 §1)", () => {
      expect(decodeRoles(8)).toEqual([]);
      expect(decodeRoles(15)).toEqual(["import", "export", "admin"]);
    });
  });

  describe("findUserByEmail", () => {
    it("finds a fixture row via normalized (trim+lower) email match on mixed-case, padded input", async () => {
      const id = await insertUser(db, { email: "carol@example.com", firstname: "Carol", lastname: "Carter" });
      const row = await findUserByEmail("  Carol@Example.COM  ", sql);
      expect(row).not.toBeNull();
      expect(row!.id).toBe(id);
      expect(row!.email).toBe("carol@example.com");
      expect(row!.firstname).toBe("Carol");
      expect(row!.roles).toEqual(["import", "export"]);
      expect(Buffer.isBuffer(row!.passwordHash)).toBe(true);
      expect(row!.passwordAlgo).toBe("legacy-sha256");
    });

    it("returns null for an email with no match", async () => {
      expect(await findUserByEmail("nobody@example.com", sql)).toBeNull();
    });
  });

  describe("recordFailedLogin (doc 01 §6.2, 1-hour reset boundary)", () => {
    it("increments when the previous failure is within the last hour (59 min ago)", async () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const previous = new Date(now.getTime() - 59 * 60_000);
      const id = await insertUser(db, {
        email: "boundary-59@example.com",
        recentlyFailedLoginAttempts: 2,
        lastFailedLoginAttempt: previous,
      });

      await recordFailedLogin(id, now, sql);

      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(3);
      expect(row.last_failed_login_attempt!.toISOString()).toBe(now.toISOString());
    });

    it("resets to 1 when the previous failure is older than an hour (61 min ago)", async () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const previous = new Date(now.getTime() - 61 * 60_000);
      const id = await insertUser(db, {
        email: "boundary-61@example.com",
        recentlyFailedLoginAttempts: 5,
        lastFailedLoginAttempt: previous,
      });

      await recordFailedLogin(id, now, sql);

      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(1);
    });

    it("resets to 1 when there is no previous failure (null)", async () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const id = await insertUser(db, {
        email: "never-failed@example.com",
        recentlyFailedLoginAttempts: 0,
        lastFailedLoginAttempt: null,
      });

      await recordFailedLogin(id, now, sql);

      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(1);
    });
  });

  describe("recordSuccessfulLogin", () => {
    it("stamps last_login and resets the failed-attempt counter", async () => {
      const now = new Date("2024-02-01T00:00:00Z");
      const id = await insertUser(db, {
        email: "success@example.com",
        recentlyFailedLoginAttempts: 4,
        lastFailedLoginAttempt: new Date("2024-01-01T00:00:00Z"),
      });

      await recordSuccessfulLogin(id, now, sql);

      const row = await rawUser(db, id);
      expect(row.recently_failed_login_attempts).toBe(0);
      expect(row.last_login.toISOString()).toBe(now.toISOString());
    });
  });

  describe("upgradePasswordHash", () => {
    it("flips algo to argon2id, stores the argon2 hash, zeroes the metric columns, and preserves password_hash", async () => {
      const legacyHash = Buffer.from(
        "15b5b75e8cf8a1637ee6d297bbcf5dfd15a5630c7bce077dc13f8424df90c77",
        "hex",
      );
      const id = await insertUser(db, {
        email: "upgrade@example.com",
        passwordHash: legacyHash,
        passwordAlgo: "legacy-sha256",
        passwordNumerics: 3,
        passwordUppercase: 1,
        passwordLowercase: 6,
        passwordSpecials: 1,
        passwordLength: 11,
      });

      await upgradePasswordHash(id, "$argon2id$v=19$fake-hash", sql);

      const row = await rawUser(db, id);
      expect(row.password_algo).toBe("argon2id");
      expect(row.password_argon2).toBe("$argon2id$v=19$fake-hash");
      expect(Buffer.from(row.password_hash).equals(legacyHash)).toBe(true);
      expect(row.password_numerics).toBe(0);
      expect(row.password_uppercase).toBe(0);
      expect(row.password_lowercase).toBe(0);
      expect(row.password_specials).toBe(0);
      expect(row.password_length).toBe(0);
    });
  });

  describe("changeEmailWithRehash", () => {
    it("changes the email and, when a legacy hash is provided, rehashes in the same statement", async () => {
      const id = await insertUser(db, { email: "old@example.com", passwordAlgo: "legacy-sha256" });
      const newHash = Buffer.alloc(32, 0x11);

      await changeEmailWithRehash(id, "new@example.com", newHash, null, sql);

      const row = await rawUser(db, id);
      expect(row.email).toBe("new@example.com");
      expect(Buffer.from(row.password_hash).equals(newHash)).toBe(true);
    });

    it("leaves hash columns untouched when both hash args are null (argon2 user's free email change)", async () => {
      const id = await insertUser(db, {
        email: "argon-user@example.com",
        passwordAlgo: "argon2id",
        passwordArgon2: "$argon2id$existing",
      });

      await changeEmailWithRehash(id, "argon-user-new@example.com", null, null, sql);

      const row = await rawUser(db, id);
      expect(row.email).toBe("argon-user-new@example.com");
      expect(row.password_argon2).toBe("$argon2id$existing");
    });
  });

  describe("password-assistance token issue/consume round-trip", () => {
    it("issues then consumes a token", async () => {
      const id = await insertUser(db, { email: "reset@example.com" });
      const tokenBytes = Buffer.alloc(32, 0x42);
      const issued = new Date("2024-03-01T00:00:00Z");

      await issuePasswordAssistanceToken(id, tokenBytes, issued, sql);
      let row = await rawUser(db, id);
      expect(Buffer.from(row.forgotten_password_assistance_token!).equals(tokenBytes)).toBe(true);
      expect(row.forgotten_password_assistance_token_issued!.toISOString()).toBe(issued.toISOString());
      expect(row.forgotten_password_assistance_token_used).toBeNull();

      const used = new Date("2024-03-01T00:30:00Z");
      await consumePasswordAssistanceToken(id, used, sql);
      row = await rawUser(db, id);
      expect(row.forgotten_password_assistance_token_used!.toISOString()).toBe(used.toISOString());
    });
  });

  describe("email verification", () => {
    it("sets the verification token, then marks verified and clears it to the zero-token sentinel", async () => {
      const id = await insertUser(db, { email: "verify@example.com", emailVerified: null });
      const tokenBytes = Buffer.alloc(32, 0x77);

      await setEmailVerificationToken(id, tokenBytes, sql);
      let row = await rawUser(db, id);
      expect(Buffer.from(row.email_verification_token).equals(tokenBytes)).toBe(true);
      expect(row.email_verified).toBeNull();

      const when = new Date("2024-04-01T00:00:00Z");
      await markEmailVerified(id, when, sql);
      row = await rawUser(db, id);
      expect(row.email_verified!.toISOString()).toBe(when.toISOString());
      expect(Buffer.from(row.email_verification_token).equals(ZERO_TOKEN)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------
  // P2-04 additions (doc 04 §P2-04): createUser + token lookups.
  // ---------------------------------------------------------------------

  describe("createUser", () => {
    it("inserts a new user with the argon2-only shape (roles=3, zero-sentinel legacy hash, algo argon2id, verification token set)", async () => {
      const now = new Date("2024-05-01T00:00:00Z");
      const token = Buffer.alloc(32, 0x99);

      const id = await createUser(
        {
          email: "newuser@example.com",
          firstname: "Jamie",
          lastname: "Fox",
          passwordArgon2: "$argon2id$v=19$m=4096,t=3,p=1$fake",
          emailVerificationToken: token,
          now,
        },
        sql,
      );

      const row = await rawUser(db, id);
      expect(row.email).toBe("newuser@example.com");
      expect(row.password_algo).toBe("argon2id");
      expect(row.password_argon2).toBe("$argon2id$v=19$m=4096,t=3,p=1$fake");
      expect(Buffer.from(row.password_hash).equals(Buffer.alloc(32))).toBe(true);
      expect(Buffer.from(row.email_verification_token).equals(token)).toBe(true);
      expect(row.email_verified).toBeNull();
      expect(row.forgotten_password_assistance_token).toBeNull();
      expect(row.recently_failed_login_attempts).toBe(0);

      const rawRoles = await db.query<{ roles: number }>("select roles from users where id = $1", [id]);
      expect(rawRoles.rows[0]!.roles).toBe(3); // Import|Export, UserRoles.cs:12-16
    });
  });

  describe("findUserByEmailVerificationToken", () => {
    it("finds a match by exact token bytes", async () => {
      const token = Buffer.alloc(32, 0x11);
      const id = await insertUser(db, { email: "findtoken@example.com", emailVerified: null });
      await setEmailVerificationToken(id, token, sql);

      const row = await findUserByEmailVerificationToken(token, sql);
      expect(row).not.toBeNull();
      expect(row!.id).toBe(id);
      expect(row!.emailVerified).toBeNull();
    });

    it("returns null for a token that matches no row", async () => {
      const row = await findUserByEmailVerificationToken(Buffer.alloc(32, 0xfe), sql);
      expect(row).toBeNull();
    });

    it("reports emailVerified when the matching row has already been verified (zero-token collision guard, doc 04 P2-02)", async () => {
      const id = await insertUser(db, { email: "verified-already@example.com", emailVerified: null });
      const when = new Date("2024-05-02T00:00:00Z");
      await markEmailVerified(id, when, sql); // clears token to ZERO_TOKEN

      // NOTE: other tests in this shared-db file may also have called
      // markEmailVerified, so more than one row can hold ZERO_TOKEN by this
      // point -- this query has no ORDER BY, so which row comes back first
      // is unspecified. The point of this test is only that a lookup BY
      // ZERO_TOKEN matches SOME already-verified row (never a row with a
      // real, still-live token), which is exactly the collision the caller
      // (lib/account-flows.ts verifyEmail) must guard against.
      const row = await findUserByEmailVerificationToken(ZERO_TOKEN, sql);
      expect(row).not.toBeNull();
      expect(row!.emailVerified).not.toBeNull(); // caller (account-flows.ts) must treat this as "no match"
    });
  });

  describe("findUserByPasswordAssistanceToken", () => {
    it("finds a match by exact token bytes with issued/used timestamps", async () => {
      const token = Buffer.alloc(32, 0x22);
      const id = await insertUser(db, { email: "findassist@example.com" });
      const issued = new Date("2024-05-03T00:00:00Z");
      await issuePasswordAssistanceToken(id, token, issued, sql);

      const row = await findUserByPasswordAssistanceToken(token, sql);
      expect(row).not.toBeNull();
      expect(row!.id).toBe(id);
      expect(row!.forgottenPasswordAssistanceTokenIssued!.toISOString()).toBe(issued.toISOString());
      expect(row!.forgottenPasswordAssistanceTokenUsed).toBeNull();
    });

    it("returns null when no row has a matching (non-null) token", async () => {
      await insertUser(db, { email: "noassist@example.com" });
      const row = await findUserByPasswordAssistanceToken(Buffer.alloc(32, 0x33), sql);
      expect(row).toBeNull();
    });
  });

  // ---------------------------------------------------------------------
  // P2-06 additions (doc 04 §P2-06): findUserById + updateUserNames.
  // ---------------------------------------------------------------------

  describe("findUserById", () => {
    it("finds a fixture row by id", async () => {
      const id = await insertUser(db, {
        email: "byid@example.com",
        firstname: "Dana",
        lastname: "Diaz",
        passwordAlgo: "argon2id",
        passwordArgon2: "$argon2id$fake",
      });

      const row = await findUserById(id, sql);
      expect(row).not.toBeNull();
      expect(row!.id).toBe(id);
      expect(row!.email).toBe("byid@example.com");
      expect(row!.firstname).toBe("Dana");
      expect(row!.lastname).toBe("Diaz");
      expect(row!.passwordAlgo).toBe("argon2id");
      expect(row!.passwordArgon2).toBe("$argon2id$fake");
      expect(Buffer.isBuffer(row!.passwordHash)).toBe(true);
    });

    it("returns null for an id with no match", async () => {
      expect(await findUserById(999_999, sql)).toBeNull();
    });
  });

  describe("updateUserNames", () => {
    it("updates firstname/lastname, leaving other columns untouched", async () => {
      const id = await insertUser(db, {
        email: "rename@example.com",
        firstname: "Old",
        lastname: "Name",
      });

      await updateUserNames(id, "New", "Namewell", sql);

      const row = await rawUser(db, id);
      expect(row.firstname).toBe("New");
      expect(row.lastname).toBe("Namewell");
      expect(row.email).toBe("rename@example.com");
    });
  });
});
