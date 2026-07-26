// Plain-data types for the Phase 3 merge engine's import side and its
// domain-graph output. Independent of Drizzle (`db/schema.ts`) on purpose --
// these are pure in/out shapes; a transactional orchestrator (later work)
// is responsible for reading rows into `ImportSiteRow`/`ImportTreeRow` etc.
// and for persisting a built `SiteGraph`.
//
// Source of truth: docs/migration/01-system-reference.md §2 (schema), §3
// (enum codes), §10 (merge algorithm, all 5 steps); legacy
// TMD.Model/Imports/{Site,TreeBase,SingleTrunkTree,MultiTrunkTree,Trunk,Trip,
// SitePhotoReference,TreePhotoReference}.cs; TMD.Model/Sites/{Site,SiteVisit,
// SiteVisitPhotoReference}.cs; TMD.Model/Trees/{Tree,Measurement}.cs.
//
// OWNERSHIP BOUNDARY (read before editing): a parallel task owns
// `web/lib/merge/derived.ts`, which computes "RecalculateProperties" --
// Tree/Site headline copy-down from their latest measurement/visit, the
// per-measurement derived numbers (Diameter/ENTSPTS/ENTSPTS2/ChampionPoints/
// AbbreviatedChampionPoints/ConicalVolume), and visitor/measurer
// deduplication. This file does NOT import derived.ts. Every field that
// belongs to that computation is grouped under a `*headline`/`derivedNumbers`
// slot typed by a loosely-defined placeholder interface below, populated as
// `null` by `buildSiteGraph` (see graph.ts) and expected to be filled in by
// the orchestrator after calling into derived.ts. The placeholder
// interfaces here describe the *shape* derived.ts is expected to produce
// (field names/types only) so this file typechecks standalone; they are not
// authoritative over derived.ts's actual exported signature.

// ---------------------------------------------------------------------------
// Enum codes (doc 01 §3 -- persisted as smallint/tinyint; preserve values).
// ---------------------------------------------------------------------------

/** `CoordinatesFormat` (legacy `Coordinates.cs:6`). */
export const CoordinatesFormat = {
  Invalid: 0,
  Unspecified: 1,
  Default: 2,
  DegreesMinutesDecimalSeconds: 3,
  DegreesDecimalMinutes: 4,
  DecimalDegrees: 5,
} as const;
export type CoordinatesFormatCode = (typeof CoordinatesFormat)[keyof typeof CoordinatesFormat];

/**
 * `Photos.References.Type` discriminator (doc 01 §2 table, doc 01 §3).
 * The merge engine re-types photo references twice as they cascade from
 * import rows to the canonical domain (see graph.ts's header comment for
 * the full transcribed table with citations).
 */
export const PhotoReferenceType = {
  Public: 1,
  ImportSite: 2,
  ImportTree: 3,
  Site: 4,
  SiteVisit: 5,
  Tree: 6,
  TreeMeasurement: 7,
} as const;
export type PhotoReferenceTypeCode = (typeof PhotoReferenceType)[keyof typeof PhotoReferenceType];

/** `Imports.Trees.Type` discriminator (doc 01 §2/§3: 1 SingleTrunkTree, 2 MultiTrunkTree). */
export const ImportTreeType = {
  SingleTrunk: 1,
  MultiTrunk: 2,
} as const;
export type ImportTreeTypeCode = (typeof ImportTreeType)[keyof typeof ImportTreeType];

// ---------------------------------------------------------------------------
// Shared value shapes
// ---------------------------------------------------------------------------

/** A `Name` value (legacy `TMD.Model/ValueObjects/Name.cs`): first/last name pair. */
export interface NameInput {
  firstName: string;
  lastName: string;
}

/**
 * `Coordinates` (legacy `Coordinates.cs`/`Latitude.cs`/`Longitude.cs`):
 * float32 total-degrees + format code per axis. Mirrors the
 * `{latitude,longitude}` / `{...}_input_format` column pairs used
 * throughout `sites`/`site_visits`/`trees`/`tree_measurements`/`import_sites`/
 * `import_trees`.
 */
export interface CoordinatesInput {
  latitude: number;
  latitudeInputFormat: CoordinatesFormatCode;
  longitude: number;
  longitudeInputFormat: CoordinatesFormatCode;
}

/**
 * `Coordinates.IsSpecified` (`Coordinates.cs:23`): `Latitude.IsSpecified ||
 * Longitude.IsSpecified` -- an OR, not an AND. Each axis's `IsSpecified` is
 * `InputFormat != Unspecified(1)` (`Latitude.cs:28`, `Longitude.cs:28`).
 */
