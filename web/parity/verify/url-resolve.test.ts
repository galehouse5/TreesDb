import { describe, expect, it } from "vitest";
import {
  legacyMarkerInfoQueryUrlToNewPath,
  markerInfoLoaderUrlEquivalent,
  resolveAutocompletePath,
  resolveExportPath,
  resolveNewPath,
  resolveSearchPath,
  resolveSpeciesDetailsPath,
} from "./url-resolve";

describe("resolveNewPath", () => {
  it("resolves a confirmed route", () => {
    const r = resolveNewPath("/Browse/Trees/4242/Details");
    expect(r).toEqual({ kind: "resolved", newPath: "/trees/4242", routeId: "tree-details" });
  });

  it("strips the scheme+authority from a full absolute snapshot manifest URL before matching", () => {
    const r = resolveNewPath("https://www.treesdb.org/Browse/Trees/4242/Details");
    expect(r).toEqual({ kind: "resolved", newPath: "/trees/4242", routeId: "tree-details" });
  });

  it("resolves the root redirect from a full absolute URL (regression: matchLegacyUrl's ^/$ pattern must not see the origin)", () => {
    const r = resolveNewPath("https://www.treesdb.org/");
    expect(r).toEqual({ kind: "resolved", newPath: "/map", routeId: "home" });
  });

  it("skips when no table entry matches the pathname", () => {
    const r = resolveNewPath("/Account/Logon");
    expect(r.kind).toBe("skip");
  });

  it("skips a still-provisional (unconfirmed) route with a reason mentioning the route id", () => {
    const r = resolveNewPath("/Map/17/SiteMarker");
    expect(r.kind).toBe("skip");
    if (r.kind === "skip") expect(r.reason).toMatch(/map-site-marker/);
  });
});

describe("resolveSpeciesDetailsPath", () => {
  it("layers ?site= onto the base species-details mapping from the query-param scoped legacy shape", () => {
    const r = resolveSpeciesDetailsPath("/Browse/Species/Quercus alba (White Oak)/Details?siteId=39185");
    expect(r).toEqual({ kind: "resolved", newPath: "/species/quercus-alba--white-oak?site=39185", routeId: "species-details" });
  });

  it("layers ?state= similarly", () => {
    const r = resolveSpeciesDetailsPath("/Browse/Species/Quercus alba (White Oak)/Details?stateId=5");
    expect(r).toEqual({ kind: "resolved", newPath: "/species/quercus-alba--white-oak?state=5", routeId: "species-details" });
  });

  it("is a no-op (nothing extra to append) for the unscoped legacy shape", () => {
    const r = resolveSpeciesDetailsPath("/Browse/Species/Quercus alba (White Oak)/Details");
    expect(r).toEqual({ kind: "resolved", newPath: "/species/quercus-alba--white-oak", routeId: "species-details" });
  });

  it("does not double-append when the nested-path scoped legacy shape already bakes site scoping into the path", () => {
    const r = resolveSpeciesDetailsPath("/Browse/Sites/39185/Species/Quercus alba (White Oak)/Details");
    expect(r).toEqual({ kind: "resolved", newPath: "/species/quercus-alba--white-oak?site=39185", routeId: "site-species-details" });
  });
});

describe("resolveSearchPath / resolveAutocompletePath", () => {
  it("builds the search fetch path with the term forwarded", () => {
    const r = resolveSearchPath("/Search?term=oak");
    expect(r).toEqual({ kind: "resolved", newPath: "/search?term=oak", routeId: "search" });
  });

  it("builds the autocomplete fetch path with by=common/scientific plus term/results forwarded", () => {
    const common = resolveAutocompletePath("/Trees/FindKnownSpeciesWithSimilarCommonName?term=Paci&results=5");
    expect(common).toEqual({
      kind: "resolved",
      newPath: "/api/species/suggest?by=common&term=Paci&results=5",
      routeId: "autocomplete-common-name",
    });
    const scientific = resolveAutocompletePath("/Trees/FindKnownSpeciesWithSimilarScientificName?term=A");
    expect(scientific).toEqual({
      kind: "resolved",
      newPath: "/api/species/suggest?by=scientific&term=A",
      routeId: "autocomplete-scientific-name",
    });
  });
});

describe("resolveExportPath", () => {
  it("does not add a query string for plain per-entity export shapes", () => {
    expect(resolveExportPath("/Export/Trees/4242")).toEqual({ kind: "resolved", newPath: "/export/trees/4242", routeId: "export-trees" });
  });

  it("forwards filter/sort query params (lowercased-mirror, stripping parameterNamePrefix) for the two filtered export endpoints", () => {
    const r = resolveExportPath("/Export/LocationsByFilters?filter=a&parameterNamePrefix=");
    expect(r).toEqual({ kind: "resolved", newPath: "/export/locationsbyfilters?filter=a", routeId: "export-locations-by-filters" });
  });
});

describe("marker-info query-id URL handling", () => {
  it("maps the query-id InfoLoaderUrl shape to the confirmed /api/map/*/info paths", () => {
    expect(legacyMarkerInfoQueryUrlToNewPath("/Map/StateMarkerInfo?id=1")).toBe("/api/map/states/1/info");
    expect(legacyMarkerInfoQueryUrlToNewPath("/Map/SiteMarkerInfo?id=436")).toBe("/api/map/sites/436/info");
    expect(legacyMarkerInfoQueryUrlToNewPath("/Map/TreeMarkerInfo?id=164405")).toBe("/api/map/trees/164405/info");
  });

  it("returns null for shapes that aren't the query-id marker-info form", () => {
    expect(legacyMarkerInfoQueryUrlToNewPath("/Map/1/StateMarkerInfo")).toBeNull();
    expect(legacyMarkerInfoQueryUrlToNewPath("/Browse/Trees/1/Details")).toBeNull();
  });

  it("markerInfoLoaderUrlEquivalent matches the mapped path, ignoring a trailing slash", () => {
    expect(markerInfoLoaderUrlEquivalent("/Map/StateMarkerInfo?id=1", "/api/map/states/1/info")).toBe(true);
    expect(markerInfoLoaderUrlEquivalent("/Map/StateMarkerInfo?id=1", "/api/map/states/1/info/")).toBe(true);
    expect(markerInfoLoaderUrlEquivalent("/Map/StateMarkerInfo?id=1", "/api/map/states/2/info")).toBe(false);
  });
});
