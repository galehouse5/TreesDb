/**
 * Species identity and taxonomic renames (D-019; follows D-018).
 *
 * Legacy keys a species by an MD5-XOR hash of its (scientific, common) name
 * pair, and only pairs some tree currently carries exist (the
 * Trees.MeasuredSpecies view). A tree takes its names from its latest
 * measurement, so after a rename the tree's older measurements point at a
 * species that no longer exists, and legacy's tree page throws
 * ObjectNotFoundException (Carya alba, Quercus prinus; see D-018).
 *
 * Here:
 *   - `species` holds one row per name pair that a tree carries, with its
 *     D-011 slug. `syncSpecies` keeps it in step with `trees`; every writer
 *     of `trees` (ETL full load and delta, import Finish, reimport) calls it
 *     inside its transaction.
 *   - `species_synonyms` maps a retired name pair to the species it became.
 *     The known renames live in `SPECIES_SYNONYMS` below, so adding one is a
 *     reviewed one-line change; `syncSpecies` upserts them.
 *   - `findUnresolvedMeasurements` lists measurement name pairs that resolve
 *     to neither a species nor a synonym. The ETL fails loudly on any.
 *
 * Name matching (D-021) is case-insensitive, like legacy's identity hash
 * (lower + trim of each name). Stored names are already whitespace-clean
 * (D-016; trimmed by the ETL and the import path), so `lower(a) = lower(b)`
 * is the legacy identity. Case is never rewritten in stored data, because
 * the pages show names as entered.
 *
 * SQL follows db/queries/sql-tag.ts: flat, single-level bindings only.
 */
import { speciesSlug } from "../lib/slug";
import { speciesHash } from "../lib/species-hash";
import type { SqlTag } from "./queries/sql-tag";

export interface SpeciesSynonymSeed {
  from: { scientificName: string; commonName: string };
  to: { scientificName: string; commonName: string };
  note: string;
}

/**
 * Retired name pairs that older measurements still carry: the two
 * taxonomic renames applied to the data (parity waiver W-107) and one
 * misspelling. No tree carries these pairs any more.
 */
export const SPECIES_SYNONYMS: readonly SpeciesSynonymSeed[] = [
  {
    from: { scientificName: "Carya alba", commonName: "Mockernut Hickory" },
    to: { scientificName: "Carya tomentosa", commonName: "Mockernut Hickory" },
    note: "Renamed to Carya tomentosa (W-107)",
  },
  {
    from: { scientificName: "Quercus prinus", commonName: "Chestnut Oak" },
    to: { scientificName: "Quercus montana", commonName: "Chestnut Oak" },
    note: "Renamed to Quercus montana (W-107)",
  },
  {
    // Legacy species id 555512959 (alerting since 2022): one measurement on
    // tree 134862, found by the migration job's unresolved-species report.
    from: { scientificName: "Quecus montana", commonName: "Chestnut Oak" },
    to: { scientificName: "Quercus montana", commonName: "Chestnut Oak" },
    note: "Misspelling of Quercus montana",
  },
];

export interface SyncSpeciesResult {
  inserted: number;
  deleted: number;
  synonymsApplied: number;
  /** Seeds whose target species no tree carries yet; skipped, not an error. */
  synonymsWithoutTarget: SpeciesSynonymSeed[];
  /** Seeds whose OLD pair a tree still carries: a rename only partly applied. */
  synonymsStillInUse: SpeciesSynonymSeed[];
}

interface NamePair {
  scientific_name: string;
  common_name: string;
}

/**
 * Brings `species` in line with the distinct name pairs in `trees`, then
 * upserts `SPECIES_SYNONYMS`. Idempotent. A species no tree carries is
 * deleted unless a synonym still points at it.
 */
