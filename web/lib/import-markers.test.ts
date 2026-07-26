import { describe, expect, it } from "vitest";
import { buildImportSiteMarkers, buildImportTreeMarkers, type ImportMarkersData } from "./import-markers";
import { CoordinatesFormat } from "./merge/types";
import type { ImportSite } from "../db/queries/import-drafts.sql";
import type { TreeRecord } from "../db/queries/import-trees.sql";

const UNSPECIFIED = { latitude: 0, latitudeInputFormat: CoordinatesFormat.Unspecified, longitude: 0, longitudeInputFormat: CoordinatesFormat.Unspecified };

function site(overrides: Partial<ImportSite> & { id: number }): ImportSite {
  return {
    tripId: 1,
    name: "Site",
    stateId: 10,
    county: "Franklin",
    ownershipType: "Public",
    ownershipContactInfo: "",
    makeOwnershipContactInfoPublic: false,
    comments: "",
    ...UNSPECIFIED,
    ...overrides,
  };
}

function tree(overrides: Partial<TreeRecord> & { id: number; siteId: number }): TreeRecord {
  return {
    type: 1,
    commonName: "White Oak",
    scientificName: "Quercus alba",
    status: 0,
    ageClass: 0,
    ageType: 0,
    age: null,
    height: 0,
    heightInputFormat: CoordinatesFormat.Unspecified,
    heightMeasurementMethod: 0,
    girth: 0,
    girthInputFormat: CoordinatesFormat.Unspecified,
    combinedGirthNumberOfTrunks: null,
    crownSpread: 0,
    crownSpreadInputFormat: CoordinatesFormat.Unspecified,
    elevation: 0,
    elevationInputFormat: CoordinatesFormat.Unspecified,
    terrainType: 0,
    formType: 0,
    numberOfTrunks: null,
    generalComments: "",
    ...UNSPECIFIED,
    ...overrides,
  };
}

function data(overrides: Partial<ImportMarkersData> = {}): ImportMarkersData {
  return {
    tripId: 42,
    sites: [],
    treesBySite: {},
    siteFirstPhotoId: new Map(),
    treeFirstPhotoId: new Map(),
    ...overrides,
  };
}

