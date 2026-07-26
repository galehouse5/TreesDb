import { describe, expect, it } from "vitest";
import { formatCoordinate, planarDistanceMinutes, roundTotalDegrees } from "./coordinates";

const F = Math.fround;

describe("formatCoordinate - DecimalDegrees (00.00000 lat / 000.00000 long, 5dp)", () => {
  it("positive latitude 39.123", () => {
    expect(formatCoordinate(F(39.123), "DecimalDegrees", "latitude")).toBe("39.12300");
  });

  it("negative longitude -84.456", () => {
    expect(formatCoordinate(F(-84.456), "DecimalDegrees", "longitude")).toBe("-084.45600");
  });

  it("small negative value keeps its sign in DecimalDegrees (unlike DDM/DMS)", () => {
    expect(formatCoordinate(F(-0.5), "DecimalDegrees", "latitude")).toBe("-00.50000");
  });
});

describe("formatCoordinate - DegreesDecimalMinutes (dd mm.mmm)", () => {
  it("positive latitude 39.123 -> 39 07.380", () => {
    expect(formatCoordinate(F(39.123), "DegreesDecimalMinutes", "latitude")).toBe("39 07.380");
  });

  it("negative longitude -84.456 -> -084 27.360", () => {
    expect(formatCoordinate(F(-84.456), "DegreesDecimalMinutes", "longitude")).toBe(
      "-084 27.360",
    );
  });

  it("legacy sign-loss quirk: -0.5 degrees loses its sign when whole degrees is 0", () => {
    // AbsoluteWholeDegrees * Sign = 0 * -1 = 0 (int), which has no negative
    // representation in .NET's format engine -- Latitude.cs:39-42.
    expect(formatCoordinate(F(-0.5), "DegreesDecimalMinutes", "latitude")).toBe("00 30.000");
  });

  it("zero formats with no sign", () => {
    expect(formatCoordinate(0, "DegreesDecimalMinutes", "latitude")).toBe("00 00.000");
  });
});

describe("formatCoordinate - DegreesMinutesDecimalSeconds (dd mm ss.s)", () => {
  it("positive latitude 39.123 -> 39 07 22.8", () => {
    expect(formatCoordinate(F(39.123), "DegreesMinutesDecimalSeconds", "latitude")).toBe(
      "39 07 22.8",
    );
  });

  it("negative longitude -84.456 -> -084 27 21.6", () => {
    expect(
      formatCoordinate(F(-84.456), "DegreesMinutesDecimalSeconds", "longitude"),
    ).toBe("-084 27 21.6");
  });

  it("same sign-loss quirk applies to DMS", () => {
    expect(formatCoordinate(F(-0.5), "DegreesMinutesDecimalSeconds", "latitude")).toBe(
      "00 30 00.0",
    );
  });
});

describe("roundTotalDegrees - banker's rounding (round-half-to-even) at 5 decimals, then fround", () => {
  it("0.000005 is an exact midpoint -> rounds DOWN to the even candidate 0.00000", () => {
    expect(roundTotalDegrees(0.000005)).toBe(0);
  });

  it("0.000015 is an exact midpoint -> rounds UP to the even candidate 0.00002", () => {
    expect(roundTotalDegrees(0.000015)).toBe(F(0.00002));
  });

  it("-0.000015 is an exact midpoint -> rounds to the even candidate -0.00002", () => {
    expect(roundTotalDegrees(-0.000015)).toBe(F(-0.00002));
  });

  it("1.234575 is an exact midpoint at the 5th decimal -> rounds UP to even 1.23458", () => {
    expect(roundTotalDegrees(1.234575)).toBe(F(1.23458));
  });

  it("-1.234575 is an exact midpoint -> rounds to even -1.23458", () => {
    expect(roundTotalDegrees(-1.234575)).toBe(F(-1.23458));
  });

  it("non-midpoint values round normally", () => {
    expect(roundTotalDegrees(39.1234949)).toBe(F(39.12349));
  });
});

describe("planarDistanceMinutes - sqrt(Δlat² + Δlng²) × 60, float32", () => {
  it("(39.123,-84.456) to (39.130,-84.460) -> 0.4836685061454773", () => {
    const d = planarDistanceMinutes(F(39.123), F(-84.456), F(39.13), F(-84.46));
    expect(d).toBe(0.4836685061454773);
  });

  it("identical points -> 0", () => {
    const d = planarDistanceMinutes(F(39.12345), F(-84.45678), F(39.12345), F(-84.45678));
    expect(d).toBe(0);
  });

  it("is symmetric in argument order", () => {
    const a = planarDistanceMinutes(F(39.123), F(-84.456), F(39.13), F(-84.46));
    const b = planarDistanceMinutes(F(39.13), F(-84.46), F(39.123), F(-84.456));
    expect(a).toBe(b);
  });
});
