import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./site-details";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "site-details.html"), "utf-8");

describe("legacy site-details extractor", () => {
  it("reads siteId from the Export tree data link", () => {
    expect(extract(html).siteId).toBe(17);
  });

  it("extracts summary rows including the (private)/(not enough data) literals verbatim", () => {
    const { summary } = extract(html);
    expect(summary["Name"]).toBe("Old Growth Preserve");
    expect(summary["RHI20"]).toBe("(not enough data)");
    expect(summary["Ownership contact"]).toBe("(private)");
    expect(summary["General comments"]).toBe("Old-growth remnant, restricted access.");
  });

  it("extracts one visit with nested visitors/trip report/comments", () => {
    const { visits } = extract(html);
    expect(visits).toHaveLength(1);
    expect(visits[0]).toEqual({
      visited: "05/12/2018",
      visitors: "Jane Doe and John Smith",
      tripReportUrl: "example.com/trip",
      comments: "Good weather, full crew.",
    });
  });

  it("parses the species grid (3 columns, 1 row, no pages)", () => {
    const { speciesGrid } = extract(html);
    expect(speciesGrid.columns.map((c) => c.header)).toEqual(["Botanical name", "Common name", "Max height"]);
    expect(speciesGrid.columns[1].sortState).toBe("asc");
    expect(speciesGrid.columns[2].sortState).toBe("desc");
    expect(speciesGrid.rows).toHaveLength(1);
    expect(speciesGrid.rows[0].cells).toEqual(["Quercus alba", "White Oak", "123.5'"]);
    expect(speciesGrid.pageInfo).toBe("Showing 1 to 1 of 1 entries");
    expect(speciesGrid.hasPreviousPage).toBe(false);
    expect(speciesGrid.hasNextPage).toBe(false);
  });

  it("extracts location with no Site row and a linked State", () => {
    const { location } = extract(html);
    expect(location.coordinatesKind).toBe("specified");
    expect(location.state).toEqual({ text: "Ohio (US)", href: "/Browse/States/5/Details" });
    expect(location.rows["Ownership type"]).toBe("Public");
  });

  it("reports zero photos for the literal (no photos) case", () => {
    const { photos, hasPhotos } = extract(html);
    expect(photos).toEqual([]);
    expect(hasPhotos).toBe(false);
  });
});
