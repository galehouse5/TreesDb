// Legacy password hashing port.
//
// Source: TMD.Model/Users/Password.cs, TMD.Model/Users/User.cs.
// Doc: docs/migration/01-system-reference.md §6.1.
//
// Scheme (no stored salt -- the user's own email is the salt):
//   hash = SHA256( UTF16LE( password + trim(lower(email)) ) )   // 32 bytes
//
// `Password.Create` (Password.cs:69-86) does NOT trim the password before
// hashing. `Password.VerifyPassword` (Password.cs:55-59) DOES trim the
// candidate password (`password.Trim()`) -- and also trims the salt, but
// the salt passed in is always `User.Email`, which the `User.Email` setter
// (User.cs:19-23, via `OrEmptyAndTrimToLower`) has already normalized, so
// trimming it again is a no-op. We reproduce this by always normalizing the
// email the same way regardless of call site, and trimming the password
// only on the verify path -- preserving the create/verify asymmetry
// (doc 01 §6.1, ground rules §3).

import { createHash, timingSafeEqual } from "node:crypto";

const HASH_LENGTH_BYTES = 32;

/** `trim(lower(email))` -- the salt derivation used on every hashing path. */
export function normalizeEmailForHashing(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Computes the 32-byte SHA-256 password hash exactly as legacy
 * `Password.ComputeHash` (Password.cs:62-67): SHA256 over the UTF-16LE
 * (.NET `Encoding.Unicode`, no BOM) bytes of `password + trim(lower(email))`.
 *
 * Does NOT trim `password` -- callers that need the verify-path trim
 * asymmetry must trim before calling (see `verifyPassword` below).
 */
export function hashPassword(password: string, email: string): Buffer {
  const salt = normalizeEmailForHashing(email);
  const combined = password + salt;
  const bytes = Buffer.from(combined, "utf16le");
  return createHash("sha256").update(bytes).digest();
}

/** Hex-encoded form of {@link hashPassword}, lowercase, no prefix. */
export function hashPasswordHex(password: string, email: string): string {
  return hashPassword(password, email).toString("hex");
}

/**
 * Verifies a candidate password against a stored hash, replicating
 * `Password.VerifyPassword` (Password.cs:55-59): the candidate password IS
 * trimmed before hashing (asymmetric with `Create`, which is not). Emails
 * are always normalized the same way on both paths.
 *
 * Uses `crypto.timingSafeEqual` per ground rules §3 (legacy used
 * `SequenceEqual`, not constant-time -- intentionally not replicated).
 */
export function verifyPassword(
  candidatePassword: string,
  email: string,
  storedHash: Uint8Array,
): boolean {
  const trimmedCandidate = candidatePassword.trim();
  const computed = hashPassword(trimmedCandidate, email);
  const stored = Buffer.from(storedHash);
  if (stored.length !== HASH_LENGTH_BYTES || computed.length !== stored.length) {
    return false;
  }
  return timingSafeEqual(computed, stored);
}

// --- Password composition / policy (Password.cs:18-53, Settings.cs) -------
//
// Legacy counts four disjoint Unicode character classes matching .NET's
// char.IsNumber / char.IsUpper / char.IsLower / char.IsPunctuation-or-IsSymbol,
// then requires at least `PasswordCharacterTypes` (default 2) of them to be
// present, plus a minimum `PasswordLength` (default 8) -- Password.cs:29,
// Settings.cs:23-34. `HasInvalidCharacters` (Password.cs:27,84) flags any
// character that fell outside all four classes (e.g. whitespace, control
// characters, other Unicode letter/mark/separator categories).
//
// .NET's char.IsNumber matches Unicode categories Nd/Nl/No; char.IsUpper
// matches Lu; char.IsLower matches Ll; char.IsPunctuation matches Pc/Pd/Pe/
// Pf/Pi/Po/Ps; char.IsSymbol matches Sc/Sk/Sm/So. These category groups are
// mutually exclusive, so counting per-class via Unicode property regexes is
// a faithful (if not byte-for-byte-audited) port.

export const PASSWORD_MIN_LENGTH = 8; // Settings.cs:23 default
export const PASSWORD_MIN_CHARACTER_TYPES = 2; // Settings.cs:30 default

export interface PasswordComposition {
  length: number;
  numerics: number;
  uppercase: number;
  lowercase: number;
  specials: number;
  /** Count of non-empty classes present (0-4), mirrors Password.CharacterTypes. */
  characterTypes: number;
  hasInvalidCharacters: boolean;
}

const NUMERIC_RE = /\p{Nd}|\p{Nl}|\p{No}/u;
const UPPER_RE = /\p{Lu}/u;
const LOWER_RE = /\p{Ll}/u;
const SPECIAL_RE = /\p{P}|\p{S}/u;

function countMatching(password: string, re: RegExp): number {
  let count = 0;
  for (const ch of password) {
    if (re.test(ch)) count++;
  }
  return count;
}

/** Replicates `Password.Create`'s composition counters (Password.cs:71-84). */
export function analyzePasswordComposition(password: string): PasswordComposition {
  const numerics = countMatching(password, NUMERIC_RE);
  const uppercase = countMatching(password, UPPER_RE);
  const lowercase = countMatching(password, LOWER_RE);
  const specials = countMatching(password, SPECIAL_RE);
  const characterTypes =
    Math.sign(numerics) + Math.sign(uppercase) + Math.sign(lowercase) + Math.sign(specials);
  const hasInvalidCharacters = password.length > numerics + uppercase + lowercase + specials;
  return {
    length: password.length,
    numerics,
    uppercase,
    lowercase,
    specials,
    characterTypes,
    hasInvalidCharacters,
  };
}

/**
 * Replicates `Password.RequiredValidate` (Password.cs:29-46): password must
 * be at least `PASSWORD_MIN_LENGTH` characters and cover at least
 * `PASSWORD_MIN_CHARACTER_TYPES` of the four character classes. (Legacy
 * additionally flags `HasInvalidCharacters` as its own validation error;
 * exposed on the composition object for callers that want it.)
 */
export function meetsPasswordPolicy(password: string): boolean {
  const composition = analyzePasswordComposition(password);
  return (
    composition.length >= PASSWORD_MIN_LENGTH &&
    composition.characterTypes >= PASSWORD_MIN_CHARACTER_TYPES
  );
}
