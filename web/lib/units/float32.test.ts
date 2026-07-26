import { describe, expect, it } from "vitest";
import { f32add, f32div, f32mul, f32sub, fround, roundDotNetSingle, roundHalfAwayFromZero } from "./float32";

describe("fround / f32 arithmetic wrappers", () => {
  it("fround coerces to the nearest float32", () => {
    expect(fround(0.1)).toBeCloseTo(0.1, 6);
    expect(fround(0.1)).not.toBe(0.1); // 0.1 is not exactly representable in float32 or float64
  });

  it("f32add/f32sub/f32mul/f32div fround both operands and the result", () => {
    expect(f32add(1, 2)).toBe(3);
    expect(f32sub(5, 2)).toBe(3);
    expect(f32mul(2, 3)).toBe(6);
    expect(f32div(6, 3)).toBe(2);
    // 3.2808399 is the feet<->meters constant; frounding it then dividing
    // should equal the direct float32 division.
    const feetPerMeter = fround(3.2808399);
    expect(f32div(200, feetPerMeter)).toBe(fround(200 / feetPerMeter));
  });
});

describe("roundHalfAwayFromZero", () => {
  it("rounds exact positive midpoints away from zero, not to even", () => {
    expect(roundHalfAwayFromZero(2.5, 0)).toBe(3);
    expect(roundHalfAwayFromZero(1.25, 1)).toBe(1.3); // NOT 1.2 (which round-half-to-even would give)
    expect(roundHalfAwayFromZero(0.125, 2)).toBe(0.13); // NOT 0.12
  });

  it("rounds exact negative midpoints away from zero", () => {
    expect(roundHalfAwayFromZero(-2.5, 0)).toBe(-3);
    expect(roundHalfAwayFromZero(-1.25, 1)).toBe(-1.3);
  });

  it("rounds non-midpoint values normally", () => {
    expect(roundHalfAwayFromZero(123.456, 1)).toBe(123.5);
    expect(roundHalfAwayFromZero(Math.fround(123.456), 1)).toBe(123.5);
  });

  it("zero rounds to zero", () => {
    expect(roundHalfAwayFromZero(0, 2)).toBe(0);
  });
});

describe("roundDotNetSingle (.NET Framework Single 7-digit decimal semantics)", () => {
  it("rounds the 7-significant-digit decimal, not the binary expansion", () => {
    // Production parity vector (Iowa state RGI10): stored real 10.325f
    // expands to 10.32499980926... in binary, but its 7-digit decimal is
    // 10.32500, and legacy renders "10.33".
    expect(roundDotNetSingle(Math.fround(10.325), 2)).toBe(10.33);
    expect(roundDotNetSingle(Math.fround(-10.325), 2)).toBe(-10.33);
  });
  it("matches the doc 01 §7 golden outputs", () => {
    expect(roundDotNetSingle(Math.fround(123.456), 1)).toBe(123.5);
    expect(roundDotNetSingle(Math.fround(134.82), 2)).toBe(134.82);
    expect(roundDotNetSingle(200, 1)).toBe(200);
  });
  it("handles small values and zero", () => {
    expect(roundDotNetSingle(Math.fround(0.05), 1)).toBe(0.1);
    expect(roundDotNetSingle(0, 2)).toBe(0);
  });
});
