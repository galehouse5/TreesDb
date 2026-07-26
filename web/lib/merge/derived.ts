// Legacy per-measurement derived-value + tree-headline-recalculation port.
//
// Source: TMD.Model/Trees/Measurement.cs (CalculateDiameter:42-50,
// CalculateENTSPTS:56-64, CalculateConicalVolume:70-78,
// CalculateENTSPTS2:84-92, CalculateChampionPoints:98-106,
// CalculateAbbreviatedChampionPoints:112-119, RecalculateProperties:122-131),
// TMD.Model/Trees/Tree.cs (LastMeasurement:40, CalculateCoordinates:43-46,
// CalculateCalculatedCoordinates:48-51, RecalculateProperties:53-78).
// Doc: docs/migration/05-phase3-import-photos.md §P3-01 (derived-numbers
// bullet); docs/migration/01-system-reference.md §3 (enum encodings), §5
// (metrics), §7 (float32 discipline), §10 step 4.
//
// Float32 discipline (doc 07 §6, lib/units/float32.ts): Height/Girth/
// CrownSpread are legacy `Distance` value objects whose `.Feet` is the raw
// stored float32. Every `CalculateXxx` method in Measurement.cs widens
// those float32 inputs to `double`, computes the whole formula in double
// precision, and narrows back to `float` exactly ONCE at the return -- so
// (with one documented exception below) each function here is
// `fround(<plain JS double arithmetic>)`, matching a single `(float)` cast
// in the source.
//
// ---------------------------------------------------------------------------
// DISCREPANCY FOUND (mini-parity investigation, doc 05 §P3-01 / doc 07 §11
// "production wins over code-reading"):
//
// `Distance.Inches` (Distance.cs:35) is declared `public float Inches {
// get { return 12f * Feet; } }` -- a float-typed property, which per this
// codebase's general float32 discipline (lib/units/float32.ts) should be
// frounded on its own BEFORE being widened into the double sum inside
// `CalculateChampionPoints`/`CalculateAbbreviatedChampionPoints`
// (`(double)Girth.Inches + (double)Height.Feet + ...`).
//
// Empirically, against 19 of 20 production rows pulled for this mini-parity
// check (see derived-parity.test.ts), frounding `Girth.Inches` as a separate
// float32 step produces the WRONG champion-points/abbreviated-champion-
// points value -- reproducing the stored number instead requires treating
// `girth * 12` as an unrounded double that flows straight into the
// subsequent addition, i.e. NOT narrowing to float32 before the widen. This
// matches the classic x87-era ".NET excess precision" hazard the codebase
// already documents (float32.ts's file header, discussing x87 80-bit
// extended-precision registers vs. x64 SSE2's per-operation truncation):
// apparently, for this one property-getter-then-immediately-widened
// pattern, the JIT that produced this production data did NOT truncate the
// intermediate `12f * Feet` product to float32 before folding it into the
// double sum. `calculateChampionPoints`/`calculateAbbreviatedChampionPoints`
// below therefore compute `girthFeet * 12` as a plain (unrounded) double --
// see the row-by-row justification and the one row (id 2343) that still
// disagrees, in derived-parity.test.ts.
// ---------------------------------------------------------------------------

import { fround } from "../units/float32";
import { conicalVolumeCubicFeet } from "../measurements/volume";

/** `DistanceFormat`/`VolumeFormat` (doc 01 §3): Unspecified = 1, Default = 2.
 * Duplicated locally rather than imported from
 * components/details/legacy-format.ts -- different ownership boundary; see
 * that file's header for the repo's rationale for duplicating these tiny
 * constants across boundaries instead of cross-importing. */
const INPUT_FORMAT_UNSPECIFIED = 1;
const INPUT_FORMAT_DEFAULT = 2;

/** `ISpecified.IsSpecified`: `InputFormat != Unspecified(1)`. Invalid(0)
 * still counts as "specified" (doc 01 §7). */
