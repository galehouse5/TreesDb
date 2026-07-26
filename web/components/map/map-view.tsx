"use client";

// Interactive map (P1-10): MapLibre GL + OSM raster tiles, fed by
// `GET /api/map/markers` (fetched once, doc 03 P1-10). Zoom-band visibility
// (states 0-6/0-30, sites 7-13/7-30, trees 14-30 -- doc 01 §9) is applied
// client-side via a MapLibre filter expression on each marker's
// `MinZoom`/`MaxZoom`, NOT server-side and NOT via clustering (doc 03: "client
// clusters nothing").
//
// Rendered via `next/dynamic` with `ssr: false` from `app/map/page.tsx`
// (MapLibre touches `window`/canvas at module scope and cannot run during
// SSR/RSC rendering).
import maplibregl, { type ExpressionSpecification, type FilterSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map-overrides.css";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { isModernIconAsset, MODERN_ICON_SIZE, resolveMarkerIconAsset } from "./marker-icons";
import { MarkerInfoPopup } from "./marker-info-popup";
import type { MarkerFeatureCollection, MarkerFeatureProperties, MarkersResponse } from "./types";
import { markerKindFromInfoLoaderUrl } from "./types";

const MARKERS_SOURCE_ID = "markers";
const MARKERS_LAYER_ID = "markers";
const MARKER_RING_LAYER_ID = "marker-hover-ring";

// Continental-US-ish default viewport -- legacy's `Map/Index` fits the
// browser to the bounding box of every site's raw Coordinates
// (`MapMapping.cs:58-60`, `CoordinateBounds.Create` over
// `Repositories.Sites.ListAll()`); this port achieves the equivalent effect
// by fitting to the bounding box of the fetched marker set once it loads
// (below), with this center/zoom only as the pre-fetch placeholder so the
// map isn't blank while `/api/map/markers` is in flight.
const INITIAL_CENTER: [number, number] = [-98.5, 39.8];
const INITIAL_ZOOM = 3.3;

// Task P1-16 ("View on map" deep link): `app/map/page.tsx` parses
// `?lat=&lng=&zoom=` (site/tree detail Location panels' lighter equivalent
// of legacy's embedded Summary|Map toggle) and passes the result down here.
// When present, this OVERRIDES the continental-US placeholder view above --
// AND skips the post-load `fitBounds` call below (see the `map.on("load", ...)`
// handler), since fitting to every marker's bounding box would immediately
// zoom back out and defeat the deep link's whole purpose.
export interface MapInitialView {
  lat: number;
  lng: number;
  zoom: number;
}

// Rasterizes one of the modernized SVG marker chips (public/images/icons/
// {tree,site,state}-marker.svg) onto an offscreen canvas at
// `MODERN_ICON_SIZE` CSS px times the display's devicePixelRatio, so the
// chip stays crisp on retina displays -- MapLibre's `addImage` is told the
// resulting `pixelRatio` so it renders back down at the intended CSS size
// (see the "icon-size" ramp below, which is scaled to account for this
// asset's native footprint being larger than the legacy 32px PNGs').
async function rasterizeSvgIcon(assetUrl: string): Promise<{ imageData: ImageData; pixelRatio: number }> {
  const pixelRatio = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
  const pixelSize = Math.round(MODERN_ICON_SIZE * pixelRatio);
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`failed to load ${assetUrl}`));
    img.src = assetUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("map-view: 2d canvas context unavailable for marker icon rasterization");
  ctx.drawImage(img, 0, 0, pixelSize, pixelSize);
  return { imageData: ctx.getImageData(0, 0, pixelSize, pixelSize), pixelRatio };
}

