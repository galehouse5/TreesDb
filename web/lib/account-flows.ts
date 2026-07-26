/**
 * Registration + email verification + password assistance (reset) flows --
 * task P2-04/P2-05 (doc 04 §P2-04/05, doc 01 §6). Pure, testable functions;
 * every DB interaction goes through db/queries/auth.sql.ts's "dumb data"
 * functions (existing P2-03 ones, plus createUser/findUserBy*Token appended
 * for this task). This module owns all the *policy*: duplicate-email
 * rejection, password-policy messages, title-casing, argon2 hashing, and
 * token-validity windows.
 *
 * ANONYMOUS-ONLY: this file has no session/login dependency and does not
 * import web/auth.ts (owned by a parallel P2-03/07 task).
 */
import { hash as argon2Hash } from "@node-rs/argon2";
import {
  createUser,
  findUserByEmail,
  findUserByEmailVerificationToken,
  findUserByPasswordAssistanceToken,
  consumePasswordAssistanceToken,
  issuePasswordAssistanceToken,
  markEmailVerified,
  upgradePasswordHash,
  ZERO_TOKEN,
} from "@/db/queries/auth.sql";
import type { SqlTag } from "@/db/queries/sql-tag";
import { defaultSql } from "@/db/queries/sql-tag";
import {
  analyzePasswordComposition,
  PASSWORD_MIN_CHARACTER_TYPES,
  PASSWORD_MIN_LENGTH,
} from "@/lib/crypto/password";
import { decodeToken, generateToken, tokensEqual } from "@/lib/crypto/secure-token";

// ---------------------------------------------------------------------------
// Title-casing (doc 04 §P2-06 "stored title-cased like legacy")
// ---------------------------------------------------------------------------

/**
 * Ports `StringExtensions.OrEmptyAndTrimToTitleCase`
 * (`TMD.Model/Extensions/StringExtensions.cs:8,11,24-25`: `OrEmpty` ->
 * `Trim` -> `CultureInfo.CurrentCulture.TextInfo.ToTitleCase`), which is
 * exactly what `User.Firstname`/`User.Lastname`'s setters apply on every
 * write (`TMD.Model/Users/User.cs:25-39`) and what `Name.Create` applies to
 * measurer first/last names (`TMD.Model/ValueObjects/Name.cs:54-61`).
 *
 * `TextInfo.ToTitleCase` is a .NET BCL builtin with no source in this repo
 * to port line-by-line. This is a best-effort, documented reimplementation
 * of its two publicly-documented rules: capitalize the first letter of each
 * whitespace-delimited word and lowercase the rest, EXCEPT a word that is
 * entirely uppercase is presumed to already be an acronym/intentional and is
 * left untouched (e.g. "MC DONALD" stays "MC DONALD", not "Mc Donald").
 * Exotic .NET culture-specific word-break edge cases (certain Unicode
 * punctuation starting a new "word" independent of whitespace) are not
 * reproduced here -- out of scope for the personal names this is applied to.
 */
