/**
 * Table configuration for the P0-04 ETL loader: per-table column mapping
 * (legacy CSV header name -> Postgres column + cast type), FK-dependency
 * load order, and the FK list used for the post-load orphan check.
 *
 * Column lists here are the *expected* legacy CSV header names/order, taken
 * from the `-- columns: ...` markers in web/scripts/dump-legacy.sql (P0-03,
 * read-only to this task). The loader does NOT trust this order blindly: it
 * reads each CSV's actual header row at load time and maps by name (see
 * load-table.ts), so a reordering of dump-legacy.sql's SELECT list doesn't
 * break the load. What this module fixes is: which Postgres column a given
 * legacy column name maps to, and how to CAST it out of the (all-text)
 * staging table.
 *
 * Per-column `type` drives the CAST expression applied when moving a value
 * from the text staging column into the real target column
 * (see load-table.ts `castExpr`):
 *   - "integer" | "smallint" | "real" | "boolean" | "date"  -> `col::type`
 *   - "timestamptz" -> `(col::timestamp) AT TIME ZONE 'UTC'` (D-002: legacy
 *     datetimes have no offset in the dump; treat the naive value as UTC
 *     wall-clock, independent of the loading session's time zone setting)
 *   - "bytea"  -> `decode(col, 'hex')` (dump hex has no `\x`/`0x` prefix -
 *     COPY-ing straight into a bytea column would misinterpret it via
 *     Postgres's "escape format" input parser, hence the text-staging step)
 *   - "string" -> `col` as-is (implicit assignment cast text -> varchar/char
 *     covers this; no trimming/case changes per doc 02 P0-04 instructions)
 *
 * `pgOnlyColumns`: target columns that exist in schema.ts but have no
 * source in the legacy dump (currently only `photo_references.caption`,
 * added new in P0-02 - see schema.ts file header note 5, and the P0-03
 * integration note confirming the dump has no Caption column). These are
 * always inserted as SQL NULL.
 */

export type ColumnType =
  | "integer"
  | "smallint"
  | "real"
  | "boolean"
  | "date"
  | "timestamptz"
  | "bytea"
  | "string";

export interface ColumnMapping {
  /** Legacy CSV header name, exactly as emitted by dump-legacy.sql/.ps1. */
  legacy: string;
  /** Postgres column name (snake_case, per db/schema.ts). */
  pg: string;
  type: ColumnType;
}

export interface TableConfig {
  /** Postgres table name == CSV base filename (web/parity/dumps/<name>.csv). */
  name: string;
  columns: ColumnMapping[];
  /** Target columns with no source column in the legacy dump; loaded as NULL. */
  pgOnlyColumns?: string[];
}

export interface ForeignKey {
  table: string;
  column: string;
  refTable: string;
  /** Whether the FK column is nullable (informational only; the orphan
   * check itself already skips NULLs on either nullable or not-null
   * columns, since a NOT NULL violation would have failed at load time). */
  nullable: boolean;
}

const users: TableConfig = {
  name: "users",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "Email", pg: "email", type: "string" },
    { legacy: "Firstname", pg: "firstname", type: "string" },
    { legacy: "Lastname", pg: "lastname", type: "string" },
    { legacy: "Roles", pg: "roles", type: "smallint" },
    { legacy: "PasswordHash", pg: "password_hash", type: "bytea" },
    { legacy: "PasswordNumerics", pg: "password_numerics", type: "integer" },
    {
      legacy: "PasswordUppercase",
      pg: "password_uppercase",
      type: "integer",
    },
    {
      legacy: "PasswordLowercase",
      pg: "password_lowercase",
      type: "integer",
    },
    { legacy: "PasswordSpecials", pg: "password_specials", type: "integer" },
    { legacy: "PasswordLength", pg: "password_length", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "LastLogin", pg: "last_login", type: "timestamptz" },
    {
      legacy: "EmailVerificationToken",
      pg: "email_verification_token",
      type: "bytea",
    },
    {
      legacy: "RecentlyFailedLoginAttempts",
      pg: "recently_failed_login_attempts",
      type: "integer",
    },
    { legacy: "EmailVerified", pg: "email_verified", type: "timestamptz" },
    {
      legacy: "LastFailedLoginAttempt",
      pg: "last_failed_login_attempt",
      type: "timestamptz",
    },
    {
      legacy: "ForgottenPasswordAssistanceToken",
      pg: "forgotten_password_assistance_token",
      type: "bytea",
    },
    {
      legacy: "ForgottenPasswordAssistanceTokenIssued",
      pg: "forgotten_password_assistance_token_issued",
      type: "timestamptz",
    },
    {
      legacy: "ForgottenPasswordAssistanceTokenUsed",
      pg: "forgotten_password_assistance_token_used",
      type: "timestamptz",
    },
  ],
};

