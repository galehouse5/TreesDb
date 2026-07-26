// GET /api/map/markers -- port of `Map/AllMarkers` (`TMD/Controllers/
// MapController.cs:34-54`), doc 01 §9, doc 03 P1-10.
//
// Legacy JSON contract, reproduced verbatim (PascalCase, exact key set --
// `MapMarkerModel.cs:16-28`'s `ToJson`): `{ Markers: [{ Title, MinZoom,
// MaxZoom, Latitude, Longitude, InfoLoaderUrl, IconUrl }, ...] }`. The query
// layer (`db/queries/map.sql.ts`) returns camelCase rows without URLs; this
// route owns building `InfoLoaderUrl` (per doc 03's URL table / `normalize.
// ts`'s "map-{state,site,tree}-marker-info" entries: `/api/map/{states,
// sites,trees}/{id}/info`) and the final PascalCase envelope.
//
// Legacy output-caches this response (`[OutputCache(Duration = int.MaxValue,
// VaryByCustom = "LastMetricsUpdateTimestamp")]`) -- there is no equivalent
// "vary by a DB-derived cache-bust key" primitive available here without
// extra plumbing outside this task's scope, so this route is left
// uncached (dynamic) rather than serving a possibly-stale response;
// revisit under a future caching task if AllMarkers latency becomes an
// issue at production data volume.
import { NextResponse } from "next/server";
import { allMapMarkers, type MapMarkerRow } from "@/db/queries/map.sql";

function infoLoaderUrl(marker: MapMarkerRow): string {
  switch (marker.kind) {
    case "state":
      return `/api/map/states/${marker.id}/info`;
    case "site":
      return `/api/map/sites/${marker.id}/info`;
    case "tree":
      return `/api/map/trees/${marker.id}/info`;
  }
}

export async function GET() {
  const markers = await allMapMarkers();
  return NextResponse.json({
    Markers: markers.map((m) => ({
      Title: m.title,
      MinZoom: m.minZoom,
      MaxZoom: m.maxZoom,
      Latitude: m.latitude,
      Longitude: m.longitude,
      InfoLoaderUrl: infoLoaderUrl(m),
      IconUrl: m.iconUrl,
    })),
  });
}
