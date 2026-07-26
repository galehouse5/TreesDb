import { describe, expect, it } from "vitest";
import { conicalVolumeCubicFeet } from "./volume";

describe("conicalVolumeCubicFeet - Volume.cs:185-190 (pi*r^2*h/3, double precision until the final fround)", () => {
  it("radius=1ft, height=3ft -> pi (float32) = 3.1415927410125732", () => {
    expect(conicalVolumeCubicFeet(1, 3)).toBe(3.1415927410125732);
  });

  it("radius=5.5ft, height=80ft -> 2534.218017578125", () => {
    expect(conicalVolumeCubicFeet(5.5, 80)).toBe(2534.218017578125);
  });

  it("radius=0 -> 0 regardless of height", () => {
    expect(conicalVolumeCubicFeet(0, 10)).toBe(0);
  });

  it("height=0 -> 0 regardless of radius", () => {
    expect(conicalVolumeCubicFeet(5, 0)).toBe(0);
  });
});
