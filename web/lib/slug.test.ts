import { describe, expect, it } from "vitest";
import { slugify, speciesSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Quercus alba")).toBe("quercus-alba");
  });

  it("strips punctuation", () => {
    expect(slugify("Acer saccharum 'Autumn Blaze'")).toBe("acer-saccharum-autumn-blaze");
  });

  it("strips '&' leaving the flanking hyphens (documents the '--' ambiguity)", () => {
    expect(slugify("Tilia americana & Fraxinus")).toBe("tilia-americana--fraxinus");
  });

  it("strips non-ASCII characters", () => {
    expect(slugify("Café résumé")).toBe("caf-rsum");
  });

  it("strips surrounding parentheses", () => {
    expect(slugify("(Unidentified)")).toBe("unidentified");
  });

  it("collapses multiple whitespace runs to single hyphens", () => {
    expect(slugify("Quercus   alba")).toBe("quercus-alba");
  });

  it("handles already-empty / punctuation-only input", () => {
    expect(slugify("---")).toBe("---");
    expect(slugify("???")).toBe("");
  });
});

describe("speciesSlug", () => {
  it("joins botanical + common name slugs with '--'", () => {
    expect(speciesSlug("Quercus alba", "White Oak")).toBe("quercus-alba--white-oak");
  });

  it("handles the unidentified-species case", () => {
    expect(speciesSlug("(Unidentified)", "(Unidentified)")).toBe("unidentified--unidentified");
  });

  it("handles punctuation and non-ASCII in both parts", () => {
    expect(speciesSlug("Acer saccharum 'Autumn Blaze'", "Café Maple")).toBe(
      "acer-saccharum-autumn-blaze--caf-maple",
    );
  });
});
