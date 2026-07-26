import { describe, expect, it } from "vitest";
import { buildSiteGraph, calculateTripFallbackCoordinates } from "./graph";
import {
  CoordinatesFormat,
  type CoordinatesFormatCode,
  type CoordinatesInput,
  type ImportSiteInput,
  type ImportTreeInput,
  type ImportTripContext,
  PhotoReferenceType,
  type TripSiteCoordinatesInput,
} from "./types";

const F = Math.fround;

function coord(
  latitude: number,
  latitudeInputFormat: CoordinatesFormatCode,
  longitude: number,
  longitudeInputFormat: CoordinatesFormatCode,
): CoordinatesInput {
  return { latitude: F(latitude), latitudeInputFormat, longitude: F(longitude), longitudeInputFormat };
}

function nullCoord(): CoordinatesInput {
  return coord(0, CoordinatesFormat.Unspecified, 0, CoordinatesFormat.Unspecified);
}

function baseTrip(overrides: Partial<ImportTripContext> = {}): ImportTripContext {
  return {
    id: 1,
    date: "2020-06-15",
    website: "https://example.com/trip-report",
    measurers: [{ firstName: "Alice", lastName: "Anderson" }],
    ...overrides,
  };
}

function baseSite(overrides: Partial<ImportSiteInput> = {}): ImportSiteInput {
  return {
    id: 101,
    name: "Big Oak Park",
    stateId: 5,
    county: "Franklin",
    ownershipType: "Public",
    ownershipContactInfo: "parks@example.com",
    makeOwnershipContactInfoPublic: true,
    coordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    comments: "Nice park.",
    photos: [],
    ...overrides,
  };
}

function baseTree(overrides: Partial<ImportTreeInput> = {}): ImportTreeInput {
  return {
    id: 201,
    commonName: "White Oak",
    scientificName: "Quercus alba",
    height: F(80),
    heightInputFormat: 2,
    heightMeasurementMethod: 1,
    girth: F(200),
    girthInputFormat: 2,
    crownSpread: F(60),
    crownSpreadInputFormat: 2,
    coordinates: nullCoord(),
    elevation: F(900),
    elevationInputFormat: 2,
    generalComments: "Healthy specimen.",
    photos: [],
    ...overrides,
  };
}

describe("buildSiteGraph - (Unidentified) scientific-name default (Measurement.cs:146)", () => {
  it("blank scientific name becomes (Unidentified)", () => {
    const graph = buildSiteGraph(baseSite(), [baseTree({ scientificName: "" })], baseTrip());
    expect(graph.trees[0].measurements[0].scientificName).toBe("(Unidentified)");
  });

  it("non-blank scientific name passes through unchanged", () => {
    const graph = buildSiteGraph(baseSite(), [baseTree({ scientificName: "Quercus alba" })], baseTrip());
    expect(graph.trees[0].measurements[0].scientificName).toBe("Quercus alba");
  });
});

describe("buildSiteGraph - date stamping", () => {
  it("visit.visited and measurement.measured both equal trip.date", () => {
    const trip = baseTrip({ date: "2021-09-01" });
    const graph = buildSiteGraph(baseSite(), [baseTree()], trip);
    expect(graph.visits[0].visited).toBe("2021-09-01");
    expect(graph.trees[0].measurements[0].measured).toBe("2021-09-01");
  });
});

describe("buildSiteGraph - measurer/visitor copying (SiteVisit.cs:53, Measurement.cs:156)", () => {
  it("copies trip measurers into both visit.visitors and measurement.measurers, undeduped", () => {
    const trip = baseTrip({
      measurers: [
        { firstName: "Alice", lastName: "Anderson" },
        { firstName: "Alice", lastName: "Anderson" }, // duplicate on purpose: no dedup at this stage
        { firstName: "Bob", lastName: "Baker" },
      ],
    });
    const graph = buildSiteGraph(baseSite(), [baseTree()], trip);
    expect(graph.visits[0].visitors).toEqual(trip.measurers);
    expect(graph.trees[0].measurements[0].measurers).toEqual(trip.measurers);
    // Straight copies, not the same array reference (mutation isolation).
    expect(graph.visits[0].visitors).not.toBe(trip.measurers);
  });

  it("trip report URL (site) comes from trip.website", () => {
    const trip = baseTrip({ website: "https://example.com/report-42" });
    const graph = buildSiteGraph(baseSite(), [baseTree()], trip);
    expect(graph.visits[0].tripReportUrl).toBe("https://example.com/report-42");
  });
});

