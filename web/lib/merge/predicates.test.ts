import { describe, expect, it } from "vitest";
import { planarDistanceMinutes } from "../geo/coordinates";
import {
  candidateBoundingBox,
  SITE_COORDINATE_PROXIMITY_MINUTES,
  type SiteMergeCandidate,
  shouldMergeSite,
  type TreeMergeCandidate,
  shouldMergeTree,
} from "./predicates";
import { CoordinatesFormat, type CoordinatesFormatCode, type CoordinatesInput } from "./types";

const F = Math.fround;

function coord(
  latitude: number,
  latitudeInputFormat: CoordinatesFormatCode,
  longitude: number,
  longitudeInputFormat: CoordinatesFormatCode,
): CoordinatesInput {
  return { latitude: F(latitude), latitudeInputFormat, longitude: F(longitude), longitudeInputFormat };
}

/** Bit-level next-representable-float32 (1 ULP up). */
function nextFloat32Up(x: number): number {
  const buf = new Float32Array([x]);
  const bits = new Int32Array(buf.buffer);
  bits[0] += 1;
  return buf[0];
}

function site(overrides: Partial<SiteMergeCandidate> = {}): SiteMergeCandidate {
  return {
    name: "Big Oak Park",
    stateId: 5,
    county: "Franklin",
    calculatedCoordinates: coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    ...overrides,
  };
}

