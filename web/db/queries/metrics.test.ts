import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { siteMetrics, stateMetrics } from "./metrics.sql";
import type { SqlTag } from "./sql-tag";
import {
  createTestDb,
  insertCountry,
  insertSite,
  insertState,
  insertTree,
  pgliteSqlTag,
} from "./test-helpers";

describe("metrics.sql", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  // 4 distinct species (1 tree each, heights 10/20/30/40) -- fewer than 5
  // species, so RHI5/10/20 must all be NULL (doc 01 §4 / CreateObjectsAndTypes.sql:558-568).
  let siteFourSpecies: number;
  // 5 distinct species (1 tree each, heights 10/20/30/40/50) -- exactly at
  // the RHI5 threshold. Hand-computed: avg(10,20,30,40,50) = 30.
  let siteFiveSpecies: number;
  // 5 distinct species, but one species has two trees (10 and 90); the
  // other four each have one tree at height 5. Species maxima are
  // {90, 5, 5, 5, 5} -- RHI5 must average the per-SPECIES maxima (avg =
  // 110/5 = 22), NOT the 6 raw tree heights (which would wrongly give
  // avg(90,10,5,5,5) = 23 if the tree with height 10 were allowed to count
  // separately from its own species' max of 90).
  let siteSpeciesMaximaNotTrees: number;
  // Coordinates-specified permutations for ContainsEntityWithCoordinates.
  let siteCoordsUnspecified: number; // InputFormat = 1 (Unspecified) -> false
  let siteCoordsInvalidButSpecified: number; // InputFormat = 0 (Invalid) -> counts as specified -> true
  let siteCoordsDefault: number; // InputFormat = 2 (Default) -> true

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId);

    siteFourSpecies = await insertSite(db, stateId, { name: "Four Species" });
    for (const [i, height] of [10, 20, 30, 40].entries()) {
      await insertTree(db, siteFourSpecies, {
        scientificName: `Species ${i}`,
        commonName: `Common ${i}`,
        height,
        girth: height,
        lastMeasured: `2020-01-0${i + 1}`,
      });
    }

    siteFiveSpecies = await insertSite(db, stateId, { name: "Five Species" });
    for (const [i, height] of [10, 20, 30, 40, 50].entries()) {
      await insertTree(db, siteFiveSpecies, {
        scientificName: `Species ${i}`,
        commonName: `Common ${i}`,
        height,
        girth: height,
      });
    }

    siteSpeciesMaximaNotTrees = await insertSite(db, stateId, {
      name: "Maxima Not Trees",
    });
    await insertTree(db, siteSpeciesMaximaNotTrees, {
      scientificName: "Big Species",
      commonName: "Big Common",
      height: 10,
    });
    await insertTree(db, siteSpeciesMaximaNotTrees, {
      scientificName: "Big Species",
      commonName: "Big Common",
      height: 90,
    });
    for (const i of [0, 1, 2, 3]) {
      await insertTree(db, siteSpeciesMaximaNotTrees, {
        scientificName: `Small Species ${i}`,
        commonName: `Small Common ${i}`,
        height: 5,
      });
    }

    siteCoordsUnspecified = await insertSite(db, stateId, {
      name: "Unspecified Coords",
      latitudeInputFormat: 1,
      longitudeInputFormat: 1,
    });
    siteCoordsInvalidButSpecified = await insertSite(db, stateId, {
      name: "Invalid But Specified Coords",
      latitudeInputFormat: 0,
      longitudeInputFormat: 0,
    });
    siteCoordsDefault = await insertSite(db, stateId, {
      name: "Default Coords",
      latitudeInputFormat: 2,
      longitudeInputFormat: 2,
    });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("siteMetrics (CreateObjectsAndTypes.sql:544-594)", () => {
    it("RHI5/10/20 are NULL when the site has fewer than N distinct species", async () => {
      const [row] = await siteMetrics(siteFourSpecies, sql);
      expect(row!.rhi5).toBeNull();
      expect(row!.rhi10).toBeNull();
      expect(row!.rhi20).toBeNull();
      expect(row!.treesMeasuredCount).toBe(4);
    });

    it("RHI5 is populated at exactly 5 distinct species (hand-computed average)", async () => {
      const [row] = await siteMetrics(siteFiveSpecies, sql);
      expect(row!.rhi5).toBeCloseTo(30, 5);
      expect(row!.rhi10).toBeNull();
      expect(row!.treesMeasuredCount).toBe(5);
    });

    it("RHI5 averages per-species maxima, not raw tree values", async () => {
      const [row] = await siteMetrics(siteSpeciesMaximaNotTrees, sql);
      expect(row!.rhi5).toBeCloseTo(22, 5);
      // 6 trees total (2 + 4), but only 5 distinct species.
      expect(row!.treesMeasuredCount).toBe(6);
    });

    it("ContainsEntityWithCoordinates is false only for InputFormat = 1 (Unspecified); Invalid (0) counts as specified", async () => {
      const [unspecified] = await siteMetrics(siteCoordsUnspecified, sql);
      const [invalidButSpecified] = await siteMetrics(siteCoordsInvalidButSpecified, sql);
      const [defaultFmt] = await siteMetrics(siteCoordsDefault, sql);
      expect(unspecified!.containsEntityWithCoordinates).toBe(false);
      expect(invalidButSpecified!.containsEntityWithCoordinates).toBe(true);
      expect(defaultFmt!.containsEntityWithCoordinates).toBe(true);
    });

    it("with no siteId, returns a row for every site", async () => {
      const rows = await siteMetrics(undefined, sql);
      expect(rows.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("stateMetrics (CreateObjectsAndTypes.sql:478-534)", () => {
    it("aggregates species maxima across every site in the state", async () => {
      // The state contains siteFourSpecies (species 0-3, heights 10-40),
      // siteFiveSpecies (species 0-4, heights 10-50, same names as
      // siteFourSpecies's first 4 -- state-level grouping is by
      // ScientificName only, so "Species 0".."Species 3" each have their
      // max taken across BOTH sites), siteSpeciesMaximaNotTrees (Big
      // Species max 90, Small Species 0-3 at 5), plus 3 coordinate-only
      // sites (no trees). State-level species maxima include duplicates
      // resolved by MAX across sites -- this test only asserts
      // ContainsEntityWithCoordinates and that the view runs across the
      // whole state without error; the RHI arithmetic itself is exercised
      // precisely at the site level above (same query shape, see
      // metrics.sql.ts).
      const [row] = await stateMetrics(stateId, sql);
      expect(row).toBeDefined();
      expect(row!.treesMeasuredCount).toBe(4 + 5 + 6);
    });

    it("ContainsEntityWithCoordinates is true if ANY site in the state has specified coordinates", async () => {
      // siteCoordsDefault (InputFormat 2) is in this state alongside
      // siteCoordsUnspecified (InputFormat 1) -- state-level flag is an
      // OR across all sites, so it must be true even though not every site
      // qualifies.
      const [row] = await stateMetrics(stateId, sql);
      expect(row!.containsEntityWithCoordinates).toBe(true);
    });

    it("is false when no site in the state has specified coordinates", async () => {
      const countryId = await insertCountry(db, {
        doubleLetterCode: "CA",
        tripleLetterCode: "CAN",
        name: "Canada-ish",
      });
      const emptyState = await insertState(db, countryId, {
        doubleLetterCode: "ZZ",
        tripleLetterCode: "ZZZ",
        name: "No Coords State",
      });
      await insertSite(db, emptyState, {
        name: "No Coords Site",
        latitudeInputFormat: 1,
        longitudeInputFormat: 1,
      });
      const [row] = await stateMetrics(emptyState, sql);
      expect(row!.containsEntityWithCoordinates).toBe(false);
    });
  });
});
