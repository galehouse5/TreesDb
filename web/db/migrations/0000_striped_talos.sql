CREATE TABLE "countries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"double_letter_code" char(2) NOT NULL,
	"triple_letter_code" char(3) NOT NULL,
	"name" varchar(50) NOT NULL,
	"ne_latitude" real NOT NULL,
	"ne_longitude" real NOT NULL,
	"sw_latitude" real NOT NULL,
	"sw_longitude" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_user_id" integer,
	"trip_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"state_id" integer,
	"county" varchar(100) NOT NULL,
	"ownership_type" varchar(100) NOT NULL,
	"ownership_contact_info" varchar(200) NOT NULL,
	"make_ownership_contact_info_public" boolean NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"comments" varchar(1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_trees" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_trees_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_user_id" integer,
	"site_id" integer NOT NULL,
	"type" smallint DEFAULT 1 NOT NULL,
	"tree_name" varchar(100) NOT NULL,
	"tree_number" integer,
	"common_name" varchar(100) NOT NULL,
	"scientific_name" varchar(100) NOT NULL,
	"status" smallint NOT NULL,
	"health_status" varchar(100) NOT NULL,
	"age_class" smallint NOT NULL,
	"age_type" smallint NOT NULL,
	"age" integer,
	"general_comments" varchar(1000) NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"make_coordinates_public" boolean DEFAULT false NOT NULL,
	"elevation" real NOT NULL,
	"elevation_input_format" smallint NOT NULL,
	"height" real NOT NULL,
	"height_input_format" smallint NOT NULL,
	"height_measurement_method" smallint DEFAULT 0 NOT NULL,
	"height_measurements_distance_top" real NOT NULL,
	"height_measurements_distance_top_input_format" smallint NOT NULL,
	"height_measurements_angle_top" real NOT NULL,
	"height_measurements_angle_top_input_format" smallint NOT NULL,
	"height_measurements_distance_bottom" real NOT NULL,
	"height_measurements_distance_bottom_input_format" smallint NOT NULL,
	"height_measurements_angle_bottom" real NOT NULL,
	"height_measurements_angle_bottom_input_format" smallint NOT NULL,
	"height_measurements_vertical_offset" real NOT NULL,
	"height_measurements_vertical_offset_input_format" smallint NOT NULL,
	"height_measurement_type" varchar(100) NOT NULL,
	"laser_brand" varchar(100) NOT NULL,
	"clinometer_brand" varchar(100) NOT NULL,
	"height_comments" varchar(1000) NOT NULL,
	"girth" real NOT NULL,
	"girth_input_format" smallint NOT NULL,
	"girth_measurement_height" real NOT NULL,
	"girth_measurement_height_input_format" smallint NOT NULL,
	"girth_root_collar_height" real NOT NULL,
	"girth_root_collar_height_input_format" smallint NOT NULL,
	"girth_comments" varchar(1000) NOT NULL,
	"crown_spread" real NOT NULL,
	"crown_spread_input_format" smallint NOT NULL,
	"maximum_limb_length" real NOT NULL,
	"maximum_limb_length_input_format" smallint NOT NULL,
	"crown_spread_measurement_method" varchar(100) NOT NULL,
	"base_crown_height" real NOT NULL,
	"base_crown_height_input_format" smallint NOT NULL,
	"crown_volume" real NOT NULL,
	"crown_volume_input_format" smallint NOT NULL,
	"crown_volume_calculation_method" varchar(100) NOT NULL,
	"crown_comments" varchar(1000) NOT NULL,
	"trunk_volume" real NOT NULL,
	"trunk_volume_input_format" smallint NOT NULL,
	"trunk_volume_calculation_method" varchar(100) NOT NULL,
	"trunk_comments" varchar(1000) NOT NULL,
	"form_type" smallint NOT NULL,
	"number_of_trunks" integer,
	"tree_form_comments" varchar(1000) NOT NULL,
	"terrain_type" smallint NOT NULL,
	"terrain_shape_index" real,
	"landform_index" real,
	"terrain_comments" varchar(1000) NOT NULL,
	"combined_girth_number_of_trunks" integer
);
--> statement-breakpoint
CREATE TABLE "import_trip_measurers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_trip_measurers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"trip_id" integer,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_trips" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_trips_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"creator_user_id" integer,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"imported" timestamp with time zone,
	"name" varchar(100) NOT NULL,
	"date" date,
	"website" varchar(100) NOT NULL,
	"photos_available" boolean NOT NULL,
	"measurer_contact_info" varchar(200) NOT NULL,
	"make_measurer_contact_info_public" boolean DEFAULT false NOT NULL,
	"default_laser_brand" varchar(100),
	"default_clinometer_brand" varchar(100),
	"default_height_measurement_method" smallint DEFAULT 0 NOT NULL,
	"default_state_id" integer,
	"default_county" varchar(100),
	"last_saved" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_trunks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "import_trunks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_user_id" integer,
	"tree_id" integer NOT NULL,
	"girth" real NOT NULL,
	"girth_input_format" smallint NOT NULL,
	"girth_measurement_height" real NOT NULL,
	"girth_measurement_height_input_format" smallint NOT NULL,
	"height" real NOT NULL,
	"height_input_format" smallint NOT NULL,
	"height_measurements_distance_top" real NOT NULL,
	"height_measurements_distance_top_input_format" smallint NOT NULL,
	"height_measurements_angle_top" real NOT NULL,
	"height_measurements_angle_top_input_format" smallint NOT NULL,
	"height_measurements_distance_bottom" real NOT NULL,
	"height_measurements_distance_bottom_input_format" smallint NOT NULL,
	"height_measurements_angle_bottom" real NOT NULL,
	"height_measurements_angle_bottom_input_format" smallint NOT NULL,
	"height_measurements_vertical_offset" real NOT NULL,
	"height_measurements_vertical_offset_input_format" smallint NOT NULL,
	"include_height_distance_and_angle_measurements" boolean DEFAULT false NOT NULL,
	"trunk_comments" varchar(1000) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "known_species" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "known_species_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"accepted_symbol" varchar(10) NOT NULL,
	"scientific_name" varchar(100) NOT NULL,
	"common_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_references" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "photo_references_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" smallint NOT NULL,
	"import_site_id" integer,
	"import_tree_id" integer,
	"site_id" integer,
	"site_visit_id" integer,
	"tree_id" integer,
	"tree_measurement_id" integer,
	"photo_id" integer NOT NULL,
	"caption" varchar(1000),
	CONSTRAINT "ck_photo_references_owner" CHECK ((
        ("photo_references"."type" = 1
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 2
          and "photo_references"."import_site_id" is not null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 3
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is not null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 4
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is not null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 5
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is not null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 6
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is not null and "photo_references"."tree_measurement_id" is null)
        or ("photo_references"."type" = 7
          and "photo_references"."import_site_id" is null and "photo_references"."import_tree_id" is null
          and "photo_references"."site_id" is null and "photo_references"."site_visit_id" is null
          and "photo_references"."tree_id" is null and "photo_references"."tree_measurement_id" is not null)
      ))
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "photos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"creator_user_id" integer,
	"created" timestamp with time zone NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"format" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_visitors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "site_visitors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" integer,
	"site_visit_id" integer,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_visits" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "site_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" integer,
	"importing_trip_id" integer,
	"visited" date NOT NULL,
	"name" varchar(100) NOT NULL,
	"state_id" integer NOT NULL,
	"county" varchar(100) NOT NULL,
	"ownership_type" varchar(100) NOT NULL,
	"ownership_contact_info" varchar(200) NOT NULL,
	"make_ownership_contact_info_public" boolean NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"calculated_latitude" real NOT NULL,
	"calculated_latitude_input_format" smallint DEFAULT 2 NOT NULL,
	"calculated_longitude" real NOT NULL,
	"calculated_longitude_input_format" smallint DEFAULT 2 NOT NULL,
	"comments" varchar(1000) NOT NULL,
	"trip_report_url" varchar(100) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"state_id" integer NOT NULL,
	"county" varchar(100) NOT NULL,
	"ownership_type" varchar(100) NOT NULL,
	"ownership_contact_info" varchar(200) NOT NULL,
	"make_ownership_contact_info_public" boolean NOT NULL,
	"name" varchar(100) NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"calculated_latitude" real NOT NULL,
	"calculated_latitude_input_format" smallint DEFAULT 2 NOT NULL,
	"calculated_longitude" real NOT NULL,
	"calculated_longitude_input_format" smallint DEFAULT 2 NOT NULL,
	"computed_rhi5" real,
	"computed_rhi10" real,
	"computed_rhi20" real,
	"computed_rgi5" real,
	"computed_rgi10" real,
	"computed_rgi20" real,
	"computed_trees_measured_count" integer,
	"computed_last_measurement_date" date,
	"computed_contains_entity_with_coordinates" boolean,
	"are_metrics_stale" boolean DEFAULT true NOT NULL,
	"last_metrics_update_timestamp" timestamp with time zone,
	"visit_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "states_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"country_id" integer DEFAULT 1 NOT NULL,
	"double_letter_code" char(2) NOT NULL,
	"triple_letter_code" char(3) NOT NULL,
	"name" varchar(50) NOT NULL,
	"ne_latitude" real DEFAULT 0 NOT NULL,
	"ne_longitude" real DEFAULT 0 NOT NULL,
	"sw_latitude" real DEFAULT 0 NOT NULL,
	"sw_longitude" real DEFAULT 0 NOT NULL,
	"computed_rhi5" real,
	"computed_rhi10" real,
	"computed_rhi20" real,
	"computed_rgi5" real,
	"computed_rgi10" real,
	"computed_rgi20" real,
	"computed_trees_measured_count" integer,
	"computed_last_measurement_date" date,
	"computed_contains_entity_with_coordinates" boolean,
	"are_metrics_stale" boolean DEFAULT true NOT NULL,
	"last_metrics_update_timestamp" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tree_measurements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tree_measurements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tree_id" integer,
	"importing_trip_id" integer,
	"computed_measured_species_id" integer NOT NULL,
	"measured" date NOT NULL,
	"common_name" varchar(100) NOT NULL,
	"scientific_name" varchar(100) NOT NULL,
	"height" real NOT NULL,
	"height_input_format" smallint NOT NULL,
	"height_measurement_method" smallint NOT NULL,
	"girth" real NOT NULL,
	"girth_input_format" smallint NOT NULL,
	"crown_spread" real NOT NULL,
	"crown_spread_input_format" smallint NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"calculated_latitude" real NOT NULL,
	"calculated_latitude_input_format" smallint DEFAULT 2 NOT NULL,
	"calculated_longitude" real NOT NULL,
	"calculated_longitude_input_format" smallint DEFAULT 2 NOT NULL,
	"elevation" real NOT NULL,
	"elevation_input_format" smallint NOT NULL,
	"general_comments" varchar(1000) NOT NULL,
	"diameter" real NOT NULL,
	"diameter_input_format" smallint NOT NULL,
	"entspts" real,
	"conical_volume" real NOT NULL,
	"conical_volume_input_format" smallint NOT NULL,
	"entspts2" real,
	"champion_points" real,
	"abbreviated_champion_points" real
);
--> statement-breakpoint
CREATE TABLE "tree_measurers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tree_measurers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tree_id" integer,
	"measurement_id" integer,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trees" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trees_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" integer NOT NULL,
	"computed_measured_species_id" integer NOT NULL,
	"last_measured" date NOT NULL,
	"common_name" varchar(100) NOT NULL,
	"scientific_name" varchar(100) NOT NULL,
	"height" real NOT NULL,
	"height_input_format" smallint NOT NULL,
	"height_measurement_method" smallint NOT NULL,
	"girth" real NOT NULL,
	"girth_input_format" smallint NOT NULL,
	"crown_spread" real NOT NULL,
	"crown_spread_input_format" smallint NOT NULL,
	"latitude" real NOT NULL,
	"latitude_input_format" smallint NOT NULL,
	"longitude" real NOT NULL,
	"longitude_input_format" smallint NOT NULL,
	"calculated_latitude" real NOT NULL,
	"calculated_latitude_input_format" smallint DEFAULT 2 NOT NULL,
	"calculated_longitude" real NOT NULL,
	"calculated_longitude_input_format" smallint DEFAULT 2 NOT NULL,
	"elevation" real NOT NULL,
	"elevation_input_format" smallint NOT NULL,
	"diameter" real NOT NULL,
	"diameter_input_format" smallint NOT NULL,
	"entspts" real,
	"conical_volume" real NOT NULL,
	"conical_volume_input_format" smallint NOT NULL,
	"entspts2" real,
	"champion_points" real,
	"abbreviated_champion_points" real
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(100) DEFAULT 'Anonymous' NOT NULL,
	"firstname" varchar(50) DEFAULT '' NOT NULL,
	"lastname" varchar(50) DEFAULT '' NOT NULL,
	"roles" smallint DEFAULT 0 NOT NULL,
	"password_hash" "bytea" NOT NULL,
	"password_numerics" integer DEFAULT 0 NOT NULL,
	"password_uppercase" integer DEFAULT 0 NOT NULL,
	"password_lowercase" integer DEFAULT 0 NOT NULL,
	"password_specials" integer DEFAULT 0 NOT NULL,
	"password_length" integer DEFAULT 0 NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login" timestamp with time zone DEFAULT now() NOT NULL,
	"email_verification_token" "bytea" NOT NULL,
	"recently_failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"email_verified" timestamp with time zone,
	"last_failed_login_attempt" timestamp with time zone,
	"forgotten_password_assistance_token" "bytea",
	"forgotten_password_assistance_token_issued" timestamp with time zone,
	"forgotten_password_assistance_token_used" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "import_sites" ADD CONSTRAINT "import_sites_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_sites" ADD CONSTRAINT "import_sites_trip_id_import_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."import_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_sites" ADD CONSTRAINT "import_sites_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trees" ADD CONSTRAINT "import_trees_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trees" ADD CONSTRAINT "import_trees_site_id_import_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."import_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trip_measurers" ADD CONSTRAINT "import_trip_measurers_trip_id_import_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."import_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trips" ADD CONSTRAINT "import_trips_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trips" ADD CONSTRAINT "import_trips_default_state_id_states_id_fk" FOREIGN KEY ("default_state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trunks" ADD CONSTRAINT "import_trunks_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_trunks" ADD CONSTRAINT "import_trunks_tree_id_import_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."import_trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_import_site_id_import_sites_id_fk" FOREIGN KEY ("import_site_id") REFERENCES "public"."import_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_import_tree_id_import_trees_id_fk" FOREIGN KEY ("import_tree_id") REFERENCES "public"."import_trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_site_visit_id_site_visits_id_fk" FOREIGN KEY ("site_visit_id") REFERENCES "public"."site_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_tree_id_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_tree_measurement_id_tree_measurements_id_fk" FOREIGN KEY ("tree_measurement_id") REFERENCES "public"."tree_measurements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_references" ADD CONSTRAINT "photo_references_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visitors" ADD CONSTRAINT "site_visitors_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visitors" ADD CONSTRAINT "site_visitors_site_visit_id_site_visits_id_fk" FOREIGN KEY ("site_visit_id") REFERENCES "public"."site_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_importing_trip_id_import_trips_id_fk" FOREIGN KEY ("importing_trip_id") REFERENCES "public"."import_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_measurements" ADD CONSTRAINT "tree_measurements_tree_id_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_measurements" ADD CONSTRAINT "tree_measurements_importing_trip_id_import_trips_id_fk" FOREIGN KEY ("importing_trip_id") REFERENCES "public"."import_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_measurers" ADD CONSTRAINT "tree_measurers_tree_id_trees_id_fk" FOREIGN KEY ("tree_id") REFERENCES "public"."trees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_measurers" ADD CONSTRAINT "tree_measurers_measurement_id_tree_measurements_id_fk" FOREIGN KEY ("measurement_id") REFERENCES "public"."tree_measurements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trees" ADD CONSTRAINT "trees_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_import_sites_creator_user_id" ON "import_sites" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "ix_import_sites_trip_id" ON "import_sites" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "ix_import_sites_state_id" ON "import_sites" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "ix_import_trees_creator_user_id" ON "import_trees" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "ix_import_trees_site_id" ON "import_trees" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "ix_import_trip_measurers_trip_id" ON "import_trip_measurers" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "ix_import_trips_creator_user_id" ON "import_trips" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "ix_import_trips_default_state_id" ON "import_trips" USING btree ("default_state_id");--> statement-breakpoint
