import { describe, expect, it } from "vitest";
import type { Diff } from "./comparator";
import {
  classifyD016CountOnlyScope,
  classifyD016SpeciesDetailArtifact,
  classifyD016SpeciesExportArtifact,
  D016_MERGED_PAIRS,
  D016_RENAMED_PAIRS,
  extractGridEntryTotal,
  findApplicableWaiver,
  identifiesD016MergedPair,
  identifiesD016MergedPairInAny,
  isD016WhitespaceCollapseEqual,
  parseWaivers,
} from "./waivers";

const REAL_WAIVERS_MD = `# Parity waiver registry

## W-001: Species max-tree tie-breaking (lowest Id)
- Category / artifacts affected: \`pages\` (species detail pages), \`data\`
  (§7.2 MeasuredSpecies / MeasuredSpeciesBySite / MeasuredSpeciesByState
  views).
- Field(s): \`Max*TreeId\`
- Legacy behavior / new behavior: ties broken differently.
- Reason: doc 01 §4.
- Comparator rule: waived when value matches but id differs.
- Approved by: predeclared.

## W-004: Marker array order
- Category / artifacts affected: \`markers\`
- Field(s): array element order only.
- Legacy behavior / new behavior: unordered.
- Reason: doc 07 §5.2.
- Comparator rule: compared as a set.
- Approved by: predeclared.
`;

describe("parseWaivers", () => {
  it("parses every waiver section with id, title, categories, and fields text", () => {
    const waivers = parseWaivers(REAL_WAIVERS_MD);
    expect(waivers.map((w) => w.id)).toEqual(["W-001", "W-004"]);
    expect(waivers[0]!.title).toBe("Species max-tree tie-breaking (lowest Id)");
    expect(waivers[0]!.categories.some((c) => c.includes("data"))).toBe(true);
    expect(waivers[0]!.fieldsText).toContain("max*treeid");
    expect(waivers[1]!.categories.some((c) => c.includes("markers"))).toBe(true);
  });
});

describe("findApplicableWaiver", () => {
  const waivers = parseWaivers(REAL_WAIVERS_MD);

  it("matches via an explicit waiverHint regardless of category/field text", () => {
    const diff: Diff = { kind: "field", table: "measured_species", field: "maxHeightTreeId", message: "", waiverHint: "W-001" };
    const match = findApplicableWaiver(diff, "derived", waivers);
    expect(match?.id).toBe("W-001");
  });

  it("matches via category + field free-text when no waiverHint is set", () => {
    const diff: Diff = { kind: "field", table: "measured_species", field: "maxGirthTreeId", message: "" };
    const match = findApplicableWaiver(diff, "data", waivers);
    expect(match?.id).toBe("W-001");
  });

  it("does not match a diff whose category is not listed", () => {
    const diff: Diff = { kind: "field", table: "trees", field: "height", message: "" };
    const match = findApplicableWaiver(diff, "data", waivers);
    expect(match).toBeNull();
  });

  it("does not match a diff whose field is not covered by the waiver's Field(s) line", () => {
    const diff: Diff = { kind: "field", table: "measured_species", field: "number", message: "" };
    const match = findApplicableWaiver(diff, "data", waivers);
    expect(match).toBeNull();
  });

  it("returns null when no waivers are loaded", () => {
    const diff: Diff = { kind: "row-count", table: "trees", message: "" };
    expect(findApplicableWaiver(diff, "data", [])).toBeNull();
  });
});

// W-010 (D-016 species whitespace-duplicate cleanup) - the two mechanical
// prong functions verify/pages.ts, verify/search.ts and verify/exports.ts
// call at their own diff-construction sites (see waivers.md's entry).
describe("isD016WhitespaceCollapseEqual (W-010 prong 1)", () => {
  it("matches a legacy double-space value against the new collapsed value", () => {
    expect(isD016WhitespaceCollapseEqual("Cercis  siliquastrum", "Cercis siliquastrum")).toBe(true);
  });

  it("matches regardless of which side carries the extra whitespace", () => {
    expect(isD016WhitespaceCollapseEqual("Cercis siliquastrum", "Cercis   siliquastrum")).toBe(true);
  });

  it("does not match when the collapsed values still differ", () => {
    expect(isD016WhitespaceCollapseEqual("Cercis  siliquastrum", "Quercus alba")).toBe(false);
  });

  it("does not match already-equal values (not a diff in the first place)", () => {
    expect(isD016WhitespaceCollapseEqual("Quercus alba", "Quercus alba")).toBe(false);
  });

  it("does not match non-string values", () => {
    expect(isD016WhitespaceCollapseEqual(38, 39)).toBe(false);
    expect(isD016WhitespaceCollapseEqual(null, "x")).toBe(false);
  });
});

