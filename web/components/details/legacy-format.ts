/**
 * Shared display-formatting primitives for the Browse detail pages
 * (task P1-05/P1-06: Tree/Site details; intentionally reused LATER by the
 * parallel P1-07/P1-08 Species/State details task -- see this directory's
 * file header note in the task brief). These are the small "not exposed by
 * `lib/units/format.ts`" helpers every detail page needs on top of that
 * module's Distance/Elevation/Volume/RuckerIndex formatters: NullDisplayText
 * gating on `*_input_format` columns, the plain `{0:0.00}` float format used
 * by TDI2/TDI3/ENTSPTS/ENTSPTS2/ChampionPoints, `{0:MM/dd/yyyy}` dates,
 * `ConcatenatedNames.cshtml`'s name-list joiner, the `Coordinates`/
 * `Coordinates (calculated)` row-selection + verbatim-format logic, and the
 * `TreeHeightMeasurementMethod` enum's `Describe()` labels.
 *
 * `formatPlainFixed2`/`formatDateMMDDYYYY` intentionally duplicate
 * `db/queries/map.sql.ts`'s private (unexported) helpers of the same name --
 * see that file's header ("not imported... to keep this module
 * self-contained per file-ownership; duplicated intentionally, not by
 * oversight"). Same rationale here: this file lives in a different
 * ownership boundary (`components/details/**`) than `db/queries/map.sql.ts`.
 *
 * Every function here is a pure string/number transform -- no JSX, no data
 * fetching -- so it can be unit-tested and reused by both the Tree/Site
 * pages here and the later Species/State pages.
 */
import { fround, roundDotNetSingle } from "@/lib/units/float32";
import { Units, distanceSubunit, formatDistance, formatElevation, formatRuckerIndex, formatVolume } from "@/lib/units/format";
import { formatLatitude, formatLongitude } from "@/lib/geo/coordinates";

/** `DistanceFormat`/`ElevationFormat`/`VolumeFormat`/`CoordinatesFormat` (doc 01 §3): shared literal encoding across every legacy value-object. */
export const INPUT_FORMAT_INVALID = 0;
export const INPUT_FORMAT_UNSPECIFIED = 1;

/** `ISpecified.IsSpecified`: `InputFormat != Unspecified(1)` -- Invalid(0) still counts as "specified". */
export function isSpecifiedFormat(inputFormat: number): boolean {
  return inputFormat !== INPUT_FORMAT_UNSPECIFIED;
}

/** `object.IsValidAndSpecified()`: passes model validation (`InputFormat != Invalid(0)`) AND `IsSpecified`. */
export function isValidAndSpecifiedFormat(inputFormat: number): boolean {
  return inputFormat !== INPUT_FORMAT_INVALID && inputFormat !== INPUT_FORMAT_UNSPECIFIED;
}

/** `Distance.ToString(Units, UnitRenderMode)` / `[DisplayFormat(NullDisplayText = "(no data)")]` gate. */
export function formatDistanceField(
  feet: number,
  inputFormat: number,
  units: Units,
  mode: "default" | "subprefix" = "default",
): string {
  if (!isSpecifiedFormat(inputFormat)) return "(no data)";
  return mode === "subprefix" ? distanceSubunit(feet, units) : formatDistance(feet, units);
}

/** `Elevation.ToString(Units)` / NullDisplayText "(no data)" gate. */
export function formatElevationField(feet: number, inputFormat: number, units: Units): string {
  if (!isSpecifiedFormat(inputFormat)) return "(no data)";
  return formatElevation(feet, units);
}

/** `Volume.ToString(Units)` / NullDisplayText "(no data)" gate (`ConicalVolume`). */
export function formatVolumeField(cubicFeet: number, inputFormat: number, units: Units): string {
  if (!isSpecifiedFormat(inputFormat)) return "(no data)";
  return formatVolume(cubicFeet, units);
}

/** `RuckerIndex?.ToString(Units)` / NullDisplayText "(not enough data)" gate (RHI5/10/20, RGI5/10/20). */
export function formatRuckerField(value: number | null, units: Units): string {
  if (value === null) return "(not enough data)";
  return formatRuckerIndex(value, units);
}

