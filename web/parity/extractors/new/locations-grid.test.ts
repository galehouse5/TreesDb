import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./locations-grid";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "locations-grid.html"), "utf-8");

describe("new locations-grid extractor", () => {
  it("parses columns, sort state, and the filter row is ignored (not a data row)", () => {
    const grid = extract(html);
    expect(grid.columns.map((c) => c.header)).toEqual(["Site", "State", "RHI5"]);
    expect(grid.columns[0].sortable).toBe(true);
    expect(grid.columns[0].sortState).toBe("none");
    expect(grid.columns[1].sortState).toBe("asc");
    expect(grid.columns[2].sortable).toBe(false);
    expect(grid.rows).toHaveLength(2);
  });

  it("extracts row cells and per-cell links, with '-' cells having no link", () => {
    const grid = extract(html);
    expect(grid.rows[0]!.cells).toEqual(["Old Growth Preserve", "Ohio", "134.82"]);
    expect(grid.rows[0]!.links[0]).toEqual({ text: "Old Growth Preserve", href: "/sites/17" });
    expect(grid.rows[0]!.links[1]).toEqual({ text: "Ohio", href: "/states/5" });
    expect(grid.rows[1]!.cells[2]).toBe("-");
    expect(grid.rows[1]!.links[2]).toBeNull();
  });

  it("reads pagination info and enabled/disabled next/previous", () => {
    const grid = extract(html);
    expect(grid.pageInfo).toBe("Showing 1 to 2 of 213 entries");
    expect(grid.hasPreviousPage).toBe(false);
    expect(grid.hasNextPage).toBe(true);
  });
});
