/**
 * P3-03 import-drafts.sql.ts tests (pglite, doc 05 §P3-03, doc 01 §10).
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CoordinatesFormat } from "../../lib/units/parse-coordinates";
import { finishTrip } from "../../lib/merge/engine";
import {
  TripAccessError,
  addTripMeasurer,
  assertTripEditable,
  createImportSite,
  createTrip,
  ensureSiteExists,
  findLatestTripForUser,
  getImportSite,
  getTrip,
  listImportSites,
  listStates,
  listTripMeasurers,
  listTripsForUser,
  removeImportSite,
  removeTrip,
  removeTripMeasurer,
  saveImportSite,
  saveTripStep,
  updateTripStep,
} from "./import-drafts.sql";
import type { SqlTag } from "./sql-tag";
import { createTestDb, insertCountry, insertState, pgliteSqlTag } from "./test-helpers";

// Local, test-only insert helpers -- kept in this file per this task's file
// ownership boundary (only import-drafts.sql.ts (+ test) is owned here),
// same pattern as auth.test.ts / details.test.ts.

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

describe("import-drafts.sql", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("createTrip (Trip.Create() defaults, Trip.cs:139-155)", () => {
    it("creates a blank draft owned by the creator", async () => {
      const userId = await insertUser(db, "creator1@example.com");
      const now = new Date("2026-01-01T00:00:00Z");
      const tripId = await createTrip(userId, now, sql);

      const trip = await getTrip(tripId, sql);
      expect(trip).not.toBeNull();
      expect(trip!.creatorUserId).toBe(userId);
      expect(trip!.name).toBe("");
      expect(trip!.date).toBeNull();
      expect(trip!.website).toBe("");
      expect(trip!.measurerContactInfo).toBe("");
      expect(trip!.makeMeasurerContactInfoPublic).toBe(true); // Trip.cs:153
      expect(trip!.photosAvailable).toBe(false);
      expect(trip!.imported).toBeNull();
      expect(trip!.isImported).toBe(false);
      expect(trip!.measurers).toEqual([]);
      expect(trip!.lastSaved.getTime()).toBe(now.getTime());
    });
  });

  describe("getTrip", () => {
    it("returns null for a nonexistent trip", async () => {
      expect(await getTrip(999999, sql)).toBeNull();
    });

    it("returns measurers in insertion order", async () => {
      const userId = await insertUser(db, "creator2@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      await addTripMeasurer(tripId, "John", "Doe", sql);
      await addTripMeasurer(tripId, "Jane", "Roe", sql);

      const trip = await getTrip(tripId, sql);
      expect(trip!.measurers.map((m) => `${m.firstName} ${m.lastName}`)).toEqual([
        "John Doe",
        "Jane Roe",
      ]);
    });
  });

  describe("listTripsForUser (ImportRepository.ListCreatedByUser, Order.Desc(Id))", () => {
    it("orders by id desc and scopes to the given creator", async () => {
      const userA = await insertUser(db, "lista@example.com");
      const userB = await insertUser(db, "listb@example.com");
      const t1 = await createTrip(userA, new Date(), sql);
      const t2 = await createTrip(userA, new Date(), sql);
      await createTrip(userB, new Date(), sql); // not userA's

      const trips = await listTripsForUser(userA, sql);
      expect(trips.map((t) => t.id)).toEqual([t2, t1]);
    });

    it("aggregates site names and reports isImported", async () => {
      const userId = await insertUser(db, "listc@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      await insertImportSite(db, tripId, "Big Oak Park");
      await insertImportSite(db, tripId, "Small Pine Grove");

      const trips = await listTripsForUser(userId, sql);
      const summary = trips.find((t) => t.id === tripId)!;
      expect(summary.siteNames.sort()).toEqual(["Big Oak Park", "Small Pine Grove"]);
      expect(summary.isImported).toBe(false);
    });

    it("reports an empty siteNames array for a trip with no sites yet", async () => {
      const userId = await insertUser(db, "listd@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      const trips = await listTripsForUser(userId, sql);
      expect(trips.find((t) => t.id === tripId)!.siteNames).toEqual([]);
    });
  });

  describe("findLatestTripForUser (ImportRepository.FindLastCreatedByUser)", () => {
    it("returns null when the user has no trips", async () => {
      const userId = await insertUser(db, "latest1@example.com");
      expect(await findLatestTripForUser(userId, sql)).toBeNull();
    });

    it("returns the most-recently-created trip", async () => {
      const userId = await insertUser(db, "latest2@example.com");
      await createTrip(userId, new Date(), sql);
      const t2 = await createTrip(userId, new Date(), sql);

      const latest = await findLatestTripForUser(userId, sql);
      expect(latest).toEqual({ id: t2, isImported: false });
    });
  });

  describe("updateTripStep / saveTripStep (stamps last_saved on every mutation)", () => {
    it("updates scalar fields and stamps last_saved", async () => {
      const userId = await insertUser(db, "update1@example.com");
      const tripId = await createTrip(userId, new Date("2026-01-01T00:00:00Z"), sql);
      const now = new Date("2026-02-02T00:00:00Z");

      await updateTripStep(
        tripId,
        {
          name: "Spring Survey",
          date: "2026-04-01",
          measurerContactInfo: "call me",
          makeMeasurerContactInfoPublic: false,
          website: "https://example.com",
        },
        now,
        sql,
      );

      const trip = await getTrip(tripId, sql);
      expect(trip!.name).toBe("Spring Survey");
      expect(trip!.date).toBe("2026-04-01");
      expect(trip!.measurerContactInfo).toBe("call me");
      expect(trip!.makeMeasurerContactInfoPublic).toBe(false);
      expect(trip!.website).toBe("https://example.com");
      expect(trip!.lastSaved.getTime()).toBe(now.getTime());
    });

    it("saveTripStep wholesale-replaces the measurer list", async () => {
      const userId = await insertUser(db, "update2@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      await addTripMeasurer(tripId, "Stale", "Measurer", sql);

      const now = new Date("2026-03-03T00:00:00Z");
      await saveTripStep(
        tripId,
        {
          name: "Fall Survey",
          date: "2026-10-01",
          measurerContactInfo: "email",
          makeMeasurerContactInfoPublic: true,
          website: "",
        },
        [
          { firstName: "John", lastName: "Doe" },
          { firstName: "Jane", lastName: "Roe" },
        ],
        now,
        sql,
      );

      const trip = await getTrip(tripId, sql);
      expect(trip!.name).toBe("Fall Survey");
      expect(trip!.lastSaved.getTime()).toBe(now.getTime());
      expect(trip!.measurers.map((m) => `${m.firstName} ${m.lastName}`)).toEqual(["John Doe", "Jane Roe"]);
      // "Stale Measurer" is gone -- whole-collection replace, not append.
      expect(trip!.measurers.some((m) => m.lastName === "Measurer")).toBe(false);
    });

    it("saveTripStep can shrink the measurer list down to zero", async () => {
      const userId = await insertUser(db, "update3@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      await addTripMeasurer(tripId, "John", "Doe", sql);

      await saveTripStep(
        tripId,
        {
          name: "Trip",
          date: "2026-01-01",
          measurerContactInfo: "x",
          makeMeasurerContactInfoPublic: true,
          website: "",
        },
        [],
        new Date(),
        sql,
      );

      const trip = await getTrip(tripId, sql);
      expect(trip!.measurers).toEqual([]);
    });
  });

  describe("addTripMeasurer / removeTripMeasurer / listTripMeasurers", () => {
    it("adds and removes individual measurers", async () => {
      const userId = await insertUser(db, "measurer1@example.com");
      const tripId = await createTrip(userId, new Date(), sql);

      const id1 = await addTripMeasurer(tripId, "John", "Doe", sql);
      await addTripMeasurer(tripId, "Jane", "Roe", sql);
      expect((await listTripMeasurers(tripId, sql)).map((m) => m.firstName)).toEqual(["John", "Jane"]);

      await removeTripMeasurer(id1, sql);
      expect((await listTripMeasurers(tripId, sql)).map((m) => m.firstName)).toEqual(["Jane"]);
    });
  });

  describe("assertTripEditable (UserRoles.cs:50,69 -- Import role AND creator-id equality, no admin bypass)", () => {
    it("allows the creator with the import role", async () => {
      const userId = await insertUser(db, "auth1@example.com");
      const tripId = await createTrip(userId, new Date(), sql);
      await expect(assertTripEditable(tripId, userId, ["import"], sql)).resolves.toBeUndefined();
    });

    it("rejects a different user, even with the import role", async () => {
      const creatorId = await insertUser(db, "auth2a@example.com");
      const otherId = await insertUser(db, "auth2b@example.com");
      const tripId = await createTrip(creatorId, new Date(), sql);

      await expect(assertTripEditable(tripId, otherId, ["import"], sql)).rejects.toThrow(TripAccessError);
      try {
        await assertTripEditable(tripId, otherId, ["import"], sql);
        expect.fail("expected TripAccessError");
      } catch (err) {
        expect(err).toBeInstanceOf(TripAccessError);
        expect((err as TripAccessError).reason).toBe("unauthorized");
      }
    });

    it("rejects a different user even when they hold the admin role (no admin bypass)", async () => {
      const creatorId = await insertUser(db, "auth3a@example.com");
      const otherId = await insertUser(db, "auth3b@example.com");
      const tripId = await createTrip(creatorId, new Date(), sql);

      try {
        await assertTripEditable(tripId, otherId, ["import", "admin"], sql);
        expect.fail("expected TripAccessError");
      } catch (err) {
        expect(err).toBeInstanceOf(TripAccessError);
        expect((err as TripAccessError).reason).toBe("unauthorized");
      }
    });

    it("rejects the creator themselves if they lack the import role", async () => {
      const userId = await insertUser(db, "auth4@example.com");
      const tripId = await createTrip(userId, new Date(), sql);

      try {
        await assertTripEditable(tripId, userId, ["export"], sql);
        expect.fail("expected TripAccessError");
      } catch (err) {
        expect(err).toBeInstanceOf(TripAccessError);
        expect((err as TripAccessError).reason).toBe("unauthorized");
      }
    });

    it("reports not-found for a nonexistent trip", async () => {
      const userId = await insertUser(db, "auth5@example.com");
      try {
        await assertTripEditable(999999, userId, ["import"], sql);
        expect.fail("expected TripAccessError");
      } catch (err) {
        expect(err).toBeInstanceOf(TripAccessError);
        expect((err as TripAccessError).reason).toBe("not-found");
      }
    });
  });

  describe("Sites step (P3-04, doc 05 §P3-04)", () => {
    async function newTrip(email: string): Promise<{ userId: number; tripId: number }> {
      const userId = await insertUser(db, email);
      const tripId = await createTrip(userId, new Date("2026-02-01T00:00:00Z"), sql);
      return { userId, tripId };
    }

    async function newState(name: string): Promise<number> {
      const countryId = await insertCountry(db, { name: "United States", doubleLetterCode: "US", tripleLetterCode: "USA" });
      return insertState(db, countryId, { name, doubleLetterCode: "OH", tripleLetterCode: "OHI" });
    }

    describe("ensureSiteExists (Trip.InitializeSites, called on every Sites-step GET)", () => {
      it("inserts one blank site, seeded from trip defaults, when the trip has none", async () => {
        const { tripId } = await newTrip("sites1@example.com");
        const stateId = await newState("Ohio");
        const now = new Date("2026-03-01T00:00:00Z");

        await ensureSiteExists(tripId, { stateId, county: "Cuyahoga" }, now, sql);

        const sites = await listImportSites(tripId, sql);
        expect(sites).toHaveLength(1);
        expect(sites[0]).toMatchObject({
          name: "",
          stateId,
          county: "Cuyahoga",
          ownershipType: "",
          ownershipContactInfo: "",
          makeOwnershipContactInfoPublic: true,
          comments: "",
          latitude: 0,
          latitudeInputFormat: CoordinatesFormat.Unspecified,
          longitude: 0,
          longitudeInputFormat: CoordinatesFormat.Unspecified,
        });

        const trip = await getTrip(tripId, sql);
        expect(trip!.lastSaved).toEqual(now);
      });

      it("is a no-op insert (but still stamps last_saved) when a site already exists", async () => {
        const { tripId } = await newTrip("sites2@example.com");
        await ensureSiteExists(tripId, { stateId: null, county: null }, new Date("2026-03-01T00:00:00Z"), sql);

        const laterNow = new Date("2026-03-02T00:00:00Z");
        await ensureSiteExists(tripId, { stateId: null, county: null }, laterNow, sql);

        expect(await listImportSites(tripId, sql)).toHaveLength(1);
        const trip = await getTrip(tripId, sql);
        expect(trip!.lastSaved).toEqual(laterNow);
      });
    });

    describe("createImportSite (Trip.AddSite, always inserts)", () => {
      it("adds a new blank site even when one already exists", async () => {
        const { tripId } = await newTrip("sites3@example.com");
        await ensureSiteExists(tripId, { stateId: null, county: null }, new Date("2026-03-01T00:00:00Z"), sql);

        const newId = await createImportSite(tripId, { stateId: null, county: null }, new Date("2026-03-02T00:00:00Z"), sql);

        const sites = await listImportSites(tripId, sql);
        expect(sites).toHaveLength(2);
        expect(sites[1]!.id).toBe(newId);
      });
    });

    describe("saveImportSite (SaveSite success path)", () => {
      it("updates the site, propagates State/County onto the trip's defaults, and stamps last_saved", async () => {
        const { tripId } = await newTrip("sites4@example.com");
        const stateId = await newState("Ohio");
        await ensureSiteExists(tripId, { stateId: null, county: null }, new Date("2026-03-01T00:00:00Z"), sql);
        const siteId = (await listImportSites(tripId, sql))[0]!.id;

        const now = new Date("2026-03-05T00:00:00Z");
        await saveImportSite(
          siteId,
          tripId,
          {
            name: "North Grove",
            latitude: 41.49932,
            latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
            longitude: -81.69437,
            longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
            stateId,
            county: "Cuyahoga",
            ownershipType: "City Park",
            ownershipContactInfo: "parks@example.com",
            makeOwnershipContactInfoPublic: false,
            comments: "Nice grove.",
          },
          now,
          sql,
        );

        const site = await getImportSite(siteId, sql);
        expect(site).toMatchObject({
          name: "North Grove",
          stateId,
          county: "Cuyahoga",
          ownershipType: "City Park",
          ownershipContactInfo: "parks@example.com",
          makeOwnershipContactInfoPublic: false,
          comments: "Nice grove.",
        });
        expect(site!.latitude).toBeCloseTo(41.49932, 4);
        expect(site!.longitude).toBeCloseTo(-81.69437, 4);

        const trip = await getTrip(tripId, sql);
        expect(trip!.defaultStateId).toBe(stateId);
        expect(trip!.defaultCounty).toBe("Cuyahoga");
        expect(trip!.lastSaved).toEqual(now);
      });
    });

    describe("removeImportSite (Trip.RemoveSite, cascades to import_trees/import_trunks)", () => {
      async function insertTreeAndTrunk(siteId: number): Promise<{ treeId: number; trunkId: number }> {
        const treeRows = await db.query<{ id: number }>(
          `insert into import_trees (
             created, site_id, type, tree_name, tree_number, common_name, scientific_name,
             status, health_status, age_class, age_type, age, general_comments,
             latitude, latitude_input_format, longitude, longitude_input_format, make_coordinates_public,
             elevation, elevation_input_format, height, height_input_format, height_measurement_method,
             height_measurements_distance_top, height_measurements_distance_top_input_format,
             height_measurements_angle_top, height_measurements_angle_top_input_format,
             height_measurements_distance_bottom, height_measurements_distance_bottom_input_format,
             height_measurements_angle_bottom, height_measurements_angle_bottom_input_format,
             height_measurements_vertical_offset, height_measurements_vertical_offset_input_format,
             height_measurement_type, laser_brand, clinometer_brand, height_comments,
             girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
             girth_root_collar_height, girth_root_collar_height_input_format, girth_comments,
             crown_spread, crown_spread_input_format, maximum_limb_length, maximum_limb_length_input_format,
             crown_spread_measurement_method, base_crown_height, base_crown_height_input_format,
             crown_volume, crown_volume_input_format, crown_volume_calculation_method, crown_comments,
             trunk_volume, trunk_volume_input_format, trunk_volume_calculation_method, trunk_comments,
             form_type, number_of_trunks, tree_form_comments, terrain_type, terrain_comments,
             combined_girth_number_of_trunks
           ) values (
             now(), $1, 1, '', null, '(Unidentified)', '(Unidentified)',
             1, '', 1, 1, null, '',
             0, 1, 0, 1, false,
             0, 1, 0, 1, 0,
             0, 1, 0, 1,
             0, 1, 0, 1,
             0, 1,
             '', '', '', '',
             0, 1, 0, 1,
             0, 1, '',
             0, 1, 0, 1,
             '', 0, 1,
             0, 1, '', '',
             0, 1, '', '',
             1, null, '', 1, '',
             null
           ) returning id`,
          [siteId],
        );
        const treeId = treeRows.rows[0]!.id;

        const trunkRows = await db.query<{ id: number }>(
          `insert into import_trunks (
             created, tree_id, girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
             height, height_input_format,
             height_measurements_distance_top, height_measurements_distance_top_input_format,
             height_measurements_angle_top, height_measurements_angle_top_input_format,
             height_measurements_distance_bottom, height_measurements_distance_bottom_input_format,
             height_measurements_angle_bottom, height_measurements_angle_bottom_input_format,
             height_measurements_vertical_offset, height_measurements_vertical_offset_input_format,
             include_height_distance_and_angle_measurements, trunk_comments
           ) values (
             now(), $1, 0, 1, 0, 1,
             0, 1,
             0, 1,
             0, 1,
             0, 1,
             0, 1,
             0, 1,
             false, ''
           ) returning id`,
          [treeId],
        );
        return { treeId, trunkId: trunkRows.rows[0]!.id };
      }

      it("deletes the site's trees and trunks, then the site itself, and stamps last_saved", async () => {
        const { tripId } = await newTrip("sites5@example.com");
        await ensureSiteExists(tripId, { stateId: null, county: null }, new Date("2026-03-01T00:00:00Z"), sql);
        const siteId = (await listImportSites(tripId, sql))[0]!.id;
        const { treeId, trunkId } = await insertTreeAndTrunk(siteId);

        const now = new Date("2026-03-10T00:00:00Z");
        await removeImportSite(siteId, tripId, now, sql);

        expect(await getImportSite(siteId, sql)).toBeNull();
        const treeRows = await db.query(`select id from import_trees where id = $1`, [treeId]);
        expect(treeRows.rows).toHaveLength(0);
        const trunkRows = await db.query(`select id from import_trunks where id = $1`, [trunkId]);
        expect(trunkRows.rows).toHaveLength(0);

        const trip = await getTrip(tripId, sql);
        expect(trip!.lastSaved).toEqual(now);
      });

      it("does not touch other sites in the same trip", async () => {
        const { tripId } = await newTrip("sites6@example.com");
        await ensureSiteExists(tripId, { stateId: null, county: null }, new Date("2026-03-01T00:00:00Z"), sql);
        const siteA = (await listImportSites(tripId, sql))[0]!.id;
        const siteB = await createImportSite(tripId, { stateId: null, county: null }, new Date("2026-03-02T00:00:00Z"), sql);

        await removeImportSite(siteA, tripId, new Date("2026-03-10T00:00:00Z"), sql);

        expect(await getImportSite(siteA, sql)).toBeNull();
        expect(await getImportSite(siteB, sql)).not.toBeNull();
      });
    });

    describe("listStates", () => {
      it("returns states ordered by name with country Code and NE/SW bounds", async () => {
        const countryId = await insertCountry(db, { name: "United States", doubleLetterCode: "US", tripleLetterCode: "USA" });
        await insertState(db, countryId, { name: "Wyoming", doubleLetterCode: "WY", tripleLetterCode: "WYO" });
        await insertState(db, countryId, { name: "Alabama", doubleLetterCode: "AL", tripleLetterCode: "ALA" });

        const states = await listStates(sql);
        const names = states.map((s) => s.name);
        // Alabama must sort before Wyoming; other tests in this suite may
        // have inserted their own states too, so assert relative order
        // rather than an exact/exclusive list.
        expect(names.indexOf("Alabama")).toBeLessThan(names.indexOf("Wyoming"));
        const alabama = states.find((s) => s.name === "Alabama")!;
        expect(alabama.code).toBe("US");
        expect(typeof alabama.neLatitude).toBe("number");
        expect(typeof alabama.swLongitude).toBe("number");
      });
    });
  });

  describe("removeTrip (ImportRepository.Remove -- unconditional canonical + draft cascade, task P3-07)", () => {
    // Full-column-set insert helpers for a FINISHABLE trip/site/tree (unlike
    // this file's other local `insertImportSite`, which is deliberately
    // minimal for tests that never call `finishTrip`) -- same shape as
    // lib/merge/reimport.test.ts's local helpers, duplicated per this
    // codebase's established "kept local to each test file" convention (see
    // that file's header comment) rather than cross-imported from a sibling
    // test file.
    async function freshState(): Promise<number> {
      const countryId = await insertCountry(db);
      return insertState(db, countryId);
    }

    async function insertFinishableTrip(
      overrides: Partial<{ creatorUserId: number | null; date: string }> = {},
    ): Promise<number> {
      const r = await db.query<{ id: number }>(
        `insert into import_trips (creator_user_id, name, date, website, photos_available, measurer_contact_info, make_measurer_contact_info_public)
         values ($1, 'Test Trip', $2, '', false, '', false) returning id`,
        [overrides.creatorUserId ?? null, overrides.date ?? "2020-06-15"],
      );
      return r.rows[0]!.id;
    }

    async function insertFinishableSite(
      tripId: number,
      stateId: number,
      overrides: Partial<{ name: string; latitude: number; longitude: number }> = {},
    ): Promise<number> {
      const r = await db.query<{ id: number }>(
        `insert into import_sites (
           creator_user_id, trip_id, name, state_id, county, ownership_type, ownership_contact_info,
           make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
         ) values (null, $1, $2, $3, 'Franklin', 'Public', '', false, $4, $6, $5, $6, '')
         returning id`,
        [
          tripId,
          overrides.name ?? "Test Park",
          stateId,
          overrides.latitude ?? 40,
          overrides.longitude ?? -83,
          CoordinatesFormat.DecimalDegrees,
        ],
      );
      return r.rows[0]!.id;
    }

    async function insertFinishableTree(
      siteId: number,
      overrides: Partial<{ commonName: string; scientificName: string }> = {},
    ): Promise<number> {
      const r = await db.query<{ id: number }>(
        `insert into import_trees (
           creator_user_id, site_id, type, tree_name, tree_number, common_name, scientific_name,
           status, health_status, age_class, age_type, age, general_comments,
           latitude, latitude_input_format, longitude, longitude_input_format, make_coordinates_public,
           elevation, elevation_input_format,
           height, height_input_format, height_measurement_method,
           height_measurements_distance_top, height_measurements_distance_top_input_format,
           height_measurements_angle_top, height_measurements_angle_top_input_format,
           height_measurements_distance_bottom, height_measurements_distance_bottom_input_format,
           height_measurements_angle_bottom, height_measurements_angle_bottom_input_format,
           height_measurements_vertical_offset, height_measurements_vertical_offset_input_format,
           height_measurement_type, laser_brand, clinometer_brand, height_comments,
           girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format,
           girth_root_collar_height, girth_root_collar_height_input_format, girth_comments,
           crown_spread, crown_spread_input_format, maximum_limb_length, maximum_limb_length_input_format,
           crown_spread_measurement_method, base_crown_height, base_crown_height_input_format,
           crown_volume, crown_volume_input_format, crown_volume_calculation_method, crown_comments,
           trunk_volume, trunk_volume_input_format, trunk_volume_calculation_method, trunk_comments,
           form_type, number_of_trunks, tree_form_comments,
           terrain_type, terrain_shape_index, landform_index, terrain_comments, combined_girth_number_of_trunks
         ) values (
           null, $1, 1, 'Tree 1', null, $2, $3,
           0, '', 0, 0, null, '',
           0, 1, 0, 1, false,
           0, 1,
           80, 2, 0,
           0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
           '', '', '', '',
           200, 2, 0, 1,
           0, 1, '',
           60, 2, 0, 1,
           '', 0, 1,
           0, 1, '', '',
           0, 1, '', '',
           0, null, '',
           0, null, null, '', null
         ) returning id`,
        [siteId, overrides.commonName ?? "White Oak", overrides.scientificName ?? "Quercus alba"],
      );
      return r.rows[0]!.id;
    }

    it("removes a draft-only trip (never finished) with a full cascade: site, tree, measurer, and the trip row itself", async () => {
      const userId = await insertUser(db, "removedraft@example.com");
      const stateId = await freshState();
      const tripId = await createTrip(userId, new Date(), sql);
      const siteId = await insertFinishableSite(tripId, stateId, { name: "Draft Site" });
      const treeId = await insertFinishableTree(siteId);
      await addTripMeasurer(tripId, "John", "Doe", sql);

      await removeTrip(tripId, userId, ["import"], sql);

      expect(await getTrip(tripId, sql)).toBeNull();
      expect((await db.query(`select id from import_sites where id = $1`, [siteId])).rows).toHaveLength(0);
      expect((await db.query(`select id from import_trees where id = $1`, [treeId])).rows).toHaveLength(0);
      expect((await db.query(`select id from import_trip_measurers where trip_id = $1`, [tripId])).rows).toHaveLength(0);
    });

    it("removes an already-imported trip: deletes the canonical site/tree it solely created, plus every draft row", async () => {
      const userId = await insertUser(db, "removeimported@example.com");
      const stateId = await freshState();
      const tripId = await insertFinishableTrip({ creatorUserId: userId });
      const importSiteId = await insertFinishableSite(tripId, stateId, {
        name: "Solo Site",
        latitude: 41,
        longitude: -84,
      });
      const importTreeId = await insertFinishableTree(importSiteId);

      await finishTrip(tripId, sql);

      const [site] = await sql<{ id: number }>`select id from sites where state_id = ${stateId} and name = 'Solo Site'`;
      expect(site).toBeDefined();
      const [tree] = await sql<{ id: number }>`select id from trees where site_id = ${site!.id}`;
      expect(tree).toBeDefined();

      await removeTrip(tripId, userId, ["import"], sql);

      // Canonical rows this trip solely created are gone (RemoveVisitsByTrip/
      // RemoveMeasurementsByTrip's orphan-cleanup rule, reused from reimport.ts).
      expect(await sql`select id from sites where id = ${site!.id}`).toHaveLength(0);
      expect(await sql`select id from trees where id = ${tree!.id}`).toHaveLength(0);

      // Draft rows are gone too -- unlike reimportTrip, no re-import follows.
      expect(await getTrip(tripId, sql)).toBeNull();
      expect((await db.query(`select id from import_sites where id = $1`, [importSiteId])).rows).toHaveLength(0);
      expect((await db.query(`select id from import_trees where id = $1`, [importTreeId])).rows).toHaveLength(0);
    });

    it("removing a trip whose site is shared with another trip's finished visit leaves the shared site and the other trip's contribution intact", async () => {
      const userId = await insertUser(db, "removeshared@example.com");
      const stateId = await freshState();

      const trip1 = await insertFinishableTrip({ creatorUserId: userId, date: "2019-01-01" });
      const site1 = await insertFinishableSite(trip1, stateId, { name: "Shared Site", latitude: 42, longitude: -85 });
      await insertFinishableTree(site1, { commonName: "Shared Tree" });
      await finishTrip(trip1, sql);

      const trip2 = await insertFinishableTrip({ creatorUserId: userId, date: "2020-06-15" });
      // Same name/state/county/coordinates -> merges into trip1's site (an
      // additional visit, no new tree).
      await insertFinishableSite(trip2, stateId, { name: "Shared Site", latitude: 42, longitude: -85 });
      await finishTrip(trip2, sql);

      const [site] = await sql<{
        id: number;
        visit_count: number;
      }>`select id, visit_count from sites where state_id = ${stateId} and name = 'Shared Site'`;
      expect(site!.visit_count).toBe(2);

      await removeTrip(trip2, userId, ["import"], sql);

      const siteAfter = await sql<{ id: number }>`select id from sites where id = ${site!.id}`;
      expect(siteAfter).toHaveLength(1); // survives -- trip1's visit remains
      const visitRows = await sql<{ n: number }>`select count(*)::int as n from site_visits where site_id = ${site!.id}`;
      expect(visitRows[0]!.n).toBe(1);
      const treesAfter = await sql<{ id: number }>`select id from trees where site_id = ${site!.id}`;
      expect(treesAfter).toHaveLength(1); // trip1's tree untouched

      expect(await getTrip(trip2, sql)).toBeNull();
    });

    it("auth: rejects a non-creator and leaves the trip and its rows intact", async () => {
      const owner = await insertUser(db, "owner1@example.com");
      const intruder = await insertUser(db, "intruder1@example.com");
      const tripId = await createTrip(owner, new Date(), sql);

      const rejection = removeTrip(tripId, intruder, ["import"], sql);
      await expect(rejection).rejects.toBeInstanceOf(TripAccessError);
      await expect(rejection).rejects.toMatchObject({ reason: "unauthorized" });
      expect(await getTrip(tripId, sql)).not.toBeNull();
    });

    it("auth: rejects a user without the Import role", async () => {
      const owner = await insertUser(db, "owner2@example.com");
      const tripId = await createTrip(owner, new Date(), sql);

      const rejection = removeTrip(tripId, owner, [], sql);
      await expect(rejection).rejects.toBeInstanceOf(TripAccessError);
      await expect(rejection).rejects.toMatchObject({ reason: "unauthorized" });
      expect(await getTrip(tripId, sql)).not.toBeNull();
    });

    it("auth: not-found for a nonexistent trip", async () => {
      const userId = await insertUser(db, "ghost1@example.com");
      const rejection = removeTrip(999999, userId, ["import"], sql);
      await expect(rejection).rejects.toBeInstanceOf(TripAccessError);
      await expect(rejection).rejects.toMatchObject({ reason: "not-found" });
    });
  });
});
