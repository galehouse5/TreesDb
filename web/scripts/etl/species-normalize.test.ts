/**
 * D-016/D-011 ETL loader coverage (PGlite), sibling to migrate-data.test.ts.
 *
 * `loadTable()` (load-table.ts) applies the D-016 species-name whitespace
 * normalization and the D-011 slug-uniqueness assertion itself for
 * trees/tree_measurements (see that file's header comment), so these tests
 * exercise the behavior purely through ordinary `loadTable()` calls -- no
 * separate wiring step is needed to observe it "on load".
 *
 * Uses the same PGlite + real-migration-replay technique as
 * migrate-data.test.ts, but builds rows directly via `makeInsertFillStrategy`
 * (no CSV round-trip needed -- these tests only care about the staging ->
 * INSERT path plus the post-load steps, not CSV parsing, which csv.test.ts
 * and migrate-data.test.ts already cover).
 *
 * `row()`/`header()` below fill every one of a table's configured columns
 * with a harmless type-appropriate default so a NOT-NULL-heavy table (trees
 * has ~30 columns) can be populated without hand-listing every one; callers
 * override only the columns a given test actually cares about. FK columns
 * are always overridden explicitly (defaults are never valid FK targets).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { speciesHash } from "../../lib/species-hash";
import { speciesSlug } from "../../lib/slug";
import type { SqlExecutor } from "./executor";
import { loadTable, makeInsertFillStrategy } from "./load-table";
import { normalizeSpeciesWhitespace } from "./species-normalize";
import { TABLES, type ColumnType, type TableConfig } from "./tables";

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

function defaultForType(type: ColumnType): string {
  switch (type) {
    case "integer":
    case "smallint":
    case "real":
    case "boolean":
      return "0";
    case "date":
      return "2020-01-01";
    case "timestamptz":
      return "2020-01-01T00:00:00.000";
    case "bytea":
      return "00";
    case "string":
      return "";
  }
}

function header(table: TableConfig): string[] {
  return table.columns.map((c) => c.legacy);
}

/** One full staging row for `table`, defaulted per-column and overridden by
 * legacy column name. FK columns (nullable or not) must always be passed in
 * `overrides` explicitly -- the "0"/"" defaults above are only safe for
 * non-FK attribute columns. */
function row(
  table: TableConfig,
  overrides: Record<string, string | null>,
): (string | null)[] {
  return table.columns.map((c) =>
    Object.prototype.hasOwnProperty.call(overrides, c.legacy)
      ? overrides[c.legacy]!
      : defaultForType(c.type),
  );
}

