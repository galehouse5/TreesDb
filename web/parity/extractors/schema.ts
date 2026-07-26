/**
 * Shared page-type JSON schemas for parity extraction (doc 07 §5.4).
 *
 * Each page type is extracted the same way from BOTH sides eventually:
 * `extractors/legacy/*.ts` (this task, cheerio against the legacy Razor
 * markup) and a future `extractors/new/*.ts` (new-app selectors, out of
 * scope here - placeholder dir only). The comparator (`verify.ts`, not
 * built in this task) diffs the two JSON shapes field-by-field using
 * `normalize.ts`.
 *
 * Formatted strings (height, girth, RHI, coordinates, dates-as-displayed,
 * ...) are captured VERBATIM as displayed text - see doc §5.4: "Extractors
 * must extract displayed text, not recompute it." Do not parse/reformat
 * inside an extractor.
 */

/** An `<a href="...">text</a>` captured as displayed text + raw href (for URL-equivalence comparison). */
export interface LinkedText {
  text: string;
  href: string | null;
}

/** A `<td class="description">Label</td><td class="value">...</td>` row rendered by `ReportDisplayFor` / `IfSpecifiedReportDisplayFor` (TMD/Extensions/DisplayExtensions.cs), keyed by the description text as displayed. Value is null when the row was entirely absent (`IfSpecified*` omits the row; a present-but-empty legacy value renders its `NullDisplayText`, e.g. "(no data)", and is captured as that literal string, NOT null). */
export type ReportRows = Record<string, string>;

// ---------------------------------------------------------------------------
// Tree details - TMD/Views/Browse/TreeDetails.cshtml
// ---------------------------------------------------------------------------

export interface TreeMeasurementJson {
  /** "Measured on {date}" heading text, verbatim (portlet-header h4). */
  heading: string;
  /** BrowseTreeSummaryModel.cshtml: Height/Girth/CrownSpread rows, only present when specified. */
  summary: ReportRows;
  /** Full BrowseTreeDetailsModel.cshtml (default template) rows for this measurement. */
  details: ReportRows;
  /** ConcatenatedNames.cshtml render of Measurers, verbatim ("A and B", "A, B, and C", ""). */
  measurers: string;
}

export interface PhotoSummaryRowJson {
  /** BrowsePhotoSumaryModel.cshtml date cell text. */
  date: string;
  /** Count of `<li>` entries inside `ul.gallery` for this row. */
  photoCount: number;
  /** "Taken by {Photographers}" cell, verbatim. */
  photographers: string;
}

export interface TreeDetailsJson {
  treeId: number;
  /** Botanical/common name rows are rendered as links to SpeciesDetails, not via ReportDisplayFor - captured separately. */
  botanicalName: LinkedText;
  commonName: LinkedText;
  /** Remaining Details-table rows (Height, HeightMeasurementMethod, Girth, CrownSpread, ENTSPTS2, ENTSPTS, TDI3, TDI2, champion points row, Diameter, ConicalVolume, GeneralComments), keyed by displayed label. */
  details: ReportRows;
  measurements: TreeMeasurementJson[];
  location: {
    /** Whichever of Coordinates/CalculatedCoordinates the view chose to display (see TreeDetails.cshtml conditional). */
    coordinatesLabel: string;
    coordinatesValue: string;
    coordinatesKind: "specified" | "calculated";
    site: LinkedText;
    /** OwnershipType/County rows, only present when specified (IfSpecifiedReportDisplayFor semantics don't apply here - ReportDisplayFor always renders; captured as-is including "(no data)" text). */
    rows: ReportRows;
    state: LinkedText;
  };
  photos: PhotoSummaryRowJson[];
  hasPhotos: boolean;
}

// ---------------------------------------------------------------------------
// Site details - TMD/Views/Browse/SiteDetails.cshtml
// ---------------------------------------------------------------------------

export interface SiteVisitJson {
  visited: string;
  visitors: string;
  tripReportUrl: string | null;
  comments: string;
}

export interface SiteDetailsJson {
  siteId: number;
  /** Summary tab rows: Name, RHI5/10/20, RGI5/10/20, TreesMeasuredCount, LastMeasurementDate, OwnershipContactInfo ("(private)" literal when not public), LastVisitComments. */
  summary: ReportRows;
  visits: SiteVisitJson[];
  speciesGrid: GridJson;
  location: {
    coordinatesLabel: string;
    coordinatesValue: string;
    coordinatesKind: "specified" | "calculated";
    rows: ReportRows;
    state: LinkedText;
  };
  photos: PhotoSummaryRowJson[];
  hasPhotos: boolean;
}

// ---------------------------------------------------------------------------
// State details - TMD/Views/Browse/StateDetails.cshtml
// ---------------------------------------------------------------------------