describe("buildImportSiteMarkers (MapController.ImportSiteMarkers)", () => {
  it("returns site-not-found for a siteId not in this trip", () => {
    const result = buildImportSiteMarkers(data({ sites: [site({ id: 1 })] }), 999);
    expect(result).toBe("site-not-found");
  });

  it("excludes the target site from the site-marker list but includes its own trees", () => {
    const s1 = site({ id: 1, name: "Target", latitude: 40, latitudeInputFormat: CoordinatesFormat.DecimalDegrees, longitude: -83, longitudeInputFormat: CoordinatesFormat.DecimalDegrees });
    const s2 = site({ id: 2, name: "Other", latitude: 41, latitudeInputFormat: CoordinatesFormat.DecimalDegrees, longitude: -84, longitudeInputFormat: CoordinatesFormat.DecimalDegrees });
    const t1 = tree({ id: 10, siteId: 1, scientificName: "Quercus alba", latitude: 40.1, latitudeInputFormat: CoordinatesFormat.DecimalDegrees, longitude: -83.1, longitudeInputFormat: CoordinatesFormat.DecimalDegrees });

    const result = buildImportSiteMarkers(
      data({ sites: [s1, s2], treesBySite: { 1: [t1], 2: [] } }),
      1,
    );
    if (typeof result === "string") throw new Error("expected a payload");

    const titles = result.Markers.map((m) => m.Title);
    expect(titles).toContain("Other"); // other site included
    expect(titles).not.toContain("Target"); // target site excluded
    expect(titles).toContain("Quercus alba"); // target site's own tree still included as context
  });

  it("filters out sites/trees with unspecified or invalid coordinates", () => {
    const target = site({ id: 1, name: "Target" });
    const noCoords = site({ id: 2, name: "No coords" }); // default UNSPECIFIED
    const invalid = site({
      id: 3,
      name: "Invalid",
      latitude: 5,
      latitudeInputFormat: CoordinatesFormat.Invalid,
      longitude: 5,
      longitudeInputFormat: CoordinatesFormat.Invalid,
    });
    const valid = site({
      id: 4,
      name: "Valid",
      latitude: 41,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -84,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });

    const result = buildImportSiteMarkers(
      data({ sites: [target, noCoords, invalid, valid], treesBySite: {} }),
      1,
    );
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.Markers.map((m) => m.Title)).toEqual(["Valid"]);
  });

  it("omits CalculatedCoordinates entirely when nothing in the trip can calculate anything", () => {
    const target = site({ id: 1 }); // no own coords, no trees, no other sites
    const result = buildImportSiteMarkers(data({ sites: [target], treesBySite: {} }), 1);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toBeUndefined();
  });

  it("CalculatedCoordinates uses the site's own coordinates when specified", () => {
    const target = site({
      id: 1,
      latitude: 40,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const result = buildImportSiteMarkers(data({ sites: [target], treesBySite: {} }), 1);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toEqual({ Latitude: 40, Longitude: -83 });
  });

  it("CalculatedCoordinates falls back to the site's own trees' bounds when the site itself has no coordinates", () => {
    const target = site({ id: 1 }); // no own coords
    const t1 = tree({ id: 10, siteId: 1, latitude: 40, latitudeInputFormat: CoordinatesFormat.DecimalDegrees, longitude: -83, longitudeInputFormat: CoordinatesFormat.DecimalDegrees });
    const t2 = tree({ id: 11, siteId: 1, latitude: 42, latitudeInputFormat: CoordinatesFormat.DecimalDegrees, longitude: -85, longitudeInputFormat: CoordinatesFormat.DecimalDegrees });

    const result = buildImportSiteMarkers(data({ sites: [target], treesBySite: { 1: [t1, t2] } }), 1);
    if (typeof result === "string") throw new Error("expected a payload");
    // Center of the two trees' bounding box.
    expect(result.CalculatedCoordinates).toEqual({ Latitude: 41, Longitude: -84 });
  });

  it("CalculatedCoordinates falls back to the trip-wide fallback when the site and its trees have no coordinates but another site does", () => {
    const target = site({ id: 1 }); // no own coords, no trees
    const other = site({
      id: 2,
      latitude: 44,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -87,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const result = buildImportSiteMarkers(data({ sites: [target, other], treesBySite: {} }), 1);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toEqual({ Latitude: 44, Longitude: -87 });
  });

  it("IconUrl falls back to the default when no photo exists, and to /photos/{id}/SmallMapSquare when one does", () => {
    const s1 = site({ id: 1 });
    const s2 = site({
      id: 2,
      name: "Photo site",
      latitude: 41,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -84,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });

    const result = buildImportSiteMarkers(
      data({ sites: [s1, s2], treesBySite: {}, siteFirstPhotoId: new Map([[2, 555]]) }),
      1,
    );
    if (typeof result === "string") throw new Error("expected a payload");
    const marker = result.Markers.find((m) => m.Title === "Photo site")!;
    expect(marker.IconUrl).toBe("/photos/555/SmallMapSquare");
  });

  it("InfoLoaderUrl mirrors the /api/import/{tripId}/sites/{id}/info convention", () => {
    const s1 = site({ id: 1 });
    const s2 = site({
      id: 2,
      latitude: 41,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -84,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const result = buildImportSiteMarkers(data({ tripId: 42, sites: [s1, s2], treesBySite: {} }), 1);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.Markers[0]!.InfoLoaderUrl).toBe("/api/import/42/sites/2/info");
  });
});

describe("buildImportTreeMarkers (MapController.ImportTreeMarkers)", () => {
  it("returns tree-not-found for a treeId not in this trip", () => {
    const result = buildImportTreeMarkers(data({ sites: [site({ id: 1 })], treesBySite: { 1: [] } }), 999);
    expect(result).toBe("tree-not-found");
  });

  it("does NOT exclude any site (only the target tree is excluded from tree markers)", () => {
    const s1 = site({
      id: 1,
      name: "Site A",
      latitude: 40,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const t1 = tree({ id: 10, siteId: 1 }); // target -- no own coords, excluded regardless
    const t2 = tree({
      id: 11,
      siteId: 1,
      scientificName: "Acer saccharum",
      latitude: 40.2,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83.2,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });

    const result = buildImportTreeMarkers(data({ sites: [s1], treesBySite: { 1: [t1, t2] } }), 10);
    if (typeof result === "string") throw new Error("expected a payload");
    const titles = result.Markers.map((m) => m.Title);
    expect(titles).toContain("Site A"); // site's own site is included (no exclusion rule for sites)
    expect(titles).toContain("Acer saccharum"); // sibling tree included
    expect(titles).not.toContain("Quercus alba"); // the target tree itself is excluded
  });

  it("CalculatedCoordinates uses the tree's own coordinates when specified", () => {
    const s1 = site({ id: 1 });
    const t1 = tree({
      id: 10,
      siteId: 1,
      latitude: 39,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -82,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const result = buildImportTreeMarkers(data({ sites: [s1], treesBySite: { 1: [t1] } }), 10);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toEqual({ Latitude: 39, Longitude: -82 });
  });

  it("CalculatedCoordinates falls back to the containing site's CalculateCoordinates() when the tree has no own coordinates", () => {
    const s1 = site({
      id: 1,
      latitude: 40,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const t1 = tree({ id: 10, siteId: 1 }); // no own coordinates
    const result = buildImportTreeMarkers(data({ sites: [s1], treesBySite: { 1: [t1] } }), 10);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toEqual({ Latitude: 40, Longitude: -83 });
  });

  it("omits CalculatedCoordinates when neither the tree nor its site (nor the trip) can calculate anything", () => {
    const s1 = site({ id: 1 });
    const t1 = tree({ id: 10, siteId: 1 });
    const result = buildImportTreeMarkers(data({ sites: [s1], treesBySite: { 1: [t1] } }), 10);
    if (typeof result === "string") throw new Error("expected a payload");
    expect(result.CalculatedCoordinates).toBeUndefined();
  });

  it("IconUrl falls back to the default tree icon, and to /photos/{id}/SmallMapSquare when a photo exists", () => {
    const s1 = site({ id: 1 });
    const t1 = tree({ id: 10, siteId: 1 });
    const t2 = tree({
      id: 11,
      siteId: 1,
      scientificName: "Photo tree",
      latitude: 40,
      latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
      longitude: -83,
      longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
    });
    const result = buildImportTreeMarkers(
      data({ sites: [s1], treesBySite: { 1: [t1, t2] }, treeFirstPhotoId: new Map([[11, 777]]) }),
      10,
    );
    if (typeof result === "string") throw new Error("expected a payload");
    const marker = result.Markers.find((m) => m.Title === "Photo tree")!;
    expect(marker.IconUrl).toBe("/photos/777/SmallMapSquare");
  });
});
