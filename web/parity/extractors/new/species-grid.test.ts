import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./species-grid";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "species-grid.html"), "utf-8");

describe("new species-grid extractor", () => {
  it("parses columns, sort state (none active), and the filter row is ignored", () => {
    const grid = extract(html);
    expect(grid.columns.map((c) => c.header)).toEqual(["Botanical name", "Common name", "Max height"]);
    expect(grid.columns.every((c) => c.sortable)).toBe(true);
    expect(grid.columns.every((c) => c.sortState === "none")).toBe(true);
    expect(grid.rows).toHaveLength(1);
  });

  it("extracts row cells and per-cell links (botanical/common name link to the same species page)", () => {
    const grid = extract(html);
    expect(grid.rows[0]!.cells).toEqual(["Quercus alba", "White Oak", "123.5'"]);
    expect(grid.rows[0]!.links[0]).toEqual({ text: "Quercus alba", href: "/species/quercus-alba--white-oak" });
    expect(grid.rows[0]!.links[1]).toEqual({ text: "White Oak", href: "/species/quercus-alba--white-oak" });
    expect(grid.rows[0]!.links[2]).toEqual({ text: "123.5'", href: "/trees/4242" });
  });

  it("reads pagination info and both prev/next disabled (single-row result)", () => {
    const grid = extract(html);
    expect(grid.pageInfo).toBe("Showing 1 to 1 of 1 entries");
    expect(grid.hasPreviousPage).toBe(false);
    expect(grid.hasNextPage).toBe(false);
  });
});
