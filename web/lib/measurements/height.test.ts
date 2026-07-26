import { describe, expect, it } from "vitest";
import { angleRadians, clinometerHeightFeet } from "./height";

const F = Math.fround;

describe("angleRadians", () => {
  it("90 degrees -> pi/2 (as float32)", () => {
    expect(angleRadians(90)).toBe(F((90 / 360) * 2 * Math.PI));
  });

  it("0 degrees -> 0", () => {
    expect(angleRadians(0)).toBe(0);
  });
});

describe("clinometerHeightFeet - HeightMeasurements.cs:34-44", () => {
  it("distTop=150ft @32.5deg, distBottom=20ft @-5deg (below eye level), offset=1.5ft -> 80.3518295288086", () => {
    const height = clinometerHeightFeet(F(150), F(32.5), F(20), F(-5), F(1.5));
    expect(height).toBe(80.3518295288086);
  });

  it("distTop=100.5ft @45deg, no bottom leg, no offset -> 71.0642318725586", () => {
    const height = clinometerHeightFeet(F(100.5), F(45), F(0), F(0), F(0));
    expect(height).toBe(71.0642318725586);
  });

  it("all-zero inputs -> 0", () => {
    expect(clinometerHeightFeet(0, 0, 0, 0, 0)).toBe(0);
  });

  it("a negative verticalOffset subtracts from the summed height", () => {
    const withoutOffset = clinometerHeightFeet(F(150), F(32.5), F(20), F(-5), 0);
    const withNegativeOffset = clinometerHeightFeet(F(150), F(32.5), F(20), F(-5), F(-2));
    expect(withNegativeOffset).toBeLessThan(withoutOffset);
  });
});
