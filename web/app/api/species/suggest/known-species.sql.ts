/**
 * Fetches the full `Trees.KnownSpecies` lookup table (task P1-09) for
 * in-memory ranking by `rank.ts` -- legacy does the same full-table load
 * (`Registry.Session.CreateCriteria<KnownSpecies>().List<KnownSpecies>()`,
 * `TreeRepository.cs:53,72`) before ranking in memory; ~1800 rows in
 * production (verified against the local full-data-copy dev DB), cheap
 * either way.
 *
 * Lives under `app/api/species/suggest/` (not `db/queries/`) since this
 * task's file-ownership grant only lists `db/queries/search-page.sql.ts` as
 * a new query file (for the unrelated `/search` page); this endpoint's own
 * "(new)" directory is the right home for its query helper.
 */
import { type SqlTag, defaultSql } from "@/db/queries/sql-tag";
import type { KnownSpeciesCandidate } from "./rank";

interface RawKnownSpeciesRow {
  accepted_symbol: string;
  scientific_name: string;
  common_name: string;
}

export async function listAllKnownSpecies(sql: SqlTag = defaultSql()): Promise<KnownSpeciesCandidate[]> {
  // `order by id asc`: legacy's `CreateCriteria<KnownSpecies>().List<KnownSpecies>()`
  // has no explicit ORDER BY either, but its subsequent LINQ-to-objects
  // `orderby tree.Rank descending` (`TreeRepository.cs:59,79`) is
  // `Enumerable.OrderBy`, which .NET documents as a STABLE sort -- so tied
  // ranks preserve whatever order the untouched (read-only lookup table,
  // never updated/deleted) `List<KnownSpecies>()` enumeration happened to
  // return, which for an identity-PK table with no explicit ordering is, in
  // practice, physical/clustered-index (Id ascending) order. `id asc` here
  // is the best available reproduction of that -- an explicit, documented
  // choice, not a proven legacy guarantee (same class of tiebreak waiver as
  // `db/queries/search.sql.ts`'s `id asc`). Confirmed empirically: without
  // this ordering, `rank.ts`'s outer tie-break (index-in-array) landed on
  // Postgres's arbitrary row order instead and mismatched 3 of the 11
  // production autocomplete snapshots at exact-tie boundaries; adding it
  // fixed all 3.
  const rows = await sql<RawKnownSpeciesRow>`
    select accepted_symbol, scientific_name, common_name
    from known_species
    order by id asc
  `;
  return rows.map((r) => ({
    acceptedSymbol: r.accepted_symbol,
    scientificName: r.scientific_name,
    commonName: r.common_name,
  }));
}
