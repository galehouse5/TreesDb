import { describe, expect, it } from "vitest";
import { buildRankGroups, compareAutocomplete, compareSearch, computeRank } from "./search";

describe("computeRank", () => {
  it("species: sums the six prefix/suffix/contains flags across ScientificName (Subject) and CommonName (Description)", () => {
    // "Alnus" is a prefix of "Alnus japonica" (Subject: +1 for prefix, +1 for contains = 2); no match in "Japanese Alder".
    const rank = computeRank("Alnus", { Category: "species", Subject: "Alnus japonica", Description: "Japanese Alder", Url: "" });
    expect(rank).toBe(2);
  });

  it("sites: recovers County from 'County, State (id)' Description text", () => {
    // Subject "Ragged Mountain Natural Area" doesn't contain "Albemarle"; County "Albemarle" contains+prefix+suffix (exact match) = 3.
    const rank = computeRank("Albemarle", {
      Category: "sites",
      Subject: "Ragged Mountain Natural Area",
      Description: "Albemarle, Virginia (43)",
      Url: "",
    });
    expect(rank).toBe(3);
  });

  it("states: reduced 3-flag Name-only rank (code bonus not recoverable from response text - documented limitation)", () => {
    // "Ala" is a prefix of "Alabama" (+1) and therefore also a substring (+1) = 2; not a suffix.
    const rank = computeRank("Ala", { Category: "states", Subject: "Alabama", Description: "United States", Url: "" });
    expect(rank).toBe(2);
    // A term matching all three (prefix+suffix+contains, i.e. term === name) scores 3.
    expect(computeRank("Alabama", { Category: "states", Subject: "Alabama", Description: "x", Url: "" })).toBe(3);
  });
});

describe("buildRankGroups", () => {
  it("partitions consecutive same-(category,rank) rows into groups, skipping message rows", () => {
    const rows = [
      { Category: "states", Subject: "Alabama", Description: "United States", Url: "/Browse/States/1/Details" },
      { Category: "states", Subject: "Alaska", Description: "United States", Url: "/Browse/States/62/Details" },
      { Category: "sites", Subject: "Alan Seeger Natural Area", Description: "Huntingdon, Pennsylvania (36)", Url: "/Browse/Sites/1/Details" },
      { Category: "message", Subject: "", Description: "Show more results", Url: "/Search?term=Al" },
    ];
    const groups = buildRankGroups("Al", rows);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.category).toBe("states");
    expect(groups[0]!.rows).toHaveLength(2);
    expect(groups[1]!.category).toBe("sites");
  });
});

describe("compareSearch", () => {
  const term = "Al";
  const stateA = { Category: "states", Subject: "Alabama", Description: "United States", Url: "/Browse/States/1/Details" };
  const stateB = { Category: "states", Subject: "Alaska", Description: "United States", Url: "/Browse/States/62/Details" };

  it("passes when rows match, order-insensitively within a tied rank group", () => {
    const legacy = [stateA, stateB];
    // Same rank group (both rank 1, Name-prefix "Al"), reordered + URL mapped to the new shape.
    const next = [
      { ...stateB, Url: "/states/62" },
      { ...stateA, Url: "/states/1" },
    ];
    expect(compareSearch("x", term, legacy, next).diffs).toEqual([]);
  });

  it("fails when a row is missing from the new side", () => {
    const legacy = [stateA, stateB];
    const next = [{ ...stateA, Url: "/states/1" }];
    const result = compareSearch("x", term, legacy, next);
    expect(result.diffs.some((d) => d.message.includes("Alaska") && d.message.includes("missing from new"))).toBe(true);
  });

  it("fails when Url is not route-equivalent", () => {
    const legacy = [stateA];
    const next = [{ ...stateA, Url: "/states/999" }];
    const result = compareSearch("x", term, legacy, next);
    expect(result.diffs.some((d) => d.field === "Url")).toBe(true);
  });

  it("requires message rows to appear under the same conditions", () => {
    const legacy = [stateA, { Category: "message", Subject: "", Description: "Show more results", Url: "/Search?term=Al" }];
    const next = [{ ...stateA, Url: "/states/1" }]; // missing the "Show more results" row
    const result = compareSearch("x", term, legacy, next);
    expect(result.diffs.some((d) => d.field === "message-row")).toBe(true);
  });

  // W-010 (D-016 species whitespace-duplicate cleanup) - legacy's extra
  // whitespace-duplicate species row (e.g. "Crataegus  spp.") has no
  // counterpart on the new side after the D-016 merge; tagged W-010 (a
  // definitive attribution) rather than the W-009 cap-boundary heuristic.
  // Term "zzz-no-match" deliberately matches nothing, so every row below
  // computes rank 0 and lands in one shared "species" rank group (rather
  // than each forming its own single-row group, which would surface as a
  // "rank-group present on one side only" diff instead of a row-level one).
  const keeperLegacy = { Category: "species", Subject: "Quercus alba", Description: "White Oak", Url: "/Browse/Species/Quercus alba (White Oak)/Details" };
  const keeperNew = { Category: "species", Subject: "Quercus alba", Description: "White Oak", Url: "/species/quercus-alba--white-oak" };

  it("tags a merged-pair species row present in legacy but missing from new with waiverHint W-010", () => {
    const pairRow = { Category: "species", Subject: "Crataegus  spp.", Description: "Hawthorn", Url: "/Browse/Species/Crataegus%20%20spp.%20(Hawthorn)/Details" };
    const legacy = [pairRow, keeperLegacy];
    const next = [keeperNew];
    const result = compareSearch("x", "zzz-no-match", legacy, next);
    const merged = result.diffs.find((d) => d.field === "results" && d.message.includes("Crataegus"));
    expect(merged?.waiverHint).toBe("W-010");
  });

  it("does not tag an unrelated species row missing from new (still fails untagged when below the AJAX cap)", () => {
    const unrelatedRow = { Category: "species", Subject: "Fraxinus americana", Description: "White Ash", Url: "/Browse/Species/Fraxinus%20americana%20(White%20Ash)/Details" };
    const legacy = [unrelatedRow, keeperLegacy];
    const next = [keeperNew];
    const result = compareSearch("x", "zzz-no-match", legacy, next);
    const missing = result.diffs.find((d) => d.field === "results" && d.message.includes("Fraxinus"));
    expect(missing?.waiverHint).toBeUndefined();
  });
});

describe("compareAutocomplete", () => {
  it("compares as an unordered set of (value, ScientificName/CommonName) pairs", () => {
    const legacy = [
      { label: "Pacific Willow (Salix lucida ssp. lasiandra)", value: "Pacific Willow", ScientificName: "Salix lucida ssp. lasiandra" },
      { label: "Pacific Yew (Taxus brevifolia)", value: "Pacific Yew", ScientificName: "Taxus brevifolia" },
    ];
    const next = [legacy[1], legacy[0]]; // reordered
    expect(compareAutocomplete("x", legacy, next as typeof legacy).diffs).toEqual([]);
  });

  it("reports a suggestion missing on either side", () => {
    const legacy = [{ value: "Pacific Willow", ScientificName: "Salix lucida ssp. lasiandra" }];
    const result = compareAutocomplete("x", legacy, []);
    expect(result.diffs).toHaveLength(1);
  });
});
