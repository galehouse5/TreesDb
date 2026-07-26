// Tests for ./parse-coordinates.ts -- see that file's header for legacy
// source citations (TMD.Model/ValueObjects/{Latitude,Longitude,Coordinates}.cs).
//
// Coverage: every legacy-accepted regex pattern (DMS / DDM / decimal-
// degrees, plus sign and whitespace-tolerance variants), the Unspecified/
// Invalid cases, InputFormat codes, float32 exactness (banker's-rounding
// TotalDegrees), round-trips with ../geo/coordinates.ts's formatters, the
// documented IsSpecified/InputFormat inconsistency, and a scraped-vector
// suite built from real production (value, input_format) pairs in
// tree_measurements.{latitude,longitude} -- mirroring
// format.scraped.test.ts's approach (parse(format(value, fmt)) round-trips
// value+fmt).

import { describe, expect, it } from "vitest";
import {
  CoordinatesFormat,
  parseCoordinates,
  parseLatitude,
  parseLongitude,
} from "./parse-coordinates";
import { formatLatitude, formatLongitude, type CoordinateFormat } from "../geo/coordinates";
import { fround } from "./float32";

const F = Math.fround;

// =============================================================================
// Latitude
// =============================================================================

describe("parseLatitude - Unspecified / Invalid", () => {
  it.each(["", "   ", "\t"])("blank %j -> Unspecified(1), 0", (input) => {
    expect(parseLatitude(input)).toEqual({ totalDegrees: 0, inputFormat: CoordinatesFormat.Unspecified });
  });

  it.each([
    "abc",
    "123", // 3 digits: exceeds latitude's {1,2}-digit degrees, no decimal fraction to absorb it
    "39.5 N", // legacy accepts ONLY a leading sign, never N/S letter suffixes/prefixes
    "N39.5",
    "39 07 22.8 N",
    "39,5",
  ])("unparseable %j -> Invalid(0), 0", (input) => {
    expect(parseLatitude(input)).toEqual({ totalDegrees: 0, inputFormat: CoordinatesFormat.Invalid });
  });
});

