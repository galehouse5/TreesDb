// Tests for headline.ts -- the RecalculateProperties port (Tree + Site
// sides), including the case-sensitive visitor/measurer dedup and the
// photo hop-2 re-typing (5->4 site, 7->6 tree) called out in doc 05 §P3-01.
import { describe, expect, it } from "vitest";
import {
  applySiteHeadline,
  applyTreeHeadline,
  type MeasurementForHeadline,
  type VisitForHeadline,
} from "./headline";
import { CoordinatesFormat, type CoordinatesInput, PhotoReferenceType } from "./types";

const F = Math.fround;

function coord(
  latitude: number,
  latitudeInputFormat: number,
  longitude: number,
  longitudeInputFormat: number,
): CoordinatesInput {
  return {
    latitude: F(latitude),
    latitudeInputFormat: latitudeInputFormat as CoordinatesInput["latitudeInputFormat"],
    longitude: F(longitude),
    longitudeInputFormat: longitudeInputFormat as CoordinatesInput["longitudeInputFormat"],
  };
}

function nullCoord(): CoordinatesInput {
  return coord(0, CoordinatesFormat.Unspecified, 0, CoordinatesFormat.Unspecified);
}

function measurement(overrides: Partial<MeasurementForHeadline> = {}): MeasurementForHeadline {
  return {
    measured: "2020-06-01",
    commonName: "White Oak",
    scientificName: "Quercus alba",
    height: F(80),
    heightInputFormat: 2,
    heightMeasurementMethod: 1,
    girth: F(200),
    girthInputFormat: 2,
    crownSpread: F(60),
    crownSpreadInputFormat: 2,
    coordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    calculatedCoordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    elevation: F(900),
    elevationInputFormat: 2,
    measurers: [{ firstName: "Alice", lastName: "Anderson" }],
    photos: [],
    ...overrides,
  };
}

describe("applyTreeHeadline", () => {
  it("throws on an empty measurement list (Tree.LastMeasurement's .Last())", () => {
    expect(() => applyTreeHeadline([])).toThrow();
  });

  it("copies headline fields from the LAST measurement by Measured date", () => {
    const m1 = measurement({ measured: "2019-01-01", commonName: "Old Name", height: F(50) });
    const m2 = measurement({ measured: "2020-06-01", commonName: "New Name", height: F(80) });
    const result = applyTreeHeadline([m1, m2]);
    expect(result.headline.commonName).toBe("New Name");
    expect(result.headline.height).toBe(F(80));
    expect(result.headline.lastMeasured).toBe("2020-06-01");
  });

  it("picks the LAST same-dated measurement by input array order, not id/other tiebreak", () => {
    const m1 = measurement({ measured: "2020-06-01", commonName: "First At This Date" });
    const m2 = measurement({ measured: "2020-06-01", commonName: "Second At This Date" });
    const result = applyTreeHeadline([m1, m2]);
    expect(result.headline.commonName).toBe("Second At This Date");
  });

  it("computes per-measurement derived numbers in the same order as the input", () => {
    const m1 = measurement({ girth: F(100), height: F(0), heightInputFormat: 1 }); // height unspecified
    const m2 = measurement({ girth: F(200), height: F(50) });
    const result = applyTreeHeadline([m1, m2]);
    expect(result.derivedNumbers).toHaveLength(2);
    // diameter = girth/pi, always computed (girth specified on both).
    expect(result.derivedNumbers[0]!.diameter).toBeCloseTo(F(100) / Math.PI, 3);
    expect(result.derivedNumbers[1]!.diameter).toBeCloseTo(F(200) / Math.PI, 3);
    // ENTSPTS needs height AND girth specified -- null for m1 (height unspecified).
    expect(result.derivedNumbers[0]!.entspts).toBeNull();
    expect(result.derivedNumbers[1]!.entspts).not.toBeNull();
  });

  it("Coordinates/CalculatedCoordinates come from CalculateCoordinates cascade, not just the last measurement", () => {
    const m1 = measurement({ measured: "2019-01-01", coordinates: coord(40, CoordinatesFormat.DecimalDegrees, -84, CoordinatesFormat.DecimalDegrees) });
    const m2 = measurement({ measured: "2020-06-01", coordinates: nullCoord() }); // last measurement has no coords of its own
    const result = applyTreeHeadline([m1, m2]);
    // Falls back to the last measurement WITH specified coordinates (m1), not Null().
    expect(result.headline.coordinates.latitude).toBe(F(40));
    expect(result.headline.commonName).toBe(m2.commonName); // non-coordinate headline fields still come from the true last measurement
  });

  it("dedups Measurers across ALL measurements, case-SENSITIVE, first-occurrence order", () => {
    const m1 = measurement({
      measured: "2019-01-01",
      measurers: [
        { firstName: "Alice", lastName: "Anderson" },
        { firstName: "Bob", lastName: "Brown" },
      ],
    });
    const m2 = measurement({
      measured: "2020-06-01",
      measurers: [
        { firstName: "alice", lastName: "anderson" }, // different case -> NOT deduped against m1's Alice
        { firstName: "Bob", lastName: "Brown" }, // exact repeat -> deduped
        { firstName: "Carol", lastName: "Clark" },
      ],
    });
    const result = applyTreeHeadline([m1, m2]);
    expect(result.headline.measurers).toEqual([
      { firstName: "Alice", lastName: "Anderson" },
      { firstName: "Bob", lastName: "Brown" },
      { firstName: "alice", lastName: "anderson" },
      { firstName: "Carol", lastName: "Clark" },
    ]);
  });

  it("MeasurementCount is the total number of measurements", () => {
    const result = applyTreeHeadline([measurement(), measurement(), measurement()]);
    expect(result.headline.measurementCount).toBe(3);
  });

  it("re-types ONLY the last measurement's photos, 7 (TreeMeasurement) -> 6 (Tree)", () => {
    const m1 = measurement({
      measured: "2019-01-01",
      photos: [{ type: PhotoReferenceType.TreeMeasurement, photoId: 111, caption: "old photo" }],
    });
    const m2 = measurement({
      measured: "2020-06-01",
      photos: [{ type: PhotoReferenceType.TreeMeasurement, photoId: 222, caption: "new photo" }],
    });
    const result = applyTreeHeadline([m1, m2]);
    expect(result.headline.photos).toEqual([
      { type: PhotoReferenceType.Tree, photoId: 222, caption: "new photo" },
    ]);
  });
});

