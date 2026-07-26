/**
 * SQL port of the legacy species-identity hash (Tmd.Migrations/Scripts/
 * CreateObjectsAndTypes.sql:30-33,108-113,193-198) -- task P0-05 deliverable
 * 6, doc 01 §4. A TypeScript twin (used by ETL/parity code) already exists
 * at web/lib/species-hash.ts, owned by another task; this file is the
 * independently SQL-evaluated version, per the task brief ("Include the
 * species-hash function (TS + SQL) with its unit vector" -- doc 02
 * §P0-05). Not used by measured-species.sql.ts/search.sql.ts, which key
 * species by the natural pair per D-003; this exists solely so ETL/parity
 * checks (doc 07 §7.1.5) can validate `computed_measured_species_id`
 * entirely in SQL if desired.
 *
 * Formula (doc 01 §4):
 *   castInt(x) = CAST(HASHBYTES('MD5', x) AS int)
 *              = last 4 bytes of MD5(x), big-endian, as a signed int32.
 *   hash            = abs(castInt(md5(lower(trim(sci)))) XOR castInt(md5(lower(trim(common)))))
 *   siteScopedHash  = abs(hash-terms XOR castInt(md5(str(siteId))) XOR castInt(md5('Site')))
 *   stateScopedHash = abs(hash-terms XOR castInt(md5(str(stateId))) XOR castInt(md5('State')))
 *
 * Postgres translation of castInt (doc 01 §4's own suggested equivalent):
 *   `('x' || right(md5(x), 8))::bit(32)::int`
 * `md5(text)` returns the 32-hex-char digest as text; `right(..., 8)` takes
 * the last 8 hex chars = last 4 bytes; prefixing with the literal `'x'`
 * makes Postgres's bit-string input parser read the following hex digits as
 * a hex-encoded bit string, and the final `::int` cast reads that bit
 * pattern as a big-endian two's-complement int32 -- matching SQL Server's
 * varbinary(16)->int cast (which also takes the trailing/least-significant
 * 4 bytes). Verified empirically against the known vector below (see
 * species-hash.test.ts).
 *
 * XOR operator: Postgres's `^` is exponentiation, NOT bitwise XOR (unlike
 * SQL Server, where `^` IS XOR) -- the integer bitwise XOR operator in
 * Postgres is `#`. Using `^` here would silently compute the wrong thing
 * (or error, since `^` on two ints computes a float power). This is the
 * single most likely transcription bug when porting this formula and is
 * called out explicitly.
 *
 * Encoding: like the TS twin, this hashes the Windows-1252 byte
 * encoding of the already-lower/trimmed string via
 * `convert_to(text, 'WIN1252')` before `md5()`, to match SQL Server's
 * SQL_Latin1_General_CP1_CI_AS collation (code page 1252, verified against
 * the production bacpac; parity caught real names with U+2019 in the
 * CP1252-only 0x80-0x9F range, so LATIN1 is NOT sufficient) --
 * single-byte-codepage MD5 hashing (doc 01 §4: "Strings hash in the DB's
 * single-byte code page -- ASCII-safe; verify any non-ASCII species names
 * against the legacy dump during parity"). Postgres's `md5(bytea)`
 * overload (distinct from `md5(text)`) returns the same hex-text digest
 * shape, so the rest of the expression is unchanged.
 *
 * PGlite divergence (test-only, reported per the task brief): this
 * project's PGlite build silently returns zero rows for any query
 * containing `convert_to(..., 'WIN1252')` (no exception -- looks like a
 * missing encoding-conversion proc in its trimmed WASM Postgres build).
 * The unit tests route through `pgliteSqlTagAsciiOnly` (test-helpers.ts),
 * which strips `convert_to(x, 'WIN1252')` to `x` in the already-parameterized SQL
 * text before executing against PGlite -- a test-transport-only rewrite
 * that is a no-op for ASCII input (every vector tested here). The
 * production SQL below is unmodified and always faithful; see
 * test-helpers.ts for the full writeup.
 */
import { type SqlTag, defaultSql } from "./sql-tag";

/** Port of `Trees.MeasuredSpecies`'s `Id` expression. */
export async function speciesHashSql(
  scientificName: string,
  commonName: string,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const rows = await sql<{ hash: number }>`
    select abs(
      (('x' || right(md5(convert_to(lower(trim(${scientificName})), 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to(lower(trim(${commonName})), 'WIN1252')), 8))::bit(32)::int)
    ) as hash
  `;
  return rows[0]!.hash;
}

/** Port of `Trees.MeasuredSpeciesBySite`'s `Id` expression. */
export async function siteScopedSpeciesHashSql(
  scientificName: string,
  commonName: string,
  siteId: number,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const rows = await sql<{ hash: number }>`
    select abs(
      (('x' || right(md5(convert_to(lower(trim(${scientificName})), 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to(lower(trim(${commonName})), 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to(${String(siteId)}, 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to('Site', 'WIN1252')), 8))::bit(32)::int)
    ) as hash
  `;
  return rows[0]!.hash;
}

/** Port of `Trees.MeasuredSpeciesByState`'s `Id` expression. */
export async function stateScopedSpeciesHashSql(
  scientificName: string,
  commonName: string,
  stateId: number,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const rows = await sql<{ hash: number }>`
    select abs(
      (('x' || right(md5(convert_to(lower(trim(${scientificName})), 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to(lower(trim(${commonName})), 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to(${String(stateId)}, 'WIN1252')), 8))::bit(32)::int)
      #
      (('x' || right(md5(convert_to('State', 'WIN1252')), 8))::bit(32)::int)
    ) as hash
  `;
  return rows[0]!.hash;
}
