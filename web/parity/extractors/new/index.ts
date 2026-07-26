/**
 * Dispatch table for NEW-app page extractors, mirroring
 * `web/parity/extractors/legacy/index.ts`'s `LegacyPageType` keys 1:1 so
 * `verify.ts`'s `pages`/`markerinfo` comparator (doc 07 §5.4) can look up
 * "legacy extractor" and "new extractor" for the same page type side by
 * side and deep-compare their outputs against the shared JSON shapes in
 * `web/parity/extractors/schema.ts`.
 *
 * OWNERSHIP: this file defines the registry TYPE and starts it EMPTY. Page
 * agents building each new-app page (P1-05..09, doc 03) add their extractor
 * here once the page ships - e.g.:
 *
 *   import { extractTreeDetails } from "./tree-details";
 *   export const newExtractors: NewExtractorRegistry = {
 *     ...
 *     "tree-details": extractTreeDetails,
 *   };
 *
 * Each entry must return EXACTLY the same JSON shape as its legacy
 * counterpart (schema.ts), extracting DISPLAYED text verbatim - never
 * recomputed - per doc 07 §5.4 ("Extractors must extract displayed text,
 * not recompute it"). `verify.ts` deep-compares the two sides through
 * `normalize.ts` (float32 numbers, ISO-instant dates, collapsed whitespace,
 * URL-equivalence for hrefs) but treats formatted-string fields as
 * verbatim/exact.
 *
 * A new-app extractor receives the freshly-fetched page's raw HTML string,
 * same signature shape as the legacy extractors (`(html: string) => Json`).
 * If a new page ever needs more context than raw HTML to extract a field
 * (e.g. the entity id, when the new markup doesn't embed it anywhere
 * clickable the way legacy's "Export tree data" link does), extend
 * `NewExtractorContext` below rather than changing the per-key function
 * shape, so existing registry entries don't need signature churn.
 */
import type {
  SearchResultsPageJson,
  SiteDetailsJson,
  SiteMarkerInfoJson,
  SpeciesDetailsJson,
  StateDetailsJson,
  StateMarkerInfoJson,
  TreeDetailsJson,
  TreeMarkerInfoJson,
  GridJson,
} from "../schema";
import { extract as extractLocationsGrid } from "./locations-grid";
import { extract as extractSpeciesGrid } from "./species-grid";
import { extract as markerInfoState } from "./marker-info-state";
import { extract as markerInfoSite } from "./marker-info-site";
import { extract as markerInfoTree } from "./marker-info-tree";
import { extract as extractTreeDetails } from "./tree-details";
import { extract as extractSiteDetails } from "./site-details";
import { extract as extractSearchResults } from "./search-results";
import { extract as extractSpeciesDetails } from "./species-details";
import { extract as extractStateDetails } from "./state-details";

/** Same 10 page-type keys as `web/parity/extractors/legacy/index.ts`'s `LegacyPageType` - kept as an independent literal union (rather than importing `LegacyPageType`) so this file has zero runtime dependency on the legacy extractor barrel; `verify.ts` is responsible for keeping the two key sets aligned (enforced by its own tests). */
export type NewPageType =
  | "tree-details"
  | "site-details"
  | "state-details"
  | "species-details"
  | "locations-grid"
  | "species-grid"
  | "marker-info-state"
  | "marker-info-site"
  | "marker-info-tree"
  | "search-results";

/** Extra context beyond raw HTML a new-app extractor might need (see file header). Currently unused by any registered extractor - reserved for future page agents. */
export interface NewExtractorContext {
  /** The URL that was fetched to obtain `html`, in case an extractor needs to recover an id/param the new markup doesn't expose directly. */
  url?: string;
}

export type NewExtractor<J> = (html: string, ctx?: NewExtractorContext) => J;

/** Maps each page type to the exact JSON shape its extractor (legacy AND new) must produce - the contract page agents implement against. */
export interface NewExtractorJsonByType {
  "tree-details": TreeDetailsJson;
  "site-details": SiteDetailsJson;
  "state-details": StateDetailsJson;
  "species-details": SpeciesDetailsJson;
  "locations-grid": GridJson;
  "species-grid": GridJson;
  "marker-info-state": StateMarkerInfoJson;
  "marker-info-site": SiteMarkerInfoJson;
  "marker-info-tree": TreeMarkerInfoJson;
  "search-results": SearchResultsPageJson;
}

export type NewExtractorRegistry = {
  [K in NewPageType]?: NewExtractor<NewExtractorJsonByType[K]>;
};

/**
 * Registry, populated as page agents ship. `verify.ts` looks up
 * `newExtractors[pageType]` and, when a key is missing, SKIPS that
 * comparison with a clear "no new-side extractor registered for page type
 * <X>" log line (doc 07 §5.4 gate is "100% of corpus pages" - intentionally
 * not satisfiable until every page type is registered here; skips are
 * counted and reported prominently rather than silently passing).
 *
 * P1-10 (map + markers + info popups) registers the three marker-info
 * extractors below -- `./marker-info-{state,site,tree}.ts`. Each `JSON.
 * parse`s the `html` argument (really: the raw response body text of the
 * corresponding `/api/map/{states,sites,trees}/{id}/info` endpoint -- see
 * those files' headers for why the shared HTML-shaped parameter name is
 * repurposed this way) and validates/narrows it into the matching schema
 * type; the underlying query layer (`db/queries/map.sql.ts`) was written to
 * already produce that exact shape, so these are near-identity mappings.
 */
export const newExtractors: NewExtractorRegistry = {
  "locations-grid": extractLocationsGrid,
  "species-grid": extractSpeciesGrid,
  "marker-info-state": markerInfoState,
  "marker-info-site": markerInfoSite,
  "marker-info-tree": markerInfoTree,
  "tree-details": extractTreeDetails,
  "site-details": extractSiteDetails,
  "search-results": extractSearchResults,
  "species-details": extractSpeciesDetails,
  "state-details": extractStateDetails,
};