function visit(overrides: Partial<VisitForHeadline> = {}): VisitForHeadline {
  return {
    visited: "2020-06-01",
    ownershipType: "Public",
    coordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    calculatedCoordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    ownershipContactInfo: "parks@example.com",
    makeOwnershipContactInfoPublic: true,
    visitors: [{ firstName: "Alice", lastName: "Anderson" }],
    photos: [],
    ...overrides,
  };
}

describe("applySiteHeadline", () => {
  it("throws on an empty visit list (Site.LastVisit's .Last())", () => {
    expect(() => applySiteHeadline([])).toThrow();
  });

  it("copies OwnershipType/OwnershipContactInfo/MakeOwnershipContactInfoPublic from the LAST visit", () => {
    const v1 = visit({ visited: "2019-01-01", ownershipType: "Private", ownershipContactInfo: "old@example.com" });
    const v2 = visit({ visited: "2020-06-01", ownershipType: "Public", ownershipContactInfo: "new@example.com" });
    const result = applySiteHeadline([v1, v2]);
    expect(result.ownershipType).toBe("Public");
    expect(result.ownershipContactInfo).toBe("new@example.com");
  });

  it("picks the LAST same-dated visit by input array order", () => {
    const v1 = visit({ visited: "2020-06-01", ownershipType: "First" });
    const v2 = visit({ visited: "2020-06-01", ownershipType: "Second" });
    const result = applySiteHeadline([v1, v2]);
    expect(result.ownershipType).toBe("Second");
  });

  it("Coordinates/CalculatedCoordinates fall back across ALL visits, not just the last", () => {
    const v1 = visit({ visited: "2019-01-01", coordinates: coord(40, CoordinatesFormat.DecimalDegrees, -84, CoordinatesFormat.DecimalDegrees) });
    const v2 = visit({ visited: "2020-06-01", coordinates: nullCoord() });
    const result = applySiteHeadline([v1, v2]);
    expect(result.coordinates.latitude).toBe(F(40));
  });

  it("VisitCount is the total number of visits", () => {
    const result = applySiteHeadline([visit(), visit(), visit()]);
    expect(result.visitCount).toBe(3);
  });

  it("dedups Visitors across ALL visits, case-SENSITIVE, first-occurrence order", () => {
    const v1 = visit({
      visited: "2019-01-01",
      visitors: [
        { firstName: "Alice", lastName: "Anderson" },
        { firstName: "Bob", lastName: "Brown" },
      ],
    });
    const v2 = visit({
      visited: "2020-06-01",
      visitors: [
        { firstName: "ALICE", lastName: "ANDERSON" }, // different case -> distinct entry
        { firstName: "Bob", lastName: "Brown" }, // exact repeat -> deduped
      ],
    });
    const result = applySiteHeadline([v1, v2]);
    expect(result.visitors).toEqual([
      { firstName: "Alice", lastName: "Anderson" },
      { firstName: "Bob", lastName: "Brown" },
      { firstName: "ALICE", lastName: "ANDERSON" },
    ]);
  });

  it("re-types ONLY the last visit's photos, 5 (SiteVisit) -> 4 (Site)", () => {
    const v1 = visit({
      visited: "2019-01-01",
      photos: [{ type: PhotoReferenceType.SiteVisit, photoId: 111, caption: "old" }],
    });
    const v2 = visit({
      visited: "2020-06-01",
      photos: [{ type: PhotoReferenceType.SiteVisit, photoId: 222, caption: "new" }],
    });
    const result = applySiteHeadline([v1, v2]);
    expect(result.photos).toEqual([{ type: PhotoReferenceType.Site, photoId: 222, caption: "new" }]);
  });
});