describe("buildSiteGraph - photo reference re-typing (hop 1; doc 01 §2/§11)", () => {
  it("import site photos (type 2) become SiteVisit photos (type 5)", () => {
    const site = baseSite({ photos: [{ photoId: 555, caption: "Nice view" }] });
    const graph = buildSiteGraph(site, [baseTree()], baseTrip());
    expect(graph.visits[0].photos).toEqual([
      { type: PhotoReferenceType.SiteVisit, photoId: 555, caption: "Nice view" },
    ]);
  });

  it("import tree photos (type 3) become TreeMeasurement photos (type 7)", () => {
    const tree = baseTree({ photos: [{ photoId: 777, caption: null }] });
    const graph = buildSiteGraph(baseSite(), [tree], baseTrip());
    expect(graph.trees[0].measurements[0].photos).toEqual([
      { type: PhotoReferenceType.TreeMeasurement, photoId: 777, caption: null },
    ]);
  });
});

describe("buildSiteGraph - field copying + graph shape", () => {
  it("copies site fields (name/state/county/ownership/coordinates/comments) onto both the Site and its sole SiteVisit", () => {
    const site = baseSite({
      name: "Riverside Grove",
      stateId: 9,
      county: "Madison",
      ownershipType: "Private",
      ownershipContactInfo: "owner@example.com",
      makeOwnershipContactInfoPublic: false,
      comments: "Access by permission only.",
    });
    const graph = buildSiteGraph(site, [], baseTrip());

    expect(graph.name).toBe("Riverside Grove");
    expect(graph.stateId).toBe(9);
    expect(graph.county).toBe("Madison");
    expect(graph.sourceImportSiteId).toBe(site.id);

    const visit = graph.visits[0];
    expect(visit.name).toBe("Riverside Grove");
    expect(visit.stateId).toBe(9);
    expect(visit.county).toBe("Madison");
    expect(visit.ownershipType).toBe("Private");
    expect(visit.ownershipContactInfo).toBe("owner@example.com");
    expect(visit.makeOwnershipContactInfoPublic).toBe(false);
    expect(visit.comments).toBe("Access by permission only.");
    expect(visit.coordinates).toEqual(site.coordinates);
  });

  it("one Tree (with exactly one Measurement) per import tree", () => {
    const trees = [
      baseTree({ id: 1, commonName: "White Oak" }),
      baseTree({ id: 2, commonName: "Red Maple" }),
    ];
    const graph = buildSiteGraph(baseSite(), trees, baseTrip());
    expect(graph.trees).toHaveLength(2);
    expect(graph.trees[0].measurements).toHaveLength(1);
    expect(graph.trees[1].measurements).toHaveLength(1);
    expect(graph.trees[0].sourceImportTreeId).toBe(1);
    expect(graph.trees[1].sourceImportTreeId).toBe(2);
    expect(graph.trees[0].measurements[0].commonName).toBe("White Oak");
    expect(graph.trees[1].measurements[0].commonName).toBe("Red Maple");
  });

  it("copies measurement fields (height/girth/crownSpread/elevation/comments) verbatim from the import tree", () => {
    const tree = baseTree({
      height: F(123.4),
      heightInputFormat: 4,
      heightMeasurementMethod: 2,
      girth: F(45.6),
      girthInputFormat: 4,
      crownSpread: F(30.2),
      crownSpreadInputFormat: 4,
      elevation: F(1200.5),
      elevationInputFormat: 4,
      generalComments: "Struck by lightning in 2015.",
    });
    const graph = buildSiteGraph(baseSite(), [tree], baseTrip());
    const m = graph.trees[0].measurements[0];
    expect(m.height).toBe(F(123.4));
    expect(m.heightInputFormat).toBe(4);
    expect(m.heightMeasurementMethod).toBe(2);
    expect(m.girth).toBe(F(45.6));
    expect(m.girthInputFormat).toBe(4);
    expect(m.crownSpread).toBe(F(30.2));
    expect(m.crownSpreadInputFormat).toBe(4);
    expect(m.elevation).toBe(F(1200.5));
    expect(m.elevationInputFormat).toBe(4);
    expect(m.generalComments).toBe("Struck by lightning in 2015.");
  });
});

describe("buildSiteGraph - headline/derived-number fields are the derived.ts integration point", () => {
  it("leaves Site.headline, Tree.headline, and Measurement.derivedNumbers null", () => {
    const graph = buildSiteGraph(baseSite(), [baseTree()], baseTrip());
    expect(graph.headline).toBeNull();
    expect(graph.trees[0].headline).toBeNull();
    expect(graph.trees[0].measurements[0].derivedNumbers).toBeNull();
  });
});