function isSpecified(inputFormat: number): boolean {
  return inputFormat !== INPUT_FORMAT_UNSPECIFIED;
}

/**
 * Minimal measurement-shaped input for the six per-measurement derived
 * numbers -- mirrors the `height`/`girth`/`crown_spread` (+
 * `*_input_format`) columns on `tree_measurements` (identical shape on
 * `trees`), which is exactly what Measurement.cs's `CalculateXxx` methods
 * read via `Height`/`Girth`/`CrownSpread` (`Distance` value objects ->
 * `.Feet`/`.IsSpecified`). All feet values are float32 (as stored); they are
 * defensively `fround`ed on entry to every function below in case a caller
 * passes an un-narrowed double (matches the defensive-fround convention in
 * lib/units/format.ts).
 */
export interface DerivedValueInput {
  height: number;
  heightInputFormat: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
}

/** Shape of a stored `Distance` derived value: `{feet, inputFormat}` --
 * mirrors the `diameter`/`diameter_input_format` column pair. */
export interface DerivedDistanceValue {
  feet: number;
  inputFormat: number;
}

/** Shape of a stored `Volume` derived value: `{cubicFeet, inputFormat}` --
 * mirrors the `conical_volume`/`conical_volume_input_format` column pair. */
export interface DerivedVolumeValue {
  cubicFeet: number;
  inputFormat: number;
}

/** Bundle matching `Measurement.RecalculateProperties`'s six assignments
 * (Measurement.cs:122-131), in that order. */
export interface DerivedValues {
  diameter: DerivedDistanceValue;
  entspts: number | null;
  conicalVolume: DerivedVolumeValue;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
}

/**
 * `Measurement.CalculateDiameter` (Measurement.cs:42-50) + the
 * `Distance.Create(...)`/`Distance.Null()` wrap performed in
 * `RecalculateProperties` (Measurement.cs:124):
 *
 *   double diameter = (double)Girth.Feet / Math.PI;
 *   return (float)diameter;
 *
 * Girth unspecified -> `Distance.Null()` (feet 0, Unspecified(1)); otherwise
 * `Distance.Create(value)` (InputFormat = Default(2)).
 */
export function calculateDiameterFeet(input: DerivedValueInput): DerivedDistanceValue {
  if (!isSpecified(input.girthInputFormat)) {
    return { feet: 0, inputFormat: INPUT_FORMAT_UNSPECIFIED };
  }
  const girth = fround(input.girth);
  return { feet: fround(girth / Math.PI), inputFormat: INPUT_FORMAT_DEFAULT };
}

/**
 * `Measurement.CalculateENTSPTS` (Measurement.cs:56-64): "Height x
 * Circumference".
 *
 *   double ENTSPTS = (double)Height.Feet * (double)Girth.Feet;
 *   return (float)ENTSPTS;
 *
 * Null (matches `entspts`'s nullable column) if either Height or Girth is
 * unspecified.
 */
export function calculateEntspts(input: DerivedValueInput): number | null {
  if (!isSpecified(input.heightInputFormat) || !isSpecified(input.girthInputFormat)) {
    return null;
  }
  const height = fround(input.height);
  const girth = fround(input.girth);
  return fround(height * girth);
}

/**
 * `Measurement.CalculateConicalVolume` (Measurement.cs:70-78) +
 * `Volume.CalculateConical` (Volume.cs:185-190):
 *
 *   double radius = (double)Girth.Feet / Math.PI / 2.0;
 *   return Volume.CalculateConical(radius, Height.Feet);
 *   // Volume.CalculateConical(double radiusFeet, double heightFeet):
 *   //   double area = Math.Pow(radiusFeet, 2) * Math.PI;
 *   //   double volume = area * heightFeet / 3.0;
 *   //   return Create((float)volume);
 *
 * `radius`/`area`/`volume` are C# `double` locals throughout -- no
 * per-operation float32 rounding (see lib/measurements/volume.ts's
 * precision note, reused here verbatim via `conicalVolumeCubicFeet`).
 * Height/Girth unspecified -> `Volume.Null()` (0, Unspecified(1)).
 */
