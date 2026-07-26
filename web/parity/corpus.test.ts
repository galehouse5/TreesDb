import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { createTestDb, pgliteSqlTag } from "../db/queries/test-helpers";
import { buildCorpusFromDb, mulberry32, seededSample, RANDOM_TREE_SEED } from "./corpus";

describe("mulberry32", () => {
  it("is a deterministic, seed-dependent generator producing values in [0,1)", () => {
    const a = mulberry32(1)();
    const b = mulberry32(1)();
    const c = mulberry32(2)();
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
  });

  it("produces a reproducible sequence for a fixed seed (regression pin)", () => {
    const rand = mulberry32(424242);
    const seq = [rand(), rand(), rand()];
    const rand2 = mulberry32(424242);
    expect([rand2(), rand2(), rand2()]).toEqual(seq);
  });
});

describe("seededSample", () => {
  const items = Array.from({ length: 1000 }, (_, i) => i + 1);

  it("is reproducible for the same seed and picks exactly min(count, n) distinct items", () => {
    const a = seededSample(items, 150, RANDOM_TREE_SEED);
    const b = seededSample(items, 150, RANDOM_TREE_SEED);
    expect(a).toEqual(b);
    expect(a).toHaveLength(150);
    expect(new Set(a).size).toBe(150);
    for (const id of a) expect(items).toContain(id);
  });

  it("is a genuine subset of the source items (order is the shuffle's own; callers re-sort before use)", () => {
    const a = seededSample(items, 20, 1);
    expect(a).toHaveLength(20);
    expect(new Set(a).size).toBe(20);
    for (const id of a) expect(items).toContain(id);
  });

  it("a different seed generally yields a different sample", () => {
    const a = seededSample(items, 150, 1);
    const b = seededSample(items, 150, 2);
    expect(a).not.toEqual(b);
  });

  it("clamps to the full list when count exceeds available items", () => {
    const small = [1, 2, 3];
    expect(seededSample(small, 150, 1).sort((x, y) => x - y)).toEqual([1, 2, 3]);
  });
});