export function legacyTitleCase(source: string): string {
  const trimmed = (source ?? "").trim();
  return trimmed.replace(/\S+/g, (word) => {
    const hasLower = /[a-z]/.test(word);
    const hasUpper = /[A-Z]/.test(word);
    if (hasUpper && !hasLower) return word; // all-caps "acronym" exception
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

// ---------------------------------------------------------------------------
// Password policy messages (doc 01 §6.1, D-014) -- ports
// `Password.RequiredValidate` (`TMD.Model/Users/Password.cs:29-46`) and the
// `Min(1)` empty-password validator (`Password.cs:23`) it's paired with.
// ---------------------------------------------------------------------------

/** `Password.cs:36-39`'s ternary, generalized (this app's constant is always 2, i.e. "two"). */
function characterTypesWord(n: number): string {
  if (n === 4) return "four";
  if (n === 3) return "three";
  if (n === 2) return "two";
  return "one";
}

/**
 * Checked in this order -- character-type coverage first, then minimum
 * length -- exactly `RequiredValidate`'s order (`Password.cs:29-46`).
 * `RequiredValidate` itself returns immediately (no error) when
 * `Length == 0`; legacy relies on the separate `Min(1)` validator
 * (`Password.cs:23`, "You must enter a password.") to catch the empty case,
 * reproduced here as the same first check.
 */
export function passwordPolicyError(password: string): string | null {
  if (password.length === 0) return "You must enter a password.";
  const composition = analyzePasswordComposition(password);
  if (composition.characterTypes < PASSWORD_MIN_CHARACTER_TYPES) {
    return `Your password must contain ${characterTypesWord(PASSWORD_MIN_CHARACTER_TYPES)} character types.`;
  }
  if (composition.length < PASSWORD_MIN_LENGTH) {
    return "Your password is too short.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// argon2id hashing (D-012)
// ---------------------------------------------------------------------------

/**
 * D-012 / doc 04 §P2-03 step 3: the credentials-login agent's argon2 verify
 * path trims the candidate password before comparing (preserving legacy's
 * verify-side trim tolerance, `Password.cs:57`, ported in
 * `lib/crypto/password.ts`'s `verifyPassword`). For a stored argon2 hash to
 * ever verify successfully against that trimmed candidate, the hash must be
 * computed from the SAME trimmed string at creation time -- unlike the
 * legacy SHA-256 scheme, where `Create` deliberately does NOT trim
 * (`Password.cs:69-86`, the documented create/verify asymmetry). Argon2 has
 * no such legacy asymmetry to preserve since it's a brand-new hash format,
 * so both registration and password-assistance hash `password.trim()`,
 * matching what login's verify path will trim to.
 */
async function hashPasswordArgon2(password: string): Promise<string> {
  return argon2Hash(password.trim());
}

// ---------------------------------------------------------------------------
// Registration (doc 04 §P2-04; ports `AccountController.Register` POST,
// `TMD/Controllers/AccountController.cs:109-143`)
// ---------------------------------------------------------------------------

export type RegisterUserError = "invalid-password" | "duplicate-email";

export type RegisterUserResult =
  | { success: true; userId: number; verificationToken: Buffer }
  | { success: false; error: RegisterUserError; message: string };

/**
 * `firstname`/`lastname` are title-cased here (see `legacyTitleCase`) before
 * being persisted via `createUser`.
 *
 * Duplicate-email handling is a deliberate simplification of legacy: legacy
 * only rejects when the EXISTING account's email is already verified,
 * otherwise silently reusing/overwriting the unverified duplicate's password
 * (`User.ChangePasswordIfNonEmailVerified`, `AccountController.cs:122-132`).
 * This task's `createUser` is insert-only (no update path in this task's
 * file ownership), so ANY existing user with the normalized email is
 * rejected here -- using the exact legacy rejection message either way
 * (`AccountController.cs:127`, `"You must choose a different email."`).
 */
export async function registerUser(
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<RegisterUserResult> {
  const passwordError = passwordPolicyError(password);
  if (passwordError) {
    return { success: false, error: "invalid-password", message: passwordError };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail, sql);
  if (existing) {
    return {
      success: false,
      error: "duplicate-email",
      message: "You must choose a different email.",
    };
  }

  const verificationToken = generateToken();
  const passwordArgon2 = await hashPasswordArgon2(password);

  const userId = await createUser(
    {
      email: normalizedEmail,
      firstname: legacyTitleCase(firstname),
      lastname: legacyTitleCase(lastname),
      passwordArgon2,
      emailVerificationToken: verificationToken,
      now,
    },
    sql,
  );

  return { success: true, userId, verificationToken };
}

// ---------------------------------------------------------------------------
// Email verification (doc 01 §6.3; ports
// `AccountController.CompleteRegistration`,
// `TMD/Controllers/AccountController.cs:145-159`)
// ---------------------------------------------------------------------------

export interface VerifyEmailResult {
  success: boolean;
  /** True when the token matched a real user, but that user was already verified (legacy treats this the same as "no match"). */
  alreadyVerified?: boolean;
}

export async function verifyEmail(
  tokenString: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<VerifyEmailResult> {
  const tokenBytes = decodeToken(tokenString);
  if (tokensEqual(tokenBytes, ZERO_TOKEN)) {
    // Malformed/garbage input decodes (secure-token.ts) to the same 32
    // zero bytes `markEmailVerified` stores as its "cleared" sentinel --
    // short-circuit before touching the DB so a garbage token can never
    // coincide with an already-verified user's cleared column (doc 04
    // P2-02: "zero-token never matches a real token").
    return { success: false };
  }

  const user = await findUserByEmailVerificationToken(tokenBytes, sql);
  if (!user) return { success: false };
  if (user.emailVerified) {
    // `user != null && !user.IsEmailVerified` (AccountController.cs:150) --
    // an already-verified match is treated the same as no match.
    return { success: false, alreadyVerified: true };
  }

  await markEmailVerified(user.id, now, sql);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Password assistance request (doc 04 §P2-05; ports
// `AccountController.PasswordAssistance` POST,
// `TMD/Controllers/AccountController.cs:166-188`)
// ---------------------------------------------------------------------------

export interface RequestPasswordAssistanceResult {
  /** Non-null only when an account with this email actually exists -- caller should still ALWAYS show the same "check your email" message either way (silent-success, see below). */
  sent: { userId: number; token: Buffer } | null;
}

/**
 * Silent-success semantics: legacy looks up the user, and IF found generates
 * + emails a token, but either way sets `model.AssistanceComplete = true`
 * (`AccountController.cs:173-187`) -- the response view is identical whether
 * or not the email belongs to a real account, so this endpoint can't be used
 * to enumerate registered emails. Callers (the route/page) must render the
 * same "check your email" outcome regardless of `result.sent`.
 */
export async function requestPasswordAssistance(
  email: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<RequestPasswordAssistanceResult> {
  const user = await findUserByEmail(email, sql);
  if (!user) return { sent: null };

  const token = generateToken();
  await issuePasswordAssistanceToken(user.id, token, now, sql);
  return { sent: { userId: user.id, token } };
}

// ---------------------------------------------------------------------------
// Password assistance completion (doc 01 §6.3; ports
// `User.IsForgottenPasswordAssistanceTokenValid` (`User.cs:87-95`) and
// `AccountController.CompletePasswordAssistance` POST
// (`AccountController.cs:203-227`) / `User.ChangePasswordUsingPasswordAssistanceToken`
// (`User.cs:104-112`))
// ---------------------------------------------------------------------------

/** `Registry.Settings.ForgottenPasswordAssistanceTokenLifetime` (doc 01 §6.3: "1 hour"). */
const PASSWORD_ASSISTANCE_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

function isPasswordAssistanceTokenValid(
  user: {
    forgottenPasswordAssistanceTokenIssued: Date | null;
    forgottenPasswordAssistanceTokenUsed: Date | null;
  },
  now: Date,
): boolean {
  // User.cs:87-95: token != null (guaranteed by the caller having matched a
  // row by non-null token bytes) && issued >= now - lifetime && used == null.
  if (!user.forgottenPasswordAssistanceTokenIssued) return false;
  if (user.forgottenPasswordAssistanceTokenUsed) return false;
  const elapsedMs = now.getTime() - user.forgottenPasswordAssistanceTokenIssued.getTime();
  return elapsedMs <= PASSWORD_ASSISTANCE_TOKEN_LIFETIME_MS;
}

/**
 * Read-only validity check for the GET completion page (mirrors
 * `AccountController.CompletePasswordAssistance` GET,
 * `AccountController.cs:190-201`, which shows a form only when
 * `IsForgottenPasswordAssistanceTokenValid`, without consuming the token).
 */
export async function checkPasswordAssistanceToken(
  tokenString: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<boolean> {
  const tokenBytes = decodeToken(tokenString);
  if (tokensEqual(tokenBytes, ZERO_TOKEN)) return false;
  const user = await findUserByPasswordAssistanceToken(tokenBytes, sql);
  if (!user) return false;
  return isPasswordAssistanceTokenValid(user, now);
}

export type CompletePasswordAssistanceError = "invalid-token" | "invalid-password";

export type CompletePasswordAssistanceResult =
  | { success: true }
  | { success: false; error: CompletePasswordAssistanceError; message: string };

export async function completePasswordAssistance(
  tokenString: string,
  newPassword: string,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<CompletePasswordAssistanceResult> {
  const tokenBytes = decodeToken(tokenString);
  if (tokensEqual(tokenBytes, ZERO_TOKEN)) {
    return { success: false, error: "invalid-token", message: "This password reset link is invalid or has expired." };
  }

  const user = await findUserByPasswordAssistanceToken(tokenBytes, sql);
  if (!user || !isPasswordAssistanceTokenValid(user, now)) {
    return { success: false, error: "invalid-token", message: "This password reset link is invalid or has expired." };
  }

  const passwordError = passwordPolicyError(newPassword);
  if (passwordError) {
    return { success: false, error: "invalid-password", message: passwordError };
  }

  const passwordArgon2 = await hashPasswordArgon2(newPassword);
  // Reuses the existing P2-03 `upgradePasswordHash` (auth.sql.ts): sets
  // password_argon2 + password_algo='argon2id', zeroes the (unmaintained,
  // D-005) legacy composition-metric columns, and -- same as every reset --
  // never produces a legacy-sha256 row (doc 04 "new hashes are never
  // legacy-format"). No new "setArgon2Password" data function was needed:
  // upgradePasswordHash already does exactly this.
  await upgradePasswordHash(user.id, passwordArgon2, sql);
  await consumePasswordAssistanceToken(user.id, now, sql);
  return { success: true };
}
