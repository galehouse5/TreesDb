import { describe, expect, it } from "vitest";
import {
  collapseWhitespace,
  dateEquals,
  dateEqualsNullable,
  floatEquals,
  floatEqualsNullable,
  matchLegacyUrl,
  splitSpeciesRouteSegment,
  toFloat32,
  toProvisionalNewPath,
  urlsEquivalent,
} from "./normalize";

describe("float32 comparison", () => {
  it("coerces through Math.fround so float64-precise-but-float32-equal values compare equal", () => {
    // 123.456 does not round-trip exactly through float32; both sides must
    // agree after fround for this to pass - this is the exact hazard doc §6 calls out.
    expect(floatEquals(123.456, Math.fround(123.456))).toBe(true);
    expect(floatEquals("123.456", 123.456)).toBe(true);
  });

  it("does not treat nearby-but-distinct float32 values as equal (no epsilon)", () => {
    const a = Math.fround(1.0);
    const b = Math.fround(1.0) + Math.fround(1e-6) * 1000; // clearly distinct at float32 precision
    expect(floatEquals(a, b)).toBe(false);
  });

  it("floatEqualsNullable treats both-missing as equal and one-sided-missing as unequal", () => {
    expect(floatEqualsNullable(null, undefined)).toBe(true);
    expect(floatEqualsNullable(null, 1)).toBe(false);
    expect(floatEqualsNullable(1, null)).toBe(false);
    expect(floatEqualsNullable(1, "1.0")).toBe(true);
  });

  it("toFloat32 throws on unparseable strings", () => {
    expect(() => toFloat32("not-a-number")).toThrow();
  });
});

describe("date/instant comparison", () => {
  it("compares as ISO instants regardless of input representation", () => {
    expect(dateEquals("2018-05-12T00:00:00Z", new Date(Date.UTC(2018, 4, 12)))).toBe(true);
  });

  it("dateEqualsNullable treats empty string as missing", () => {
    expect(dateEqualsNullable("", null)).toBe(true);
    expect(dateEqualsNullable("2018-05-12T00:00:00Z", "")).toBe(false);
  });
});

describe("whitespace collapsing (HTML-extracted text only)", () => {
  it("collapses internal runs and trims", () => {
    expect(collapseWhitespace("  Old   Growth\n  Preserve  ")).toBe("Old Growth Preserve");
  });
});

describe("URL equivalence table", () => {
  it("maps tree/site/state details routes", () => {
    expect(toProvisionalNewPath("/Browse/Trees/4242/Details")).toBe("/trees/4242");
    expect(toProvisionalNewPath("/Browse/Sites/17/Details")).toBe("/sites/17");
    expect(toProvisionalNewPath("/Browse/States/5/Details")).toBe("/states/5");
  });

  it("splits the species route segment on the LAST ' (' per doc 06 P4-01", () => {
    expect(splitSpeciesRouteSegment("Quercus alba (White Oak)")).toEqual({
      scientificName: "Quercus alba",
      commonName: "White Oak",
    });
    // common name itself containing a paren-group: split must still land on the last " (".
    expect(splitSpeciesRouteSegment("Quercus alba (White Oak (swamp form))")).toEqual({
      scientificName: "Quercus alba (White Oak",
      commonName: "swamp form)",
    });
  });

  it("maps the tree marker info example from doc 07 §5.2 verbatim", () => {
    expect(toProvisionalNewPath("/Map/5/TreeMarkerInfo")).toBe("/api/map/trees/5/info");
  });

  it("maps species details to a provisional slug path", () => {
    const path = toProvisionalNewPath("/Browse/Species/Quercus alba (White Oak)/Details");
    expect(path).toBe("/species/quercus-alba--white-oak");
  });

  it("BUGFIX regression: species EXPORT routes mirror the legacy {bn} ({cn}) segment literally, NOT the D-011 slug (surfaced by the P1-15 sweep - see app/export/_lib/species-segment.ts)", () => {
    expect(toProvisionalNewPath("/Export/Species/Quercus alba (White Oak)")).toBe("/export/species/Quercus%20alba%20(White%20Oak)");
    expect(toProvisionalNewPath("/Export/Sites/17/Species/Quercus alba (White Oak)")).toBe(
      "/export/sites/17/species/Quercus%20alba%20(White%20Oak)",
    );
    expect(toProvisionalNewPath("/Export/States/5/Species/Quercus alba (White Oak)")).toBe(
      "/export/states/5/species/Quercus%20alba%20(White%20Oak)",
    );
  });

  it("returns null for unmapped shapes", () => {
    expect(toProvisionalNewPath("/Account/Logon")).toBeNull();
  });

  it("provisional flag distinguishes doc 03-confirmed routes from still-unconfirmed ones", () => {
    // Confirmed: doc 03's "New URL scheme" table lists /Browse/{Sites}/{id}/Details -> /sites/{id} verbatim.
    const confirmed = matchLegacyUrl("/Browse/Sites/17/Details");
    expect(confirmed?.entry.provisional).toBe(false);
    // Not confirmed: doc 03's table has no per-entity map-pin endpoint (only the
    // bulk /api/map/markers feed and the *Info popup endpoints are listed).
    const unconfirmed = matchLegacyUrl("/Map/17/SiteMarker");
    expect(unconfirmed?.entry.provisional).toBe(true);
  });

  it("urlsEquivalent ignores query-param order and a trailing slash", () => {
    expect(
      urlsEquivalent(
        "/Browse/States/5/Species/Quercus alba (White Oak)/Details",
        "/species/quercus-alba--white-oak?state=5",
      ),
    ).toBe(true);
  });
});
