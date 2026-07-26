import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { createTestDb, pgliteSqlTag } from "../../db/queries/test-helpers";
import { measuredSpecies } from "../../db/queries/measured-species.sql";
import { siteMetrics } from "../../db/queries/metrics.sql";
import { measurerActivity } from "../../db/queries/measurer-activity.sql";
import { searchMeasuredSpecies, searchSites } from "../../db/queries/search.sql";
import {
  compareMeasuredSpeciesRows,
  compareMeasurerActivityRows,
  compareMetricsRows,
  compareSearchIdRankRows,
  compareSearchSpeciesRows,
  decodeSearchTermToken,
} from "./derived";

describe("decodeSearchTermToken", () => {
  it("round-trips alnum-passthrough + _xHH-encoded characters (mirrors dump-legacy.ps1's Get-SafeFileToken)", () => {
    expect(decodeSearchTermToken("oak")).toBe("oak");
    expect(decodeSearchTermToken("OH")).toBe("OH");
    expect(decodeSearchTermToken("_x25")).toBe("%");
    expect(decodeSearchTermToken("_x5f")).toBe("_");
    expect(decodeSearchTermToken("_empty")).toBe("");
  });
});

describe("compareMeasuredSpeciesRows (pure)", () => {
  it("matches rows by natural key, not position, and is zero-diff on identical data", () => {
    const dump = [
      {
        scientificName: "Quercus alba",
        commonName: "White Oak",
        maxHeight: 100,
        maxHeightInputFormat: 2,
        maxHeightTreeId: 5,
        maxGirth: 200,
        maxGirthInputFormat: 2,
        maxGirthTreeId: 5,
        maxCrownSpread: 50,
        maxCrownSpreadInputFormat: 2,
        maxCrownSpreadTreeId: 5,
        number: 1,
      },
    ];
    const impl = [{ ...dump[0]! }];
    expect(compareMeasuredSpeciesRows("measured_species", dump, impl)).toEqual([]);
  });

  it("waives a Max*TreeId mismatch when the underlying value is float32-tied (W-001)", () => {
    const dump = [
      {
        scientificName: "Quercus alba",
        commonName: "White Oak",
        maxHeight: 100,
        maxHeightInputFormat: 2,
        maxHeightTreeId: 5, // legacy picked tree 5
        maxGirth: 200,
        maxGirthInputFormat: 2,
        maxGirthTreeId: 5,
        maxCrownSpread: 50,
        maxCrownSpreadInputFormat: 2,
        maxCrownSpreadTreeId: 5,
        number: 1,
      },
    ];
    const impl = [{ ...dump[0]!, maxHeightTreeId: 7 }]; // new port picked tree 7 (lowest id), same value
    const diffs = compareMeasuredSpeciesRows("measured_species", dump, impl);
    const treeIdDiff = diffs.find((d) => d.field === "maxHeightTreeId");
    expect(treeIdDiff?.waiverHint).toBe("W-001");
  });

  it("does NOT waive when the underlying value itself also differs", () => {
    const dump = [
      {
        scientificName: "Quercus alba",
        commonName: "White Oak",
        maxHeight: 100,
        maxHeightInputFormat: 2,
        maxHeightTreeId: 5,
        maxGirth: 200,
        maxGirthInputFormat: 2,
        maxGirthTreeId: 5,
        maxCrownSpread: 50,
        maxCrownSpreadInputFormat: 2,
        maxCrownSpreadTreeId: 5,
        number: 1,
      },
    ];
    const impl = [{ ...dump[0]!, maxHeight: 999, maxHeightTreeId: 7 }];
    const diffs = compareMeasuredSpeciesRows("measured_species", dump, impl);
    const treeIdDiff = diffs.find((d) => d.field === "maxHeightTreeId");
    expect(treeIdDiff?.waiverHint).toBeUndefined();
    expect(diffs.some((d) => d.field === "maxHeight")).toBe(true);
  });

  it("reports pk-missing/pk-extra for unmatched natural keys", () => {
    const dump = [{ scientificName: "A", commonName: "B", maxHeight: 1, maxHeightInputFormat: 2, maxHeightTreeId: 1, maxGirth: 1, maxGirthInputFormat: 2, maxGirthTreeId: 1, maxCrownSpread: 1, maxCrownSpreadInputFormat: 2, maxCrownSpreadTreeId: 1, number: 1 }];
    const impl = [{ scientificName: "C", commonName: "D", maxHeight: 1, maxHeightInputFormat: 2, maxHeightTreeId: 1, maxGirth: 1, maxGirthInputFormat: 2, maxGirthTreeId: 1, maxCrownSpread: 1, maxCrownSpreadInputFormat: 2, maxCrownSpreadTreeId: 1, number: 1 }];
    const diffs = compareMeasuredSpeciesRows("measured_species", dump, impl);
    expect(diffs.map((d) => d.kind).sort()).toEqual(["pk-extra", "pk-missing"]);
  });
});