export function isCoordinatesSpecified(c: CoordinatesInput): boolean {
  return (
    c.latitudeInputFormat !== CoordinatesFormat.Unspecified ||
    c.longitudeInputFormat !== CoordinatesFormat.Unspecified
  );
}

/**
 * `Coordinates.IsValidAndSpecified()` (`TMD.Model/Extensions/
 * ISpecifiedExtensions.cs:7-13`, applied to `Coordinates`): the NHibernate
 * `Required`-tagged validation on `Coordinates` cascades into both axes'
 * `[NotEquals(Invalid)]` constraint (so BOTH must be non-Invalid), ANDed with
 * `IsSpecified` (the OR above). Used by the import-side `CalculateCoordinates`
 * cascade (`TMD.Model/Imports/{Site,TreeBase}.cs`, `CoordinateBounds.cs:71`)
 * to decide whether a coordinate pair counts as "this entity's own".
 */
export function isCoordinatesValidAndSpecified(c: CoordinatesInput): boolean {
  const bothAxesValid =
    c.latitudeInputFormat !== CoordinatesFormat.Invalid &&
    c.longitudeInputFormat !== CoordinatesFormat.Invalid;
  return bothAxesValid && isCoordinatesSpecified(c);
}

/**
 * `Coordinates.InputFormat` getter (`Coordinates.cs:25-39`): Invalid if
 * either axis is Invalid, else Unspecified if either axis is Unspecified,
 * else the (shared) specified format. Used when synthesizing a `Coordinates`
 * value from a computed lat/lng pair (`CoordinateBounds` NE/SW/Center all
 * share one format value per `Coordinates.Create(lat, lng, format)`).
 */
export function coordinatesInputFormat(c: CoordinatesInput): CoordinatesFormatCode {
  if (
    c.latitudeInputFormat === CoordinatesFormat.Invalid ||
    c.longitudeInputFormat === CoordinatesFormat.Invalid
  ) {
    return CoordinatesFormat.Invalid;
  }
  if (
    c.latitudeInputFormat === CoordinatesFormat.Unspecified ||
    c.longitudeInputFormat === CoordinatesFormat.Unspecified
  ) {
    return CoordinatesFormat.Unspecified;
  }
  return c.latitudeInputFormat;
}

/** `Coordinates.Null()`: Unspecified format, 0 degrees both axes. */
export function nullCoordinates(): CoordinatesInput {
  return {
    latitude: 0,
    latitudeInputFormat: CoordinatesFormat.Unspecified,
    longitude: 0,
    longitudeInputFormat: CoordinatesFormat.Unspecified,
  };
}

/** `Coordinates.Equals` (`Coordinates.cs:75-79`): exact float32 equality per axis, no epsilon. */
export function coordinatesEqual(a: CoordinatesInput, b: CoordinatesInput): boolean {
  return Math.fround(a.latitude) === Math.fround(b.latitude)
    && Math.fround(a.longitude) === Math.fround(b.longitude);
}

// ---------------------------------------------------------------------------
// Import-side row mirrors (db/schema.ts `import_*` tables).
//
// These are full column mirrors for fidelity (future wizard-draft code needs
// the whole row); the merge engine (graph.ts) only reads a subset -- see its
// header comment for exactly which TreeBase fields Measurement.Create copies
// (Trunks/Status/AgeClass/AgeType/Age/TerrainType/TerrainShapeIndex/
// LandformIndex/FormType and friends are staging-only and never flow into
// the canonical Trees/Measurements tables).
// ---------------------------------------------------------------------------

/** `import_trips` row (legacy `Imports.Trips`). */
export interface ImportTripRow {
  id: number;
  creatorUserId: number | null;
  created: string;
  imported: string | null;
  name: string;
  /** Nullable at draft time; `NotNull`-validated (Required tag) before `Import()`. */
  date: string | null;
  website: string;
  photosAvailable: boolean;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  defaultLaserBrand: string | null;
  defaultClinometerBrand: string | null;
  defaultHeightMeasurementMethod: number;
  defaultStateId: number | null;
  defaultCounty: string | null;
  lastSaved: string;
}

/** `import_trip_measurers` row (legacy `Imports.Measurers`). */
export interface ImportTripMeasurerRow {
  id: number;
  tripId: number | null;
  firstName: string;
  lastName: string;
}

/** `import_sites` row (legacy `Imports.Sites`). */
export interface ImportSiteRow {
  id: number;
  created: string;
  creatorUserId: number | null;
  tripId: number;
  name: string;
  /** Nullable in the DB (schema.ts note 1) but `NotNull`-validated (Required tag) before `Import()`. */
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  latitude: number;
  latitudeInputFormat: CoordinatesFormatCode;
  longitude: number;
  longitudeInputFormat: CoordinatesFormatCode;
  comments: string;
}

