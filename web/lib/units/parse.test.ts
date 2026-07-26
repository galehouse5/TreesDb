// Tests for ./parse.ts -- see that file's header for the legacy source
// citations (TMD.Model/ValueObjects/{Distance,Elevation,Volume,Angle}.cs).
//
// Coverage: every legacy-accepted regex pattern (at least one vector each,
// plus whitespace-tolerance variants), the Unspecified/Invalid cases,
// InputFormat codes, float32 exactness, format(parse(x)) round-trips with
// the existing ./format.ts formatters, and a scraped-vector suite built
// from real production (value, input_format) pairs in `tree_measurements`
// -- mirroring format.scraped.test.ts's approach (parse(format(value, fmt))
// round-trips value+fmt), since no raw legacy input text is retained in
// the database to scrape directly.

import { describe, expect, it } from "vitest";
import {
  AngleFormat,
  DistanceFormat,
  ElevationFormat,
  VolumeFormat,
  parseAngle,
  parseDistance,
  parseElevation,
  parseVolume,
} from "./parse";
import { distanceSubunit, formatDistance, formatElevation, Units } from "./format";
import { fround } from "./float32";

const F = Math.fround;

// =============================================================================
// Distance
// =============================================================================

describe("parseDistance - Unspecified / Invalid", () => {
  it.each(["", "   ", "\t\n"])("blank %j -> Unspecified(1), 0", (input) => {
    expect(parseDistance(input)).toEqual({ feet: 0, inputFormat: DistanceFormat.Unspecified });
  });

  it.each(["abc", "twelve feet", "12/6", "--5", "5 furlongs", "12'6\"extra"])(
    "unparseable %j -> Invalid(0), 0",
    (input) => {
      expect(parseDistance(input)).toEqual({ feet: 0, inputFormat: DistanceFormat.Invalid });
    },
  );

  it("Invalid counts as specified downstream (doc 01 §7) -- format is 0, not 1", () => {
    const result = parseDistance("nonsense");
    expect(result.inputFormat).not.toBe(DistanceFormat.Unspecified);
  });
});

describe("parseDistance - FeetDecimalInches (Distance.cs:124)", () => {
  it.each([
    ["12' 6''", 12.5],
    ["12'6''", 12.5],
    ["12 6", 12.5], // bare-whitespace separator is a legal FeetDecimalInches delimiter
    ["12ft 6in", 12.5],
    ["12 feet 6 inches", 12.5],
    ["12` 6``", 12.5],
    ["12' 6\"", 12.5],
    ["  12'   6''  ", 12.5], // whitespace tolerance
    ["12' 6", 12.5], // trailing inch-unit suffix is optional
    ["0' 6''", 0.5],
  ])("%j -> %d ft, FeetDecimalInches(3)", (input, expectedFeet) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.FeetDecimalInches);
    expect(result.feet).toBe(F(expectedFeet));
  });

  it("float32 exactness: 12' 6'' -> fround(12 + fround(6/12))", () => {
    expect(parseDistance("12' 6''").feet).toBe(F(12 + F(6 / F(12))));
  });
});

describe("parseDistance - DecimalFeet (Distance.cs:125)", () => {
  it.each([
    ["12.5", 12.5],
    ["12.5'", 12.5],
    ["12 ft", 12],
    ["12ft", 12],
    ["12 feet", 12],
    ["12 feets", 12], // legacy regex literally allows the "feets" plural typo
    ["12 foot", 12],
    ["12 foots", 12],
    ["  12.5  ", 12.5],
    ["0", 0],
  ])("%j -> %d ft, DecimalFeet(4)", (input, expectedFeet) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.DecimalFeet);
    expect(result.feet).toBe(F(expectedFeet));
  });
});

describe("parseDistance - DecimalInches (Distance.cs:126)", () => {
  it.each([
    ["6\"", 0.5],
    ["6''", 0.5],
    ["6``", 0.5],
    ["6 in", 0.5],
    ["6in", 0.5],
    ["6 inches", 0.5],
    ["6 inchs", 0.5], // legacy regex's "inchs?" typo-tolerant alternative
  ])("%j -> %d ft, DecimalInches(5)", (input, expectedFeet) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.DecimalInches);
    expect(result.feet).toBe(F(expectedFeet));
  });
});