const countries: TableConfig = {
  name: "countries",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "DoubleLetterCode", pg: "double_letter_code", type: "string" },
    { legacy: "TripleLetterCode", pg: "triple_letter_code", type: "string" },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "NELatitude", pg: "ne_latitude", type: "real" },
    { legacy: "NELongitude", pg: "ne_longitude", type: "real" },
    { legacy: "SWLatitude", pg: "sw_latitude", type: "real" },
    { legacy: "SWLongitude", pg: "sw_longitude", type: "real" },
  ],
};

const states: TableConfig = {
  name: "states",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "CountryId", pg: "country_id", type: "integer" },
    { legacy: "DoubleLetterCode", pg: "double_letter_code", type: "string" },
    { legacy: "TripleLetterCode", pg: "triple_letter_code", type: "string" },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "NELatitude", pg: "ne_latitude", type: "real" },
    { legacy: "NELongitude", pg: "ne_longitude", type: "real" },
    { legacy: "SWLatitude", pg: "sw_latitude", type: "real" },
    { legacy: "SWLongitude", pg: "sw_longitude", type: "real" },
    { legacy: "ComputedRHI5", pg: "computed_rhi5", type: "real" },
    { legacy: "ComputedRHI10", pg: "computed_rhi10", type: "real" },
    { legacy: "ComputedRHI20", pg: "computed_rhi20", type: "real" },
    { legacy: "ComputedRGI5", pg: "computed_rgi5", type: "real" },
    { legacy: "ComputedRGI10", pg: "computed_rgi10", type: "real" },
    { legacy: "ComputedRGI20", pg: "computed_rgi20", type: "real" },
    {
      legacy: "ComputedTreesMeasuredCount",
      pg: "computed_trees_measured_count",
      type: "integer",
    },
    {
      legacy: "ComputedLastMeasurementDate",
      pg: "computed_last_measurement_date",
      type: "date",
    },
    {
      legacy: "ComputedContainsEntityWithCoordinates",
      pg: "computed_contains_entity_with_coordinates",
      type: "boolean",
    },
    { legacy: "AreMetricsStale", pg: "are_metrics_stale", type: "boolean" },
    {
      legacy: "LastMetricsUpdateTimestamp",
      pg: "last_metrics_update_timestamp",
      type: "timestamptz",
    },
  ],
};

const sites: TableConfig = {
  name: "sites",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    {
      legacy: "ComputedLastMeasurementDate",
      pg: "computed_last_measurement_date",
      type: "date",
    },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    { legacy: "CalculatedLatitude", pg: "calculated_latitude", type: "real" },
    {
      legacy: "CalculatedLongitude",
      pg: "calculated_longitude",
      type: "real",
    },
    { legacy: "ComputedRHI5", pg: "computed_rhi5", type: "real" },
    { legacy: "ComputedRHI10", pg: "computed_rhi10", type: "real" },
    { legacy: "ComputedRHI20", pg: "computed_rhi20", type: "real" },
    { legacy: "ComputedRGI5", pg: "computed_rgi5", type: "real" },
    { legacy: "ComputedRGI10", pg: "computed_rgi10", type: "real" },
    { legacy: "ComputedRGI20", pg: "computed_rgi20", type: "real" },
    { legacy: "VisitCount", pg: "visit_count", type: "integer" },
    {
      legacy: "CalculatedLatitudeInputFormat",
      pg: "calculated_latitude_input_format",
      type: "smallint",
    },
    {
      legacy: "CalculatedLongitudeInputFormat",
      pg: "calculated_longitude_input_format",
      type: "smallint",
    },
    {
      legacy: "ComputedTreesMeasuredCount",
      pg: "computed_trees_measured_count",
      type: "integer",
    },
    {
      legacy: "ComputedContainsEntityWithCoordinates",
      pg: "computed_contains_entity_with_coordinates",
      type: "boolean",
    },
    { legacy: "AreMetricsStale", pg: "are_metrics_stale", type: "boolean" },
    {
      legacy: "LastMetricsUpdateTimestamp",
      pg: "last_metrics_update_timestamp",
      type: "timestamptz",
    },
    { legacy: "StateId", pg: "state_id", type: "integer" },
    { legacy: "County", pg: "county", type: "string" },
    { legacy: "OwnershipType", pg: "ownership_type", type: "string" },
    {
      legacy: "OwnershipContactInfo",
      pg: "ownership_contact_info",
      type: "string",
    },
    {
      legacy: "MakeOwnershipContactInfoPublic",
      pg: "make_ownership_contact_info_public",
      type: "boolean",
    },
  ],
};