// `url` here is always the marker's original `IconUrl` (the API contract --
// see components/map/marker-icons.ts's file header for why that must never
// change) and doubles as the id MapLibre registers the loaded image under.
// For the three default state/site/tree icons, the actual bytes fetched are
// swapped for a modernized SVG chip (client-side rendering only); every
// other IconUrl (photo-backed site/tree markers) loads unchanged via
// MapLibre's own `loadImage`.
async function loadMarkerIcon(map: maplibregl.Map, url: string): Promise<void> {
  if (map.hasImage(url)) return;
  try {
    if (isModernIconAsset(url)) {
      const { imageData, pixelRatio } = await rasterizeSvgIcon(resolveMarkerIconAsset(url));
      if (!map.hasImage(url)) map.addImage(url, imageData, { pixelRatio });
      return;
    }
    const { data } = await map.loadImage(url);
    if (!map.hasImage(url)) map.addImage(url, data);
  } catch (err) {
    console.error(`map-view: failed to load marker icon ${url}`, err);
    // Degrade to the original PNG bytes rather than leaving MapLibre with a
    // missing image id (which renders NOTHING for every marker using it --
    // a silently empty map if the SVG chip fails to rasterize).
    try {
      const { data } = await map.loadImage(url);
      if (!map.hasImage(url)) map.addImage(url, data);
    } catch (fallbackErr) {
      console.error(`map-view: PNG fallback also failed for ${url}`, fallbackErr);
    }
  }
}

