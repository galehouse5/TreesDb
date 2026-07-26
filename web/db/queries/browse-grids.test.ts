import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { browseSites, browseSpecies, BROWSE_GRID_PAGE_SIZE } from "./browse-grids.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./test-helpers";

describe("browse-grids.sql: browseSites", () => {
  let db: PGlite;
  let sql: SqlTag;
  let ohioId: number;
  let alaskaId: number;
  let siteA: number; // Ohio, county "Adams", RHI5 specified, last measured 2020-01-01
  let siteB: number; // Ohio, county "Butler", RHI5 null, last measured 2021-01-01 (most recent)
  let siteC: number; // Alaska, county "Adams", RHI5 specified, last measured 2019-01-01 (oldest)

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    ohioId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH", tripleLetterCode: "OHI" });
    alaskaId = await insertState(db, countryId, { name: "Alaska", doubleLetterCode: "AK", tripleLetterCode: "ALA" });

    siteA = await insertSite(db, ohioId, { name: "Site Alpha", county: "Adams" });
    siteB = await insertSite(db, ohioId, { name: "Site Beta", county: "Butler" });
    siteC = await insertSite(db, alaskaId, { name: "Site Gamma", county: "Adams" });

    // One tree per site so computed_rhi5/last-measurement can be seeded via
    // a direct UPDATE (test-helpers.ts's insertSite has no computed_*
    // overrides -- these are app/ETL-maintained columns, doc 01 §4 D-004,
    // not something the fixture builder needs to compute).
    await insertTree(db, siteA, { lastMeasured: "2020-01-01" });
    await insertTree(db, siteB, { lastMeasured: "2021-01-01" });
    await insertTree(db, siteC, { lastMeasured: "2019-01-01" });

    await db.query(
      `update sites set computed_rhi5 = 100, computed_last_measurement_date = '2020-01-01' where id = $1`,
      [siteA],
    );
    await db.query(`update sites set computed_last_measurement_date = '2021-01-01' where id = $1`, [siteB]); // computed_rhi5 stays NULL
    await db.query(
      `update sites set computed_rhi5 = 50, computed_last_measurement_date = '2019-01-01' where id = $1`,
      [siteC],
    );
  });

  afterAll(async () => {
    await db.close();
  });

  it("defaults to LastMeasurement descending when sort is absent (SiteBrowserExtensions.cs default: branch)", async () => {
    const result = await browseSites({}, sql);
    expect(result.rows.map((r) => r.id)).toEqual([siteB, siteA, siteC]); // 2021, 2020, 2019
    expect(result.totalCount).toBe(3);
    expect(result.filteredCount).toBeNull();
  });

  it("ignores sortAscending for the default (unmatched-sort) fallback -- still descending", async () => {
    const result = await browseSites({ sortAscending: true }, sql);
    expect(result.rows.map((r) => r.id)).toEqual([siteB, siteA, siteC]);
  });

  it("is case-sensitive on the sort column name (lowercase 'state' does not match 'State')", async () => {
    const result = await browseSites({ sort: "state" }, sql);
    // Falls through to the same default (LastMeasurement desc) as no sort at all.
    expect(result.rows.map((r) => r.id)).toEqual([siteB, siteA, siteC]);
  });

  it("sorts by a real column ascending/descending once matched", async () => {
    const asc = await browseSites({ sort: "Site" }, sql);
    expect(asc.rows.map((r) => r.name)).toEqual(["Site Alpha", "Site Beta", "Site Gamma"]);

    const desc = await browseSites({ sort: "Site", sortAscending: false }, sql);
    expect(desc.rows.map((r) => r.name)).toEqual(["Site Gamma", "Site Beta", "Site Alpha"]);
  });

  it("orders NULLs first ascending / last descending on nullable numeric columns (SQL Server NULL-is-lowest semantics)", async () => {
    const asc = await browseSites({ sort: "RHI5" }, sql);
    expect(asc.rows.map((r) => r.id)).toEqual([siteB, siteC, siteA]); // null, 50, 100

    const desc = await browseSites({ sort: "RHI5", sortAscending: false }, sql);
    expect(desc.rows.map((r) => r.id)).toEqual([siteA, siteC, siteB]); // 100, 50, null
  });

  it("ANDs the three independent LIKE-Anywhere filters and reports filteredCount only when a filter was given", async () => {
    const byCounty = await browseSites({ countyFilter: "Adams" }, sql);
    expect(byCounty.rows.map((r) => r.id).sort()).toEqual([siteA, siteC].sort());
    expect(byCounty.totalCount).toBe(3);
    expect(byCounty.filteredCount).toBe(2);

    const byCountyAndState = await browseSites({ countyFilter: "Adams", stateFilter: "Ohio" }, sql);
    expect(byCountyAndState.rows.map((r) => r.id)).toEqual([siteA]);
    expect(byCountyAndState.filteredCount).toBe(1);
  });

  it("filter is a substring match (MatchMode.Anywhere), case-insensitive", async () => {
    const result = await browseSites({ siteFilter: "eta" }, sql);
    expect(result.rows.map((r) => r.id)).toEqual([siteB]);
  });

  it("an empty-string filter is treated as absent (IsNullOrEmpty gate)", async () => {
    const result = await browseSites({ siteFilter: "" }, sql);
    expect(result.filteredCount).toBeNull();
    expect(result.rows).toHaveLength(3);
  });

  it("paginates at BROWSE_GRID_PAGE_SIZE using a 0-based page index", async () => {
    expect(BROWSE_GRID_PAGE_SIZE).toBe(40);
    const page0 = await browseSites({ sort: "Site", page: 0 }, sql);
    expect(page0.rows.map((r) => r.name)).toEqual(["Site Alpha", "Site Beta", "Site Gamma"]);
    // Page far beyond the data -> empty, not an error.
    const page5 = await browseSites({ sort: "Site", page: 5 }, sql);
    expect(page5.rows).toHaveLength(0);
    expect(page5.totalCount).toBe(3);
  });

  it("clamps a negative/non-finite page to 0", async () => {
    const result = await browseSites({ sort: "Site", page: -3 }, sql);
    expect(result.rows.map((r) => r.name)).toEqual(["Site Alpha", "Site Beta", "Site Gamma"]);
  });
});

