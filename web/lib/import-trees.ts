/**
 * Pure Trees-step logic for the import wizard -- task P3-05 (doc 05 §P3-05,
 * doc 01 §3 enum tables, doc 01 §10). No DB access; db/queries/import-trees.sql.ts
 * calls into this module for defaults/derivation, and
 * app/import/[tripId]/trees/actions.ts calls it directly to validate a
 * submission before persisting -- same split as lib/import-wizard.ts (Trip
 * step) and the same file-ownership boundary (this task owns Trees only).
 *
 * ---------------------------------------------------------------------------
 * Finding worth recording up front (drives every design choice below): the
 * REAL, reachable legacy wizard UI for the Trees step is dramatically
 * smaller than the domain model (`TMD.Model/Imports/TreeBase.cs` +
 * `SingleTrunkTree.cs` + `MultiTrunkTree.cs` + `Trunk.cs`) supports:
 *
 *   - `ImportController.AddTree` (`ImportController.cs:275-291`) calls
 *     `site.AddSingleTrunkTree()` UNCONDITIONALLY -- there is no code path
 *     from any controller action to `Site.AddMultiTrunkTree()`
 *     (`Site.cs:121-126`, confirmed zero call sites outside TMD.Model itself
 *     via full-repo grep). Every tree the production wizard can create is
 *     Type=1 (SingleTrunkTree).
 *   - `TMD/Models/Import/ImportTreeModel.cs` (the wizard's own view model)
 *     exposes only: CommonName, ScientificName, Coordinates, Height (+
 *     HeightMeasurementMethod), Girth, CrownSpread, GeneralComments,
 *     Elevation, Photos. None of Status/HealthStatus/AgeClass/AgeType/Age/
 *     TerrainType/TerrainShapeIndex/LandformIndex/FormType/NumberOfTrunks/
 *     Trunks/GirthMeasurementHeight/GirthRootCollarHeight/
 *     MaximumLimbLength/BaseCrownHeight/CrownVolume/TrunkVolume/
 *     LaserBrand/ClinometerBrand/HeightMeasurements/TreeName/TreeNumber
 *     appear anywhere in `TMD/Models/Import` or `TMD/Views/Import` (full
 *     grep, confirmed).
 *   - `TMD/Views/Import/EditorTemplates/ImportTreeModel.cshtml`'s
 *     "Simple"/"Detailed" edit-mode branches render the IDENTICAL field
 *     list -- "Detailed edit" buys nothing. Worse: `ImportModelAction
 *     .DetailedEdit` (`ImportInnerActionModel.cs:10`) has NO case in
 *     `ImportController.Trees(...)`'s POST dispatcher
 *     (`ImportController.cs:332-363` -- only SaveUnlessOptionalErrors/
 *     SaveIgnoringOptionalErrors/Edit/Add/Remove are handled), so clicking
 *     "Detailed edit" in production throws an uncaught `NotImplementedException`.
 *     It is dead, broken functionality, not a real second mode -- not
 *     reproduced (ground rules §3's precedent for not replicating a path
 *     that only crashes, e.g. the cm-parsing bug in lib/units/parse.ts).
 *   - `Trunk.Create`/`AddTrunkMeasurement`/`RemoveTrunkMeasurement`
 *     (`MultiTrunkTree.cs:79-89`) are equally unreferenced outside
 *     TMD.Model -- there has never been a trunk sub-form in the reachable
 *     production UI.
 *
 * Despite that, this task's brief explicitly asks for single-/multi-trunk
 * creation paths, a trunk sub-form with add/remove, `CombinedGirthNumberOfTrunks`,
 * and Status/AgeClass/AgeType/TerrainType/FormType dropdowns with doc 01 §3's
 * exact codes -- i.e. the FULL domain-model surface, not the trimmed (and
 * partly broken) legacy HTML. This module and its callers therefore
 * deliberately build the fuller, domain-complete editor the schema and
 * `TreeBase`/`SingleTrunkTree`/`MultiTrunkTree`/`Trunk` validation rules
 * already support, rather than literally re-rendering the incomplete legacy
 * markup -- every rule ported below is transcribed from the real domain
 * model (cited per-field), not invented. Fields the legacy UI never exposed
 * AND this task doesn't name explicitly (TreeName, TreeNumber, HealthStatus,
 * LaserBrand, ClinometerBrand, HeightMeasurements sub-fields,
 * GirthMeasurementHeight/GirthRootCollarHeight (tree-level),
 * MaximumLimbLength, BaseCrownHeight, CrownVolume/TrunkVolume (tree-level)
 * and their *CalculationMethod strings, all free-text *Comments columns
 * besides GeneralComments, TerrainShapeIndex/LandformIndex, MakeCoordinatesPublic)
 * are left at their `Create()` defaults on insert and untouched on update --
 * still schema-valid, just not user-editable through this step, matching the
 * legacy reachable surface for exactly those fields.
 * ---------------------------------------------------------------------------
 */