/** `import_trees` row (legacy `Imports.Trees`, both `SingleTrunkTree`/`MultiTrunkTree` subtypes). */
export interface ImportTreeRow {
  id: number;
  created: string;
  creatorUserId: number | null;
  siteId: number;
  type: ImportTreeTypeCode;
  treeName: string;
  treeNumber: number | null;
  commonName: string;
  /** Blank-tested by `NullIfEmpty() ?? "(Unidentified)"` -- see graph.ts. Always pre-trimmed by the entry-side setter (`OrEmptyAndTrimToSentenceCase`), so "blank" means exactly `""`, never whitespace-only. */
  scientificName: string;
  status: number;
  healthStatus: string;
  ageClass: number;
  ageType: number;
  age: number | null;
  generalComments: string;
  latitude: number;
  latitudeInputFormat: CoordinatesFormatCode;
  longitude: number;
  longitudeInputFormat: CoordinatesFormatCode;
  makeCoordinatesPublic: boolean;
  elevation: number;
  elevationInputFormat: number;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  heightMeasurementsDistanceTop: number;
  heightMeasurementsDistanceTopInputFormat: number;
  heightMeasurementsAngleTop: number;
  heightMeasurementsAngleTopInputFormat: number;
  heightMeasurementsDistanceBottom: number;
  heightMeasurementsDistanceBottomInputFormat: number;
  heightMeasurementsAngleBottom: number;
  heightMeasurementsAngleBottomInputFormat: number;
  heightMeasurementsVerticalOffset: number;
  heightMeasurementsVerticalOffsetInputFormat: number;
  heightMeasurementType: string;
  laserBrand: string;
  clinometerBrand: string;
  heightComments: string;
  girth: number;
  girthInputFormat: number;
  girthMeasurementHeight: number;
  girthMeasurementHeightInputFormat: number;
  girthRootCollarHeight: number;
  girthRootCollarHeightInputFormat: number;
  girthComments: string;
  crownSpread: number;
  crownSpreadInputFormat: number;
  maximumLimbLength: number;
  maximumLimbLengthInputFormat: number;
  crownSpreadMeasurementMethod: string;
  baseCrownHeight: number;
  baseCrownHeightInputFormat: number;
  crownVolume: number;
  crownVolumeInputFormat: number;
  crownVolumeCalculationMethod: string;
  crownComments: string;
  trunkVolume: number;
  trunkVolumeInputFormat: number;
  trunkVolumeCalculationMethod: string;
  trunkComments: string;
  formType: number;
  numberOfTrunks: number | null;
  treeFormComments: string;
  terrainType: number;
  terrainShapeIndex: number | null;
  landformIndex: number | null;
  terrainComments: string;
  combinedGirthNumberOfTrunks: number | null;
}

/** `import_trunks` row (legacy `Imports.Trunks`) -- per-trunk measurements of a multi-trunk import tree. Never read by `Measurement.Create`; carried here for fidelity only. */
export interface ImportTrunkRow {
  id: number;
  created: string;
  creatorUserId: number | null;
  treeId: number;
  girth: number;
  girthInputFormat: number;
  girthMeasurementHeight: number;
  girthMeasurementHeightInputFormat: number;
  height: number;
  heightInputFormat: number;
  heightMeasurementsDistanceTop: number;
  heightMeasurementsDistanceTopInputFormat: number;
  heightMeasurementsAngleTop: number;
  heightMeasurementsAngleTopInputFormat: number;
  heightMeasurementsDistanceBottom: number;
  heightMeasurementsDistanceBottomInputFormat: number;
  heightMeasurementsAngleBottom: number;
  heightMeasurementsAngleBottomInputFormat: number;
  heightMeasurementsVerticalOffset: number;
  heightMeasurementsVerticalOffsetInputFormat: number;
  includeHeightDistanceAndAngleMeasurements: boolean;
  trunkComments: string;
}

/** A `photo_references` row scoped to an import site/tree (`type` 2 `ImportSite` or 3 `ImportTree`). */
export interface ImportPhotoInput {
  photoId: number;
  caption: string | null;
}

// ---------------------------------------------------------------------------
// buildSiteGraph inputs -- the assembled (already-joined) shape the
// orchestrator hands to graph.ts, layering photos onto the row mirrors
// above and asserting the finish-time-only NOT NULL invariants (trip date,
// site state).
// ---------------------------------------------------------------------------

