/**
 * P3-05 import-trees.sql.ts tests (pglite, doc 05 §P3-05, doc 01 §10).
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTrip } from "./import-drafts.sql";
import {
  TreeAccessError,
  addTrunk,
  createSingleTrunkTree,
  getTree,
  initializeTreesForTrip,
  listAllSiteTreesForTrip,
  listTreesBySite,
  listTrunksByTree,
  removeTree,
  removeTrunk,
  updateTree,
  updateTrunk,
} from "./import-trees.sql";
import { ImportTreeType, TreeAgeClass, TreeAgeType, TreeFormType, TreeHeightMeasurementMethod, TreeStatus, TreeTerrainType } from "../../lib/import-trees";
import { DistanceFormat, ElevationFormat } from "../../lib/units/parse";
import { CoordinatesFormat } from "../../lib/units/parse-coordinates";
import type { SqlTag } from "./sql-tag";
import { createTestDb, pgliteSqlTag } from "./test-helpers";

// Local, test-only insert helpers -- kept in this file per this task's file
// ownership boundary (only import-trees.sql.ts (+ test) is owned here), same
// pattern as import-drafts.test.ts.

async function insertUser(db: PGlite, email: string): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into users (
       email, firstname, lastname, roles,
       password_hash, password_algo, password_argon2,
       password_numerics, password_uppercase, password_lowercase, password_specials, password_length,
       created, last_login, email_verification_token, email_verified,
       recently_failed_login_attempts, last_failed_login_attempt
     ) values (
       $1, 'Test', 'User', 3,
       $2, 'argon2id', null,
       0, 0, 0, 0, 0,
       now(), now(), $3, now(),
       0, null
     ) returning id`,
    [email, Buffer.alloc(32), Buffer.alloc(32)],
  );
  return r.rows[0]!.id;
}

async function insertImportSite(db: PGlite, tripId: number, name: string): Promise<number> {
  const r = await db.query<{ id: number }>(
    `insert into import_sites (
       created, trip_id, name, county, ownership_type, ownership_contact_info,
       make_ownership_contact_info_public, latitude, latitude_input_format,
       longitude, longitude_input_format, comments
     ) values (
       now(), $1, $2, '', '', '',
       false, 0, 1,
       0, 1, ''
     ) returning id`,
    [tripId, name],
  );
  return r.rows[0]!.id;
}

const baseUpdateFields = {
  type: ImportTreeType.SingleTrunk,
  commonName: "White Oak",
  scientificName: "Quercus alba",
  status: TreeStatus.Native,
  ageClass: TreeAgeClass.Mature,
  ageType: TreeAgeType.Estimate,
  age: 100,
  height: 100,
  heightInputFormat: DistanceFormat.DecimalFeet,
  heightMeasurementMethod: TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine,
  girth: 200,
  girthInputFormat: DistanceFormat.DecimalFeet,
  combinedGirthNumberOfTrunks: null,
  crownSpread: 50,
  crownSpreadInputFormat: DistanceFormat.DecimalFeet,
  elevation: 1000,
  elevationInputFormat: ElevationFormat.DecimalFeet,
  terrainType: TreeTerrainType.HillTop,
  formType: TreeFormType.Single,
  numberOfTrunks: 1,
  latitude: 41.5,
  latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
  longitude: -81.5,
  longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
  generalComments: "A fine tree.",
};

describe("import-trees.sql", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  async function makeTripWithSite(): Promise<{ userId: number; tripId: number; siteId: number }> {
    const userId = await insertUser(db, `u${Math.random().toString(36).slice(2)}@example.com`);
    const tripId = await createTrip(userId, new Date("2026-01-01T00:00:00Z"), sql);
    const siteId = await insertImportSite(db, tripId, "Test Park");
    return { userId, tripId, siteId };
  }

  describe("createSingleTrunkTree (SingleTrunkTree.Create defaults)", () => {
    it("inserts a blank single-trunk tree seeded from trip defaults", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      await sql`update import_trips set default_height_measurement_method = ${TreeHeightMeasurementMethod.LongMeasuringPole} where id = ${tripId}`;

      const now = new Date("2026-02-01T00:00:00Z");
      const treeId = await createSingleTrunkTree(tripId, siteId, null, now, sql);

      const tree = await getTree(tripId, treeId, sql);
      expect(tree).not.toBeNull();
      expect(tree!.type).toBe(ImportTreeType.SingleTrunk);
      expect(tree!.commonName).toBe("");
      expect(tree!.status).toBe(TreeStatus.NotSpecified);
      expect(tree!.heightInputFormat).toBe(DistanceFormat.Unspecified);
      expect(tree!.formType).toBe(TreeFormType.Single);
      expect(tree!.numberOfTrunks).toBe(1);
      // SingleTrunkTree.Create: HeightMeasurementMethod <- site.Trip.DefaultHeightMeasurementMethod.
      expect(tree!.heightMeasurementMethod).toBe(TreeHeightMeasurementMethod.LongMeasuringPole);

      const trip = await sql<{ last_saved: Date }>`select last_saved from import_trips where id = ${tripId}`;
      expect(new Date(trip[0]!.last_saved).getTime()).toBe(now.getTime());
    });

    it("rejects a siteId that doesn't belong to tripId", async () => {
      const { tripId: tripA } = await makeTripWithSite();
      const { siteId: siteB } = await makeTripWithSite();
      await expect(createSingleTrunkTree(tripA, siteB, null, new Date(), sql)).rejects.toBeInstanceOf(TreeAccessError);
    });
  });

  describe("initializeTreesForTrip (Trip.InitializeTrees, Trip.cs:108-114)", () => {
    it("adds one blank tree to every site with zero trees, and is idempotent", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const siteId2 = await insertImportSite(db, tripId, "Second Site");

      await initializeTreesForTrip(tripId, new Date("2026-01-05T00:00:00Z"), sql);
      const bySite = await listAllSiteTreesForTrip(tripId, sql);
      expect(bySite[siteId]).toHaveLength(1);
      expect(bySite[siteId2]).toHaveLength(1);

      // Second call is a no-op -- sites already have a tree.
      await initializeTreesForTrip(tripId, new Date("2026-01-06T00:00:00Z"), sql);
      const bySiteAgain = await listAllSiteTreesForTrip(tripId, sql);
      expect(bySiteAgain[siteId]).toHaveLength(1);
      expect(bySiteAgain[siteId2]).toHaveLength(1);
    });

    it("does not touch a site that already has a tree", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await initializeTreesForTrip(tripId, new Date(), sql);
      const trees = await listTreesBySite(siteId, sql);
      expect(trees.map((t) => t.id)).toEqual([treeId]);
    });
  });

  describe("updateTree (SaveTree, ImportController.cs:236-264)", () => {
    it("updates every mapped field and stamps last_saved", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date("2026-01-01T00:00:00Z"), sql);

      const now = new Date("2026-03-01T00:00:00Z");
      await updateTree(tripId, treeId, baseUpdateFields, now, sql);

      const tree = await getTree(tripId, treeId, sql);
      expect(tree!.commonName).toBe("White Oak");
      expect(tree!.scientificName).toBe("Quercus alba");
      expect(tree!.status).toBe(TreeStatus.Native);
      expect(tree!.height).toBe(100);
      expect(tree!.heightInputFormat).toBe(DistanceFormat.DecimalFeet);
      expect(tree!.girth).toBe(200);
      expect(tree!.terrainType).toBe(TreeTerrainType.HillTop);
      expect(tree!.latitude).toBe(41.5);

      const trip = await sql<{ last_saved: Date }>`select last_saved from import_trips where id = ${tripId}`;
      expect(new Date(trip[0]!.last_saved).getTime()).toBe(now.getTime());

      // TreeBase.SetTripDefaults (TreeBase.cs:81-86): tree's HeightMeasurementMethod
      // propagates back onto the trip default.
      const tripRow = await sql<{ default_height_measurement_method: number }>`
        select default_height_measurement_method from import_trips where id = ${tripId}
      `;
      expect(tripRow[0]!.default_height_measurement_method).toBe(TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine);
    });

    it("switching to single-trunk deletes existing trunk rows", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);
      await addTrunk(tripId, treeId, null, new Date(), sql);
      await addTrunk(tripId, treeId, null, new Date(), sql);
      expect(await listTrunksByTree(treeId, sql)).toHaveLength(2);

      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.SingleTrunk }, new Date(), sql);
      expect(await listTrunksByTree(treeId, sql)).toHaveLength(0);
    });

    it("rejects a treeId that doesn't belong to tripId (auth scoping)", async () => {
      const { tripId: tripA, siteId: siteA } = await makeTripWithSite();
      const { tripId: tripB } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripA, siteA, null, new Date(), sql);

      await expect(updateTree(tripB, treeId, baseUpdateFields, new Date(), sql)).rejects.toBeInstanceOf(TreeAccessError);
      // getTree from the wrong trip returns null, not the other trip's row.
      expect(await getTree(tripB, treeId, sql)).toBeNull();
    });
  });

  describe("removeTree (Site.RemoveTree, Site.cs:128-129) + trunk cascade", () => {
    it("deletes the tree and cascades to its trunks", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);
      const trunkId1 = await addTrunk(tripId, treeId, null, new Date(), sql);
      const trunkId2 = await addTrunk(tripId, treeId, null, new Date(), sql);
      expect(await listTrunksByTree(treeId, sql)).toHaveLength(2);

      await removeTree(tripId, treeId, new Date("2026-04-01T00:00:00Z"), sql);

      expect(await getTree(tripId, treeId, sql)).toBeNull();
      const orphanTrunks = await sql<{ id: number }>`select id from import_trunks where id in (${trunkId1}, ${trunkId2})`;
      expect(orphanTrunks).toHaveLength(0);

      const trip = await sql<{ last_saved: Date }>`select last_saved from import_trips where id = ${tripId}`;
      expect(new Date(trip[0]!.last_saved).getTime()).toBe(new Date("2026-04-01T00:00:00Z").getTime());
    });

    it("rejects a treeId that doesn't belong to tripId", async () => {
      const { tripId: tripA, siteId: siteA } = await makeTripWithSite();
      const { tripId: tripB } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripA, siteA, null, new Date(), sql);
      await expect(removeTree(tripB, treeId, new Date(), sql)).rejects.toBeInstanceOf(TreeAccessError);
      expect(await getTree(tripA, treeId, sql)).not.toBeNull(); // untouched
    });
  });

  describe("addTrunk / removeTrunk / updateTrunk (Trunk.Create, Trunk.cs:39-50)", () => {
    it("only allows adding trunks to multi-trunk trees", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await expect(addTrunk(tripId, treeId, null, new Date(), sql)).rejects.toBeInstanceOf(TreeAccessError);
    });

    it("adds a blank trunk with Unspecified formats", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);

      const now = new Date("2026-05-01T00:00:00Z");
      const trunkId = await addTrunk(tripId, treeId, null, now, sql);
      const trunks = await listTrunksByTree(treeId, sql);
      expect(trunks).toHaveLength(1);
      expect(trunks[0]!.id).toBe(trunkId);
      expect(trunks[0]!.girthInputFormat).toBe(DistanceFormat.Unspecified);
      expect(trunks[0]!.heightInputFormat).toBe(DistanceFormat.Unspecified);

      const trip = await sql<{ last_saved: Date }>`select last_saved from import_trips where id = ${tripId}`;
      expect(new Date(trip[0]!.last_saved).getTime()).toBe(now.getTime());
    });

    it("updates a trunk's fields", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);
      const trunkId = await addTrunk(tripId, treeId, null, new Date(), sql);

      await updateTrunk(
        tripId,
        trunkId,
        {
          girth: 42,
          girthInputFormat: DistanceFormat.DecimalFeet,
          girthMeasurementHeight: 4.5,
          girthMeasurementHeightInputFormat: DistanceFormat.DecimalFeet,
          height: 80,
          heightInputFormat: DistanceFormat.DecimalFeet,
          trunkComments: "North trunk",
        },
        new Date(),
        sql,
      );

      const trunks = await listTrunksByTree(treeId, sql);
      expect(trunks[0]!.girth).toBe(42);
      expect(trunks[0]!.trunkComments).toBe("North trunk");
    });

    it("removes a trunk", async () => {
      const { tripId, siteId } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripId, siteId, null, new Date(), sql);
      await updateTree(tripId, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);
      const trunkId1 = await addTrunk(tripId, treeId, null, new Date(), sql);
      const trunkId2 = await addTrunk(tripId, treeId, null, new Date(), sql);

      await removeTrunk(tripId, trunkId1, new Date(), sql);
      const remaining = await listTrunksByTree(treeId, sql);
      expect(remaining.map((t) => t.id)).toEqual([trunkId2]);
    });

    it("rejects trunk mutations scoped to the wrong trip", async () => {
      const { tripId: tripA, siteId: siteA } = await makeTripWithSite();
      const { tripId: tripB } = await makeTripWithSite();
      const treeId = await createSingleTrunkTree(tripA, siteA, null, new Date(), sql);
      await updateTree(tripA, treeId, { ...baseUpdateFields, type: ImportTreeType.MultiTrunk, formType: TreeFormType.Multi }, new Date(), sql);
      const trunkId = await addTrunk(tripA, treeId, null, new Date(), sql);

      await expect(removeTrunk(tripB, trunkId, new Date(), sql)).rejects.toBeInstanceOf(TreeAccessError);
      await expect(
        updateTrunk(
          tripB,
          trunkId,
          {
            girth: 1,
            girthInputFormat: DistanceFormat.DecimalFeet,
            girthMeasurementHeight: 0,
            girthMeasurementHeightInputFormat: DistanceFormat.Unspecified,
            height: 0,
            heightInputFormat: DistanceFormat.Unspecified,
            trunkComments: "",
          },
          new Date(),
          sql,
        ),
      ).rejects.toBeInstanceOf(TreeAccessError);
    });
  });
});
