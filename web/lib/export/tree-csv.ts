// Legacy CSV tree exporter port (P1-11 core -- pure logic only, no routes/DB).
//
// Source: TMD.Model/Exports/TreeCsvExporter.cs (column order, header
// strings, per-cell value logic), TMD/ActionResults/CsvFileResult.cs
// (serialization: quote-all, `""`-escaped, CRLF-joined, no trailing
// newline), TMD/Controllers/ExportController.cs (the 8 export actions'
// `Identifiers` dictionaries that drive `Filename`).
// Doc: docs/migration/01-system-reference.md §8 (25-column contract), §7
// (unit formatting -- reused from lib/units/format.ts and
// lib/geo/coordinates.ts, NOT reimplemented here).
//
// ---------------------------------------------------------------------------
// Discrepancies found between TreeCsvExporter.cs and doc 01 §8 (task
// instruction: "follow the code" -- both are captured here and in the task
// report):
//
// 1. UNIT TOKEN IS AN ABBREVIATION, NOT A FULL WORD. Doc 01 §8's filename
//    example (`State-OH Species-Quercus alba Trees (Feet).csv`) and the
//    literal header text implied by "headers 6/7 are literally `Site
//    Latitude (DegreesDecimalMinutes)` style" do not match the code.
//    `TreeCsvExporter.Filename` calls `UserSession.Units.Describe()`
//    (EnumExtensions.cs:9-14), which reads the `[Description]` attribute on
//    the `Units` enum member (TMD.Model/ValueObjects/Units.cs:5-15):
//    `Default`/`Feet` -> "ft", `Meters` -> "m", `Yards` -> "yd". There is no
//    `Units`-specific `Describe` overload anywhere in the codebase, so this
//    is the only candidate and it unambiguously wins extension-method
//    resolution. The real legacy filename is `All Trees (ft).csv`, NOT
//    `All Trees (Feet).csv`. Column headers 16/18/19/20 use
//    `UserSession.Units.Abbreviation()` (Units.cs:19-22), which returns the
//    IDENTICAL strings ("ft"/"m"/"yd") via a hardcoded switch instead of
//    reflection -- so `Describe()` and `Abbreviation()` are redundant but
//    always agree. This file follows the code: `ft`/`m`/`yd` everywhere a
//    unit token appears (filename and headers).
//
// 2. "SITE LATITUDE"/"SITE LONGITUDE" (columns 6-7) ARE NOT THE SITE'S
//    COORDINATES -- LEGACY BUG. `TreeCsvExporter.GetRow` (lines 76-77 and
//    82-83) evaluates the exact same expression twice:
//      entity.Coordinates.Latitude.ToString(CoordinatesFormat.DegreesDecimalMinutes)
//      entity.Coordinates.Longitude.ToString(CoordinatesFormat.DegreesDecimalMinutes)
//    for BOTH the "Site Latitude"/"Site Longitude" columns (6-7) AND the
//    "Latitude"/"Longitude" columns (12-13). `entity.Coordinates` is the
//    TREE's own coordinates (`Tree.Coordinates`), never
//    `entity.Site.Coordinates`. So columns 6-7 and 12-13 are byte-for-byte
//    duplicates of the tree's coordinates; the site's actual stored
//    coordinates are never emitted by this exporter. Not called out by doc
//    01 §8. Followed verbatim below (`buildTreeCsvRow` uses the tree's own
//    lat/long for both column pairs) -- this is a preexisting legacy data
//    quirk, not something to "fix" in the port.
//
// 3. EVERY FORMATTED CELL IS GATED BY THE VALUE OBJECT'S `IsSpecified`,
//    NOT JUST A "has a value" CHECK. `Distance.ToString` (Distance.cs:89-90),
//    `Elevation.ToString(ElevationFormat)` (Elevation.cs:76-79), and
//    `Latitude`/`Longitude.ToString(CoordinatesFormat)` (Latitude.cs:32-35)
//    all short-circuit to `string.Empty` when `InputFormat` is
//    `Unspecified`. `lib/units/format.ts`'s doc comment explicitly pushes
//    this gate onto callers ("these functions always format a value...
//    Callers are responsible for the IsSpecified / empty-string gate").
//    This exporter is that caller: every one of the six gated cells (site
//    lat/long, tree lat/long, elevation, height, girth x2, crown spread)
//    checks the corresponding `*Specified` flag on `ExportTreeRow` before
//    calling into `format.ts`/`coordinates.ts`, emitting `""` when
//    unspecified. Not mentioned in doc 01 §8 at all.
//
// 4. MEASURER NAMES CAN INTRODUCE A STRAY EMPTY SEGMENT.
//    `Name.ToString()` (Name.cs:34-39) returns `""` unless BOTH FirstName
//    and LastName are non-whitespace; `GetRow` joins ALL measurers'
//    `ToString()` with ", " (no filtering of blanks). A single
//    half-populated measurer therefore produces a stray `", "` in the
//    joined cell (e.g. "John Smith, , Jane Doe"). Reproduced verbatim by
//    `formatMeasurerName`/`buildTreeCsvRow` (no filtering).
// ---------------------------------------------------------------------------

