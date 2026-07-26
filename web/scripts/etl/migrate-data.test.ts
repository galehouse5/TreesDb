/**
 * P0-04 ETL loader integration test.
 *
 * Spins up an in-memory Postgres (PGlite), replays the real drizzle-kit
 * migration SQL (same technique as db/schema.test.ts), then drives
 * load-table.ts's core staging + `INSERT ... OVERRIDING SYSTEM VALUE` path
 * against small hand-built in-test CSV strings for `countries`, `states`,
 * and `users` - chosen because between them they cover every value
 * transform the loader performs: bit/boolean, hex->bytea, datetime->UTC
 * timestamptz, real passthrough, and the NULL-vs-empty-string distinction.
 *
 * PGlite has no COPY wire protocol reachable from postgres.js (per the
 * P0-04 task brief), so this test does NOT exercise the production COPY
 * transport - it uses `makeInsertFillStrategy` (parameterized INSERTs
 * through the same generic `SqlExecutor` interface) to fill the staging
 * table instead. Everything downstream of "staging table is filled" -
 * `CREATE TEMP TABLE`, the `INSERT ... OVERRIDING SYSTEM VALUE SELECT
 * <casts> FROM staging` step, and the row-count result - is the exact same
 * code the production CLI runs. See migrate-data.ts's header comment for
 * why COPY itself is untested here (residual risk, called out in the task
 * report).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseCsv, rowToNullableStrings } from "./csv";
import type { SqlExecutor } from "./executor";
import { loadTable, makeInsertFillStrategy } from "./load-table";
import { TABLES } from "./tables";

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "db", "migrations");

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

/** Builds one CSV field per the P0-03 dump convention: `null` -> bare
 * unquoted `NULL`; every other string (including `""`) -> double-quoted
 * with `"` doubled. */
function csvField(v: string | null): string {
  if (v === null) return "NULL";
  return `"${v.replace(/"/g, '""')}"`;
}
function csvLine(fields: (string | null)[]): string {
  return fields.map(csvField).join(",") + "\r\n";
}

