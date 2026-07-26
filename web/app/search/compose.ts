/**
 * Composes `/search`'s three-category result list into `ResultModel`-shaped
 * rows (`TMD/Models/Search/ResultModel.cs`), for both the AJAX-JSON and
 * HTML response modes `route.ts` builds from it (task P1-09, doc 03 note,
 * doc 01 §1).
 *
 * Description text transcribed 1:1 from `ResultModel.From`:
 *   states:  `state.Country.Name` (plain country name)
 *   sites:   `"{County}, {State}"` where `{State}` is `State.ToString()` =
 *            `$"{Name} ({Id})"` (`TMD.Model/Locations/State.cs:37-38`) --
 *            i.e. `"{county}, {stateName} ({stateId})"`, confirmed against
 *            the doc 07 corpus (`Search__qe4f915f756.json`: site
 *            "Long Point State Park" -> `"Chautauqua, New York (32)"`)
 *   species: `species.CommonName` (plain common name)
 *
 * Urls point at the NEW app's routes (doc 03's URL-equivalence table), NOT
 * legacy `/Browse/...` shapes -- `states/{id}`, `sites/{id}`,
 * `species/{speciesSlug}` (D-011, `lib/slug.ts`).
 */
import { searchPage } from "@/db/queries/search-page.sql";
import type { SqlTag } from "@/db/queries/sql-tag";
import { speciesSlug } from "@/lib/slug";

export type SearchResultCategory = "states" | "sites" | "species" | "message";

export interface SearchResultModel {
  category: SearchResultCategory;
  subject: string;
  description: string;
  url: string;
}

export interface ComposedSearch {
  /** The effective term used for ranking -- "" when `term` was absent (see below). */
  term: string;
  /** Category order: states, sites, species (`SearchController.Index`'s `Union` composition order, confirmed against the doc 07 corpus). Never includes message rows -- those are the caller's job (AJAX-only). */
  results: SearchResultModel[];
  /** `states.Count() <= max && sites.Count() <= max && species.Count() <= max` (SearchController.cs:26-28). */
  hasAllResults: boolean;
}

/**
 * Port of `SearchController.Index`'s ranked-list composition
 * (`TMD/Controllers/SearchController.cs:18-32`), stopping short of the
 * AJAX-vs-HTML branching and message-row insertion, which differ enough
 * between the two response modes that `route.ts` owns them directly.
 *
 * `term === null` (query param entirely absent, matching ASP.NET MVC
 * binding an omitted `string term` action parameter to C# `null`): every
 * `StringComparisonService`/ILIKE pattern derived from a null/blank term
 * evaluates false, so all three ranked lists come back empty
 * (`search.sql.ts`'s `%${term}%` would instead become `'%'` -- matching
 * EVERYTHING -- if "" were passed through unchanged, which is the opposite
 * of legacy's behavior). Short-circuited here without querying.
 */
export async function composeSearch(
  term: string | null,
  maxResultsPerCategory: number,
  sql?: SqlTag,
): Promise<ComposedSearch> {
  if (term === null) {
    return { term: "", results: [], hasAllResults: true };
  }

  const page = await searchPage(term, maxResultsPerCategory, sql);

  const results: SearchResultModel[] = [
    ...page.states.map(
      (s): SearchResultModel => ({
        category: "states",
        subject: s.name,
        description: s.countryName,
        url: `/states/${s.id}`,
      }),
    ),
    ...page.sites.map(
      (s): SearchResultModel => ({
        category: "sites",
        subject: s.name,
        description: `${s.county}, ${s.stateName} (${s.stateId})`,
        url: `/sites/${s.id}`,
      }),
    ),
    ...page.species.map(
      (s): SearchResultModel => ({
        category: "species",
        subject: s.scientificName,
        description: s.commonName,
        url: `/species/${speciesSlug(s.scientificName, s.commonName)}`,
      }),
    ),
  ];

  return { term, results, hasAllResults: page.hasAllResults };
}
