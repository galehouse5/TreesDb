/**
 * Pure Sites-step logic for the import wizard -- task P3-04 (doc 05
 * §P3-04, doc 01 §10). No DB access; db/queries/import-drafts.sql.ts's
 * appended site functions persist what this module validates/normalizes,
 * and app/import/[tripId]/sites/actions.ts calls it directly before
 * persisting.
 *
 * Ports (read before touching this file):
 * - `TMD.Model/Imports/Site.cs` -- the entity's own field setters
 *   (`OrEmptyAndTrimToTitleCase`/`OrEmptyAndTrim`, see the per-field
 *   normalizers below) and its `[NotEmptyOrWhitesapce]`/`[Length]`/
 *   `[NotNull]` attributes, all tagged `ValidationTag.Required` --
 *   EXCEPT `Trees`/`Photos`, whose `[Size2(...)]` attributes are also
 *   Required-tagged on the entity but are deliberately NOT ported here:
 *   they belong to the Trees step (P3-05, not built by this task) and the
 *   photo-upload task (P3-08), neither of which exists yet, exactly
 *   mirroring how lib/import-wizard.ts's Trip-step validation omits
 *   `Trip.Sites`'s own Required-tagged `[Size(1,100)]` (see that file's
 *   header for the "strict subset of what Finish checks" reasoning --
 *   the same reasoning applies here one level down the aggregate).
 * - `TMD.Model/ValueObjects/{Coordinates,Latitude,Longitude}.cs` -- the
 *   `[Valid]`-cascaded Required-tag constraints reachable from
 *   `Site.Coordinates` (`Latitude`/`Longitude`'s own `Within2`/
 *   `NotEquals(Invalid)` attributes) -- surfaced on a single `coordinates`
 *   field per `TMD/Mappings/ImportMapping.cs` `configureForSites()`'s
 *   `ValidationMapper.CreateMap<Site, ImportSiteModel>()
 *   .ForPath("*.Coordinates.*", "*.Coordinates")` rule (any nested
 *   Latitude/Longitude error collapses onto the outer `Coordinates` model
 *   field). Parsing itself is `lib/units/parse-coordinates.ts`'s job; this
 *   module only validates the *result* of that parse.
 * - `Site.OptionalValidate` (`Site.cs:40-47`,
 *   `[ContextMethod(nameof(OptionalValidate), Tags = ValidationTag.Optional)]`)
 *   -- coordinates specified but outside the selected state's
 *   `CoordinateBounds` is a soft warning, not a hard blocker (legacy's
 *   "Continue, ignoring optional errors" second button click bypasses
 *   ONLY this tier, never the Required tier -- see
 *   `ImportController.SaveSite`/`SaveSites`, `ImportController.cs:99-163`).
 *   Evaluated ONLY when the Required pass is clean, matching legacy's
 *   `if (!ModelState.IsValid) return ...;` gate before the Optional pass
 *   runs (`Site.cs`'s guard needs a non-null `State` to read
 *   `State.CoordinateBounds`, which Required-tag validation already
 *   guarantees by the time Optional runs).
 */
import { legacyTitleCase } from "./account-flows";
import { normalizeTrimOnly } from "./import-wizard";
import type { CoordinateFormat } from "./geo/coordinates";
import { formatLatitude, formatLongitude } from "./geo/coordinates";
import { CoordinatesFormat, parseCoordinates } from "./units/parse-coordinates";

// ---------------------------------------------------------------------------
// Scalar field normalization (Site.cs property setters)
// ---------------------------------------------------------------------------

/** `Site.Name`/`Site.County` setters: `value.OrEmptyAndTrimToTitleCase()` (Site.cs:34,80). */
export function normalizeSiteName(raw: string): string {
  return legacyTitleCase(raw ?? "");
}

export function normalizeCounty(raw: string): string {
  return legacyTitleCase(raw ?? "");
}

/** `Site.OwnershipType`/`OwnershipContactInfo`/`Comments` setters:
 * `value.OrEmptyAndTrim()` (Site.cs:89,97,107) -- trimmed, NOT title-cased
 * (unlike Name/County above -- a genuine difference in Site.cs, not a typo). */
export function normalizeOwnershipType(raw: string): string {
  return normalizeTrimOnly(raw);
}

// ---------------------------------------------------------------------------
// Coordinates round-trip formatting (Coordinates.ToString(), no-arg overload
// -- Coordinates.cs:49-51 -- each axis renders in ITS OWN stored InputFormat,
// independently; unlike components/details/legacy-format.ts's
// `formatCoordinatesValue`, which is the *explicit*-format overload
// (`Coordinates.ToString(CoordinatesFormat)`) used by the read-only detail
// pages' `[DisplayFormat(DataFormatString="Default")]` override -- the Sites
// step's `ImportSiteModel.Coordinates` carries no such override, so the
// text field redisplays whatever format the user originally typed, not a
// forced DDM.)
// ---------------------------------------------------------------------------

