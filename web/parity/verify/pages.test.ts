import { describe, expect, it } from "vitest";
import { classifyPageArtifact, comparePageJson } from "./pages";

describe("classifyPageArtifact", () => {
  it("resolves a plain tree-details fetch", () => {
    expect(classifyPageArtifact("/Browse/Trees/164405/Details")).toEqual({
      kind: "resolved",
      pageType: "tree-details",
      newPath: "/trees/164405",
    });
  });

  it("resolves a species-details fetch scoped via the query-param form", () => {
    expect(classifyPageArtifact("/Browse/Species/Quercus alba (White Oak)/Details?siteId=39185")).toEqual({
      kind: "resolved",
      pageType: "species-details",
      newPath: "/species/quercus-alba--white-oak?site=39185",
    });
  });

  it("resolves the two global grids and forwards sort/filter/page query params, stripping parameterNamePrefix", () => {
    expect(classifyPageArtifact("/Browse/Locations?sort=Name&sortAsc=true&parameterNamePrefix=")).toEqual({
      kind: "resolved",
      pageType: "locations-grid",
      newPath: "/locations?sort=Name&sortAsc=true",
    });
  });

  it("resolves marker-info path-id fetches", () => {
    expect(classifyPageArtifact("/Map/1/StateMarkerInfo")).toEqual({
      kind: "resolved",
      pageType: "marker-info-state",
      newPath: "/api/map/states/1/info",
    });
  });

  it("skips a scoped-grid AJAX partial disguised as a site-details fetch (sort query param)", () => {
    const r = classifyPageArtifact("/Browse/Sites/436/Details?sort=ScientificName&sortAsc=true");
    expect(r.kind).toBe("skip");
    if (r.kind === "skip") expect(r.reason).toMatch(/grid/i);
  });

  it("does NOT treat a plain site-details fetch (no query) as a grid partial", () => {
    expect(classifyPageArtifact("/Browse/Sites/436/Details")).toEqual({
      kind: "resolved",
      pageType: "site-details",
      newPath: "/sites/436",
    });
  });

  it("skips an unmapped URL shape with a clear reason", () => {
    const r = classifyPageArtifact("/Browse/Activity");
    expect(r.kind).toBe("skip");
  });
});