const siteVisits: TableConfig = {
  name: "site_visits",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "SiteId", pg: "site_id", type: "integer" },
    { legacy: "ImportingTripId", pg: "importing_trip_id", type: "integer" },
    { legacy: "Visited", pg: "visited", type: "date" },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    { legacy: "CalculatedLatitude", pg: "calculated_latitude", type: "real" },
    {
      legacy: "CalculatedLongitude",
      pg: "calculated_longitude",
      type: "real",
    },
    { legacy: "Comments", pg: "comments", type: "string" },
    { legacy: "TripReportUrl", pg: "trip_report_url", type: "string" },
    {
      legacy: "CalculatedLatitudeInputFormat",
      pg: "calculated_latitude_input_format",
      type: "smallint",
    },
    {
      legacy: "CalculatedLongitudeInputFormat",
      pg: "calculated_longitude_input_format",
      type: "smallint",
    },
    { legacy: "StateId", pg: "state_id", type: "integer" },
    { legacy: "County", pg: "county", type: "string" },
    { legacy: "OwnershipType", pg: "ownership_type", type: "string" },
    {
      legacy: "OwnershipContactInfo",
      pg: "ownership_contact_info",
      type: "string",
    },
    {
      legacy: "MakeOwnershipContactInfoPublic",
      pg: "make_ownership_contact_info_public",
      type: "boolean",
    },
  ],
};

const siteVisitors: TableConfig = {
  name: "site_visitors",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "SiteId", pg: "site_id", type: "integer" },
    { legacy: "SiteVisitId", pg: "site_visit_id", type: "integer" },
    { legacy: "FirstName", pg: "first_name", type: "string" },
    { legacy: "LastName", pg: "last_name", type: "string" },
  ],
};

const knownSpecies: TableConfig = {
  name: "known_species",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "AcceptedSymbol", pg: "accepted_symbol", type: "string" },
    { legacy: "ScientificName", pg: "scientific_name", type: "string" },
    { legacy: "CommonName", pg: "common_name", type: "string" },
  ],
};

const trees: TableConfig = {
  name: "trees",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    {
      legacy: "ComputedMeasuredSpeciesId",
      pg: "computed_measured_species_id",
      type: "integer",
    },
    { legacy: "LastMeasured", pg: "last_measured", type: "date" },
    { legacy: "CommonName", pg: "common_name", type: "string" },
    { legacy: "ScientificName", pg: "scientific_name", type: "string" },
    { legacy: "Height", pg: "height", type: "real" },
    {
      legacy: "HeightInputFormat",
      pg: "height_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementMethod",
      pg: "height_measurement_method",
      type: "smallint",
    },
    { legacy: "Girth", pg: "girth", type: "real" },
    {
      legacy: "GirthInputFormat",
      pg: "girth_input_format",
      type: "smallint",
    },
    { legacy: "CrownSpread", pg: "crown_spread", type: "real" },
    {
      legacy: "CrownSpreadInputFormat",
      pg: "crown_spread_input_format",
      type: "smallint",
    },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    { legacy: "CalculatedLatitude", pg: "calculated_latitude", type: "real" },
    {
      legacy: "CalculatedLongitude",
      pg: "calculated_longitude",
      type: "real",
    },
    { legacy: "Elevation", pg: "elevation", type: "real" },
    {
      legacy: "ElevationInputFormat",
      pg: "elevation_input_format",
      type: "smallint",
    },
    { legacy: "Diameter", pg: "diameter", type: "real" },
    {
      legacy: "DiameterInputFormat",
      pg: "diameter_input_format",
      type: "smallint",
    },
    { legacy: "ENTSPTS", pg: "entspts", type: "real" },
    { legacy: "ConicalVolume", pg: "conical_volume", type: "real" },
    {
      legacy: "ConicalVolumeInputFormat",
      pg: "conical_volume_input_format",
      type: "smallint",
    },
    { legacy: "ENTSPTS2", pg: "entspts2", type: "real" },
    { legacy: "ChampionPoints", pg: "champion_points", type: "real" },
    {
      legacy: "AbbreviatedChampionPoints",
      pg: "abbreviated_champion_points",
      type: "real",
    },
    {
      legacy: "CalculatedLatitudeInputFormat",
      pg: "calculated_latitude_input_format",
      type: "smallint",
    },
    {
      legacy: "CalculatedLongitudeInputFormat",
      pg: "calculated_longitude_input_format",
      type: "smallint",
    },
    { legacy: "SiteId", pg: "site_id", type: "integer" },
  ],
};

