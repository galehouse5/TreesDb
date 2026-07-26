import { describe, expect, it } from "vitest";
import {
  distanceSubunit,
  formatDistance,
  formatElevation,
  formatRuckerIndex,
  formatVolume,
  Units,
} from "./format";

// Doc 01 §7 reference outputs (verbatim), float32 arithmetic.
describe("formatDistance - doc 01 §7 reference outputs", () => {
  it("123.456 ft -> 123.5'", () => {
    expect(formatDistance(123.456, Units.Feet)).toBe("123.5'");
    expect(formatDistance(123.456, Units.Default)).toBe("123.5'");
  });

  it("123.456 ft -> 37.63 m", () => {
    expect(formatDistance(123.456, Units.Meters)).toBe("37.63 m");
  });

  it("123.456 ft -> 41.15 yd", () => {
    expect(formatDistance(123.456, Units.Yards)).toBe("41.15 yd");
  });

  it("200 ft -> 200.0'", () => {
    expect(formatDistance(200, Units.Feet)).toBe("200.0'");
  });

  it("200 ft -> 60.96 m", () => {
    expect(formatDistance(200, Units.Meters)).toBe("60.96 m");
  });

  it("200 ft -> 66.67 yd", () => {
    expect(formatDistance(200, Units.Yards)).toBe("66.67 yd");
  });
});

describe("distanceSubunit - doc 01 §7 reference outputs", () => {
  it("123.456 ft -> 1481'' (whole inches)", () => {
    expect(distanceSubunit(123.456, Units.Feet)).toBe("1481''");
    expect(distanceSubunit(123.456, Units.Yards)).toBe("1481''"); // yards also render sub-unit as inches
  });

  it("123.456 ft -> 3763 cm (whole cm, meters preference)", () => {
    expect(distanceSubunit(123.456, Units.Meters)).toBe("3763 cm");
  });
});

describe("formatElevation - constructed vectors (same conversion constants as Distance)", () => {
  it("812.3 ft -> 812.3 ft / 247.59 m / 270.77 yd", () => {
    expect(formatElevation(812.3, Units.Feet)).toBe("812.3 ft");
    expect(formatElevation(812.3, Units.Meters)).toBe("247.59 m");
    expect(formatElevation(812.3, Units.Yards)).toBe("270.77 yd");
  });

  it("0 ft -> 0.0 ft / 0.00 m / 0.00 yd", () => {
    expect(formatElevation(0, Units.Feet)).toBe("0.0 ft");
    expect(formatElevation(0, Units.Meters)).toBe("0.00 m");
    expect(formatElevation(0, Units.Yards)).toBe("0.00 yd");
  });
});

describe("formatVolume - constructed vectors (CUFT_TO_CUM=0.0283168466, CUFT_TO_CUYD=0.037037037)", () => {
  it("1000 ft³ -> 1000.0 ft³ / 28.32 m³ / 37.04 yd³", () => {
    expect(formatVolume(1000, Units.Feet)).toBe("1000.0 ft³");
    expect(formatVolume(1000, Units.Meters)).toBe("28.32 m³");
    expect(formatVolume(1000, Units.Yards)).toBe("37.04 yd³");
  });

  it("2718.5 ft³ -> 2718.5 ft³ / 76.98 m³ / 100.69 yd³", () => {
    expect(formatVolume(2718.5, Units.Feet)).toBe("2718.5 ft³");
    expect(formatVolume(2718.5, Units.Meters)).toBe("76.98 m³");
    expect(formatVolume(2718.5, Units.Yards)).toBe("100.69 yd³");
  });
});

describe("formatRuckerIndex - doc 01 §7 reference outputs (Rucker 134.82)", () => {
  it("134.82 -> 134.82 (feet, 2dp, no suffix)", () => {
    expect(formatRuckerIndex(134.82, Units.Feet)).toBe("134.82");
    expect(formatRuckerIndex(134.82, Units.Default)).toBe("134.82");
  });

  it("134.82 -> 41.093 (meters, 3dp, no suffix)", () => {
    expect(formatRuckerIndex(134.82, Units.Meters)).toBe("41.093");
  });

  it("134.82 -> 44.940 (yards, 3dp, no suffix)", () => {
    expect(formatRuckerIndex(134.82, Units.Yards)).toBe("44.940");
  });
});
