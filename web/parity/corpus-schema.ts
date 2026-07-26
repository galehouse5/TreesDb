/**
 * Shared TypeScript interface for `web/parity/corpus.json`.
 *
 * Ownership note: this file only defines the SHAPE of the corpus. The corpus
 * itself (`corpus.ts` -> `corpus.json`, built from the migrated Postgres
 * data) is owned by a different task (schema-dependent) and is not created
 * here. `capture.ts` imports only the types below and fails with a clear
 * message if `corpus.json` does not exist yet (see capture.ts `loadCorpus`).
 *
 * Field choices follow docs/migration/07-parity-testing.md §3 (corpus
 * contents) and §4 (capture categories table), and docs/migration/01-system-
 * reference.md §1 (route surface) for the shape of grid parameters.
 */

/** `unitsPreference` cookie values (doc 01 §7). "Default" behaves as Feet. */
export type UnitsPreference = "Feet" | "Meters" | "Yards" | "Default";

/** Legacy `/Browse/{Locations,Species}` + detail-page grids (doc 01 §1). */
export type GridName =
  | "locations" // /Browse/Locations - global sites grid
  | "species" // /Browse/Species - global species grid
  | "site-species" // Site details page species grid (SiteSpeciesGridPartial2, no prefix)
  | "state-species" // State details page species grid (prefix "stateSpecies")
  | "state-sites" // State details page sites grid (prefix "sites")
  | "species-by-state" // Species details page "recorded states" grid (prefix "stateSpecies")
  | "species-site-species" // Species details page, scoped to a site (prefix "siteSpecies")
  | "species-trees"; // Species details page, scoped to a site, trees grid (prefix "trees")

export interface CorpusStateEntry {
  id: number;
  name: string;
  /** Two-letter code, e.g. "OH". */
  code: string;
  /** True when ComputedTreesMeasuredCount > 0 (doc 07 §3 "all states ... plus 5 without"). */
  hasMeasuredTrees: boolean;
}

export interface CorpusSiteEntry {
  id: number;
  name: string;
  stateId: number;
  /** Flags this entry as satisfying one of the targeted edge cases in doc 07 §3. */
  edgeCaseTags?: SiteEdgeCaseTag[];
}

export type SiteEdgeCaseTag =
  | "highest-visit-count"
  | "exactly-4-species" // below RHI5 threshold
  | "at-least-20-species"; // RHI20 populated

export interface CorpusSpeciesEntry {
  scientificName: string;
  commonName: string;
  /**
   * Pre-built legacy route segment, exactly as it should appear in the URL
   * path before percent-encoding, i.e. `"{scientificName} ({commonName})"`.
   * Kept pre-built (rather than re-derived in capture.ts) so the corpus
   * producer controls the exact source string once, since it must match the
   * `(Unidentified)` placeholder and punctuation edge cases verbatim.
   */
  routeSegment: string;
  /** Flags entries satisfying doc 07 §3's punctuation/edge-case coverage list. */
  edgeCaseTags?: SpeciesEdgeCaseTag[];
}

export type SpeciesEdgeCaseTag =
  | "ampersand"
  | "apostrophe"
  | "hyphen"
  | "period"
  | "non-ascii"
  | "unidentified-placeholder";

export type TreeSampleReason =
  | "top-100-height"
  | "top-50-girth"
  | "random-seed-424242" // mulberry32 over sorted tree Ids, seed 424242
  | "unspecified-coordinates" // LatitudeInputFormat = 1
  | "invalid-input-format" // InputFormat = 0
  | "most-measurements"
  | "has-photos"
  | "multi-trunk-import";

export interface CorpusTreeEntry {
  id: number;
  reason: TreeSampleReason;
}

export interface CorpusSearchTermEntry {
  term: string;
  /** Documents which coverage bucket from doc 07 §3 this term exercises. */
  tag:
    | "exact-state-code-2"
    | "exact-state-code-3" // "USA"-style triple-letter
    | "state-name-fragment"
    | "site-name-prefix"
    | "site-name-suffix"
    | "site-name-infix"
    | "species-fragment-botanical"
    | "species-fragment-common"
    | "species-fragment-both" // one fragment that matches both a scientificName and a commonName (doc §3: "species fragments hitting both botanical and common names")
    | "county-name-fragment" // exercises Sites.County via searchSites' county ilike arms, distinct from the site-name-* arms
    | "zero-hits"
    | "over-25-hits"
    | "like-metacharacter-percent"
    | "like-metacharacter-underscore"
    | "mixed-case"
    | "fallback-pad"; // deterministic non-empty padding used only when the DB is too small to yield 30 distinct real-data terms (e.g. tiny test fixtures) - never expected to engage against production data
}

export type AutocompleteEndpoint = "commonName" | "scientificName";

export interface CorpusAutocompleteTermEntry {
  endpoint: AutocompleteEndpoint;
  term: string;
  /** Value sent as the `results` query param; legacy default if omitted. */
  results?: number;
  tag?: "one-character" | "no-match";
}

