// Shared client-side types for the map feature (P1-10).
//
// `MarkersResponse`/`MarkerJson` mirror the exact legacy JSON contract
// (`TMD/Models/Map/MapMarkerModel.cs:16-28`'s `ToJson`, doc 01 §9) --
// PascalCase keys, no extra fields -- produced by `GET /api/map/markers`
// (`app/api/map/markers/route.ts`).

export interface MarkerJson {
  Title: string;
  MinZoom: number;
  MaxZoom: number;
  Latitude: number;
  Longitude: number;
  InfoLoaderUrl: string;
  IconUrl: string;
}

export interface MarkersResponse {
  Markers: MarkerJson[];
}

export type MarkerKind = "state" | "site" | "tree";

/**
 * The marker list carries no explicit "kind" field (matching the legacy
 * contract exactly, see above) -- derived client-side from the shape of
 * `InfoLoaderUrl` (`/api/map/{states,sites,trees}/{id}/info`, per doc 03's
 * URL table / `normalize.ts`'s "map-*-marker-info" entries).
 */
export function markerKindFromInfoLoaderUrl(infoLoaderUrl: string): MarkerKind | null {
  const match = /\/api\/map\/(states|sites|trees)\/\d+\/info$/.exec(infoLoaderUrl);
  if (!match) return null;
  const segment = match[1];
  if (segment === "states") return "state";
  if (segment === "sites") return "site";
  return "tree";
}

/** `Feature.properties` shape stored on the "markers" GeoJSON source in MapView.tsx. */
export interface MarkerFeatureProperties {
  title: string;
  minZoom: number;
  maxZoom: number;
  infoLoaderUrl: string;
  iconUrl: string;
}

export interface MarkerFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: MarkerFeatureProperties;
  }>;
}