const treeMeasurements: TableConfig = {
  name: "tree_measurements",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "TreeId", pg: "tree_id", type: "integer" },
    { legacy: "ImportingTripId", pg: "importing_trip_id", type: "integer" },
    {
      legacy: "ComputedMeasuredSpeciesId",
      pg: "computed_measured_species_id",
      type: "integer",
    },
    { legacy: "Measured", pg: "measured", type: "date" },
    { legacy: "CommonName", pg: "common_name", type: "string" },
    { legacy: "ScientificName", pg: "scientific_name", type: "string" },
    { legacy: "Height", pg: "height", type: "real" },
    {
      legacy: "HeightInputFormat",
      pg: "height_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementMethod",
      pg: "height_measurement_method",
      type: "smallint",
    },
    { legacy: "Girth", pg: "girth", type: "real" },
    {
      legacy: "GirthInputFormat",
      pg: "girth_input_format",
      type: "smallint",
    },
    { legacy: "CrownSpread", pg: "crown_spread", type: "real" },
    {
      legacy: "CrownSpreadInputFormat",
      pg: "crown_spread_input_format",
      type: "smallint",
    },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    { legacy: "CalculatedLatitude", pg: "calculated_latitude", type: "real" },
    {
      legacy: "CalculatedLongitude",
      pg: "calculated_longitude",
      type: "real",
    },
    { legacy: "Elevation", pg: "elevation", type: "real" },
    {
      legacy: "ElevationInputFormat",
      pg: "elevation_input_format",
      type: "smallint",
    },
    { legacy: "GeneralComments", pg: "general_comments", type: "string" },
    { legacy: "Diameter", pg: "diameter", type: "real" },
    {
      legacy: "DiameterInputFormat",
      pg: "diameter_input_format",
      type: "smallint",
    },
    { legacy: "ENTSPTS", pg: "entspts", type: "real" },
    { legacy: "ConicalVolume", pg: "conical_volume", type: "real" },
    {
      legacy: "ConicalVolumeInputFormat",
      pg: "conical_volume_input_format",
      type: "smallint",
    },
    { legacy: "ENTSPTS2", pg: "entspts2", type: "real" },
    { legacy: "ChampionPoints", pg: "champion_points", type: "real" },
    {
      legacy: "AbbreviatedChampionPoints",
      pg: "abbreviated_champion_points",
      type: "real",
    },
    {
      legacy: "CalculatedLatitudeInputFormat",
      pg: "calculated_latitude_input_format",
      type: "smallint",
    },
    {
      legacy: "CalculatedLongitudeInputFormat",
      pg: "calculated_longitude_input_format",
      type: "smallint",
    },
  ],
};

const treeMeasurers: TableConfig = {
  name: "tree_measurers",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "TreeId", pg: "tree_id", type: "integer" },
    { legacy: "MeasurementId", pg: "measurement_id", type: "integer" },
    { legacy: "FirstName", pg: "first_name", type: "string" },
    { legacy: "LastName", pg: "last_name", type: "string" },
  ],
};

const photos: TableConfig = {
  name: "photos",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "CreatorUserId", pg: "creator_user_id", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "Width", pg: "width", type: "integer" },
    { legacy: "Height", pg: "height", type: "integer" },
    { legacy: "Bytes", pg: "bytes", type: "integer" },
    { legacy: "Format", pg: "format", type: "smallint" },
  ],
};

