/**
 * P0-02 schema snapshot + constraint tests.
 *
 * Spins up an in-memory Postgres (PGlite), replays the drizzle-kit
 * generated migration SQL from db/migrations/*.sql (split on
 * `--> statement-breakpoint`, per drizzle-kit's own statement separator),
 * and asserts:
 *  1. The migration runs clean against an empty database.
 *  2. information_schema.columns matches a hand-verified expected snapshot
 *     for every one of the 17 migrated tables (column name, data_type,
 *     is_nullable, in declaration order) - this is the "schema snapshot
 *     test committed" acceptance criterion for P0-02.
 *  3. The `photo_references` CHECK constraint (exactly one owner FK set for
 *     types 2-7, none for type 1) rejects bad rows and accepts good ones.
 *  4. Identity-column insert works with `OVERRIDING SYSTEM VALUE`, which
 *     the ETL (P0-04) depends on to replay legacy primary keys verbatim.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(__dirname, "migrations");

function loadMigrationStatements(): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const statements: string[] = [];
  for (const file of files) {
    const sqlText = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    for (const stmt of sqlText.split("--> statement-breakpoint")) {
      const trimmed = stmt.trim();
      if (trimmed) statements.push(trimmed);
    }
  }
  return statements;
}

/**
 * Expected {table -> ordered [column, data_type, is_nullable]} snapshot.
 * Captured by running the real generated migration against PGlite and
 * querying information_schema.columns (public schema, ordered by
 * ordinal_position), then hand-verified against db/schema.ts and the
 * legacy DDL. Keep in sync with db/migrations/*.sql when the schema
 * changes - a mismatch here should mean "the migration changed", not
 * "the test is stale".
 */
