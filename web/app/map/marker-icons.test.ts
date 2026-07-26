import { describe, expect, it } from "vitest";
import { MODERN_ICONS, isModernIconAsset, resolveMarkerIconAsset } from "@/components/map/marker-icons";

// Covers the client-side marker icon remap (design-audit item 3). See
// components/map/marker-icons.ts's file header for why this test lives
// under app/map/ rather than next to the module it tests.
describe("marker icon remap", () => {
  it("maps each API default icon URL to its modernized SVG chip", () => {
    expect(MODERN_ICONS).toEqual({
      "/images/icons/Tree32.png": "/images/icons/tree-marker.svg",
      "/images/icons/Site32.png?v=2": "/images/icons/site-marker.svg",
      "/images/icons/State32.png": "/images/icons/state-marker.svg",
    });
  });

  it("resolves default icon URLs to their SVG replacement", () => {
    expect(resolveMarkerIconAsset("/images/icons/Tree32.png")).toBe("/images/icons/tree-marker.svg");
    expect(resolveMarkerIconAsset("/images/icons/Site32.png?v=2")).toBe("/images/icons/site-marker.svg");
    expect(resolveMarkerIconAsset("/images/icons/State32.png")).toBe("/images/icons/state-marker.svg");
  });

  it("leaves photo-backed and unrecognized icon URLs unchanged", () => {
    expect(resolveMarkerIconAsset("/photos/555/SmallMapSquare")).toBe("/photos/555/SmallMapSquare");
    // The bare filename (no `?v=2`) never actually appears as a site
    // IconUrl today -- confirm the remap keys on the exact string, not a
    // prefix match.
    expect(resolveMarkerIconAsset("/images/icons/Site32.png")).toBe("/images/icons/Site32.png");
  });

  it("isModernIconAsset agrees with resolveMarkerIconAsset", () => {
    for (const key of Object.keys(MODERN_ICONS)) {
      expect(isModernIconAsset(key)).toBe(true);
    }
    expect(isModernIconAsset("/photos/1/SmallMapSquare")).toBe(false);
    expect(isModernIconAsset("/images/icons/Site32.png")).toBe(false);
  });
});