describe("D016_MERGED_PAIRS / identifiesD016MergedPair (W-010 prong 2)", () => {
  it("is the closed 3-pair D-016 list, exactly", () => {
    expect(D016_MERGED_PAIRS).toEqual([
      { botanicalName: "Cercis siliquastrum", commonName: "Judas-Tree" },
      { botanicalName: "Crataegus spp.", commonName: "Hawthorn" },
      { botanicalName: "Cupressus sempervirens", commonName: "Italian Cypress" },
    ]);
  });

  it("identifies a pair when both collapsed names appear in the text, case-insensitively", () => {
    expect(identifiesD016MergedPair("crataegus spp. / hawthorn (39 trees)")).toBe(true);
  });

  it("identifies a pair even when the text carries the whitespace-duplicate variant", () => {
    expect(identifiesD016MergedPair("Cercis  siliquastrum - Judas-Tree")).toBe(true);
  });

  it("does not identify a pair from the botanical name alone (both names required)", () => {
    expect(identifiesD016MergedPair("Crataegus spp. only, no common name here")).toBe(false);
  });

  it("does not identify an unrelated species", () => {
    expect(identifiesD016MergedPair("Quercus alba / White Oak")).toBe(false);
  });

  it("identifiesD016MergedPairInAny joins several fields before matching (ignores null/undefined entries)", () => {
    expect(identifiesD016MergedPairInAny(["Cupressus sempervirens", undefined, "Italian Cypress", null])).toBe(true);
    expect(identifiesD016MergedPairInAny(["Quercus alba", "White Oak"])).toBe(false);
  });
});

describe("classifyD016SpeciesExportArtifact (W-010 prong 3)", () => {
  it("is the closed 1-entry D-016 rename list, exactly", () => {
    expect(D016_RENAMED_PAIRS).toEqual([{ botanicalName: "Quercus x mutabilis", commonName: "Hybrid Oak" }]);
  });

  it("classifies the double-space Cercis siliquastrum export URL as duplicate-variant", () => {
    const url = "https://www.treesdb.org/Export/Species/Cercis%20%20siliquastrum%20(Judas-Tree)";
    expect(classifyD016SpeciesExportArtifact(url)).toBe("duplicate-variant");
  });

  it("classifies the clean single-space Cercis siliquastrum export URL as clean-twin", () => {
    const url = "https://www.treesdb.org/Export/Species/Cercis%20siliquastrum%20(Judas-Tree)";
    expect(classifyD016SpeciesExportArtifact(url)).toBe("clean-twin");
  });

  it("classifies a double space inside the COMMON name (Italian  Cypress) as duplicate-variant", () => {
    const url = "https://www.treesdb.org/Export/Species/Cupressus%20sempervirens%20(Italian%20%20Cypress)";
    expect(classifyD016SpeciesExportArtifact(url)).toBe("duplicate-variant");
  });

  it("classifies the renamed Quercus  x mutabilis (no clean twin) as duplicate-variant", () => {
    const url = "https://www.treesdb.org/Export/Species/Quercus%20%20x%20mutabilis%20(Hybrid%20Oak)";
    expect(classifyD016SpeciesExportArtifact(url)).toBe("duplicate-variant");
  });

  it("returns null for an unrelated species export URL", () => {
    const url = "https://www.treesdb.org/Export/Species/Quercus%20alba%20(White%20Oak)";
    expect(classifyD016SpeciesExportArtifact(url)).toBeNull();
  });

  it("returns null for a non-species export URL (Sites/States/filters)", () => {
    expect(classifyD016SpeciesExportArtifact("https://www.treesdb.org/Export/Sites/41043")).toBeNull();
    expect(classifyD016SpeciesExportArtifact("https://www.treesdb.org/Export/SpeciesByFilters?filter=a")).toBeNull();
  });
});