import { fround } from "./units/float32";
import {
  DistanceFormat,
  ElevationFormat,
  parseDistance,
  parseElevation,
  type ParsedDistance,
  type ParsedElevation,
} from "./units/parse";
import { CoordinatesFormat, parseCoordinates, type ParsedCoordinates } from "./units/parse-coordinates";
import { planarDistanceMinutes } from "./geo/coordinates";
import { legacyTitleCase } from "./account-flows";

// ---------------------------------------------------------------------------
// Enum integer encodings -- doc 01 §3 + `TMD.Model/Imports/TreeBase.cs:13-70`
// (TreeHeightMeasurementMethod, TreeAgeClass, TreeAgeType, TreeStatus,
// TreeTerrainType, TreeFormType). Persisted as smallint -- codes are load
// bearing, never renumber.
// ---------------------------------------------------------------------------

/** `Imports.Trees.Type` (doc 01 §2/§3): 1 SingleTrunkTree, 2 MultiTrunkTree. */
export enum ImportTreeType {
  SingleTrunk = 1,
  MultiTrunk = 2,
}

/** `TreeHeightMeasurementMethod` (TreeBase.cs:13-20). */
export enum TreeHeightMeasurementMethod {
  NotSpecified = 0,
  ClinometerLaserRangefinderSine = 1,
  TreeClimbWithTapeDrop = 2,
  LongMeasuringPole = 3,
  FormalTransitTotalStationSurvey = 4,
}

export const HEIGHT_MEASUREMENT_METHOD_OPTIONS: { value: TreeHeightMeasurementMethod; label: string }[] = [
  { value: TreeHeightMeasurementMethod.NotSpecified, label: "(not specified)" },
  { value: TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine, label: "Clinometer/laser rangefinder/sine" },
  { value: TreeHeightMeasurementMethod.TreeClimbWithTapeDrop, label: "Tree climb with tape drop" },
  { value: TreeHeightMeasurementMethod.LongMeasuringPole, label: "Long measuring pole" },
  { value: TreeHeightMeasurementMethod.FormalTransitTotalStationSurvey, label: "Formal transit/total station survey" },
];

/** `TreeAgeClass` (TreeBase.cs:22-30). */
export enum TreeAgeClass {
  NotSpecified = 0,
  Young = 1,
  Mature = 2,
  LateMature = 3,
  Old = 4,
  VeryOld = 5,
}

export const AGE_CLASS_OPTIONS: { value: TreeAgeClass; label: string }[] = [
  { value: TreeAgeClass.NotSpecified, label: "(not specified)" },
  { value: TreeAgeClass.Young, label: "Young" },
  { value: TreeAgeClass.Mature, label: "Mature" },
  { value: TreeAgeClass.LateMature, label: "Late mature" },
  { value: TreeAgeClass.Old, label: "Old" },
  { value: TreeAgeClass.VeryOld, label: "Very old" },
];

/** `TreeAgeType` (TreeBase.cs:32-38). */
export enum TreeAgeType {
  NotSpecified = 0,
  Estimate = 1,
  RingCount = 2,
  XD = 3,
}