import { distanceSubunit, formatDistance, formatElevation, Units } from "../units/format";
import { formatLatitude, formatLongitude } from "../geo/coordinates";

export { Units } from "../units/format";

// --- Input shape ------------------------------------------------------------

/**
 * One measurer credited on a tree, pre-joined by the caller (route/query
 * layer) from `tree_measurers` rows across ALL of the tree's
 * `tree_measurements` -- `Tree.Measurers` (Tree.cs:41,73-75) is the
 * DISTINCT union of every historical measurement's measurers, not just the
 * latest measurement's. De-duplication (by first+last name) is the
 * caller's responsibility; this module does not dedupe.
 */
export interface ExportTreeMeasurer {
  /** `tree_measurers.first_name`. */
  firstName: string;
  /** `tree_measurers.last_name`. */
  lastName: string;
}

/**
 * Flat, pre-joined input to `buildTreeCsvRow` -- one row per `trees` record.
 * Field-by-field schema provenance (web/db/schema.ts) is documented per
 * field below; this is the shape a future export route/query needs to
 * produce (one row per tree, joined to its site/state and latest
 * measurement/visit).
 */
export interface ExportTreeRow {
  /** `trees.id` (TreeCsvExporter.cs:80, column 10 "Tree id"). */
  id: number;
  /** `trees.common_name` (denormalized copy of the latest measurement's; column 1). */
  commonName: string;
  /** `trees.scientific_name` (column 2). */
  scientificName: string;
  /** `states.name`, joined via `sites.state_id` (column 3 "State"). */
  stateName: string;
  /** `sites.county` (column 4). */
  county: string;
  /** `sites.name` (column 5 "Site"). */
  siteName: string;
  /**
   * `site_visits.comments` for the site's LAST visit (max `visited` date)
   * -- `Site.LastVisit.Comments` (Site.cs:39-43). Column 8 "Location
   * comments". Distinct from `treeComments` below (tree-level, not
   * site-level).
   */
  siteComments: string;
  /**
   * `sites.ownership_type` (denormalized copy of the last visit's; column
   * 15 "Ownership type"). `Site.OwnershipType` <- `LastVisit.OwnershipType`
   * (Site.cs:61), so `sites.ownership_type` and the last `site_visits` row's
   * `ownership_type` are equivalent sources -- either works.
   */
  ownershipType: string;
  /**
   * `site_visits.trip_report_url` for the site's last visit (column 24
   * "Trip report url", URL-encoded by `buildTreeCsvRow` per .NET
   * `WebUtility.UrlEncode` semantics -- see `dotNetUrlEncode`).
   */
  tripReportUrl: string;

