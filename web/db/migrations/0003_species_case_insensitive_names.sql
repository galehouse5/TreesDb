DROP INDEX "ux_species_names";--> statement-breakpoint
ALTER TABLE "species_synonyms" DROP CONSTRAINT "pk_species_synonyms";--> statement-breakpoint
CREATE UNIQUE INDEX "ux_species_synonyms_names" ON "species_synonyms" USING btree (lower("scientific_name"),lower("common_name"));--> statement-breakpoint
CREATE UNIQUE INDEX "ux_species_names" ON "species" USING btree (lower("scientific_name"),lower("common_name"));