export function calculateConicalVolume(input: DerivedValueInput): DerivedVolumeValue {
  if (!isSpecified(input.heightInputFormat) || !isSpecified(input.girthInputFormat)) {
    return { cubicFeet: 0, inputFormat: INPUT_FORMAT_UNSPECIFIED };
  }
  const height = fround(input.height);
  const girth = fround(input.girth);
  const radiusFeet = girth / Math.PI / 2.0;
  return { cubicFeet: conicalVolumeCubicFeet(radiusFeet, height), inputFormat: INPUT_FORMAT_DEFAULT };
}

/**
 * `Measurement.CalculateENTSPTS2` (Measurement.cs:84-92): "(Height x
 * Circumference^2) / 100".
 *
 *   double ENTSPTS2 = ((double)Height.Feet * Math.Pow((double)Girth.Feet, 2) / 100.0);
 *   return (float)ENTSPTS2;
 */
export function calculateEntspts2(input: DerivedValueInput): number | null {
  if (!isSpecified(input.heightInputFormat) || !isSpecified(input.girthInputFormat)) {
    return null;
  }
  const height = fround(input.height);
  const girth = fround(input.girth);
  return fround((height * Math.pow(girth, 2)) / 100.0);
}

/**
 * `Measurement.CalculateChampionPoints` (Measurement.cs:98-106):
 * "Circumference(in) + Height(ft) + 1/4 Average Crown Spread(ft)".
 *
 *   double championPoints = (double)Girth.Inches + (double)Height.Feet + ((double)CrownSpread.Feet / 4.0);
 *   return (float)championPoints;
 *
 * See this file's header DISCREPANCY note: `girth * 12` ("Girth.Inches") is
 * intentionally left as an unrounded double here, NOT frounded as its own
 * float32 step, to match the production oracle.
 */
export function calculateChampionPoints(input: DerivedValueInput): number | null {
  if (
    !isSpecified(input.girthInputFormat) ||
    !isSpecified(input.heightInputFormat) ||
    !isSpecified(input.crownSpreadInputFormat)
  ) {
    return null;
  }
  const height = fround(input.height);
  const girth = fround(input.girth);
  const crownSpread = fround(input.crownSpread);
  const girthInches = girth * 12; // NOT frounded -- see file header DISCREPANCY note.
  return fround(girthInches + height + crownSpread / 4.0);
}

/**
 * `Measurement.CalculateAbbreviatedChampionPoints` (Measurement.cs:112-119):
 * "Circumference(in) + Height(ft)".
 *
 *   double championPoints = (double)Girth.Inches + (double)Height.Feet;
 *   return (float)championPoints;
 *
 * Same `Girth.Inches` note as `calculateChampionPoints` above.
 */
export function calculateAbbreviatedChampionPoints(input: DerivedValueInput): number | null {
  if (!isSpecified(input.girthInputFormat) || !isSpecified(input.heightInputFormat)) {
    return null;
  }
  const height = fround(input.height);
  const girth = fround(input.girth);
  const girthInches = girth * 12; // NOT frounded -- see file header DISCREPANCY note.
  return fround(girthInches + height);
}

/**
 * `Measurement.RecalculateProperties` (Measurement.cs:122-131): computes and
 * bundles all six derived values, in this exact order (diameter is computed
 * twice in the source -- once via `CalculateDiameter()` for the `.HasValue`
 * check, once more for the actual assignment; both calls are pure and
 * side-effect-free, so a single call here is equivalent).
 */
export function calculateDerivedValues(input: DerivedValueInput): DerivedValues {
  return {
    diameter: calculateDiameterFeet(input),
    entspts: calculateEntspts(input),
    conicalVolume: calculateConicalVolume(input),
    entspts2: calculateEntspts2(input),
    championPoints: calculateChampionPoints(input),
    abbreviatedChampionPoints: calculateAbbreviatedChampionPoints(input),
  };
}