describe("compareMetricsRows (pure)", () => {
  it("is zero-diff on identical rows, matched by siteId", () => {
    const dump = [{ siteId: 1, rhi5: 100, rhi10: null, rhi20: null, rgi5: 50, rgi10: null, rgi20: null, treesMeasuredCount: 3, lastMeasurementDate: "2020-01-01", containsEntityWithCoordinates: true }];
    const impl = [{ siteId: 1, rhi5: 100, rhi10: null, rhi20: null, rgi5: 50, rgi10: null, rgi20: null, treesMeasuredCount: 3, lastMeasurementDate: "2020-01-01", containsEntityWithCoordinates: true }];
    expect(compareMetricsRows("site_metrics", dump, impl, "siteId")).toEqual([]);
  });

  it("detects a containsEntityWithCoordinates mismatch (dump int 1/0 vs new boolean)", () => {
    const dump = [{ siteId: 1, rhi5: null, rhi10: null, rhi20: null, rgi5: null, rgi10: null, rgi20: null, treesMeasuredCount: 0, lastMeasurementDate: null, containsEntityWithCoordinates: true }];
    const impl = [{ ...dump[0]!, containsEntityWithCoordinates: false }];
    const diffs = compareMetricsRows("site_metrics", dump, impl, "siteId");
    expect(diffs.some((d) => d.field === "containsEntityWithCoordinates")).toBe(true);
  });
});

describe("compareMeasurerActivityRows (pure)", () => {
  it("matches by (lastName, firstName) natural key", () => {
    const dump = [{ lastName: "Smith", firstName: "Jane", treesMeasuredCount: 5, sitesVisitedCount: 2, lastMeasurementDate: "2020-01-01" }];
    const impl = [{ ...dump[0]! }];
    expect(compareMeasurerActivityRows("measurer_activity", dump, impl)).toEqual([]);
  });

  it("detects a treesMeasuredCount mismatch", () => {
    const dump = [{ lastName: "Smith", firstName: "Jane", treesMeasuredCount: 5, sitesVisitedCount: 2, lastMeasurementDate: "2020-01-01" }];
    const impl = [{ ...dump[0]!, treesMeasuredCount: 4 }];
    const diffs = compareMeasurerActivityRows("measurer_activity", dump, impl);
    expect(diffs.some((d) => d.field === "treesMeasuredCount")).toBe(true);
  });
});

describe("compareSearchIdRankRows / compareSearchSpeciesRows (pure)", () => {
  it("matches sites/states by real id, independent of row order", () => {
    const dump = [{ id: 1, rank: 3 }, { id: 2, rank: 1 }];
    const impl = [{ id: 2, rank: 1 }, { id: 1, rank: 3 }];
    expect(compareSearchIdRankRows("search_sites", dump, impl)).toEqual([]);
  });

  it("detects a rank mismatch by id", () => {
    const dump = [{ id: 1, rank: 3 }];
    const impl = [{ id: 1, rank: 2 }];
    const diffs = compareSearchIdRankRows("search_sites", dump, impl);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ field: "rank", id: 1 });
  });

  it("reconstructs the species Id via speciesHash for SearchMeasuredSpecies (known vector)", () => {
    const dump = [{ id: 279197145, rank: 4 }];
    const impl = [{ scientificName: "Quercus alba", commonName: "White Oak", rank: 4 }];
    expect(compareSearchSpeciesRows("search_measured_species", dump, impl)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Integration: wires the real db/queries/*.sql.ts functions (P0-05, landed)
// against a PGlite fixture, proving the comparator functions accept their
// actual output shape - not just hand-typed fixtures matching the interfaces.
// ---------------------------------------------------------------------------

describe("derived.ts wired against real db/queries (PGlite integration)", () => {
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
      insert into tree_measurers (tree_id, first_name, last_name) values (1, 'Jane', 'Smith');
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  it("measuredSpecies() output compares zero-diff against a matching hand-built dump row", async () => {
    const sql = pgliteSqlTag(db);
    const rows = await measuredSpecies(sql);
    const dump = rows.map((r) => ({ ...r }));
    expect(compareMeasuredSpeciesRows("measured_species", dump, rows)).toEqual([]);
  });

  it("siteMetrics() output compares zero-diff against a matching hand-built dump row", async () => {
    const sql = pgliteSqlTag(db);
    const rows = await siteMetrics(undefined, sql);
    const dump = rows.map((r) => ({ ...r, containsEntityWithCoordinates: r.containsEntityWithCoordinates }));
    expect(compareMetricsRows("site_metrics", dump, rows, "siteId")).toEqual([]);
  });

  it("measurerActivity() output compares zero-diff against a matching hand-built dump row", async () => {
    const sql = pgliteSqlTag(db);
    const rows = await measurerActivity(sql);
    expect(rows.length).toBeGreaterThan(0);
    expect(compareMeasurerActivityRows("measurer_activity", rows, rows)).toEqual([]);
  });

  it("searchSites() ids can be diffed directly against a dump-shaped (id, rank) array", async () => {
    const sql = pgliteSqlTag(db);
    const rows = await searchSites("Test", sql);
    expect(rows.length).toBeGreaterThan(0);
    expect(compareSearchIdRankRows("search_sites", rows, rows)).toEqual([]);
  });

  it("searchMeasuredSpecies() results reconstruct to the known species hash vector", async () => {
    const sql = pgliteSqlTag(db);
    const rows = await searchMeasuredSpecies("Quercus", sql);
    expect(rows.length).toBeGreaterThan(0);
    const dump = rows.map((r) => ({ id: 279197145, rank: r.rank }));
    expect(compareSearchSpeciesRows("search_measured_species", dump, rows)).toEqual([]);
  });
});