describe("parseDistance - DecimalMeters (Distance.cs:127)", () => {
  it.each([
    ["40 m", F(40 * F(3.2808399))],
    ["40m", F(40 * F(3.2808399))],
    ["40 meters", F(40 * F(3.2808399))],
    ["40 metres", F(40 * F(3.2808399))],
  ])("%j -> %d ft, DecimalMeters(6)", (input, expectedFeet) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.DecimalMeters);
    expect(result.feet).toBe(expectedFeet);
  });

  it("float32 exactness: 40 m -> fround(fround(40) * fround(3.2808399))", () => {
    expect(parseDistance("40 m").feet).toBe(131.2335968017578);
  });
});

describe("parseDistance - DecimalYards (Distance.cs:128)", () => {
  it.each([
    ["13 yd", 39],
    ["13yd", 39],
    ["13 yds", 39],
    ["13 yards", 39],
    ["13y", 39],
  ])("%j -> %d ft, DecimalYards(7)", (input, expectedFeet) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.DecimalYards);
    expect(result.feet).toBe(F(expectedFeet));
  });
});

describe("parseDistance - DecimalCentimeters (Distance.cs:129, fixed per ground rules §3)", () => {
  it.each([
    ["500 cm", 500],
    ["500cm", 500],
    ["500 centimeters", 500],
    ["500 centimeter", 500],
  ])("%j -> ft equivalent of %d cm, DecimalCentimeters(8)", (input, cm) => {
    const result = parseDistance(input);
    expect(result.inputFormat).toBe(DistanceFormat.DecimalCentimeters);
    expect(result.feet).toBe(F(F(cm / 100) * F(3.2808399)));
  });

  it("does not throw (legacy crashes with an unhandled FormatException here)", () => {
    expect(() => parseDistance("12 cm")).not.toThrow();
  });
});

describe("parseDistance - order-dependence", () => {
  it("a bare two-number input is FeetDecimalInches, not two DecimalFeet matches", () => {
    // "12 6" cannot match DecimalFeetFormat (single-number + $ anchor), so
    // this exercises that FeetDecimalInches is tried first and succeeds.
    expect(parseDistance("12 6").inputFormat).toBe(DistanceFormat.FeetDecimalInches);
  });
});

describe("parseDistance - round-trip with ./format.ts", () => {
  it("DecimalFeet: format(parse(x), Units.Feet) is stable", () => {
    const parsed = parseDistance("123.5");
    expect(formatDistance(parsed.feet, Units.Feet)).toBe("123.5'");
  });

  it("DecimalMeters: parse(format(feet, Units.Meters)) round-trips to 2dp precision", () => {
    const feet = F(200);
    const formatted = formatDistance(feet, Units.Meters); // "60.96 m"
    const reparsed = parseDistance(formatted);
    expect(reparsed.inputFormat).toBe(DistanceFormat.DecimalMeters);
    expect(formatDistance(reparsed.feet, Units.Meters)).toBe(formatted);
  });

  it("DecimalInches: parse(distanceSubunit(feet, Units.Feet)) round-trips", () => {
    const feet = F(5.5);
    const formatted = distanceSubunit(feet, Units.Feet); // "66''"
    const reparsed = parseDistance(formatted);
    expect(reparsed.inputFormat).toBe(DistanceFormat.DecimalInches);
    expect(distanceSubunit(reparsed.feet, Units.Feet)).toBe(formatted);
  });
});

// =============================================================================
// Elevation
// =============================================================================

describe("parseElevation - Unspecified / Invalid", () => {
  it("blank -> Unspecified(1), 0", () => {
    expect(parseElevation("  ")).toEqual({ feet: 0, inputFormat: ElevationFormat.Unspecified });
  });

  it("unparseable -> Invalid(0), 0", () => {
    expect(parseElevation("high up")).toEqual({ feet: 0, inputFormat: ElevationFormat.Invalid });
  });

  it("Elevation has no feet-inches or cm sub-formats (unlike Distance)", () => {
    expect(parseElevation("12' 6''").inputFormat).toBe(ElevationFormat.Invalid);
    expect(parseElevation("500 cm").inputFormat).toBe(ElevationFormat.Invalid);
  });
});

describe("parseElevation - DecimalFeet (Elevation.cs:123)", () => {
  it.each([
    ["5280", 5280],
    ["5280'", 5280],
    ["5280 ft", 5280],
    ["5280 feet", 5280],
    ["  5280  ", 5280],
  ])("%j -> %d ft, DecimalFeet(3)", (input, expectedFeet) => {
    const result = parseElevation(input);
    expect(result.inputFormat).toBe(ElevationFormat.DecimalFeet);
    expect(result.feet).toBe(F(expectedFeet));
  });
});

