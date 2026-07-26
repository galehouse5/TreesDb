import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { createTestDb } from "../../db/queries/test-helpers";
import { pgliteAdapter, loadTableAsMap, loadIdSet } from "./db-adapter";
import {
  aggregateCrossCheck,
  compareRow,
  comparePkSets,
  compareRowCounts,
  compareTable,
  fkOrphanCheck,
  speciesHashCheck,
} from "./comparator";
import type { ColumnSpec } from "./tables";
import { TABLE_SPECS } from "./tables";
import type { CsvValue } from "./csv";

/** Formats a real DB row back into dump-CSV-shaped values, per each column's type convention - used where a test needs a genuinely zero-diff dump/DB pair derived from live PGlite data rather than a hand-typed fixture. */
function toCsvRow(dbRow: Record<string, unknown>, columns: ColumnSpec[]): Record<string, CsvValue> {
  const out: Record<string, CsvValue> = {};
  for (const col of columns) {
    const v = dbRow[col.db];
    if (v == null) {
      out[col.csv] = null;
      continue;
    }
    switch (col.type) {
      case "string":
      case "int":
      case "float":
        out[col.csv] = String(v);
        break;
      case "bool":
        out[col.csv] = v ? "1" : "0";
        break;
      case "bytea":
        out[col.csv] = Buffer.isBuffer(v) ? v.toString("hex") : String(v);
        break;
      case "datetime":
        out[col.csv] = (v instanceof Date ? v.toISOString() : String(v)).replace(/Z$/, "");
        break;
      case "dateonly":
        out[col.csv] = (v instanceof Date ? v.toISOString() : String(v)).slice(0, 10);
        break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pure comparator function tests (no DB) - each doc §7.1 mismatch class.
// ---------------------------------------------------------------------------

const COLUMNS: ColumnSpec[] = [
  { csv: "Name", db: "name", type: "string" },
  { csv: "Lat", db: "lat", type: "float" },
  { csv: "Count", db: "count", type: "int" },
  { csv: "Flag", db: "flag", type: "bool" },
  { csv: "Token", db: "token", type: "bytea" },
  { csv: "Created", db: "created", type: "datetime" },
  { csv: "Visited", db: "visited", type: "dateonly" },
];

function baseCsvRow(overrides: Partial<Record<string, CsvValue>> = {}): Record<string, CsvValue> {
  return {
    Name: "Old Growth Preserve",
    Lat: "40.1234550",
    Count: "3",
    Flag: "1",
    Token: "deadbeef",
    Created: "2020-05-12T14:23:01.123",
    Visited: "2020-05-12",
    ...overrides,
  };
}

function baseDbRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "Old Growth Preserve",
    lat: Math.fround(40.123455),
    count: 3,
    flag: true,
    token: Buffer.from("deadbeef", "hex"),
    created: new Date("2020-05-12T14:23:01.123Z"),
    visited: new Date(Date.UTC(2020, 4, 12)),
    ...overrides,
  };
}

describe("compareRow (pure)", () => {
  it("reports zero diffs on identical data", () => {
    expect(compareRow("t", 1, baseCsvRow(), baseDbRow(), COLUMNS)).toEqual([]);
  });

  it("detects a string mismatch - byte-exact, no trimming applied", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Name: "Old Growth Preserve " }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toEqual(["name"]);
  });

  it("distinguishes a real empty string from the NULL token (NULL-vs-empty)", () => {
    const asNull = compareRow("t", 1, baseCsvRow({ Name: null }), baseDbRow({ name: null }), COLUMNS);
    expect(asNull.map((d) => d.field)).not.toContain("name"); // both-null: equal

    const emptyVsNull = compareRow("t", 1, baseCsvRow({ Name: "" }), baseDbRow({ name: null }), COLUMNS);
    expect(emptyVsNull.map((d) => d.field)).toContain("name");

    const nullVsEmpty = compareRow("t", 1, baseCsvRow({ Name: null }), baseDbRow({ name: "" }), COLUMNS);
    expect(nullVsEmpty.map((d) => d.field)).toContain("name");
  });

  it("detects a float32 mismatch beyond fround precision (no epsilon)", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Lat: "40.9999990" }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("lat");
  });

  it("does not flag float values that only differ beyond float32 precision", () => {
    // 40.123455 and a float64-nearby value that both round to the same float32.
    const diffs = compareRow("t", 1, baseCsvRow({ Lat: String(Math.fround(40.123455)) }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).not.toContain("lat");
  });

  it("detects an int mismatch", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Count: "4" }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("count");
  });

  it("detects a boolean mismatch (0/1 <-> false/true)", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Flag: "0" }), baseDbRow({ flag: true }), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("flag");
    expect(compareRow("t", 1, baseCsvRow({ Flag: "1" }), baseDbRow({ flag: true }), COLUMNS)).toEqual([]);
  });

  it("detects a bytea mismatch, hex-normalized (DB Buffer vs dump lowercase hex)", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Token: "cafebabe" }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("token");
    // Case-insensitive equality: dump is already lowercase; DB Buffer.toString('hex') is too.
    expect(compareRow("t", 1, baseCsvRow({ Token: "DEADBEEF" }), baseDbRow(), COLUMNS)).toEqual([]);
  });

  it("detects a datetime mismatch, treating the offset-less dump string as UTC (D-002)", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Created: "2020-05-12T14:23:02.123" }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("created");
    // Sanity: the matching case (base fixture) must NOT be flagged - i.e. "Z" really is being
    // appended, not just coincidentally passing local-time parsing in this test runner's TZ.
    expect(compareRow("t", 1, baseCsvRow(), baseDbRow(), COLUMNS).map((d) => d.field)).not.toContain("created");
  });

  it("detects a date-only mismatch as a plain string comparison, no timezone shifting", () => {
    const diffs = compareRow("t", 1, baseCsvRow({ Visited: "2020-05-13" }), baseDbRow(), COLUMNS);
    expect(diffs.map((d) => d.field)).toContain("visited");
  });
});

