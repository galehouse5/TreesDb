// Legacy coordinate PARSE port (input string -> stored float32 TotalDegrees
// + InputFormat code). Split from ./parse.ts: a different InputFormat enum
// (`CoordinatesFormat`, shared by Latitude/Longitude/Coordinates) and no
// unit-suffix regex family -- these accept an optional sign only, never
// N/S/E/W letter prefixes (see the module-level oddity note below).
//
// Source (READ-ONLY, transcribed exactly): TMD.Model/ValueObjects/
// {Latitude,Longitude,Coordinates}.cs.
// Doc: docs/migration/01-system-reference.md §7 ("Coordinates: parse
// rounds TotalDegrees to 5 decimals, banker's rounding; stored float32");
// ground rules §3 (banker's rounding must be preserved exactly).
//
// Display-side formatting (`formatLatitude`/`formatLongitude`/
// `roundTotalDegrees`) already lives in ../geo/coordinates.ts -- this file
// reuses its `roundTotalDegrees` so the two sides can't drift, and its
// round-trip is exercised in parse-coordinates.test.ts.

import { f32add, f32div, f32mul, fround } from "./float32";
import { roundTotalDegrees } from "../geo/coordinates";

/** `TMD.Model/ValueObjects/Coordinates.cs:6-14`. Shared by Latitude/Longitude/Coordinates. */
export enum CoordinatesFormat {
  Invalid = 0,
  Unspecified = 1,
  Default = 2,
  DegreesMinutesDecimalSeconds = 3,
  DegreesDecimalMinutes = 4,
  DecimalDegrees = 5,
}

export interface ParsedCoordinate {
  totalDegrees: number;
  inputFormat: CoordinatesFormat;
}

export interface ParsedCoordinates {
  latitude: ParsedCoordinate;
  longitude: ParsedCoordinate;
  /** `Coordinates.InputFormat` getter, Coordinates.cs:25-39 -- see note below. */
  inputFormat: CoordinatesFormat;
  /**
   * `Coordinates.IsSpecified`, Coordinates.cs:23: `Latitude.IsSpecified ||
   * Longitude.IsSpecified` -- OR, not AND. This is a genuine legacy
   * inconsistency with `inputFormat` above, which resolves to Unspecified
   * if EITHER side is unspecified (AND-like). E.g. lat specified + long
   * blank: `isSpecified` is true but `inputFormat` is Unspecified(1).
   * Preserved exactly, not reconciled -- ground rules §3.
   */
  isSpecified: boolean;
}

function isBlank(input: string | null | undefined): boolean {
  return input == null || input.trim() === "";
}

function parseUnsignedDecimal(digits: string): number {
  return fround(Number(digits));
}