function coordinateFormatFromCode(code: number): CoordinateFormat | null {
  switch (code) {
    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
      return "DegreesMinutesDecimalSeconds";
    case CoordinatesFormat.DegreesDecimalMinutes:
    case CoordinatesFormat.Default:
      return "DegreesDecimalMinutes";
    case CoordinatesFormat.DecimalDegrees:
      return "DecimalDegrees";
    default:
      // Unspecified/Invalid -- Invalid can never reach here for a
      // successfully-saved site (Required-tag validation below blocks it).
      return null;
  }
}

/**
 * Formats a PERSISTED site's stored lat/lng + format codes back into the
 * single comma-joined text the Coordinates field accepts as input --
 * `Coordinates.ToString()`'s no-arg overload, own-format-per-axis. Used to
 * populate the text field's default value when (re)opening an unedited,
 * already-saved site for editing; NOT used for redisplay-after-a-failed-
 * save (that case echoes the user's raw just-submitted text verbatim, same
 * convention as the Trip step's `?state=` redisplay).
 */
export function formatStoredCoordinates(
  latitude: number,
  latitudeInputFormat: number,
  longitude: number,
  longitudeInputFormat: number,
): string {
  const latSpecified = latitudeInputFormat !== CoordinatesFormat.Unspecified;
  const lngSpecified = longitudeInputFormat !== CoordinatesFormat.Unspecified;
  if (!latSpecified && !lngSpecified) return "";
  const latFormat = coordinateFormatFromCode(latitudeInputFormat);
  const lngFormat = coordinateFormatFromCode(longitudeInputFormat);
  const latStr = latSpecified && latFormat ? formatLatitude(latitude, latFormat) : "";
  const lngStr = lngSpecified && lngFormat ? formatLongitude(longitude, lngFormat) : "";
  return `${latStr}, ${lngStr}`;
}

// ---------------------------------------------------------------------------
// Site-step validation (Site.cs's own Required-tagged attributes)
// ---------------------------------------------------------------------------

export type SiteStepFieldName =
  | "name"
  | "coordinates"
  | "stateId"
  | "county"
  | "ownershipType"
  | "ownershipContactInfo"
  | "comments";

export interface SiteStepFieldError {
  field: SiteStepFieldName;
  message: string;
}

export interface SiteStepInput {
  name: string;
  /** Raw text as typed/picked, e.g. "41 29.959, -81 41.662" -- blank means
   * unspecified. Parsed by `lib/units/parse-coordinates.ts`. */
  coordinates: string;
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
}

export interface NormalizedSiteStep {
  name: string;
  latitude: number;
  latitudeInputFormat: CoordinatesFormat;
  longitude: number;
  longitudeInputFormat: CoordinatesFormat;
  /** OR of each axis's `IsSpecified` -- `Coordinates.IsSpecified`,
   * Coordinates.cs:23 (see parse-coordinates.ts's own note on this being a
   * deliberate legacy OR/AND inconsistency vs. combined `inputFormat`). */
  isSpecified: boolean;
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
}

/**
 * Applies every `Site.cs` setter transform, THEN validates the result
 * against every Required-tagged attribute on `Site`'s own scalar fields
 * (name/coordinates/state/county/ownershipType/ownershipContactInfo/
 * comments) -- mirroring `this.ValidateMappedModel<Site, ImportSiteModel>(
 * site, prefix, ValidationTag.Required)` (`ImportController.cs:103,143`)
 * restricted to fields this task owns (see file header). Collects every
 * applicable error (NHibernate's validator does not short-circuit), same
 * as legacy surfacing every field error at once via ModelState.
 */
