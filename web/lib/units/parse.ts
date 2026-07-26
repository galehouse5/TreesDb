// Legacy value-object PARSE port (input string -> stored float32 + InputFormat code).
//
// Source (READ-ONLY, transcribed exactly -- per-pattern citations below):
//   TMD.Model/ValueObjects/Distance.cs, Elevation.cs, Volume.cs, Angle.cs.
// Doc: docs/migration/01-system-reference.md §7 (exact float32 conversion
// constants; Unspecified=1 for empty, Invalid=0/value-0 for unparseable,
// "Invalid counts as specified"). Coordinates (Latitude/Longitude/
// Coordinates) live in ./parse-coordinates.ts -- a different InputFormat
// enum and no unit-suffix regex family, split out for clarity.
//
// Contract mirrored from every legacy `Create(string)` factory:
//   - null / whitespace-only input   -> Unspecified (1), value 0
//   - non-matching input             -> Invalid (0), value 0
//   - matching input                 -> the specific *Format code for the
//     pattern that matched, value converted to the storage unit as float32
//   These functions never throw.
//
// Float32 discipline (doc 07 §6, ./float32.ts): every intermediate C#
// `float` operation is fround'd individually, matching the modern SSE2
// JIT's per-operation truncation -- same discipline as ./format.ts.
// `float.Parse(decimalDigitString)` is always applied here to a
// regex-constrained plain-unsigned-decimal capture (`[0-9]+(\.[0-9]+)?`),
// never to free-form user text (Angle is the one exception -- see below) --
// for such strings `float.Parse` is simply "nearest float32 to this
// decimal", reproduced as `fround(Number(str))`.

import { f32add, f32div, f32mul, fround } from "./float32";

/** `TMD.Model/ValueObjects/Distance.cs:7-18`. */
export enum DistanceFormat {
  Invalid = 0,
  Unspecified = 1,
  Default = 2,
  FeetDecimalInches = 3,
  DecimalFeet = 4,
  DecimalInches = 5,
  DecimalMeters = 6,
  DecimalYards = 7,
  DecimalCentimeters = 8,
}

/** `TMD.Model/ValueObjects/Elevation.cs:7-15`. */
export enum ElevationFormat {
  Invalid = 0,
  Unspecified = 1,
  Default = 2,
  DecimalFeet = 3,
  DecimalMeters = 4,
  DecimalYards = 5,
}

/** `TMD.Model/ValueObjects/Volume.cs:7-15`. */
export enum VolumeFormat {
  Invalid = 0,
  Unspecified = 1,
  Default = 2,
  DecimalCubicFeet = 3,
  DecimalCubicMeters = 4,
  DecimalCubicYards = 5,
}

/** `TMD.Model/ValueObjects/Angle.cs:6-12`. */
export enum AngleFormat {
  Invalid = 0,
  Unspecified = 1,
  Default = 2,
  Decimal = 3,
}

export interface ParsedDistance {
  feet: number;
  inputFormat: DistanceFormat;
}

export interface ParsedElevation {
  feet: number;
  inputFormat: ElevationFormat;
}

export interface ParsedVolume {
  cubicFeet: number;
  inputFormat: VolumeFormat;
}

export interface ParsedAngle {
  degrees: number;
  inputFormat: AngleFormat;
}

// Conversion constants -- exact float32 literals (doc 01 §7), same values as
// ./format.ts (kept as separate local consts: parse.ts and format.ts are
// deliberately independent files per the task's file-ownership split).
const FEET_PER_METER = fround(3.2808399); // Distance.cs:37, Elevation.cs:37
const FEET_PER_YARD = fround(3); // Distance.cs:36, Elevation.cs:32
const INCHES_PER_FOOT = fround(12); // Distance.cs:35
const CM_PER_M = fround(100); // Distance.cs:38 (Centimeters = Meters * 100f)
const CUFT_TO_CUM = fround(0.0283168466); // Volume.cs:32
const CUFT_TO_CUYD = fround(0.037037037); // Volume.cs:37

function isBlank(input: string | null | undefined): boolean {
  return input == null || input.trim() === "";
}

