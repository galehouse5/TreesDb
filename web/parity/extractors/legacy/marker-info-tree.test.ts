import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./marker-info-tree";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "marker-info-tree.html"), "utf-8");

describe("legacy marker-info-tree extractor", () => {
  it("reads treeId from the details link; header <strong> is the scientific name", () => {
    const result = extract(html);
    expect(result.treeId).toBe(4242);
    expect(result.scientificName).toBe("Quercus alba");
  });

  it("extracts common name and dimension rows, and the (exact) champion points row", () => {
    const { rows } = extract(html);
    expect(rows["Common name"]).toBe("White Oak");
    expect(rows["Height"]).toBe("123.5'");
    expect(rows["Champion points"]).toBe("210.30");
    expect(rows["Champion points (abbreviated)"]).toBeUndefined();
  });

  it("extracts a single photo thumbnail and pulls Measured out separately", () => {
    const { photos, lastMeasured, rows } = extract(html);
    expect(photos).toEqual([{ thumbnailSrc: "/Photos/9001/Square" }]);
    expect(lastMeasured).toBe("05/12/2018");
    expect(rows["Measured"]).toBeUndefined();
    expect(rows["Photos"]).toBeUndefined();
  });
});
