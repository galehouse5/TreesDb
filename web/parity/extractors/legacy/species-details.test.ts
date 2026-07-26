import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./species-details";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "species-details.html"), "utf-8");

describe("legacy species-details extractor (site-scoped, which also carries the state-scoped section)", () => {
  it("extracts global botanical/common name and maxima links", () => {
    const result = extract(html);
    expect(result.botanicalName).toBe("Quercus alba");
    expect(result.commonName).toBe("White Oak");
    expect(result.global.maxHeight).toEqual({ text: "123.5'", href: "/Browse/Trees/4242/Details" });
    expect(result.global.maxGirth).toEqual({ text: "17' 4''", href: "/Browse/Trees/4300/Details" });
  });

  it("extracts the state-scoped section (first 'Species within' portlet)", () => {
    const { state } = extract(html);
    expect(state?.state).toEqual({ text: "Ohio (US)", href: "/Browse/States/5/Details" });
    expect(state?.maxima.maxHeight?.text).toBe("123.5'");
    expect(state?.maxima.maxCrownSpread).toBeUndefined();
  });

  it("extracts the site-scoped section (second 'Species within' portlet), with OwnershipType/County rows", () => {
    const { site } = extract(html);
    expect(site?.site).toEqual({ text: "Old Growth Preserve", href: "/Browse/Sites/17/Details" });
    expect(site?.rows["Ownership type"]).toBe("Public");
    expect(site?.rows["County"]).toBe("Hamilton");
    expect(site?.maxima.maxGirth).toBeUndefined();
  });

  it("parses all three grids: recorded states, recorded sites within state, recorded trees within site", () => {
    const result = extract(html);
    expect(result.recordedStatesGrid.rows[0].cells).toEqual(["Ohio"]);
    expect(result.recordedSitesGrid?.rows[0].cells).toEqual(["Quercus alba"]);
    expect(result.recordedTreesGrid?.rows[0].cells).toEqual(["123.5'"]);
  });
});
