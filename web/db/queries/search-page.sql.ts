/**
 * Composes the `/search` page's three ranked categories (states, sites,
 * species) -- task P1-09, doc 03 P1-09 note, doc 01 §1/§4.
 *
 * REUSES the already-landed ranking TVF ports in `search.sql.ts`
 * (`searchStates`/`searchSites`/`searchMeasuredSpecies`, task P0-05) rather
 * than re-deriving the rank formulas -- see that file's header for why it
 * deliberately returns only `(id, rank)` / `(scientificName, commonName,
 * rank)` and leaves "join back to the full entity row" to the caller, the
 * same split `TMD.Infrastructure/Repositories/SiteRepository.cs:119`'s
 * `SearchSites` uses (`select site.* from dbo.SearchSites(...) rank join
 * Sites.Sites site on site.Id = rank.Id order by rank.Rank desc`).
 *
 * `sql-tag.ts` forbids composing an inner query's SQL text into an outer
 * template (flat single-template constraint, no nested `sql\`fragment\`
 * composition) and forbids the postgres.js `sql(array)` helper, so the
 * "join back" can't be one combined SQL statement here. Since
 * `SearchController.Index` (`TMD/Controllers/SearchController.cs:18-43`)
 * only ever displays `maxResultsPerCategory` rows per category (5 AJAX / 25
 * HTML, doc 01 §1), the entity lookups below run AFTER slicing each ranked
 * list down to that cap -- at most `maxResultsPerCategory` individual
 * `where id = $1` lookups per category, issued via `Promise.all` -- rather
 * than fetching entity data for the full (unbounded) ranked list. Species
 * rows need no extra lookup: `searchMeasuredSpecies` already returns
 * `scientificName`/`commonName` directly (species has no exposed id, D-003).
 *
 * `hasAllResults` mirrors `SearchController.Index`'s exact formula:
 * `states.Count() <= max && sites.Count() <= max && species.Count() <= max`,
 * computed against the FULL (unsliced) ranked lists -- callers (the AJAX
 * JSON branch) use this to decide whether to append the "Show more
 * results" message row (ResultModel.cs `From(string message, ...)`).
 */
import { searchMeasuredSpecies, searchSites, searchStates } from "./search.sql";
import { type SqlTag, defaultSql } from "./sql-tag";

export interface SearchPageStateRow {
  kind: "state";
  id: number;
  name: string;
  countryName: string;
}

export interface SearchPageSiteRow {
  kind: "site";
  id: number;
  name: string;
  county: string;
  stateId: number;
  stateName: string;
}

export interface SearchPageSpeciesRow {
  kind: "species";
  scientificName: string;
  commonName: string;
}

export interface SearchPageResult {
  /** Rank-ordered, sliced to `maxResultsPerCategory` (category order: states, sites, species -- matches `SearchController.Index`'s `Union` composition order). */
  states: SearchPageStateRow[];
  sites: SearchPageSiteRow[];
  species: SearchPageSpeciesRow[];
  /** `states.Count() <= max && sites.Count() <= max && species.Count() <= max` (SearchController.cs:26-28), computed against the FULL ranked lists before slicing. */
  hasAllResults: boolean;
}

async function fetchStatesByIds(ids: number[], sql: SqlTag): Promise<Map<number, SearchPageStateRow>> {
  const map = new Map<number, SearchPageStateRow>();
  await Promise.all(
    ids.map(async (id) => {
      const rows = await sql<{ id: number; name: string; country_name: string }>`
        select st.id, st.name, c.name as country_name
        from states st
        join countries c on c.id = st.country_id
        where st.id = ${id}
      `;
      const r = rows[0];
      if (r) map.set(id, { kind: "state", id: r.id, name: r.name, countryName: r.country_name });
    }),
  );
  return map;
}

async function fetchSitesByIds(ids: number[], sql: SqlTag): Promise<Map<number, SearchPageSiteRow>> {
  const map = new Map<number, SearchPageSiteRow>();
  await Promise.all(
    ids.map(async (id) => {
      const rows = await sql<{
        id: number;
        name: string;
        county: string;
        state_id: number;
        state_name: string;
      }>`
        select s.id, s.name, s.county, st.id as state_id, st.name as state_name
        from sites s
        join states st on st.id = s.state_id
        where s.id = ${id}
      `;
      const r = rows[0];
      if (r) {
        map.set(id, {
          kind: "site",
          id: r.id,
          name: r.name,
          county: r.county,
          stateId: r.state_id,
          stateName: r.state_name,
        });
      }
    }),
  );
  return map;
}

/**
 * Port of the ranked-list-composition half of `SearchController.Index`
 * (`TMD/Controllers/SearchController.cs:18-32`, up to but not including
 * `ResultModel.From`/message-row/AJAX-vs-HTML branching -- those are the
 * caller's job, per this file's header).
 */
export async function searchPage(
  term: string,
  maxResultsPerCategory: number,
  sql: SqlTag = defaultSql(),
): Promise<SearchPageResult> {
  const [statesRanked, sitesRanked, speciesRanked] = await Promise.all([
    searchStates(term, sql),
    searchSites(term, sql),
    searchMeasuredSpecies(term, sql),
  ]);

  const hasAllResults =
    statesRanked.length <= maxResultsPerCategory &&
    sitesRanked.length <= maxResultsPerCategory &&
    speciesRanked.length <= maxResultsPerCategory;

  const stateSlice = statesRanked.slice(0, maxResultsPerCategory);
  const siteSlice = sitesRanked.slice(0, maxResultsPerCategory);
  const speciesSlice = speciesRanked.slice(0, maxResultsPerCategory);

  const [stateMap, siteMap] = await Promise.all([
    fetchStatesByIds(
      stateSlice.map((s) => s.id),
      sql,
    ),
    fetchSitesByIds(
      siteSlice.map((s) => s.id),
      sql,
    ),
  ]);

  return {
    states: stateSlice
      .map((s) => stateMap.get(s.id))
      .filter((r): r is SearchPageStateRow => r !== undefined),
    sites: siteSlice
      .map((s) => siteMap.get(s.id))
      .filter((r): r is SearchPageSiteRow => r !== undefined),
    species: speciesSlice.map(
      (s): SearchPageSpeciesRow => ({
        kind: "species",
        scientificName: s.scientificName,
        commonName: s.commonName,
      }),
    ),
    hasAllResults,
  };
}
