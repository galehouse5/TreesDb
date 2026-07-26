/**
 * Column metadata for the 17 effective migrated tables, driving the data-
 * parity comparator (doc 07 §7.1). Transcribed directly from two sources
 * that must stay in lockstep with this file:
 *   - web/scripts/dump-legacy.sql (`-- columns: ...` comment lines - CSV
 *     column names/order, and each column's ISNULL(CAST/CONVERT(...))
 *     expression, which determines `type` below)
 *   - web/db/schema.ts (Postgres column names + FK targets)
 *
 * Every table's primary key is its `id` column (CSV `Id`) - true for all 17
 * tables per schema.ts's `generatedAlwaysAsIdentity().primaryKey()` pattern
 * - so `pkCsv`/`pkDb` are constant across every TableSpec and are not
 * repeated per-table.
 *
 * `type` mirrors the dump SQL's cast/convert, not just the Postgres column
 * type, because that's what determines how to parse the CSV string:
 *   - "int"      CAST(col AS varchar(20))                    -> plain integer
 *   - "float"    CONVERT(varchar(50), CAST(col AS float), 3) -> 17-digit round-trip real
 *   - "string"   raw column value, quoted                    -> varchar/char
 *   - "bool"     CAST(col AS varchar(1))                     -> "0"/"1" bit
 *   - "bytea"    LOWER(CONVERT(varchar(max), col, 2))         -> lowercase hex
 *   - "datetime" CONVERT(varchar(33), col, 126)  (datetime/timestamptz col) -> ISO instant, no offset
 *   - "dateonly" CONVERT(varchar(33), col, 126)  (date col)                -> "yyyy-MM-dd", no time part
 * ("datetime" vs "dateonly" both use the *same* SQL Server CONVERT style -
 * the underlying column's SQL type is what makes 126 emit a time part or
 * not; see dump-legacy.sql's FORMATTING RULES header comment.)
 *
 * `fk`, when present, names the referenced TableSpec's key in TABLE_SPECS -
 * drives the doc §7.1.4 per-FK distinct-count aggregate and the §7.1.6 FK
 * orphan check.
 */

export type ColumnType = "int" | "float" | "string" | "bool" | "bytea" | "datetime" | "dateonly";

export interface ColumnSpec {
  /** CSV header name (PascalCase, exactly as dump-legacy.sql's `-- columns:` line). */
  csv: string;
  /** Postgres column name (snake_case, exactly as db/schema.ts). */
  db: string;
  type: ColumnType;
  /** TABLE_SPECS key of the referenced table, for FK checks. */
  fk?: string;
}

export interface TableSpec {
  /** Postgres table name == TABLE_SPECS key == dump CSV file base name (`<name>.csv`). */
  name: string;
  columns: ColumnSpec[];
}

/** Every table's PK is `Id` (CSV) / `id` (Postgres) - see file header. */
export const PK_CSV = "Id";
export const PK_DB = "id";

type ColTuple = [csv: string, db: string, type: ColumnType, fk?: string];

function spec(name: string, tuples: ColTuple[]): TableSpec {
  return {
    name,
    columns: tuples.map(([csv, db, type, fk]) => ({ csv, db, type, ...(fk ? { fk } : {}) })),
  };
}