describe("browse-grids.sql: browseSpecies", () => {
  let db: PGlite;
  let sql: SqlTag;
  let siteId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId);
    siteId = await insertSite(db, stateId);

    await insertTree(db, siteId, {
      scientificName: "Quercus alba",
      commonName: "White Oak",
      height: 100,
      girth: 40,
      crownSpread: 20,
    });
    await insertTree(db, siteId, {
      scientificName: "Pinus strobus",
      commonName: "White Pine",
      height: 150,
      girth: 30,
      crownSpread: 10,
    });
    // height/girth/crownSpread all 0 -- IsValidAndSpecified() false branch
    // (Invalid InputFormat, no representative tree id) per measured-species.sql.ts.
    await insertTree(db, siteId, {
      scientificName: "Abies alba",
      commonName: "Silver Fir",
      height: 0,
      girth: 0,
      crownSpread: 0,
    });
  });

  afterAll(async () => {
    await db.close();
  });

  it("defaults to BotanicalName ascending when sort is absent (always resolves, unlike Locations)", async () => {
    const result = await browseSpecies({}, sql);
    expect(result.rows.map((r) => r.scientificName)).toEqual(["Abies alba", "Pinus strobus", "Quercus alba"]);
    expect(result.totalCount).toBe(3);
    expect(result.filteredCount).toBeNull();
  });

  it("honors sortAscending even when sort itself doesn't match (unlike Locations' hardcoded default)", async () => {
    const result = await browseSpecies({ sortAscending: false }, sql);
    expect(result.rows.map((r) => r.scientificName)).toEqual(["Quercus alba", "Pinus strobus", "Abies alba"]);
  });

  it("is case-sensitive on the sort column name", async () => {
    const result = await browseSpecies({ sort: "botanicalname" }, sql);
    // Falls back to the BotanicalName default (ascending), same as no sort.
    expect(result.rows.map((r) => r.scientificName)).toEqual(["Abies alba", "Pinus strobus", "Quercus alba"]);
  });

  it("sorts by MaxHeight (a raw, always-non-null numeric column) both directions, 0 sorting like any other value", async () => {
    const asc = await browseSpecies({ sort: "MaxHeight" }, sql);
    expect(asc.rows.map((r) => r.scientificName)).toEqual(["Abies alba", "Quercus alba", "Pinus strobus"]);

    const desc = await browseSpecies({ sort: "MaxHeight", sortAscending: false }, sql);
    expect(desc.rows.map((r) => r.scientificName)).toEqual(["Pinus strobus", "Quercus alba", "Abies alba"]);
  });

  it("ANDs the two independent LIKE-Anywhere filters and reports filteredCount only when given", async () => {
    const result = await browseSpecies({ commonNameFilter: "White" }, sql);
    expect(result.rows.map((r) => r.scientificName).sort()).toEqual(["Pinus strobus", "Quercus alba"]);
    expect(result.totalCount).toBe(3);
    expect(result.filteredCount).toBe(2);
  });

  it("D-010: a literal % in the filter term acts as a SQL wildcard, not a literal character", async () => {
    // "%lba" should match anything ending in "lba" (Abies alba, Quercus alba),
    // exactly like ILIKE '%' + '%lba' + '%' would -- NOT require a literal '%' in the name.
    const result = await browseSpecies({ botanicalNameFilter: "%lba" }, sql);
    expect(result.rows.map((r) => r.scientificName).sort()).toEqual(["Abies alba", "Quercus alba"]);
  });

  it("paginates at BROWSE_GRID_PAGE_SIZE using a 0-based page index", async () => {
    const page1 = await browseSpecies({ sort: "BotanicalName", page: 1 }, sql);
    expect(page1.rows).toHaveLength(0); // only 3 rows, page size 40
    expect(page1.totalCount).toBe(3);
  });
});
