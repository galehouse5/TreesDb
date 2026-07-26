// Client-side marker icon remaster (design-audit item 3, docs/design/BRAND.md).
//
// Pure/DOM-free on purpose: map-view.tsx's other imports (maplibre-gl, its
// CSS) aren't safe to load in a plain node test environment, but this
// mapping is worth covering directly, so it lives in its own module and gets
// exercised by app/map/marker-icons.test.ts (vitest's config only discovers
// test files under lib/**, db/**, parity/**, scripts/**, and app/**, not
// components/** -- this file is the thing under test, not the test itself).
//
// IMPORTANT (parity): `GET /api/map/markers`' `IconUrl` values are parity-
// compared verbatim by `parity/verify/markers.ts` and MUST NOT change. This
// remap never touches that data -- map-view.tsx's `loadMarkerIcon` still
// registers the rasterized replacement image under the ORIGINAL `IconUrl`
// string as MapLibre's image id; only which asset gets fetched/rasterized
// for that id changes.
//
// Keyed on the exact default `IconUrl` strings `db/queries/map.sql.ts`
// produces (`iconUrl: "/images/icons/State32.png"` /
// `siteOrTreeIconUrl(r.photo_id, "/images/icons/Site32.png?v=2")` /
// `siteOrTreeIconUrl(r.photo_id, "/images/icons/Tree32.png")` -- note the
// site default's literal `?v=2` cache-busting suffix is part of the string).
// Photo-backed markers (`/photos/{id}/SmallMapSquare`) are intentionally
// NOT remapped -- those are real photo thumbnails, not glyph icons.
export const MODERN_ICONS: Record<string, string> = {
  "/images/icons/Tree32.png": "/images/icons/tree-marker.svg",
  "/images/icons/Site32.png?v=2": "/images/icons/site-marker.svg",
  "/images/icons/State32.png": "/images/icons/state-marker.svg",
};

/**
 * CSS-pixel footprint the SVG marker chips are rasterized at
 * (map-view.tsx's `loadMarkerIcon`), before `devicePixelRatio` scaling.
 */
export const MODERN_ICON_SIZE = 40;

/**
 * Resolves the asset URL MapLibre should actually fetch/rasterize for a
 * given API `IconUrl`: the modernized SVG chip when one exists for that
 * exact icon URL (state/site/tree defaults), otherwise the URL unchanged.
 */
export function resolveMarkerIconAsset(iconUrl: string): string {
  return MODERN_ICONS[iconUrl] ?? iconUrl;
}

/**
 * True when `iconUrl` resolves to one of the modernized SVG chips, as
 * opposed to a raw raster/photo asset that should go through MapLibre's
 * `loadImage`.
 */
export function isModernIconAsset(iconUrl: string): boolean {
  return Object.hasOwn(MODERN_ICONS, iconUrl);
}