describe("comparePageJson", () => {
  it("passes on identical extracted JSON", () => {
    const json = { treeId: 1, botanicalName: { text: "Quercus alba", href: "/Browse/Species/Quercus alba (White Oak)/Details" } };
    const result = comparePageJson("x", json, { treeId: 1, botanicalName: { text: "Quercus alba", href: "/species/quercus-alba--white-oak" } });
    expect(result.diffs).toEqual([]);
    expect(result.checksRun).toBeGreaterThan(0);
  });

  it("fails on a verbatim formatted-string mismatch (doc §5.4: strings compared verbatim)", () => {
    const legacy = { details: { Height: "123.5'" } };
    const next = { details: { Height: "123.50'" } };
    const result = comparePageJson("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
  });

  // W-005 regression (surfaced by the P1-15 sweep): legacy's captured HTML
  // reflects Cloudflare's email-obfuscation placeholder (no JS ran during
  // capture), not the real page content - tagged waiverHint W-005 rather
  // than a hard failure.
  it("tags a Cloudflare email-protection placeholder mismatch with waiverHint W-005", () => {
    const legacy = { summary: { "Ownership contact": "Phone 215-493-6652 Email:[email protected]" } };
    const next = { summary: { "Ownership contact": "Phone 215-493-6652 Email:fivemilewoods@yahoo.com" } };
    const result = comparePageJson("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBe("W-005");
  });

  it("does NOT waive an unrelated string mismatch that merely differs (no cdn-cgi marker)", () => {
    const legacy = { summary: { "Ownership contact": "Jane Doe jane@example.com" } };
    const next = { summary: { "Ownership contact": "John Doe john@example.com" } };
    const result = comparePageJson("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBeUndefined();
  });

  // W-007 regression (surfaced by the P1-15 sweep, the single largest
  // failure bucket - 416/476 unwaived pages failures, both from exactly
  // `/locations` and `/species`): a tied-rank grid whose rows come back in
  // a different (but content-equal) order must not fail.
  describe("W-007 grid tie-order realignment (locations-grid/species-grid only)", () => {
    function row(cells: string[], links: (null | { text: string; href: string })[] = cells.map(() => null)) {
      return { cells, links };
    }
    const gridShape = (rows: ReturnType<typeof row>[]) => ({
      columns: [],
      rows,
      pageInfo: "Showing 1 to 2 of 2 entries",
      hasPreviousPage: false,
      hasNextPage: false,
    });

    it("passes when locations-grid rows are the same set in a different order", () => {
      const legacy = gridShape([row(["Site A", "Ohio", "10"]), row(["Site B", "Ohio", "10"])]);
      const next = gridShape([row(["Site B", "Ohio", "10"]), row(["Site A", "Ohio", "10"])]);
      const result = comparePageJson("x", legacy, next, "locations-grid");
      expect(result.diffs).toEqual([]);
    });

    it("passes when species-grid rows are the same set in a different order", () => {
      const legacy = gridShape([row(["Oak"]), row(["Maple"]), row(["Pine"])]);
      const next = gridShape([row(["Pine"]), row(["Oak"]), row(["Maple"])]);
      const result = comparePageJson("x", legacy, next, "species-grid");
      expect(result.diffs).toEqual([]);
    });

    it("still fails when a row's cell content genuinely differs (not just reordered)", () => {
      const legacy = gridShape([row(["Site A", "Ohio", "10"]), row(["Site B", "Ohio", "10"])]);
      const next = gridShape([row(["Site B", "Ohio", "10"]), row(["Site A", "Ohio", "99"])]); // "10" -> "99"
      const result = comparePageJson("x", legacy, next, "locations-grid");
      expect(result.diffs.length).toBeGreaterThan(0);
    });

    it("still fails when a row is genuinely missing from one side", () => {
      const legacy = gridShape([row(["Site A"]), row(["Site B"]), row(["Site C"])]);
      const next = gridShape([row(["Site B"]), row(["Site A"])]); // Site C missing
      const result = comparePageJson("x", legacy, next, "locations-grid");
      expect(result.diffs.length).toBeGreaterThan(0);
    });

    it("realigns links too (route-equivalence still applies) once rows are matched by cells", () => {
      const legacy = gridShape([
        row(["Site A"], [{ text: "Site A", href: "/Browse/Sites/1/Details" }]),
        row(["Site B"], [{ text: "Site B", href: "/Browse/Sites/2/Details" }]),
      ]);
      const next = gridShape([
        row(["Site B"], [{ text: "Site B", href: "/sites/2" }]),
        row(["Site A"], [{ text: "Site A", href: "/sites/1" }]),
      ]);
      const result = comparePageJson("x", legacy, next, "locations-grid");
      expect(result.diffs).toEqual([]);
    });

    it("does NOT realign rows for a non-grid page type (e.g. tree-details), even if it happened to have a rows array", () => {
      const legacy = { rows: [row(["A"]), row(["B"])] };
      const next = { rows: [row(["B"]), row(["A"])] };
      const result = comparePageJson("x", legacy, next, "tree-details");
      expect(result.diffs.length).toBeGreaterThan(0); // positional compare still applied - not a grid type
    });

    it("is a no-op when pageType is omitted (existing call sites unaffected)", () => {
      const legacy = gridShape([row(["A"]), row(["B"])]);
      const next = gridShape([row(["B"]), row(["A"])]);
      const result = comparePageJson("x", legacy, next);
      expect(result.diffs.length).toBeGreaterThan(0);
    });
  });

  // W-010 (D-016 species whitespace-duplicate cleanup, waivers.md's entry) -
  // two mechanical prongs implemented in data/waivers.ts, wired in here.
  describe("W-010 (D-016 species whitespace-duplicate cleanup)", () => {
    function row(cells: string[], links: (null | { text: string; href: string })[] = cells.map(() => null)) {
      return { cells, links };
    }
    const gridShape = (rows: ReturnType<typeof row>[]) => ({ rows });

    it("prong 1: tags a legacy double-space cell vs the new collapsed cell with waiverHint W-010", () => {
      const legacy = { details: { botanicalName: "Cercis  siliquastrum" } };
      const next = { details: { botanicalName: "Cercis siliquastrum" } };
      const result = comparePageJson("x", legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBe("W-010");
    });

    it("prong 2: an extra legacy-side row for a merged pair (the whitespace-duplicate variant) is tagged W-010", () => {
      const legacy = gridShape([
        row(["Crataegus  spp.", "Hawthorn", "1"]), // whitespace-duplicate, extra in legacy - merged away in new
        row(["Crataegus spp.", "Hawthorn", "38"]),
        row(["Quercus alba", "White Oak", "10"]),
      ]);
      const next = gridShape([row(["Crataegus spp.", "Hawthorn", "38"]), row(["Quercus alba", "White Oak", "10"])]);
      const result = comparePageJson("x", legacy, next, "species-grid");
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBe("W-010");
    });

    it("prong 2: a tree-count mismatch on a merged pair's own row (38 -> 39 after the D-016 merge) is tagged W-010", () => {
      const legacy = gridShape([row(["Crataegus spp.", "Hawthorn", "38"]), row(["Quercus alba", "White Oak", "10"])]);
      const next = gridShape([row(["Crataegus spp.", "Hawthorn", "39"]), row(["Quercus alba", "White Oak", "10"])]);
      const result = comparePageJson("x", legacy, next, "species-grid");
      expect(result.diffs.length).toBeGreaterThan(0);
      expect(result.diffs.every((d) => d.waiverHint === "W-010")).toBe(true);
    });

    it("prong 2 anti-overreach: a tree-count mismatch on an UNRELATED species row still fails, untagged", () => {
      const legacy = gridShape([row(["Quercus alba", "White Oak", "10"])]);
      const next = gridShape([row(["Quercus alba", "White Oak", "11"])]);
      const result = comparePageJson("x", legacy, next, "species-grid");
      expect(result.diffs.length).toBeGreaterThan(0);
      expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
    });

    it("an unrelated string diff (no whitespace-collapse equality, no D-016 pair) is untagged", () => {
      const legacy = { details: { Owner: "Jane Doe" } };
      const next = { details: { Owner: "John Doe" } };
      const result = comparePageJson("x", legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBeUndefined();
    });

    it("does not tag a diff merely because the PAGE contains a merged-pair species elsewhere (anti-overreach)", () => {
      // The Crataegus spp. row is IDENTICAL on both sides; only the unrelated Quercus alba row's count differs.
      const legacy = gridShape([row(["Crataegus spp.", "Hawthorn", "38"]), row(["Quercus alba", "White Oak", "10"])]);
      const next = gridShape([row(["Crataegus spp.", "Hawthorn", "38"]), row(["Quercus alba", "White Oak", "11"])]);
      const result = comparePageJson("x", legacy, next, "species-grid");
      expect(result.diffs.length).toBeGreaterThan(0);
      expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
    });

    // W-010 prong 4 (embedded-grid alignment + attribution) - real report
    // shape from parity/reports/pages-2026-07-18.md:
    // /Browse/Sites/41043/Details speciesGrid legacy 4 rows vs new 3, which
    // used to cascade into ~30 misaligned-cell diffs before this prong.
    describe("W-010 prong 4 (embedded-grid alignment + attribution)", () => {
      const siteDetailsShape = (speciesRows: ReturnType<typeof row>[], pageInfo: string) => ({
        siteId: 41043,
        speciesGrid: { rows: speciesRows, pageInfo },
      });

      it("aligns an embedded speciesGrid (site-details) so a removed merged-pair row doesn't cascade into misaligned-cell diffs, and tags both the row and the pageInfo count diff W-010", () => {
        const legacy = siteDetailsShape(
          [
            row(["Crataegus spp.", "Hawthorn", "29.6'"]),
            row(["Crataegus  spp.", "Hawthorn", "41.7'"]), // whitespace-duplicate, merged away in new
            row(["Liriodendron tulipifera", "Tuliptree", "140.9'"]),
            row(["Platanus occidentalis", "American Sycamore", "89.8'"]),
          ],
          "Showing 1 to 4 of 4 entries",
        );
        const next = siteDetailsShape(
          [
            row(["Crataegus spp.", "Hawthorn", "29.6'"]),
            row(["Liriodendron tulipifera", "Tuliptree", "140.9'"]),
            row(["Platanus occidentalis", "American Sycamore", "89.8'"]),
          ],
          "Showing 1 to 3 of 3 entries",
        );
        const result = comparePageJson("x", legacy, next, "site-details");
        // Only the two expected diffs: the unmatched row itself, and the pageInfo count - no cascading misaligned-cell noise.
        expect(result.diffs).toHaveLength(2);
        expect(result.diffs.every((d) => d.waiverHint === "W-010")).toBe(true);
        expect(result.diffs.some((d) => d.field === "speciesGrid.rows")).toBe(true);
        expect(result.diffs.some((d) => d.field === "speciesGrid.pageInfo")).toBe(true);
      });

      it("still fails (untagged) when the removed row is NOT a D-016 pair - pageInfo count diff also stays untagged", () => {
        const legacy = siteDetailsShape(
          [row(["Quercus alba", "White Oak", "10'"]), row(["Pinus strobus", "Eastern White Pine", "20'"])],
          "Showing 1 to 2 of 2 entries",
        );
        const next = siteDetailsShape([row(["Quercus alba", "White Oak", "10'"])], "Showing 1 to 1 of 1 entries");
        const result = comparePageJson("x", legacy, next, "site-details");
        expect(result.diffs.length).toBeGreaterThan(0);
        expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
      });

      it("tags only the attributed row when a grid has BOTH a D-016 row and an unrelated row missing - pageInfo stays untagged (not EVERY unmatched row was attributed)", () => {
        const legacy = siteDetailsShape(
          [
            row(["Cupressus sempervirens", "Italian Cypress", "69.8'"]),
            row(["Cupressus sempervirens", "Italian  Cypress", "70.1'"]), // D-016 duplicate-variant row
            row(["Quercus alba", "White Oak", "10'"]), // unrelated row, also missing from new
          ],
          "Showing 1 to 3 of 3 entries",
        );
        const next = siteDetailsShape([row(["Cupressus sempervirens", "Italian Cypress", "69.8'"])], "Showing 1 to 1 of 1 entries");
        const result = comparePageJson("x", legacy, next, "site-details");
        const rowDiffs = result.diffs.filter((d) => d.field === "speciesGrid.rows");
        expect(rowDiffs).toHaveLength(2);
        expect(rowDiffs.filter((d) => d.waiverHint === "W-010")).toHaveLength(1); // only the Cupressus duplicate row
        const pageInfoDiff = result.diffs.find((d) => d.field === "speciesGrid.pageInfo");
        expect(pageInfoDiff?.waiverHint).toBeUndefined(); // Quercus row is unattributed - count diff must still fail
      });

      it("applies to a state-details equivalent grid too (sitesGrid, not just speciesGrid)", () => {
        const legacy = { stateId: 1, sitesGrid: { rows: [row(["Site A"]), row(["Site B"])], pageInfo: "Showing 1 to 2 of 2 entries" } };
        const next = { stateId: 1, sitesGrid: { rows: [row(["Site B"]), row(["Site A"])], pageInfo: "Showing 1 to 2 of 2 entries" } };
        const result = comparePageJson("x", legacy, next, "state-details");
        expect(result.diffs).toEqual([]); // pure reorder, no content difference - fully resolved, no D-016 involvement
      });

      it("does not affect grids with NO D-016 involvement: a genuine unrelated content mismatch on an embedded grid still fails, untagged", () => {
        const legacy = siteDetailsShape([row(["Quercus alba", "White Oak", "10'"])], "Showing 1 to 1 of 1 entries");
        const next = siteDetailsShape([row(["Quercus alba", "White Oak", "99'"])], "Showing 1 to 1 of 1 entries"); // height changed, same row identity otherwise implied by count staying 1-of-1
        const result = comparePageJson("x", legacy, next, "site-details");
        expect(result.diffs.length).toBeGreaterThan(0);
        expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
      });
    });

    // W-010 prong 5 (affected species detail artifacts) - a closed
    // artifact classifier (data/waivers.ts's classifyD016SpeciesDetailArtifact);
    // EVERY diff on a matching artifact is tagged, regardless of its own shape.
    describe("W-010 prong 5 (affected species detail artifacts)", () => {
      it("tags every diff on the global species-details page for a D-016 merged pair (double-space URL variant)", () => {
        const url = "https://www.treesdb.org/Browse/Species/Cercis%20%20siliquastrum%20(Judas-Tree)/Details";
        const legacy = { botanicalName: "Cercis  siliquastrum", commonName: "Judas-Tree", global: { maxHeight: { text: "50'", href: "/Browse/Trees/1/Details" } } };
        const next = { botanicalName: "Cercis siliquastrum", commonName: "Judas-Tree", global: { maxHeight: { text: "52'", href: "/trees/2" } } };
        const result = comparePageJson(url, legacy, next, "species-details");
        expect(result.diffs.length).toBeGreaterThan(0);
        expect(result.diffs.every((d) => d.waiverHint === "W-010")).toBe(true);
      });

      it("tags every diff on a site-scoped species-details page (query-param form) for a D-016 pair", () => {
        const url = "https://www.treesdb.org/Browse/Species/Crataegus%20spp.%20(Hawthorn)/Details?siteId=41043";
        const legacy = { botanicalName: "Crataegus spp.", commonName: "Hawthorn", site: { rows: { County: "A" } } };
        const next = { botanicalName: "Crataegus spp.", commonName: "Hawthorn", site: { rows: { County: "B" } } };
        const result = comparePageJson(url, legacy, next, "species-details");
        expect(result.diffs).toHaveLength(1);
        expect(result.diffs[0]!.waiverHint).toBe("W-010");
      });

      it("does NOT tag diffs on a species-details page for an UNRELATED species (prong 5 must not fire)", () => {
        const url = "https://www.treesdb.org/Browse/Species/Quercus%20alba%20(White%20Oak)/Details";
        const legacy = { botanicalName: "Quercus alba", commonName: "White Oak" };
        const next = { botanicalName: "Quercus rubra", commonName: "Red Oak" };
        const result = comparePageJson(url, legacy, next, "species-details");
        expect(result.diffs.length).toBeGreaterThan(0);
        expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
      });
    });

    // W-010 prong 6 (count-only diffs from off-page merged rows) - the
    // remaining residual class from round 3: a grid's pageInfo/count total
    // differs because the causal merged row isn't on the currently-viewed
    // page, so prong 4 has no row-level evidence to attribute it from.
    // Scoped to exactly two closed artifacts (data/waivers.ts's
    // classifyD016CountOnlyScope) with an EXACT expected delta each.
    describe("W-010 prong 6 (count-only diffs from off-page merged rows)", () => {
      it("scope (a): a filtered global species-grid pageInfo diff matching the filter's expected delta (1) is tagged W-010", () => {
        const url = "https://www.treesdb.org/Browse/Species?botanicalNameFilter=Crataegus";
        const legacy = { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 1 of 39 entries" };
        const next = { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 1 of 38 entries" };
        const result = comparePageJson(url, legacy, next, "species-grid");
        expect(result.diffs).toHaveLength(1);
        expect(result.diffs[0]!.waiverHint).toBe("W-010");
      });

      it("scope (a): a filter matching NO merged pairs (expected delta 0) does NOT rescue a genuine 1-off count diff - still fails", () => {
        const url = "https://www.treesdb.org/Browse/Species?botanicalNameFilter=Quercus";
        const legacy = { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 1 of 39 entries" };
        const next = { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 1 of 38 entries" };
        const result = comparePageJson(url, legacy, next, "species-grid");
        expect(result.diffs).toHaveLength(1);
        expect(result.diffs[0]!.waiverHint).toBeUndefined();
      });

      it("scope (b): /Browse/States/25/Details speciesGrid pageInfo diff with delta 1 is tagged W-010", () => {
        const url = "https://www.treesdb.org/Browse/States/25/Details";
        const legacy = { stateId: 25, speciesGrid: { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 10 of 126 entries" } };
        const next = { stateId: 25, speciesGrid: { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 10 of 125 entries" } };
        const result = comparePageJson(url, legacy, next, "state-details");
        expect(result.diffs).toHaveLength(1);
        expect(result.diffs[0]!.waiverHint).toBe("W-010");
      });

      it("an out-of-scope state (not /Browse/States/25/Details) with the SAME shape still fails - closed two-scope list", () => {
        const url = "https://www.treesdb.org/Browse/States/44/Details";
        const legacy = { stateId: 44, speciesGrid: { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 10 of 126 entries" } };
        const next = { stateId: 44, speciesGrid: { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 10 of 125 entries" } };
        const result = comparePageJson(url, legacy, next, "state-details");
        expect(result.diffs).toHaveLength(1);
        expect(result.diffs[0]!.waiverHint).toBeUndefined();
      });

      it("no-row-diffs precondition: a count diff alongside an UNRELATED row diff is NOT prong 6's - prong 4 governs and both stay failing", () => {
        const url = "https://www.treesdb.org/Browse/States/25/Details";
        const legacy = {
          stateId: 25,
          speciesGrid: {
            rows: [row(["Quercus alba", "White Oak", "10'"]), row(["Pinus strobus", "Eastern White Pine", "20'"])],
            pageInfo: "Showing 1 to 10 of 126 entries",
          },
        };
        const next = { stateId: 25, speciesGrid: { rows: [row(["Quercus alba", "White Oak", "10'"])], pageInfo: "Showing 1 to 10 of 125 entries" } };
        const result = comparePageJson(url, legacy, next, "state-details");
        expect(result.diffs.length).toBeGreaterThan(0);
        expect(result.diffs.every((d) => d.waiverHint === undefined)).toBe(true);
      });
    });
  });
});
