import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./search-results";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "search-results.html"), "utf-8");
const emptyHtml = readFileSync(path.join(fixturesDir, "search-results-empty.html"), "utf-8");

describe("legacy search-results extractor", () => {
  it("reads the term from the heading and extracts each result row", () => {
    const result = extract(html);
    expect(result.term).toBe("oak");
    expect(result.noResults).toBe(false);
    expect(result.results).toEqual([
      { category: "states", subject: "Ohio", description: "United States", url: "/Browse/States/5/Details" },
      {
        category: "species",
        subject: "Quercus alba",
        description: "White Oak",
        url: "/Browse/Species/Quercus alba (White Oak)/Details",
      },
    ]);
  });

  it("detects the literal 'No results found.' text with no results table and no message row", () => {
    const result = extract(emptyHtml);
    expect(result.term).toBe("zzzznotfound");
    expect(result.noResults).toBe(true);
    expect(result.results).toEqual([]);
  });
});
