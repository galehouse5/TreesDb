/**
 * Test-only support for db/queries/*.test.ts and db/recompute.test.ts.
 *
 * `createTestDb()` spins up an in-memory Postgres (PGlite) and replays the
 * real drizzle-kit migration SQL from db/migrations/*.sql, split on
 * `--> statement-breakpoint` -- the same technique db/schema.test.ts uses
 * (that file is owned by another task; its ~15-line loader is duplicated
 * here rather than imported, to respect the file-ownership boundary).
 *
 * `pgliteSqlTag()` wraps a PGlite instance as a `SqlTag` (see sql-tag.ts) so
 * the exact same query functions used in production (against the real
 * postgres.js client) can be exercised in tests. It only supports the flat
 * "one template, N positional scalar params" shape every query in this
 * directory is written to use.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { SqlTag } from "./sql-tag";

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "migrations");

function loadMigrationStatements(): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const statements: string[] = [];
  for (const file of files) {
    const sqlText = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    for (const stmt of sqlText.split("--> statement-breakpoint")) {
      const trimmed = stmt.trim();
      if (trimmed) statements.push(trimmed);
    }
  }
  return statements;
}

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  for (const statement of loadMigrationStatements()) {
    await db.exec(statement);
  }
  return db;
}

export function pgliteSqlTag(db: PGlite): SqlTag {
  const tag = (async <T,>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}` + (strings[i + 1] ?? "");
    }
    const result = await db.query<T>(text, values as unknown[]);
    return result.rows;
  }) as SqlTag;
  // No `.begin` -- withTransaction() falls back to running work untransacted
  // against this shim, which is fine for PGlite's single-instance tests.
  return tag;
}

/**
 * Divergence, reported per the task brief ("if something is unsupported,
 * adapt the test transport but keep production SQL faithful; report any
 * such divergence"): this PGlite build's `convert_to(text, 'WIN1252')` (formerly 'LATIN1')
 * (used by db/queries/species-hash.sql.ts to match SQL Server's
 * single-byte-codepage MD5 hashing, per doc 01 §4) does not error, but
 * silently returns zero rows for ANY query that calls it -- verified with
 * `select convert_to('hello', 'LATIN1')` alone returning `{rows: [],
 * fields: []}` with no exception, on a fresh PGlite instance. This looks
 * like a gap in PGlite's trimmed WASM Postgres build (encoding-conversion
 * procs not compiled in) rather than a bug in the query.
 *
 * This is a TEST-TRANSPORT-ONLY workaround, applied after the tagged
 * template is fully joined into `$1,$2,...`-parameterized text (so it
 * safely spans `${}` interpolation holes, e.g.
 * `convert_to(lower(trim($1)), 'LATIN1')`): it strips every
 * `convert_to(<expr>, 'LATIN1')` down to `<expr>`. For ASCII-only input --
 * every species-hash golden vector, and every value these tests use -- this
 * is mathematically identical to the real conversion (UTF8 and LATIN1
 * encode the ASCII range identically), so it does not mask a correctness
 * bug for what's actually tested. Production (the real postgres.js client
 * against real Postgres/Neon) never passes through this function and always
 * sees the unmodified, faithful SQL text from species-hash.sql.ts -- this
 * shim does NOT change what ships. Non-ASCII species-name parity for the
 * hash is left to the doc 07 §7.1.5 data-parity suite against real
 * production data, which is the authoritative check for that case anyway.
 */
