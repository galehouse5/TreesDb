import { describe, expect, it } from "vitest";
import { BASEMAP_LAYER_IDS, BASEMAP_SOURCES, BASEMAPS, basemapLayers, isBasemapId, layerVisibility } from "@/components/map/basemaps";

describe("basemaps", () => {
  it("offers legacy's four map types", () => {
    expect(BASEMAPS.map((b) => b.id)).toEqual(["streets", "terrain", "satellite", "hybrid"]);
  });

  it("shows exactly one raster layer except hybrid, which adds labels on imagery", () => {
    const visible = (id: Parameters<typeof layerVisibility>[0]) =>
      BASEMAP_LAYER_IDS.filter((l) => layerVisibility(id, l) === "visible");
    expect(visible("streets")).toEqual(["basemap-osm"]);
    expect(visible("terrain")).toEqual(["basemap-topo"]);
    expect(visible("satellite")).toEqual(["basemap-esri-imagery"]);
    expect(visible("hybrid")).toEqual(["basemap-esri-imagery", "basemap-esri-labels"]);
  });

  it("builds a layer for every id, each pointing at a defined source, labels above imagery", () => {
    const layers = basemapLayers("hybrid");
    expect(layers.map((l) => l.id)).toEqual(BASEMAP_LAYER_IDS);
    for (const l of layers) {
      expect(BASEMAP_SOURCES[(l as { source: string }).source]).toBeDefined();
    }
  });

  it("recognises only known ids", () => {
    expect(isBasemapId("terrain")).toBe(true);
    expect(isBasemapId("roadmap")).toBe(false);
    expect(isBasemapId(null)).toBe(false);
  });
});
