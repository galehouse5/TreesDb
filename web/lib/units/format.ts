// Legacy value-object display formatting port.
//
// Source: TMD.Model/ValueObjects/{Distance,Elevation,Volume,RuckerIndex,Units}.cs.
// Doc: docs/migration/01-system-reference.md §7 (formatting table + reference outputs).
//
// Every quantity is persisted as imperial float32 (feet, or cubic feet for
// volume). These functions take that raw float32 base value plus a unit
// preference and reproduce the exact .NET custom-format-string output
// (`"0.0"`, `"0.00"`, `"0.000"`), including float32-per-operation
// conversion arithmetic and half-away-from-zero midpoint rounding (doc 07
// §6). Callers are responsible for the `IsSpecified` / empty-string gate
// that legacy applies before ever calling `ToString(Units)` -- these
// functions always format a value (there is no "unspecified" input here,
// mirroring that these are pure formatters, not the value objects
// themselves).

import { f32div, f32mul, fround, roundDotNetSingle } from "./float32";

/** `TMD.Model/ValueObjects/Units.cs:5-15`. Default (0) renders identically to Feet (1). */
export enum Units {
  Default = 0,
  Feet = 1,
  Meters = 2,
  Yards = 3,
}

/** `TMD.Model/ValueObjects/Units.cs:30-38`. */
export enum UnitRenderMode {
  /** e.g. render 5' 6" as 5' 6" (same as PrefixOnly for our exposed helpers -- see distanceSubunit). */
  Default = 0,
  /** e.g. render 5' 6" as 5.5' */
  PrefixOnly = 1,
  /** e.g. render 5' 6" as 66'' */
  SubprefixOnly = 2,
}

// Conversion constants -- exact float32 literals (doc 01 §7).
export const FEET_PER_METER = fround(3.2808399); // Distance.cs:37, Elevation.cs:37
export const FEET_PER_YARD = fround(3); // Distance.cs:36, Elevation.cs:32
export const INCHES_PER_FOOT = fround(12); // Distance.cs:35
export const CM_PER_M = fround(100); // Distance.cs:38
export const CUFT_TO_CUM = fround(0.0283168466); // Volume.cs:32
export const CUFT_TO_CUYD = fround(0.037037037); // Volume.cs:37

/** `{value:0...0}` -- half-away-from-zero rounded, fixed-point, no leading-zero padding beyond the natural minimum. */
function formatFixed(value: number, decimals: number): string {
  const rounded = roundDotNetSingle(value, decimals);
  const normalized = rounded === 0 ? 0 : rounded; // avoid "-0.0" for values that round to zero
  return normalized.toFixed(decimals);
}

// --- Distance (Distance.cs:87-122) -----------------------------------------

/**
 * `Distance.ToString(Units, UnitRenderMode.Default | .PrefixOnly)`:
 * feet -> `0.0'`, meters -> `0.00 m`, yards -> `0.00 yd`.
 */
export function formatDistance(feetInput: number, units: Units): string {
  const feet = fround(feetInput);
  switch (units) {
    case Units.Meters: {
      const meters = f32div(feet, FEET_PER_METER);
      return `${formatFixed(meters, 2)} m`;
    }
    case Units.Yards: {
      const yards = f32div(feet, FEET_PER_YARD);
      return `${formatFixed(yards, 2)} yd`;
    }
    case Units.Default:
    case Units.Feet:
    default:
      return `${formatFixed(feet, 1)}'`;
  }
}

/**
 * `Distance.ToString(Units, UnitRenderMode.SubprefixOnly)`: feet/yards ->
 * whole inches + `''`; meters -> whole cm + ` cm`.
 */
export function distanceSubunit(feetInput: number, units: Units): string {
  const feet = fround(feetInput);
  if (units === Units.Meters) {
    const meters = f32div(feet, FEET_PER_METER);
    const cm = f32mul(meters, CM_PER_M);
    return `${formatFixed(cm, 0)} cm`;
  }
  const inches = f32mul(feet, INCHES_PER_FOOT);
  return `${formatFixed(inches, 0)}''`;
}

// --- Elevation (Elevation.cs:94-112) ----------------------------------------

/** `Elevation.ToString(Units)`: feet -> `0.0 ft`, meters -> `0.00 m`, yards -> `0.00 yd`. */
export function formatElevation(feetInput: number, units: Units): string {
  const feet = fround(feetInput);
  switch (units) {
    case Units.Meters: {
      const meters = f32div(feet, FEET_PER_METER);
      return `${formatFixed(meters, 2)} m`;
    }
    case Units.Yards: {
      const yards = f32div(feet, FEET_PER_YARD);
      return `${formatFixed(yards, 2)} yd`;
    }
    case Units.Default:
    case Units.Feet:
    default:
      return `${formatFixed(feet, 1)} ft`;
  }
}

// --- Volume (Volume.cs:89-107) ----------------------------------------------

/** `Volume.ToString(Units)` (base unit: cubic feet): `0.0 ft³` / `0.00 m³` / `0.00 yd³`. */
export function formatVolume(cubicFeetInput: number, units: Units): string {
  const cubicFeet = fround(cubicFeetInput);
  switch (units) {
    case Units.Meters: {
      const cubicMeters = f32mul(cubicFeet, CUFT_TO_CUM);
      return `${formatFixed(cubicMeters, 2)} m³`;
    }
    case Units.Yards: {
      const cubicYards = f32mul(cubicFeet, CUFT_TO_CUYD);
      return `${formatFixed(cubicYards, 2)} yd³`;
    }
    case Units.Default:
    case Units.Feet:
    default:
      return `${formatFixed(cubicFeet, 1)} ft³`;
  }
}

// --- RuckerIndex (RuckerIndex.cs:21-27) -------------------------------------

/**
 * `RuckerIndex.ToString(Units)` (base unit: feet): feet -> `0.00` (2dp),
 * meters -> `0.000` (3dp), yards -> `0.000` (3dp). No unit suffix.
 */
export function formatRuckerIndex(feetBasedValueInput: number, units: Units): string {
  const feetBasedValue = fround(feetBasedValueInput);
  if (units === Units.Meters) {
    const metersBasedValue = f32div(feetBasedValue, FEET_PER_METER);
    return formatFixed(metersBasedValue, 3);
  }
  if (units === Units.Yards) {
    const yardsBasedValue = f32div(feetBasedValue, FEET_PER_YARD);
    return formatFixed(yardsBasedValue, 3);
  }
  return formatFixed(feetBasedValue, 2);
}