// ---------------------------------------------------------------------------
// Tree.LastMeasurement / Tree.RecalculateProperties (Tree.cs:40, 53-78)
// ---------------------------------------------------------------------------

/** A `Name` value object (TMD.Model/ValueObjects/Name.cs): equality is exact
 * `FirstName`+`LastName` match (Name.cs:68-77) -- used for the Measurers
 * dedup below. */
export interface NameLike {
  firstName: string;
  lastName: string;
}

/**
 * Everything `Tree.RecalculateProperties` (Tree.cs:53-78) reads off a
 * measurement, either directly (headline copy from `LastMeasurement`) or
 * across all of a tree's measurements (`CalculateCoordinates`,
 * `CalculateCalculatedCoordinates`, Measurers). Mirrors the
 * `tree_measurements` columns 1:1 (same shape as `trees`).
 *
 * NOTE ON PHOTOS: `Tree.RecalculateProperties` also re-types
 * `LastMeasurement.Photos` into `TreePhotoReference`s (Tree.cs:71-72). That
 * is out of scope for this pure derived-value/headline module (no `Photo`
 * entity is modeled here) -- see doc 05 §P3-08 for the photo-reference
 * re-typing step, which is handled by the site-graph builder instead.
 */
export interface RecalculatableMeasurement extends DerivedValueInput {
  /** `Measurement.Measured` (Tree.cs:40: `orderby m.Measured`). */
  measured: string | number | Date;
  commonName: string;
  scientificName: string;
  heightMeasurementMethod: number;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  calculatedLatitude: number;
  calculatedLatitudeInputFormat: number;
  calculatedLongitude: number;
  calculatedLongitudeInputFormat: number;
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
  measurers?: readonly NameLike[];
}

/** `{latitude, latitudeInputFormat, longitude, longitudeInputFormat}` --
 * matches the `Coordinates`/`CalculatedCoordinates` column-quadruple shape
 * on `trees`. */
export interface CoordinatesValue {
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
}

function measuredTime(value: string | number | Date): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/**
 * Stable ascending sort by `measured`, matching LINQ's `orderby` (a stable
 * sort: https://learn.microsoft.com/dotnet/api/system.linq.enumerable.orderby
 * -- "this method performs a stable sort"). The explicit index tie-break
 * below is a documentation aid, not a correctness requirement: JS's
 * `Array.prototype.sort` has been spec-guaranteed stable since ES2019.
 */
function stableSortByMeasured<M extends { measured: string | number | Date }>(
  measurements: readonly M[],
): M[] {
  return measurements
    .map((m, index) => ({ m, index }))
    .sort((a, b) => {
      const diff = measuredTime(a.m.measured) - measuredTime(b.m.measured);
      return diff !== 0 ? diff : a.index - b.index;
    })
    .map((x) => x.m);
}

/**
 * `Tree.LastMeasurement` (Tree.cs:40):
 *
 *   (from m in Measurements orderby m.Measured select m).Last()
 *
 * i.e. stable-sort ascending by `Measured`, take the last element. Ties
 * (same `Measured` date) are broken by original array order -- the LAST
 * same-dated measurement in `measurements`' input order wins, NOT the
 * highest id or any other tiebreak. Throws on an empty array, matching
 * LINQ's `.Last()` throwing `InvalidOperationException` on an empty
 * sequence.
 */
export function lastMeasurementOf<M extends { measured: string | number | Date }>(
  measurements: readonly M[],
): M {
  if (measurements.length === 0) {
    throw new Error(
      "lastMeasurementOf: measurements must be non-empty (Tree.cs:40's `.Last()` throws InvalidOperationException on an empty sequence)",
    );
  }
  const sorted = stableSortByMeasured(measurements);
  return sorted[sorted.length - 1];
}

/** `Latitude`/`Longitude.IsSpecified`: `InputFormat != Unspecified(1)`
 * (Latitude.cs:28). */