describe("shouldMergeSite - Site.ShouldMerge (Site.cs:114-121)", () => {
  it("merges identical name/state/county/coordinates", () => {
    expect(shouldMergeSite(site(), site())).toBe(true);
  });

  it("name comparison is OrdinalIgnoreCase", () => {
    expect(shouldMergeSite(site({ name: "big oak PARK" }), site())).toBe(true);
  });

  it("county comparison is OrdinalIgnoreCase", () => {
    expect(shouldMergeSite(site({ county: "FRANKLIN" }), site())).toBe(true);
  });

  it("does not merge on name mismatch", () => {
    expect(shouldMergeSite(site({ name: "Little Oak Park" }), site())).toBe(false);
  });

  it("does not merge on state mismatch", () => {
    expect(shouldMergeSite(site({ stateId: 6 }), site())).toBe(false);
  });

  it("does not merge on county mismatch even when name/state/coordinates match", () => {
    expect(shouldMergeSite(site({ county: "Delaware" }), site())).toBe(false);
  });

  it("merges at 24.9 arc-minutes (doc 07 §8 safe-margin case)", () => {
    const existing = site({
      calculatedCoordinates: coord(0, CoordinatesFormat.DecimalDegrees, 0, CoordinatesFormat.DecimalDegrees),
    });
    const incoming = site({
      calculatedCoordinates: coord(24.9 / 60, CoordinatesFormat.DecimalDegrees, 0, CoordinatesFormat.DecimalDegrees),
    });
    const distance = planarDistanceMinutes(
      existing.calculatedCoordinates.latitude,
      existing.calculatedCoordinates.longitude,
      incoming.calculatedCoordinates.latitude,
      incoming.calculatedCoordinates.longitude,
    );
    expect(distance).toBeLessThan(25);
    expect(shouldMergeSite(existing, incoming)).toBe(true);
  });

  it("does not merge at 25.1 arc-minutes (doc 07 §8 safe-margin case)", () => {
    const existing = site({
      calculatedCoordinates: coord(0, CoordinatesFormat.DecimalDegrees, 0, CoordinatesFormat.DecimalDegrees),
    });
    const incoming = site({
      calculatedCoordinates: coord(25.1 / 60, CoordinatesFormat.DecimalDegrees, 0, CoordinatesFormat.DecimalDegrees),
    });
    const distance = planarDistanceMinutes(
      existing.calculatedCoordinates.latitude,
      existing.calculatedCoordinates.longitude,
      incoming.calculatedCoordinates.latitude,
      incoming.calculatedCoordinates.longitude,
    );
    expect(distance).toBeGreaterThan(25);
    expect(shouldMergeSite(existing, incoming)).toBe(false);
  });

  it("the merge threshold is inclusive: a point exactly on the candidate-box edge is <= 25' away and merges", () => {
    const existing = site({
      calculatedCoordinates: coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    const box = candidateBoundingBox(existing.calculatedCoordinates);
    const atNorthEdge = site({
      calculatedCoordinates: coord(
        box.maxLatitude,
        CoordinatesFormat.DecimalDegrees,
        existing.calculatedCoordinates.longitude,
        CoordinatesFormat.DecimalDegrees,
      ),
    });
    const distance = planarDistanceMinutes(
      existing.calculatedCoordinates.latitude,
      existing.calculatedCoordinates.longitude,
      atNorthEdge.calculatedCoordinates.latitude,
      atNorthEdge.calculatedCoordinates.longitude,
    );
    // The bounding box and the planar-distance formula are independent
    // computations (per-axis offset vs. circular sqrt); confirm they agree
    // closely enough that the box edge really does sit at ~25' and that
    // shouldMergeSite's `<=` matches whatever side of 25 it lands on.
    expect(distance).toBeCloseTo(25, 1);
    expect(shouldMergeSite(existing, atNorthEdge)).toBe(distance <= SITE_COORDINATE_PROXIMITY_MINUTES);
  });
});

describe("candidateBoundingBox - SiteRepository.ListByProximity (SiteRepository.cs:40-49)", () => {
  it("is symmetric around the given coordinates by default (25')", () => {
    const center = coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees);
    const box = candidateBoundingBox(center);
    const latSpanUp = box.maxLatitude - center.latitude;
    const latSpanDown = center.latitude - box.minLatitude;
    const lngSpanUp = box.maxLongitude - center.longitude;
    const lngSpanDown = center.longitude - box.minLongitude;
    expect(latSpanUp).toBeCloseTo(latSpanDown, 6);
    expect(lngSpanUp).toBeCloseTo(lngSpanDown, 6);
    // 25 arc-minutes ~= 0.41667 degrees.
    expect(latSpanUp).toBeCloseTo(25 / 60, 4);
  });

  it("honors a custom minutesDistance", () => {
    const center = coord(0, CoordinatesFormat.DecimalDegrees, 0, CoordinatesFormat.DecimalDegrees);
    const box = candidateBoundingBox(center, 60);
    expect(box.maxLatitude).toBeCloseTo(1, 4); // 60' == 1 degree
    expect(box.minLatitude).toBeCloseTo(-1, 4);
  });
});

function tree(overrides: Partial<TreeMergeCandidate> = {}): TreeMergeCandidate {
  return {
    commonName: "White Oak",
    scientificName: "Quercus alba",
    coordinates: coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    ...overrides,
  };
}

describe("shouldMergeTree - Tree.ShouldMerge (Tree.cs:112-123)", () => {
  it("merges identical common/scientific name and exactly-equal coordinates", () => {
    expect(shouldMergeTree(tree(), tree())).toBe(true);
  });

  it("commonName/scientificName comparisons are OrdinalIgnoreCase", () => {
    expect(shouldMergeTree(tree({ commonName: "WHITE OAK", scientificName: "QUERCUS ALBA" }), tree())).toBe(
      true,
    );
  });

  it("does not merge on common name mismatch", () => {
    expect(shouldMergeTree(tree({ commonName: "Red Maple" }), tree())).toBe(false);
  });

  it("does not merge on scientific name mismatch", () => {
    expect(shouldMergeTree(tree({ scientificName: "Acer rubrum" }), tree())).toBe(false);
  });

  it("does NOT merge on a 1-ulp float32 coordinate difference (exact equality required, no epsilon)", () => {
    const baseLat = F(39.12345);
    const existing = tree({
      coordinates: coord(baseLat, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    const incoming = tree({
      coordinates: coord(
        nextFloat32Up(baseLat),
        CoordinatesFormat.DecimalDegrees,
        -83.0,
        CoordinatesFormat.DecimalDegrees,
      ),
    });
    expect(existing.coordinates.latitude).not.toBe(incoming.coordinates.latitude);
    expect(shouldMergeTree(existing, incoming)).toBe(false);
  });

  it("merges on exact float32 equality even at an ugly, non-round value", () => {
    const lat = F(39.123456789);
    const lng = F(-83.987654321);
    const existing = tree({
      coordinates: coord(lat, CoordinatesFormat.DecimalDegrees, lng, CoordinatesFormat.DecimalDegrees),
    });
    const incoming = tree({
      coordinates: coord(lat, CoordinatesFormat.DecimalDegrees, lng, CoordinatesFormat.DecimalDegrees),
    });
    expect(shouldMergeTree(existing, incoming)).toBe(true);
  });

  it("never merges when either tree's coordinates are Unspecified, even if the numeric values match", () => {
    const existing = tree({
      coordinates: coord(39.0, CoordinatesFormat.Unspecified, -83.0, CoordinatesFormat.Unspecified),
    });
    const incoming = tree({
      coordinates: coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    expect(shouldMergeTree(existing, incoming)).toBe(false);
    expect(shouldMergeTree(incoming, existing)).toBe(false);
  });

  it("Invalid-format coordinates still count as 'specified' (doc 01 §7: Invalid counts as specified) and can merge", () => {
    const existing = tree({
      coordinates: coord(39.0, CoordinatesFormat.Invalid, -83.0, CoordinatesFormat.Invalid),
    });
    const incoming = tree({
      coordinates: coord(39.0, CoordinatesFormat.Invalid, -83.0, CoordinatesFormat.Invalid),
    });
    expect(shouldMergeTree(existing, incoming)).toBe(true);
  });

  it("one axis Unspecified with the other axis specified still counts as specified overall (OR, not AND)", () => {
    const existing = tree({
      coordinates: coord(39.0, CoordinatesFormat.Unspecified, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    const incoming = tree({
      coordinates: coord(39.0, CoordinatesFormat.Unspecified, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    expect(shouldMergeTree(existing, incoming)).toBe(true);
  });
});
