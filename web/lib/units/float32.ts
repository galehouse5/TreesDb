// Float32 arithmetic discipline helpers.
//
// Doc: docs/migration/07-parity-testing.md §6, §1.3; doc 00 ground rules §3.
//
// Legacy stores every measured quantity as SQL Server `real` (IEEE-754
// binary32) and computes through C# `float` locals/properties. On the
// modern x64/SSE2 JIT that this app has run on, each individual `float`
// arithmetic operation (add/sub/mul/div) truncates its result to 32-bit
// precision immediately -- unlike the historical x87 80-bit-extended-
// precision behavior. To reproduce that, ports of legacy formulas must
// `Math.fround` after each intermediate float-typed operation, not just at
// the end. Where legacy code explicitly widens to `double` mid-formula
// (e.g. `(double)someFloat`), the JS port must NOT fround until the value
// is cast back down -- see web/lib/measurements/height.ts and
// web/lib/measurements/volume.ts for worked examples of both patterns.

/** Coerces to the nearest IEEE-754 binary32 value (alias for clarity at call sites). */
export const fround = Math.fround;

/** `Math.fround(Math.fround(a) + Math.fround(b))` -- float32 addition. */
export function f32add(a: number, b: number): number {
  return Math.fround(Math.fround(a) + Math.fround(b));
}

/** `Math.fround(Math.fround(a) - Math.fround(b))` -- float32 subtraction. */
export function f32sub(a: number, b: number): number {
  return Math.fround(Math.fround(a) - Math.fround(b));
}

/** `Math.fround(Math.fround(a) * Math.fround(b))` -- float32 multiplication. */
export function f32mul(a: number, b: number): number {
  return Math.fround(Math.fround(a) * Math.fround(b));
}

/** `Math.fround(Math.fround(a) / Math.fround(b))` -- float32 division. */
export function f32div(a: number, b: number): number {
  return Math.fround(Math.fround(a) / Math.fround(b));
}

/**
 * Rounds `value` to `decimals` decimal places using half-away-from-zero
 * midpoint rounding, matching .NET custom numeric format strings (e.g.
 * `"0.0"`, `"0.00"`) -- doc 07 §6: "scale, add 0.5*sign, truncate --
 * computed in float64 on the float32 input, matching .NET's internal
 * widening." `value` is expected to already be (or be derived from) a
 * float32 value; the rounding arithmetic itself runs in float64 (JS's only
 * number type), which is what "computed in float64 on the float32 input"
 * means in practice here.
 *
 * NOT the same as JS `toFixed`, which is inconsistent at exact midpoints
 * because of binary floating-point representation.
 */
export function roundHalfAwayFromZero(value: number, decimals: number): number {
  const scale = 10 ** decimals;
  const sign = Math.sign(value) || 1; // treat 0 / -0 as positive
  return Math.trunc(value * scale + sign * 0.5) / scale;
}

/**
 * Rounds a float32 value to `decimals` places the way .NET FRAMEWORK
 * `Single.ToString("0.00")`-style custom formats do -- which is NOT plain
 * rounding of the binary expansion.
 *
 * .NET Framework first converts the Single into a NUMBER structure holding
 * only FLOAT_PRECISION = 7 significant DECIMAL digits, and the format
 * rounding then operates digit-wise on that decimal (round up when the
 * first dropped digit >= 5). Consequence, proven against production
 * (parity §5.4, Iowa state RGI10): stored real 10.325f (float64 expansion
 * 10.32499980926...) renders "10.33" in legacy -- its 7-digit decimal is
 * exactly "10.32500" -- while rounding the raw binary expansion gives the
 * wrong "10.32". Doc 07 §6 flagged midpoint rounding as the known hazard
 * and §11 says production wins over our code-reading; this is that
 * micro-decision.
 *
 * Implementation: fround -> toPrecision(7) (decimal string; JS ties at the
 * 7th digit effectively cannot occur for float32 inputs) -> digit-wise
 * truncate/increment on the decimal string (never float arithmetic, which
 * would reintroduce binary error, e.g. 10.325*100 = 1032.4999...).
 */
export function roundDotNetSingle(value: number, decimals: number): number {
  const v = Math.fround(value);
  if (v === 0 || !Number.isFinite(v)) return v === 0 ? 0 : v;
  const sign = v < 0 ? -1 : 1;
  let s = Math.abs(v).toPrecision(7);
  if (s.includes("e") || s.includes("E")) {
    // |v| >= 1e7 (or <= 1e-7): expand scientific notation. Magnitudes this
    // large never carry sub-unit precision in the 7-digit NUMBER anyway.
    s = Number(s).toFixed(decimals + 1);
  }
  const dot = s.indexOf(".");
  if (dot === -1) return sign * Number(s);
  const intPart = s.slice(0, dot);
  const frac = s.slice(dot + 1);
  if (frac.length <= decimals) return sign * Number(s);
  const keptDigits = Number(intPart + frac.slice(0, decimals));
  const nextDigit = frac.charCodeAt(decimals) - 48;
  const scaled = nextDigit >= 5 ? keptDigits + 1 : keptDigits;
  return (sign * scaled) / 10 ** decimals;
}
