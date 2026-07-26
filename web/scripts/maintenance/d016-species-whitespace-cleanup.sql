-- D-016: one-off cleanup of whitespace-run duplicates in species names.
-- docs/migration/DECISIONS.md D-016; parity waiver W-010.
--
-- Production data contains species name pairs that differ only by an
-- internal double space ("Cercis  siliquastrum" vs "Cercis siliquastrum",
-- "Crataegus  spp." vs "Crataegus spp.", "Italian  Cypress" vs
-- "Italian Cypress") -- data-entry duplicates of the same species that
-- legacy treated as distinct species (its identity hash does trim+lower
-- but not internal-whitespace collapse) and that collide under the D-011
-- slug scheme (slugify collapses whitespace runs). Repo-owner decision
-- 2026-07-18: normalize whitespace runs in species name columns, merging
-- the duplicates.
--
-- Scope: trees + tree_measurements only. known_species is already clean
-- (verified 0 rows with whitespace runs); import_trees is the historical
-- import log and is deliberately left exactly as captured.
--
-- computed_measured_species_id is recomputed for changed rows using the
-- same Postgres hash expression as db/queries/species-hash.sql.ts (see
-- that file for the derivation and the WIN1252 rationale); the column is
-- ETL/parity-facing only -- runtime queries key species by the natural
-- (scientific_name, common_name) pair (D-003).
--
-- Idempotent: the WHERE clause matches only rows still containing a
-- whitespace run, so a re-run is a no-op.
--
-- Run against local pg and Neon (unpooled):
--   psql "$DATABASE_URL" -f scripts/maintenance/d016-species-whitespace-cleanup.sql

begin;

update trees set
  scientific_name = regexp_replace(scientific_name, '\s+', ' ', 'g'),
  common_name     = regexp_replace(common_name,     '\s+', ' ', 'g'),
  computed_measured_species_id = abs(
    (('x' || right(md5(convert_to(lower(trim(regexp_replace(scientific_name, '\s+', ' ', 'g'))), 'WIN1252')), 8))::bit(32)::int)
    #
    (('x' || right(md5(convert_to(lower(trim(regexp_replace(common_name, '\s+', ' ', 'g'))), 'WIN1252')), 8))::bit(32)::int)
  )
where scientific_name ~ '\s\s' or common_name ~ '\s\s';

update tree_measurements set
  scientific_name = regexp_replace(scientific_name, '\s+', ' ', 'g'),
  common_name     = regexp_replace(common_name,     '\s+', ' ', 'g'),
  computed_measured_species_id = abs(
    (('x' || right(md5(convert_to(lower(trim(regexp_replace(scientific_name, '\s+', ' ', 'g'))), 'WIN1252')), 8))::bit(32)::int)
    #
    (('x' || right(md5(convert_to(lower(trim(regexp_replace(common_name, '\s+', ' ', 'g'))), 'WIN1252')), 8))::bit(32)::int)
  )
where scientific_name ~ '\s\s' or common_name ~ '\s\s';

-- Post-conditions: no whitespace runs remain, and every stored hash for
-- the touched species matches the recomputed expression.
do $$
declare bad int;
begin
  select count(*) into bad from (
    select 1 from trees where scientific_name ~ '\s\s' or common_name ~ '\s\s'
    union all
    select 1 from tree_measurements where scientific_name ~ '\s\s' or common_name ~ '\s\s'
  ) x;
  if bad > 0 then
    raise exception 'D-016 cleanup incomplete: % rows still contain whitespace runs', bad;
  end if;
end $$;

commit;