  /**
   * `trees.latitude` (float32 total degrees). Emitted, due to legacy bug
   * #2 above, as BOTH the "Site Latitude" (column 6) and "Latitude"
   * (column 12) cells -- there is deliberately no separate site-coordinate
   * field on this interface because the exporter never reads one.
   */
  latitudeDegrees: number;
  /** `trees.latitude_input_format !== 1 (Unspecified)`. Gates columns 6 and 12. */
  latitudeSpecified: boolean;
  /** `trees.longitude`. See `latitudeDegrees` (columns 7 and 13). */
  longitudeDegrees: number;
  /** `trees.longitude_input_format !== 1`. Gates columns 7 and 13. */
  longitudeSpecified: boolean;

  /** `trees.elevation` (float32 feet). Column 14; always rendered in feet regardless of `units`. */
  elevationFeet: number;
  /** `trees.elevation_input_format !== 1`. Gates column 14. */
  elevationSpecified: boolean;

  /**
   * `count(tree_measurements where tree_id = trees.id)` -- `Tree.MeasurementCount`
   * (Tree.cs:76,84), a derived aggregate, not a stored column. Column 11
   * "Measurement number".
   */
  measurementCount: number;

  /** `trees.height` (float32 feet). Column 16, formatted in `units`. */
  heightFeet: number;
  /** `trees.height_input_format !== 1`. Gates column 16. */
  heightSpecified: boolean;
  /**
   * `trees.height_measurement_method` (smallint 0-4, `TreeHeightMeasurementMethod`
   * enum -- TMD.Model/Imports/TreeBase.cs:14-19). Column 17, looked up via
   * `describeHeightMeasurementMethod`.
   */
  heightMeasurementMethod: number;

  /** `trees.girth` (float32 feet). Columns 18 (PrefixOnly) and 19 (SubprefixOnly). */
  girthFeet: number;
  /** `trees.girth_input_format !== 1`. Gates columns 18 and 19. */
  girthSpecified: boolean;

  /** `trees.crown_spread` (float32 feet). Column 20, formatted in `units`. */
  crownSpreadFeet: number;
  /** `trees.crown_spread_input_format !== 1`. Gates column 20. */
  crownSpreadSpecified: boolean;

  /**
   * `tree_measurements.general_comments` for the tree's LAST measurement
   * (max `measured` date) -- `Tree.LastMeasurement.GeneralComments`
   * (Tree.cs:40,91). Column 21 "Tree comments". Distinct from
   * `siteComments` above (site-level, not tree-level).
   */
  treeComments: string;
  /** See `ExportTreeMeasurer`. Column 22 "Measurer(s)", joined with ", ". */
  measurers: ExportTreeMeasurer[];
  /**
   * `trees.last_measured` (a SQL `date`, no time-of-day component) already
   * as a `yyyy-MM-dd` string -- `Tree.LastMeasured.ToString("yyyy-MM-dd")`
   * (TreeCsvExporter.cs:93) needs no further formatting since a bare date
   * has only one unambiguous rendering. Column 23 "Measured".
   */
  measuredDate: string;
  /**
   * Whether the tree's LAST measurement (not the tree's full history) has
   * any associated photo -- `Tree.Photos` is rebuilt from
   * `LastMeasurement.Photos` only on every `RecalculateProperties`
   * (Tree.cs:71-72). Source: `exists(photo_references where type =
   * TreeMeasurement(7) and tree_measurement_id = <the tree's last
   * tree_measurements.id>)`. Column 25 "Photos available" (`Y`/`N`).
   */
  hasPhotos: boolean;
}

// --- Unit label helpers (Units.cs:19-27; NOT covered by lib/units/format.ts) -

/** `UnitsExtensions.Abbreviation` (Units.cs:19-22) -- also what `Describe()` resolves to (discrepancy #1 above). */
function unitsAbbreviation(units: Units): string {
  return units === Units.Yards ? "yd" : units === Units.Meters ? "m" : "ft";
}

/** `UnitsExtensions.SubAbbreviation` (Units.cs:24-27). */
function unitsSubAbbreviation(units: Units): string {
  return units === Units.Yards ? "in" : units === Units.Meters ? "cm" : "in";
}

// --- Height measurement method (TMD.Model/Imports/TreeBase.cs:14-19) -------