/** The trip context `buildSiteGraph` needs, already past the `Import()` validation gate. */
export interface ImportTripContext {
  id: number;
  /** `trip.Date.Value` -- non-null because `Trip.Date` is `[NotNull]` (Required tag), asserted via `AssertIsValid(Required)` before `Import()`/`Reimport()` (`ImportRepository.cs:22,33`). */
  date: string;
  /** `trip.Website` -> `SiteVisit.TripReportUrl` (`SiteVisit.cs:54`). */
  website: string;
  /** `trip.Measurers`, copied (not deduped) into every visit/measurement this trip produces. */
  measurers: NameInput[];
}

/** `Imports.Site` + its photo references, assembled for `buildSiteGraph`. */
export interface ImportSiteInput {
  id: number;
  name: string;
  /** Non-null by the same finish-time validation gate as `ImportTripContext.date` (schema.ts note 1: the DB column is nullable, but `Imports.Site.State` is `[NotNull]` Required-tagged). */
  stateId: number;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  coordinates: CoordinatesInput;
  comments: string;
  photos: ImportPhotoInput[];
}

/** `Imports.TreeBase` (either subtype) + its photo references, assembled for `buildSiteGraph`. Only the fields `Measurement.Create` reads (doc 01 §10 step 1) are modeled -- see graph.ts header comment for the full accounting of unused `ImportTreeRow` columns. */
export interface ImportTreeInput {
  id: number;
  commonName: string;
  scientificName: string;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  coordinates: CoordinatesInput;
  elevation: number;
  elevationInputFormat: number;
  generalComments: string;
  photos: ImportPhotoInput[];
}

/**
 * Other sites in the same trip, reduced to exactly the data
 * `Trip.CalculateCoordinates()` (`TMD.Model/Imports/Trip.cs:80-85`) needs:
 * each site's own coordinates plus its trees' own coordinates (both
 * evaluated with `ignoreContainingTrip`/`ignoreContainingSite = true`, i.e.
 * never recursing back through trip/site fallbacks). Optional: only
 * consulted when the site being built has neither its own coordinates nor
 * any tree with its own coordinates (the rare last-resort tier). Including
 * the site currently being built in this list is harmless (see graph.ts).
 */
export interface TripSiteCoordinatesInput {
  coordinates: CoordinatesInput;
  treeCoordinates: CoordinatesInput[];
}

// ---------------------------------------------------------------------------
// Domain-graph output (buildSiteGraph's return value).
// ---------------------------------------------------------------------------

/** A photo reference attached at some level of the merged domain (`Photos.References` row shape, minus its owning FK -- that's implied by nesting). */
export interface PhotoReferenceGraph {
  type: PhotoReferenceTypeCode;
  photoId: number;
  caption: string | null;
}

/**
 * The per-measurement numbers `Measurement.RecalculateProperties` computes
 * (`TMD.Model/Trees/Measurement.cs:122-131`): Diameter, ENTSPTS,
 * ConicalVolume, ENTSPTS2, ChampionPoints, AbbreviatedChampionPoints.
 * Filled in by `web/lib/merge/headline.ts` (`applyTreeHeadline`), which
 * wraps `derived.ts`'s `calculateDerivedValues` and flattens its
 * `{feet,inputFormat}`/`{cubicFeet,inputFormat}` value-object shapes into
 * the flat column-pair shape `tree_measurements` actually stores (this is
 * the field-shape fix from the original placeholder: `diameter`/
 * `conicalVolume` are never null -- `Distance.Null()`/`Volume.Null()` are
 * themselves valid, always-present, zero-valued+Unspecified results, per
 * derived.ts's `calculateDiameterFeet`/`calculateConicalVolume`).
 * `buildSiteGraph` always sets this to `null`; the orchestrator
 * (`engine.ts`) fills it in via `headline.ts` before persisting.
 */
export interface MeasurementDerivedNumbers {
  diameter: number;
  diameterInputFormat: number;
  entspts: number | null;
  conicalVolume: number;
  conicalVolumeInputFormat: number;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
}

/** One `Trees.Measurements` row produced by `Measurement.Create` (`Measurement.cs:138-160`). */
export interface MeasurementGraph {
  /** Traceability back to the `import_trees` row this measurement was built from (not a legacy field). */
  sourceImportTreeId: number;
  measured: string;
  commonName: string;
  scientificName: string;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  elevation: number;
  elevationInputFormat: number;
  generalComments: string;
  measurers: NameInput[];
  /** Type 7 `TreeMeasurement`, re-typed from the import tree's type-3 `ImportTree` photos. */
  photos: PhotoReferenceGraph[];
  /** INTEGRATION POINT (headline.ts, wrapping derived.ts) -- see `MeasurementDerivedNumbers`. */
  derivedNumbers: MeasurementDerivedNumbers | null;
}