export const AGE_TYPE_OPTIONS: { value: TreeAgeType; label: string }[] = [
  { value: TreeAgeType.NotSpecified, label: "(not specified)" },
  { value: TreeAgeType.Estimate, label: "Estimate" },
  { value: TreeAgeType.RingCount, label: "Ring count" },
  { value: TreeAgeType.XD, label: "XD" },
];

/** `TreeStatus` (TreeBase.cs:40-49). */
export enum TreeStatus {
  NotSpecified = 0,
  Native = 1,
  NativePlanted = 2,
  ExoticPlanted = 3,
  ExoticNaturalizing = 4,
  IntroducedPlanted = 5,
  IntroducedNaturalized = 6,
}

export const STATUS_OPTIONS: { value: TreeStatus; label: string }[] = [
  { value: TreeStatus.NotSpecified, label: "(not specified)" },
  { value: TreeStatus.Native, label: "Native" },
  { value: TreeStatus.NativePlanted, label: "Native planted" },
  { value: TreeStatus.ExoticPlanted, label: "Exotic planted" },
  { value: TreeStatus.ExoticNaturalizing, label: "Exotic naturalizing" },
  { value: TreeStatus.IntroducedPlanted, label: "Introduced planted" },
  { value: TreeStatus.IntroducedNaturalized, label: "Introduced naturalized" },
];

/** `TreeTerrainType` (TreeBase.cs:51-59). */
export enum TreeTerrainType {
  NotSpecified = 0,
  HillTop = 1,
  SideSlope = 2,
  Valley = 3,
  FloodPlain = 4,
  Swampy = 5,
}

export const TERRAIN_OPTIONS: { value: TreeTerrainType; label: string }[] = [
  { value: TreeTerrainType.NotSpecified, label: "(not specified)" },
  { value: TreeTerrainType.HillTop, label: "Hill top" },
  { value: TreeTerrainType.SideSlope, label: "Side slope" },
  { value: TreeTerrainType.Valley, label: "Valley" },
  { value: TreeTerrainType.FloodPlain, label: "Flood plain" },
  { value: TreeTerrainType.Swampy, label: "Swampy" },
];

/** `TreeFormType` (TreeBase.cs:61-70). Single(1) is fixed by SingleTrunkTree
 * and forbidden on MultiTrunkTree (`NotEqualsAttribute(Single)`,
 * MultiTrunkTree.cs:47) -- never offered as a user-selectable option. */
export enum TreeFormType {
  NotSpecified = 0,
  Single = 1,
  Multi = 2,
  Fusion = 3,
  Coppice = 4,
  Colony = 5,
  Vine = 6,
}

/** Options for a MULTI-TRUNK tree's form-type dropdown -- excludes Single. */
export const MULTI_TRUNK_FORM_OPTIONS: { value: TreeFormType; label: string }[] = [
  { value: TreeFormType.NotSpecified, label: "(not specified)" },
  { value: TreeFormType.Multi, label: "Multi" },
  { value: TreeFormType.Fusion, label: "Fusion" },
  { value: TreeFormType.Coppice, label: "Coppice" },
  { value: TreeFormType.Colony, label: "Colony" },
  { value: TreeFormType.Vine, label: "Vine" },
];

// ---------------------------------------------------------------------------
// String normalization (TreeBase.cs property setters)
// ---------------------------------------------------------------------------

/** `TreeBase.CommonName` setter: `OrEmptyAndTrimToTitleCase()` (TreeBase.cs:108). */
export function normalizeCommonName(raw: string): string {
  return legacyTitleCase(raw ?? "");
}

/** `TreeBase.ScientificName` setter: `OrEmptyAndTrimToSentenceCase()`
 * (TreeBase.cs:116) -- first letter upper, rest lower
 * (`StringExtensions.ToSentenceCase`, StringExtensions.cs:15-22). */
