/**
 * P2-04/P2-05 account-flows tests (pglite, doc 04 §P2-04/05 / doc 01 §6).
 */
import type { PGlite } from "@electric-sql/pglite";
import { verify as argon2Verify } from "@node-rs/argon2";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb, pgliteSqlTag } from "@/db/queries/test-helpers";
import type { SqlTag } from "@/db/queries/sql-tag";
import { encodeToken } from "@/lib/crypto/secure-token";
import {
  checkPasswordAssistanceToken,
  completePasswordAssistance,
  legacyTitleCase,
  passwordPolicyError,
  registerUser,
  requestPasswordAssistance,
  verifyEmail,
} from "./account-flows";

interface RawUserRow {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: number;
  password_hash: Buffer;
  password_algo: string;
  password_argon2: string | null;
  email_verified: Date | null;
  email_verification_token: Buffer;
}

async function rawUserByEmail(db: PGlite, email: string): Promise<RawUserRow> {
  const r = await db.query<RawUserRow>("select * from users where email = $1", [email]);
  return r.rows[0]!;
}

describe("account-flows", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("legacyTitleCase (StringExtensions.cs:24-25 / User.cs:25-39 port)", () => {
    it("capitalizes the first letter of each word, lowercases the rest", () => {
      expect(legacyTitleCase("jamie fox")).toBe("Jamie Fox");
      expect(legacyTitleCase("jAMIE FOx")).toBe("Jamie Fox");
    });

    it("trims surrounding whitespace", () => {
      expect(legacyTitleCase("  jamie  ")).toBe("Jamie");
    });

    it("leaves an all-caps word untouched (acronym exception)", () => {
      expect(legacyTitleCase("NASA fan")).toBe("NASA Fan");
    });

    it("empty/undefined-like input yields empty string", () => {
      expect(legacyTitleCase("")).toBe("");
    });
  });

  describe("passwordPolicyError (Password.cs:29-46 order: types before length)", () => {
    it("flags empty password with the Min(1) message", () => {
      expect(passwordPolicyError("")).toBe("You must enter a password.");
    });

    it("flags too few character types before checking length", () => {
      expect(passwordPolicyError("alllowercase")).toBe("Your password must contain two character types.");
    });

    it("flags too-short password once character types are satisfied", () => {
      expect(passwordPolicyError("Ab1")).toBe("Your password is too short.");
    });

    it("accepts a policy-satisfying password", () => {
      expect(passwordPolicyError("Password1")).toBeNull();
    });
  });

  describe("registerUser", () => {
    it("rejects a policy-violating password without touching the database", async () => {
      const result = await registerUser(
        "weak@example.com",
        "alllower",
        "Weak",
        "User",
        new Date("2024-06-01T00:00:00Z"),
        sql,
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid-password");
        expect(result.message).toBe("Your password must contain two character types.");
      }
    });

    it("registers a new user: argon2id hash, zero-sentinel legacy hash, title-cased names, verification token set", async () => {
      const now = new Date("2024-06-01T12:00:00Z");
      const result = await registerUser(
        "  Newbie@Example.COM  ",
        "Password1",
        "jamie",
        "FOX",
        now,
        sql,
      );
      expect(result.success).toBe(true);
      if (!result.success) throw new Error("expected success");

      expect(result.verificationToken).toHaveLength(32);

      const row = await rawUserByEmail(db, "newbie@example.com");
      expect(row.firstname).toBe("Jamie");
      expect(row.lastname).toBe("FOX"); // all-caps acronym exception preserved
      expect(row.password_algo).toBe("argon2id");
      expect(Buffer.from(row.password_hash).equals(Buffer.alloc(32))).toBe(true);
      expect(row.email_verified).toBeNull();
      expect(Buffer.from(row.email_verification_token).equals(result.verificationToken)).toBe(true);
      expect(row.roles).toBe(3);

      // D-012: stored argon2 hash verifies against the TRIMMED candidate,
      // matching the login agent's verify path.
      expect(await argon2Verify(row.password_argon2!, "Password1")).toBe(true);
      expect(await argon2Verify(row.password_argon2!, "  Password1  ".trim())).toBe(true);
    });

    it("rejects a duplicate normalized email with the legacy message", async () => {
      const now = new Date("2024-06-02T00:00:00Z");
      const first = await registerUser("dup@example.com", "Password1", "A", "B", now, sql);
      expect(first.success).toBe(true);

      const second = await registerUser("  DUP@Example.com  ", "Password2", "C", "D", now, sql);
      expect(second.success).toBe(false);
      if (!second.success) {
        expect(second.error).toBe("duplicate-email");
        expect(second.message).toBe("You must choose a different email.");
      }
    });
  });

  describe("verifyEmail", () => {
    it("round-trips: register then verify succeeds, and a repeat of the same token no longer matches", async () => {
      const now = new Date("2024-06-03T00:00:00Z");
      const reg = await registerUser("verifyme@example.com", "Password1", "A", "B", now, sql);
      expect(reg.success).toBe(true);
      if (!reg.success) throw new Error("expected success");

      const tokenString = encodeToken(reg.verificationToken);
      const first = await verifyEmail(tokenString, now, sql);
      expect(first.success).toBe(true);

      const row = await rawUserByEmail(db, "verifyme@example.com");
      expect(row.email_verified).not.toBeNull();

      // markEmailVerified (auth.sql.ts, pre-existing P2-03 design) clears
      // the token to ZERO_TOKEN as its NOT-NULL-column workaround -- unlike
      // legacy (User.cs VerifyEmail never touches EmailVerificationToken),
      // so a repeat of the ORIGINAL token now matches no row at all (a
      // plain not-found, not the `alreadyVerified` branch). `alreadyVerified`
      // only fires for the pathological zero-token-collision case, exercised
      // directly against auth.sql.ts in auth.test.ts.
      const second = await verifyEmail(tokenString, now, sql);
      expect(second.success).toBe(false);
      expect(second.alreadyVerified).toBeUndefined();
    });

    it("rejects a garbage token (decodes to the zero-fill sentinel) without a false match", async () => {
      const now = new Date("2024-06-04T00:00:00Z");
      const result = await verifyEmail("!!!not-a-valid-token!!!", now, sql);
      expect(result.success).toBe(false);
      expect(result.alreadyVerified).toBeUndefined();
    });

    it("rejects a well-formed but unissued token", async () => {
      const now = new Date("2024-06-05T00:00:00Z");
      const neverIssued = encodeToken(Buffer.alloc(32, 0xaa));
      const result = await verifyEmail(neverIssued, now, sql);
      expect(result.success).toBe(false);
    });
  });

  describe("requestPasswordAssistance (silent-success semantics, AccountController.cs:166-188)", () => {
    it("returns sent:null for an unknown email (caller still shows the same message)", async () => {
      const result = await requestPasswordAssistance("nobody-here@example.com", new Date(), sql);
      expect(result.sent).toBeNull();
    });

    it("issues a token for a known email", async () => {
      const now = new Date("2024-06-06T00:00:00Z");
      const reg = await registerUser("assist@example.com", "Password1", "A", "B", now, sql);
      expect(reg.success).toBe(true);

      const result = await requestPasswordAssistance("ASSIST@example.com", now, sql);
      expect(result.sent).not.toBeNull();
      expect(result.sent!.token).toHaveLength(32);
    });
  });

  describe("completePasswordAssistance (1-hour window, single-use, doc 01 §6.3)", () => {
    async function setUpAssistanceToken(email: string, issuedAt: Date) {
      const reg = await registerUser(email, "Password1", "A", "B", issuedAt, sql);
      if (!reg.success) throw new Error("expected registration to succeed");
      const req = await requestPasswordAssistance(email, issuedAt, sql);
      if (!req.sent) throw new Error("expected token to be issued");
      return encodeToken(req.sent.token);
    }

    it("accepts a completion 59 minutes after issue", async () => {
      const issuedAt = new Date("2024-06-07T12:00:00Z");
      const tokenString = await setUpAssistanceToken("boundary59@example.com", issuedAt);
      const completingAt = new Date(issuedAt.getTime() + 59 * 60_000);

      const result = await completePasswordAssistance(tokenString, "NewPassword1", completingAt, sql);
      expect(result.success).toBe(true);

      const row = await rawUserByEmail(db, "boundary59@example.com");
      expect(row.password_algo).toBe("argon2id");
      expect(await argon2Verify(row.password_argon2!, "NewPassword1")).toBe(true);
    });

    it("rejects a completion 61 minutes after issue", async () => {
      const issuedAt = new Date("2024-06-08T12:00:00Z");
      const tokenString = await setUpAssistanceToken("boundary61@example.com", issuedAt);
      const completingAt = new Date(issuedAt.getTime() + 61 * 60_000);

      const result = await completePasswordAssistance(tokenString, "NewPassword1", completingAt, sql);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("invalid-token");
    });

    it("rejects a second use of the same token (single-use)", async () => {
      const issuedAt = new Date("2024-06-09T12:00:00Z");
      const tokenString = await setUpAssistanceToken("singleuse@example.com", issuedAt);

      const firstUse = await completePasswordAssistance(tokenString, "NewPassword1", issuedAt, sql);
      expect(firstUse.success).toBe(true);

      const secondUse = await completePasswordAssistance(tokenString, "AnotherPassword2", issuedAt, sql);
      expect(secondUse.success).toBe(false);
      if (!secondUse.success) expect(secondUse.error).toBe("invalid-token");

      // Password from the first (successful) use must remain in effect.
      const row = await rawUserByEmail(db, "singleuse@example.com");
      expect(await argon2Verify(row.password_argon2!, "NewPassword1")).toBe(true);
    });

    it("rejects the zero-fill token produced by decoding garbage input", async () => {
      const result = await completePasswordAssistance("///not-valid-base64url///", "NewPassword1", new Date(), sql);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("invalid-token");
    });

    it("rejects a policy-violating new password on an otherwise-valid token", async () => {
      const issuedAt = new Date("2024-06-10T12:00:00Z");
      const tokenString = await setUpAssistanceToken("weaknew@example.com", issuedAt);

      const result = await completePasswordAssistance(tokenString, "alllower", issuedAt, sql);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("invalid-password");
        expect(result.message).toBe("Your password must contain two character types.");
      }
    });
  });

  describe("checkPasswordAssistanceToken (read-only validity check, GET page)", () => {
    it("reports valid for a freshly-issued token and does not consume it", async () => {
      const issuedAt = new Date("2024-06-11T12:00:00Z");
      const reg = await registerUser("checkonly@example.com", "Password1", "A", "B", issuedAt, sql);
      if (!reg.success) throw new Error("expected success");
      const req = await requestPasswordAssistance("checkonly@example.com", issuedAt, sql);
      if (!req.sent) throw new Error("expected token");
      const tokenString = encodeToken(req.sent.token);

      expect(await checkPasswordAssistanceToken(tokenString, issuedAt, sql)).toBe(true);
      // Still valid afterwards -- the check must not consume/mark it used.
      expect(await checkPasswordAssistanceToken(tokenString, issuedAt, sql)).toBe(true);
    });

    it("reports invalid for the zero-fill sentinel", async () => {
      expect(await checkPasswordAssistanceToken("(((garbage)))", new Date(), sql)).toBe(false);
    });
  });
});