describe("buildSiteGraph - CalculatedCoordinates cascade (Imports/{Site,TreeBase,Trip}.cs)", () => {
  it("uses the site's own coordinates when valid+specified", () => {
    const site = baseSite({
      coordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    const graph = buildSiteGraph(site, [baseTree()], baseTrip());
    expect(graph.visits[0].calculatedCoordinates).toEqual(site.coordinates);
  });

  it("falls back to the average (center) of the site's own trees' coordinates when the site has none", () => {
    const site = baseSite({ coordinates: nullCoord() });
    const trees = [
      baseTree({ id: 1, coordinates: coord(39.0, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees) }),
      baseTree({ id: 2, coordinates: coord(40.0, CoordinatesFormat.DecimalDegrees, -84.0, CoordinatesFormat.DecimalDegrees) }),
    ];
    const graph = buildSiteGraph(site, trees, baseTrip());
    const calc = graph.visits[0].calculatedCoordinates;
    expect(calc.latitude).toBeCloseTo(39.5, 5);
    expect(calc.longitude).toBeCloseTo(-83.5, 5);
    expect(calc.latitudeInputFormat).not.toBe(CoordinatesFormat.Unspecified);

    // A tree with no coordinates of its own inherits the site-level calculation.
    const uncoordinatedTree = baseTree({ id: 3, coordinates: nullCoord() });
    const graph2 = buildSiteGraph(site, [...trees, uncoordinatedTree], baseTrip());
    const inheritedTreeCalc = graph2.trees[2].measurements[0].calculatedCoordinates;
    expect(inheritedTreeCalc.latitude).toBeCloseTo(39.5, 5);
    expect(inheritedTreeCalc.longitude).toBeCloseTo(-83.5, 5);
  });

  it("a tree's own valid+specified coordinates win over the site-level calculation", () => {
    const site = baseSite({
      coordinates: coord(39.5, CoordinatesFormat.DecimalDegrees, -83.0, CoordinatesFormat.DecimalDegrees),
    });
    const tree = baseTree({
      coordinates: coord(39.9, CoordinatesFormat.DecimalDegrees, -83.9, CoordinatesFormat.DecimalDegrees),
    });
    const graph = buildSiteGraph(site, [tree], baseTrip());
    expect(graph.trees[0].measurements[0].calculatedCoordinates).toEqual(tree.coordinates);
  });

  it("falls back to the trip-wide fallback when neither the site nor its trees have coordinates", () => {
    const site = baseSite({ coordinates: nullCoord() });
    const tree = baseTree({ coordinates: nullCoord() });
    const otherSitesInTrip: TripSiteCoordinatesInput[] = [
      {
        coordinates: coord(41.0, CoordinatesFormat.DecimalDegrees, -85.0, CoordinatesFormat.DecimalDegrees),
        treeCoordinates: [],
      },
    ];
    const graph = buildSiteGraph(site, [tree], baseTrip(), otherSitesInTrip);
    const calc = graph.visits[0].calculatedCoordinates;
    expect(calc.latitude).toBeCloseTo(41.0, 5);
    expect(calc.longitude).toBeCloseTo(-85.0, 5);
  });

  it("resolves to Null (Unspecified) when nothing in the whole trip has coordinates", () => {
    const site = baseSite({ coordinates: nullCoord() });
    const tree = baseTree({ coordinates: nullCoord() });
    const graph = buildSiteGraph(site, [tree], baseTrip(), []);
    expect(graph.visits[0].calculatedCoordinates.latitudeInputFormat).toBe(CoordinatesFormat.Unspecified);
    expect(graph.trees[0].measurements[0].calculatedCoordinates.latitudeInputFormat).toBe(
      CoordinatesFormat.Unspecified,
    );
  });

  it("Invalid-format coordinates do not count as an entity's own (CalculateCoordinates uses IsValidAndSpecified)", () => {
    const site = baseSite({
      coordinates: coord(39.5, CoordinatesFormat.Invalid, -83.0, CoordinatesFormat.Invalid),
    });
    const tree = baseTree({
      coordinates: coord(40.0, CoordinatesFormat.DecimalDegrees, -84.0, CoordinatesFormat.DecimalDegrees),
    });
    const graph = buildSiteGraph(site, [tree], baseTrip());
    // Site's own coordinates are Invalid, so it falls back to the (single) tree's own coordinates.
    expect(graph.visits[0].calculatedCoordinates).toEqual(tree.coordinates);
  });
});

describe("calculateTripFallbackCoordinates", () => {
  it("skips sites/trees with no valid+specified coordinates and averages the rest", () => {
    const result = calculateTripFallbackCoordinates([
      { coordinates: nullCoord(), treeCoordinates: [nullCoord()] },
      {
        coordinates: coord(10, CoordinatesFormat.DecimalDegrees, 20, CoordinatesFormat.DecimalDegrees),
        treeCoordinates: [],
      },
      {
        coordinates: nullCoord(),
        treeCoordinates: [coord(30, CoordinatesFormat.DecimalDegrees, 40, CoordinatesFormat.DecimalDegrees)],
      },
    ]);
    expect(result.latitude).toBeCloseTo(20, 5);
    expect(result.longitude).toBeCloseTo(30, 5);
  });

  it("returns Null when given no sites", () => {
    const result = calculateTripFallbackCoordinates([]);
    expect(result.latitudeInputFormat).toBe(CoordinatesFormat.Unspecified);
  });
});
