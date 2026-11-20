/**
 * Delta sync (scripts/etl/delta.ts) against PGlite with the real migrations,
 * using `countries` and `states` (a parent/child pair with real, nullable
 * date and boolean columns). Same staging-INSERT fill path as
 * migrate-data.test.ts; the COPY transport and the one-transaction wrapper
 * live in migrate-data.ts and are exercised against a real Postgres instead.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { parseCsv, rowToNullableStrings } from "./csv";
import {
  dropIncoming,
  incomingTableName,
  reconcileMissing,
  syncTableDelta,
  type DeltaTableResult,
} from "./delta";
import type { SqlExecutor } from "./executor";
import { makeInsertFillStrategy } from "./load-table";
import { normalizeSpeciesWhitespaceInTable } from "./species-normalize";
import { TABLES } from "./tables";

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "db", "migrations");

function migrationStatements(): string[] {
  const statements: string[] = [];
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of readFileSync(path.join(MIGRATIONS_DIR, file), "utf8").split(
      "--> statement-breakpoint",
    )) {
      if (stmt.trim()) statements.push(stmt.trim());
    }
  }
  return statements;
}

function csvField(v: string | null): string {
  return v === null ? "NULL" : `"${v.replace(/"/g, '""')}"`;
}

const COUNTRY_HEADER = TABLES.countries!.columns.map((c) => c.legacy);
const STATE_HEADER = TABLES.states!.columns.map((c) => c.legacy);

function country(id: number, name: string): (string | null)[] {
  return [String(id), name.slice(0, 2).toUpperCase(), name.slice(0, 3).toUpperCase(), name, "10", "20", "-10", "-20"];
}

function state(
  id: number,
  countryId: number,
  name: string,
  opts: { rhi5?: string | null; lastDate?: string | null } = {},
): (string | null)[] {
  const values: Record<string, string | null> = {
    Id: String(id),
    CountryId: String(countryId),
    DoubleLetterCode: name.slice(0, 2).toUpperCase(),
    TripleLetterCode: name.slice(0, 3).toUpperCase(),
    Name: name,
    NELatitude: "41.5",
    NELongitude: "-80.5",
    SWLatitude: "38.4",
    SWLongitude: "-84.8",
    ComputedRHI5: opts.rhi5 === undefined ? "160.44000244140625" : opts.rhi5,
    ComputedRHI10: "153.6999969482422",
    ComputedRHI20: null,
    ComputedRGI5: "24.040000915527344",
    ComputedRGI10: null,
    ComputedRGI20: null,
    ComputedTreesMeasuredCount: "1708",
    ComputedLastMeasurementDate: opts.lastDate === undefined ? "2023-03-19" : opts.lastDate,
    ComputedContainsEntityWithCoordinates: "1",
    AreMetricsStale: "0",
    LastMetricsUpdateTimestamp: "2023-03-20T01:02:03.457",
  };
  return STATE_HEADER.map((h) => values[h] ?? null);
}

/** Round-trips rows through the CSV writer/parser so values reach the
 * loader exactly as they would from a dump file. */
function asDumpRows(header: string[], rows: (string | null)[][]): (string | null)[][] {
  const text = [header, ...rows].map((r) => r.map(csvField).join(",")).join("\r\n") + "\r\n";
  return parseCsv(text).slice(1).map(rowToNullableStrings);
}

