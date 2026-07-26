// Synthetic unit tests for web/lib/merge/derived.ts: edge cases (missing/
// unspecified inputs, boundary values) and the `lastMeasurementOf`/
// `recalculateTreeProperties` aggregation semantics (doc 05 §P3-01's third
// bullet: "synthetic unit tests for edge cases"). Real-data mini-parity
// lives in derived-parity.test.ts.

import { describe, expect, it } from "vitest";
import {
  calculateAbbreviatedChampionPoints,
  calculateChampionPoints,
  calculateConicalVolume,
  calculateDerivedValues,
  calculateDiameterFeet,
  calculateEntspts,
  calculateEntspts2,
  calculateTreeCalculatedCoordinates,
  calculateTreeCoordinates,
  lastMeasurementOf,
  recalculateTreeProperties,
  type DerivedValueInput,
  type RecalculatableMeasurement,
} from "./derived";

const UNSPECIFIED = 1;
const INVALID = 0;
const DEFAULT = 2;

function input(overrides: Partial<DerivedValueInput> = {}): DerivedValueInput {
  return {
    height: 100,
    heightInputFormat: DEFAULT,
    girth: 10,
    girthInputFormat: DEFAULT,
    crownSpread: 30,
    crownSpreadInputFormat: DEFAULT,
    ...overrides,
  };
}

describe("calculateDiameterFeet", () => {
  it("computes Girth.Feet / pi when girth is specified", () => {
    const result = calculateDiameterFeet(input({ girth: 10, girthInputFormat: DEFAULT }));
    expect(result.inputFormat).toBe(DEFAULT);
    expect(Math.fround(result.feet)).toBe(Math.fround(10 / Math.PI));
  });

  it("returns Distance.Null() (0, Unspecified) when girth is unspecified", () => {
    const result = calculateDiameterFeet(input({ girth: 0, girthInputFormat: UNSPECIFIED }));
    expect(result).toEqual({ feet: 0, inputFormat: UNSPECIFIED });
  });

  it("still computes when girth is 0 but explicitly specified (Default format) -- 0 is not the same as unspecified", () => {
    const result = calculateDiameterFeet(input({ girth: 0, girthInputFormat: DEFAULT }));
    expect(result).toEqual({ feet: 0, inputFormat: DEFAULT });
  });

  it("Invalid(0) format still counts as specified (doc 01 §7: 'Invalid counts as specified')", () => {
    const result = calculateDiameterFeet(input({ girth: 5, girthInputFormat: INVALID }));
    expect(result.inputFormat).toBe(DEFAULT);
    expect(Math.fround(result.feet)).toBe(Math.fround(5 / Math.PI));
  });

  it("does not depend on height at all", () => {
    const withHeight = calculateDiameterFeet(input({ height: 100, girth: 8 }));
    const unspecifiedHeight = calculateDiameterFeet(input({ height: 0, heightInputFormat: UNSPECIFIED, girth: 8 }));
    expect(withHeight).toEqual(unspecifiedHeight);
  });
});