const photoReferences: TableConfig = {
  name: "photo_references",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "Type", pg: "type", type: "smallint" },
    { legacy: "ImportTreeId", pg: "import_tree_id", type: "integer" },
    { legacy: "TreeId", pg: "tree_id", type: "integer" },
    {
      legacy: "TreeMeasurementId",
      pg: "tree_measurement_id",
      type: "integer",
    },
    { legacy: "PhotoId", pg: "photo_id", type: "integer" },
    { legacy: "ImportSiteId", pg: "import_site_id", type: "integer" },
    { legacy: "SiteId", pg: "site_id", type: "integer" },
    { legacy: "SiteVisitId", pg: "site_visit_id", type: "integer" },
  ],
  // Photos.References has no Caption column in the legacy DB (confirmed by
  // the P0-03 dump: 9 CSV columns, no Caption) - schema.ts adds `caption`
  // as a new nullable column for the ported app (file header note 5).
  // Always loaded as NULL; never sourced from the dump.
  pgOnlyColumns: ["caption"],
};

const importTrips: TableConfig = {
  name: "import_trips",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "CreatorUserId", pg: "creator_user_id", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "Imported", pg: "imported", type: "timestamptz" },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "Date", pg: "date", type: "date" },
    { legacy: "Website", pg: "website", type: "string" },
    { legacy: "PhotosAvailable", pg: "photos_available", type: "boolean" },
    {
      legacy: "MeasurerContactInfo",
      pg: "measurer_contact_info",
      type: "string",
    },
    {
      legacy: "MakeMeasurerContactInfoPublic",
      pg: "make_measurer_contact_info_public",
      type: "boolean",
    },
    {
      legacy: "DefaultLaserBrand",
      pg: "default_laser_brand",
      type: "string",
    },
    {
      legacy: "DefaultClinometerBrand",
      pg: "default_clinometer_brand",
      type: "string",
    },
    {
      legacy: "DefaultHeightMeasurementMethod",
      pg: "default_height_measurement_method",
      type: "smallint",
    },
    { legacy: "DefaultStateId", pg: "default_state_id", type: "integer" },
    { legacy: "DefaultCounty", pg: "default_county", type: "string" },
    { legacy: "LastSaved", pg: "last_saved", type: "timestamptz" },
  ],
};

const importTripMeasurers: TableConfig = {
  name: "import_trip_measurers",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "TripId", pg: "trip_id", type: "integer" },
    { legacy: "FirstName", pg: "first_name", type: "string" },
    { legacy: "LastName", pg: "last_name", type: "string" },
  ],
};

const importSites: TableConfig = {
  name: "import_sites",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "CreatorUserId", pg: "creator_user_id", type: "integer" },
    { legacy: "TripId", pg: "trip_id", type: "integer" },
    { legacy: "Name", pg: "name", type: "string" },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    { legacy: "Comments", pg: "comments", type: "string" },
    { legacy: "StateId", pg: "state_id", type: "integer" },
    { legacy: "County", pg: "county", type: "string" },
    { legacy: "OwnershipType", pg: "ownership_type", type: "string" },
    {
      legacy: "OwnershipContactInfo",
      pg: "ownership_contact_info",
      type: "string",
    },
    {
      legacy: "MakeOwnershipContactInfoPublic",
      pg: "make_ownership_contact_info_public",
      type: "boolean",
    },
  ],
};

