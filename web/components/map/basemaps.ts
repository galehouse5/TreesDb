// Basemaps for the main map (/map). Legacy's Google map offered Terrain
// (its default), Road, Satellite and Hybrid (TMD/js/Map/Widgets.js:4-6).
// This keeps the same four, using tile services that need no API key
// (D-025): OSM for streets, OpenTopoMap for terrain, Esri World Imagery for
// satellite, and Esri imagery plus Esri's boundaries-and-places labels for
// hybrid. All raster layers are added once; switching only flips layer
// visibility, so the marker layers added on load survive a switch (a
// setStyle call would drop them).
import type { LayerSpecification, SourceSpecification } from "maplibre-gl";

export type BasemapId = "streets" | "terrain" | "satellite" | "hybrid";

export const BASEMAPS: { id: BasemapId; label: string }[] = [
  { id: "streets", label: "Map" },
  { id: "terrain", label: "Terrain" },
  { id: "satellite", label: "Satellite" },
  { id: "hybrid", label: "Hybrid" },
];

export const DEFAULT_BASEMAP: BasemapId = "streets";

const ESRI_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";

export const BASEMAP_SOURCES: Record<string, SourceSpecification> = {
  osm: {
    type: "raster",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
  },
  topo: {
    type: "raster",
    tiles: [
      "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
    ],
    tileSize: 256,
    maxzoom: 17,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, SRTM &mdash; Style &copy; <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)',
  },
  "esri-imagery": {
    type: "raster",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    tileSize: 256,
    maxzoom: 19,
    attribution: ESRI_ATTRIBUTION,
  },
  "esri-labels": {
    type: "raster",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
  },
};

// Which raster layers each basemap shows. Hybrid stacks labels on imagery.
const VISIBLE_LAYERS: Record<BasemapId, string[]> = {
  streets: ["basemap-osm"],
  terrain: ["basemap-topo"],
  satellite: ["basemap-esri-imagery"],
  hybrid: ["basemap-esri-imagery", "basemap-esri-labels"],
};

export const BASEMAP_LAYER_IDS = ["basemap-osm", "basemap-topo", "basemap-esri-imagery", "basemap-esri-labels"];

export function layerVisibility(basemap: BasemapId, layerId: string): "visible" | "none" {
  return VISIBLE_LAYERS[basemap].includes(layerId) ? "visible" : "none";
}

export function isBasemapId(value: unknown): value is BasemapId {
  return BASEMAPS.some((b) => b.id === value);
}

export function basemapLayers(basemap: BasemapId): LayerSpecification[] {
  return [
    {
      id: "basemap-osm",
      type: "raster",
      source: "osm",
      layout: { visibility: layerVisibility(basemap, "basemap-osm") },
      // Map UX audit: OSM standard tiles are a warm, high-chroma sheet that
      // competed with the marker chips; desaturating and slightly
      // compressing contrast pushes the basemap into the background.
      paint: {
        "raster-saturation": -0.55,
        "raster-contrast": -0.12,
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.94,
      },
    },
    {
      id: "basemap-topo",
      type: "raster",
      source: "topo",
      layout: { visibility: layerVisibility(basemap, "basemap-topo") },
      paint: { "raster-saturation": -0.3 },
    },
    {
      id: "basemap-esri-imagery",
      type: "raster",
      source: "esri-imagery",
      // Imagery stays full-color: it's chosen for detail.
      layout: { visibility: layerVisibility(basemap, "basemap-esri-imagery") },
    },
    {
      id: "basemap-esri-labels",
      type: "raster",
      source: "esri-labels",
      layout: { visibility: layerVisibility(basemap, "basemap-esri-labels") },
    },
  ];
}