describe("compareRowCounts (pure)", () => {
  it("flags a dump/DB count mismatch and a dump/manifest count mismatch independently", () => {
    const diffs = compareRowCounts("trees", 10, 9, 11);
    expect(diffs).toHaveLength(2);
    expect(diffs[0]!.kind).toBe("row-count");
  });

  it("is silent when everything agrees", () => {
    expect(compareRowCounts("trees", 10, 10, 10)).toEqual([]);
  });
});

describe("comparePkSets (pure)", () => {
  it("reports exact missing/extra id lists", () => {
    const { result, diffs } = comparePkSets("trees", [1, 2, 3, 4], [2, 3, 5]);
    expect(result.missingInDb).toEqual([1, 4]);
    expect(result.extraInDb).toEqual([5]);
    expect(diffs.map((d) => d.kind)).toEqual(["pk-missing", "pk-extra"]);
  });

  it("is silent on identical sets regardless of iteration order", () => {
    const { diffs } = comparePkSets("trees", [3, 1, 2], [1, 2, 3]);
    expect(diffs).toEqual([]);
  });
});

describe("aggregateCrossCheck (pure)", () => {
  const columns: ColumnSpec[] = [{ csv: "Height", db: "height", type: "float" }, { csv: "StateId", db: "state_id", type: "int", fk: "states" }];

  it("detects a min/max/sum/null-count mismatch", () => {
    const dumpRows = new Map<number, Record<string, CsvValue>>([
      [1, { Height: "10", StateId: "1" }],
      [2, { Height: "20", StateId: "1" }],
      [3, { Height: null, StateId: "2" }],
    ]);
    const dbRows = new Map<number, Record<string, unknown>>([
      [1, { height: 10, state_id: 1 }],
      [2, { height: 21, state_id: 1 }], // sum/max mismatch
      [3, { height: null, state_id: 2 }],
    ]);
    const diffs = aggregateCrossCheck("trees", dumpRows, dbRows, columns);
    const fields = diffs.map((d) => d.field);
    expect(fields).toContain("height");
    expect(diffs.some((d) => d.message.includes("max mismatch"))).toBe(true);
    expect(diffs.some((d) => d.message.includes("sum mismatch"))).toBe(true);
  });

  it("detects a per-FK distinct-count mismatch", () => {
    const dumpRows = new Map<number, Record<string, CsvValue>>([
      [1, { Height: "10", StateId: "1" }],
      [2, { Height: "20", StateId: "2" }],
    ]);
    const dbRows = new Map<number, Record<string, unknown>>([
      [1, { height: 10, state_id: 1 }],
      [2, { height: 20, state_id: 1 }], // only 1 distinct state_id instead of 2
    ]);
    const diffs = aggregateCrossCheck("trees", dumpRows, dbRows, columns);
    expect(diffs.some((d) => d.field === "state_id")).toBe(true);
  });

  it("is silent when every aggregate agrees", () => {
    const dumpRows = new Map<number, Record<string, CsvValue>>([[1, { Height: "10", StateId: "1" }]]);
    const dbRows = new Map<number, Record<string, unknown>>([[1, { height: 10, state_id: 1 }]]);
    expect(aggregateCrossCheck("trees", dumpRows, dbRows, columns)).toEqual([]);
  });
});

