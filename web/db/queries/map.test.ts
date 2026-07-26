import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Units } from "@/lib/units/format";
import {
  allSiteMarkers,
  allStateMarkers,
  allTreeMarkers,
  siteMarker,
  siteMarkerInfo,
  stateMarkerInfo,
  treeMarker,
  treeMarkerInfo,
} from "./map.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertSite, insertState, insertTree, pgliteSqlTag } from "./test-helpers";

/** `UPDATE`s beyond what test-helpers.ts's baseline inserters expose -- kept local to this file per file-ownership (test-helpers.ts is shared, owned by another task). */
async function updateState(
  db: PGlite,
  id: number,
  cols: Partial<{
    neLatitude: number;
    neLongitude: number;
    swLatitude: number;
    swLongitude: number;
    computedTreesMeasuredCount: number | null;
    computedContainsEntityWithCoordinates: boolean | null;
    computedRhi5: number | null;
    computedRgi5: number | null;
    computedLastMeasurementDate: string | null;
  }>,
): Promise<void> {
  await db.query(
    `update states set
       ne_latitude = coalesce($2, ne_latitude), ne_longitude = coalesce($3, ne_longitude),
       sw_latitude = coalesce($4, sw_latitude), sw_longitude = coalesce($5, sw_longitude),
       computed_trees_measured_count = $6, computed_contains_entity_with_coordinates = $7,
       computed_rhi5 = $8, computed_rgi5 = $9, computed_last_measurement_date = $10
     where id = $1`,
    [
      id,
      cols.neLatitude ?? null,
      cols.neLongitude ?? null,
      cols.swLatitude ?? null,
      cols.swLongitude ?? null,
      cols.computedTreesMeasuredCount ?? null,
      cols.computedContainsEntityWithCoordinates ?? null,
      cols.computedRhi5 ?? null,
      cols.computedRgi5 ?? null,
      cols.computedLastMeasurementDate ?? null,
    ],
  );
}

async function updateSite(
  db: PGlite,
  id: number,
  cols: Partial<{
    calculatedLatitudeInputFormat: number;
    calculatedLongitudeInputFormat: number;
    computedContainsEntityWithCoordinates: boolean | null;
    computedRhi5: number | null;
    computedTreesMeasuredCount: number | null;
    computedLastMeasurementDate: string | null;
    ownershipType: string;
  }>,
): Promise<void> {
  await db.query(
    `update sites set
       calculated_latitude_input_format = coalesce($2, calculated_latitude_input_format),
       calculated_longitude_input_format = coalesce($3, calculated_longitude_input_format),
       computed_contains_entity_with_coordinates = $4,
       computed_rhi5 = $5, computed_trees_measured_count = $6, computed_last_measurement_date = $7,
       ownership_type = coalesce($8, ownership_type)
     where id = $1`,
    [
      id,
      cols.calculatedLatitudeInputFormat ?? null,
      cols.calculatedLongitudeInputFormat ?? null,
      cols.computedContainsEntityWithCoordinates ?? null,
      cols.computedRhi5 ?? null,
      cols.computedTreesMeasuredCount ?? null,
      cols.computedLastMeasurementDate ?? null,
      cols.ownershipType ?? null,
    ],
  );
}

async function updateTree(
  db: PGlite,
  id: number,
  cols: Partial<{
    latitudeInputFormat: number;
    longitudeInputFormat: number;
    calculatedLatitude: number;
    calculatedLongitude: number;
    heightInputFormat: number;
    girthInputFormat: number;
    crownSpreadInputFormat: number;
    entspts: number | null;
    entspts2: number | null;
    championPoints: number | null;
    abbreviatedChampionPoints: number | null;
  }>,
): Promise<void> {
  await db.query(
    `update trees set
       latitude_input_format = coalesce($2, latitude_input_format),
       longitude_input_format = coalesce($3, longitude_input_format),
       calculated_latitude = coalesce($4, calculated_latitude),
       calculated_longitude = coalesce($5, calculated_longitude),
       height_input_format = coalesce($6, height_input_format),
       girth_input_format = coalesce($7, girth_input_format),
       crown_spread_input_format = coalesce($8, crown_spread_input_format),
       entspts = $9, entspts2 = $10, champion_points = $11, abbreviated_champion_points = $12
     where id = $1`,
    [
      id,
      cols.latitudeInputFormat ?? null,
      cols.longitudeInputFormat ?? null,
      cols.calculatedLatitude ?? null,
      cols.calculatedLongitude ?? null,
      cols.heightInputFormat ?? null,
      cols.girthInputFormat ?? null,
      cols.crownSpreadInputFormat ?? null,
      cols.entspts ?? null,
      cols.entspts2 ?? null,
      cols.championPoints ?? null,
      cols.abbreviatedChampionPoints ?? null,
    ],
  );
}