const importTrees: TableConfig = {
  name: "import_trees",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "CreatorUserId", pg: "creator_user_id", type: "integer" },
    { legacy: "Type", pg: "type", type: "smallint" },
    { legacy: "TreeName", pg: "tree_name", type: "string" },
    { legacy: "TreeNumber", pg: "tree_number", type: "integer" },
    { legacy: "CommonName", pg: "common_name", type: "string" },
    { legacy: "ScientificName", pg: "scientific_name", type: "string" },
    { legacy: "Status", pg: "status", type: "smallint" },
    { legacy: "HealthStatus", pg: "health_status", type: "string" },
    { legacy: "AgeClass", pg: "age_class", type: "smallint" },
    { legacy: "AgeType", pg: "age_type", type: "smallint" },
    { legacy: "Age", pg: "age", type: "integer" },
    { legacy: "GeneralComments", pg: "general_comments", type: "string" },
    { legacy: "Latitude", pg: "latitude", type: "real" },
    {
      legacy: "LatitudeInputFormat",
      pg: "latitude_input_format",
      type: "smallint",
    },
    { legacy: "Longitude", pg: "longitude", type: "real" },
    {
      legacy: "LongitudeInputFormat",
      pg: "longitude_input_format",
      type: "smallint",
    },
    {
      legacy: "MakeCoordinatesPublic",
      pg: "make_coordinates_public",
      type: "boolean",
    },
    { legacy: "Elevation", pg: "elevation", type: "real" },
    {
      legacy: "ElevationInputFormat",
      pg: "elevation_input_format",
      type: "smallint",
    },
    { legacy: "Height", pg: "height", type: "real" },
    {
      legacy: "HeightInputFormat",
      pg: "height_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementMethod",
      pg: "height_measurement_method",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsDistanceTop",
      pg: "height_measurements_distance_top",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsDistanceTopInputFormat",
      pg: "height_measurements_distance_top_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsAngleTop",
      pg: "height_measurements_angle_top",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsAngleTopInputFormat",
      pg: "height_measurements_angle_top_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsDistanceBottom",
      pg: "height_measurements_distance_bottom",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsDistanceBottomInputFormat",
      pg: "height_measurements_distance_bottom_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsAngleBottom",
      pg: "height_measurements_angle_bottom",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsAngleBottomInputFormat",
      pg: "height_measurements_angle_bottom_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsVerticalOffset",
      pg: "height_measurements_vertical_offset",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsVerticalOffsetInputFormat",
      pg: "height_measurements_vertical_offset_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementType",
      pg: "height_measurement_type",
      type: "string",
    },
    { legacy: "LaserBrand", pg: "laser_brand", type: "string" },
    { legacy: "ClinometerBrand", pg: "clinometer_brand", type: "string" },
    { legacy: "HeightComments", pg: "height_comments", type: "string" },
    { legacy: "Girth", pg: "girth", type: "real" },
    {
      legacy: "GirthInputFormat",
      pg: "girth_input_format",
      type: "smallint",
    },
    {
      legacy: "GirthMeasurementHeight",
      pg: "girth_measurement_height",
      type: "real",
    },
    {
      legacy: "GirthMeasurementHeightInputFormat",
      pg: "girth_measurement_height_input_format",
      type: "smallint",
    },
    {
      legacy: "GirthRootCollarHeight",
      pg: "girth_root_collar_height",
      type: "real",
    },
    {
      legacy: "GirthRootCollarHeightInputFormat",
      pg: "girth_root_collar_height_input_format",
      type: "smallint",
    },
    { legacy: "GirthComments", pg: "girth_comments", type: "string" },
    { legacy: "CrownSpread", pg: "crown_spread", type: "real" },
    {
      legacy: "CrownSpreadInputFormat",
      pg: "crown_spread_input_format",
      type: "smallint",
    },
    {
      legacy: "MaximumLimbLength",
      pg: "maximum_limb_length",
      type: "real",
    },
    {
      legacy: "MaximumLimbLengthInputFormat",
      pg: "maximum_limb_length_input_format",
      type: "smallint",
    },
    {
      legacy: "CrownSpreadMeasurementMethod",
      pg: "crown_spread_measurement_method",
      type: "string",
    },
    { legacy: "BaseCrownHeight", pg: "base_crown_height", type: "real" },
    {
      legacy: "BaseCrownHeightInputFormat",
      pg: "base_crown_height_input_format",
      type: "smallint",
    },
    { legacy: "CrownVolume", pg: "crown_volume", type: "real" },
    {
      legacy: "CrownVolumeInputFormat",
      pg: "crown_volume_input_format",
      type: "smallint",
    },
    {
      legacy: "CrownVolumeCalculationMethod",
      pg: "crown_volume_calculation_method",
      type: "string",
    },
    { legacy: "CrownComments", pg: "crown_comments", type: "string" },
    { legacy: "TrunkVolume", pg: "trunk_volume", type: "real" },
    {
      legacy: "TrunkVolumeInputFormat",
      pg: "trunk_volume_input_format",
      type: "smallint",
    },
    {
      legacy: "TrunkVolumeCalculationMethod",
      pg: "trunk_volume_calculation_method",
      type: "string",
    },
    { legacy: "TrunkComments", pg: "trunk_comments", type: "string" },
    { legacy: "FormType", pg: "form_type", type: "smallint" },
    { legacy: "NumberOfTrunks", pg: "number_of_trunks", type: "integer" },
    { legacy: "TreeFormComments", pg: "tree_form_comments", type: "string" },
    { legacy: "TerrainType", pg: "terrain_type", type: "smallint" },
    { legacy: "TerrainShapeIndex", pg: "terrain_shape_index", type: "real" },
    { legacy: "LandformIndex", pg: "landform_index", type: "real" },
    { legacy: "TerrainComments", pg: "terrain_comments", type: "string" },
    {
      legacy: "CombinedGirthNumberOfTrunks",
      pg: "combined_girth_number_of_trunks",
      type: "integer",
    },
    { legacy: "SiteId", pg: "site_id", type: "integer" },
  ],
};