// Latitude.cs:66-68 -- degrees is 1-2 digits (max magnitude 90).
const LAT_DMS =
  /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\s+(?<minutes>[0-9]{1,2})\s+(?<seconds>[0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
const LAT_DDM = /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\s+(?<minutes>[0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
const LAT_DD = /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2}(?:\.[0-9]+)?)\s*$/;

// Longitude.cs:66-68 -- degrees is 1-3 digits (max magnitude 180).
const LNG_DMS =
  /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\s+(?<minutes>[0-9]{1,2})\s+(?<seconds>[0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
const LNG_DDM = /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\s+(?<minutes>[0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
const LNG_DD = /^\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3}(?:\.[0-9]+)?)\s*$/;

/**
 * `(float)Math.Round(sign * (degrees + minutes/60f + seconds/3600f), 5)`
 * (Latitude.cs:117 / Longitude.cs:117): each division and addition is
 * float32-per-operation, the sign multiply is float32, and only THEN does
 * the (now float32) result widen to double for `Math.Round(double, 5)`
 * (banker's rounding), narrowing back to float32 on return. `sign`/
 * `degrees`/`minutes`/`seconds` are all C# `float` locals.
 */
function computeTotalDegrees(sign: number, degrees: number, minutes: number, seconds: number): number {
  const minutesPart = f32div(minutes, 60);
  const secondsPart = f32div(seconds, 3600);
  const sum = f32add(f32add(degrees, minutesPart), secondsPart);
  const signed = f32mul(sign, sum);
  return roundTotalDegrees(signed);
}

function parseGeographic(input: string, dms: RegExp, ddm: RegExp, dd: RegExp): ParsedCoordinate {
  if (isBlank(input)) {
    return { totalDegrees: 0, inputFormat: CoordinatesFormat.Unspecified };
  }
  let m: RegExpMatchArray | null;
  if ((m = input.match(dms))) {
    const sign = m.groups!.sign === "-" ? -1 : 1;
    const degrees = parseUnsignedDecimal(m.groups!.degrees);
    const minutes = parseUnsignedDecimal(m.groups!.minutes);
    const seconds = parseUnsignedDecimal(m.groups!.seconds);
    return {
      totalDegrees: computeTotalDegrees(sign, degrees, minutes, seconds),
      inputFormat: CoordinatesFormat.DegreesMinutesDecimalSeconds,
    };
  }
  if ((m = input.match(ddm))) {
    const sign = m.groups!.sign === "-" ? -1 : 1;
    const degrees = parseUnsignedDecimal(m.groups!.degrees);
    const minutes = parseUnsignedDecimal(m.groups!.minutes);
    return {
      totalDegrees: computeTotalDegrees(sign, degrees, minutes, 0),
      inputFormat: CoordinatesFormat.DegreesDecimalMinutes,
    };
  }
  if ((m = input.match(dd))) {
    const sign = m.groups!.sign === "-" ? -1 : 1;
    const degrees = parseUnsignedDecimal(m.groups!.degrees);
    return {
      totalDegrees: computeTotalDegrees(sign, degrees, 0, 0),
      inputFormat: CoordinatesFormat.DecimalDegrees,
    };
  }
  return { totalDegrees: 0, inputFormat: CoordinatesFormat.Invalid };
}

/**
 * `Latitude.Create(string)`, Latitude.cs:69-120. Accepts an optional
 * leading `+`/`-` sign only -- NOT `N`/`S` letter prefixes/suffixes (no
 * such branch exists in legacy; a value like "39.5 N" falls through every
 * pattern to Invalid).
 */
export function parseLatitude(input: string): ParsedCoordinate {
  return parseGeographic(input, LAT_DMS, LAT_DDM, LAT_DD);
}

/**
 * `Longitude.Create(string)`, Longitude.cs:69-120. Accepts an optional
 * leading `+`/`-` sign only -- NOT `E`/`W` letter prefixes/suffixes, same
 * as Latitude above.
 */
export function parseLongitude(input: string): ParsedCoordinate {
  return parseGeographic(input, LNG_DMS, LNG_DDM, LNG_DD);
}

/** `Coordinates.InputFormat` getter, Coordinates.cs:25-39. */
function combinedInputFormat(
  latFormat: CoordinatesFormat,
  lngFormat: CoordinatesFormat,
): CoordinatesFormat {
  if (latFormat === CoordinatesFormat.Invalid || lngFormat === CoordinatesFormat.Invalid) {
    return CoordinatesFormat.Invalid;
  }
  if (latFormat === CoordinatesFormat.Unspecified || lngFormat === CoordinatesFormat.Unspecified) {
    return CoordinatesFormat.Unspecified;
  }
  return latFormat;
}

/**
 * `Coordinates.Create(string)`, Coordinates.cs:122-144: splits on `,`
 * (`StringSplitOptions.RemoveEmptyEntries` -- drops zero-length pieces
 * only, e.g. from a leading/trailing/doubled comma; does NOT trim
 * whitespace-only pieces, which fall through to Latitude/Longitude's own
 * blank check and come out Unspecified). `parts[0]` -> latitude,
 * `parts[1]` -> longitude if present else `""` (Unspecified).
 *
 * Legacy edge case NOT replicated: an input consisting solely of commas
 * (e.g. `","`) splits+strips down to a zero-length array, and legacy's
 * `parts[0]` indexing then throws an uncaught `IndexOutOfRangeException`
 * -- there is no graceful path. Per this module's "never throw" contract
 * (and ground rules §3's carve-out for dead/broken paths), that case
 * instead returns Invalid here.
 */
export function parseCoordinates(input: string): ParsedCoordinates {
  if (isBlank(input)) {
    const latitude = parseLatitude("");
    const longitude = parseLongitude("");
    return {
      latitude,
      longitude,
      inputFormat: CoordinatesFormat.Unspecified,
      isSpecified: false,
    };
  }
  const parts = input.split(",").filter((p) => p.length > 0);
  if (parts.length === 0) {
    // Legacy: uncaught IndexOutOfRangeException on `parts[0]` (see above).
    const latitude: ParsedCoordinate = { totalDegrees: 0, inputFormat: CoordinatesFormat.Invalid };
    const longitude: ParsedCoordinate = { totalDegrees: 0, inputFormat: CoordinatesFormat.Invalid };
    return { latitude, longitude, inputFormat: CoordinatesFormat.Invalid, isSpecified: false };
  }
  const latitude = parseLatitude(parts[0]);
  const longitude = parts.length > 1 ? parseLongitude(parts[1]) : parseLongitude("");
  return {
    latitude,
    longitude,
    inputFormat: combinedInputFormat(latitude.inputFormat, longitude.inputFormat),
    isSpecified:
      latitude.inputFormat !== CoordinatesFormat.Unspecified ||
      longitude.inputFormat !== CoordinatesFormat.Unspecified,
  };
}