const EXPECTED_COLUMNS: Record<string, [string, string, string][]> = {
  countries: [
    ["id", "integer", "NO"],
    ["double_letter_code", "character", "NO"],
    ["triple_letter_code", "character", "NO"],
    ["name", "character varying", "NO"],
    ["ne_latitude", "real", "NO"],
    ["ne_longitude", "real", "NO"],
    ["sw_latitude", "real", "NO"],
    ["sw_longitude", "real", "NO"],
  ],
  import_sites: [
    ["id", "integer", "NO"],
    ["created", "timestamp with time zone", "NO"],
    ["creator_user_id", "integer", "YES"],
    ["trip_id", "integer", "NO"],
    ["name", "character varying", "NO"],
    ["state_id", "integer", "YES"],
    ["county", "character varying", "NO"],
    ["ownership_type", "character varying", "NO"],
    ["ownership_contact_info", "character varying", "NO"],
    ["make_ownership_contact_info_public", "boolean", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["comments", "character varying", "NO"],
  ],
  import_trees: [
    ["id", "integer", "NO"],
    ["created", "timestamp with time zone", "NO"],
    ["creator_user_id", "integer", "YES"],
    ["site_id", "integer", "NO"],
    ["type", "smallint", "NO"],
    ["tree_name", "character varying", "NO"],
    ["tree_number", "integer", "YES"],
    ["common_name", "character varying", "NO"],
    ["scientific_name", "character varying", "NO"],
    ["status", "smallint", "NO"],
    ["health_status", "character varying", "NO"],
    ["age_class", "smallint", "NO"],
    ["age_type", "smallint", "NO"],
    ["age", "integer", "YES"],
    ["general_comments", "character varying", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["make_coordinates_public", "boolean", "NO"],
    ["elevation", "real", "NO"],
    ["elevation_input_format", "smallint", "NO"],
    ["height", "real", "NO"],
    ["height_input_format", "smallint", "NO"],
    ["height_measurement_method", "smallint", "NO"],
    ["height_measurements_distance_top", "real", "NO"],
    ["height_measurements_distance_top_input_format", "smallint", "NO"],
    ["height_measurements_angle_top", "real", "NO"],
    ["height_measurements_angle_top_input_format", "smallint", "NO"],
    ["height_measurements_distance_bottom", "real", "NO"],
    ["height_measurements_distance_bottom_input_format", "smallint", "NO"],
    ["height_measurements_angle_bottom", "real", "NO"],
    ["height_measurements_angle_bottom_input_format", "smallint", "NO"],
    ["height_measurements_vertical_offset", "real", "NO"],
    ["height_measurements_vertical_offset_input_format", "smallint", "NO"],
    ["height_measurement_type", "character varying", "NO"],
    ["laser_brand", "character varying", "NO"],
    ["clinometer_brand", "character varying", "NO"],
    ["height_comments", "character varying", "NO"],
    ["girth", "real", "NO"],
    ["girth_input_format", "smallint", "NO"],
    ["girth_measurement_height", "real", "NO"],
    ["girth_measurement_height_input_format", "smallint", "NO"],
    ["girth_root_collar_height", "real", "NO"],
    ["girth_root_collar_height_input_format", "smallint", "NO"],
    ["girth_comments", "character varying", "NO"],
    ["crown_spread", "real", "NO"],
    ["crown_spread_input_format", "smallint", "NO"],
    ["maximum_limb_length", "real", "NO"],
    ["maximum_limb_length_input_format", "smallint", "NO"],
    ["crown_spread_measurement_method", "character varying", "NO"],
    ["base_crown_height", "real", "NO"],
    ["base_crown_height_input_format", "smallint", "NO"],
    ["crown_volume", "real", "NO"],
    ["crown_volume_input_format", "smallint", "NO"],
    ["crown_volume_calculation_method", "character varying", "NO"],
    ["crown_comments", "character varying", "NO"],
    ["trunk_volume", "real", "NO"],
    ["trunk_volume_input_format", "smallint", "NO"],
    ["trunk_volume_calculation_method", "character varying", "NO"],
    ["trunk_comments", "character varying", "NO"],
    ["form_type", "smallint", "NO"],
    ["number_of_trunks", "integer", "YES"],
    ["tree_form_comments", "character varying", "NO"],
    ["terrain_type", "smallint", "NO"],
    ["terrain_shape_index", "real", "YES"],
    ["landform_index", "real", "YES"],
    ["terrain_comments", "character varying", "NO"],
    ["combined_girth_number_of_trunks", "integer", "YES"],
  ],
  import_trip_measurers: [
    ["id", "integer", "NO"],
    ["trip_id", "integer", "YES"],
    ["first_name", "character varying", "NO"],
    ["last_name", "character varying", "NO"],
  ],
  import_trips: [
    ["id", "integer", "NO"],
    ["creator_user_id", "integer", "YES"],
    ["created", "timestamp with time zone", "NO"],
    ["imported", "timestamp with time zone", "YES"],
    ["name", "character varying", "NO"],
    ["date", "date", "YES"],
    ["website", "character varying", "NO"],
    ["photos_available", "boolean", "NO"],
    ["measurer_contact_info", "character varying", "NO"],
    ["make_measurer_contact_info_public", "boolean", "NO"],
    ["default_laser_brand", "character varying", "YES"],
    ["default_clinometer_brand", "character varying", "YES"],
    ["default_height_measurement_method", "smallint", "NO"],
    ["default_state_id", "integer", "YES"],
    ["default_county", "character varying", "YES"],
    ["last_saved", "timestamp with time zone", "NO"],
  ],
  import_trunks: [
    ["id", "integer", "NO"],
    ["created", "timestamp with time zone", "NO"],
    ["creator_user_id", "integer", "YES"],
    ["tree_id", "integer", "NO"],
    ["girth", "real", "NO"],
    ["girth_input_format", "smallint", "NO"],
    ["girth_measurement_height", "real", "NO"],
    ["girth_measurement_height_input_format", "smallint", "NO"],
    ["height", "real", "NO"],
    ["height_input_format", "smallint", "NO"],
    ["height_measurements_distance_top", "real", "NO"],
    ["height_measurements_distance_top_input_format", "smallint", "NO"],
    ["height_measurements_angle_top", "real", "NO"],
    ["height_measurements_angle_top_input_format", "smallint", "NO"],
    ["height_measurements_distance_bottom", "real", "NO"],
    ["height_measurements_distance_bottom_input_format", "smallint", "NO"],
    ["height_measurements_angle_bottom", "real", "NO"],
    ["height_measurements_angle_bottom_input_format", "smallint", "NO"],
    ["height_measurements_vertical_offset", "real", "NO"],
    ["height_measurements_vertical_offset_input_format", "smallint", "NO"],
    ["include_height_distance_and_angle_measurements", "boolean", "NO"],
    ["trunk_comments", "character varying", "NO"],
  ],
  known_species: [
    ["id", "integer", "NO"],
    ["accepted_symbol", "character varying", "NO"],
    ["scientific_name", "character varying", "NO"],
    ["common_name", "character varying", "NO"],
  ],
  photo_references: [
    ["id", "integer", "NO"],
    ["type", "smallint", "NO"],
    ["import_site_id", "integer", "YES"],
    ["import_tree_id", "integer", "YES"],
    ["site_id", "integer", "YES"],
    ["site_visit_id", "integer", "YES"],
    ["tree_id", "integer", "YES"],
    ["tree_measurement_id", "integer", "YES"],
    ["photo_id", "integer", "NO"],
    ["caption", "character varying", "YES"],
  ],
  photos: [
    ["id", "integer", "NO"],
    ["creator_user_id", "integer", "YES"],
    ["created", "timestamp with time zone", "NO"],
    ["width", "integer", "NO"],
    ["height", "integer", "NO"],
    ["bytes", "integer", "NO"],
    ["format", "smallint", "NO"],
  ],
  site_visitors: [
    ["id", "integer", "NO"],
    ["site_id", "integer", "YES"],
    ["site_visit_id", "integer", "YES"],
    ["first_name", "character varying", "NO"],
    ["last_name", "character varying", "NO"],
  ],
  site_visits: [
    ["id", "integer", "NO"],
    ["site_id", "integer", "YES"],
    ["importing_trip_id", "integer", "YES"],
    ["visited", "date", "NO"],
    ["name", "character varying", "NO"],
    ["state_id", "integer", "NO"],
    ["county", "character varying", "NO"],
    ["ownership_type", "character varying", "NO"],
    ["ownership_contact_info", "character varying", "NO"],
    ["make_ownership_contact_info_public", "boolean", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["calculated_latitude", "real", "NO"],
    ["calculated_latitude_input_format", "smallint", "NO"],
    ["calculated_longitude", "real", "NO"],
    ["calculated_longitude_input_format", "smallint", "NO"],
    ["comments", "character varying", "NO"],
    ["trip_report_url", "character varying", "NO"],
  ],
  sites: [
    ["id", "integer", "NO"],
    ["state_id", "integer", "NO"],
    ["county", "character varying", "NO"],
    ["ownership_type", "character varying", "NO"],
    ["ownership_contact_info", "character varying", "NO"],
    ["make_ownership_contact_info_public", "boolean", "NO"],
    ["name", "character varying", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["calculated_latitude", "real", "NO"],
    ["calculated_latitude_input_format", "smallint", "NO"],
    ["calculated_longitude", "real", "NO"],
    ["calculated_longitude_input_format", "smallint", "NO"],
    ["computed_rhi5", "real", "YES"],
    ["computed_rhi10", "real", "YES"],
    ["computed_rhi20", "real", "YES"],
    ["computed_rgi5", "real", "YES"],
    ["computed_rgi10", "real", "YES"],
    ["computed_rgi20", "real", "YES"],
    ["computed_trees_measured_count", "integer", "YES"],
    ["computed_last_measurement_date", "date", "YES"],
    ["computed_contains_entity_with_coordinates", "boolean", "YES"],
    ["are_metrics_stale", "boolean", "NO"],
    ["last_metrics_update_timestamp", "timestamp with time zone", "YES"],
    ["visit_count", "integer", "NO"],
  ],
  states: [
    ["id", "integer", "NO"],
    ["country_id", "integer", "NO"],
    ["double_letter_code", "character", "NO"],
    ["triple_letter_code", "character", "NO"],
    ["name", "character varying", "NO"],
    ["ne_latitude", "real", "NO"],
    ["ne_longitude", "real", "NO"],
    ["sw_latitude", "real", "NO"],
    ["sw_longitude", "real", "NO"],
    ["computed_rhi5", "real", "YES"],
    ["computed_rhi10", "real", "YES"],
    ["computed_rhi20", "real", "YES"],
    ["computed_rgi5", "real", "YES"],
    ["computed_rgi10", "real", "YES"],
    ["computed_rgi20", "real", "YES"],
    ["computed_trees_measured_count", "integer", "YES"],
    ["computed_last_measurement_date", "date", "YES"],
    ["computed_contains_entity_with_coordinates", "boolean", "YES"],
    ["are_metrics_stale", "boolean", "NO"],
    ["last_metrics_update_timestamp", "timestamp with time zone", "YES"],
  ],
  tree_measurements: [
    ["id", "integer", "NO"],
    ["tree_id", "integer", "YES"],
    ["importing_trip_id", "integer", "YES"],
    ["computed_measured_species_id", "integer", "NO"],
    ["measured", "date", "NO"],
    ["common_name", "character varying", "NO"],
    ["scientific_name", "character varying", "NO"],
    ["height", "real", "NO"],
    ["height_input_format", "smallint", "NO"],
    ["height_measurement_method", "smallint", "NO"],
    ["girth", "real", "NO"],
    ["girth_input_format", "smallint", "NO"],
    ["crown_spread", "real", "NO"],
    ["crown_spread_input_format", "smallint", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["calculated_latitude", "real", "NO"],
    ["calculated_latitude_input_format", "smallint", "NO"],
    ["calculated_longitude", "real", "NO"],
    ["calculated_longitude_input_format", "smallint", "NO"],
    ["elevation", "real", "NO"],
    ["elevation_input_format", "smallint", "NO"],
    ["general_comments", "character varying", "NO"],
    ["diameter", "real", "NO"],
    ["diameter_input_format", "smallint", "NO"],
    ["entspts", "real", "YES"],
    ["conical_volume", "real", "NO"],
    ["conical_volume_input_format", "smallint", "NO"],
    ["entspts2", "real", "YES"],
    ["champion_points", "real", "YES"],
    ["abbreviated_champion_points", "real", "YES"],
  ],
  tree_measurers: [
    ["id", "integer", "NO"],
    ["tree_id", "integer", "YES"],
    ["measurement_id", "integer", "YES"],
    ["first_name", "character varying", "NO"],
    ["last_name", "character varying", "NO"],
  ],
  trees: [
    ["id", "integer", "NO"],
    ["site_id", "integer", "NO"],
    ["computed_measured_species_id", "integer", "NO"],
    ["last_measured", "date", "NO"],
    ["common_name", "character varying", "NO"],
    ["scientific_name", "character varying", "NO"],
    ["height", "real", "NO"],
    ["height_input_format", "smallint", "NO"],
    ["height_measurement_method", "smallint", "NO"],
    ["girth", "real", "NO"],
    ["girth_input_format", "smallint", "NO"],
    ["crown_spread", "real", "NO"],
    ["crown_spread_input_format", "smallint", "NO"],
    ["latitude", "real", "NO"],
    ["latitude_input_format", "smallint", "NO"],
    ["longitude", "real", "NO"],
    ["longitude_input_format", "smallint", "NO"],
    ["calculated_latitude", "real", "NO"],
    ["calculated_latitude_input_format", "smallint", "NO"],
    ["calculated_longitude", "real", "NO"],
    ["calculated_longitude_input_format", "smallint", "NO"],
    ["elevation", "real", "NO"],
    ["elevation_input_format", "smallint", "NO"],
    ["diameter", "real", "NO"],
    ["diameter_input_format", "smallint", "NO"],
    ["entspts", "real", "YES"],
    ["conical_volume", "real", "NO"],
    ["conical_volume_input_format", "smallint", "NO"],
    ["entspts2", "real", "YES"],
    ["champion_points", "real", "YES"],
    ["abbreviated_champion_points", "real", "YES"],
  ],
  users: [
    ["id", "integer", "NO"],
    ["email", "character varying", "NO"],
    ["firstname", "character varying", "NO"],
    ["lastname", "character varying", "NO"],
    ["roles", "smallint", "NO"],
    ["password_hash", "bytea", "NO"],
    ["password_numerics", "integer", "NO"],
    ["password_uppercase", "integer", "NO"],
    ["password_lowercase", "integer", "NO"],
    ["password_specials", "integer", "NO"],
    ["password_length", "integer", "NO"],
    ["created", "timestamp with time zone", "NO"],
    ["last_login", "timestamp with time zone", "NO"],
    ["email_verification_token", "bytea", "NO"],
    ["recently_failed_login_attempts", "integer", "NO"],
    ["email_verified", "timestamp with time zone", "YES"],
    ["last_failed_login_attempt", "timestamp with time zone", "YES"],
    ["forgotten_password_assistance_token", "bytea", "YES"],
    [
      "forgotten_password_assistance_token_issued",
      "timestamp with time zone",
      "YES",
    ],
    [
      "forgotten_password_assistance_token_used",
      "timestamp with time zone",
      "YES",
    ],
    // P2-03 (doc 04): added via a later ALTER TABLE migration
    // (0001_zippy_maggott.sql), so these two land at the end of the
    // column list (ordinal position reflects migration order, not the
    // declaration order in schema.ts) even though schema.ts declares them
    // adjacent to password_hash.
    ["password_algo", "character varying", "NO"],
    ["password_argon2", "text", "YES"],
  ],
};

describe("schema migration (PGlite)", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    const statements = loadMigrationStatements();
    expect(statements.length).toBeGreaterThan(0);
    // Runs clean against an empty DB - any failure throws and fails the
    // suite immediately (P0-02 acceptance: "empty-DB migrate runs clean").
    for (const statement of statements) {
      await db.exec(statement);
    }
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates exactly the 17 expected tables", async () => {
    const res = await db.query<{ table_name: string }>(`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name;
    `);
    const tableNames = res.rows.map((r) => r.table_name).sort();
    expect(tableNames).toEqual(Object.keys(EXPECTED_COLUMNS).sort());
  });

  it.each(Object.keys(EXPECTED_COLUMNS))(
    "table %s matches the expected column snapshot",
    async (tableName) => {
      const res = await db.query<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>(
        `
        select column_name, data_type, is_nullable
        from information_schema.columns
        where table_schema = 'public' and table_name = $1
        order by ordinal_position;
        `,
        [tableName],
      );
      const actual = res.rows.map(
        (r) =>
          [r.column_name, r.data_type, r.is_nullable] as [
            string,
            string,
            string,
          ],
      );
      expect(actual).toEqual(EXPECTED_COLUMNS[tableName]);
    },
  );

  it("users.email has a unique index", async () => {
    const res = await db.query<{ indexdef: string }>(`
      select indexdef
      from pg_indexes
      where schemaname = 'public' and tablename = 'users' and indexname = 'ux_users_email';
    `);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0]!.indexdef).toMatch(/UNIQUE INDEX/i);
  });

  it("has a btree index on (scientific_name, common_name) for trees and tree_measurements", async () => {
    const res = await db.query<{ tablename: string; indexname: string }>(`
      select tablename, indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'ix_trees_scientific_name_common_name',
          'ix_tree_measurements_scientific_name_common_name'
        )
      order by tablename;
    `);
    expect(res.rows.map((r) => r.tablename)).toEqual([
      "tree_measurements",
      "trees",
    ]);
  });

  describe("photo_references CHECK constraint (ck_photo_references_owner)", () => {
    // Seed one row per referenceable owner so FK columns can be satisfied.
    beforeAll(async () => {
      await db.exec(`
        insert into countries (double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
        values ('US', 'USA', 'United States', 49, -66, 24, -125);
        insert into states (country_id, double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
        values (1, 'OH', 'OHI', 'Ohio', 42, -80, 38, -85);
        insert into sites (state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, name, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, visit_count)
        values (1, 'Franklin', 'Public', '', false, 'Test Park', 40, 2, -83, 2, 40, -83, 1);
        insert into site_visits (site_id, visited, name, state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, comments)
        values (1, '2020-01-01', 'Test Park', 1, 'Franklin', 'Public', '', false, 40, 2, -83, 2, 40, -83, '');
        insert into trees (site_id, computed_measured_species_id, last_measured, common_name, scientific_name, height, height_input_format, height_measurement_method, girth, girth_input_format, crown_spread, crown_spread_input_format, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, elevation, elevation_input_format, diameter, diameter_input_format, conical_volume, conical_volume_input_format)
        values (1, 12345, '2020-01-01', 'White Oak', 'Quercus alba', 100, 2, 0, 200, 2, 50, 2, 40, 2, -83, 2, 40, -83, 800, 2, 10, 2, 0, 0);
        insert into tree_measurements (tree_id, computed_measured_species_id, measured, common_name, scientific_name, height, height_input_format, height_measurement_method, girth, girth_input_format, crown_spread, crown_spread_input_format, latitude, latitude_input_format, longitude, longitude_input_format, calculated_latitude, calculated_longitude, elevation, elevation_input_format, general_comments, diameter, diameter_input_format, conical_volume, conical_volume_input_format)
        values (1, 12345, '2020-01-01', 'White Oak', 'Quercus alba', 100, 2, 0, 200, 2, 50, 2, 40, 2, -83, 2, 40, -83, 800, 2, '', 10, 2, 0, 0);
        insert into import_trips (name, website, photos_available, measurer_contact_info)
        values ('Test Trip', '', false, '');
        insert into import_sites (trip_id, name, state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments)
        values (1, 'Import Site', 1, 'Franklin', 'Public', '', false, 40, 2, -83, 2, '');
        insert into import_trees (site_id, tree_name, common_name, scientific_name, status, health_status, age_class, age_type, general_comments, latitude, latitude_input_format, longitude, longitude_input_format, elevation, elevation_input_format, height, height_input_format, height_measurements_distance_top, height_measurements_distance_top_input_format, height_measurements_angle_top, height_measurements_angle_top_input_format, height_measurements_distance_bottom, height_measurements_distance_bottom_input_format, height_measurements_angle_bottom, height_measurements_angle_bottom_input_format, height_measurements_vertical_offset, height_measurements_vertical_offset_input_format, height_measurement_type, laser_brand, clinometer_brand, height_comments, girth, girth_input_format, girth_measurement_height, girth_measurement_height_input_format, girth_root_collar_height, girth_root_collar_height_input_format, girth_comments, crown_spread, crown_spread_input_format, maximum_limb_length, maximum_limb_length_input_format, crown_spread_measurement_method, base_crown_height, base_crown_height_input_format, crown_volume, crown_volume_input_format, crown_volume_calculation_method, crown_comments, trunk_volume, trunk_volume_input_format, trunk_volume_calculation_method, trunk_comments, form_type, tree_form_comments, terrain_type, terrain_comments)
        values (1, 'Tree 1', 'White Oak', 'Quercus alba', 0, '', 0, 0, '', 40, 2, -83, 2, 800, 2, 100, 2, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, '', '', '', '', 200, 2, 0, 1, 0, 1, '', 50, 2, 0, 1, '', 0, 1, 0, 1, '', '', 0, 1, '', '', 0, '', 0, '');
        insert into photos (created, width, height, bytes, format)
        values (now(), 100, 100, 12345, 1);
      `);
    });

    it("rejects a type=1 (Public) row with an owner FK set", async () => {
      await expect(
        db.query(
          `insert into photo_references (type, site_id, photo_id) values (1, 1, 1);`,
        ),
      ).rejects.toThrow();
    });

    it("rejects a type=4 (Site) row with no owner FK set", async () => {
      await expect(
        db.query(`insert into photo_references (type, photo_id) values (4, 1);`),
      ).rejects.toThrow();
    });

    it("rejects a type=4 (Site) row with the wrong owner FK set (tree_id instead of site_id)", async () => {
      await expect(
        db.query(
          `insert into photo_references (type, tree_id, photo_id) values (4, 1, 1);`,
        ),
      ).rejects.toThrow();
    });

    it("rejects a type=6 (Tree) row with two owner FKs set", async () => {
      await expect(
        db.query(
          `insert into photo_references (type, tree_id, site_id, photo_id) values (6, 1, 1, 1);`,
        ),
      ).rejects.toThrow();
    });

    it("accepts a type=1 (Public) row with no owner FK set", async () => {
      const res = await db.query<{ id: number }>(
        `insert into photo_references (type, photo_id) values (1, 1) returning id;`,
      );
      expect(res.rows).toHaveLength(1);
    });

    it("accepts a type=6 (Tree) row with exactly tree_id set", async () => {
      const res = await db.query<{ id: number }>(
        `insert into photo_references (type, tree_id, photo_id) values (6, 1, 1) returning id;`,
      );
      expect(res.rows).toHaveLength(1);
    });

    it("accepts a type=7 (TreeMeasurement) row with exactly tree_measurement_id set", async () => {
      const res = await db.query<{ id: number }>(
        `insert into photo_references (type, tree_measurement_id, photo_id) values (7, 1, 1) returning id;`,
      );
      expect(res.rows).toHaveLength(1);
    });
  });

  describe("identity insert with OVERRIDING SYSTEM VALUE", () => {
    it("lets the ETL replay a legacy Id verbatim past the identity sequence", async () => {
      await db.exec(
        `insert into countries (id, double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
         overriding system value
         values (999, 'CA', 'CAN', 'Canada', 83, -52, 41, -141);`,
      );
      const res = await db.query<{ id: number; name: string }>(
        `select id, name from countries where id = 999;`,
      );
      expect(res.rows).toEqual([{ id: 999, name: "Canada" }]);

      // setval must be able to move the sequence past the replayed max Id,
      // exactly as P0-04's ETL does after a COPY load.
      await db.exec(
        `select setval(pg_get_serial_sequence('countries', 'id'), (select max(id) from countries));`,
      );
      const nextRes = await db.query<{ id: number }>(
        `insert into countries (double_letter_code, triple_letter_code, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude)
         values ('MX', 'MEX', 'Mexico', 33, -86, 14, -118) returning id;`,
      );
      expect(nextRes.rows[0]!.id).toBeGreaterThan(999);
    });
  });
});