describe("classifyD016SpeciesDetailArtifact (W-010 prong 5)", () => {
  it("identifies the global species-details page, double-space URL variant", () => {
    const url = "https://www.treesdb.org/Browse/Species/Cercis%20%20siliquastrum%20(Judas-Tree)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("identifies the global species-details page, clean URL variant", () => {
    const url = "https://www.treesdb.org/Browse/Species/Cercis%20siliquastrum%20(Judas-Tree)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("identifies the site-scoped nested-path form", () => {
    const url = "https://www.treesdb.org/Browse/Sites/41043/Species/Crataegus%20%20spp.%20(Hawthorn)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("identifies the state-scoped nested-path form", () => {
    const url = "https://www.treesdb.org/Browse/States/1/Species/Cupressus%20sempervirens%20(Italian%20%20Cypress)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("identifies the query-param-scoped form (?siteId=)", () => {
    const url = "https://www.treesdb.org/Browse/Species/Crataegus%20spp.%20(Hawthorn)/Details?siteId=41043";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("ignores grid-permutation query params (sort/page/filter) stacked on the query-param-scoped form", () => {
    const url = "https://www.treesdb.org/Browse/Species/Crataegus%20spp.%20(Hawthorn)/Details?stateSpeciesSort=Number&stateSpeciesSortAsc=true&parameterNamePrefix=stateSpecies&stateId=1";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("identifies the renamed Quercus  x mutabilis pair too (not just the 3 merged pairs)", () => {
    const url = "https://www.treesdb.org/Browse/Species/Quercus%20%20x%20mutabilis%20(Hybrid%20Oak)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(true);
  });

  it("returns false for an unrelated species detail page", () => {
    const url = "https://www.treesdb.org/Browse/Species/Quercus%20alba%20(White%20Oak)/Details";
    expect(classifyD016SpeciesDetailArtifact(url)).toBe(false);
  });

  it("returns false for a non-species-details page (site-details root)", () => {
    expect(classifyD016SpeciesDetailArtifact("https://www.treesdb.org/Browse/Sites/41043/Details")).toBe(false);
  });
});

describe("extractGridEntryTotal", () => {
  it("extracts the trailing total from a normal pageInfo string", () => {
    expect(extractGridEntryTotal("Showing 1 to 40 of 764 entries")).toBe(764);
    expect(extractGridEntryTotal("Showing 81 to 120 of 761 entries")).toBe(761);
  });

  it("returns null for an unparseable / non-string pageInfo shape", () => {
    expect(extractGridEntryTotal("No entries")).toBeNull();
    expect(extractGridEntryTotal(undefined)).toBeNull();
    expect(extractGridEntryTotal(42)).toBeNull();
  });
});

describe("classifyD016CountOnlyScope (W-010 prong 6)", () => {
  it("scope (a): unfiltered global species grid expects delta 3 (the verified 764->761)", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species")).toEqual({ scope: "global-species-grid", expectedDelta: 3 });
  });

  it("scope (a): every sort/page query variant of the global species grid still resolves (query beyond the filter params doesn't change the expected delta)", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?sort=MaxGirth&sortAsc=true")).toEqual({
      scope: "global-species-grid",
      expectedDelta: 3,
    });
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?page=2")).toEqual({ scope: "global-species-grid", expectedDelta: 3 });
  });

  it("scope (a): a botanicalNameFilter matching exactly ONE merged pair expects delta 1", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?botanicalNameFilter=Crataegus")).toEqual({
      scope: "global-species-grid",
      expectedDelta: 1,
    });
  });

  it("scope (a): a botanicalNameFilter matching NONE of the merged pairs expects delta 0", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?botanicalNameFilter=Quercus")).toEqual({
      scope: "global-species-grid",
      expectedDelta: 0,
    });
  });

  it("scope (a): botanicalNameFilter AND commonNameFilter are ANDed (both must match the SAME pair)", () => {
    // "Hawthorn" (commonNameFilter) only matches Crataegus spp.'s common name, and the botanical filter also matches it - both pass -> 1.
    expect(
      classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?botanicalNameFilter=Crataegus&commonNameFilter=Hawthorn"),
    ).toEqual({ scope: "global-species-grid", expectedDelta: 1 });
    // botanicalNameFilter matches Crataegus, but commonNameFilter "Cypress" does NOT match Crataegus's common name "Hawthorn" -> 0.
    expect(
      classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Species?botanicalNameFilter=Crataegus&commonNameFilter=Cypress"),
    ).toEqual({ scope: "global-species-grid", expectedDelta: 0 });
  });

  it("scope (b): /Browse/States/25/Details expects delta exactly 1", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/States/25/Details")).toEqual({ scope: "state-25", expectedDelta: 1 });
  });

  it("returns null for any other state/site artifact - a closed two-scope list", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/States/124/Details")).toBeNull();
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/States/160/Details")).toBeNull();
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Sites/41043/Details")).toBeNull();
  });

  it("returns null for unrelated pages entirely", () => {
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Locations")).toBeNull();
    expect(classifyD016CountOnlyScope("https://www.treesdb.org/Browse/Trees/164405/Details")).toBeNull();
  });
});