export default function MapView({ initialView }: { initialView?: MapInitialView }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let unmounted = false;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
          },
        },
        // Map UX audit: OSM standard tiles are a warm, high-chroma sheet
        // (beige land / pastel green parks / blue water) that competed with
        // the marker chips for salience -- desaturating and slightly
        // compressing the tile contrast pushes the basemap into the
        // background so markers are the most colorful thing on screen.
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: {
              "raster-saturation": -0.55,
              "raster-contrast": -0.12,
              "raster-brightness-min": 0.08,
              "raster-brightness-max": 0.94,
            },
          },
        ],
      },
      center: initialView ? [initialView.lng, initialView.lat] : INITIAL_CENTER,
      zoom: initialView ? initialView.zoom : INITIAL_ZOOM,
      minZoom: 0,
      maxZoom: 22,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // Task P1-16 (fullscreen control): legacy's map had a fullscreen toggle;
    // added next to the zoom controls in the same corner. No bespoke CSS
    // needed -- `components/map/map-overrides.css`'s existing
    // `.maplibregl-ctrl-group`/`.maplibregl-ctrl-group button` rules already
    // apply generically to every control group MapLibre renders (not scoped
    // to NavigationControl specifically), so this picks up the same
    // rounded-corner/shadow/40px styling automatically.
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", async () => {
      let markers: MarkersResponse["Markers"] = [];
      try {
        const res = await fetch("/api/map/markers");
        if (!res.ok) throw new Error(`GET /api/map/markers failed: ${res.status}`);
        const body = (await res.json()) as MarkersResponse;
        markers = body.Markers;
      } catch (err) {
        console.error("map-view: failed to load markers", err);
        return;
      }
      if (unmounted) return;

      const iconUrls = Array.from(new Set(markers.map((m) => m.IconUrl)));
      await Promise.all(iconUrls.map((url) => loadMarkerIcon(map, url)));

      const featureCollection: MarkerFeatureCollection = {
        type: "FeatureCollection",
        features: markers.map((m, i) => ({
          type: "Feature",
          // Stable numeric id so hover/selected `setFeatureState` styling
          // below can target individual markers.
          id: i,
          geometry: { type: "Point", coordinates: [m.Longitude, m.Latitude] },
          properties: {
            title: m.Title,
            minZoom: m.MinZoom,
            maxZoom: m.MaxZoom,
            infoLoaderUrl: m.InfoLoaderUrl,
            iconUrl: m.IconUrl,
          },
        })),
      };

      // `featureCollection`'s shape structurally satisfies the GeoJSON
      // FeatureCollection type maplibre's own (bundled, not `@types/geojson`-
      // backed) typings expect for a geojson source's `data` -- passed as-is
      // rather than annotated against the ambient `GeoJSON` namespace, which
      // isn't reliably resolvable from this file (maplibre-gl-style-spec
      // ships its own inlined geometry types).
      map.addSource(MARKERS_SOURCE_ID, { type: "geojson", data: featureCollection });

      // Zoom-band cross-fade (UX report 2026-07): the bands used to be a
      // hard filter cut, so at a boundary (state->site at 6/7, site->tree
      // at 13/14) the outgoing and incoming kinds appeared/vanished on
      // MapLibre's own staggered placement passes -- briefly doubled up,
      // then one popped away. Driving visibility through a zoom-
      // interpolated `icon-opacity` instead makes the hand-off a true
      // simultaneous cross-fade: across each boundary span the outgoing
      // kind ramps 1 -> 0 while the incoming ramps 0 -> 1 over the SAME
      // zoom interval. `inBandAt(z)` evaluates a feature's own band at a
      // literal stop zoom (bands vary per feature -- e.g. states/sites
      // whose ComputedContainsEntityWithCoordinates is false carry
      // maxZoom 30, doc 01 §9 -- so the stops can't be keyed on kind).
      const inBandAt = (z: number): ExpressionSpecification =>
        [
          "case",
          ["all", ["<=", ["get", "minZoom"], z], ["<=", z, ["get", "maxZoom"]]],
          1,
          0,
        ] as ExpressionSpecification;
      // Fade window: a QUARTER zoom step ending exactly at each boundary
      // (owner feedback 2026-07: the original full-level 6->7 fade left a
      // long doubled-density blend during slow zooms -- "more sudden").
      // Note the stop OUTPUTS still evaluate membership at the integer
      // zooms (inBandAt(6)/inBandAt(7)): band edges are adjacent integers,
      // so evaluating at the stop's own fractional zoom would zero both
      // sides of the hand-off.
      const BAND_FADE = 0.25;
      const bandOpacity: ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["zoom"],
        7 - BAND_FADE,
        inBandAt(6),
        7,
        inBandAt(7),
        14 - BAND_FADE,
        inBandAt(13),
        14,
        inBandAt(14),
      ];
      // The filter now only culls features once they're FULLY faded out
      // (widened a whole zoom level past each band edge) -- note layer
      // filters only re-evaluate at integer zooms, which is exactly why
      // the filter can't drive the fade itself.
      const bandFilter = [
        "all",
        ["<=", ["-", ["get", "minZoom"], 1], ["zoom"]],
        ["<=", ["zoom"], ["+", ["get", "maxZoom"], 1]],
      ] as FilterSpecification;

      map.addLayer({
        id: MARKERS_LAYER_ID,
        type: "symbol",
        source: MARKERS_SOURCE_ID,
        layout: {
          "icon-image": ["get", "iconUrl"],
          // Size ramp: an icon-size of 1.0 renders at `MODERN_ICON_SIZE`
          // (40) CSS px, so 0.8 = 32px at zoom>=8, matching the legacy
          // PNGs' native size (legacy rendered 32px at EVERY zoom).
          // Map UX audit: the old 0.48 floor rendered the landing-view
          // state markers at 19px -- under the 24px WCAG 2.5.8 target
          // minimum and too small for the glyph to resolve. 0.65 keeps a
          // gentle low-zoom reduction (26px) without sacrificing salience;
          // decluttering is not this ramp's job.
          "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.65, 6, 0.75, 8, 0.8],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          // Deterministic stacking where kinds coexist: trees (minZoom 14)
          // draw over sites (7) over states (0), instead of arbitrary
          // source order.
          "symbol-sort-key": ["get", "minZoom"],
        },
        paint: {
          // Zoom-band visibility (doc 03 P1-10), expressed as the
          // cross-fade above rather than a hard filter cut.
          "icon-opacity": bandOpacity,
        },
        filter: bandFilter,
      });

      // Hover/selected ring, drawn UNDER the marker icons. A separate circle
      // layer because feature-state expressions are only legal in paint
      // properties -- `icon-size` is a layout property, so the icons
      // themselves can't grow on hover.
      map.addLayer(
        {
          id: MARKER_RING_LAYER_ID,
          type: "circle",
          source: MARKERS_SOURCE_ID,
          paint: {
            // Hover and selected share ONE radius (owner feedback 2026-07:
            // the old 16px hover -> 19px selected made the ring pop at the
            // click moment); the states differ by stroke weight and fill
            // intensity instead. The radius TRACKS the icon-size ramp so
            // the ring hugs the chip's edge at every zoom (owner feedback:
            // a fixed 18px ring sat loose around the ~21px low-zoom chip
            // -- the visible chip radius is 26/64 of the icon box, i.e.
            // ~10.6px at icon-size 0.65 up to 13px at 0.8, +2px breathing
            // room). Interpolate stays top-level: ["zoom"] is only legal
            // as input to a top-level interpolate/step, so the
            // feature-state case nests INSIDE the stop outputs.
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              [
                "case",
                [
                  "any",
                  ["boolean", ["feature-state", "selected"], false],
                  ["boolean", ["feature-state", "hover"], false],
                ],
                12.5,
                0,
              ],
              8,
              [
                "case",
                [
                  "any",
                  ["boolean", ["feature-state", "selected"], false],
                  ["boolean", ["feature-state", "hover"], false],
                ],
                15,
                0,
              ],
            ],
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "rgba(37, 86, 72, 0.24)",
              "rgba(37, 86, 72, 0.12)",
            ],
            "circle-stroke-color": "#255648",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              2.5,
              ["boolean", ["feature-state", "hover"], false],
              1.5,
              0,
            ],
          },
          filter: bandFilter,
        },
        MARKERS_LAYER_ID,
      );

      // Skipped when `initialView` was supplied (a "View on map" deep link)
      // -- fitting to every marker's bounding box would immediately zoom
      // back out to the continental view, discarding the requested
      // center/zoom the caller navigated here for.
      if (!initialView) {
        const bounds = new maplibregl.LngLatBounds();
        for (const m of markers) bounds.extend([m.Longitude, m.Latitude]);
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 40, maxZoom: 5, duration: 0 });
        }
      }

      // The widened bandFilter keeps fading/faded markers renderable for
      // the cross-fade, which also keeps them hit-testable at opacity 0 --
      // so interaction handlers must pick the first feature actually inside
      // its band at the current zoom, not just e.features[0].
      function firstInBand(
        features: maplibregl.MapGeoJSONFeature[] | undefined,
      ): maplibregl.MapGeoJSONFeature | undefined {
        const z = map.getZoom();
        // BAND_FADE tolerance: mid-fade, strict band membership excludes
        // BOTH the outgoing and incoming kind (band edges are adjacent
        // integers), which made the fade window a click dead-zone. Accept
        // features within the fade margin of their band instead.
        return features?.find((f) => {
          const p = f.properties as MarkerFeatureProperties;
          return p.minZoom - BAND_FADE <= z && z <= p.maxZoom + BAND_FADE;
        });
      }

      // Hover affordances (map UX audit; legacy parity: the old Google map
      // set `marker.setTitle(...)`, i.e. a native tooltip): a lightweight
      // name tip + a ring under the hovered marker via feature-state.
      let hoveredId: number | string | null = null;
      const hoverTip = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        maxWidth: "260px",
        className: "treesdb-tip",
      });
      function clearHover() {
        if (hoveredId !== null) {
          map.setFeatureState({ source: MARKERS_SOURCE_ID, id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        hoverTip.remove();
      }
      map.on("mousemove", MARKERS_LAYER_ID, (e) => {
        const f = firstInBand(e.features);
        if (!f || f.geometry.type !== "Point" || f.id === undefined) {
          // Only ghosts (faded-out markers) under the cursor.
          clearHover();
          map.getCanvas().style.cursor = "";
          return;
        }
        map.getCanvas().style.cursor = "pointer";
        if (hoveredId !== null && hoveredId !== f.id) {
          map.setFeatureState({ source: MARKERS_SOURCE_ID, id: hoveredId }, { hover: false });
        }
        hoveredId = f.id;
        map.setFeatureState({ source: MARKERS_SOURCE_ID, id: f.id }, { hover: true });
        const props = f.properties as MarkerFeatureProperties;
        hoverTip
          .setLngLat(f.geometry.coordinates.slice() as [number, number])
          .setText(props.title)
          .addTo(map);
      });
      map.on("mouseleave", MARKERS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        clearHover();
      });

      // Selected-marker + open-popup bookkeeping. `openPopup`/`selectedId`
      // exist so (a) the popup that a click replaces is removed EXPLICITLY
      // (see the lifecycle note in the click handler), (b) the selected
      // ring can be cleared when the popup goes away, and (c) `zoomend`
      // can close a popup whose marker just left its zoom band (legacy
      // closed its singleton InfoWindow on zoom_changed, Widgets.js:70).
      let openPopup: maplibregl.Popup | null = null;
      let openPopupBand: { minZoom: number; maxZoom: number } | null = null;
      let selectedId: number | string | null = null;
      function clearSelected() {
        if (selectedId !== null) {
          map.setFeatureState({ source: MARKERS_SOURCE_ID, id: selectedId }, { selected: false });
          selectedId = null;
        }
      }

      map.on("click", MARKERS_LAYER_ID, (e) => {
        const feature = firstInBand(e.features);
        if (!feature || feature.geometry.type !== "Point") return;
        const props = feature.properties as MarkerFeatureProperties;
        const kind = markerKindFromInfoLoaderUrl(props.infoLoaderUrl);
        if (!kind) return;
        const coordinates = feature.geometry.coordinates.slice() as [number, number];

        // Remove any open popup NOW, while its own root is still the
        // current one. Relying on MapLibre's closeOnClick for this was the
        // root cause of the "tip visible but popup empty" bug: on a
        // marker-to-marker click the layer handler ran first, repointed
        // popupRootRef at the NEW popup's root, and then the OLD popup's
        // map-click close listener fired -- whose close handler unmounted
        // the new root, leaving a content-less popup (just the tip).
        openPopup?.remove();
        hoverTip.remove();

        const container = document.createElement("div");
        const root = createRoot(container);
        popupRootRef.current = root;
        clearSelected();
        if (feature.id !== undefined) {
          selectedId = feature.id;
          map.setFeatureState({ source: MARKERS_SOURCE_ID, id: feature.id }, { selected: true });
        }

        const popup = new maplibregl.Popup({
          closeButton: false,
          maxWidth: "min(320px, calc(100vw - 24px))",
          offset: 20,
          className: "treesdb-popup",
        });
        openPopup = popup;
        openPopupBand = { minZoom: props.minZoom, maxZoom: props.maxZoom };
        let rootUnmounted = false;
        popup
          .setLngLat(coordinates)
          .setDOMContent(container)
          .addTo(map)
          .on("close", () => {
            // Identity-guarded: only touch shared state if this popup is
            // still the current one, and only ever unmount OUR OWN root.
            // (Unmounting synchronously inside MapLibre's close handling
            // can warn about unmounting during render; defer to a
            // microtask.)
            if (popupRootRef.current === root) popupRootRef.current = null;
            if (openPopup === popup) {
              openPopup = null;
              openPopupBand = null;
              clearSelected();
            }
            if (!rootUnmounted) {
              rootUnmounted = true;
              queueMicrotask(() => root.unmount());
            }
          });
        root.render(
          <MarkerInfoPopup
            kind={kind}
            infoLoaderUrl={props.infoLoaderUrl}
            title={props.title}
            onRequestClose={() => popup.remove()}
          />,
        );
      });

      // A popup whose marker just left its zoom band would otherwise hang
      // anchored to empty map (repro'd: zoom out from an open state popup).
      map.on("zoomend", () => {
        if (!openPopup || !openPopupBand) return;
        const z = map.getZoom();
        if (z < openPopupBand.minZoom || z > openPopupBand.maxZoom) openPopup.remove();
      });
    });

    return () => {
      unmounted = true;
      // map.remove() destroys any open popup; its identity-guarded close
      // handler (above) unmounts that popup's React root.
      map.remove();
      // Defensive: if no close event fired, unmount whatever root remains.
      const root = popupRootRef.current;
      popupRootRef.current = null;
      if (root) queueMicrotask(() => root.unmount());
    };
  }, []);

  // The ref div must NOT carry `absolute inset-0` itself: maplibre-gl.css
  // sets `.maplibregl-map { position: relative }` on the container it
  // initializes, which loads after Tailwind and overrides the utility --
  // collapsing the map to zero height. Positioning lives on the wrapper;
  // the container just fills it.
  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" role="application" aria-label="Map of measured tree sites" />
    </div>
  );
}