async function errorMessage(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return "";
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

describe("D-016/D-011 ETL post-load steps (PGlite)", () => {
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

    // Shared fixtures: one country -> state -> site (for trees) and one
    // import_trips -> import_sites (for import_trees). Reused read-only by
    // every test below; only trees/tree_measurements rows are reset between
    // tests (see beforeEach).
    await loadTable({
      executor,
      table: TABLES.countries!,
      header: header(TABLES.countries!),
      fill: makeInsertFillStrategy(executor, [row(TABLES.countries!, { Id: "1" })]),
    });
    await loadTable({
      executor,
      table: TABLES.states!,
      header: header(TABLES.states!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.states!, { Id: "1", CountryId: "1" }),
      ]),
    });
    await loadTable({
      executor,
      table: TABLES.sites!,
      header: header(TABLES.sites!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.sites!, { Id: "1", StateId: "1" }),
      ]),
    });
    await loadTable({
      executor,
      table: TABLES.import_trips!,
      header: header(TABLES.import_trips!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.import_trips!, {
          Id: "1",
          CreatorUserId: null,
          DefaultStateId: null,
        }),
      ]),
    });
    await loadTable({
      executor,
      table: TABLES.import_sites!,
      header: header(TABLES.import_sites!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.import_sites!, {
          Id: "1",
          CreatorUserId: null,
          TripId: "1",
          StateId: null,
        }),
      ]),
    });
  });

  afterAll(async () => {
    await db.close();
  });

  // trees/tree_measurements rows differ per test; import/site/state/country
  // fixtures above are read-only and reused across tests.
  beforeEach(async () => {
    await executor.query("TRUNCATE TABLE trees, tree_measurements RESTART IDENTITY CASCADE");
  });

  it("(a) normalizes a double-space scientific_name on load and recomputes the hash", async () => {
    await loadTable({
      executor,
      table: TABLES.trees!,
      header: header(TABLES.trees!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.trees!, {
          Id: "1",
          SiteId: "1",
          ScientificName: "Cercis  siliquastrum",
          CommonName: "Judas-Tree",
          ComputedMeasuredSpeciesId: "0", // legacy dump value, pre-normalization
        }),
      ]),
    });

    const { rows } = await executor.query<{
      scientific_name: string;
      common_name: string;
      computed_measured_species_id: number;
    }>(`SELECT scientific_name, common_name, computed_measured_species_id FROM trees WHERE id = 1`);
    const loaded = rows[0]!;

    // loadTable() itself applied the normalization -- no separate call needed.
    expect(loaded.scientific_name).toBe("Cercis siliquastrum");
    expect(loaded.common_name).toBe("Judas-Tree");
    expect(loaded.computed_measured_species_id).toBe(
      speciesHash("Cercis siliquastrum", "Judas-Tree"),
    );

    // Idempotent: nothing left to touch on a direct re-run.
    expect(await normalizeSpeciesWhitespace(executor, "trees")).toBe(0);
  });

  it("(a) also normalizes tree_measurements (nullable tree_id/importing_trip_id, no FK setup needed)", async () => {
    await loadTable({
      executor,
      table: TABLES.tree_measurements!,
      header: header(TABLES.tree_measurements!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.tree_measurements!, {
          Id: "1",
          TreeId: null,
          ImportingTripId: null,
          ScientificName: "Crataegus   spp.",
          CommonName: "Hawthorn",
          ComputedMeasuredSpeciesId: "0",
        }),
      ]),
    });

    const { rows } = await executor.query<{
      scientific_name: string;
      computed_measured_species_id: number;
    }>(
      `SELECT scientific_name, computed_measured_species_id FROM tree_measurements WHERE id = 1`,
    );
    expect(rows[0]!.scientific_name).toBe("Crataegus spp.");
    expect(rows[0]!.computed_measured_species_id).toBe(
      speciesHash("Crataegus spp.", "Hawthorn"),
    );
  });

  it("(b) does NOT normalize import_trees -- the historical import log stays exactly as captured", async () => {
    await loadTable({
      executor,
      table: TABLES.import_trees!,
      header: header(TABLES.import_trees!),
      fill: makeInsertFillStrategy(executor, [
        row(TABLES.import_trees!, {
          Id: "1",
          CreatorUserId: null,
          SiteId: "1",
          ScientificName: "Cercis  siliquastrum",
          CommonName: "Judas-Tree",
        }),
      ]),
    });

    // import_trees is not in SPECIES_NORMALIZED_TABLES -- loadTable() only
    // normalizes tables in that list, so the whitespace run survives intact.
    const { rows } = await executor.query<{
      scientific_name: string;
      common_name: string;
    }>(`SELECT scientific_name, common_name FROM import_trees WHERE id = 1`);
    expect(rows[0]!.scientific_name).toBe("Cercis  siliquastrum");
    expect(rows[0]!.common_name).toBe("Judas-Tree");
  });

  it("(c) throws on a genuine collision (names differing only by punctuation)", async () => {
    // Sanity: these two pairs really do collide under speciesSlug
    // (punctuation is stripped by slugify), so this has something real to catch.
    expect(speciesSlug("Acer rubrum", "Red Maple")).toBe(
      speciesSlug("Acer, rubrum!", "Red Maple"),
    );

    const load = () =>
      loadTable({
        executor,
        table: TABLES.trees!,
        header: header(TABLES.trees!),
        fill: makeInsertFillStrategy(executor, [
          row(TABLES.trees!, {
            Id: "1",
            SiteId: "1",
            ScientificName: "Acer rubrum",
            CommonName: "Red Maple",
          }),
          row(TABLES.trees!, {
            Id: "2",
            SiteId: "1",
            ScientificName: "Acer, rubrum!",
            CommonName: "Red Maple",
          }),
        ]),
      });

    // loadTable() itself rejects -- the D-011 assertion runs as part of
    // loading `trees`, not as a separate step the caller has to remember.
    // A single call: the INSERT already committed both colliding rows before
    // the assertion throws, so a second `load()` would just hit a duplicate
    // primary key, not exercise the collision message again.
    // SELECT DISTINCT has no ORDER BY, so don't assume which of the two
    // colliding pairs the message lists first -- just check both are named.
    const message = await errorMessage(load());
    expect(message).toMatch(/D-011 species slug collision/);
    expect(message).toContain("(Acer rubrum, Red Maple)");
    expect(message).toContain("(Acer, rubrum!, Red Maple)");
    expect(message).toContain(" vs ");
  });

  it("(c) passes on clean (collision-free) data", async () => {
    await expect(
      loadTable({
        executor,
        table: TABLES.trees!,
        header: header(TABLES.trees!),
        fill: makeInsertFillStrategy(executor, [
          row(TABLES.trees!, {
            Id: "1",
            SiteId: "1",
            ScientificName: "Acer rubrum",
            CommonName: "Red Maple",
          }),
          row(TABLES.trees!, {
            Id: "2",
            SiteId: "1",
            ScientificName: "Quercus alba",
            CommonName: "White Oak",
          }),
        ]),
      }),
    ).resolves.toBeDefined();
  });
});
