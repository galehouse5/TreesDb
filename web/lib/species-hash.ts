// Legacy species-identity hash port.
//
// Source: Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql (views
// Trees.MeasuredSpecies L28-33, Trees.MeasuredSpeciesBySite L106-113,
// Trees.MeasuredSpeciesByState L191-198).
// Doc: docs/migration/01-system-reference.md §4, doc 07 §7.1.5 / §7.3.
//
//   castInt(x) = CAST(HASHBYTES('MD5', x) AS int)
//              = the LAST 4 bytes of the 16-byte MD5 digest of x,
//                interpreted big-endian, as a SIGNED 32-bit integer.
//                (SQL Server's binary->int CAST right-aligns: for a source
//                wider than 4 bytes it takes the least-significant --
//                i.e. rightmost/last -- 4 bytes.)
//
//   hash            = abs( castInt(md5(lower(trim(sci))))
//                           XOR castInt(md5(lower(trim(common)))) )
//   siteScopedHash  = abs( castInt(md5(lower(trim(sci))))
//                           XOR castInt(md5(lower(trim(common))))
//                           XOR castInt(md5(String(siteId)))
//                           XOR castInt(md5('Site')) )
//   stateScopedHash = abs( castInt(md5(lower(trim(sci))))
//                           XOR castInt(md5(lower(trim(common))))
//                           XOR castInt(md5(String(stateId)))
//                           XOR castInt(md5('State')) )
//
// Verified against the SQL source directly (CreateObjectsAndTypes.sql
// lines 30-33, 108-113, 193-198) -- doc 01 §4's formula matches the SQL
// exactly, no discrepancy found.
//
// Strings hash in the database's single-byte code page. Production's
// collation is SQL_Latin1_General_CP1_CI_AS = Windows-1252 (verified
// against the production bacpac: COLLATIONPROPERTY(...,'CodePage') = 1252,
// and the Trees.Trees.ComputedMeasuredSpeciesId computed-column definition
// hashes the stored varchar bytes directly). CP1252 differs from
// latin1/ISO-8859-1 only in 0x80-0x9F, where it maps printable characters
// (curly quotes, dashes, etc.) -- and real species names DO hit this range
// ("Dunbar'S Hickory" with U+2019, parity §7.1.5 caught it), so we encode
// CP1252 rather than latin1. Characters unrepresentable in CP1252 encode
// as '?' (0x3F), matching SQL Server's default nvarchar->varchar
// conversion behavior.
//
// Edge case (documented, not "fixed"): `abs()` of `INT_MIN` (-2147483648)
// has no representable positive int32 counterpart; SQL Server's ABS()
// actually *errors* ("Arithmetic overflow error converting int to data
// type int") in that case rather than wrapping. In JavaScript, `Math.abs`
// operates on IEEE-754 doubles, not 32-bit ints, so `Math.abs(-2147483648)`
// silently and correctly yields `2147483648` -- it does NOT reproduce SQL
// Server's overflow error. If this XOR combination (probability ~1 in 2^32
// per (scientificName, commonName[, scope]) triple) is ever hit against
// real data, the legacy database would have thrown at view-evaluation time
// for that row, so no legacy Id would exist to match against; this port
// intentionally does not attempt to reproduce the SQL error.

import { createHash } from "node:crypto";

/** Unicode codepoint -> CP1252 byte for the 0x80-0x9F range where CP1252
 * diverges from latin1 (all other CP1252 bytes equal the codepoint). */
const CP1252_HIGH: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/** Encode as Windows-1252 bytes; unrepresentable characters become '?'
 * (0x3F), matching SQL Server's default conversion. */
function cp1252Encode(s: string): Buffer {
  const bytes = Buffer.alloc(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0xff && !(c >= 0x80 && c <= 0x9f)) bytes[i] = c;
    else bytes[i] = CP1252_HIGH[c] ?? 0x3f;
  }
  return bytes;
}

/** `CAST(HASHBYTES('MD5', x) AS int)` -- last 4 bytes of MD5(x), big-endian signed int32. */
function castInt(input: string): number {
  const bytes = cp1252Encode(input);
  const digest = createHash("md5").update(bytes).digest();
  const last4 = digest.subarray(12, 16);
  return last4.readInt32BE(0);
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** `abs(castInt(md5(lower(trim(scientificName)))) XOR castInt(md5(lower(trim(commonName)))))`. */
export function speciesHash(scientificName: string, commonName: string): number {
  const a = castInt(normalize(scientificName));
  const b = castInt(normalize(commonName));
  return Math.abs((a ^ b) | 0);
}

/** Site-scoped variant: additionally XORs in `castInt(md5(String(siteId)))` and `castInt(md5('Site'))`. */
export function siteScopedSpeciesHash(
  scientificName: string,
  commonName: string,
  siteId: number,
): number {
  const a = castInt(normalize(scientificName));
  const b = castInt(normalize(commonName));
  const c = castInt(String(siteId));
  const d = castInt("Site");
  return Math.abs((a ^ b ^ c ^ d) | 0);
}

/** State-scoped variant: additionally XORs in `castInt(md5(String(stateId)))` and `castInt(md5('State'))`. */
export function stateScopedSpeciesHash(
  scientificName: string,
  commonName: string,
  stateId: number,
): number {
  const a = castInt(normalize(scientificName));
  const b = castInt(normalize(commonName));
  const c = castInt(String(stateId));
  const d = castInt("State");
  return Math.abs((a ^ b ^ c ^ d) | 0);
}