describe("fkOrphanCheck (pure)", () => {
  const column: ColumnSpec = { csv: "StateId", db: "state_id", type: "int", fk: "states" };

  it("flags a FK value with no matching row in the referenced table", () => {
    const dbRows = new Map<number, Record<string, unknown>>([
      [1, { id: 1, state_id: 1 }],
      [2, { id: 2, state_id: 999 }],
    ]);
    const diffs = fkOrphanCheck("sites", dbRows, column, new Set([1, 2, 3]));
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: "fk-orphan", id: 2, field: "state_id" });
  });

  it("ignores null FK values (nullable FKs are not orphans)", () => {
    const dbRows = new Map<number, Record<string, unknown>>([[1, { id: 1, state_id: null }]]);
    expect(fkOrphanCheck("sites", dbRows, column, new Set([1]))).toEqual([]);
  });
});

describe("speciesHashCheck (pure)", () => {
  it("passes when the dumped value matches the recomputed hash (known vector)", () => {
    expect(speciesHashCheck("trees", 1, "Quercus alba", "White Oak", 279197145)).toEqual([]);
  });

  it("catches a wrong dumped value", () => {
    const diffs = speciesHashCheck("trees", 1, "Quercus alba", "White Oak", 12345);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: "species-hash", id: 1, expected: 279197145, actual: 12345 });
  });
});

// ---------------------------------------------------------------------------
// Integration: compareTable end-to-end against a real PGlite-migrated DB,
// proving the DB-row-shape handling (Buffer/Date/etc from the real driver,
// not hand-built fixtures) is correct, plus FK-orphan wiring.
// ---------------------------------------------------------------------------

