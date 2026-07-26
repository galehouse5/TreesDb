// Legacy coordinate formatting / rounding / planar-distance port.
//
// Source: TMD.Model/ValueObjects/{Coordinates,Latitude,Longitude}.cs.
// Doc: docs/migration/01-system-reference.md §7; ground rules §3
// (banker's rounding).

import { fround, roundDotNetSingle } from "../units/float32";

export type CoordinateFormat =
  | "DecimalDegrees" // "00.00000" (lat) / "000.00000" (long), 5dp
  | "DegreesDecimalMinutes" // "dd mm.mmm" (lat) / "ddd mm.mmm" (long)
  | "DegreesMinutesDecimalSeconds"; // "dd mm ss.s" (lat) / "ddd mm ss.s" (long)

export type CoordinateKind = "latitude" | "longitude";

// --- Latitude/Longitude derived quantities (Latitude.cs:22-27, Longitude.cs:22-27) ---
//
// All arithmetic is float32-per-operation (each is a C# `float` property
// computed from float operands).

function absoluteWholeDegrees(totalDegrees: number): number {
  // (int)Math.Floor(AbsoluteTotalDegrees) -- exact integer, no fround needed.
  return Math.floor(Math.abs(totalDegrees));
}

function absoluteMinutes(totalDegrees: number): number {
  // 60f * (AbsoluteTotalDegrees - AbsoluteWholeDegrees)
  const absTotal = Math.abs(totalDegrees);
  const whole = absoluteWholeDegrees(totalDegrees);
  return fround(60 * fround(absTotal - whole));
}

function absoluteWholeMinutes(totalDegrees: number): number {
  // (int)Math.Floor(AbsoluteMinutes)
  return Math.floor(absoluteMinutes(totalDegrees));
}

function absoluteSeconds(totalDegrees: number): number {
  // 60f * (AbsoluteMinutes - AbsoluteWholeMinutes)
  const min = absoluteMinutes(totalDegrees);
  const wholeMin = absoluteWholeMinutes(totalDegrees);
  return fround(60 * fround(min - wholeMin));
}

// --- Fixed-point formatting helpers -----------------------------------------

/** `{value:0...0 with intDigits leading zero-padded digits}` -- value must be non-negative. */
function formatFixedPadded(value: number, intDigits: number, decimals: number): string {
  const rounded = roundDotNetSingle(value, decimals);
  const normalized = rounded === 0 ? 0 : rounded;
  const str = normalized.toFixed(decimals);
  const dotIndex = str.indexOf(".");
  const intPart = dotIndex === -1 ? str : str.slice(0, dotIndex);
  const fracPart = dotIndex === -1 ? "" : str.slice(dotIndex + 1);
  const paddedInt = intPart.padStart(intDigits, "0");
  return fracPart ? `${paddedInt}.${fracPart}` : paddedInt;
}

/**
 * Formats the signed whole-degrees component for DDM/DMS.
 *
 * Legacy quirk (preserved, NOT fixed -- ground rules §3 only lists specific
 * known bugs as "do not replicate"; this one isn't on that list): the sign
 * comes from `AbsoluteWholeDegrees * Sign` (Latitude.cs:39-42,
 * Longitude.cs:39-42) -- an **int** multiplication -- not from the sign of
 * `totalDegrees` directly. When the magnitude is under 1 degree,
 * `AbsoluteWholeDegrees` is 0, and `0 * anySign === 0`, which has no
 * negative representation in .NET's format engine. So e.g. -0.5 degrees
 * renders its DDM/DMS whole-degree component as `"00"`, not `"-00"` --
 * the sign silently disappears for sub-one-degree negative values in these
 * two formats (DecimalDegrees is unaffected: it formats the signed float
 * value directly, not an int product).
 */
function formatSignedWholeDegrees(totalDegrees: number, intDigits: number): string {
  const sign = Math.sign(totalDegrees);
  const wholeDeg = absoluteWholeDegrees(totalDegrees);
  const signedWholeDeg = wholeDeg * sign;
  const signStr = signedWholeDeg < 0 ? "-" : "";
  return signStr + String(Math.abs(signedWholeDeg)).padStart(intDigits, "0");
}