describe("parseLatitude - DecimalDegrees (Latitude.cs:68)", () => {
  it.each([
    ["39.123", 1],
    ["+39.123", 1],
    ["-39.123", -1],
    ["  39.123  ", 1],
    ["90", 1],
    ["0", 1],
  ])("%j -> DecimalDegrees(5)", (input, sign) => {
    const result = parseLatitude(input);
    expect(result.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    if (sign > 0) expect(result.totalDegrees).toBeGreaterThanOrEqual(0);
  });

  it("float32 exactness + banker's rounding: 39.123 -> 39.12300109863281", () => {
    expect(parseLatitude("39.123").totalDegrees).toBe(39.12300109863281);
  });
});

describe("parseLatitude - DegreesDecimalMinutes (Latitude.cs:67)", () => {
  it.each(["39 07.380", "  39   07.380  ", "+39 07.380"])(
    "%j -> DegreesDecimalMinutes(4), matches DecimalDegrees(39.123) exactly",
    (input) => {
      const result = parseLatitude(input);
      expect(result.inputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
      expect(result.totalDegrees).toBe(39.12300109863281);
    },
  );

  it("negative sign", () => {
    const result = parseLatitude("-39 07.380");
    expect(result.inputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
    expect(result.totalDegrees).toBe(-39.12300109863281);
  });
});

describe("parseLatitude - DegreesMinutesDecimalSeconds (Latitude.cs:66)", () => {
  it.each(["39 07 22.8", "  39  07  22.8  "])(
    "%j -> DegreesMinutesDecimalSeconds(3), matches DecimalDegrees(39.123) exactly",
    (input) => {
      const result = parseLatitude(input);
      expect(result.inputFormat).toBe(CoordinatesFormat.DegreesMinutesDecimalSeconds);
      expect(result.totalDegrees).toBe(39.12300109863281);
    },
  );

  it("integer seconds (no decimal fraction required)", () => {
    expect(parseLatitude("39 07 22").inputFormat).toBe(CoordinatesFormat.DegreesMinutesDecimalSeconds);
  });
});

describe("parseLatitude - round-trip with ../geo/coordinates.ts formatters", () => {
  const cases: CoordinateFormat[] = ["DecimalDegrees", "DegreesDecimalMinutes", "DegreesMinutesDecimalSeconds"];
  it.each(cases)("%s: parse(formatLatitude(x)) round-trips", (format) => {
    const original = F(41.31657);
    const formatted = formatLatitude(original, format);
    const reparsed = parseLatitude(formatted);
    expect(formatLatitude(reparsed.totalDegrees, format)).toBe(formatted);
  });
});

// =============================================================================
// Longitude
// =============================================================================

describe("parseLongitude - Unspecified / Invalid", () => {
  it("blank -> Unspecified(1), 0", () => {
    expect(parseLongitude("")).toEqual({ totalDegrees: 0, inputFormat: CoordinatesFormat.Unspecified });
  });

  it.each(["abc", "1234", "-84.5 W", "W84.5"])("unparseable %j -> Invalid(0), 0", (input) => {
    expect(parseLongitude(input)).toEqual({ totalDegrees: 0, inputFormat: CoordinatesFormat.Invalid });
  });
});

describe("parseLongitude - three-digit degrees (Longitude.cs uses {1,3}, unlike Latitude's {1,2})", () => {
  it("180 degrees is valid for longitude", () => {
    expect(parseLongitude("180").inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
  });

  it("-124.257 (real-world US West Coast longitude) parses as DecimalDegrees", () => {
    const result = parseLongitude("-124.257");
    expect(result.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.totalDegrees).toBeLessThan(0);
  });
});

describe("parseLongitude - DegreesDecimalMinutes with leading-zero-padded degrees", () => {
  it("-084 27.360 -> -84.45600128173828 (matches format.scraped.test.ts's -084.456 oracle pair)", () => {
    const result = parseLongitude("-084 27.360");
    expect(result.inputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
    expect(result.totalDegrees).toBe(-84.45600128173828);
  });

  it("unpadded degrees are equally valid (no leading-zero requirement in the regex)", () => {
    const result = parseLongitude("-84 27.360");
    expect(result.inputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
    expect(result.totalDegrees).toBe(-84.45600128173828);
  });
});

describe("parseLongitude - round-trip with ../geo/coordinates.ts formatters", () => {
  const cases: CoordinateFormat[] = ["DecimalDegrees", "DegreesDecimalMinutes", "DegreesMinutesDecimalSeconds"];
  it.each(cases)("%s: parse(formatLongitude(x)) round-trips", (format) => {
    const original = F(-124.25721740722656);
    const formatted = formatLongitude(original, format);
    const reparsed = parseLongitude(formatted);
    expect(formatLongitude(reparsed.totalDegrees, format)).toBe(formatted);
  });
});

// =============================================================================
// Coordinates (combined lat,long)
// =============================================================================

describe("parseCoordinates", () => {
  it("blank -> both Unspecified, isSpecified false", () => {
    const result = parseCoordinates("   ");
    expect(result.latitude.inputFormat).toBe(CoordinatesFormat.Unspecified);
    expect(result.longitude.inputFormat).toBe(CoordinatesFormat.Unspecified);
    expect(result.inputFormat).toBe(CoordinatesFormat.Unspecified);
    expect(result.isSpecified).toBe(false);
  });

  it("well-formed pair -> combined format = latitude's format", () => {
    const result = parseCoordinates("39.123, -84.456");
    expect(result.latitude.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.longitude.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.isSpecified).toBe(true);
    expect(result.latitude.totalDegrees).toBe(39.12300109863281);
  });

  it("either side Invalid -> combined Invalid", () => {
    const result = parseCoordinates("abc, -84.456");
    expect(result.inputFormat).toBe(CoordinatesFormat.Invalid);
  });

  it("no comma -> longitude defaults to empty (Unspecified)", () => {
    const result = parseCoordinates("39.123");
    expect(result.latitude.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.longitude.inputFormat).toBe(CoordinatesFormat.Unspecified);
  });

  it("documented legacy inconsistency: isSpecified (OR) vs inputFormat (AND-like) disagree", () => {
    // Latitude specified, longitude blank: IsSpecified is true (OR rule,
    // Coordinates.cs:23) but InputFormat resolves to Unspecified (AND-like
    // rule, Coordinates.cs:25-39) because longitude is unspecified.
    const result = parseCoordinates("39.123");
    expect(result.isSpecified).toBe(true);
    expect(result.inputFormat).toBe(CoordinatesFormat.Unspecified);
  });

  it("comma-only input does not throw (legacy: uncaught IndexOutOfRangeException)", () => {
    expect(() => parseCoordinates(",")).not.toThrow();
    expect(parseCoordinates(",").inputFormat).toBe(CoordinatesFormat.Invalid);
  });

  it("leading/trailing/doubled commas are stripped as empty entries", () => {
    const result = parseCoordinates(",39.123,-84.456,");
    // First non-empty part becomes latitude ("39.123"), second becomes
    // longitude ("-84.456") -- matches RemoveEmptyEntries semantics.
    expect(result.latitude.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(result.longitude.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
  });
});

// =============================================================================
// Scraped oracle vectors -- production (value, input_format) pairs from
// tree_measurements.{latitude,longitude} (psql -h localhost -U postgres -d
// treesdb), 2026-07-18. Rendered through ../geo/coordinates.ts's formatters
// (which already reproduce Latitude/Longitude.ToString(format) exactly)
// then reparsed, asserting InputFormat + a stable re-render.
// =============================================================================

describe("parseLatitude - scraped oracle (tree_measurements.latitude)", () => {
  it.each([
    [46.11172, "DegreesMinutesDecimalSeconds" as const, CoordinatesFormat.DegreesMinutesDecimalSeconds],
    [41.289, "DegreesMinutesDecimalSeconds" as const, CoordinatesFormat.DegreesMinutesDecimalSeconds],
    [41.13323, "DegreesDecimalMinutes" as const, CoordinatesFormat.DegreesDecimalMinutes],
    [41.132885, "DegreesDecimalMinutes" as const, CoordinatesFormat.DegreesDecimalMinutes],
    [41.11592, "DecimalDegrees" as const, CoordinatesFormat.DecimalDegrees],
    [41.11614, "DecimalDegrees" as const, CoordinatesFormat.DecimalDegrees],
  ])("latitude=%d format=%s round-trips through formatLatitude", (rawDegrees, coordFormat, expectedFormat) => {
    const degrees = fround(rawDegrees);
    const formatted = formatLatitude(degrees, coordFormat);
    const reparsed = parseLatitude(formatted);
    expect(reparsed.inputFormat).toBe(expectedFormat);
    expect(formatLatitude(reparsed.totalDegrees, coordFormat)).toBe(formatted);
  });
});

describe("parseLongitude - scraped oracle (tree_measurements.longitude)", () => {
  it.each([
    [-122.01828, "DegreesMinutesDecimalSeconds" as const, CoordinatesFormat.DegreesMinutesDecimalSeconds],
    [-81.57322, "DegreesMinutesDecimalSeconds" as const, CoordinatesFormat.DegreesMinutesDecimalSeconds],
    [-72.67773, "DegreesDecimalMinutes" as const, CoordinatesFormat.DegreesDecimalMinutes],
    [-81.565315, "DegreesDecimalMinutes" as const, CoordinatesFormat.DegreesDecimalMinutes],
    [-78.77487, "DecimalDegrees" as const, CoordinatesFormat.DecimalDegrees],
    [-78.77479, "DecimalDegrees" as const, CoordinatesFormat.DecimalDegrees],
  ])("longitude=%d format=%s round-trips through formatLongitude", (rawDegrees, coordFormat, expectedFormat) => {
    const degrees = fround(rawDegrees);
    const formatted = formatLongitude(degrees, coordFormat);
    const reparsed = parseLongitude(formatted);
    expect(reparsed.inputFormat).toBe(expectedFormat);
    expect(formatLongitude(reparsed.totalDegrees, coordFormat)).toBe(formatted);
  });
});
