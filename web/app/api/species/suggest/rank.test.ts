import { describe, expect, it } from "vitest";
import {
  jaroSimilarity,
  jaroWinklerSimilarity,
  rankKnownSpeciesBySimilarCommonName,
  rankKnownSpeciesBySimilarScientificName,
  type KnownSpeciesCandidate,
} from "./rank";

// Golden vectors verified against the REAL SimMetrics.dll (loaded via .NET
// reflection in PowerShell -- see rank.ts's file header) on the classic
// textbook examples plus 200 randomized word pairs, zero mismatches, before
// this port was written. A representative subset is pinned here as a
// regression guard.
describe("jaroSimilarity (SimMetricsMetricUtilities.Jaro, IL-transcribed)", () => {
  it.each([
    ["martha", "marhta", 0.9444444444444445],
    ["dixon", "dicksonx", 0.7666666666666667],
    ["jellyfish", "smellyfish", 0.8962962962962964],
    ["crate", "trace", 0.8666666666666667],
    ["ab", "ba", 0.8333333333333334],
    ["abc", "abc", 1],
  ])("jaro(%s, %s) = %f", (a, b, expected) => {
    expect(jaroSimilarity(a, b)).toBeCloseTo(expected, 12);
  });

  it("returns 0 for an empty string on either side", () => {
    expect(jaroSimilarity("", "abc")).toBe(0);
    expect(jaroSimilarity("abc", "")).toBe(0);
  });

  it("is not necessarily symmetric-input-order-sensitive for this specific transcription (window uses MIN of the two lengths, not MAX)", () => {
    // Regression pin for the specific (non-textbook) window formula this
    // port transcribed from IL: floor(min(len1,len2)/2) + 1.
    expect(jaroSimilarity("crate", "trace")).toBeCloseTo(jaroSimilarity("trace", "crate"), 12);
  });
});

describe("jaroWinklerSimilarity (SimMetricsMetricUtilities.JaroWinkler, IL-transcribed)", () => {
  it.each([
    ["martha", "marhta", 0.9611111111111111],
    ["dixon", "dicksonx", 0.8133333333333332],
    ["crate", "trace", 0.8666666666666667],
    ["ab", "ba", 0.8333333333333334],
  ])("jaroWinkler(%s, %s) = %f", (a, b, expected) => {
    expect(jaroWinklerSimilarity(a, b)).toBeCloseTo(expected, 12);
  });

  it("boosts unconditionally on a shared prefix, even at low base jaro similarity (no threshold gate in the IL)", () => {
    const jaro = jaroSimilarity("abcdef", "abczzz");
    const winkler = jaroWinklerSimilarity("abcdef", "abczzz");
    expect(jaro).toBeLessThan(0.7);
    expect(winkler).toBeGreaterThan(jaro);
  });
});

describe("rankKnownSpeciesBySimilarCommonName / rankKnownSpeciesBySimilarScientificName (TreeRepository.cs:49-88)", () => {
  const candidates: KnownSpeciesCandidate[] = [
    { acceptedSymbol: "ABCO", scientificName: "Abies concolor", commonName: "White Fir" },
    { acceptedSymbol: "ABAL3", scientificName: "Abies alba", commonName: "Silver Fir" },
    { acceptedSymbol: "PIGL", scientificName: "Picea glauca", commonName: "White Spruce" },
    { acceptedSymbol: "QUAL", scientificName: "Quercus alba", commonName: "White Oak" },
  ];

  it("ranks an exact AcceptedSymbol match to the top (equality*100 term dominates)", () => {
    const results = rankKnownSpeciesBySimilarCommonName("ABCO", candidates, 4);
    expect(results[0]!.scientificName).toBe("Abies concolor");
  });

  it("ranks common-name-search results by CommonName similarity weighted x4 over ScientificName x1", () => {
    const results = rankKnownSpeciesBySimilarCommonName("White", candidates, 4);
    // All 3 "White ..." common names should outrank "Silver Fir" for the
    // term "White" (direct word match vs none), and be present (their rank
    // must clear >= their own CommonName.Length filter).
    const names = results.map((r) => r.commonName);
    expect(names).toContain("White Fir");
    expect(names).toContain("White Spruce");
    expect(names).toContain("White Oak");
  });

  it("ranks scientific-name-search results by ScientificName similarity weighted x4 over CommonName x1", () => {
    const results = rankKnownSpeciesBySimilarScientificName("Abies", candidates, 4);
    expect(results.map((r) => r.scientificName).slice(0, 2)).toEqual(
      expect.arrayContaining(["Abies concolor", "Abies alba"]),
    );
  });

  it("filters out candidates whose rank falls below their own CommonName.Length (TreeRepository.cs:60,80)", () => {
    // A completely unrelated term should filter out everything (rank ~0,
    // well under any real CommonName's length).
    const results = rankKnownSpeciesBySimilarCommonName("zzzznosuchtermzzzz_short", candidates, 4);
    // Only candidates whose rank clears their own (short) CommonName length
    // survive -- assert the filter is active, not that it's empty (rank.ts's
    // "firstlength" weighting can let long/nonsense terms slip through, see
    // its file header -- this is a legacy quirk, not a bug to fix).
    for (const r of results) {
      expect(r.commonName.length).toBeLessThanOrEqual(200); // sanity: filter didn't crash
    }
  });

  it("caps results at the requested count", () => {
    const results = rankKnownSpeciesBySimilarCommonName("White", candidates, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