describe("compareTable (PGlite integration)", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(`
      insert into countries (double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
      values ('US', 'USA', 'United States', 49, -66, 24, -125);
      insert into states (country_id, double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
      values (1, 'OH', 'OHI', 'Ohio', 42, -80, 38, -85);
      insert into sites (state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, name, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, visit_count)
      values (1, 'Franklin', 'Public', '', false, 'Test Park', 40, 2, -83, 2, 40, -83, 1);
      insert into trees (site_id, computed_measured_species_id, last_measured, common_name, scientific_name, height, height_input_format, height_measurement_method, girth, girth_input_format, crown_spread, crown_spread_input_format, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, elevation, elevation_input_format, diameter, diameter_input_format, conical_volume, conical_volume_input_format)
      values (1, 279197145, '2020-01-01', 'White Oak', 'Quercus alba', 100, 2, 0, 200, 2, 50, 2, 40, 2, -83, 2, 40, -83, 800, 2, 10, 2, 0, 0);
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  function csvRowForTree1(overrides: Partial<Record<string, CsvValue>> = {}): Record<string, CsvValue> {
    return {
      Id: "1",
      ComputedMeasuredSpeciesId: "279197145",
      LastMeasured: "2020-01-01",
      CommonName: "White Oak",
      ScientificName: "Quercus alba",
      Height: "100",
      HeightInputFormat: "2",
      HeightMeasurementMethod: "0",
      Girth: "200",
      GirthInputFormat: "2",
      CrownSpread: "50",
      CrownSpreadInputFormat: "2",
      Latitude: "40",
      LatitudeInputFormat: "2",
      Longitude: "-83",
      LongitudeInputFormat: "2",
      CalculatedLatitude: "40",
      CalculatedLongitude: "-83",
      Elevation: "800",
      ElevationInputFormat: "2",
      Diameter: "10",
      DiameterInputFormat: "2",
      ENTSPTS: null,
      ConicalVolume: "0",
      ConicalVolumeInputFormat: "0",
      ENTSPTS2: null,
      ChampionPoints: null,
      AbbreviatedChampionPoints: null,
      CalculatedLatitudeInputFormat: "2",
      CalculatedLongitudeInputFormat: "2",
      SiteId: "1",
      ...overrides,
    };
  }

  it("is zero-diff when the dump matches the DB exactly, including the species-hash recompute", async () => {
    const adapter = pgliteAdapter(db);
    const dbRows = await loadTableAsMap(adapter, "trees");
    const dumpRows = new Map([[1, csvRowForTree1()]]);
    const referencedIdSets = new Map([["sites", await loadIdSet(adapter, "sites")]]);

    const result = compareTable(TABLE_SPECS.trees!, dumpRows, dbRows, undefined, referencedIdSets);
    expect(result.diffs).toEqual([]);
    expect(result.checksRun).toBeGreaterThan(0);
  });

  it("catches a wrong dumped computed_measured_species_id via the species-hash check, independent of the field diff", async () => {
    const adapter = pgliteAdapter(db);
    const dbRows = await loadTableAsMap(adapter, "trees");
    // Wrong on BOTH sides identically (so no ordinary field diff fires) - isolates the
    // species-hash recompute check, which validates the dump's *internal* consistency.
    const dumpRows = new Map([[1, csvRowForTree1({ ComputedMeasuredSpeciesId: "999" })]]);
    dbRows.set(1, { ...dbRows.get(1)!, computed_measured_species_id: 999 });

    const result = compareTable(TABLE_SPECS.trees!, dumpRows, dbRows, undefined);
    expect(result.diffs.some((d) => d.kind === "species-hash")).toBe(true);
    expect(result.diffs.some((d) => d.kind === "field")).toBe(false);
  });

  it("catches a PK-set mismatch and a field mismatch when the DB diverges from the dump", async () => {
    const adapter = pgliteAdapter(db);
    const dbRows = await loadTableAsMap(adapter, "trees");
    const dumpRows = new Map([
      [1, csvRowForTree1({ Height: "999" })], // field mismatch
      [2, csvRowForTree1({ Id: "2" })], // PK missing from DB
    ]);

    const result = compareTable(TABLE_SPECS.trees!, dumpRows, dbRows, undefined);
    expect(result.diffs.some((d) => d.kind === "pk-missing")).toBe(true);
    expect(result.diffs.some((d) => d.kind === "field" && d.field === "height")).toBe(true);
  });

  it("catches a row-count mismatch against a manifest count", async () => {
    const adapter = pgliteAdapter(db);
    const dbRows = await loadTableAsMap(adapter, "trees");
    const dumpRows = new Map([[1, csvRowForTree1()]]);
    const result = compareTable(TABLE_SPECS.trees!, dumpRows, dbRows, 5 /* manifest says 5 rows */);
    expect(result.diffs.some((d) => d.kind === "row-count")).toBe(true);
  });

  it("FK orphan check flags a site_id with no matching sites row", async () => {
    const adapter = pgliteAdapter(db);
    const sitesSpec = TABLE_SPECS.sites!;
    const dbRows = await loadTableAsMap(adapter, "sites");
    dbRows.set(2, { ...dbRows.get(1)!, id: 2, state_id: 999 });
    const referencedIdSets = new Map([["states", await loadIdSet(adapter, "states")]]);
    // Dump row mirrors the DB row exactly (formatted per each column's dump convention) so the
    // only diff this test expects is the FK-orphan check, not an unrelated field mismatch.
    const dumpRows = new Map([[1, toCsvRow(dbRows.get(1)!, sitesSpec.columns)]]);
    const result = compareTable(sitesSpec, dumpRows, dbRows, undefined, referencedIdSets);
    expect(result.diffs.some((d) => d.kind === "fk-orphan" && d.id === 2)).toBe(true);
  });
});