const importTrunks: TableConfig = {
  name: "import_trunks",
  columns: [
    { legacy: "Id", pg: "id", type: "integer" },
    { legacy: "Created", pg: "created", type: "timestamptz" },
    { legacy: "CreatorUserId", pg: "creator_user_id", type: "integer" },
    { legacy: "TreeId", pg: "tree_id", type: "integer" },
    { legacy: "Girth", pg: "girth", type: "real" },
    {
      legacy: "GirthInputFormat",
      pg: "girth_input_format",
      type: "smallint",
    },
    {
      legacy: "GirthMeasurementHeight",
      pg: "girth_measurement_height",
      type: "real",
    },
    {
      legacy: "GirthMeasurementHeightInputFormat",
      pg: "girth_measurement_height_input_format",
      type: "smallint",
    },
    { legacy: "Height", pg: "height", type: "real" },
    {
      legacy: "HeightInputFormat",
      pg: "height_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsDistanceTop",
      pg: "height_measurements_distance_top",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsDistanceTopInputFormat",
      pg: "height_measurements_distance_top_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsAngleTop",
      pg: "height_measurements_angle_top",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsAngleTopInputFormat",
      pg: "height_measurements_angle_top_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsDistanceBottom",
      pg: "height_measurements_distance_bottom",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsDistanceBottomInputFormat",
      pg: "height_measurements_distance_bottom_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsAngleBottom",
      pg: "height_measurements_angle_bottom",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsAngleBottomInputFormat",
      pg: "height_measurements_angle_bottom_input_format",
      type: "smallint",
    },
    {
      legacy: "HeightMeasurementsVerticalOffset",
      pg: "height_measurements_vertical_offset",
      type: "real",
    },
    {
      legacy: "HeightMeasurementsVerticalOffsetInputFormat",
      pg: "height_measurements_vertical_offset_input_format",
      type: "smallint",
    },
    {
      legacy: "IncludeHeightDistanceAndAngleMeasurements",
      pg: "include_height_distance_and_angle_measurements",
      type: "boolean",
    },
    { legacy: "TrunkComments", pg: "trunk_comments", type: "string" },
  ],
};

/** Every table this loader knows about, keyed by Postgres table name. */
export const TABLES: Record<string, TableConfig> = {
  countries,
  users,
  known_species: knownSpecies,
  states,
  sites,
  import_trips: importTrips,
  import_trip_measurers: importTripMeasurers,
  import_sites: importSites,
  import_trees: importTrees,
  import_trunks: importTrunks,
  site_visits: siteVisits,
  site_visitors: siteVisitors,
  trees,
  tree_measurements: treeMeasurements,
  tree_measurers: treeMeasurers,
  photos,
  photo_references: photoReferences,
};

/**
 * FK-dependency load order (also the drop/truncate order in reverse).
 *
 * Derived from every `ALTER TABLE ... FOREIGN KEY` in
 * db/migrations/0000_striped_talos.sql (30 constraints total), verified by
 * hand into a topological order:
 *
 *   countries              (no FK)
 *   users                  (no FK)
 *   known_species          (no FK)
 *   states                 <- countries
 *   sites                  <- states
 *   import_trips           <- users, states
 *   import_trip_measurers  <- import_trips
 *   import_sites           <- users, import_trips, states
 *   import_trees           <- users, import_sites
 *   import_trunks          <- users, import_trees
 *   site_visits             <- sites, import_trips, states
 *   site_visitors           <- sites, site_visits
 *   trees                   <- sites
 *   tree_measurements       <- trees, import_trips
 *   tree_measurers          <- trees, tree_measurements
 *   photos                  <- users
 *   photo_references        <- import_sites, import_trees, sites,
 *                               site_visits, trees, tree_measurements, photos
 *
 * (The doc 02 P0-04 task text sketches a slightly different-looking order;
 * this one groups each bag/child table with its parent and has been
 * verified against the actual FK constraints rather than assumed.)
 */