describe("ETL loader (PGlite, staging-INSERT fill path)", () => {
  let db: PGlite;
  let executor: SqlExecutor;

  beforeAll(async () => {
    db = new PGlite();
    executor = {
      query: (text, params) =>
        db.query(text, params as unknown[] | undefined) as Promise<{
          rows: never[];
        }>,
    };
    const statements = loadMigrationStatements();
    expect(statements.length).toBeGreaterThan(0);
    for (const statement of statements) {
      await db.exec(statement);
    }
  });

  afterAll(async () => {
    await db.close();
  });

  it("loads countries: real passthrough, string columns", async () => {
    const csv =
      csvLine([
        "Id",
        "DoubleLetterCode",
        "TripleLetterCode",
        "Name",
        "NELatitude",
        "NELongitude",
        "SWLatitude",
        "SWLongitude",
      ]) +
      csvLine([
        "1",
        "US",
        "USA",
        "United States",
        "49.384472000000003",
        "-66.885444000000001",
        "24.396308000000001",
        "-125",
      ]);
    const rows = parseCsv(csv);
    const header = rows[0]!.map((f) => f.value);
    const dataRows = rows.slice(1).map(rowToNullableStrings);

    const result = await loadTable({
      executor,
      table: TABLES.countries!,
      header,
      fill: makeInsertFillStrategy(executor, dataRows),
    });

    expect(result.insertedRowCount).toBe(1);
    expect(result.stagingRowCount).toBe(1);

    const res = await executor.query<{
      id: number;
      double_letter_code: string;
      name: string;
      ne_latitude: number;
      sw_longitude: number;
    }>(`select * from countries where id = 1`);
    expect(res.rows).toHaveLength(1);
    const row = res.rows[0]!;
    expect(row.double_letter_code).toBe("US");
    expect(row.name).toBe("United States");
    expect(row.ne_latitude).toBeCloseTo(49.384472, 4);
    expect(row.sw_longitude).toBeCloseTo(-125, 4);
  });

  it("loads states: boolean(bit)->boolean, nullable date, nullable real, NULL-vs-value", async () => {
    const header = [
      "Id",
      "CountryId",
      "DoubleLetterCode",
      "TripleLetterCode",
      "Name",
      "NELatitude",
      "NELongitude",
      "SWLatitude",
      "SWLongitude",
      "ComputedRHI5",
      "ComputedRHI10",
      "ComputedRHI20",
      "ComputedRGI5",
      "ComputedRGI10",
      "ComputedRGI20",
      "ComputedTreesMeasuredCount",
      "ComputedLastMeasurementDate",
      "ComputedContainsEntityWithCoordinates",
      "AreMetricsStale",
      "LastMetricsUpdateTimestamp",
    ];
    const row1 = [
      "1",
      "1",
      "OH",
      "OHI",
      "Ohio",
      "42.5",
      "-80.5",
      "38.5",
      "-84.5",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null, // ComputedLastMeasurementDate: NULL
      "0", // ComputedContainsEntityWithCoordinates: false
      "1", // AreMetricsStale: true
      null, // LastMetricsUpdateTimestamp: NULL
    ];
    const row2 = [
      "2",
      "1",
      "KY",
      "KEN",
      "Kentucky",
      "39.1",
      "-81.9",
      "36.5",
      "-89.6",
      "134.81999999999999",
      null,
      null,
      null,
      null,
      null,
      "42",
      "2020-05-01", // ComputedLastMeasurementDate
      "1", // ComputedContainsEntityWithCoordinates: true
      "0", // AreMetricsStale: false
      "2020-05-12T10:15:30.123", // no offset - D-002: treat as UTC
    ];
    const csv =
      csvLine(header) + csvLine(row1) + csvLine(row2);
    const rows = parseCsv(csv);
    const parsedHeader = rows[0]!.map((f) => f.value);
    const dataRows = rows.slice(1).map(rowToNullableStrings);

    const result = await loadTable({
      executor,
      table: TABLES.states!,
      header: parsedHeader,
      fill: makeInsertFillStrategy(executor, dataRows),
      expectedRowCount: 2,
    });
    expect(result.insertedRowCount).toBe(2);
    expect(result.rowCountMatches).toBe(true);

    const res = await executor.query<{
      id: number;
      computed_last_measurement_date: string | null;
      computed_contains_entity_with_coordinates: boolean | null;
      are_metrics_stale: boolean;
      last_metrics_update_timestamp: string | null;
      computed_rhi5: number | null;
      computed_trees_measured_count: number | null;
    }>(`select * from states order by id`);
    expect(res.rows).toHaveLength(2);

    const [state1, state2] = res.rows as [
      (typeof res.rows)[number],
      (typeof res.rows)[number],
    ];
    expect(state1.computed_last_measurement_date).toBeNull();
    expect(state1.computed_contains_entity_with_coordinates).toBe(false);
    expect(state1.are_metrics_stale).toBe(true);
    expect(state1.last_metrics_update_timestamp).toBeNull();
    expect(state1.computed_rhi5).toBeNull();

    expect(state2.computed_contains_entity_with_coordinates).toBe(true);
    expect(state2.are_metrics_stale).toBe(false);
    expect(state2.computed_trees_measured_count).toBe(42);
    expect(state2.computed_rhi5).toBeCloseTo(134.82, 2);
    // D-002: naive datetime with no offset in the dump is UTC wall-clock.
    expect(
      new Date(state2.last_metrics_update_timestamp!).toISOString(),
    ).toBe("2020-05-12T10:15:30.123Z");
  });

  it("loads users: hex->bytea, timestamptz UTC cast, nullable bytea/timestamp, empty-string-vs-NULL", async () => {
    const header = [
      "Id",
      "Email",
      "Firstname",
      "Lastname",
      "Roles",
      "PasswordHash",
      "PasswordNumerics",
      "PasswordUppercase",
      "PasswordLowercase",
      "PasswordSpecials",
      "PasswordLength",
      "Created",
      "LastLogin",
      "EmailVerificationToken",
      "RecentlyFailedLoginAttempts",
      "EmailVerified",
      "LastFailedLoginAttempt",
      "ForgottenPasswordAssistanceToken",
      "ForgottenPasswordAssistanceTokenIssued",
      "ForgottenPasswordAssistanceTokenUsed",
    ];
    const passwordHashHex = "a1".repeat(32); // 32 bytes
    const emailTokenHex = "b2".repeat(32);
    const row = [
      "1",
      "alice@example.com",
      "", // Firstname: real empty string (quoted "" in the dump), NOT null
      "Smith",
      "3",
      passwordHashHex,
      "0",
      "0",
      "0",
      "0",
      "0",
      "2021-06-15T08:30:00.000",
      "2021-06-16T09:00:00.000",
      emailTokenHex,
      "0",
      null, // EmailVerified: NULL
      null, // LastFailedLoginAttempt: NULL
      null, // ForgottenPasswordAssistanceToken: NULL (nullable bytea)
      null,
      null,
    ];
    const csv = csvLine(header) + csvLine(row);
    const rows = parseCsv(csv);
    const parsedHeader = rows[0]!.map((f) => f.value);
    const dataRows = rows.slice(1).map(rowToNullableStrings);

    // Sanity check on the parser itself: Firstname must come through as an
    // empty (non-null) string and the three NULL-token fields as JS null.
    expect(dataRows[0]![2]).toBe("");
    expect(dataRows[0]![15]).toBeNull();

    const result = await loadTable({
      executor,
      table: TABLES.users!,
      header: parsedHeader,
      fill: makeInsertFillStrategy(executor, dataRows),
    });
    expect(result.insertedRowCount).toBe(1);

    const res = await executor.query<{
      id: number;
      email: string;
      firstname: string;
      password_hash: Uint8Array;
      email_verification_token: Uint8Array;
      created: string;
      last_login: string;
      email_verified: string | null;
      forgotten_password_assistance_token: Uint8Array | null;
    }>(`select * from users where id = 1`);
    expect(res.rows).toHaveLength(1);
    const u = res.rows[0]!;

    expect(u.firstname).toBe("");
    expect(u.email).toBe("alice@example.com");
    expect(Buffer.from(u.password_hash).toString("hex")).toBe(
      passwordHashHex,
    );
    expect(Buffer.from(u.email_verification_token).toString("hex")).toBe(
      emailTokenHex,
    );
    expect(new Date(u.created).toISOString()).toBe("2021-06-15T08:30:00.000Z");
    expect(new Date(u.last_login).toISOString()).toBe(
      "2021-06-16T09:00:00.000Z",
    );
    expect(u.email_verified).toBeNull();
    expect(u.forgotten_password_assistance_token).toBeNull();
  });

  it("rejects an unrecognized CSV column name against the mapping", async () => {
    await expect(
      loadTable({
        executor,
        table: TABLES.countries!,
        header: ["Id", "SomeColumnThatDoesNotExist"],
        fill: async () => {},
      }),
    ).rejects.toThrow(/unrecognized column/);
  });

  it("rejects a CSV header missing an expected column", async () => {
    await expect(
      loadTable({
        executor,
        table: TABLES.countries!,
        header: ["Id", "DoubleLetterCode"],
        fill: async () => {},
      }),
    ).rejects.toThrow(/missing expected column/);
  });
});
