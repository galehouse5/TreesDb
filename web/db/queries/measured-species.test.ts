import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  measuredSpecies,
  measuredSpeciesByState,
  measuredSpeciesBySite,
} from "./measured-species.sql";
import type { SqlTag } from "./sql-tag";
import {
  createTestDb,
  insertCountry,
  insertSite,
  insertState,
  insertTree,
  pgliteSqlTag,
} from "./test-helpers";

describe("measured-species.sql", () => {
  let db: PGlite;
  let sql: SqlTag;
  let site1: number;
  let site2: number;
  let stateId: number;
  // Quercus alba / White Oak at site1: heights 100, 150, 150 -- the two
  // ties at the max (150) are id-adjacent so "lowest id wins" (waiver
  // W-001) is unambiguous to assert.
  let oakLow: number;
  let oakTieA: number;
  let oakTieB: number;
  // Pinus strobus / White Pine at site1: a single tree with height/girth/
  // crownSpread all 0 -- exercises the "max = 0 -> Invalid format, no
  // representative tree id" branch.
  let pineZero: number;
  // A second site's Quercus alba / White Oak tree with a higher height,
  // to distinguish site-scoped vs state-scoped vs global grouping.
  let oakSite2: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId);
    site1 = await insertSite(db, stateId, { name: "Site One" });
    site2 = await insertSite(db, stateId, { name: "Site Two" });

    oakLow = await insertTree(db, site1, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
      height: 100,
      girth: 40,
      crownSpread: 20,
    });
    oakTieA = await insertTree(db, site1, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
      height: 150,
      girth: 80,
      crownSpread: 40,
    });
    oakTieB = await insertTree(db, site1, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
      height: 150,
      girth: 80,
      crownSpread: 40,
    });
    pineZero = await insertTree(db, site1, {
      scientificName: "Pinus strobus",
      commonName: "White Pine",
      height: 0,
      girth: 0,
      crownSpread: 0,
    });
    oakSite2 = await insertTree(db, site2, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
      height: 200,
      girth: 90,
      crownSpread: 45,
    });
    // Silence unused-variable lint for ids only asserted indirectly.
    void oakLow;
    void pineZero;
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("measuredSpecies (global, per doc 01 §4 / CreateObjectsAndTypes.sql:28-96)", () => {
    it("groups by (scientificName, commonName) across all sites", async () => {
      const rows = await measuredSpecies(sql);
      const oak = rows.find((r) => r.scientificName === "Quercus alba");
      expect(oak).toBeDefined();
      // 3 at site1 (100, 150, 150) + 1 at site2 (200) = 4 trees globally.
      expect(oak!.number).toBe(4);
      expect(oak!.maxHeight).toBe(200);
      expect(oak!.maxHeightTreeId).toBe(oakSite2);
      expect(oak!.maxHeightInputFormat).toBe(2);
    });

    it("breaks ties at the max by lowest tree id (waiver W-001)", async () => {
      // Restricted to species+site scope where the tie is unambiguous: use
      // measuredSpeciesBySite for site1 only, where the tied max (150) is
      // between oakTieA and oakTieB.
      const rows = await measuredSpeciesBySite(site1, sql);
      const oak = rows.find((r) => r.scientificName === "Quercus alba");
      expect(oak!.maxHeight).toBe(150);
      expect(oak!.maxHeightTreeId).toBe(Math.min(oakTieA, oakTieB));
      expect(oak!.maxGirthTreeId).toBe(Math.min(oakTieA, oakTieB));
      expect(oak!.maxCrownSpreadTreeId).toBe(Math.min(oakTieA, oakTieB));
    });

    it("max = 0 -> Invalid (0) format and a null representative tree id", async () => {
      const rows = await measuredSpecies(sql);
      const pine = rows.find((r) => r.scientificName === "Pinus strobus");
      expect(pine).toBeDefined();
      expect(pine!.maxHeight).toBe(0);
      expect(pine!.maxHeightInputFormat).toBe(0);
      expect(pine!.maxHeightTreeId).toBeNull();
      expect(pine!.maxGirthInputFormat).toBe(0);
      expect(pine!.maxGirthTreeId).toBeNull();
      expect(pine!.maxCrownSpreadInputFormat).toBe(0);
      expect(pine!.maxCrownSpreadTreeId).toBeNull();
      expect(pine!.number).toBe(1);
    });
  });

  describe("measuredSpeciesBySite (CreateObjectsAndTypes.sql:106-181)", () => {
    it("scopes the grouping to one site", async () => {
      const rowsSite1 = await measuredSpeciesBySite(site1, sql);
      const rowsSite2 = await measuredSpeciesBySite(site2, sql);
      const oakSite1Row = rowsSite1.find((r) => r.scientificName === "Quercus alba");
      const oakSite2Row = rowsSite2.find((r) => r.scientificName === "Quercus alba");
      expect(oakSite1Row!.maxHeight).toBe(150);
      expect(oakSite1Row!.number).toBe(3);
      expect(oakSite2Row!.maxHeight).toBe(200);
      expect(oakSite2Row!.number).toBe(1);
      expect(oakSite2Row!.maxHeightTreeId).toBe(oakSite2);
    });

    it("with no siteId, returns rows for every site (unfiltered, like the legacy view)", async () => {
      const rows = await measuredSpeciesBySite(undefined, sql);
      const siteIds = new Set(rows.map((r) => r.siteId));
      expect(siteIds.has(site1)).toBe(true);
      expect(siteIds.has(site2)).toBe(true);
    });
  });

  describe("measuredSpeciesByState (CreateObjectsAndTypes.sql:191-274)", () => {
    it("groups across every site in the state", async () => {
      const rows = await measuredSpeciesByState(stateId, sql);
      const oak = rows.find((r) => r.scientificName === "Quercus alba");
      expect(oak!.number).toBe(4);
      expect(oak!.maxHeight).toBe(200);
      expect(oak!.maxHeightTreeId).toBe(oakSite2);
      expect(oak!.stateId).toBe(stateId);
    });
  });
});