describe("delta sync (PGlite)", () => {
  let db: PGlite;
  let executor: SqlExecutor;

  async function sync(
    countries: (string | null)[][],
    states: (string | null)[][],
    applyDeletes = false,
  ): Promise<Record<string, DeltaTableResult>> {
    const results: DeltaTableResult[] = [];
    results.push(
      await syncTableDelta({
        executor,
        table: TABLES.countries!,
        header: COUNTRY_HEADER,
        fill: makeInsertFillStrategy(executor, asDumpRows(COUNTRY_HEADER, countries)),
      }),
    );
    results.push(
      await syncTableDelta({
        executor,
        table: TABLES.states!,
        header: STATE_HEADER,
        fill: makeInsertFillStrategy(executor, asDumpRows(STATE_HEADER, states)),
      }),
    );
    await reconcileMissing(executor, results, { applyDeletes });
    for (const r of results) await dropIncoming(executor, r.table);
    return Object.fromEntries(results.map((r) => [r.table, r]));
  }

  async function names(table: string): Promise<string[]> {
    const res = await executor.query<{ id: number; name: string }>(
      `SELECT id, name FROM ${table} ORDER BY id`,
    );
    return res.rows.map((r) => `${r.id}:${r.name}`);
  }

  beforeEach(async () => {
    if (db) await db.close();
    db = new PGlite();
    executor = {
      query: (text, params) =>
        db.query(text, params as unknown[] | undefined) as Promise<{ rows: never[] }>,
    };
    for (const statement of migrationStatements()) await db.exec(statement);
  });

  afterAll(async () => {
    await db.close();
  });

  it("loads an empty database like a full load, then is a no-op on the same dump", async () => {
    const countries = [country(1, "United States"), country(2, "Canada")];
    const states = [state(33, 1, "Ohio"), state(34, 2, "Ontario")];

    const first = await sync(countries, states);
    expect(first.countries).toMatchObject({ inserted: 2, updated: 0, unchanged: 0 });
    expect(first.states).toMatchObject({ inserted: 2, updated: 0, unchanged: 0 });
    expect(await names("states")).toEqual(["33:Ohio", "34:Ontario"]);

    const second = await sync(countries, states);
    expect(second.countries).toMatchObject({ inserted: 0, updated: 0, unchanged: 2, missingFromDump: 0 });
    expect(second.states).toMatchObject({ inserted: 0, updated: 0, unchanged: 2, missingFromDump: 0 });
  });

  it("inserts new ids, updates only changed rows, and treats value<->NULL as a change", async () => {
    await sync(
      [country(1, "United States"), country(2, "Canada")],
      [state(33, 1, "Ohio"), state(34, 2, "Ontario"), state(35, 1, "Michigan")],
    );

    const result = await sync(
      [country(1, "United States of America"), country(2, "Canada"), country(3, "Mexico")],
      [
        state(33, 1, "Ohio", { rhi5: "161.5" }),
        state(34, 2, "Ontario", { lastDate: null }),
        state(35, 1, "Michigan"),
        state(36, 3, "Sonora"),
      ],
    );

    expect(result.countries).toMatchObject({ inserted: 1, updated: 1, unchanged: 1 });
    expect(result.states).toMatchObject({ inserted: 1, updated: 2, unchanged: 1 });
    expect(await names("countries")).toEqual(["1:United States of America", "2:Canada", "3:Mexico"]);

    const res = await executor.query<{ id: number; rhi5: number; last: string | null }>(
      `SELECT id, computed_rhi5 AS rhi5, computed_last_measurement_date::text AS last FROM states ORDER BY id`,
    );
    expect(res.rows.find((r) => r.id === 33)?.rhi5).toBeCloseTo(161.5, 3);
    expect(res.rows.find((r) => r.id === 34)?.last).toBeNull();
  });

  it("keeps legacy ids on insert", async () => {
    await sync([country(1, "United States")], [state(33, 1, "Ohio")]);
    await sync([country(1, "United States")], [state(33, 1, "Ohio"), state(5000, 1, "Hawaii")]);
    expect(await names("states")).toEqual(["33:Ohio", "5000:Hawaii"]);
  });

  it("reports rows the dump no longer has, and keeps them unless deletes are applied", async () => {
    await sync(
      [country(1, "United States"), country(2, "Canada")],
      [state(33, 1, "Ohio"), state(34, 2, "Ontario")],
    );

    const reportOnly = await sync([country(1, "United States")], [state(33, 1, "Ohio")]);
    expect(reportOnly.countries).toMatchObject({ missingFromDump: 1, missingIdsSample: [2], deleted: 0 });
    expect(reportOnly.states).toMatchObject({ missingFromDump: 1, missingIdsSample: [34], deleted: 0 });
    expect(await names("states")).toEqual(["33:Ohio", "34:Ontario"]);

    const applied = await sync([country(1, "United States")], [state(33, 1, "Ohio")], true);
    // states (the child) is deleted before countries, so the FK never blocks it.
    expect(applied.states).toMatchObject({ missingFromDump: 1, deleted: 1 });
    expect(applied.countries).toMatchObject({ missingFromDump: 1, deleted: 1 });
    expect(await names("countries")).toEqual(["1:United States"]);
    expect(await names("states")).toEqual(["33:Ohio"]);
  });

  it("fails on a new child row whose parent isn't in the dump", async () => {
    await expect(
      sync([country(1, "United States")], [state(33, 9, "Nowhere")]),
    ).rejects.toThrow();
  });

  it("rejects a dump with a duplicated id", async () => {
    await expect(
      sync([country(1, "United States"), country(1, "Duplicate")], []),
    ).rejects.toThrow();
  });

  it("normalizes species whitespace on the incoming copy before diffing", async () => {
    await db.exec(
      `CREATE TEMP TABLE ${incomingTableName("t")} (id integer primary key, scientific_name text, common_name text, computed_measured_species_id integer)`,
    );
    await db.exec(
      `INSERT INTO ${incomingTableName("t")} VALUES (1, 'Quercus  alba', 'White   Oak', 0), (2, 'Acer rubrum', 'Red Maple', 7)`,
    );
    const touched = await normalizeSpeciesWhitespaceInTable(executor, incomingTableName("t"));
    expect(touched).toBe(1);
    const res = await executor.query<{ id: number; s: string; c: string; h: number }>(
      `SELECT id, scientific_name AS s, common_name AS c, computed_measured_species_id AS h FROM ${incomingTableName("t")} ORDER BY id`,
    );
    expect(res.rows[0]).toMatchObject({ s: "Quercus alba", c: "White Oak" });
    expect(res.rows[0]!.h).not.toBe(0);
    expect(res.rows[1]).toMatchObject({ s: "Acer rubrum", c: "Red Maple", h: 7 });
  });
});