/**
 * `{0:0.00}` on a plain (non-value-object) `float?` -- TDI2/TDI3/ENTSPTS/
 * ENTSPTS2/ChampionPoints/AbbreviatedChampionPoints all use this exact
 * format, NOT run through `Units`/`formatDistance`. Uses `roundDotNetSingle`
 * (7-significant-decimal-digit .NET `Single.ToString` rounding), NOT the
 * simpler `roundHalfAwayFromZero` -- verified against the production
 * snapshot corpus (doc 07 §5.4 `pages` category, tree ids 269567/269569/
 * 296622/236003/255910/268994/15972/23794/138851): `roundHalfAwayFromZero`
 * under-rounds by 1 in the last digit for several real ENTSPTS/ENTSPTS2/
 * ChampionPoints values (e.g. tree 269567's ENTSPTS2 renders "744.18" in
 * legacy; `roundHalfAwayFromZero` on the raw float32->float64 binary
 * expansion yields "744.17") -- the exact same class of bug `format.ts`'s
 * private `formatFixed` already documents/fixes for Distance/Elevation/
 * Volume/RuckerIndex (doc 07 §6, the "Iowa RGI10" example). `db/queries/
 * map.sql.ts`'s own `formatPlainFixed2` still uses `roundHalfAwayFromZero`
 * and is presumed to carry the same latent bug for marker-info's
 * TDI2/TDI3/ENTSPTS/ENTSPTS2/ChampionPoints rows -- not fixed here (out of
 * this task's file ownership), flagged for that task's/owner's attention.
 */
export function formatPlainFixed2(value: number): string {
  const rounded = roundDotNetSingle(value, 2);
  const normalized = rounded === 0 ? 0 : rounded;
  return normalized.toFixed(2);
}

/** `formatPlainFixed2` gated by `[DisplayFormat(NullDisplayText = "(not enough data)")]` (TDI2/TDI3/ENTSPTS/ENTSPTS2). */
export function formatPlainFixed2OrNotEnough(value: number | null): string {
  if (value === null) return "(not enough data)";
  return formatPlainFixed2(value);
}

/**
 * `TMD/Views/Shared/DisplayTemplates/Url.cshtml` (used for `SiteVisit.
 * TripReportUrl`, `[DataType(DataType.Url)]`): the rendered `<a>`'s TEXT
 * content is `uri.IsAbsoluteUri ? uri.Authority + uri.AbsolutePath :
 * uri.OriginalString`, then `.TrimEnd('/')` -- i.e. for an absolute URL
 * (has a `scheme://`), the display text drops the scheme AND the query
 * string/fragment (neither `Authority` nor `AbsolutePath` includes them),
 * keeping only `host[:port]/path`; for a bare (schemeless) string, it's
 * shown as-is. `extract()`'s `parseReportRowsRaw` reads the anchor's TEXT
 * content (`td.value`'s `.text()`), not its `href` -- verified against the
 * production snapshot corpus (doc 07 §5.4 `pages` category: e.g. site 446's
 * `tripReportUrl` "http://www.ents-bbs.org/viewtopic.php?f=122&t=7563"
 * displays as "www.ents-bbs.org/viewtopic.php"). NullDisplayText "(none)"
 * for an empty string is handled by the caller (same convention as
 * `GeneralComments`/`Comments`), not here.
 */