export async function syncSpecies(
  sql: SqlTag,
  synonyms: readonly SpeciesSynonymSeed[] = SPECIES_SYNONYMS,
): Promise<SyncSpeciesResult> {
  const missing = await sql<NamePair>`
    select distinct t.scientific_name, t.common_name
    from trees t
    where not exists (
      select 1 from species s
      where lower(s.scientific_name) = lower(t.scientific_name)
        and lower(s.common_name) = lower(t.common_name))
    order by t.scientific_name, t.common_name
  `;
  for (const p of missing) {
    await sql`
      insert into species (scientific_name, common_name, slug)
      values (${p.scientific_name}, ${p.common_name}, ${speciesSlug(p.scientific_name, p.common_name)})
    `;
  }

  const result: SyncSpeciesResult = {
    inserted: missing.length,
    deleted: 0,
    synonymsApplied: 0,
    synonymsWithoutTarget: [],
    synonymsStillInUse: [],
  };

  for (const seed of synonyms) {
    const target = await sql<{ id: number }>`
      select id from species
      where lower(scientific_name) = lower(${seed.to.scientificName})
        and lower(common_name) = lower(${seed.to.commonName})
    `;
    if (target.length === 0) {
      result.synonymsWithoutTarget.push(seed);
      continue;
    }
    await sql`
      insert into species_synonyms (scientific_name, common_name, species_id, note)
      values (${seed.from.scientificName}, ${seed.from.commonName}, ${target[0]!.id}, ${seed.note})
      on conflict ((lower(scientific_name)), (lower(common_name)))
      do update set species_id = excluded.species_id, note = excluded.note
    `;
    result.synonymsApplied++;
    const inUse = await sql<{ n: number }>`
      select count(*)::int as n from trees
      where lower(scientific_name) = lower(${seed.from.scientificName})
        and lower(common_name) = lower(${seed.from.commonName})
    `;
    if ((inUse[0]?.n ?? 0) > 0) result.synonymsStillInUse.push(seed);
  }

  const deleted = await sql<{ id: number }>`
    delete from species s
    where not exists (
        select 1 from trees t
        where lower(t.scientific_name) = lower(s.scientific_name)
          and lower(t.common_name) = lower(s.common_name))
      and not exists (select 1 from species_synonyms y where y.species_id = s.id)
    returning s.id
  `;
  result.deleted = deleted.length;
  return result;
}

export interface UnresolvedMeasurementPair {
  scientificName: string;
  commonName: string;
  measurements: number;
  /** Comma-separated tree ids, ascending. */
  treeIds: string;
  /** Legacy `GlobalMeasuredSpecies` id of the pair (the id in legacy's
   * ObjectNotFoundException alerts), so an alert id maps to a name. */
  legacySpeciesId: number;
}

/**
 * Measurement name pairs that match neither a species nor a synonym. These
 * are the rows legacy 500s on; the tree page falls back to the tree's
 * species for them (D-018), but each one is a rename `SPECIES_SYNONYMS`
 * should record. Run after `syncSpecies`.
 */
export async function findUnresolvedMeasurements(
  sql: SqlTag,
): Promise<UnresolvedMeasurementPair[]> {
  const rows = await sql<{
    scientific_name: string;
    common_name: string;
    measurements: number;
    tree_ids: string;
  }>`
    select tm.scientific_name, tm.common_name,
      count(*)::int as measurements,
      string_agg(distinct tm.tree_id::text, ',') as tree_ids
    from tree_measurements tm
    where not exists (
        select 1 from species s
        where lower(s.scientific_name) = lower(tm.scientific_name)
          and lower(s.common_name) = lower(tm.common_name))
      and not exists (
        select 1 from species_synonyms y
        where lower(y.scientific_name) = lower(tm.scientific_name)
          and lower(y.common_name) = lower(tm.common_name))
    group by tm.scientific_name, tm.common_name
    order by tm.scientific_name, tm.common_name
  `;
  return rows.map((r) => ({
    scientificName: r.scientific_name,
    commonName: r.common_name,
    measurements: r.measurements,
    treeIds: (r.tree_ids ?? "")
      .split(",")
      .filter(Boolean)
      .map(Number)
      .sort((a, b) => a - b)
      .join(","),
    legacySpeciesId: speciesHash(r.scientific_name, r.common_name),
  }));
}