/**
 * One explicit grid state to capture (doc 07 §3: "the default view plus
 * every sortable column in both directions on page 0, one deep page, and
 * one filtered view. Enumerated explicitly in corpus.json").
 *
 * `params` is the exact, already-prefixed query-string parameter bag to
 * send, e.g. `{ stateSpeciesSort: "MaxHeight", stateSpeciesSortAsc: "false" }`
 * for a `state-species` grid state. Deliberately not derived by capture.ts
 * from column metadata, so the corpus producer (who can enumerate real
 * column names from the live grid) stays the single source of truth.
 */
export interface CorpusGridStateEntry {
  grid: GridName;
  /**
   * Owning entity id for scoped grids: siteId (site-species), stateId
   * (state-species / state-sites), or the (scientificName, commonName) pair
   * via `routeSegment` + optional `scopeSiteId`/`scopeStateId` for the
   * species-details-scoped grids. Undefined for the two global grids.
   */
  entityId?: number;
  /** For species-scoped grids: identifies which SpeciesDetails page to load. */
  speciesRouteSegment?: string;
  /** For species-site-species / species-trees grids: the scoping site id. */
  scopeSiteId?: number;
  /** For species-by-state grids reached via a state-scoped species page. */
  scopeStateId?: number;
  /** DataTablesGrid `parameterNamePrefix`, e.g. "stateSpecies", "sites", "trees", "siteSpecies", or "" for the two global grids. */
  parameterNamePrefix: string;
  /** Human label for the report, e.g. "default", "sort:MaxHeight asc", "page:3", "filtered:State=OH". */
  description: string;
  /** Exact query-string params to send (already prefixed). */
  params: Record<string, string>;
}

/** One of the 11 legacy photo variant sizes (doc 01 §11). */
export type PhotoSize =
  | "Original"
  | "Large"
  | "Medium"
  | "Small"
  | "Thumbnail"
  | "SquareThumbnail"
  | "Square"
  | "MiniSquare"
  | "MapSquare"
  | "SmallMapSquare"
  | "MiniMapSquare";

export const ALL_PHOTO_SIZES: readonly PhotoSize[] = [
  "Original",
  "Large",
  "Medium",
  "Small",
  "Thumbnail",
  "SquareThumbnail",
  "Square",
  "MiniSquare",
  "MapSquare",
  "SmallMapSquare",
  "MiniMapSquare",
];

export interface CorpusPhotoEntry {
  id: number;
  /** Sizes to capture for this photo; corpus.ts may pass all 11 or a subset. */
  sizes?: PhotoSize[];
}

/** One legacy URL pattern to probe under the `redirects` category (Phase 4, doc 07 §5.6 / doc 06 P4-01). */
export interface CorpusRedirectEntry {
  /** Legacy path+query, e.g. "/" or "/Main" or a species URL with raw/encoded space+paren variants. */
  legacyPath: string;
  description: string;
}

/**
 * Root corpus shape committed as `web/parity/corpus.json`.
 * Produced by `corpus.ts` (owned separately) from the migrated Postgres
 * data; `capture.ts` only reads this file.
 */
export interface Corpus {
  /** ISO instant the corpus was generated, for traceability in reports. */
  generatedAt: string;
  states: CorpusStateEntry[];
  sites: CorpusSiteEntry[];
  /** Global species list (from Trees.MeasuredSpecies grouping). */
  species: CorpusSpeciesEntry[];
  trees: CorpusTreeEntry[];
  searchTerms: CorpusSearchTermEntry[];
  autocompleteTerms: CorpusAutocompleteTermEntry[];
  gridStates: CorpusGridStateEntry[];
  photos: CorpusPhotoEntry[];
  redirects: CorpusRedirectEntry[];
  /**
   * (site, species) / (state, species) pairs to exercise the scoped
   * SpeciesDetails / Export endpoints (doc 01 §1: `/Browse/Sites/{id}/
   * Species/{bn} ({cn})/Details`, `/Export/Sites/{id}/Species/{bn} ({cn})`,
   * and the State equivalents). Each pair must actually occur in the data
   * (a species with zero trees at that site/state 404s) - left to
   * corpus.ts, which can query the migrated data directly.
   */
  siteSpeciesPairs: { siteId: number; speciesRouteSegment: string }[];
  stateSpeciesPairs: { stateId: number; speciesRouteSegment: string }[];
  /**
   * Entity ids (site/state/species/tree, matched against the lists above by
   * id / routeSegment) to additionally capture under Meters and Yards, per
   * doc 07 §3 ("a 20% subset is also captured under Meters and Yards").
   * Feet is implicit for the whole corpus and not listed here.
   */
  unitsSubset: {
    unitsPreference: Extract<UnitsPreference, "Meters" | "Yards">;
    treeIds: number[];
    siteIds: number[];
    stateIds: number[];
    speciesRouteSegments: string[];
  }[];
}
