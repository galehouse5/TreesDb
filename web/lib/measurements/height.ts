// Legacy clinometer height calculation port.
//
// Source: TMD.Model/ValueObjects/HeightMeasurements.cs:34-44,
// TMD.Model/ValueObjects/Angle.cs:27 (Radians).
// Doc: docs/migration/01-system-reference.md §7.
//
//   height_ft = sin(angleTop_rad)*distanceTop_ft
//             + sin(angleBottom_rad)*distanceBottom_ft
//             + verticalOffset_ft
//
// Precision note (important, and easy to get wrong): unlike most of the
// value-object arithmetic in this codebase, `calculateHeight`
// (HeightMeasurements.cs:34-44) does NOT stay in float32 throughout. It
// explicitly widens each term to `double` before summing
// (`(double)distanceTop.Feet`, etc.), and `Math.Sin` itself only has a
// `double` overload, so the whole sum is computed in double precision;
// only the FINAL result is cast back down to `float`. `Angle.Radians`
// (Angle.cs:27) is itself a float32 value, computed as
// `(float)(((double)Degrees / 360d) * 2d * Math.PI)` -- i.e. the
// degrees-to-radians conversion runs in double, then narrows to float32
// once, and THAT float32 radians value is what gets passed into
// `Math.Sin`.

import { fround } from "../units/float32";

/** `Angle.Radians` (Angle.cs:27): float32 result of a double-precision degrees->radians conversion. */
export function angleRadians(degrees: number): number {
  return fround((degrees / 360) * 2 * Math.PI);
}

/**
 * `HeightMeasurements.calculateHeight` (HeightMeasurements.cs:34-44).
 * All Feet/degrees inputs are float32 values (as stored); the trig + sum
 * happens in float64 (per the legacy explicit `(double)` casts), and only
 * the returned height is narrowed back to float32.
 */
export function clinometerHeightFeet(
  distanceTopFt: number,
  angleTopDeg: number,
  distanceBottomFt: number,
  angleBottomDeg: number,
  verticalOffsetFt: number,
): number {
  const angleTopRad = angleRadians(angleTopDeg);
  const angleBottomRad = angleRadians(angleBottomDeg);
  const heightDouble =
    Math.sin(angleTopRad) * distanceTopFt +
    Math.sin(angleBottomRad) * distanceBottomFt +
    verticalOffsetFt;
  return fround(heightDouble);
}