CREATE INDEX "ix_import_trunks_creator_user_id" ON "import_trunks" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "ix_import_trunks_tree_id" ON "import_trunks" USING btree ("tree_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_import_site_id" ON "photo_references" USING btree ("import_site_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_import_tree_id" ON "photo_references" USING btree ("import_tree_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_site_id" ON "photo_references" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_site_visit_id" ON "photo_references" USING btree ("site_visit_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_tree_id" ON "photo_references" USING btree ("tree_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_tree_measurement_id" ON "photo_references" USING btree ("tree_measurement_id");--> statement-breakpoint
CREATE INDEX "ix_photo_references_photo_id" ON "photo_references" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "ix_photos_creator_user_id" ON "photos" USING btree ("creator_user_id");--> statement-breakpoint
CREATE INDEX "ix_site_visitors_site_id" ON "site_visitors" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "ix_site_visitors_site_visit_id" ON "site_visitors" USING btree ("site_visit_id");--> statement-breakpoint
CREATE INDEX "ix_site_visits_site_id" ON "site_visits" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "ix_site_visits_importing_trip_id" ON "site_visits" USING btree ("importing_trip_id");--> statement-breakpoint
CREATE INDEX "ix_site_visits_state_id" ON "site_visits" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "ix_sites_state_id" ON "sites" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "ix_states_country_id" ON "states" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "ix_tree_measurements_tree_id" ON "tree_measurements" USING btree ("tree_id");--> statement-breakpoint
CREATE INDEX "ix_tree_measurements_importing_trip_id" ON "tree_measurements" USING btree ("importing_trip_id");--> statement-breakpoint
CREATE INDEX "ix_tree_measurements_scientific_name_common_name" ON "tree_measurements" USING btree ("scientific_name","common_name");--> statement-breakpoint
CREATE INDEX "ix_tree_measurers_tree_id" ON "tree_measurers" USING btree ("tree_id");--> statement-breakpoint
CREATE INDEX "ix_tree_measurers_measurement_id" ON "tree_measurers" USING btree ("measurement_id");--> statement-breakpoint
CREATE INDEX "ix_trees_site_id" ON "trees" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "ix_trees_scientific_name_common_name" ON "trees" USING btree ("scientific_name","common_name");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_users_email" ON "users" USING btree ("email");