const HEIGHT_MEASUREMENT_METHOD_DESCRIPTIONS: Record<number, string> = {
  0: "", // NotSpecified
  1: "Clinometer/laser rangefinder/sine",
  2: "Tree climb with tape drop",
  3: "Long measuring pole",
  4: "Formal transit/total station survey",
};

/** `TreeHeightMeasurementMethod.Describe()` (EnumExtensions.cs + TreeBase.cs:14-19). Unknown codes render as "". */
export function describeHeightMeasurementMethod(method: number): string {
  return HEIGHT_MEASUREMENT_METHOD_DESCRIPTIONS[method] ?? "";
}

// --- Measurer name join (Name.cs:34-39; discrepancy #4 above) --------------

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

/** `Name.ToString()` (Name.cs:34-39): "First Last" iff both are non-whitespace, else "". */
export function formatMeasurerName(measurer: ExportTreeMeasurer): string {
  return !isBlank(measurer.firstName) && !isBlank(measurer.lastName)
    ? `${measurer.firstName} ${measurer.lastName}`
    : "";
}

// --- URL encoding (System.Net.WebUtility.UrlEncode) -------------------------

/**
 * Port of `System.Net.WebUtility.UrlEncode` (TreeCsvExporter.cs:94 calls it
 * directly via `using System.Net;`). NOT the same as JS `encodeURIComponent`.
 * Per the .NET reference source, `WebUtility.IsUrlSafeChar` allows
 * alphanumerics plus exactly `- _ . ! * ( )` -- notably INCLUDING `!*()`
 * and EXCLUDING `~` (tilde is percent-encoded as %7E). A literal space
 * encodes as `+`, not `%20`. Proven against production (parity §5.1): the
 * trip-report URL `...?hl=en#!topic/...` exports with a bare `!`
 * (`%23!topic`), which the previous `A-Za-z0-9-_.~` safe set got wrong on
 * 10 corpus artifacts. Operates byte-by-byte over the UTF-8 encoding so
 * multi-byte characters produce the expected `%XX%XX...` sequence.
 */
export function dotNetUrlEncode(value: string | null | undefined): string {
  if (value == null) return "";
  const bytes = new TextEncoder().encode(value);
  let out = "";
  for (const byte of bytes) {
    const ch = String.fromCharCode(byte);
    if (
      (ch >= "A" && ch <= "Z") ||
      (ch >= "a" && ch <= "z") ||
      (ch >= "0" && ch <= "9") ||
      ch === "-" ||
      ch === "_" ||
      ch === "." ||
      ch === "!" ||
      ch === "*" ||
      ch === "(" ||
      ch === ")"
    ) {
      out += ch;
    } else if (byte === 0x20) {
      out += "+";
    } else {
      out += "%" + byte.toString(16).toUpperCase().padStart(2, "0");
    }
  }
  return out;
}

// --- Headers (TreeCsvExporter.cs:37-67) -------------------------------------

/** Exact legacy header strings (transcribed verbatim), 25 columns. */
export function csvHeaders(units: Units): string[] {
  const abbr = unitsAbbreviation(units);
  const subAbbr = unitsSubAbbreviation(units);
  return [
    "Common Name",
    "Botanical Name",
    "State",
    "County",
    "Site",
    "Site Latitude",
    "Site Longitude",
    "Location comments",
    "Tree name",
    "Tree id",
    "Measurement number",
    "Latitude",
    "Longitude",
    "Elevation",
    "Ownership type",
    `Height (${abbr})`,
    "Height measurement method",
    `Girth (${abbr})`,
    `Girth (${subAbbr})`,
    `Crown spread (${abbr})`,
    "Tree comments",
    "Measurer(s)",
    "Measured",
    "Trip report url",
    "Photos available",
  ];
}

// --- Row (TreeCsvExporter.cs:69-96) -----------------------------------------