/**
 * Every regex below constrains its numeric capture(s) to `[0-9]+(\.[0-9]+)?`
 * -- an unsigned plain-decimal literal. `float.Parse` on such a string is
 * exactly "round this decimal to the nearest float32", i.e. `fround(Number(str))`.
 */
function parseUnsignedDecimal(digits: string): number {
  return fround(Number(digits));
}

// =============================================================================
// Distance (height, girth, spread, diameter, ...) -- Distance.cs:124-182
// =============================================================================

// Distance.cs:124
const DISTANCE_FEET_DECIMAL_INCHES =
  /^\s*(?<feet>[0-9]+(?:\.[0-9]+)?)\s*('|`|ft|feets?|foots?|\s)\s*(?<inches>[0-9]+(?:\.[0-9]+)?)\s*("|''|``|ins?|inchs?|inches?)?\s*$/;
// Distance.cs:125
const DISTANCE_DECIMAL_FEET = /^\s*(?<feet>[0-9]+(?:\.[0-9]+)?)\s*('|`|ft|feets?|foots?)?\s*$/;
// Distance.cs:126
const DISTANCE_DECIMAL_INCHES =
  /^\s*(?<inches>[0-9]+(?:\.[0-9]+)?)\s*("|''|``|ins?|inchs?|inches?)\s*$/;
// Distance.cs:127
const DISTANCE_DECIMAL_METERS = /^\s*(?<meters>[0-9]+(?:\.[0-9]+)?)\s*(ms?|meters?|metres?)\s*$/;
// Distance.cs:128
const DISTANCE_DECIMAL_YARDS = /^\s*(?<yards>[0-9]+(?:\.[0-9]+)?)\s*(ys?|yds?|yards?)\s*$/;
/**
 * Distance.cs:129 + Distance.cs:166-169 -- legacy's centimeters branch is
 * BROKEN and effectively dead code (ground rules §3 / doc 00 explicitly
 * says: do not replicate). The C# regex names its capture group `meters`
 * but the factory reads `match.Groups["centimeters"]`, which .NET returns
 * as an *unmatched, empty-string* Group for a nonexistent name -- so
 * `float.Parse("")` throws an unhandled `FormatException` for every "N cm"
 * input a legacy user could type. There is no graceful `Invalid` fallback;
 * `Distance.Create` crashes outright. Per ground rules §3 ("New parser may
 * support cm correctly"), this port instead: (a) names the capture group
 * correctly, (b) uses the correct two-step conversion (cm -> m via /100,
 * then m -> ft via the standard constant) instead of legacy's *other* bug
 * (multiplying the raw cm number directly by the meters->feet constant,
 * which -- had the group even resolved -- would have been 100x too large).
 */
const DISTANCE_DECIMAL_CENTIMETERS =
  /^\s*(?<centimeters>[0-9]+(?:\.[0-9]+)?)\s*(cms?|centimeters?)\s*$/;

/** `Distance.Create(string)`, Distance.cs:130-182. */
export function parseDistance(input: string): ParsedDistance {
  if (isBlank(input)) {
    return { feet: 0, inputFormat: DistanceFormat.Unspecified };
  }
  let m: RegExpMatchArray | null;
  if ((m = input.match(DISTANCE_FEET_DECIMAL_INCHES))) {
    const feet = parseUnsignedDecimal(m.groups!.feet);
    const inchesPart = f32div(parseUnsignedDecimal(m.groups!.inches), INCHES_PER_FOOT);
    return { feet: f32add(feet, inchesPart), inputFormat: DistanceFormat.FeetDecimalInches };
  }
  if ((m = input.match(DISTANCE_DECIMAL_FEET))) {
    return { feet: parseUnsignedDecimal(m.groups!.feet), inputFormat: DistanceFormat.DecimalFeet };
  }
  if ((m = input.match(DISTANCE_DECIMAL_INCHES))) {
    return {
      feet: f32div(parseUnsignedDecimal(m.groups!.inches), INCHES_PER_FOOT),
      inputFormat: DistanceFormat.DecimalInches,
    };
  }
  if ((m = input.match(DISTANCE_DECIMAL_METERS))) {
    return {
      feet: f32mul(parseUnsignedDecimal(m.groups!.meters), FEET_PER_METER),
      inputFormat: DistanceFormat.DecimalMeters,
    };
  }
  if ((m = input.match(DISTANCE_DECIMAL_YARDS))) {
    return {
      feet: f32mul(parseUnsignedDecimal(m.groups!.yards), FEET_PER_YARD),
      inputFormat: DistanceFormat.DecimalYards,
    };
  }
  if ((m = input.match(DISTANCE_DECIMAL_CENTIMETERS))) {
    const meters = f32div(parseUnsignedDecimal(m.groups!.centimeters), CM_PER_M);
    return { feet: f32mul(meters, FEET_PER_METER), inputFormat: DistanceFormat.DecimalCentimeters };
  }
  return { feet: 0, inputFormat: DistanceFormat.Invalid };
}

// =============================================================================
// Elevation -- Elevation.cs:127-163 (no feet-inches / cm sub-units)
// =============================================================================

// Elevation.cs:123
const ELEVATION_DECIMAL_FEET = /^\s*(?<feet>[0-9]+(?:\.[0-9]+)?)\s*('|`|ft|feets?|foots?)?\s*$/;
// Elevation.cs:124
const ELEVATION_DECIMAL_METERS = /^\s*(?<meters>[0-9]+(?:\.[0-9]+)?)\s*(ms?|meters?|metres?)\s*$/;
// Elevation.cs:125
const ELEVATION_DECIMAL_YARDS = /^\s*(?<yards>[0-9]+(?:\.[0-9]+)?)\s*(ys?|yds?|yards?)\s*$/;

/** `Elevation.Create(string)`, Elevation.cs:127-163. */
export function parseElevation(input: string): ParsedElevation {
  if (isBlank(input)) {
    return { feet: 0, inputFormat: ElevationFormat.Unspecified };
  }
  let m: RegExpMatchArray | null;
  if ((m = input.match(ELEVATION_DECIMAL_FEET))) {
    return { feet: parseUnsignedDecimal(m.groups!.feet), inputFormat: ElevationFormat.DecimalFeet };
  }
  if ((m = input.match(ELEVATION_DECIMAL_METERS))) {
    return {
      feet: f32mul(parseUnsignedDecimal(m.groups!.meters), FEET_PER_METER),
      inputFormat: ElevationFormat.DecimalMeters,
    };
  }
  if ((m = input.match(ELEVATION_DECIMAL_YARDS))) {
    return {
      feet: f32mul(parseUnsignedDecimal(m.groups!.yards), FEET_PER_YARD),
      inputFormat: ElevationFormat.DecimalYards,
    };
  }
  return { feet: 0, inputFormat: ElevationFormat.Invalid };
}

// =============================================================================
// Volume (conical volume) -- Volume.cs:127-163
// =============================================================================

// Volume.cs:123 -- suffix group is OPTIONAL (bare number = cubic feet).
const VOLUME_DECIMAL_CUBIC_FEET =
  /^\s*(?<cubicFeet>[0-9]+(?:\.[0-9]+)?)(?:(?:\s*cu ft)|(?:\s*ft\^3)|(?:\s*cubic feet)|(?:\s*cubic ft))?\s*$/;
// Volume.cs:124 -- suffix group is REQUIRED.
const VOLUME_DECIMAL_CUBIC_METERS =
  /^\s*(?<cubicMeters>[0-9]+(?:\.[0-9]+)?)(?:(?:\s*cu m)|(?:\s*m\^3)|(?:\s*cubic meters)|(?:\s*cubic m))\s*$/;
// Volume.cs:125 -- suffix group is REQUIRED.
const VOLUME_DECIMAL_CUBIC_YARDS =
  /^\s*(?<cubicYards>[0-9]+(?:\.[0-9]+)?)(?:(?:\s*cu yds)|(?:\s*yds\^3)|(?:\s*cubic yards)|(?:\s*cubic yds))\s*$/;

/** `Volume.Create(string)`, Volume.cs:127-163. */
export function parseVolume(input: string): ParsedVolume {
  if (isBlank(input)) {
    return { cubicFeet: 0, inputFormat: VolumeFormat.Unspecified };
  }
  let m: RegExpMatchArray | null;
  if ((m = input.match(VOLUME_DECIMAL_CUBIC_FEET))) {
    return {
      cubicFeet: parseUnsignedDecimal(m.groups!.cubicFeet),
      inputFormat: VolumeFormat.DecimalCubicFeet,
    };
  }
  if ((m = input.match(VOLUME_DECIMAL_CUBIC_METERS))) {
    return {
      cubicFeet: f32div(parseUnsignedDecimal(m.groups!.cubicMeters), CUFT_TO_CUM),
      inputFormat: VolumeFormat.DecimalCubicMeters,
    };
  }
  if ((m = input.match(VOLUME_DECIMAL_CUBIC_YARDS))) {
    return {
      cubicFeet: f32div(parseUnsignedDecimal(m.groups!.cubicYards), CUFT_TO_CUYD),
      inputFormat: VolumeFormat.DecimalCubicYards,
    };
  }
  return { cubicFeet: 0, inputFormat: VolumeFormat.Invalid };
}

// =============================================================================
// Angle (clinometer top/bottom angle) -- Angle.cs:53-80
// =============================================================================

/**
 * `float.TryParse(s.Trim(), out degrees)` (Angle.cs:65) -- unlike every
 * other quantity above, Angle applies `float.TryParse` directly to
 * trimmed free-form user text, not to a regex-constrained capture. The
 * single-argument `float.TryParse(string, out float)` overload parses with
 * `NumberStyles.Float | NumberStyles.AllowThousands` under the CURRENT
 * CULTURE: leading/trailing whitespace (already trimmed), an optional
 * leading sign, an optional decimal point, an optional exponent, AND
 * thousands group separators (`,` for en-US) anywhere among the integer
 * digits.
 *
 * This port reproduces the realistic surface (sign, digits, optional
 * comma grouping, decimal point, exponent) via `stripCommas` + a shape
 * regex, then `fround(Number(...))`. Two genuine .NET behaviors are
 * intentionally NOT replicated (documented deviations, not bugs to
 * preserve per ground rules §3's "preserve behavior users depend on" --
 * these have no plausible legitimate use for a 0-90 degree clinometer
 * reading and no known production data exercises them):
 *   - `float.TryParse("NaN"/"Infinity"/"-Infinity")` succeeds in .NET.
 *   - `NumberStyles.AllowThousands` doesn't validate 3-digit grouping
 *     positions; this port is equally lenient (commas are simply
 *     stripped), so it doesn't diverge in the common case either way.
 */
function tryParseDotNetSingle(trimmed: string): number | null {
  if (trimmed === "") return null;
  // Fractional digits after the decimal point are OPTIONAL: .NET's
  // AllowDecimalPoint accepts a bare trailing "." (e.g. "5." parses as 5).
  const shape = /^[+-]?(?:[0-9](?:,?[0-9])*)?(?:\.[0-9]*)?([eE][+-]?[0-9]+)?$/;
  if (!shape.test(trimmed)) return null;
  const stripped = trimmed.replace(/,/g, "");
  // Reject inputs with no digits at all (e.g. "+", "-", ".", "e5") -- .NET
  // requires at least one digit somewhere in the mantissa.
  if (!/[0-9]/.test(stripped)) return null;
  const value = Number(stripped);
  if (!Number.isFinite(value)) return null;
  return fround(value);
}

/** `Angle.Create(string)`, Angle.cs:53-80. */
export function parseAngle(input: string): ParsedAngle {
  if (isBlank(input)) {
    return { degrees: 0, inputFormat: AngleFormat.Unspecified };
  }
  const parsed = tryParseDotNetSingle(input.trim());
  if (parsed !== null) {
    return { degrees: parsed, inputFormat: AngleFormat.Decimal };
  }
  return { degrees: 0, inputFormat: AngleFormat.Invalid };
}
