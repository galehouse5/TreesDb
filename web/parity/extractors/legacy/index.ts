/**
 * Barrel of all legacy extractors, keyed by page type. Consumed by
 * capture.ts to run the matching extractor immediately after fetching an
 * HTML artifact under the `pages`/`markerinfo` categories (doc 07 §4:
 * "HTML-derived categories store both raw HTML ... and the extracted
 * JSON").
 */
import { extract as treeDetails } from "./tree-details";
import { extract as siteDetails } from "./site-details";
import { extract as stateDetails } from "./state-details";
import { extract as speciesDetails } from "./species-details";
import { extract as locationsGrid } from "./locations-grid";
import { extract as speciesGrid } from "./species-grid";
import { extract as markerInfoState } from "./marker-info-state";
import { extract as markerInfoSite } from "./marker-info-site";
import { extract as markerInfoTree } from "./marker-info-tree";
import { extract as searchResults } from "./search-results";

export const legacyExtractors = {
  "tree-details": treeDetails,
  "site-details": siteDetails,
  "state-details": stateDetails,
  "species-details": speciesDetails,
  "locations-grid": locationsGrid,
  "species-grid": speciesGrid,
  "marker-info-state": markerInfoState,
  "marker-info-site": markerInfoSite,
  "marker-info-tree": markerInfoTree,
  "search-results": searchResults,
} as const;

export type LegacyPageType = keyof typeof legacyExtractors;

export {
  treeDetails,
  siteDetails,
  stateDetails,
  speciesDetails,
  locationsGrid,
  speciesGrid,
  markerInfoState,
  markerInfoSite,
  markerInfoTree,
  searchResults,
};