describe("calculateEntspts", () => {
  it("computes Height.Feet * Girth.Feet when both specified", () => {
    const result = calculateEntspts(input({ height: 50, girth: 4 }));
    expect(result).toBe(200);
  });

  it("null when height is unspecified", () => {
    expect(calculateEntspts(input({ heightInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("null when girth is unspecified", () => {
    expect(calculateEntspts(input({ girthInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("null when both are unspecified", () => {
    expect(calculateEntspts(input({ heightInputFormat: UNSPECIFIED, girthInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("boundary: zero-but-specified height/girth compute to 0, not null", () => {
    const result = calculateEntspts(input({ height: 0, heightInputFormat: DEFAULT, girth: 0, girthInputFormat: DEFAULT }));
    expect(result).toBe(0);
  });
});

describe("calculateEntspts2", () => {
  it("computes Height.Feet * Girth.Feet^2 / 100", () => {
    const result = calculateEntspts2(input({ height: 50, girth: 4 }));
    // 50 * 16 / 100 = 8
    expect(result).toBe(8);
  });

  it("null when either input unspecified", () => {
    expect(calculateEntspts2(input({ heightInputFormat: UNSPECIFIED }))).toBeNull();
    expect(calculateEntspts2(input({ girthInputFormat: UNSPECIFIED }))).toBeNull();
  });
});

describe("calculateConicalVolume", () => {
  it("computes pi * r^2 * h / 3 with r = girth/pi/2", () => {
    const result = calculateConicalVolume(input({ height: 30, girth: 10 }));
    const radius = 10 / Math.PI / 2;
    const expected = Math.fround((Math.pow(radius, 2) * Math.PI * 30) / 3);
    expect(result.inputFormat).toBe(DEFAULT);
    expect(Math.fround(result.cubicFeet)).toBe(expected);
  });

  it("Volume.Null() (0, Unspecified) when height unspecified", () => {
    const result = calculateConicalVolume(input({ heightInputFormat: UNSPECIFIED }));
    expect(result).toEqual({ cubicFeet: 0, inputFormat: UNSPECIFIED });
  });

  it("Volume.Null() (0, Unspecified) when girth unspecified", () => {
    const result = calculateConicalVolume(input({ girthInputFormat: UNSPECIFIED }));
    expect(result).toEqual({ cubicFeet: 0, inputFormat: UNSPECIFIED });
  });

  it("zero height with specified format yields zero volume, not Unspecified", () => {
    const result = calculateConicalVolume(input({ height: 0, heightInputFormat: DEFAULT }));
    expect(result).toEqual({ cubicFeet: 0, inputFormat: DEFAULT });
  });
});

describe("calculateChampionPoints", () => {
  it("computes Girth.Inches + Height.Feet + CrownSpread.Feet/4", () => {
    // girth=10 -> inches=120; height=50; crownSpread=40 -> /4=10
    const result = calculateChampionPoints(input({ height: 50, girth: 10, crownSpread: 40 }));
    expect(result).toBe(180);
  });

  it("null when girth unspecified", () => {
    expect(calculateChampionPoints(input({ girthInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("null when height unspecified", () => {
    expect(calculateChampionPoints(input({ heightInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("null when crown spread unspecified (unlike abbreviated champion points)", () => {
    expect(calculateChampionPoints(input({ crownSpreadInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("boundary: all-zero-but-specified inputs compute to 0", () => {
    const result = calculateChampionPoints(
      input({ height: 0, heightInputFormat: DEFAULT, girth: 0, girthInputFormat: DEFAULT, crownSpread: 0, crownSpreadInputFormat: DEFAULT }),
    );
    expect(result).toBe(0);
  });
});

describe("calculateAbbreviatedChampionPoints", () => {
  it("computes Girth.Inches + Height.Feet (no crown spread term)", () => {
    const result = calculateAbbreviatedChampionPoints(input({ height: 50, girth: 10 }));
    expect(result).toBe(170); // 120 + 50
  });

  it("does NOT require crown spread to be specified", () => {
    const result = calculateAbbreviatedChampionPoints(
      input({ height: 50, girth: 10, crownSpreadInputFormat: UNSPECIFIED }),
    );
    expect(result).toBe(170);
  });

  it("null when girth unspecified", () => {
    expect(calculateAbbreviatedChampionPoints(input({ girthInputFormat: UNSPECIFIED }))).toBeNull();
  });

  it("null when height unspecified", () => {
    expect(calculateAbbreviatedChampionPoints(input({ heightInputFormat: UNSPECIFIED }))).toBeNull();
  });
});

describe("calculateDerivedValues (RecalculateProperties bundle)", () => {
  it("bundles all six derived values", () => {
    const result = calculateDerivedValues(input({ height: 50, girth: 10, crownSpread: 40 }));
    expect(result.entspts).toBe(500);
    expect(result.entspts2).toBe(50);
    expect(result.championPoints).toBe(180);
    expect(result.abbreviatedChampionPoints).toBe(170);
    expect(result.diameter.inputFormat).toBe(DEFAULT);
    expect(result.conicalVolume.inputFormat).toBe(DEFAULT);
  });

  it("all unspecified -> nulls/zeros throughout", () => {
    const result = calculateDerivedValues(
      input({ heightInputFormat: UNSPECIFIED, girthInputFormat: UNSPECIFIED, crownSpreadInputFormat: UNSPECIFIED }),
    );
    expect(result.entspts).toBeNull();
    expect(result.entspts2).toBeNull();
    expect(result.championPoints).toBeNull();
    expect(result.abbreviatedChampionPoints).toBeNull();
    expect(result.diameter).toEqual({ feet: 0, inputFormat: UNSPECIFIED });
    expect(result.conicalVolume).toEqual({ cubicFeet: 0, inputFormat: UNSPECIFIED });
  });
});

// ---------------------------------------------------------------------------
// lastMeasurementOf / Tree.RecalculateProperties aggregation
// ---------------------------------------------------------------------------

function measurement(overrides: Partial<RecalculatableMeasurement> = {}): RecalculatableMeasurement {
  return {
    measured: "2020-01-01",
    commonName: "White Oak",
    scientificName: "Quercus alba",
    height: 100,
    heightInputFormat: DEFAULT,
    heightMeasurementMethod: 1,
    girth: 10,
    girthInputFormat: DEFAULT,
    crownSpread: 30,
    crownSpreadInputFormat: DEFAULT,
    latitude: 40,
    latitudeInputFormat: DEFAULT,
    longitude: -80,
    longitudeInputFormat: DEFAULT,
    calculatedLatitude: 40,
    calculatedLatitudeInputFormat: DEFAULT,
    calculatedLongitude: -80,
    calculatedLongitudeInputFormat: DEFAULT,
    elevation: 500,
    elevationInputFormat: DEFAULT,
    diameter: 3.18,
    diameterInputFormat: DEFAULT,
    entspts: 1000,
    conicalVolume: 50,
    conicalVolumeInputFormat: DEFAULT,
    entspts2: 100,
    championPoints: 200,
    abbreviatedChampionPoints: 180,
    measurers: [],
    ...overrides,
  };
}

describe("lastMeasurementOf", () => {
  it("throws on an empty array (matches LINQ .Last() on an empty sequence)", () => {
    expect(() => lastMeasurementOf([])).toThrow();
  });

  it("returns the only measurement in a singleton array", () => {
    const m = measurement({ measured: "2020-01-01" });
    expect(lastMeasurementOf([m])).toBe(m);
  });

  it("picks the measurement with the latest Measured date, regardless of array position", () => {
    const early = measurement({ measured: "2019-01-01" });
    const late = measurement({ measured: "2021-06-15" });
    const middle = measurement({ measured: "2020-03-01" });
    expect(lastMeasurementOf([late, early, middle])).toBe(late);
    expect(lastMeasurementOf([early, middle, late])).toBe(late);
  });

  it("tie-break on equal dates: the LAST same-dated measurement in input array order wins (stable orderby + .Last())", () => {
    const firstInArray = measurement({ measured: "2020-01-01", commonName: "First" });
    const secondInArray = measurement({ measured: "2020-01-01", commonName: "Second" });
    const thirdInArray = measurement({ measured: "2020-01-01", commonName: "Third" });
    const result = lastMeasurementOf([firstInArray, secondInArray, thirdInArray]);
    expect(result).toBe(thirdInArray);
  });

  it("tie-break with an earlier-dated measurement interleaved: still the last SAME-MAX-DATE entry by array order", () => {
    const older = measurement({ measured: "2019-01-01", commonName: "Older" });
    const tieA = measurement({ measured: "2020-01-01", commonName: "TieA" });
    const tieB = measurement({ measured: "2020-01-01", commonName: "TieB" });
    expect(lastMeasurementOf([tieA, older, tieB])).toBe(tieB);
  });

  it("accepts Date objects as well as date strings", () => {
    const early = measurement({ measured: new Date("2019-01-01") });
    const late = measurement({ measured: new Date("2021-01-01") });
    expect(lastMeasurementOf([early, late])).toBe(late);
  });
});

describe("calculateTreeCoordinates (Tree.CalculateCoordinates)", () => {
  it("uses the most recent measurement with specified coordinates, not necessarily the last measurement", () => {
    const withCoords = measurement({
      measured: "2019-01-01",
      latitude: 40,
      latitudeInputFormat: DEFAULT,
      longitude: -80,
      longitudeInputFormat: DEFAULT,
    });
    const laterNoCoords = measurement({
      measured: "2021-01-01",
      latitude: 0,
      latitudeInputFormat: UNSPECIFIED,
      longitude: 0,
      longitudeInputFormat: UNSPECIFIED,
    });
    const result = calculateTreeCoordinates([withCoords, laterNoCoords]);
    expect(result).toEqual({ latitude: 40, latitudeInputFormat: DEFAULT, longitude: -80, longitudeInputFormat: DEFAULT });
  });

  it("Coordinates.Null() (0/0, both Unspecified) when no measurement has specified coordinates", () => {
    const m1 = measurement({ latitudeInputFormat: UNSPECIFIED, longitudeInputFormat: UNSPECIFIED });
    const m2 = measurement({ latitudeInputFormat: UNSPECIFIED, longitudeInputFormat: UNSPECIFIED });
    const result = calculateTreeCoordinates([m1, m2]);
    expect(result).toEqual({ latitude: 0, latitudeInputFormat: UNSPECIFIED, longitude: 0, longitudeInputFormat: UNSPECIFIED });
  });

  it("Coordinates.IsSpecified is OR, not AND: only latitude specified still counts", () => {
    const onlyLat = measurement({
      measured: "2020-01-01",
      latitude: 40,
      latitudeInputFormat: DEFAULT,
      longitude: 0,
      longitudeInputFormat: UNSPECIFIED,
    });
    const result = calculateTreeCoordinates([onlyLat]);
    expect(result).toEqual({ latitude: 40, latitudeInputFormat: DEFAULT, longitude: 0, longitudeInputFormat: UNSPECIFIED });
  });

  it("Coordinates.IsSpecified is OR, not AND: only longitude specified still counts", () => {
    const onlyLng = measurement({
      measured: "2020-01-01",
      latitude: 0,
      latitudeInputFormat: UNSPECIFIED,
      longitude: -80,
      longitudeInputFormat: DEFAULT,
    });
    const result = calculateTreeCoordinates([onlyLng]);
    expect(result).toEqual({ latitude: 0, latitudeInputFormat: UNSPECIFIED, longitude: -80, longitudeInputFormat: DEFAULT });
  });
});

describe("calculateTreeCalculatedCoordinates (Tree.CalculateCalculatedCoordinates)", () => {
  it("mirrors calculateTreeCoordinates but over the calculated* columns", () => {
    const m1 = measurement({
      measured: "2019-01-01",
      calculatedLatitude: 41,
      calculatedLatitudeInputFormat: DEFAULT,
      calculatedLongitude: -81,
      calculatedLongitudeInputFormat: DEFAULT,
    });
    const m2 = measurement({
      measured: "2021-01-01",
      calculatedLatitudeInputFormat: UNSPECIFIED,
      calculatedLongitudeInputFormat: UNSPECIFIED,
    });
    const result = calculateTreeCalculatedCoordinates([m1, m2]);
    expect(result).toEqual({ latitude: 41, latitudeInputFormat: DEFAULT, longitude: -81, longitudeInputFormat: DEFAULT });
  });
});

describe("recalculateTreeProperties (Tree.RecalculateProperties)", () => {
  it("copies scalar headline values from the last measurement", () => {
    const first = measurement({
      measured: "2015-01-01",
      commonName: "Old Name",
      scientificName: "Old Sci",
      height: 10,
      girth: 1,
      crownSpread: 2,
      elevation: 100,
      diameter: 0.3,
      entspts: 10,
      conicalVolume: 1,
      entspts2: 1,
      championPoints: 5,
      abbreviatedChampionPoints: 4,
    });
    const last = measurement({
      measured: "2022-06-01",
      commonName: "New Name",
      scientificName: "New Sci",
      height: 120,
      heightInputFormat: DEFAULT,
      heightMeasurementMethod: 3,
      girth: 15,
      crownSpread: 45,
      elevation: 600,
      diameter: 4.77,
      entspts: 1800,
      conicalVolume: 300,
      entspts2: 270,
      championPoints: 400,
      abbreviatedChampionPoints: 300,
    });
    const result = recalculateTreeProperties([first, last]);
    expect(result.lastMeasured).toBe("2022-06-01");
    expect(result.commonName).toBe("New Name");
    expect(result.scientificName).toBe("New Sci");
    expect(result.height).toBe(120);
    expect(result.heightMeasurementMethod).toBe(3);
    expect(result.girth).toBe(15);
    expect(result.crownSpread).toBe(45);
    expect(result.elevation).toBe(600);
    expect(result.diameter).toBe(4.77);
    expect(result.entspts).toBe(1800);
    expect(result.conicalVolume).toBe(300);
    expect(result.entspts2).toBe(270);
    expect(result.championPoints).toBe(400);
    expect(result.abbreviatedChampionPoints).toBe(300);
  });

  it("measurementCount equals the number of measurements", () => {
    const result = recalculateTreeProperties([measurement(), measurement(), measurement()]);
    expect(result.measurementCount).toBe(3);
  });

  it("dedups measurers by exact FirstName+LastName across ALL measurements, in measurement-array (not date) order", () => {
    const later = measurement({
      measured: "2021-01-01",
      measurers: [{ firstName: "Bob", lastName: "Smith" }],
    });
    const earlier = measurement({
      measured: "2019-01-01",
      measurers: [
        { firstName: "Alice", lastName: "Jones" },
        { firstName: "Bob", lastName: "Smith" }, // duplicate of later's measurer
      ],
    });
    // Array order is [later, earlier] -- date order is reversed -- Measurers
    // dedup has no `orderby`, so it must follow ARRAY order, not date order.
    const result = recalculateTreeProperties([later, earlier]);
    expect(result.measurers).toEqual([
      { firstName: "Bob", lastName: "Smith" },
      { firstName: "Alice", lastName: "Jones" },
    ]);
  });

  it("measurer name matching is exact (case-sensitive), matching Name.Equals", () => {
    const m1 = measurement({ measured: "2020-01-01", measurers: [{ firstName: "Bob", lastName: "Smith" }] });
    const m2 = measurement({ measured: "2020-02-01", measurers: [{ firstName: "bob", lastName: "smith" }] });
    const result = recalculateTreeProperties([m1, m2]);
    expect(result.measurers).toHaveLength(2);
  });

  it("throws when given an empty measurements array", () => {
    expect(() => recalculateTreeProperties([])).toThrow();
  });

  it("coordinates come from CalculateCoordinates (last WITH specified coords), not blindly from the last measurement", () => {
    const withCoords = measurement({ measured: "2018-01-01", latitude: 12, latitudeInputFormat: DEFAULT, longitude: 34, longitudeInputFormat: DEFAULT });
    const lastNoCoords = measurement({ measured: "2023-01-01", latitudeInputFormat: UNSPECIFIED, longitudeInputFormat: UNSPECIFIED });
    const result = recalculateTreeProperties([withCoords, lastNoCoords]);
    expect(result.latitude).toBe(12);
    expect(result.longitude).toBe(34);
    // But the headline scalar fields still come from lastNoCoords (the true last measurement).
    expect(result.lastMeasured).toBe("2023-01-01");
  });
});