/**
 * `Tree.RecalculateProperties`'s headline copy-down
 * (`TMD.Model/Trees/Tree.cs:53-78`): LastMeasured/CommonName/ScientificName/
 * Height/HeightMeasurementMethod/Girth/CrownSpread/Coordinates/
 * CalculatedCoordinates/Elevation/Diameter/ENTSPTS/ConicalVolume/ENTSPTS2/
 * ChampionPoints/AbbreviatedChampionPoints/Photos (type 6 `Tree`, re-typed
 * from the last measurement's type-7 photos)/Measurers (deduped across all
 * measurements)/MeasurementCount, all sourced from the measurement with the
 * greatest `Measured` date (`Tree.LastMeasurement`, `Tree.cs:40`: `orderby
 * m.Measured select m).Last()` -- ties broken by underlying list/enumeration
 * order, i.e. NOT re-sorted by Id). Filled in by `web/lib/merge/headline.ts`
 * (`applyTreeHeadline`). `buildSiteGraph` always sets this to `null`.
 * `diameter`/`conicalVolume` gained their `*InputFormat` siblings and lost
 * their spurious `| null` (see `MeasurementDerivedNumbers`'s comment for
 * why) relative to the original placeholder shape.
 */
export interface TreeHeadlineFields {
  lastMeasured: string;
  commonName: string;
  scientificName: string;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  elevation: number;
  elevationInputFormat: number;
  diameter: number;
  diameterInputFormat: number;
  entspts: number | null;
  conicalVolume: number;
  conicalVolumeInputFormat: number;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
  photos: PhotoReferenceGraph[];
  measurers: NameInput[];
  measurementCount: number;
}

/** One `Trees.Trees` row (`Tree.Create`, `Tree.cs:125-136`): exactly one measurement at build time. */
export interface TreeGraph {
  /** Traceability back to the `import_trees` row (not a legacy field). */
  sourceImportTreeId: number;
  measurements: MeasurementGraph[];
  /** INTEGRATION POINT (headline.ts, wrapping derived.ts) -- see `TreeHeadlineFields`. */
  headline: TreeHeadlineFields | null;
}

/** One `Sites.SiteVisits` row (`SiteVisit.Create`, `SiteVisit.cs:35-58`). */
export interface SiteVisitGraph {
  visited: string;
  name: string;
  stateId: number;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  comments: string;
  /** Copy of `trip.Measurers`, not deduped (`SiteVisit.cs:53`). */
  visitors: NameInput[];
  tripReportUrl: string;
  /** Type 5 `SiteVisit`, re-typed from the import site's type-2 `ImportSite` photos. */
  photos: PhotoReferenceGraph[];
}

/**
 * `Site.RecalculateProperties` (`TMD.Model/Sites/Site.cs:59-73`):
 * OwnershipType/Coordinates/CalculatedCoordinates/OwnershipContactInfo/
 * MakeOwnershipContactInfoPublic all copied from `LastVisit` (`Site.cs:
 * 39-43`: `orderby visit.Visited select visit).Last()` -- same tie-break
 * caveat as `Tree.LastMeasurement`), Photos (type 4 `Site`, re-typed from
 * the last visit's type-5 photos), VisitCount (`Visits.Count`), Visitors
 * (deduped across ALL visits -- `Visits.SelectMany(v => v.Visitors).
 * Distinct()`, equality key documented on `nameEquals` in predicates.ts).
 * Filled in by `web/lib/merge/headline.ts` (`applySiteHeadline`).
 * `buildSiteGraph` always sets this to `null`.
 */
export interface SiteHeadlineFields {
  ownershipType: string;
  coordinates: CoordinatesInput;
  calculatedCoordinates: CoordinatesInput;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  photos: PhotoReferenceGraph[];
  visitCount: number;
  visitors: NameInput[];
}

/** One `Sites.Sites` row (`Site.Create`, `Site.cs:144-163`): exactly one visit at build time. */
export interface SiteGraph {
  /** Traceability back to the `import_sites` row (not a legacy field). */
  sourceImportSiteId: number;
  name: string;
  stateId: number;
  county: string;
  visits: SiteVisitGraph[];
  trees: TreeGraph[];
  /** INTEGRATION POINT (headline.ts, wrapping derived.ts) -- see `SiteHeadlineFields`. */
  headline: SiteHeadlineFields | null;
}
