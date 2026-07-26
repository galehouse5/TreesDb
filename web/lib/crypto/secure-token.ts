// Legacy SecureToken codec port.
//
// Source: TMD.Model/Users/SecureToken.cs.
// Doc: docs/migration/01-system-reference.md §6.3.
//
// 32 crypto-random bytes, stored as `binary(32)`. URL form: standard
// Base64, drop the single trailing '=' padding character, then '/'->'_',
// '+'->'-', giving a 43-character string. Decode reverses the two
// substitutions and appends exactly one '=' before base64-decoding.
//
// This is NOT RFC 4648 base64url (which maps '='  to nothing generally via
// unpadded encoding rules and is defined independently of a fixed input
// length) -- SecureToken.cs hardcodes "drop exactly the last character"
// (SecureToken.cs:21: `base64Token.Substring(0, base64Token.Length - 1)`)
// and "append exactly one '='" on decode (SecureToken.cs:28). For a fixed
// 32-byte input this happens to coincide with base64url's padding-removal
// for THIS length (32 bytes -> 44 base64 chars incl. exactly one '=' pad
// char), but the codec here is defined positionally, not by the RFC rule --
// keep this exact implementation, do not swap in a generic base64url helper.

import { randomBytes, timingSafeEqual } from "node:crypto";

export const SECURE_TOKEN_BYTE_LENGTH = 32;
/** Base64 (32 bytes) is 44 chars incl. one '=' pad char; we drop it. */
export const SECURE_TOKEN_ENCODED_LENGTH = 43;

/** Generates a new 32-byte cryptographically random token (SecureToken.Create, SecureToken.cs:42-47). */
export function generateToken(): Buffer {
  return randomBytes(SECURE_TOKEN_BYTE_LENGTH);
}

/**
 * Encodes 32 raw token bytes into the 43-character URL-safe form
 * (SecureToken.UrlEncodedValue, SecureToken.cs:16-24).
 */
export function encodeToken(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString("base64");
  const dropped = base64.slice(0, base64.length - 1);
  return dropped.replace(/\//g, "_").replace(/\+/g, "-");
}

/**
 * Decodes the 43-character URL-safe form back to raw bytes
 * (SecureToken.Decode, SecureToken.cs:26-39). Legacy swallows malformed
 * base64 by returning 32 zero bytes instead of throwing (FormatException
 * catch, SecureToken.cs:34-37) -- replicated here via strict base64
 * validation (`Buffer.from(str, "base64")` does not throw on malformed
 * input the way .NET's `Convert.FromBase64String` does, so we validate the
 * alphabet/padding ourselves).
 *
 * Additionally (a deliberate strengthening beyond legacy, not a legacy
 * behavior): a result that decodes validly as base64 but to a length other
 * than 32 bytes is ALSO treated as invalid and zero-filled. Legacy has no
 * such guard (a same-length-mod-4 wrong-length input would silently
 * produce a wrong-length byte array); every caller in this codebase needs
 * exactly a 32-byte token, so decode enforces that invariant directly.
 */
export function decodeToken(urlEncodedToken: string): Buffer {
  const base64 = urlEncodedToken.replace(/_/g, "/").replace(/-/g, "+") + "=";
  const buf = Buffer.from(base64, "base64");
  if (!isValidBase64(base64) || buf.length !== SECURE_TOKEN_BYTE_LENGTH) {
    return Buffer.alloc(SECURE_TOKEN_BYTE_LENGTH);
  }
  return buf;
}

const BASE64_STRICT_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function isValidBase64(s: string): boolean {
  return s.length % 4 === 0 && BASE64_STRICT_RE.test(s);
}

/** Constant-time comparison of two decoded tokens (ground rules §3; legacy used non-constant-time string equality). */
export function tokensEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Convenience: constant-time comparison of two URL-encoded token strings. */
export function urlEncodedTokensEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