function isCoordinateAxisSpecified(inputFormat: number): boolean {
  return isSpecified(inputFormat);
}

/**
 * `Coordinates.IsSpecified` (Coordinates.cs:23):
 *
 *   Latitude.IsSpecified || Longitude.IsSpecified
 *
 * NOTE: this is OR, not AND -- a measurement with only latitude (or only
 * longitude) specified still counts as "having specified coordinates" for
 * `Tree.CalculateCoordinates`'s filter. (Contrast doc 01 §9's
 * `ContainsEntityWithCoordinates`, a *different* SQL-level check that does
 * use AND -- do not conflate the two.)
 */
function isCoordinatesSpecified(latitudeInputFormat: number, longitudeInputFormat: number): boolean {
  return isCoordinateAxisSpecified(latitudeInputFormat) || isCoordinateAxisSpecified(longitudeInputFormat);
}

/**
 * `Tree.CalculateCoordinates` (Tree.cs:43-46):
 *
 *   (from m in Measurements orderby m.Measured where m.Coordinates.IsSpecified
 *    select m.Coordinates).LastOrDefault() ?? Coordinates.Null()
 *
 * i.e. stable-sort ascending by `Measured`, walk from the end, return the
 * first (= chronologically last) measurement whose Coordinates are
 * specified; `Coordinates.Null()` (0/0, both Unspecified(1)) if none.
 */
export function calculateTreeCoordinates(measurements: readonly RecalculatableMeasurement[]): CoordinatesValue {
  const sorted = stableSortByMeasured(measurements);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const m = sorted[i];
    if (isCoordinatesSpecified(m.latitudeInputFormat, m.longitudeInputFormat)) {
      return {
        latitude: m.latitude,
        latitudeInputFormat: m.latitudeInputFormat,
        longitude: m.longitude,
        longitudeInputFormat: m.longitudeInputFormat,
      };
    }
  }
  return {
    latitude: 0,
    latitudeInputFormat: INPUT_FORMAT_UNSPECIFIED,
    longitude: 0,
    longitudeInputFormat: INPUT_FORMAT_UNSPECIFIED,
  };
}

/**
 * `Tree.CalculateCalculatedCoordinates` (Tree.cs:48-51): identical shape to
 * `calculateTreeCoordinates` above but over `CalculatedCoordinates`.
 */
export function calculateTreeCalculatedCoordinates(
  measurements: readonly RecalculatableMeasurement[],
): CoordinatesValue {
  const sorted = stableSortByMeasured(measurements);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const m = sorted[i];
    if (isCoordinatesSpecified(m.calculatedLatitudeInputFormat, m.calculatedLongitudeInputFormat)) {
      return {
        latitude: m.calculatedLatitude,
        latitudeInputFormat: m.calculatedLatitudeInputFormat,
        longitude: m.calculatedLongitude,
        longitudeInputFormat: m.calculatedLongitudeInputFormat,
      };
    }
  }
  return {
    latitude: 0,
    latitudeInputFormat: INPUT_FORMAT_UNSPECIFIED,
    longitude: 0,
    longitudeInputFormat: INPUT_FORMAT_UNSPECIFIED,
  };
}

/**
 * `Tree.Measurers` dedup (Tree.cs:73-75):
 *
 *   (from measurement in Measurements from measurer in measurement.Measurers
 *    select measurer).Distinct()
 *
 * NOT date-ordered (no `orderby` in this query) -- iterates `Measurements`
 * in its own (natural/insertion) order, i.e. `measurements`' input array
 * order. `Distinct()` preserves first-occurrence order; `Name` equality is
 * exact `FirstName`+`LastName` match (Name.cs:68-77).
 */
