import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./tree-details";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "tree-details.html"), "utf-8");

describe("legacy tree-details extractor", () => {
  it("reads treeId from the Export tree data link", () => {
    expect(extract(html).treeId).toBe(4242);
  });

  it("extracts botanical/common name as links, excluded from details", () => {
    const result = extract(html);
    expect(result.botanicalName).toEqual({
      text: "Quercus alba",
      href: "/Browse/Species/Quercus alba (White Oak)/Details?siteId=17",
    });
    expect(result.commonName.text).toBe("White Oak");
    expect(result.details["Botanical name"]).toBeUndefined();
    expect(result.details["Common name"]).toBeUndefined();
  });

  it("extracts detail rows verbatim, including the Comment-classed row", () => {
    const { details } = extract(html);
    expect(details["Height"]).toBe("123.5'");
    expect(details["Girth"]).toBe("17' 4''");
    expect(details["Champion points"]).toBe("210.30");
    expect(details["General comments"]).toBe("Great specimen near the trailhead.");
  });

  it("extracts one measurement with summary/details/measurers split out", () => {
    const { measurements } = extract(html);
    expect(measurements).toHaveLength(1);
    expect(measurements[0].heading).toBe("Measured on 05/12/2018");
    expect(measurements[0].summary).toEqual({
      Height: "123.5'",
      Girth: "17' 4''",
      "Crown spread": "88.0'",
    });
    expect(measurements[0].measurers).toBe("Jane Doe and John Smith");
    // The per-measurement Details tab re-renders the full BrowseTreeDetailsModel
    // template, so Botanical/Common name reappear here too (as plain text - this
    // extractor does not special-case them into LinkedText per measurement, only
    // at the top-level tree details table).
    expect(measurements[0].details["Botanical name"]).toBe("Quercus alba");
    expect(measurements[0].details["General comments"]).toBe("Great specimen near the trailhead.");
  });

  it("picks the specified Coordinates row (not calculated) and pulls Site/State as links", () => {
    const { location } = extract(html);
    expect(location.coordinatesKind).toBe("specified");
    expect(location.coordinatesValue).toBe("39.12345 -84.45678");
    expect(location.site).toEqual({ text: "Old Growth Preserve", href: "/Browse/Sites/17/Details" });
    expect(location.state).toEqual({ text: "Ohio (US)", href: "/Browse/States/5/Details" });
    expect(location.rows["Ownership type"]).toBe("Public");
    expect(location.rows["County"]).toBe("Hamilton");
  });

  it("counts photos and captures the photographers cell verbatim", () => {
    const { photos, hasPhotos } = extract(html);
    expect(hasPhotos).toBe(true);
    expect(photos).toEqual([{ date: "05/12/2018", photoCount: 2, photographers: "Taken by Jane Doe" }]);
  });
});
