import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { speciesSlug } from "../lib/slug";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./queries/test-helpers";
import type { SqlTag } from "./queries/sql-tag";
import { findUnresolvedMeasurements, SPECIES_SYNONYMS, syncSpecies, type SpeciesSynonymSeed } from "./species";

async function insertMeasurement(db: PGlite, treeId: number, scientificName: string, commonName: string): Promise<void> {
  await db.query(
    `insert into tree_measurements (
       tree_id, computed_measured_species_id, measured, common_name, scientific_name,
       height, height_input_format, height_measurement_method,
       girth, girth_input_format, crown_spread, crown_spread_input_format,
       latitude, latitude_input_format, longitude, longitude_input_format,
       calculated_latitude, calculated_longitude,
       elevation, elevation_input_format, general_comments,
       diameter, diameter_input_format, conical_volume, conical_volume_input_format
     )
     values ($1, 0, '2010-01-01', $2, $3, 0, 2, 0, 0, 2, 0, 2, 40, 2, -83, 2, 40, -83, 0, 2, '', 0, 2, 0, 2)`,
    [treeId, commonName, scientificName],
  );
}

const RENAME: SpeciesSynonymSeed = {
  from: { scientificName: "Carya alba", commonName: "Mockernut Hickory" },
  to: { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" },
  note: "test",
};

describe("species (D-019)", () => {
  let db: PGlite;
  let sql: SqlTag;
  let siteId: number;

  beforeEach(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    const stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH" });
    siteId = await insertSite(db, stateId, { name: "Test Park", county: "Franklin" });
  }, 30000);

  afterAll(async () => {
    await db?.close();
  });

  it("adds one species per distinct tree name pair, with its D-011 slug, and is idempotent", async () => {
    await insertTree(db, siteId, { scientificName: "Quercus alba", commonName: "White Oak" });
    await insertTree(db, siteId, { scientificName: "Quercus alba", commonName: "White Oak" });
    await insertTree(db, siteId, { scientificName: "Acer rubrum", commonName: "Red Maple" });

    const first = await syncSpecies(sql, []);
    expect(first.inserted).toBe(2);
    const rows = (await db.query<{ scientific_name: string; slug: string }>(
      `select scientific_name, slug from species order by scientific_name`,
    )).rows;
    expect(rows).toEqual([
      { scientific_name: "Acer rubrum", slug: speciesSlug("Acer rubrum", "Red Maple") },
      { scientific_name: "Quercus alba", slug: speciesSlug("Quercus alba", "White Oak") },
    ]);

    const again = await syncSpecies(sql, []);
    expect(again).toMatchObject({ inserted: 0, deleted: 0 });
  });

  it("removes a species no tree carries any more", async () => {
    const treeId = await insertTree(db, siteId, { scientificName: "Acer rubrum", commonName: "Red Maple" });
    await syncSpecies(sql, []);
    await db.query(`update trees set scientific_name = 'Acer saccharum', common_name = 'Sugar Maple' where id = $1`, [treeId]);

    const result = await syncSpecies(sql, []);
    expect(result).toMatchObject({ inserted: 1, deleted: 1 });
    const names = (await db.query<{ scientific_name: string }>(`select scientific_name from species`)).rows;
    expect(names.map((r) => r.scientific_name)).toEqual(["Acer saccharum"]);
  });

  it("maps a retired name pair to the species it became, and resolves its measurements", async () => {
    const treeId = await insertTree(db, siteId, { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" });
    await insertMeasurement(db, treeId, "Carya tomentosa", "Mockernut Hickory");
    await insertMeasurement(db, treeId, "Carya alba", "Mockernut Hickory");

    await syncSpecies(sql, []);
    expect(await findUnresolvedMeasurements(sql)).toEqual([
      { scientificName: "Carya alba", commonName: "Mockernut Hickory", measurements: 1, treeIds: String(treeId), legacySpeciesId: 1790989718 },
    ]);

    const result = await syncSpecies(sql, [RENAME]);
    expect(result.synonymsApplied).toBe(1);
    expect(result.synonymsStillInUse).toEqual([]);
    expect(await findUnresolvedMeasurements(sql)).toEqual([]);
    const syn = (await db.query<{ species_name: string }>(
      `select s.scientific_name as species_name from species_synonyms y join species s on s.id = y.species_id
       where y.scientific_name = 'Carya alba'`,
    )).rows;
    expect(syn).toEqual([{ species_name: "Carya tomentosa" }]);
  });

  it("keeps a species a synonym points at, and reports a synonym whose target no tree carries", async () => {
    const treeId = await insertTree(db, siteId, { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" });
    await syncSpecies(sql, [RENAME]);
    await db.query(`delete from trees where id = $1`, [treeId]);

    const kept = await syncSpecies(sql, [RENAME]);
    expect(kept.deleted).toBe(0);

    // Without the seed (and with its synonym row gone) nothing holds it.
    await db.query(`delete from species_synonyms`);
    const gone = await syncSpecies(sql, []);
    expect(gone.deleted).toBe(1);

    const missing = await syncSpecies(sql, [RENAME]);
    expect(missing.synonymsWithoutTarget).toEqual([RENAME]);
  });

  it("flags a rename only partly applied, where a tree still carries the old name", async () => {
    await insertTree(db, siteId, { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" });
    await insertTree(db, siteId, { scientificName: "Carya alba", commonName: "Mockernut Hickory" });
    const result = await syncSpecies(sql, [RENAME]);
    expect(result.synonymsStillInUse).toEqual([RENAME]);
  });

  it("D-021: matches names case-insensitively, like legacy's identity hash", async () => {
    const treeId = await insertTree(db, siteId, { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" });
    await insertMeasurement(db, treeId, "carya tomentosa", "mockernut hickory");
    await insertMeasurement(db, treeId, "CARYA ALBA", "Mockernut hickory");

    await syncSpecies(sql, [RENAME]);
    expect(await findUnresolvedMeasurements(sql)).toEqual([]);

    // A case variant of an existing species is the same species, not a new row.
    await expect(
      db.query(`insert into species (scientific_name, common_name, slug) values ('CARYA TOMENTOSA', 'Mockernut Hickory', 'x')`),
    ).rejects.toThrow(/ux_species_names/);
    // And a synonym seed differing only in case updates the existing synonym.
    const again = await syncSpecies(sql, [{ ...RENAME, from: { scientificName: "carya alba", commonName: "mockernut hickory" } }]);
    expect(again.synonymsApplied).toBe(1);
    const n = (await db.query<{ n: number }>(`select count(*)::int as n from species_synonyms`)).rows[0]!.n;
    expect(n).toBe(1);
  });

  it("seeds the two known W-107 renames", () => {
    expect(SPECIES_SYNONYMS.map((s) => s.from.scientificName)).toEqual(["Carya alba", "Quercus prinus"]);
  });
});