export function buildSiteStep(input: SiteStepInput): {
  normalized: NormalizedSiteStep;
  errors: SiteStepFieldError[];
} {
  const errors: SiteStepFieldError[] = [];

  const name = normalizeSiteName(input.name);
  if (name === "") {
    errors.push({ field: "name", message: "Site name must be specified." }); // Site.cs:29
  } else if (name.length > 100) {
    errors.push({ field: "name", message: "Site name must not exceed 100 characters." }); // Site.cs:30
  }

  const parsedCoordinates = parseCoordinates(input.coordinates);
  const coordinateErrors: string[] = [];
  if (parsedCoordinates.latitude.inputFormat === CoordinatesFormat.Invalid) {
    // Latitude.cs:19
    coordinateErrors.push("Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.");
  } else if (parsedCoordinates.latitude.totalDegrees < -90 || parsedCoordinates.latitude.totalDegrees > 90) {
    // Latitude.cs:16 (Within2(-90,90) inclusive)
    coordinateErrors.push("Latitude must be in the range of -90 to +90 degrees.");
  }
  if (parsedCoordinates.longitude.inputFormat === CoordinatesFormat.Invalid) {
    // Longitude.cs:19
    coordinateErrors.push("Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.");
  } else if (parsedCoordinates.longitude.totalDegrees < -180 || parsedCoordinates.longitude.totalDegrees > 180) {
    // Longitude.cs:16 (Within2(-180,180) inclusive)
    coordinateErrors.push("Longitude must be in the range of -180 to +180 degrees.");
  }
  for (const message of coordinateErrors) {
    errors.push({ field: "coordinates", message });
  }

  if (input.stateId === null) {
    errors.push({ field: "stateId", message: "Site state must be specified." }); // Site.cs:71
  }

  const county = normalizeCounty(input.county);
  if (county === "") {
    errors.push({ field: "county", message: "Site county must be specified." }); // Site.cs:75
  } else if (county.length > 100) {
    errors.push({ field: "county", message: "Site county must not exceed 100 characters." }); // Site.cs:76
  }

  const ownershipType = normalizeOwnershipType(input.ownershipType);
  if (ownershipType === "") {
    errors.push({ field: "ownershipType", message: "Site ownership type name must be specified." }); // Site.cs:84
  } else if (ownershipType.length > 100) {
    errors.push({ field: "ownershipType", message: "Site ownership type must not exceed 100 characters." }); // Site.cs:85
  }

  const ownershipContactInfo = normalizeTrimOnly(input.ownershipContactInfo);
  if (ownershipContactInfo.length > 200) {
    // Site.cs:93 -- Length only, no NotEmptyOrWhitespace: blank is fine.
    errors.push({
      field: "ownershipContactInfo",
      message: "Site ownership contact info must not exceed 200 characters.",
    });
  }

  const comments = normalizeTrimOnly(input.comments);
  if (comments.length > 1000) {
    // Site.cs:103 -- Length only, blank is fine.
    errors.push({ field: "comments", message: "Site comments must not exceed 1,000 characters." });
  }

  return {
    normalized: {
      name,
      latitude: parsedCoordinates.latitude.totalDegrees,
      latitudeInputFormat: parsedCoordinates.latitude.inputFormat,
      longitude: parsedCoordinates.longitude.totalDegrees,
      longitudeInputFormat: parsedCoordinates.longitude.inputFormat,
      isSpecified: parsedCoordinates.isSpecified,
      stateId: input.stateId,
      county,
      ownershipType,
      ownershipContactInfo,
      makeOwnershipContactInfoPublic: input.makeOwnershipContactInfoPublic,
      comments,
    },
    errors,
  };
}

// ---------------------------------------------------------------------------
// Persisted-row -> step-input reconstruction (shared by
// app/import/[tripId]/sites/page.tsx, computing each site's default
// editing/display mode, and .../actions.ts's `continueSitesAction`,
// re-validating every already-saved site against the Required tag).
// ---------------------------------------------------------------------------

export interface PersistedSiteFields {
  name: string;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
}

/** Round-trips a persisted `db/queries/import-drafts.sql.ts` `ImportSite`
 * row back into `SiteStepInput` shape (via `formatStoredCoordinates` for
 * the single coordinates text field), so `buildSiteStep` can be reused
 * both to VALIDATE already-saved data (mirroring `Site.Validate` on a
 * loaded entity) and to populate an edit form's default values. */
export function siteToStepInput(site: PersistedSiteFields): SiteStepInput {
  return {
    name: site.name,
    coordinates: formatStoredCoordinates(
      site.latitude,
      site.latitudeInputFormat,
      site.longitude,
      site.longitudeInputFormat,
    ),
    stateId: site.stateId,
    county: site.county,
    ownershipType: site.ownershipType,
    ownershipContactInfo: site.ownershipContactInfo,
    makeOwnershipContactInfoPublic: site.makeOwnershipContactInfoPublic,
    comments: site.comments,
  };
}

// ---------------------------------------------------------------------------
// Optional-tag validation (Site.OptionalValidate, Site.cs:40-47)
// ---------------------------------------------------------------------------

export interface StateBounds {
  neLatitude: number;
  neLongitude: number;
  swLatitude: number;
  swLongitude: number;
}

/**
 * `State.CoordinateBounds.Contains(Coordinates)`
 * (`TMD.Model/ValueObjects/CoordinateBounds.cs:83-90`): a simple lat/lng
 * rectangle test against the state's precomputed NE/SW corners (the
 * `states.ne_latitude`/`ne_longitude`/`sw_latitude`/`sw_longitude` columns).
 */
function containsCoordinates(bounds: StateBounds, latitude: number, longitude: number): boolean {
  return (
    bounds.swLatitude <= latitude &&
    latitude <= bounds.neLatitude &&
    bounds.swLongitude <= longitude &&
    longitude <= bounds.neLongitude
  );
}

/**
 * Only call once the Required-tag pass (`buildSiteStep`) is clean, matching
 * legacy's two-phase gate (file header) -- `bounds` is the selected
 * `stateId`'s row, guaranteed resolvable at that point since Required-tag
 * validation already demands a non-null `stateId`.
 */
export function validateSiteOptional(normalized: NormalizedSiteStep, bounds: StateBounds): SiteStepFieldError[] {
  if (normalized.isSpecified && !containsCoordinates(bounds, normalized.latitude, normalized.longitude)) {
    return [
      {
        field: "coordinates",
        message:
          "(Optional) Coordinates appear to fall outside the state's boundaries.  You might want to double check them.",
      },
    ];
  }
  return [];
}