export function pgliteSqlTagAsciiOnly(db: PGlite): SqlTag {
  const tag = (async <T,>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}` + (strings[i + 1] ?? "");
    }
    text = text.replace(/convert_to\(([^,]+),\s*'(?:LATIN1|WIN1252)'\)/g, "$1");
    const result = await db.query<T>(text, values as unknown[]);
    return result.rows;
  }) as SqlTag;
  return tag;
}

// ---------------------------------------------------------------------------
// Minimal fixture builders. Every legacy-derived measurement/coordinate
// column is NOT NULL (schema.ts), so every insert needs a full column list;
// these wrap that boilerplate with sane defaults (mirroring the values
// db/schema.test.ts's own fixture uses: lat 40 / long -83, InputFormat 2 =
// Default) and let each test override only the columns it cares about.
// ---------------------------------------------------------------------------

export async function insertCountry(
  db: PGlite,
  overrides: Partial<{
    doubleLetterCode: string;
    tripleLetterCode: string;
    name: string;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into countries (double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
     values ($1, $2, $3, 49, -66, 24, -125) returning id`,
    [
      overrides.doubleLetterCode ?? "US",
      overrides.tripleLetterCode ?? "USA",
      overrides.name ?? "United States",
    ],
  );
  return r.rows[0]!.id;
}

export async function insertState(
  db: PGlite,
  countryId: number,
  overrides: Partial<{
    doubleLetterCode: string;
    tripleLetterCode: string;
    name: string;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into states (country_id, double_letter_code, triple_letter_code, name)
     values ($1, $2, $3, $4) returning id`,
    [
      countryId,
      overrides.doubleLetterCode ?? "OH",
      overrides.tripleLetterCode ?? "OHI",
      overrides.name ?? "Ohio",
    ],
  );
  return r.rows[0]!.id;
}

export async function insertSite(
  db: PGlite,
  stateId: number,
  overrides: Partial<{
    name: string;
    county: string;
    latitude: number;
    latitudeInputFormat: number;
    longitude: number;
    longitudeInputFormat: number;
  }> = {},
): Promise<number> {
  const lat = overrides.latitude ?? 40;
  const latFmt = overrides.latitudeInputFormat ?? 2;
  const lng = overrides.longitude ?? -83;
  const lngFmt = overrides.longitudeInputFormat ?? 2;
  const r = await db.query<{ id: number }>(
    `insert into sites (state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, name, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude)
     values ($1, $2, 'Public', '', false, $3, $4, $5, $6, $7, $4, $6) returning id`,
    [
      stateId,
      overrides.county ?? "Franklin",
      overrides.name ?? "Test Park",
      lat,
      latFmt,
      lng,
      lngFmt,
    ],
  );
  return r.rows[0]!.id;
}

export async function insertTree(
  db: PGlite,
  siteId: number,
  overrides: Partial<{
    scientificName: string;
    commonName: string;
    height: number;
    girth: number;
    crownSpread: number;
    lastMeasured: string;
  }> = {},
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into trees (
       site_id, computed_measured_species_id, last_measured, common_name, scientific_name,
       height, height_input_format, height_measurement_method,
       girth, girth_input_format,
       crown_spread, crown_spread_input_format,
       latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude,
       elevation, elevation_input_format, diameter, diameter_input_format,
       conical_volume, conical_volume_input_format
     )
     values (
       $1, 0, $2, $3, $4,
       $5, 2, 0,
       $6, 2,
       $7, 2,
       40, 2, -83, 2,
       40, -83,
       0, 2, 0, 2,
       0, 2
     ) returning id`,
    [
      siteId,
      overrides.lastMeasured ?? "2020-01-01",
      overrides.commonName ?? "White Oak",
      overrides.scientificName ?? "Quercus alba",
      overrides.height ?? 0,
      overrides.girth ?? 0,
      overrides.crownSpread ?? 0,
    ],
  );
  return r.rows[0]!.id;
}

export async function insertTreeMeasurer(
  db: PGlite,
  ids: { treeId?: number | null; measurementId?: number | null },
  firstName: string,
  lastName: string,
): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into tree_measurers (tree_id, measurement_id, first_name, last_name)
     values ($1, $2, $3, $4) returning id`,
    [ids.treeId ?? null, ids.measurementId ?? null, firstName, lastName],
  );
  return r.rows[0]!.id;
}
