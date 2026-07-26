import { describe, expect, it } from "vitest";
import { compareMarkers, type MarkerObj } from "./markers";

function marker(overrides: Partial<MarkerObj> = {}): MarkerObj {
  return {
    Title: "Alabama",
    MinZoom: 0,
    MaxZoom: 6,
    Latitude: 32.5728149,
    Longitude: -86.68074,
    InfoLoaderUrl: "/Map/StateMarkerInfo?id=1",
    IconUrl: "/images/icons/State32.png",
    ...overrides,
  };
}

describe("compareMarkers", () => {
  it("passes when a single marker matches on every field", () => {
    const m = marker();
    const result = compareMarkers("AllMarkers", { Markers: [m] }, { Markers: [{ ...m, InfoLoaderUrl: "/api/map/states/1/info" }] });
    expect(result.diffs).toEqual([]);
  });

  it("ignores Markers array order (W-004) - matches by (Title, Latitude, Longitude) regardless of position", () => {
    const a = marker({ Title: "Alabama" });
    const b = marker({ Title: "Alaska", Latitude: 61, Longitude: -152, InfoLoaderUrl: "/Map/StateMarkerInfo?id=2" });
    const legacy = { Markers: [a, b] };
    const next = {
      Markers: [
        { ...b, InfoLoaderUrl: "/api/map/states/2/info" },
        { ...a, InfoLoaderUrl: "/api/map/states/1/info" },
      ],
    };
    expect(compareMarkers("AllMarkers", legacy, next).diffs).toEqual([]);
  });

  it("compares Latitude/Longitude as float32 for the matching key (no false mismatch from float64 tail digits)", () => {
    const a = marker({ Latitude: Math.fround(32.5728149) });
    const b = marker({ Latitude: 32.5728149, InfoLoaderUrl: "/api/map/states/1/info" }); // float64-distinct, float32-identical
    expect(compareMarkers("x", { Markers: [a] }, { Markers: [b] }).diffs).toEqual([]);
  });

  it("reports a marker present in legacy but missing from new", () => {
    const result = compareMarkers("x", { Markers: [marker()] }, { Markers: [] });
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.message).toMatch(/missing from new/);
  });

  it("reports a marker present in new but not legacy", () => {
    const result = compareMarkers("x", { Markers: [] }, { Markers: [marker()] });
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.message).toMatch(/not in legacy/);
  });

  it("compares InfoLoaderUrl via the query-id route-shape mapping", () => {
    const legacy = marker({ InfoLoaderUrl: "/Map/StateMarkerInfo?id=1" });
    const goodNext = marker({ InfoLoaderUrl: "/api/map/states/1/info" });
    const badNext = marker({ InfoLoaderUrl: "/api/map/states/2/info" });
    expect(compareMarkers("x", { Markers: [legacy] }, { Markers: [goodNext] }).diffs).toEqual([]);
    const bad = compareMarkers("x", { Markers: [legacy] }, { Markers: [badNext] });
    expect(bad.diffs.some((d) => d.field === "InfoLoaderUrl")).toBe(true);
  });

  it("compares IconUrl by pathname only, ignoring a cache-busting query string", () => {
    const legacy = marker({ IconUrl: "/images/icons/Site32.png?v=2" });
    const next = marker({ IconUrl: "/images/icons/Site32.png", InfoLoaderUrl: "/api/map/states/1/info" });
    expect(compareMarkers("x", { Markers: [legacy] }, { Markers: [next] }).diffs).toEqual([]);
  });

  it("flags a malformed (non-{Markers:[]}) payload on either side", () => {
    const result = compareMarkers("x", { Markers: [marker()] }, { oops: true });
    expect(result.diffs).toHaveLength(1);
  });

  it("BUGFIX regression: matches a tied (Title, Latitude, Longitude) group structurally, not by array index, so a same-set-different-order tie doesn't false-positive", () => {
    // Two distinct trees, same species Title, same float32-rounded coordinate (a real corpus shape - see markers.ts's compareTiedGroup doc comment).
    const base = marker({ Title: "Prosopis glandulosa var. torreyana", Latitude: 32.1, Longitude: -110.9 });
    const legacyA = { ...base, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=40586" };
    const legacyB = { ...base, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=40585" };
    // New app emits the identical pair of trees but in the OPPOSITE order.
    const nextA = { ...base, InfoLoaderUrl: "/api/map/trees/40585/info" };
    const nextB = { ...base, InfoLoaderUrl: "/api/map/trees/40586/info" };
    const result = compareMarkers("AllMarkers", { Markers: [legacyA, legacyB] }, { Markers: [nextA, nextB] });
    expect(result.diffs).toEqual([]);
  });

  it("still catches a genuine content difference within a tied group (wrong id set, not just wrong order)", () => {
    const base = marker({ Title: "Prosopis glandulosa var. torreyana", Latitude: 32.1, Longitude: -110.9 });
    const legacyA = { ...base, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=40586" };
    const legacyB = { ...base, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=40585" };
    // New app is missing id 40585 and has an extra id 99999 instead.
    const nextA = { ...base, InfoLoaderUrl: "/api/map/trees/40586/info" };
    const nextB = { ...base, InfoLoaderUrl: "/api/map/trees/99999/info" };
    const result = compareMarkers("AllMarkers", { Markers: [legacyA, legacyB] }, { Markers: [nextA, nextB] });
    expect(result.diffs).toHaveLength(2);
    expect(result.diffs.some((d) => d.message.includes("missing from new"))).toBe(true);
    expect(result.diffs.some((d) => d.message.includes("present in new but not in legacy"))).toBe(true);
  });

  // W-010 (D-016 species whitespace-duplicate cleanup, waivers.md's entry,
  // prong 1's marker clause) - real report shape from
  // parity/reports/markers-2026-07-18.md: the "Quercus  x mutabilis" ->
  // "Quercus x mutabilis" rename changes the Title half of the W-004 key.
  describe("W-010 rescue (title-rename at an identical coordinate)", () => {
    it("matches a renamed-title marker pair at the same coordinate and compares it field-wise instead of reporting missing/extra", () => {
      const legacy = marker({ Title: "Quercus  x mutabilis", Latitude: 39.4314, Longitude: -81.46378, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=555" });
      const next = marker({ Title: "Quercus x mutabilis", Latitude: 39.4314, Longitude: -81.46378, InfoLoaderUrl: "/api/map/trees/555/info" });
      const result = compareMarkers("AllMarkers", { Markers: [legacy] }, { Markers: [next] });
      expect(result.diffs).toEqual([]);
    });

    it("still reports a genuine field difference on a rescued (title-renamed) pair", () => {
      const legacy = marker({ Title: "Quercus  x mutabilis", Latitude: 39.4314, Longitude: -81.46378, MinZoom: 5, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=555" });
      const next = marker({ Title: "Quercus x mutabilis", Latitude: 39.4314, Longitude: -81.46378, MinZoom: 9, InfoLoaderUrl: "/api/map/trees/555/info" }); // genuine MinZoom change
      const result = compareMarkers("AllMarkers", { Markers: [legacy] }, { Markers: [next] });
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.field).toBe("MinZoom");
    });

    it("does not rescue a pair with the SAME (non-whitespace-differing) title - a real content difference still fails", () => {
      const legacy = marker({ Title: "Quercus alba", Latitude: 39.4314, Longitude: -81.46378, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=1" });
      const next = marker({ Title: "Quercus alba", Latitude: 39.4314, Longitude: -81.46378, InfoLoaderUrl: "/api/map/trees/2/info" }); // different tree at the same title/coords
      const result = compareMarkers("AllMarkers", { Markers: [legacy] }, { Markers: [next] });
      expect(result.diffs.length).toBeGreaterThan(0);
    });

    it("stays pairwise-unambiguous: two unmatched legacy candidates collapse-equal to the same new title at one coordinate are left unrescued", () => {
      const legacyA = marker({ Title: "Quercus  x mutabilis", Latitude: 10, Longitude: 20, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=1" });
      const legacyB = marker({ Title: "Quercus   x   mutabilis", Latitude: 10, Longitude: 20, InfoLoaderUrl: "/Map/TreeMarkerInfo?id=2" }); // a second, differently-whitespaced candidate at the SAME coordinate
      const next = marker({ Title: "Quercus x mutabilis", Latitude: 10, Longitude: 20, InfoLoaderUrl: "/api/map/trees/1/info" });
      const result = compareMarkers("AllMarkers", { Markers: [legacyA, legacyB] }, { Markers: [next] });
      // Ambiguous (two legacy candidates both collapse-equal to the one new title at this coordinate) - neither is guessed at, all three surface as diffs.
      expect(result.diffs).toHaveLength(3);
      expect(result.diffs.filter((d) => d.message.includes("missing from new"))).toHaveLength(2);
      expect(result.diffs.filter((d) => d.message.includes("present in new but not in legacy"))).toHaveLength(1);
    });
  });
});