function dedupMeasurers(measurements: readonly RecalculatableMeasurement[]): NameLike[] {
  const seen = new Set<string>();
  const result: NameLike[] = [];
  for (const m of measurements) {
    for (const measurer of m.measurers ?? []) {
      const key = `${measurer.firstName} ${measurer.lastName}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(measurer);
      }
    }
  }
  return result;
}

/** Headline values a `Tree` copies during `RecalculateProperties`
 * (Tree.cs:53-78). See `RecalculatableMeasurement`'s NOTE ON PHOTOS for what
 * is intentionally excluded. */
export interface TreeHeadlineValues {
  lastMeasured: string | number | Date;
  commonName: string;
  scientificName: string;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  calculatedLatitude: number;
  calculatedLatitudeInputFormat: number;
  calculatedLongitude: number;
  calculatedLongitudeInputFormat: number;
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
  measurers: NameLike[];
  measurementCount: number;
}

/**
 * `Tree.RecalculateProperties` (Tree.cs:53-78):
 *
 *   LastMeasured = LastMeasurement.Measured
 *   CommonName = LastMeasurement.CommonName
 *   ScientificName = LastMeasurement.ScientificName
 *   Height = LastMeasurement.Height
 *   HeightMeasurementMethod = LastMeasurement.HeightMeasurementMethod
 *   Girth = LastMeasurement.Girth
 *   CrownSpread = LastMeasurement.CrownSpread
 *   Coordinates = CalculateCoordinates()               // NOT just LastMeasurement's
 *   CalculatedCoordinates = CalculateCalculatedCoordinates()  // ditto
 *   Elevation = LastMeasurement.Elevation
 *   Diameter = LastMeasurement.Diameter
 *   ENTSPTS = LastMeasurement.ENTSPTS
 *   ConicalVolume = LastMeasurement.ConicalVolume
 *   ENTSPTS2 = LastMeasurement.ENTSPTS2
 *   ChampionPoints = LastMeasurement.ChampionPoints
 *   AbbreviatedChampionPoints = LastMeasurement.AbbreviatedChampionPoints
 *   Photos = <re-typed from LastMeasurement.Photos>     // out of scope, see above
 *   Measurers = <distinct, across ALL Measurements, insertion order>
 *   MeasurementCount = Measurements.Count
 *
 * Throws (via `lastMeasurementOf`) if `measurements` is empty.
 */
export function recalculateTreeProperties(
  measurements: readonly RecalculatableMeasurement[],
): TreeHeadlineValues {
  const last = lastMeasurementOf(measurements);
  const coordinates = calculateTreeCoordinates(measurements);
  const calculatedCoordinates = calculateTreeCalculatedCoordinates(measurements);
  const measurers = dedupMeasurers(measurements);
  return {
    lastMeasured: last.measured,
    commonName: last.commonName,
    scientificName: last.scientificName,
    height: last.height,
    heightInputFormat: last.heightInputFormat,
    heightMeasurementMethod: last.heightMeasurementMethod,
    girth: last.girth,
    girthInputFormat: last.girthInputFormat,
    crownSpread: last.crownSpread,
    crownSpreadInputFormat: last.crownSpreadInputFormat,
    latitude: coordinates.latitude,
    latitudeInputFormat: coordinates.latitudeInputFormat,
    longitude: coordinates.longitude,
    longitudeInputFormat: coordinates.longitudeInputFormat,
    calculatedLatitude: calculatedCoordinates.latitude,
    calculatedLatitudeInputFormat: calculatedCoordinates.latitudeInputFormat,
    calculatedLongitude: calculatedCoordinates.longitude,
    calculatedLongitudeInputFormat: calculatedCoordinates.longitudeInputFormat,
    elevation: last.elevation,
    elevationInputFormat: last.elevationInputFormat,
    diameter: last.diameter,
    diameterInputFormat: last.diameterInputFormat,
    entspts: last.entspts,
    conicalVolume: last.conicalVolume,
    conicalVolumeInputFormat: last.conicalVolumeInputFormat,
    entspts2: last.entspts2,
    championPoints: last.championPoints,
    abbreviatedChampionPoints: last.abbreviatedChampionPoints,
    measurers,
    measurementCount: measurements.length,
  };
}