export const LOAD_ORDER: string[] = [
  "countries",
  "users",
  "known_species",
  "states",
  "sites",
  "import_trips",
  "import_trip_measurers",
  "import_sites",
  "import_trees",
  "import_trunks",
  "site_visits",
  "site_visitors",
  "trees",
  "tree_measurements",
  "tree_measurers",
  "photos",
  "photo_references",
];

/**
 * Every enforced FK constraint in db/migrations/0000_striped_talos.sql
 * (30 total), used for the post-load orphan check (doc 07 section 7.1 #6).
 * Includes the four FKs schema.ts added beyond the legacy DDL (countries,
 * users, photos targets - see schema.ts file header note 4): the ETL always
 * populates these validly, so checking them is still meaningful.
 */
export const FOREIGN_KEYS: ForeignKey[] = [
  {
    table: "import_sites",
    column: "creator_user_id",
    refTable: "users",
    nullable: true,
  },
  {
    table: "import_sites",
    column: "trip_id",
    refTable: "import_trips",
    nullable: false,
  },
  {
    table: "import_sites",
    column: "state_id",
    refTable: "states",
    nullable: true,
  },
  {
    table: "import_trees",
    column: "creator_user_id",
    refTable: "users",
    nullable: true,
  },
  {
    table: "import_trees",
    column: "site_id",
    refTable: "import_sites",
    nullable: false,
  },
  {
    table: "import_trip_measurers",
    column: "trip_id",
    refTable: "import_trips",
    nullable: true,
  },
  {
    table: "import_trips",
    column: "creator_user_id",
    refTable: "users",
    nullable: true,
  },
  {
    table: "import_trips",
    column: "default_state_id",
    refTable: "states",
    nullable: true,
  },
  {
    table: "import_trunks",
    column: "creator_user_id",
    refTable: "users",
    nullable: true,
  },
  {
    table: "import_trunks",
    column: "tree_id",
    refTable: "import_trees",
    nullable: false,
  },
  {
    table: "photo_references",
    column: "import_site_id",
    refTable: "import_sites",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "import_tree_id",
    refTable: "import_trees",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "site_id",
    refTable: "sites",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "site_visit_id",
    refTable: "site_visits",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "tree_id",
    refTable: "trees",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "tree_measurement_id",
    refTable: "tree_measurements",
    nullable: true,
  },
  {
    table: "photo_references",
    column: "photo_id",
    refTable: "photos",
    nullable: false,
  },
  {
    table: "photos",
    column: "creator_user_id",
    refTable: "users",
    nullable: true,
  },
  {
    table: "site_visitors",
    column: "site_id",
    refTable: "sites",
    nullable: true,
  },
  {
    table: "site_visitors",
    column: "site_visit_id",
    refTable: "site_visits",
    nullable: true,
  },
  {
    table: "site_visits",
    column: "site_id",
    refTable: "sites",
    nullable: true,
  },
  {
    table: "site_visits",
    column: "importing_trip_id",
    refTable: "import_trips",
    nullable: true,
  },
  {
    table: "site_visits",
    column: "state_id",
    refTable: "states",
    nullable: false,
  },
  { table: "sites", column: "state_id", refTable: "states", nullable: false },
  {
    table: "states",
    column: "country_id",
    refTable: "countries",
    nullable: false,
  },
  {
    table: "tree_measurements",
    column: "tree_id",
    refTable: "trees",
    nullable: true,
  },
  {
    table: "tree_measurements",
    column: "importing_trip_id",
    refTable: "import_trips",
    nullable: true,
  },
  {
    table: "tree_measurers",
    column: "tree_id",
    refTable: "trees",
    nullable: true,
  },
  {
    table: "tree_measurers",
    column: "measurement_id",
    refTable: "tree_measurements",
    nullable: true,
  },
  { table: "trees", column: "site_id", refTable: "sites", nullable: false },
];