describe("parseElevation - DecimalMeters (Elevation.cs:124)", () => {
  it.each([
    ["500 m", F(F(500) * F(3.2808399))],
    ["500m", F(F(500) * F(3.2808399))],
    ["500 meters", F(F(500) * F(3.2808399))],
    ["500 metres", F(F(500) * F(3.2808399))],
  ])("%j -> %d ft, DecimalMeters(4)", (input, expectedFeet) => {
    const result = parseElevation(input);
    expect(result.inputFormat).toBe(ElevationFormat.DecimalMeters);
    expect(result.feet).toBe(expectedFeet);
  });
});

describe("parseElevation - DecimalYards (Elevation.cs:125)", () => {
  it.each([
    ["100 yd", 300],
    ["100 yards", 300],
    ["100y", 300],
  ])("%j -> %d ft, DecimalYards(5)", (input, expectedFeet) => {
    const result = parseElevation(input);
    expect(result.inputFormat).toBe(ElevationFormat.DecimalYards);
    expect(result.feet).toBe(F(expectedFeet));
  });
});

describe("parseElevation - round-trip with ./format.ts", () => {
  it("DecimalFeet: format(parse(x), Units.Feet) is stable", () => {
    expect(formatElevation(parseElevation("5280").feet, Units.Feet)).toBe("5280.0 ft");
  });

  it("DecimalMeters: parse(format(feet, Units.Meters)) round-trips", () => {
    const feet = F(1000);
    const formatted = formatElevation(feet, Units.Meters);
    const reparsed = parseElevation(formatted);
    expect(reparsed.inputFormat).toBe(ElevationFormat.DecimalMeters);
    expect(formatElevation(reparsed.feet, Units.Meters)).toBe(formatted);
  });
});

// =============================================================================
// Volume
// =============================================================================

describe("parseVolume - Unspecified / Invalid", () => {
  it("blank -> Unspecified(1), 0", () => {
    expect(parseVolume("")).toEqual({ cubicFeet: 0, inputFormat: VolumeFormat.Unspecified });
  });

  it("unparseable -> Invalid(0), 0", () => {
    expect(parseVolume("a lot")).toEqual({ cubicFeet: 0, inputFormat: VolumeFormat.Invalid });
  });

  it("bare number with NO suffix is only valid for cubic feet (meters/yards require a suffix)", () => {
    expect(parseVolume("25.5").inputFormat).toBe(VolumeFormat.DecimalCubicFeet);
  });
});

describe("parseVolume - DecimalCubicFeet (Volume.cs:123)", () => {
  it.each([
    ["25.5", 25.5],
    ["25.5 cu ft", 25.5],
    ["25.5cu ft", 25.5],
    ["25.5 ft^3", 25.5],
    ["25.5 cubic feet", 25.5],
    ["25.5 cubic ft", 25.5],
  ])("%j -> %d ft^3, DecimalCubicFeet(3)", (input, expected) => {
    const result = parseVolume(input);
    expect(result.inputFormat).toBe(VolumeFormat.DecimalCubicFeet);
    expect(result.cubicFeet).toBe(F(expected));
  });
});

describe("parseVolume - DecimalCubicMeters (Volume.cs:124, suffix required)", () => {
  it.each(["10 cu m", "10cu m", "10 m^3", "10 cubic meters", "10 cubic m"])(
    "%j -> DecimalCubicMeters(4)",
    (input) => {
      const result = parseVolume(input);
      expect(result.inputFormat).toBe(VolumeFormat.DecimalCubicMeters);
      expect(result.cubicFeet).toBe(F(F(10) / F(0.0283168466)));
    },
  );

  it("no suffix -> falls through to DecimalCubicFeet, not Invalid", () => {
    // Confirms the meters/yards suffix is mandatory (unlike feet's optional suffix).
    expect(parseVolume("10").inputFormat).toBe(VolumeFormat.DecimalCubicFeet);
  });
});

describe("parseVolume - DecimalCubicYards (Volume.cs:125, suffix required)", () => {
  it.each(["10 cu yds", "10 yds^3", "10 cubic yards", "10 cubic yds"])(
    "%j -> DecimalCubicYards(5)",
    (input) => {
      const result = parseVolume(input);
      expect(result.inputFormat).toBe(VolumeFormat.DecimalCubicYards);
      expect(result.cubicFeet).toBe(F(F(10) / F(0.037037037)));
    },
  );
});

// =============================================================================
// Angle
// =============================================================================