describe("buildCorpusFromDb (PGlite fixture)", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(`
      insert into countries (double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
      values ('US', 'USA', 'United States', 49, -66, 24, -125);

      insert into states (country_id, double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude, computed_trees_measured_count)
      values
        (1, 'OH', 'OHI', 'Ohio', 42, -80, 38, -85, 5),
        (1, 'CA', 'CAL', 'California', 42, -114, 32, -124, 0);

      insert into sites (state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, name, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, visit_count)
      values
        (1, 'Franklin', 'Public', '', false, 'Alpha Park', 40, 2, -83, 2, 40, -83, 5),
        (1, 'Franklin', 'Public', '', false, 'Beta Preserve', 40.1, 2, -83.1, 2, 40.1, -83.1, 1);
    `);

    // A handful of trees with varied species/heights/girths/formats so the sampling +
    // edge-case queries all have something to find.
    const treeRows = [
      { site: 1, sci: "Quercus alba", cn: "White Oak", height: 100, girth: 200, latFmt: 2 },
      { site: 1, sci: "Quercus alba", cn: "White Oak", height: 80, girth: 150, latFmt: 2 },
      { site: 1, sci: "Acer rubrum", cn: "Red Maple", height: 60, girth: 90, latFmt: 1 }, // unspecified coords
      { site: 2, sci: "Ulmus americana", cn: "American Elm", height: 120, girth: 250, latFmt: 2 },
      { site: 2, sci: "Fagus grandifolia", cn: "American Beech", height: 40, girth: 60, latFmt: 2 },
    ];
    for (const t of treeRows) {
      await db.query(
        `insert into trees (site_id, computed_measured_species_id, last_measured, common_name, scientific_name, height, height_input_format, height_measurement_method, girth, girth_input_format, crown_spread, crown_spread_input_format, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, elevation, elevation_input_format, diameter, diameter_input_format, conical_volume, conical_volume_input_format)
         values ($1, 1, '2020-01-01', $2, $3, $4, 2, 0, $5, 2, 10, 2, 40, $6, -83, 2, 40, -83, 800, 2, 5, 2, 0, 0)`,
        [t.site, t.cn, t.sci, t.height, t.girth, t.latFmt],
      );
    }
  });

  afterAll(async () => {
    await db.close();
  });

  it("produces byte-identical output across two runs given the same DB and a pinned clock (determinism)", async () => {
    const sql = pgliteSqlTag(db);
    const now = () => new Date("2024-06-01T00:00:00Z");
    const a = await buildCorpusFromDb(sql, { now });
    const b = await buildCorpusFromDb(sql, { now });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("assembles the required Corpus shape with non-empty core categories", async () => {
    const sql = pgliteSqlTag(db);
    const corpus = await buildCorpusFromDb(sql, { now: () => new Date("2024-06-01T00:00:00Z") });

    expect(corpus.generatedAt).toBe("2024-06-01T00:00:00.000Z");
    expect(corpus.states.length).toBeGreaterThan(0);
    expect(corpus.sites.length).toBe(2);
    expect(corpus.species.length).toBeGreaterThan(0);
    expect(corpus.trees.length).toBeGreaterThan(0);
    expect(corpus.searchTerms).toHaveLength(30);
    for (const { term } of corpus.searchTerms) {
      expect(term.trim().length).toBeGreaterThan(0);
    }
    const termValues = corpus.searchTerms.map((t) => t.term);
    expect(new Set(termValues).size).toBe(termValues.length);
    const zeroHitTerms = corpus.searchTerms.filter((t) => t.tag === "zero-hits");
    expect(zeroHitTerms.length).toBeLessThanOrEqual(1);
    expect(corpus.autocompleteTerms).toHaveLength(20);
    expect(corpus.gridStates.length).toBeGreaterThan(0);
    expect(corpus.unitsSubset).toHaveLength(2);
    expect(corpus.unitsSubset.map((u) => u.unitsPreference).sort()).toEqual(["Meters", "Yards"]);
  });

  it("includes the Ohio state (measured) but not the unmeasured California state incorrectly tagged", async () => {
    const sql = pgliteSqlTag(db);
    const corpus = await buildCorpusFromDb(sql, { now: () => new Date() });
    const ohio = corpus.states.find((s) => s.code === "OH");
    const california = corpus.states.find((s) => s.code === "CA");
    expect(ohio?.hasMeasuredTrees).toBe(true);
    expect(california?.hasMeasuredTrees).toBe(false);
  });

  it("tags the unspecified-coordinates tree edge case", async () => {
    const sql = pgliteSqlTag(db);
    const corpus = await buildCorpusFromDb(sql, { now: () => new Date() });
    expect(corpus.trees.some((t) => t.reason === "unspecified-coordinates")).toBe(true);
  });

  it("random-seed-424242 sampling is reproducible across two builds", async () => {
    const sql = pgliteSqlTag(db);
    const a = await buildCorpusFromDb(sql, { now: () => new Date() });
    const b = await buildCorpusFromDb(sql, { now: () => new Date() });
    const randomIdsA = a.trees.filter((t) => t.reason === "random-seed-424242").map((t) => t.id);
    const randomIdsB = b.trees.filter((t) => t.reason === "random-seed-424242").map((t) => t.id);
    expect(randomIdsA).toEqual(randomIdsB);
  });

  it("species route segments are built as `{scientificName} ({commonName})`", async () => {
    const sql = pgliteSqlTag(db);
    const corpus = await buildCorpusFromDb(sql, { now: () => new Date() });
    const oak = corpus.species.find((s) => s.scientificName === "Quercus alba");
    expect(oak?.routeSegment).toBe("Quercus alba (White Oak)");
  });
});