export function formatTripReportUrl(raw: string): string {
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  if (!hasScheme) return raw.replace(/\/+$/, "");
  try {
    const u = new URL(raw);
    return `${u.host}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

/**
 * Task P1-16 (Trip report url linkify): legacy's `Url.cshtml`
 * DisplayTemplate renders `SiteVisit.TripReportUrl` as a real `<a href>`
 * (the DISPLAY TEXT is `formatTripReportUrl` above, read verbatim by
 * `extract()`'s `parseReportRowsRaw` -- see that function's doc comment;
 * the `href` itself is never read by the extractor, so this port is free
 * to choose one without any parity risk). A bare/schemeless raw value
 * (`hasScheme` false) gets `http://` prepended so it's still a navigable
 * absolute URL -- same "assume http" convention as every other schemeless
 * value already tolerated by `formatTripReportUrl`'s own `hasScheme` check
 * above.
 */
export function tripReportUrlHref(raw: string): string {
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  return hasScheme ? raw : `http://${raw}`;
}

/**
 * `{0:MM/dd/yyyy}` on a date/date? column, reading a `YYYY-MM-DD` (or
 * `YYYY-MM-DD...` timestamp) text value. `null`/`undefined` -> `""`
 * (ASP.NET MVC's un-overridden default `NullDisplayText`) -- only used
 * where no `NullDisplayText` override applies (none of this task's date
 * fields are ever actually null for a resolvable id, this is defensive).
 */
export function formatDateMMDDYYYY(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const datePart = isoDate.slice(0, 10);
  const [y, m, d] = datePart.split("-");
  return `${m}/${d}/${y}`;
}

/** `countries`/`states` char(2)/char(3) columns are space-padded; `Country.Code`/`State.Code` fallback logic (Country.cs:28-36). */
export function codeOf(doubleLetterCode: string, tripleLetterCode: string): string {
  const d = doubleLetterCode.trim();
  return d.length > 0 ? d : tripleLetterCode.trim();
}

/** `Views/Shared/DisplayTemplates/State.cshtml`: `"{Name} ({Country.Code})"`. */
export function formatStateWithCountry(stateName: string, countryDouble: string, countryTriple: string): string {
  return `${stateName} (${codeOf(countryDouble, countryTriple)})`;
}

/** `TreeHeightMeasurementMethod` (`TMD.Model/Imports/TreeBase.cs:15-19`) `Describe()` labels. `NotSpecified` (0) empirically renders "(no data)" via the custom `IsModelNull` check (verified against the snapshot corpus), not an empty string. */
const HEIGHT_MEASUREMENT_METHOD_LABELS: Record<number, string> = {
  0: "(no data)",
  1: "Clinometer/laser rangefinder/sine",
  2: "Tree climb with tape drop",
  3: "Long measuring pole",
  4: "Formal transit/total station survey",
};

export function formatHeightMeasurementMethod(code: number): string {
  return HEIGHT_MEASUREMENT_METHOD_LABELS[code] ?? "(no data)";
}

/** A single measurer/visitor name, matching `Name.ToString()` (`TMD.Model/ValueObjects/Name.cs:32-37`): `"{First} {Last}"`, or `""` if either half is blank. */
export interface PersonName {
  firstName: string;
  lastName: string;
}

function nameToString(n: PersonName): string {
  if (!n.firstName.trim() || !n.lastName.trim()) return "";
  return `${n.firstName} ${n.lastName}`;
}

/**
 * `Views/Shared/DisplayTemplates/ConcatenatedNames.cshtml`: 1 name -> itself;
 * 2 -> `"A and B"`; 3+ -> `"A, B, and C"` (Oxford comma before the last),
 * verified against the snapshot corpus's `measurers`/`visitors` fields.
 */
export function concatenateNames(names: PersonName[]): string {
  const strs = names.map(nameToString).filter((s) => s.length > 0);
  if (strs.length === 0) return "";
  if (strs.length === 1) return strs[0]!;
  if (strs.length === 2) return `${strs[0]} and ${strs[1]}`;
  return `${strs.slice(0, -1).join(", ")}, and ${strs[strs.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Coordinates -- `Coordinates.ToString(CoordinatesFormat)` / the
// `Coordinates` vs `Coordinates (calculated)` row-selection `if` in
// TreeDetails.cshtml/SiteDetails.cshtml (both identical).
//
// `[DisplayFormat(DataFormatString = "Default")]` on both the raw and
// calculated coordinates rows always renders `CoordinatesFormat.Default`,
// which `Latitude.cs`/`Longitude.cs`'s `ToString(CoordinatesFormat)` switch
// maps to `DegreesDecimalMinutes` -- NOT affected by the visitor's units
// cookie (this is `ToString(CoordinatesFormat)`, not `ToString(Units)`).
// ---------------------------------------------------------------------------

export interface CoordinateFields {
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
}

/**
 * `Coordinates.ToString(format)` (Coordinates.cs:49-69): `""` when neither
 * axis is specified (`IsSpecified` is an OR of the two subs); otherwise each
 * axis renders independently (an unspecified axis contributes `""`) and the
 * two are joined with `", "` UNLESS either axis's own `InputFormat` is
 * `Invalid(0)`, in which case they're concatenated with NO separator at all
 * (`Coordinates.cs:56-58`) -- a legacy quirk preserved verbatim, not fixed.
 */
export function formatCoordinatesValue(c: CoordinateFields): string {
  const latSpecified = isSpecifiedFormat(c.latitudeInputFormat);
  const lngSpecified = isSpecifiedFormat(c.longitudeInputFormat);
  if (!latSpecified && !lngSpecified) return "";
  const aggregateInvalid = c.latitudeInputFormat === INPUT_FORMAT_INVALID || c.longitudeInputFormat === INPUT_FORMAT_INVALID;
  const latStr = latSpecified ? formatLatitude(c.latitude, "DegreesDecimalMinutes") : "";
  const lngStr = lngSpecified ? formatLongitude(c.longitude, "DegreesDecimalMinutes") : "";
  return aggregateInvalid ? `${latStr}${lngStr}` : `${latStr}, ${lngStr}`;
}

/**
 * `Coordinates.IsValidAndSpecified()`: passes validation (neither axis's own
 * `InputFormat` is `Invalid(0)`) AND is specified (`IsSpecified`, an OR --
 * so one valid+specified axis is enough even if the other is genuinely
 * unspecified; a real legacy quirk, preserved).
 */
export function isCoordinatesValidAndSpecified(c: CoordinateFields): boolean {
  const neitherInvalid = c.latitudeInputFormat !== INPUT_FORMAT_INVALID && c.longitudeInputFormat !== INPUT_FORMAT_INVALID;
  const eitherSpecified = isSpecifiedFormat(c.latitudeInputFormat) || isSpecifiedFormat(c.longitudeInputFormat);
  return neitherInvalid && eitherSpecified;
}

export interface CoordinatesRow {
  label: "Coordinates" | "Coordinates (calculated)";
  value: string;
  kind: "specified" | "calculated";
  /**
   * Task P1-16 ("View on map" link): the numeric lat/lng of whichever pair
   * (raw or calculated) is actually shown, or `null` when there's nothing
   * safe to link to. Gated STRICTER than `value`/`label` above -- `value`
   * can render a real-looking string off just ONE specified axis (legacy's
   * `IsSpecified` OR quirk, see `isCoordinatesValidAndSpecified`'s doc
   * comment), but plotting a point needs BOTH axes individually
   * valid-and-specified, else the unspecified axis's raw stored number
   * (e.g. `0`) would place a bogus marker. Never affects `value`/`label`,
   * so purely additive -- no parity impact.
   */
  coordinates: { latitude: number; longitude: number } | null;
}

/**
 * `TreeDetails.cshtml`/`SiteDetails.cshtml`'s Location-table branch:
 * `if (Coordinates.IsValidAndSpecified() || !CalculatedCoordinates.IsValidAndSpecified())`
 * show raw `Coordinates`, else show `CalculatedCoordinates` (labeled
 * "Coordinates (calculated)"). Either branch still applies the
 * `NullDisplayText = "(no data)"` gate on whichever one is actually shown.
 */
export function selectCoordinatesRow(raw: CoordinateFields, calculated: CoordinateFields): CoordinatesRow {
  const rawOk = isCoordinatesValidAndSpecified(raw);
  const calculatedOk = isCoordinatesValidAndSpecified(calculated);
  const useRaw = rawOk || !calculatedOk;
  const chosen = useRaw ? raw : calculated;
  const text = formatCoordinatesValue(chosen);
  const bothAxesSpecified =
    isValidAndSpecifiedFormat(chosen.latitudeInputFormat) && isValidAndSpecifiedFormat(chosen.longitudeInputFormat);
  return {
    label: useRaw ? "Coordinates" : "Coordinates (calculated)",
    value: text || "(no data)",
    kind: useRaw ? "specified" : "calculated",
    coordinates: bothAxesSpecified ? { latitude: chosen.latitude, longitude: chosen.longitude } : null,
  };
}

// ---------------------------------------------------------------------------
// TDI2/TDI3 -- `Species.CalculateTDI2/TDI3` (`TMD.Model/Trees/Species.cs:35-66`),
// evaluated against the CURRENT global max height/girth/crown-spread for the
// tree/measurement's (scientific_name, common_name) pair. NOT persisted;
// `db/queries/details.sql.ts` computes the live global max via a join and
// exposes the raw pre-division inputs, formatted here.
//
// Same "TDI gating deviation" as `db/queries/map.sql.ts` (see that file's
// header): legacy's literal gate (`!MaxHeight.IsSpecified`) never actually
// excludes the max=0 case (`Invalid(0) != Unspecified(1)`), which would
// divide by zero. This port instead gates on `maxHeight/maxGirth/
// maxCrownSpread !== 0`, matching `map.sql.ts`'s already-verified-against-
// the-corpus deviation, for consistency across the two ports.
// ---------------------------------------------------------------------------

export interface TdiInputs {
  height: number;
  heightInputFormat: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  maxHeight: number;
  maxGirth: number;
  maxCrownSpread: number;
}

export function calculateTDI2(r: TdiInputs): number | null {
  if (!isSpecifiedFormat(r.heightInputFormat) || !isSpecifiedFormat(r.girthInputFormat)) return null;
  if (r.maxHeight === 0 || r.maxGirth === 0) return null;
  return fround(r.height / r.maxHeight + r.girth / r.maxGirth);
}

export function calculateTDI3(r: TdiInputs): number | null {
  if (!isSpecifiedFormat(r.heightInputFormat) || !isSpecifiedFormat(r.girthInputFormat) || !isSpecifiedFormat(r.crownSpreadInputFormat))
    return null;
  if (r.maxHeight === 0 || r.maxGirth === 0 || r.maxCrownSpread === 0) return null;
  return fround(r.height / r.maxHeight + r.girth / r.maxGirth + r.crownSpread / r.maxCrownSpread);
}
