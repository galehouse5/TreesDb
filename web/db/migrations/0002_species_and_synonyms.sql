CREATE TABLE "species" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "species_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"scientific_name" varchar(100) NOT NULL,
	"common_name" varchar(100) NOT NULL,
	"slug" varchar(210) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "species_synonyms" (
	"scientific_name" varchar(100) NOT NULL,
	"common_name" varchar(100) NOT NULL,
	"species_id" integer NOT NULL,
	"note" varchar(200) DEFAULT '' NOT NULL,
	CONSTRAINT "pk_species_synonyms" PRIMARY KEY("scientific_name","common_name")
);
--> statement-breakpoint
ALTER TABLE "species_synonyms" ADD CONSTRAINT "fk_species_synonyms_species" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_species_names" ON "species" USING btree ("scientific_name","common_name");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_species_slug" ON "species" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ix_species_synonyms_species_id" ON "species_synonyms" USING btree ("species_id");