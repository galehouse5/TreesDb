import { describe, expect, it } from "vitest";
import { parseSpeciesSegment } from "./species-segment";

describe("parseSpeciesSegment", () => {
  it("parses a normal {bn} ({cn}) segment", () => {
    expect(parseSpeciesSegment("Quercus alba (White Oak)")).toEqual({
      botanicalName: "Quercus alba",
      commonName: "White Oak",
    });
  });

  // BUGFIX regression (surfaced by the P1-15 sweep): a nested paren group
  // inside commonName previously made this return null unconditionally
  // (see this file's BUGFIX doc comment), producing a real 404 on a URL
  // legacy itself serves 200 for.
  it("splits on the LAST ' (' when commonName itself contains a nested paren group", () => {
    expect(parseSpeciesSegment("Vitis labrusca (Northern Fox Grape (Vine))")).toEqual({
      botanicalName: "Vitis labrusca (Northern Fox Grape",
      commonName: "Vine)",
    });
  });

  it("returns null when there is no ' (' at all", () => {
    expect(parseSpeciesSegment("Quercus alba")).toBeNull();
  });

  it("returns null when the segment doesn't end with ')'", () => {
    expect(parseSpeciesSegment("Quercus alba (White Oak")).toBeNull();
  });
});
