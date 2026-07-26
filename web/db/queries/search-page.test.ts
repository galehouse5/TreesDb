import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { searchPage } from "./search-page.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./test-helpers";

describe("search-page.sql (SearchController.Index composition, doc 03 P1-09)", () => {
  let db: PGlite;
  let sql: SqlTag;

  let ohio: number;
  let idaho: number;
  let siteOak: number;
  let siteOakville: number;
  let siteBigOak: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);

    ohio = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH", tripleLetterCode: "OHI" });
    idaho = await insertState(db, countryId, { name: "Idaho", doubleLetterCode: "ID", tripleLetterCode: "IDA" });

    siteOak = await insertSite(db, ohio, { name: "Oak", county: "Ash" });
    siteOakville = await insertSite(db, ohio, { name: "Oakville", county: "Elm" });
    siteBigOak = await insertSite(db, idaho, { name: "Big Oak", county: "Ash" });

    const speciesSite = await insertSite(db, ohio, { name: "Species Site" });
    await insertTree(db, speciesSite, { scientificName: "Quercus alba", commonName: "White Oak" });
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("composes states/sites/species in rank order with joined entity data", async () => {
    const result = await searchPage("oak", 25, sql);

    // States: "oak" doesn't match Ohio/Oheo/Idaho names or codes -- none.
    expect(result.states).toEqual([]);

    // Sites: rank desc (site "Oak" ranks highest -- exact name match on all
    // 3 flags), each carrying its joined state name + country name.
    expect(result.sites).toHaveLength(3);
    expect(result.sites[0]).toMatchObject({ kind: "site", id: siteOak, name: "Oak", county: "Ash", stateId: ohio, stateName: "Ohio" });
    expect(result.sites.some((s) => s.id === siteOakville)).toBe(true);
    expect(result.sites.some((s) => s.id === siteBigOak)).toBe(true);

    // Species: "Quercus alba" / "White Oak" matches on common-name contains.
    expect(result.species).toEqual([{ kind: "species", scientificName: "Quercus alba", commonName: "White Oak" }]);

    expect(result.hasAllResults).toBe(true);
  });

  it("computes hasAllResults against the FULL ranked list, before slicing", async () => {
    // Cap of 1: 3 sites match "oak" (> 1), so hasAllResults must be false,
    // and the sliced list must contain exactly the top-ranked site.
    const result = await searchPage("oak", 1, sql);
    expect(result.sites).toHaveLength(1);
    expect(result.sites[0]!.id).toBe(siteOak);
    expect(result.hasAllResults).toBe(false);
  });

  it("returns state rows with country name via the country join", async () => {
    const result = await searchPage("oh", 25, sql);
    expect(result.states.some((s) => s.id === ohio)).toBe(true);
    const ohioRow = result.states.find((s) => s.id === ohio);
    expect(ohioRow).toMatchObject({ kind: "state", name: "Ohio", countryName: "United States" });
  });

  it("returns empty categories (and hasAllResults true) for a term matching nothing", async () => {
    const result = await searchPage("zzz_no_such_term_zzz", 25, sql);
    expect(result.states).toEqual([]);
    expect(result.sites).toEqual([]);
    expect(result.species).toEqual([]);
    expect(result.hasAllResults).toBe(true);
  });
});