describe("parseAngle - Unspecified / Invalid", () => {
  it("blank -> Unspecified(1), 0", () => {
    expect(parseAngle("   ")).toEqual({ degrees: 0, inputFormat: AngleFormat.Unspecified });
  });

  it.each(["abc", "12deg", "+", "-", ".", "1.2.3"])("unparseable %j -> Invalid(0), 0", (input) => {
    expect(parseAngle(input)).toEqual({ degrees: 0, inputFormat: AngleFormat.Invalid });
  });
});

describe("parseAngle - Decimal (Angle.cs:65, float.TryParse)", () => {
  it.each([
    ["45", 45],
    ["45.5", 45.5],
    ["  45.5  ", 45.5], // trimmed before TryParse
    ["+45.5", 45.5],
    ["-12.5", -12.5], // Create() itself has no range check; validation is separate
    [".5", 0.5],
    ["5.", 5],
    ["1e1", 10],
    ["1.5E1", 15],
  ])("%j -> %d degrees, Decimal(3)", (input, expected) => {
    const result = parseAngle(input);
    expect(result.inputFormat).toBe(AngleFormat.Decimal);
    expect(result.degrees).toBe(F(expected));
  });

  it("thousands separator (NumberStyles.AllowThousands) is stripped, not rejected", () => {
    expect(parseAngle("1,234.5")).toEqual({ degrees: F(1234.5), inputFormat: AngleFormat.Decimal });
  });

  it("float32 exactness", () => {
    expect(parseAngle("30.335").degrees).toBe(fround(30.335));
  });
});

// =============================================================================
// Scraped oracle vectors -- production (value, input_format) pairs from
// tree_measurements (psql -h localhost -U postgres -d treesdb), 2026-07-18.
// No raw legacy input text is retained in the DB, so instead of scraping
// exact strings (as format.scraped.test.ts does) this renders each stored
// value through the paired existing ./format.ts formatter for its
// InputFormat and asserts parseDistance/parseElevation round-trips both
// the value and the format code -- volume has no non-Default production
// input_format (every stored value was computed, never typed) so it has no
// oracle rows here.
// =============================================================================

describe("parseDistance - scraped oracle (tree_measurements.height)", () => {
  it.each([
    [42.3, DistanceFormat.DecimalFeet],
    [40.2, DistanceFormat.DecimalFeet],
    [44.3, DistanceFormat.DecimalFeet],
    [100.3937, DistanceFormat.DecimalMeters],
    [96.456696, DistanceFormat.DecimalMeters],
    [118.11024, DistanceFormat.DecimalMeters],
    [6.6666665, DistanceFormat.DecimalInches],
    [8, DistanceFormat.DecimalInches],
    [1.0333333, DistanceFormat.DecimalInches],
  ])("height=%d input_format=%d round-trips through format.ts", (rawFeet, format) => {
    const feet = fround(rawFeet);
    const units =
      format === DistanceFormat.DecimalMeters
        ? Units.Meters
        : format === DistanceFormat.DecimalInches
          ? Units.Feet // DecimalInches pairs with distanceSubunit(_, Units.Feet)
          : Units.Feet;
    const formatted =
      format === DistanceFormat.DecimalInches ? distanceSubunit(feet, units) : formatDistance(feet, units);
    const reparsed = parseDistance(formatted);
    expect(reparsed.inputFormat).toBe(format);
    // Round-trip through the SAME formatter must be stable (the formatter
    // only carries finite decimal precision, so we compare re-rendered
    // strings rather than raw floats -- exactly format.scraped.test.ts's
    // implicit contract).
    const reformatted =
      format === DistanceFormat.DecimalInches
        ? distanceSubunit(reparsed.feet, units)
        : formatDistance(reparsed.feet, units);
    expect(reformatted).toBe(formatted);
  });
});

describe("parseElevation - scraped oracle (tree_measurements.elevation)", () => {
  it.each([
    [1008, ElevationFormat.DecimalFeet],
    [973, ElevationFormat.DecimalFeet],
    [965, ElevationFormat.DecimalFeet],
    [4822.8345, ElevationFormat.DecimalMeters],
    [2624.6719, ElevationFormat.DecimalMeters],
  ])("elevation=%d input_format=%d round-trips through format.ts", (rawFeet, format) => {
    const feet = fround(rawFeet);
    const units = format === ElevationFormat.DecimalMeters ? Units.Meters : Units.Feet;
    const formatted = formatElevation(feet, units);
    const reparsed = parseElevation(formatted);
    expect(reparsed.inputFormat).toBe(format);
    expect(formatElevation(reparsed.feet, units)).toBe(formatted);
  });
});