/** Builds the 25-value row for one tree, in exact legacy column order. */
export function buildTreeCsvRow(tree: ExportTreeRow, units: Units): string[] {
  const treeLatitudeCell = tree.latitudeSpecified
    ? formatLatitude(tree.latitudeDegrees, "DegreesDecimalMinutes")
    : "";
  const treeLongitudeCell = tree.longitudeSpecified
    ? formatLongitude(tree.longitudeDegrees, "DegreesDecimalMinutes")
    : "";
  const elevationCell = tree.elevationSpecified
    ? formatElevation(tree.elevationFeet, Units.Feet) // always feet, regardless of `units` (doc 01 §8)
    : "";
  const heightCell = tree.heightSpecified ? formatDistance(tree.heightFeet, units) : "";
  const girthPrefixCell = tree.girthSpecified ? formatDistance(tree.girthFeet, units) : "";
  const girthSubprefixCell = tree.girthSpecified ? distanceSubunit(tree.girthFeet, units) : "";
  const crownSpreadCell = tree.crownSpreadSpecified
    ? formatDistance(tree.crownSpreadFeet, units)
    : "";

  return [
    tree.commonName,
    tree.scientificName,
    tree.stateName,
    tree.county,
    tree.siteName,
    treeLatitudeCell, // "Site Latitude" header -- actually the tree's own coordinates (bug #2 above)
    treeLongitudeCell, // "Site Longitude" header -- ditto
    tree.siteComments,
    "", // "Tree name" -- always empty (legacy emits null)
    String(tree.id),
    String(tree.measurementCount),
    treeLatitudeCell, // "Latitude" -- duplicate of column 6 (bug #2 above)
    treeLongitudeCell, // "Longitude" -- duplicate of column 7
    elevationCell,
    tree.ownershipType,
    heightCell,
    describeHeightMeasurementMethod(tree.heightMeasurementMethod),
    girthPrefixCell,
    girthSubprefixCell,
    crownSpreadCell,
    tree.treeComments,
    tree.measurers.map(formatMeasurerName).join(", "),
    tree.measuredDate,
    dotNetUrlEncode(tree.tripReportUrl),
    tree.hasPhotos ? "Y" : "N",
  ];
}

// --- Serialization (CsvFileResult.cs:11-21) ---------------------------------

/** `CsvFileResult.CsvEncode` (CsvFileResult.cs:13-16): wrap in quotes, double any embedded quote. */
function csvEncodeField(value: string): string {
  return `"${(value ?? "").replace(/"/g, '""')}"`;
}

/**
 * `CsvFileResult.GetCsv` (CsvFileResult.cs:19-21): headers + rows, each cell
 * quoted and `""`-escaped, cells comma-joined, ROWS CRLF-joined via
 * `Environment.NewLine` (Windows/Azure App Service -- doc 01 D-002). Note:
 * `string.Join` puts a separator only BETWEEN rows, so there is no trailing
 * CRLF after the last row.
 */
export function serializeCsv(headers: string[], rows: string[][]): string {
  const allRows = [headers, ...rows];
  return allRows.map((row) => row.map(csvEncodeField).join(",")).join("\r\n");
}

// --- Filename (TreeCsvExporter.cs:14-35) ------------------------------------

/** One `Identifiers` entry (ExportController.cs's per-endpoint dictionaries), in insertion order. */
export interface CsvFilterIdentifier {
  key: string;
  value: string | null | undefined;
}

/**
 * `TreeCsvExporter.Filename` (TreeCsvExporter.cs:14-35): `{Key}-{Value} `
 * for every filter with a non-empty value (in the given order), or `All `
 * if none qualify, followed by `Trees ({unit token}).csv`. The unit token
 * is `ft`/`m`/`yd`, NOT `Feet`/`Meters`/`Yards` -- see discrepancy #1 above.
 */
export function exportFilename(filters: CsvFilterIdentifier[], units: Units): string {
  const qualifying = filters.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== "",
  );
  const prefix =
    qualifying.length > 0 ? qualifying.map((f) => `${f.key}-${f.value} `).join("") : "All ";
  return `${prefix}Trees (${unitsAbbreviation(units)}).csv`;
}