export const TABLE_SPECS: Record<string, TableSpec> = {
  users: spec("users", [
    ["Id", "id", "int"],
    ["Email", "email", "string"],
    ["Firstname", "firstname", "string"],
    ["Lastname", "lastname", "string"],
    ["Roles", "roles", "int"],
    ["PasswordHash", "password_hash", "bytea"],
    ["PasswordNumerics", "password_numerics", "int"],
    ["PasswordUppercase", "password_uppercase", "int"],
    ["PasswordLowercase", "password_lowercase", "int"],
    ["PasswordSpecials", "password_specials", "int"],
    ["PasswordLength", "password_length", "int"],
    ["Created", "created", "datetime"],
    ["LastLogin", "last_login", "datetime"],
    ["EmailVerificationToken", "email_verification_token", "bytea"],
    ["RecentlyFailedLoginAttempts", "recently_failed_login_attempts", "int"],
    ["EmailVerified", "email_verified", "datetime"],
    ["LastFailedLoginAttempt", "last_failed_login_attempt", "datetime"],
    ["ForgottenPasswordAssistanceToken", "forgotten_password_assistance_token", "bytea"],
    ["ForgottenPasswordAssistanceTokenIssued", "forgotten_password_assistance_token_issued", "datetime"],
    ["ForgottenPasswordAssistanceTokenUsed", "forgotten_password_assistance_token_used", "datetime"],
  ]),

  countries: spec("countries", [
    ["Id", "id", "int"],
    ["DoubleLetterCode", "double_letter_code", "string"],
    ["TripleLetterCode", "triple_letter_code", "string"],
    ["Name", "name", "string"],
    ["NELatitude", "ne_latitude", "float"],
    ["NELongitude", "ne_longitude", "float"],
    ["SWLatitude", "sw_latitude", "float"],
    ["SWLongitude", "sw_longitude", "float"],
  ]),

  states: spec("states", [
    ["Id", "id", "int"],
    ["CountryId", "country_id", "int", "countries"],
    ["DoubleLetterCode", "double_letter_code", "string"],
    ["TripleLetterCode", "triple_letter_code", "string"],
    ["Name", "name", "string"],
    ["NELatitude", "ne_latitude", "float"],
    ["NELongitude", "ne_longitude", "float"],
    ["SWLatitude", "sw_latitude", "float"],
    ["SWLongitude", "sw_longitude", "float"],
    ["ComputedRHI5", "computed_rhi5", "float"],
    ["ComputedRHI10", "computed_rhi10", "float"],
    ["ComputedRHI20", "computed_rhi20", "float"],
    ["ComputedRGI5", "computed_rgi5", "float"],
    ["ComputedRGI10", "computed_rgi10", "float"],
    ["ComputedRGI20", "computed_rgi20", "float"],
    ["ComputedTreesMeasuredCount", "computed_trees_measured_count", "int"],
    ["ComputedLastMeasurementDate", "computed_last_measurement_date", "dateonly"],
    ["ComputedContainsEntityWithCoordinates", "computed_contains_entity_with_coordinates", "bool"],
    ["AreMetricsStale", "are_metrics_stale", "bool"],
    ["LastMetricsUpdateTimestamp", "last_metrics_update_timestamp", "datetime"],
  ]),

  sites: spec("sites", [
    ["Id", "id", "int"],
    ["ComputedLastMeasurementDate", "computed_last_measurement_date", "dateonly"],
    ["Name", "name", "string"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["CalculatedLatitude", "calculated_latitude", "float"],
    ["CalculatedLongitude", "calculated_longitude", "float"],
    ["ComputedRHI5", "computed_rhi5", "float"],
    ["ComputedRHI10", "computed_rhi10", "float"],
    ["ComputedRHI20", "computed_rhi20", "float"],
    ["ComputedRGI5", "computed_rgi5", "float"],
    ["ComputedRGI10", "computed_rgi10", "float"],
    ["ComputedRGI20", "computed_rgi20", "float"],
    ["VisitCount", "visit_count", "int"],
    ["CalculatedLatitudeInputFormat", "calculated_latitude_input_format", "int"],
    ["CalculatedLongitudeInputFormat", "calculated_longitude_input_format", "int"],
    ["ComputedTreesMeasuredCount", "computed_trees_measured_count", "int"],
    ["ComputedContainsEntityWithCoordinates", "computed_contains_entity_with_coordinates", "bool"],
    ["AreMetricsStale", "are_metrics_stale", "bool"],
    ["LastMetricsUpdateTimestamp", "last_metrics_update_timestamp", "datetime"],
    ["StateId", "state_id", "int", "states"],
    ["County", "county", "string"],
    ["OwnershipType", "ownership_type", "string"],
    ["OwnershipContactInfo", "ownership_contact_info", "string"],
    ["MakeOwnershipContactInfoPublic", "make_ownership_contact_info_public", "bool"],
  ]),

  site_visits: spec("site_visits", [
    ["Id", "id", "int"],
    ["SiteId", "site_id", "int", "sites"],
    ["ImportingTripId", "importing_trip_id", "int", "import_trips"],
    ["Visited", "visited", "dateonly"],
    ["Name", "name", "string"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["CalculatedLatitude", "calculated_latitude", "float"],
    ["CalculatedLongitude", "calculated_longitude", "float"],
    ["Comments", "comments", "string"],
    ["TripReportUrl", "trip_report_url", "string"],
    ["CalculatedLatitudeInputFormat", "calculated_latitude_input_format", "int"],
    ["CalculatedLongitudeInputFormat", "calculated_longitude_input_format", "int"],
    ["StateId", "state_id", "int", "states"],
    ["County", "county", "string"],
    ["OwnershipType", "ownership_type", "string"],
    ["OwnershipContactInfo", "ownership_contact_info", "string"],
    ["MakeOwnershipContactInfoPublic", "make_ownership_contact_info_public", "bool"],
  ]),

  site_visitors: spec("site_visitors", [
    ["Id", "id", "int"],
    ["SiteId", "site_id", "int", "sites"],
    ["SiteVisitId", "site_visit_id", "int", "site_visits"],
    ["FirstName", "first_name", "string"],
    ["LastName", "last_name", "string"],
  ]),

  trees: spec("trees", [
    ["Id", "id", "int"],
    ["ComputedMeasuredSpeciesId", "computed_measured_species_id", "int"],
    ["LastMeasured", "last_measured", "dateonly"],
    ["CommonName", "common_name", "string"],
    ["ScientificName", "scientific_name", "string"],
    ["Height", "height", "float"],
    ["HeightInputFormat", "height_input_format", "int"],
    ["HeightMeasurementMethod", "height_measurement_method", "int"],
    ["Girth", "girth", "float"],
    ["GirthInputFormat", "girth_input_format", "int"],
    ["CrownSpread", "crown_spread", "float"],
    ["CrownSpreadInputFormat", "crown_spread_input_format", "int"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["CalculatedLatitude", "calculated_latitude", "float"],
    ["CalculatedLongitude", "calculated_longitude", "float"],
    ["Elevation", "elevation", "float"],
    ["ElevationInputFormat", "elevation_input_format", "int"],
    ["Diameter", "diameter", "float"],
    ["DiameterInputFormat", "diameter_input_format", "int"],
    ["ENTSPTS", "entspts", "float"],
    ["ConicalVolume", "conical_volume", "float"],
    ["ConicalVolumeInputFormat", "conical_volume_input_format", "int"],
    ["ENTSPTS2", "entspts2", "float"],
    ["ChampionPoints", "champion_points", "float"],
    ["AbbreviatedChampionPoints", "abbreviated_champion_points", "float"],
    ["CalculatedLatitudeInputFormat", "calculated_latitude_input_format", "int"],
    ["CalculatedLongitudeInputFormat", "calculated_longitude_input_format", "int"],
    ["SiteId", "site_id", "int", "sites"],
  ]),

  tree_measurements: spec("tree_measurements", [
    ["Id", "id", "int"],
    ["TreeId", "tree_id", "int", "trees"],
    ["ImportingTripId", "importing_trip_id", "int", "import_trips"],
    ["ComputedMeasuredSpeciesId", "computed_measured_species_id", "int"],
    ["Measured", "measured", "dateonly"],
    ["CommonName", "common_name", "string"],
    ["ScientificName", "scientific_name", "string"],
    ["Height", "height", "float"],
    ["HeightInputFormat", "height_input_format", "int"],
    ["HeightMeasurementMethod", "height_measurement_method", "int"],
    ["Girth", "girth", "float"],
    ["GirthInputFormat", "girth_input_format", "int"],
    ["CrownSpread", "crown_spread", "float"],
    ["CrownSpreadInputFormat", "crown_spread_input_format", "int"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["CalculatedLatitude", "calculated_latitude", "float"],
    ["CalculatedLongitude", "calculated_longitude", "float"],
    ["Elevation", "elevation", "float"],
    ["ElevationInputFormat", "elevation_input_format", "int"],
    ["GeneralComments", "general_comments", "string"],
    ["Diameter", "diameter", "float"],
    ["DiameterInputFormat", "diameter_input_format", "int"],
    ["ENTSPTS", "entspts", "float"],
    ["ConicalVolume", "conical_volume", "float"],
    ["ConicalVolumeInputFormat", "conical_volume_input_format", "int"],
    ["ENTSPTS2", "entspts2", "float"],
    ["ChampionPoints", "champion_points", "float"],
    ["AbbreviatedChampionPoints", "abbreviated_champion_points", "float"],
    ["CalculatedLatitudeInputFormat", "calculated_latitude_input_format", "int"],
    ["CalculatedLongitudeInputFormat", "calculated_longitude_input_format", "int"],
  ]),

  tree_measurers: spec("tree_measurers", [
    ["Id", "id", "int"],
    ["TreeId", "tree_id", "int", "trees"],
    ["MeasurementId", "measurement_id", "int", "tree_measurements"],
    ["FirstName", "first_name", "string"],
    ["LastName", "last_name", "string"],
  ]),

  known_species: spec("known_species", [
    ["Id", "id", "int"],
    ["AcceptedSymbol", "accepted_symbol", "string"],
    ["ScientificName", "scientific_name", "string"],
    ["CommonName", "common_name", "string"],
  ]),

  photos: spec("photos", [
    ["Id", "id", "int"],
    ["CreatorUserId", "creator_user_id", "int", "users"],
    ["Created", "created", "datetime"],
    ["Width", "width", "int"],
    ["Height", "height", "int"],
    ["Bytes", "bytes", "int"],
    ["Format", "format", "int"],
  ]),

  photo_references: spec("photo_references", [
    ["Id", "id", "int"],
    ["Type", "type", "int"],
    ["ImportTreeId", "import_tree_id", "int", "import_trees"],
    ["TreeId", "tree_id", "int", "trees"],
    ["TreeMeasurementId", "tree_measurement_id", "int", "tree_measurements"],
    ["PhotoId", "photo_id", "int", "photos"],
    ["ImportSiteId", "import_site_id", "int", "import_sites"],
    ["SiteId", "site_id", "int", "sites"],
    ["SiteVisitId", "site_visit_id", "int", "site_visits"],
  ]),

  import_trips: spec("import_trips", [
    ["Id", "id", "int"],
    ["CreatorUserId", "creator_user_id", "int", "users"],
    ["Created", "created", "datetime"],
    ["Imported", "imported", "datetime"],
    ["Name", "name", "string"],
    ["Date", "date", "dateonly"],
    ["Website", "website", "string"],
    ["PhotosAvailable", "photos_available", "bool"],
    ["MeasurerContactInfo", "measurer_contact_info", "string"],
    ["MakeMeasurerContactInfoPublic", "make_measurer_contact_info_public", "bool"],
    ["DefaultLaserBrand", "default_laser_brand", "string"],
    ["DefaultClinometerBrand", "default_clinometer_brand", "string"],
    ["DefaultHeightMeasurementMethod", "default_height_measurement_method", "int"],
    ["DefaultStateId", "default_state_id", "int", "states"],
    ["DefaultCounty", "default_county", "string"],
    ["LastSaved", "last_saved", "datetime"],
  ]),

  import_trip_measurers: spec("import_trip_measurers", [
    ["Id", "id", "int"],
    ["TripId", "trip_id", "int", "import_trips"],
    ["FirstName", "first_name", "string"],
    ["LastName", "last_name", "string"],
  ]),

  import_sites: spec("import_sites", [
    ["Id", "id", "int"],
    ["Created", "created", "datetime"],
    ["CreatorUserId", "creator_user_id", "int", "users"],
    ["TripId", "trip_id", "int", "import_trips"],
    ["Name", "name", "string"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["Comments", "comments", "string"],
    ["StateId", "state_id", "int", "states"],
    ["County", "county", "string"],
    ["OwnershipType", "ownership_type", "string"],
    ["OwnershipContactInfo", "ownership_contact_info", "string"],
    ["MakeOwnershipContactInfoPublic", "make_ownership_contact_info_public", "bool"],
  ]),

  import_trees: spec("import_trees", [
    ["Id", "id", "int"],
    ["Created", "created", "datetime"],
    ["CreatorUserId", "creator_user_id", "int", "users"],
    ["Type", "type", "int"],
    ["TreeName", "tree_name", "string"],
    ["TreeNumber", "tree_number", "int"],
    ["CommonName", "common_name", "string"],
    ["ScientificName", "scientific_name", "string"],
    ["Status", "status", "int"],
    ["HealthStatus", "health_status", "string"],
    ["AgeClass", "age_class", "int"],
    ["AgeType", "age_type", "int"],
    ["Age", "age", "int"],
    ["GeneralComments", "general_comments", "string"],
    ["Latitude", "latitude", "float"],
    ["LatitudeInputFormat", "latitude_input_format", "int"],
    ["Longitude", "longitude", "float"],
    ["LongitudeInputFormat", "longitude_input_format", "int"],
    ["MakeCoordinatesPublic", "make_coordinates_public", "bool"],
    ["Elevation", "elevation", "float"],
    ["ElevationInputFormat", "elevation_input_format", "int"],
    ["Height", "height", "float"],
    ["HeightInputFormat", "height_input_format", "int"],
    ["HeightMeasurementMethod", "height_measurement_method", "int"],
    ["HeightMeasurementsDistanceTop", "height_measurements_distance_top", "float"],
    ["HeightMeasurementsDistanceTopInputFormat", "height_measurements_distance_top_input_format", "int"],
    ["HeightMeasurementsAngleTop", "height_measurements_angle_top", "float"],
    ["HeightMeasurementsAngleTopInputFormat", "height_measurements_angle_top_input_format", "int"],
    ["HeightMeasurementsDistanceBottom", "height_measurements_distance_bottom", "float"],
    ["HeightMeasurementsDistanceBottomInputFormat", "height_measurements_distance_bottom_input_format", "int"],
    ["HeightMeasurementsAngleBottom", "height_measurements_angle_bottom", "float"],
    ["HeightMeasurementsAngleBottomInputFormat", "height_measurements_angle_bottom_input_format", "int"],
    ["HeightMeasurementsVerticalOffset", "height_measurements_vertical_offset", "float"],
    ["HeightMeasurementsVerticalOffsetInputFormat", "height_measurements_vertical_offset_input_format", "int"],
    ["HeightMeasurementType", "height_measurement_type", "string"],
    ["LaserBrand", "laser_brand", "string"],
    ["ClinometerBrand", "clinometer_brand", "string"],
    ["HeightComments", "height_comments", "string"],
    ["Girth", "girth", "float"],
    ["GirthInputFormat", "girth_input_format", "int"],
    ["GirthMeasurementHeight", "girth_measurement_height", "float"],
    ["GirthMeasurementHeightInputFormat", "girth_measurement_height_input_format", "int"],
    ["GirthRootCollarHeight", "girth_root_collar_height", "float"],
    ["GirthRootCollarHeightInputFormat", "girth_root_collar_height_input_format", "int"],
    ["GirthComments", "girth_comments", "string"],
    ["CrownSpread", "crown_spread", "float"],
    ["CrownSpreadInputFormat", "crown_spread_input_format", "int"],
    ["MaximumLimbLength", "maximum_limb_length", "float"],
    ["MaximumLimbLengthInputFormat", "maximum_limb_length_input_format", "int"],
    ["CrownSpreadMeasurementMethod", "crown_spread_measurement_method", "string"],
    ["BaseCrownHeight", "base_crown_height", "float"],
    ["BaseCrownHeightInputFormat", "base_crown_height_input_format", "int"],
    ["CrownVolume", "crown_volume", "float"],
    ["CrownVolumeInputFormat", "crown_volume_input_format", "int"],
    ["CrownVolumeCalculationMethod", "crown_volume_calculation_method", "string"],
    ["CrownComments", "crown_comments", "string"],
    ["TrunkVolume", "trunk_volume", "float"],
    ["TrunkVolumeInputFormat", "trunk_volume_input_format", "int"],
    ["TrunkVolumeCalculationMethod", "trunk_volume_calculation_method", "string"],
    ["TrunkComments", "trunk_comments", "string"],
    ["FormType", "form_type", "int"],
    ["NumberOfTrunks", "number_of_trunks", "int"],
    ["TreeFormComments", "tree_form_comments", "string"],
    ["TerrainType", "terrain_type", "int"],
    ["TerrainShapeIndex", "terrain_shape_index", "float"],
    ["LandformIndex", "landform_index", "float"],
    ["TerrainComments", "terrain_comments", "string"],
    ["CombinedGirthNumberOfTrunks", "combined_girth_number_of_trunks", "int"],
    ["SiteId", "site_id", "int", "import_sites"],
  ]),

  import_trunks: spec("import_trunks", [
    ["Id", "id", "int"],
    ["Created", "created", "datetime"],
    ["CreatorUserId", "creator_user_id", "int", "users"],
    ["TreeId", "tree_id", "int", "import_trees"],
    ["Girth", "girth", "float"],
    ["GirthInputFormat", "girth_input_format", "int"],
    ["GirthMeasurementHeight", "girth_measurement_height", "float"],
    ["GirthMeasurementHeightInputFormat", "girth_measurement_height_input_format", "int"],
    ["Height", "height", "float"],
    ["HeightInputFormat", "height_input_format", "int"],
    ["HeightMeasurementsDistanceTop", "height_measurements_distance_top", "float"],
    ["HeightMeasurementsDistanceTopInputFormat", "height_measurements_distance_top_input_format", "int"],
    ["HeightMeasurementsAngleTop", "height_measurements_angle_top", "float"],
    ["HeightMeasurementsAngleTopInputFormat", "height_measurements_angle_top_input_format", "int"],
    ["HeightMeasurementsDistanceBottom", "height_measurements_distance_bottom", "float"],
    ["HeightMeasurementsDistanceBottomInputFormat", "height_measurements_distance_bottom_input_format", "int"],
    ["HeightMeasurementsAngleBottom", "height_measurements_angle_bottom", "float"],
    ["HeightMeasurementsAngleBottomInputFormat", "height_measurements_angle_bottom_input_format", "int"],
    ["HeightMeasurementsVerticalOffset", "height_measurements_vertical_offset", "float"],
    ["HeightMeasurementsVerticalOffsetInputFormat", "height_measurements_vertical_offset_input_format", "int"],
    ["IncludeHeightDistanceAndAngleMeasurements", "include_height_distance_and_angle_measurements", "bool"],
    ["TrunkComments", "trunk_comments", "string"],
  ]),
};

/** All 17 table names, in FK-safe dependency order (parents before children) - matches doc 07 §7.1's table list order / P0-04 load order. */
export const ALL_TABLES: readonly string[] = [
  "countries",
  "states",
  "users",
  "sites",
  "site_visits",
  "site_visitors",
  "known_species",
  "trees",
  "tree_measurements",
  "tree_measurers",
  "photos",
  "photo_references",
  "import_trips",
  "import_trip_measurers",
  "import_sites",
  "import_trees",
  "import_trunks",
];

/** Tables compared fully but whose report entries must be redacted to aggregates only (PII rule, doc 07 §7.1). */
export const PII_REDACTED_TABLES: readonly string[] = ["users"];