/**
 * Formats a coordinate's total-degrees value per `Latitude.ToString(CoordinatesFormat)`
 * / `Longitude.ToString(CoordinatesFormat)` (Latitude.cs:30-48, Longitude.cs:30-48).
 * `kind` selects the integer-digit width: latitude pads to 2 digits
 * (max 90), longitude to 3 (max 180).
 */
export function formatCoordinate(
  totalDegrees: number,
  format: CoordinateFormat,
  kind: CoordinateKind,
): string {
  const intDigits = kind === "latitude" ? 2 : 3;
  switch (format) {
    case "DecimalDegrees": {
      const sign = totalDegrees < 0 ? "-" : "";
      const abs = Math.abs(totalDegrees);
      return sign + formatFixedPadded(abs, intDigits, 5);
    }
    case "DegreesDecimalMinutes": {
      const degStr = formatSignedWholeDegrees(totalDegrees, intDigits);
      const minStr = formatFixedPadded(absoluteMinutes(totalDegrees), 2, 3);
      return `${degStr} ${minStr}`;
    }
    case "DegreesMinutesDecimalSeconds": {
      const degStr = formatSignedWholeDegrees(totalDegrees, intDigits);
      const minStr = String(absoluteWholeMinutes(totalDegrees)).padStart(2, "0");
      const secStr = formatFixedPadded(absoluteSeconds(totalDegrees), 2, 1);
      return `${degStr} ${minStr} ${secStr}`;
    }
    default: {
      const exhaustive: never = format;
      throw new Error(`Unknown coordinate format: ${exhaustive}`);
    }
  }
}

export function formatLatitude(totalDegrees: number, format: CoordinateFormat): string {
  return formatCoordinate(totalDegrees, format, "latitude");
}

export function formatLongitude(totalDegrees: number, format: CoordinateFormat): string {
  return formatCoordinate(totalDegrees, format, "longitude");
}

// --- Parsing rounding (Latitude.Create/Longitude.Create, …cs:117) ----------

/**
 * `(float)Math.Round(sign * (degrees + minutes/60f + seconds/3600f), 5)`:
 * rounds to 5 decimal places using .NET's default MidpointRounding.ToEven
 * (banker's rounding) computed in double precision, then narrows to
 * float32. `value` is the already-summed signed total-degrees double.
 */
export function roundTotalDegrees(value: number): number {
  return fround(roundHalfToEven(value, 5));
}

function roundHalfToEven(value: number, decimals: number): number {
  const scale = 10 ** decimals;
  const scaled = value * scale;
  const flooredValue = Math.floor(scaled);
  const diff = scaled - flooredValue;
  let roundedInt: number;
  if (diff < 0.5) {
    roundedInt = flooredValue;
  } else if (diff > 0.5) {
    roundedInt = flooredValue + 1;
  } else {
    // Exact midpoint: round to the even candidate.
    roundedInt = flooredValue % 2 === 0 ? flooredValue : flooredValue + 1;
  }
  return roundedInt / scale;
}

// --- Planar distance (Coordinates.CalculateDistanceInMinutesTo, Coordinates.cs:41-47) ---

/**
 * `sqrt(Δlat² + Δlng²) × 60`, float32-disciplined per the legacy
 * implementation: the lat/lng deltas and their squares are computed as
 * `float`, summed as `float`, widened to `double` only for `Math.Sqrt`
 * (which has no float overload), then narrowed back to `float` before the
 * final `× 60f` (also `float`). Deliberately planar, not great-circle
 * (doc 01 §7).
 */
export function planarDistanceMinutes(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = fround(lat1 - lat2);
  const dLng = fround(lng1 - lng2);
  const dLat2 = fround(dLat * dLat);
  const dLng2 = fround(dLng * dLng);
  const sumSq = fround(dLat2 + dLng2);
  const degrees = fround(Math.sqrt(sumSq));
  return fround(degrees * 60);
}
