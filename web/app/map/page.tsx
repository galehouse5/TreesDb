"use client";

// P1-10: Map + markers + info popups (replaces the P1-09-and-earlier
// placeholder). MapLibre GL touches the DOM/canvas directly and cannot run
// during SSR/RSC rendering, so the actual map (`components/map/map-view.tsx`)
// is loaded via `next/dynamic` with `ssr: false` -- which itself requires
// this file to be a Client Component (Next.js app router only allows
// `ssr: false` dynamic imports from Client Components).
//
// Task P1-16 ("View on map" deep link): site/tree detail Location panels
// link here as `/map?lat={lat}&lng={lng}&zoom=14`. `?lat=`/`?lng=`/`?zoom=`
// are read via `useSearchParams` and passed down as `MapView`'s
// `initialView` prop (used only for the map's initial center/zoom -- see
// that component's file header). `useSearchParams` opts its component into
// client-side-only rendering up to the nearest Suspense boundary during
// prerendering (Next.js's documented requirement), so the search-params
// read is isolated into its own small component wrapped in `<Suspense>`
// below, rather than reading it directly in `MapPage` -- everything else
// about this page (the dynamic `MapView` import, its own loading fallback)
// is unchanged.
import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MapInitialView } from "@/components/map/map-view";

const MapView = dynamicImport(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
      <div className="absolute inset-0 animate-pulse bg-muted-foreground/5" aria-hidden />
      <span className="relative text-sm text-muted-foreground">Loading map…</span>
    </div>
  ),
});

// `?zoom=` falls back to this when absent/invalid but `?lat=`/`?lng=` are
// still both valid -- the same zoom level every "View on map" link this
// codebase generates already passes explicitly (site/tree detail pages,
// `components/details/report-table.tsx`'s `ViewOnMapLink`), so a hand-typed
// URL that omits it still lands on a sensible close-in view.
const DEFAULT_DEEPLINK_ZOOM = 14;

/**
 * Parses `?lat=`/`?lng=`/`?zoom=` into `MapView`'s `initialView` prop.
 * `lat`/`lng` must BOTH be present and valid (finite, in-range) or the
 * whole thing is treated as absent -- "invalid/missing params -> exactly
 * current behavior" (task brief), i.e. `MapView`'s own continental-US
 * default placeholder + fit-to-markers-on-load, unchanged.
 */
function parseInitialView(searchParams: URLSearchParams): MapInitialView | undefined {
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  if (latRaw === null || lngRaw === null) return undefined;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;

  const zoomRaw = searchParams.get("zoom");
  const zoomParsed = zoomRaw !== null ? Number(zoomRaw) : NaN;
  const zoom = Number.isFinite(zoomParsed) ? zoomParsed : DEFAULT_DEEPLINK_ZOOM;

  return { lat, lng, zoom };
}

function MapViewWithInitialView() {
  const searchParams = useSearchParams();
  const initialView = parseInitialView(searchParams);
  return <MapView initialView={initialView} />;
}

export default function MapPage() {
  return (
    <div className="relative min-h-[70vh] flex-1">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
            <div className="absolute inset-0 animate-pulse bg-muted-foreground/5" aria-hidden />
            <span className="relative text-sm text-muted-foreground">Loading map…</span>
          </div>
        }
      >
        <MapViewWithInitialView />
      </Suspense>
    </div>
  );
}
