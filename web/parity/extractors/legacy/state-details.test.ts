import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./state-details";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "state-details.html"), "utf-8");

describe("legacy state-details extractor", () => {
  it("reads stateId from the Export tree data link", () => {
    expect(extract(html).stateId).toBe(5);
  });

  it("extracts summary and location rows verbatim", () => {
    const result = extract(html);
    expect(result.summary["Name"]).toBe("Ohio");
    expect(result.summary["Code"]).toBe("OH");
    expect(result.summary["RHI20"]).toBe("119.05");
    expect(result.location["Country"]).toBe("United States");
  });

  it("parses both the species grid and the sites grid independently", () => {
    const result = extract(html);
    expect(result.speciesGrid.columns.map((c) => c.header)).toEqual(["Botanical name", "Common name"]);
    expect(result.speciesGrid.rows[0].cells).toEqual(["Quercus alba", "White Oak"]);
    expect(result.sitesGrid.columns.map((c) => c.header)).toEqual(["Site", "RHI5"]);
    expect(result.sitesGrid.rows[0].cells).toEqual(["Old Growth Preserve", "134.82"]);
    expect(result.sitesGrid.rows[0].links[0]).toEqual({ text: "Old Growth Preserve", href: "/Browse/Sites/17/Details" });
    expect(result.sitesGrid.rows[0].links[1]).toBeNull();
  });
});
