import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./species-grid";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "species-grid.html"), "utf-8");

describe("legacy species-grid extractor", () => {
  it("parses the global species grid", () => {
    const grid = extract(html);
    expect(grid.columns.map((c) => c.header)).toEqual(["Botanical name", "Common name", "Max height"]);
    expect(grid.rows).toHaveLength(1);
    expect(grid.rows[0].cells).toEqual(["Quercus alba", "White Oak", "123.5'"]);
    expect(grid.rows[0].links[0]?.href).toBe("/Browse/Species/Quercus alba (White Oak)/Details");
  });
});
