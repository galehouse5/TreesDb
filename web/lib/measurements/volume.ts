// Legacy conical volume calculation port.
//
// Source: TMD.Model/ValueObjects/Volume.cs:185-190 (`Volume.CalculateConical`).
// Doc: docs/migration/01-system-reference.md §5, §7.
//
//   ConicalVolume = pi * r^2 * h / 3
//
// Precision note: `CalculateConical(double radiusFeet, double heightFeet)`
// takes `double` PARAMETERS (not `float`) and computes entirely in double
// precision (`Math.Pow`, `Math.PI`, all arithmetic); only the final
// `Create((float)volume)` narrows the result to float32. There is no
// per-operation float32 rounding here, unlike most of the other value
// objects -- do not `fround` the intermediate `area`/`volume` values.

import { fround } from "../units/float32";

/** `Volume.CalculateConical` (Volume.cs:185-190): pi*r^2*h/3, computed in double, narrowed to float32 once at the end. */
export function conicalVolumeCubicFeet(radiusFeet: number, heightFeet: number): number {
  const area = Math.pow(radiusFeet, 2) * Math.PI;
  const volume = (area * heightFeet) / 3.0;
  return fround(volume);
}