export function normalizeScientificName(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (trimmed.length === 0) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/** `TreeBase.GeneralComments`/`Trunk.TrunkComments` setters: `OrEmptyAndTrim()`
 * (TreeBase.cs:158, Trunk.cs:36) -- trimmed, NOT case-converted. */
export function normalizeCommentsField(raw: string): string {
  return (raw ?? "").trim();
}

// ---------------------------------------------------------------------------
// Multi-trunk NumberOfTrunks derivation (MultiTrunkTree.cs:27-45)
// ---------------------------------------------------------------------------

/**
 * `MultiTrunkTree.NumberOfTrunks` getter (MultiTrunkTree.cs:30-45): if no
 * explicit override was ever set AND there's more than one trunk row, it
 * auto-adopts the trunk count; if an explicit override IS set, the stored
 * value monotonically grows to `max(override, trunksCount)` (never shrinks
 * below the override, even if trunks are later removed). With no override
 * and 0-1 trunk rows, stays `null` -- silently ineligible to trip
 * `Range(2, MaxValue)` (see `validateMultiTrunkFields` below; this getter
 * has no `[NotNull]`, so a `null` result is NOT itself a validation error --
 * a legacy quirk: a "multi-trunk" tree with zero trunk rows and no explicit
 * count is not blocked from saving).
 */
export function deriveMultiTrunkNumberOfTrunks(explicitOverride: number | null, trunksCount: number): number | null {
  if (explicitOverride === null) {
    return trunksCount > 1 ? trunksCount : null;
  }
  return Math.max(explicitOverride, trunksCount);
}

// ---------------------------------------------------------------------------
// Field-level input/output shapes
// ---------------------------------------------------------------------------

export type TreeFieldName =
  | "commonName"
  | "scientificName"
  | "status"
  | "ageClass"
  | "ageType"
  | "age"
  | "height"
  | "heightMeasurementMethod"
  | "girth"
  | "combinedGirthNumberOfTrunks"
  | "crownSpread"
  | "elevation"
  | "terrainType"
  | "formType"
  | "coordinates"
  | "generalComments";

export interface TreeFieldError {
  field: TreeFieldName;
  message: string;
}

export interface TreeStepInput {
  treeType: ImportTreeType;
  commonName: string;
  scientificName: string;
  status: TreeStatus;
  ageClass: TreeAgeClass;
  ageType: TreeAgeType;
  /** "" (blank) or an integer string. */
  age: string;
  height: string;
  heightMeasurementMethod: TreeHeightMeasurementMethod;
  /** Girth (single-trunk) / Combined girth (multi-trunk -- `CombinedGirth`
   * is a plain alias for the same `Girth` property, MultiTrunkTree.cs:58-62). */
  girth: string;
  /** Multi-trunk only; "" (blank) or an integer string. */
  combinedGirthNumberOfTrunks: string;
  crownSpread: string;
  elevation: string;
  terrainType: TreeTerrainType;
  /** Multi-trunk only (single-trunk's FormType is hardcoded Single, not
   * user-selectable -- SingleTrunkTree.cs:13-17). */
  formType: TreeFormType;
  /** "" or "lat, lng" text -- see lib/units/parse-coordinates.ts. */
  coordinates: string;
  generalComments: string;
}

export interface NormalizedTreeStep {
  treeType: ImportTreeType;
  commonName: string;
  scientificName: string;
  status: TreeStatus;
  ageClass: TreeAgeClass;
  ageType: TreeAgeType;
  age: number | null;
  height: ParsedDistance;
  heightMeasurementMethod: TreeHeightMeasurementMethod;
  girth: ParsedDistance;
  combinedGirthNumberOfTrunks: number | null;
  crownSpread: ParsedDistance;
  elevation: ParsedElevation;
  terrainType: TreeTerrainType;
  /** Single-trunk always TreeFormType.Single (SingleTrunkTree.cs:13-17). */
  formType: TreeFormType;
  coordinates: ParsedCoordinates;
  generalComments: string;
  /** `MultiTrunkTree.NumberOfTrunks` (see `deriveMultiTrunkNumberOfTrunks`) --
   * always 1 for single-trunk (`SingleTrunkTree.NumberOfTrunks`, fixed getter,
   * SingleTrunkTree.cs:19-23). */
  numberOfTrunks: number | null;
}

/** Optional context for the coordinates-vs-site-distance Optional-tag check
 * (`TreeBase.OptionalValidate`, TreeBase.cs:134-149, first clause only --
 * the second clause, comparing against the STATE's bounding box, is out of
 * this module's scope: it needs `Locations.States` bounding-box columns this
 * task does not own a query for). `siteCoordinates` should be omitted/undefined
 * when the site's own coordinates are unspecified (mirrors
 * `Site.Coordinates.IsSpecified` gating the legacy check). */
export interface TreeOptionalContext {
  siteCoordinates?: { totalDegreesLat: number; totalDegreesLng: number };
}

/**
 * Splits validation into Required (blocks every submit) vs Optional (blocks
 * only unless the caller passes `ignoreOptional: true`, i.e. the "Save,
 * ignoring optional errors" / "Continue, ignoring optional errors" button)
 * -- mirrors `ImportController.SaveTree`/`SaveTrees`'s two-phase
 * `ValidateMappedModel(..., ValidationTag.Required)` then
 * `ValidateMappedModel(..., ValidationTag.Optional)` (ImportController.cs:245-256,
 * 314-322), same pattern as the Trip step doc's "required-on-finish vs
 * allowed-while-draft" note but at the tag level Trees actually uses (Trip.cs
 * has no Optional-tagged attributes; TreeBase does).
 */
export function buildTreeStep(
  input: TreeStepInput,
  trunksCount: number,
  optional: TreeOptionalContext = {},
): {
  normalized: NormalizedTreeStep;
  requiredErrors: TreeFieldError[];
  optionalErrors: TreeFieldError[];
} {
  const requiredErrors: TreeFieldError[] = [];
  const optionalErrors: TreeFieldError[] = [];

  const commonName = normalizeCommonName(input.commonName);
  if (commonName === "") {
    requiredErrors.push({ field: "commonName", message: "Common name must be specified." }); // TreeBase.cs:103
  } else if (commonName.length > 100) {
    requiredErrors.push({ field: "commonName", message: "Common name must not exceed 100 characters." }); // TreeBase.cs:104
  }

  const scientificName = normalizeScientificName(input.scientificName);
  if (scientificName.length > 100) {
    requiredErrors.push({ field: "scientificName", message: "Scientific name must not exceed 100 characters." }); // TreeBase.cs:112
  }

  const height = parseDistance(input.height);
  if (height.inputFormat === DistanceFormat.Invalid) {
    // Distance.cs:30 -- shared message across every Distance-typed field.
    requiredErrors.push({
      field: "height",
      message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.",
    });
  }

  const girth = parseDistance(input.girth);
  if (girth.inputFormat === DistanceFormat.Invalid) {
    requiredErrors.push({
      field: "girth",
      message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.",
    });
  }

  const crownSpread = parseDistance(input.crownSpread);
  if (crownSpread.inputFormat === DistanceFormat.Invalid) {
    requiredErrors.push({
      field: "crownSpread",
      message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.",
    });
  }

  const elevation = parseElevation(input.elevation);
  if (elevation.inputFormat === ElevationFormat.Invalid) {
    requiredErrors.push({
      field: "elevation",
      message: "Elevation must be in fffff ft or mmmmm m format.", // Elevation.cs:27
    });
  } else if (elevation.inputFormat !== ElevationFormat.Unspecified && (elevation.feet < 0 || elevation.feet > 17000)) {
    requiredErrors.push({
      field: "elevation",
      message: "Elevation must fall within sea level to 17000 feet.", // Elevation.cs:24
    });
  }

  const coordinates = parseCoordinates(input.coordinates);
  if (coordinates.inputFormat === CoordinatesFormat.Invalid) {
    if (coordinates.latitude.inputFormat === CoordinatesFormat.Invalid) {
      requiredErrors.push({
        field: "coordinates",
        message: "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.", // Latitude.cs:19
      });
    }
    if (coordinates.longitude.inputFormat === CoordinatesFormat.Invalid) {
      requiredErrors.push({
        field: "coordinates",
        message: "Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.", // Longitude.cs:19
      });
    }
  }
  if (coordinates.latitude.inputFormat !== CoordinatesFormat.Invalid && Math.abs(coordinates.latitude.totalDegrees) > 90) {
    requiredErrors.push({ field: "coordinates", message: "Latitude must be in the range of -90 to +90 degrees." });
  }
  if (
    coordinates.longitude.inputFormat !== CoordinatesFormat.Invalid &&
    Math.abs(coordinates.longitude.totalDegrees) > 180
  ) {
    requiredErrors.push({ field: "coordinates", message: "Longitude must be in the range of -180 to +180 degrees." });
  }

  const generalComments = normalizeCommentsField(input.generalComments);
  if (generalComments.length > 1000) {
    requiredErrors.push({ field: "generalComments", message: "General comments must not exceed 1,000 characters." }); // TreeBase.cs:154
  }

  const age = input.age.trim() === "" ? null : Number(input.age.trim());
  if (age !== null && (!Number.isFinite(age) || !Number.isInteger(age) || age < 0)) {
    requiredErrors.push({ field: "age", message: "Age must be non-negative." }); // TreeBase.cs:273
  }

  const isMulti = input.treeType === ImportTreeType.MultiTrunk;

  let combinedGirthNumberOfTrunks: number | null = null;
  if (isMulti) {
    const raw = input.combinedGirthNumberOfTrunks.trim();
    combinedGirthNumberOfTrunks = raw === "" ? null : Number(raw);
    if (
      combinedGirthNumberOfTrunks !== null &&
      (!Number.isFinite(combinedGirthNumberOfTrunks) || !Number.isInteger(combinedGirthNumberOfTrunks) || combinedGirthNumberOfTrunks < 1)
    ) {
      requiredErrors.push({
        field: "combinedGirthNumberOfTrunks",
        message: "Number of trunks in combined girth must be positive.", // MultiTrunkTree.cs:64
      });
    }
  }

  const formType = isMulti ? input.formType : TreeFormType.Single;
  if (isMulti && formType === TreeFormType.Single) {
    requiredErrors.push({ field: "formType", message: "Form type must not be single." }); // MultiTrunkTree.cs:47
  }

  const numberOfTrunks = isMulti ? deriveMultiTrunkNumberOfTrunks(null, trunksCount) : 1;
  if (isMulti && numberOfTrunks !== null && numberOfTrunks < 2) {
    requiredErrors.push({ field: "combinedGirthNumberOfTrunks", message: "Number of trunks must be greater than one." }); // MultiTrunkTree.cs:29
  }

  // TreeBase.OptionalValidate, first clause only (TreeBase.cs:136-141): >1
  // arc-minute from the site's own coordinates, only checked when BOTH the
  // tree's and the site's coordinates are specified.
  if (coordinates.isSpecified && optional.siteCoordinates) {
    const distanceMinutes = planarDistanceMinutes(
      coordinates.latitude.totalDegrees,
      coordinates.longitude.totalDegrees,
      optional.siteCoordinates.totalDegreesLat,
      optional.siteCoordinates.totalDegreesLng,
    );
    if (distanceMinutes > 1) {
      optionalErrors.push({
        field: "coordinates",
        message: "(Optional) Coordinates are more than one mile from site.  You might want to double check them.",
      });
    }
  }

  return {
    normalized: {
      treeType: input.treeType,
      commonName,
      scientificName,
      status: input.status,
      ageClass: input.ageClass,
      ageType: input.ageType,
      age,
      height,
      heightMeasurementMethod: input.heightMeasurementMethod,
      girth,
      combinedGirthNumberOfTrunks,
      crownSpread,
      elevation,
      terrainType: input.terrainType,
      formType,
      coordinates,
      generalComments,
      numberOfTrunks,
    },
    requiredErrors,
    optionalErrors,
  };
}

// ---------------------------------------------------------------------------
// Trunk sub-form (Trunk.cs)
// ---------------------------------------------------------------------------

export type TrunkFieldName = "girth" | "girthMeasurementHeight" | "height" | "trunkComments";

export interface TrunkFieldError {
  field: TrunkFieldName;
  message: string;
}

export interface TrunkInput {
  girth: string;
  girthMeasurementHeight: string;
  height: string;
  trunkComments: string;
}

export interface NormalizedTrunk {
  girth: ParsedDistance;
  girthMeasurementHeight: ParsedDistance;
  height: ParsedDistance;
  trunkComments: string;
}

/**
 * `Trunk.RequiredValidate` (Trunk.cs:20-27) + the `[Valid]` nested
 * Girth/GirthMeasurementHeight/Height nested validation + `TrunkComments`'
 * `[Length(1000)]` -- all tagged Required, i.e. Trunk has no Optional-tag
 * checks at all (no `[ContextMethod(..., Tags = ValidationTag.Optional)]`
 * on the class).
 */
export function buildTrunkInput(input: TrunkInput): { normalized: NormalizedTrunk; errors: TrunkFieldError[] } {
  const errors: TrunkFieldError[] = [];

  const girth = parseDistance(input.girth);
  if (girth.inputFormat === DistanceFormat.Invalid) {
    errors.push({ field: "girth", message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format." });
  }

  const girthMeasurementHeight = parseDistance(input.girthMeasurementHeight);
  if (girthMeasurementHeight.inputFormat === DistanceFormat.Invalid) {
    errors.push({
      field: "girthMeasurementHeight",
      message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.",
    });
  }

  const height = parseDistance(input.height);
  if (height.inputFormat === DistanceFormat.Invalid) {
    errors.push({ field: "height", message: "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format." });
  }

  // Trunk.cs:22-26: at least one of Height/Girth must be specified. Legacy
  // also checks `HeightMeasurements.IsSpecified` (a clinometer sub-form this
  // task's UI doesn't expose, always Unspecified here) -- omitted from the OR
  // since it can never be true through this port's inputs.
  const heightSpecified = height.inputFormat !== DistanceFormat.Unspecified && height.inputFormat !== DistanceFormat.Invalid;
  const girthSpecified = girth.inputFormat !== DistanceFormat.Unspecified && girth.inputFormat !== DistanceFormat.Invalid;
  if (!heightSpecified && !girthSpecified) {
    errors.push({ field: "girth", message: "You must specify a height or girth." });
    errors.push({ field: "height", message: "You must specify a height or girth." });
  }

  const trunkComments = normalizeCommentsField(input.trunkComments);
  if (trunkComments.length > 1000) {
    errors.push({ field: "trunkComments", message: "Trunk comments must not exceed 1,000 characters." });
  }

  return { normalized: { girth, girthMeasurementHeight, height, trunkComments }, errors };
}

// ---------------------------------------------------------------------------
// Redisplay helpers -- editable-text-field round trip when redisplaying an
// already-saved tree/trunk (mirrors legacy binding a Distance/Elevation
// value object's `.ToString()` back into its editor textbox). Feet is the
// storage unit for Distance/Elevation; `Unspecified`/`Invalid` -> blank so a
// never-entered field doesn't show a fabricated "0.0'".
// ---------------------------------------------------------------------------

export function distanceToEditableText(feet: number, inputFormat: DistanceFormat): string {
  if (inputFormat === DistanceFormat.Unspecified || inputFormat === DistanceFormat.Invalid) return "";
  return `${(Math.round(fround(feet) * 100) / 100).toString()}'`;
}

export function elevationToEditableText(feet: number, inputFormat: ElevationFormat): string {
  if (inputFormat === ElevationFormat.Unspecified || inputFormat === ElevationFormat.Invalid) return "";
  return `${(Math.round(fround(feet) * 10) / 10).toString()} ft`;
}

export function coordinatesToEditableText(
  latTotalDegrees: number,
  latFormat: CoordinatesFormat,
  lngTotalDegrees: number,
  lngFormat: CoordinatesFormat,
): string {
  if (latFormat === CoordinatesFormat.Unspecified && lngFormat === CoordinatesFormat.Unspecified) return "";
  return `${fround(latTotalDegrees)}, ${fround(lngTotalDegrees)}`;
}