async function insertPhotoReference(db: PGlite, owner: { siteId?: number; treeId?: number }): Promise<number> {
  const photo = await db.query<{ id: number }>(
    `insert into photos (created, width, height, bytes, format) values (now(), 100, 100, 1, 1) returning id`,
  );
  const photoId = photo.rows[0]!.id;
  const type = owner.siteId != null ? 4 : 6;
  await db.query(
    `insert into photo_references (type, site_id, tree_id, photo_id) values ($1, $2, $3, $4)`,
    [type, owner.siteId ?? null, owner.treeId ?? null, photoId],
  );
  return photoId;
}

describe("map.sql (MapController.cs, MapMarkerModel.cs:16-28, MapMapping.cs:63-106)", () => {
  let db: PGlite;
  let sql: SqlTag;
  let countryId: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    countryId = await insertCountry(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("allStateMarkers", () => {
    it("filters on computed_trees_measured_count > 0, excludes null/zero", async () => {
      const included = await insertState(db, countryId, { name: "Included", doubleLetterCode: "IN", tripleLetterCode: "INC" });
      await updateState(db, included, { computedTreesMeasuredCount: 5 });
      const zero = await insertState(db, countryId, { name: "Zero", doubleLetterCode: "ZE", tripleLetterCode: "ZER" });
      await updateState(db, zero, { computedTreesMeasuredCount: 0 });
      const nullCount = await insertState(db, countryId, { name: "NullCount", doubleLetterCode: "NC", tripleLetterCode: "NUL" });
      await updateState(db, nullCount, { computedTreesMeasuredCount: null });

      const markers = await allStateMarkers(sql);
      const ids = markers.map((m) => m.id);
      expect(ids).toContain(included);
      expect(ids).not.toContain(zero);
      expect(ids).not.toContain(nullCount);
    });

    it("zoom band: MinZoom 0 always; MaxZoom 6 normally, 30 when ComputedContainsEntityWithCoordinates is false", async () => {
      const withCoords = await insertState(db, countryId, { name: "WithCoords", doubleLetterCode: "WC", tripleLetterCode: "WIC" });
      await updateState(db, withCoords, { computedTreesMeasuredCount: 1, computedContainsEntityWithCoordinates: true });
      const withoutCoords = await insertState(db, countryId, { name: "WithoutCoords", doubleLetterCode: "WO", tripleLetterCode: "WOC" });
      await updateState(db, withoutCoords, { computedTreesMeasuredCount: 1, computedContainsEntityWithCoordinates: false });
      const nullFlag = await insertState(db, countryId, { name: "NullFlag", doubleLetterCode: "NF", tripleLetterCode: "NFL" });
      await updateState(db, nullFlag, { computedTreesMeasuredCount: 1, computedContainsEntityWithCoordinates: null });

      const markers = await allStateMarkers(sql);
      const byId = new Map(markers.map((m) => [m.id, m]));
      expect(byId.get(withCoords)).toMatchObject({ minZoom: 0, maxZoom: 6 });
      expect(byId.get(withoutCoords)).toMatchObject({ minZoom: 0, maxZoom: 30 });
      // Nullable-bool `== false` in C# is false for null too -> defaults to the 6 branch.
      expect(byId.get(nullFlag)).toMatchObject({ minZoom: 0, maxZoom: 6 });
    });

    it("Title = state name; Position = bounds center (CoordinateBounds.cs:104-107); default icon, no query string", async () => {
      const id = await insertState(db, countryId, { name: "Boundtown", doubleLetterCode: "BT", tripleLetterCode: "BND" });
      await updateState(db, id, {
        computedTreesMeasuredCount: 1,
        neLatitude: 42,
        neLongitude: -80,
        swLatitude: 40,
        swLongitude: -84,
      });
      const markers = await allStateMarkers(sql);
      const marker = markers.find((m) => m.id === id);
      expect(marker?.title).toBe("Boundtown");
      expect(marker?.latitude).toBeCloseTo(41, 5);
      expect(marker?.longitude).toBeCloseTo(-82, 5);
      expect(marker?.iconUrl).toBe("/images/icons/State32.png");
    });
  });

  describe("allSiteMarkers", () => {
    it("filters on CalculatedCoordinates.IsSpecified (OR of lat/lng input format != Unspecified(1))", async () => {
      const stateId = await insertState(db, countryId);
      const bothUnspecified = await insertSite(db, stateId, { name: "BothUnspecified" });
      await updateSite(db, bothUnspecified, { calculatedLatitudeInputFormat: 1, calculatedLongitudeInputFormat: 1 });
      const oneSpecified = await insertSite(db, stateId, { name: "OneSpecified" });
      // OR semantics: latitude unspecified but longitude specified -> still included.
      await updateSite(db, oneSpecified, { calculatedLatitudeInputFormat: 1, calculatedLongitudeInputFormat: 2 });
      const bothSpecified = await insertSite(db, stateId, { name: "BothSpecified" });
      await updateSite(db, bothSpecified, { calculatedLatitudeInputFormat: 2, calculatedLongitudeInputFormat: 2 });

      const markers = await allSiteMarkers(sql);
      const ids = markers.map((m) => m.id);
      expect(ids).not.toContain(bothUnspecified);
      expect(ids).toContain(oneSpecified);
      expect(ids).toContain(bothSpecified);
    });

    it("zoom band: MinZoom 7 always; MaxZoom 13 normally, 30 when ComputedContainsEntityWithCoordinates is false", async () => {
      const stateId = await insertState(db, countryId);
      const normal = await insertSite(db, stateId, { name: "Normal13" });
      await updateSite(db, normal, { computedContainsEntityWithCoordinates: true });
      const noCoords = await insertSite(db, stateId, { name: "NoCoords30" });
      await updateSite(db, noCoords, { computedContainsEntityWithCoordinates: false });

      const markers = await allSiteMarkers(sql);
      const byId = new Map(markers.map((m) => [m.id, m]));
      expect(byId.get(normal)).toMatchObject({ minZoom: 7, maxZoom: 13 });
      expect(byId.get(noCoords)).toMatchObject({ minZoom: 7, maxZoom: 30 });
    });

    it("icon: default '/images/icons/Site32.png?v=2' with no photos; first photo's SmallMapSquare variant otherwise", async () => {
      const stateId = await insertState(db, countryId);
      const noPhoto = await insertSite(db, stateId, { name: "NoPhoto" });
      const withPhoto = await insertSite(db, stateId, { name: "WithPhoto" });
      const photoId = await insertPhotoReference(db, { siteId: withPhoto });

      const markers = await allSiteMarkers(sql);
      const byId = new Map(markers.map((m) => [m.id, m]));
      expect(byId.get(noPhoto)?.iconUrl).toBe("/images/icons/Site32.png?v=2");
      expect(byId.get(withPhoto)?.iconUrl).toBe(`/photos/${photoId}/SmallMapSquare`);
    });

    it("siteMarker(id) has no filter -- returns even an unspecified-coordinates site", async () => {
      const stateId = await insertState(db, countryId);
      const id = await insertSite(db, stateId, { name: "AnyId" });
      await updateSite(db, id, { calculatedLatitudeInputFormat: 1, calculatedLongitudeInputFormat: 1 });
      const marker = await siteMarker(id, sql);
      expect(marker?.title).toBe("AnyId");
      const all = await allSiteMarkers(sql);
      expect(all.map((m) => m.id)).not.toContain(id);
    });
  });

  describe("allTreeMarkers", () => {
    it("filters on the RAW Coordinates.IsSpecified (latitude_input_format/longitude_input_format), NOT CalculatedCoordinates", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      // Raw unspecified, calculated specified -> excluded (filter reads the RAW columns).
      const rawUnspecified = await insertTree(db, siteId, { scientificName: "Rawus unspecificus" });
      await updateTree(db, rawUnspecified, { latitudeInputFormat: 1, longitudeInputFormat: 1, calculatedLatitude: 41, calculatedLongitude: -83 });
      // Raw specified -> included regardless of calculated format.
      const rawSpecified = await insertTree(db, siteId, { scientificName: "Rawus specificus" });
      await updateTree(db, rawSpecified, { latitudeInputFormat: 2, longitudeInputFormat: 2 });

      const markers = await allTreeMarkers(sql);
      const ids = markers.map((m) => m.id);
      expect(ids).not.toContain(rawUnspecified);
      expect(ids).toContain(rawSpecified);
    });

    it("Position uses CalculatedCoordinates (may differ from raw Coordinates); Title = scientific name, MinZoom 14, MaxZoom 30", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      const id = await insertTree(db, siteId, { scientificName: "Quercus alba", commonName: "White Oak" });
      await updateTree(db, id, { latitudeInputFormat: 2, longitudeInputFormat: 2, calculatedLatitude: 39.5, calculatedLongitude: -82.5 });

      const markers = await allTreeMarkers(sql);
      const marker = markers.find((m) => m.id === id);
      expect(marker?.title).toBe("Quercus alba"); // scientific name, not "White Oak"
      expect(marker?.latitude).toBeCloseTo(39.5, 5);
      expect(marker?.longitude).toBeCloseTo(-82.5, 5);
      expect(marker).toMatchObject({ minZoom: 14, maxZoom: 30 });
      expect(marker?.iconUrl).toBe("/images/icons/Tree32.png");
    });

    it("icon: first photo's SmallMapSquare variant when present", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      const id = await insertTree(db, siteId, { scientificName: "Pinus strobus" });
      await updateTree(db, id, { latitudeInputFormat: 2, longitudeInputFormat: 2 });
      const photoId = await insertPhotoReference(db, { treeId: id });

      const marker = await treeMarker(id, sql);
      expect(marker?.iconUrl).toBe(`/photos/${photoId}/SmallMapSquare`);
    });
  });

  describe("stateMarkerInfo", () => {
    it("RHI/RGI rows omitted entirely when null; Country/TreesMeasured/LastMeasurementDate always present", async () => {
      const id = await insertState(db, countryId, { name: "InfoState", doubleLetterCode: "IS", tripleLetterCode: "INS" });
      await updateState(db, id, { computedTreesMeasuredCount: 42, computedRhi5: null, computedLastMeasurementDate: "2020-06-15" });

      const info = await stateMarkerInfo(id, Units.Default, sql);
      expect(info?.name).toBe("InfoState");
      expect(info?.detailsLink).toEqual({ text: "View more details", href: `/states/${id}` });
      expect(info?.rows.Country).toBe("United States");
      expect(info?.rows).not.toHaveProperty("RHI5");
      expect(info?.rows["Trees measured"]).toBe("42");
      expect(info?.rows["Last measurement date"]).toBe("06/15/2020");
    });

    it("RHI5 present and formatted per format.ts's formatRuckerIndex when specified", async () => {
      const id = await insertState(db, countryId, { name: "RhiState", doubleLetterCode: "RH", tripleLetterCode: "RHI" });
      await updateState(db, id, { computedTreesMeasuredCount: 1, computedRhi5: 141.02 });
      const info = await stateMarkerInfo(id, Units.Default, sql);
      expect(info?.rows.RHI5).toBe("141.02");
    });

    it("returns null for an unknown id", async () => {
      expect(await stateMarkerInfo(999999, Units.Default, sql)).toBeNull();
    });
  });

  describe("siteMarkerInfo", () => {
    it('State row formats as "{Name} ({Country.Code})"; photos array reflects photo_references', async () => {
      const stateId = await insertState(db, countryId, { name: "Ohio", doubleLetterCode: "OH", tripleLetterCode: "OHI" });
      const siteId = await insertSite(db, stateId, { name: "Johnson's Woods", county: "Wayne" });
      await updateSite(db, siteId, { ownershipType: "State", computedRhi5: 116.12, computedTreesMeasuredCount: 9 });
      const photoId = await insertPhotoReference(db, { siteId });

      const info = await siteMarkerInfo(siteId, Units.Default, sql);
      // State.cshtml renders "{Name} ({Country.Code})" -- the COUNTRY's code
      // (insertCountry's default fixture is "US"), not the state's own
      // double-letter code ("OH").
      expect(info?.rows.State).toBe("Ohio (US)");
      expect(info?.rows.County).toBe("Wayne");
      expect(info?.rows["Ownership type"]).toBe("State");
      expect(info?.rows.RHI5).toBe("116.12");
      expect(info?.rows["Trees measured"]).toBe("9");
      expect(info?.photos).toEqual([{ thumbnailSrc: `/photos/${photoId}/Square` }]);
    });
  });

  describe("treeMarkerInfo", () => {
    it("Height/Girth/CrownSpread are IfSpecified-gated on the tree's own input formats; Elevation is never included", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      const id = await insertTree(db, siteId, { scientificName: "Sequoia sempervirens", commonName: "Redwood", height: 300, girth: 50, crownSpread: 0 });
      await updateTree(db, id, {
        latitudeInputFormat: 2,
        longitudeInputFormat: 2,
        heightInputFormat: 2,
        girthInputFormat: 2,
        crownSpreadInputFormat: 1, // unspecified -> row omitted
      });

      const info = await treeMarkerInfo(id, Units.Default, sql);
      expect(info?.scientificName).toBe("Sequoia sempervirens");
      expect(info?.rows["Common name"]).toBe("Redwood");
      expect(info?.rows.Height).toBe("300.0'");
      expect(info?.rows.Girth).toBe("600''"); // SubprefixOnly: 50ft * 12 = 600 inches
      expect(info?.rows).not.toHaveProperty("Crown spread");
      expect(info?.rows).not.toHaveProperty("Elevation");
    });

    it("Champion points wins over the abbreviated variant when both are present; abbreviated shown when exact is absent", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      const both = await insertTree(db, siteId, { scientificName: "Abies both" });
      await updateTree(db, both, { latitudeInputFormat: 2, longitudeInputFormat: 2, championPoints: 259.4, abbreviatedChampionPoints: 200.1 });
      const abbrevOnly = await insertTree(db, siteId, { scientificName: "Abies abbrev" });
      await updateTree(db, abbrevOnly, { latitudeInputFormat: 2, longitudeInputFormat: 2, championPoints: null, abbreviatedChampionPoints: 199.99 });

      const bothInfo = await treeMarkerInfo(both, Units.Default, sql);
      expect(bothInfo?.rows["Champion points"]).toBe("259.40");
      expect(bothInfo?.rows).not.toHaveProperty("Champion points (abbreviated)");

      const abbrevInfo = await treeMarkerInfo(abbrevOnly, Units.Default, sql);
      expect(abbrevInfo?.rows["Champion points (abbreviated)"]).toBe("199.99");
    });

    it("TDI2 computed against the CURRENT global max height/girth for the (scientificName, commonName) pair", async () => {
      const stateId = await insertState(db, countryId);
      const siteId = await insertSite(db, stateId);
      // Two trees sharing a species pair; the smaller one's TDI2 is computed against the larger one's max.
      const tall = await insertTree(db, siteId, { scientificName: "Tdius maximus", commonName: "Tester", height: 100, girth: 20 });
      await updateTree(db, tall, { latitudeInputFormat: 2, longitudeInputFormat: 2, heightInputFormat: 2, girthInputFormat: 2 });
      const shorter = await insertTree(db, siteId, { scientificName: "Tdius maximus", commonName: "Tester", height: 50, girth: 10 });
      await updateTree(db, shorter, { latitudeInputFormat: 2, longitudeInputFormat: 2, heightInputFormat: 2, girthInputFormat: 2 });

      const info = await treeMarkerInfo(shorter, Units.Default, sql);
      // TDI2 = height/maxHeight + girth/maxGirth = 50/100 + 10/20 = 1.00
      expect(info?.rows.TDI2).toBe("1.00");
    });

    it("returns null for an unknown id", async () => {
      expect(await treeMarkerInfo(999999, Units.Default, sql)).toBeNull();
    });
  });
});