export interface StateDetailsJson {
  stateId: number;
  /** Name, Code, RHI5/10/20, RGI5/10/20, TreesMeasuredCount, LastMeasurementDate. */
  summary: ReportRows;
  location: ReportRows; // Coordinates, Country
  speciesGrid: GridJson;
  sitesGrid: GridJson;
}

// ---------------------------------------------------------------------------
// Species details - TMD/Views/Browse/SpeciesDetails.cshtml
// ---------------------------------------------------------------------------

export interface SpeciesMaxRowsJson {
  /** Present only when MaxHeight/MaxGirth/MaxCrownSpread `IsValidAndSpecified()`; keyed by displayed label ("Max height" / "Max girth" / "Max crown spread"), value is the LinkedText to the record-holding tree. */
  maxHeight?: LinkedText;
  maxGirth?: LinkedText;
  maxCrownSpread?: LinkedText;
}

export interface SpeciesDetailsJson {
  botanicalName: string;
  commonName: string;
  global: SpeciesMaxRowsJson;
  /** Present only when the page is state-scoped (?stateId=). */
  state?: {
    state: LinkedText;
    maxima: SpeciesMaxRowsJson;
  };
  /** Present only when the page is site-scoped (?siteId=). */
  site?: {
    site: LinkedText;
    rows: ReportRows; // OwnershipType, County
    maxima: SpeciesMaxRowsJson;
  };
  recordedStatesGrid: GridJson;
  /** Present only when site-scoped: "Recorded sites within {state}" grid. */
  recordedSitesGrid?: GridJson;
  /** Present only when site-scoped: "Recorded trees within {site}" grid. */
  recordedTreesGrid?: GridJson;
}

// ---------------------------------------------------------------------------
// Grids - TMD/Extensions/DataTablesGrid.cs DataTablesGridRenderer.Render/RenderPager
// ---------------------------------------------------------------------------

export interface GridColumnJson {
  header: string;
  sortable: boolean;
  /** "sorting_asc" | "sorting_desc" | "" - the `<th class="sortable {class}">` class. */
  sortState: "asc" | "desc" | "none";
}

export interface GridRowJson {
  /** Cell text in column order, whitespace-collapsed. */
  cells: string[];
  /** Any `<a href>` found per cell, in column order (null when the cell has no link). */
  links: (LinkedText | null)[];
}

export interface GridJson {
  columns: GridColumnJson[];
  rows: GridRowJson[];
  /** `div.dataTables_info` text, verbatim ("Showing 1 to 40 of 213 entries" / "No entries" / "... (filtered from N total entries)"). Absent when the grid was rendered with canPage=false (none of the corpus grids do this, kept optional for robustness). */
  pageInfo: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ---------------------------------------------------------------------------
// Map marker info partials - TMD/Views/Map/{State,Site,Tree}MarkerInfo.cshtml
// ---------------------------------------------------------------------------

export interface MarkerPhotoJson {
  /** Square-size thumbnail <img src>, as rendered (Html.Photo(photo, PhotoSize.Square, PhotoSize.Medium)). */
  thumbnailSrc: string;
}

export interface StateMarkerInfoJson {
  stateId: number;
  name: string;
  detailsLink: LinkedText;
  /** Country + optional RHI5/10/20, RGI5/10/20 (IfSpecified - omitted when not specified), TreesMeasuredCount, LastMeasurementDate. */
  rows: ReportRows;
}

export interface SiteMarkerInfoJson {
  siteId: number;
  name: string;
  detailsLink: LinkedText;
  /** State, County, OwnershipType + optional RHI/RGI rows + TreesMeasuredCount. */
  rows: ReportRows;
  photos: MarkerPhotoJson[];
  /** LastMeasurementDate row (always rendered via plain ReportDisplayFor, after the optional photos row). */
  lastMeasurementDate: string;
}

export interface TreeMarkerInfoJson {
  treeId: number;
  scientificName: string;
  detailsLink: LinkedText;
  /** CommonName + optional Height/Girth/CrownSpread/TDI3/TDI2/ENTSPTS2/ENTSPTS + champion points row (exact or abbreviated, whichever is present - row omitted entirely if neither, unlike the Tree Details page which shows "(not enough data)"). */
  rows: ReportRows;
  photos: MarkerPhotoJson[];
  lastMeasured: string;
}

// ---------------------------------------------------------------------------
// Search results - TMD/Views/Search/Index.cshtml (non-AJAX HTML page)
// ---------------------------------------------------------------------------

export interface SearchResultRowJson {
  /** "states" | "sites" | "species" - the literal Category string (TMD/Models/Search/ResultModel.cs), read off the row's `td.value` CSS class. */
  category: string;
  subject: string;
  description: string;
  url: string;
}

export interface SearchResultsPageJson {
  term: string;
  noResults: boolean;
  results: SearchResultRowJson[];
}
