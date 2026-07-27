"use client";

// Coordinate picker -- task P3-04, overhauled after the 2026-07 three-agent
// UX audit of the import wizard. Legacy's picker was a Google Maps widget
// (`TMD/js/Map/CoordinatePicker.js`, `Widgets.js:82-132`) that opened where
// the user's data already was, had a draggable marker, and a live two-way
// coordinate text box; the original MapLibre port kept only "click writes
// DDM text into the field". This revision restores the legacy workflow on
// the MapLibre stack:
//
//  - Starting viewport cascade (legacy tiers, CoordinatePicker.js): (1) the
//    coordinates already typed in the target field, at zoom 15; (2) the
//    caller-supplied `initialView` (e.g. the parent site's coordinates on
//    the Trees step); (3) the continental-US fallback. (Legacy's geocoder
//    tier needs a provider the port doesn't have -- deliberately dropped.)
//  - Draggable marker (legacy: "Drag this marker into position...") plus
//    click-to-place, crosshair cursor, and a persistent instruction chip.
//  - An editable coordinate input inside the dialog, two-way bound to the
//    marker -- this is also the keyboard path (WCAG 2.1.1); Enter over the
//    map canvas picks the map center as a second keyboard route.
//  - Input-format preservation (legacy CoordinatePicker.js:149-161): the
//    picked point is written back in the format the field already used
//    (DMS/DDM/DD), falling back to DDM -- the stored-value contract with
//    `lib/units/parse-coordinates.ts` is unchanged.
//  - Streets/satellite basemap toggle (legacy offered TERRAIN/SATELLITE/
//    HYBRID; an OSM road map is useless for pinpointing a tree in a forest
//    at zoom 17). Esri World Imagery is the standard freely-usable raster.
//  - ScaleControl + a low-zoom precision warning: at the old fixed zoom 3.3
//    a single click spans ~12 km/px but was written with 1.85 m false
//    precision.
//  - Dialog fixes: `m-auto` restores centering (Tailwind preflight zeroes
//    the UA's `dialog { margin: auto }`), and the flex column + `min-h-0
//    flex-1` map lets short viewports shrink the MAP instead of clipping
//    the footer off-screen (the old fixed h-80 made phone-landscape a dead
//    end: "Use this location" rendered below the clip). Body scroll locks
//    while open (legacy: `$('body').css('overflow','hidden')`).
//
// `maplibre-gl` touches `window` at module scope, and this component is
// embedded in Server Component trees -- the module load stays deferred into
// a `useEffect` via runtime `import("maplibre-gl")`; only CSS imports stay
// at module scope.
import "maplibre-gl/dist/maplibre-gl.css";
import "../map/map-overrides.css";
import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLatitude, formatLongitude, type CoordinateFormat } from "@/lib/geo/coordinates";
import { CoordinatesFormat, parseCoordinates } from "@/lib/units/parse-coordinates";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

// Same continental-US-ish placeholder viewport as map-view.tsx.
const INITIAL_CENTER: [number, number] = [-98.5, 39.8];
const INITIAL_ZOOM = 3.3;
/** Legacy CoordinatePicker.js zoomed to 15 whenever it had a real target. */
const SEEDED_ZOOM = 15;
/** Below this zoom a click spans hundreds of meters per pixel -- warn. */
const PRECISION_ZOOM = 12;

export interface CoordinatePickerProps {
  /** `id` of the text `<input>` this picker writes "<lat>, <lng>" into on
   * "Use this location" -- the same field the user can type into by hand. */
  targetInputId: string;
  /** Optional label for the trigger button (defaults to "Pick on map"). */
  label?: string;
  /** Fallback starting viewport when the target field is empty -- e.g. the
   * parent site's coordinates on the Trees step (legacy tier 2). */
  initialView?: { lat: number; lng: number; zoom?: number } | null;
}

/**
 * Sets a controlled/uncontrolled React `<input>`'s value via the native
 * setter and fires a real `input` event, so React's change-tracking (and
 * any `onChange` handler) observes the write the same way it would observe
 * a keystroke -- a plain `input.value = x` assignment does NOT notify React
 * because React patches the native value setter to track its own state.
 */
function writeInputValue(input: HTMLInputElement, value: string): void {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  if (nativeSetter) {
    nativeSetter.call(input, value);
  } else {
    input.value = value;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Both axes parsed to real values -- the seedable/committable bar. */
function parseBothAxes(text: string): { lat: number; lng: number } | null {
  const parsed = parseCoordinates(text);
  const latOk =
    parsed.latitude.inputFormat !== CoordinatesFormat.Invalid &&
    parsed.latitude.inputFormat !== CoordinatesFormat.Unspecified;
  const lngOk =
    parsed.longitude.inputFormat !== CoordinatesFormat.Invalid &&
    parsed.longitude.inputFormat !== CoordinatesFormat.Unspecified;
  if (!latOk || !lngOk) return null;
  return { lat: parsed.latitude.totalDegrees, lng: parsed.longitude.totalDegrees };
}

/** Legacy carried the field's existing InputFormat forward (falling back to
 * Default = DDM) instead of silently reformatting the user's data. */
function outputFormatFor(text: string): CoordinateFormat {
  switch (parseCoordinates(text).inputFormat) {
    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
      return "DegreesMinutesDecimalSeconds";
    case CoordinatesFormat.DecimalDegrees:
      return "DecimalDegrees";
    default:
      return "DegreesDecimalMinutes";
  }
}

export function CoordinatePicker({ targetInputId, label = "Pick on map", initialView }: CoordinatePickerProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  /** Viewport + pre-placed pin computed by open() for the NEXT map init. */
  const seedRef = useRef<{ center: [number, number]; zoom: number; pin: { lat: number; lng: number } | null }>({
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    pin: null,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [outputFormat, setOutputFormat] = useState<CoordinateFormat>("DegreesDecimalMinutes");
  const [coordText, setCoordText] = useState("");
  const [typedError, setTypedError] = useState<string | null>(null);
  const [lowZoom, setLowZoom] = useState(false);
  const [basemap, setBasemap] = useState<"streets" | "satellite">("streets");

  const format = (p: { lat: number; lng: number }) =>
    `${formatLatitude(p.lat, outputFormat)}, ${formatLongitude(p.lng, outputFormat)}`;

  // Keep the dialog's coordinate input in sync with the pin, whatever moved
  // it (click, drag, Enter-on-canvas, or a typed commit being normalized) --
  // legacy's two-way box behaved the same way.
  useEffect(() => {
    if (picked) {
      setCoordText(format(picked));
      setTypedError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, outputFormat]);

  // Native <dialog> does not lock body scroll; wheel over the backdrop was
  // scrolling the page under the modal.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Initialize the map once the dialog has actually opened (its container
  // has real layout dimensions only once visible -- MapLibre sizes its
  // canvas from the container's rect at construction time).
  useEffect(() => {
    if (!isOpen || !containerRef.current || mapRef.current) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !containerRef.current) return;
      const seed = seedRef.current;
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
            esri: {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
              layout: { visibility: basemap === "streets" ? "visible" : "none" },
              // Same desaturated-basemap treatment as components/map/
              // map-view.tsx (map UX audit): mutes the warm OSM palette so
              // the picked-location marker stands out.
              paint: {
                "raster-saturation": -0.55,
                "raster-contrast": -0.12,
                "raster-brightness-min": 0.08,
                "raster-brightness-max": 0.94,
              },
            },
            {
              id: "esri",
              type: "raster",
              source: "esri",
              // Imagery stays full-color: it's chosen precisely for detail.
              layout: { visibility: basemap === "satellite" ? "visible" : "none" },
            },
          ],
        },
        center: seed.center,
        zoom: seed.zoom,
        minZoom: 0,
        maxZoom: 19,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      // Field crews entering data on site can pin their actual position in
      // one tap -- something legacy never offered.
      map.addControl(
        new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
        "top-right",
      );
      map.addControl(new maplibregl.ScaleControl(), "bottom-left");

      const place = (lngLat: { lat: number; lng: number }) => {
        setPicked({ lat: lngLat.lat, lng: lngLat.lng });
        if (markerRef.current) {
          markerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
        } else {
          // Brand forest-green (map UX audit: MapLibre's stock #3FB1CE
          // measured ~2:1 against OSM land tiles; #255648 is 6.8:1).
          const marker = new maplibregl.Marker({ color: "#255648", draggable: true })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(map);
          marker.on("dragend", () => {
            const at = marker.getLngLat();
            setPicked({ lat: at.lat, lng: at.lng });
          });
          markerRef.current = marker;
        }
      };
      mapRef.current = map;
      // TS-invisible but component-visible: expose place() for the typed-
      // coordinate commit path below without threading maplibre through
      // state. Stored on the map instance to share the marker closure.
      (map as unknown as { __place: typeof place }).__place = place;

      if (seed.pin) place(seed.pin);

      map.on("click", (e) => place(e.lngLat));
      map.on("load", () => {
        map.getCanvas().style.cursor = "crosshair";
      });
      // Keyboard route #2: Enter over the focused canvas picks map center
      // (MapLibre's own arrow keys pan, +/- zooms).
      map.getCanvas().addEventListener("keydown", (e) => {
        if (e.key === "Enter") place(map.getCenter());
      });
      const syncZoom = () => setLowZoom(map.getZoom() < PRECISION_ZOOM);
      map.on("zoom", syncZoom);
      syncZoom();

      // Short viewports shrink the map via flex -- MapLibre only re-reads
      // the container size when told to.
      observer = new ResizeObserver(() => map.resize());
      observer.observe(containerRef.current);
      // The dialog's open transition can finish after MapLibre reads the
      // container's initial (possibly still-zero) size; force one resize
      // pass on the next frame to be safe.
      requestAnimationFrame(() => map.resize());
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Basemap toggle: flip raster-layer visibility in place.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      map.setLayoutProperty("osm", "visibility", basemap === "streets" ? "visible" : "none");
      map.setLayoutProperty("esri", "visibility", basemap === "satellite" ? "visible" : "none");
    };
    if (map.isStyleLoaded()) apply();
    else map.once("styledata", apply);
  }, [basemap]);

  function open() {
    // Starting-viewport cascade (see header). Reading the LIVE field value
    // (not a prop) means the picker honors coordinates typed seconds ago.
    const input = document.getElementById(targetInputId);
    const fieldText = input instanceof HTMLInputElement ? input.value : "";
    const fromField = parseBothAxes(fieldText);
    setOutputFormat(outputFormatFor(fieldText));
    if (fromField) {
      seedRef.current = { center: [fromField.lng, fromField.lat], zoom: SEEDED_ZOOM, pin: fromField };
      setPicked(fromField);
    } else if (initialView) {
      seedRef.current = {
        center: [initialView.lng, initialView.lat],
        zoom: initialView.zoom ?? SEEDED_ZOOM,
        pin: null,
      };
      setPicked(null);
      setCoordText("");
    } else {
      seedRef.current = { center: INITIAL_CENTER, zoom: INITIAL_ZOOM, pin: null };
      setPicked(null);
      setCoordText("");
    }
    setTypedError(null);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setIsOpen(false);
  }

  /** Typed/pasted coordinates -> move the pin and fly there (keyboard path #1). */
  function commitTyped() {
    if (coordText.trim() === "") return;
    if (picked && coordText === format(picked)) return; // unchanged echo
    const typed = parseBothAxes(coordText);
    if (!typed) {
      setTypedError("Use dd mm ss.s, dd mm.mmm, or dd.ddddd - e.g. 41 29.959, -81 41.662");
      return;
    }
    setTypedError(null);
    const map = mapRef.current;
    if (map) {
      (map as unknown as { __place?: (p: { lat: number; lng: number }) => void }).__place?.(typed);
      map.easeTo({ center: [typed.lng, typed.lat], zoom: Math.max(map.getZoom(), 13) });
    } else {
      setPicked(typed);
    }
  }

  function useLocation() {
    if (!picked) return;
    const input = document.getElementById(targetInputId);
    if (input instanceof HTMLInputElement) {
      writeInputValue(input, format(picked));
      // The modal may be nowhere near the field it just changed -- put the
      // user's focus (and viewport) on the result.
      input.focus();
      input.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    close();
  }

  const titleId = `coordinate-picker-title-${targetInputId}`;
  const basemapChip = (kind: "streets" | "satellite", text: string) => (
    <button
      type="button"
      onClick={() => setBasemap(kind)}
      aria-pressed={basemap === kind}
      className={
        basemap === kind
          ? "rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
          : "rounded-full px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-muted"
      }
    >
      {text}
    </button>
  );

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={open}>
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        aria-labelledby={titleId}
        // `hidden open:flex`, never a bare `flex`: an author display value
        // overrides the UA's `dialog:not([open]) { display: none }`, which
        // would leave the CLOSED dialog rendered as an invisible overlay
        // eating the page's pointer events (caught by live verification).
        className="m-auto hidden max-h-[calc(100dvh-2rem)] w-[min(96vw,48rem)] flex-col overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg backdrop:bg-black/50 open:flex"
      >
        <div className="flex shrink-0 items-center justify-between bg-primary p-3 text-primary-foreground">
          <h2 id={titleId} className="text-sm font-medium">
            Pick a location
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-1 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        </div>
        {/* Explicit height as the flex BASIS (not flex-1: inside a content-
            sized dialog, flex-grow against an auto height collapses to the
            min-height); `shrink` + min-h-40 lets short viewports compress
            the map instead of clipping the footer. */}
        <div className="relative h-[min(60vh,32rem)] min-h-40 w-full shrink">
          {/* h-full, not absolute inset-0: maplibre stamps `position:
              relative` (.maplibregl-map) onto its container, which turns
              inset offsets into a zero-height box. */}
          <div ref={containerRef} className="h-full w-full" aria-label="Coordinate picker map" />
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center px-2">
            <p className="rounded-full bg-card/90 px-3 py-1 text-center text-xs text-foreground shadow-sm">
              {lowZoom && picked === null
                ? "Zoom in before picking - at this zoom a single click spans a wide area."
                : "Click the map or drag the pin to set the location."}
            </p>
          </div>
          <div className="absolute top-2 left-2 flex gap-0.5 rounded-full border border-border bg-card/95 p-0.5 shadow-sm">
            {basemapChip("streets", "Map")}
            {basemapChip("satellite", "Satellite")}
          </div>
        </div>
        <div className="shrink-0 border-t border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <label htmlFor={`${targetInputId}-picker-text`} className="shrink-0 text-sm text-muted-foreground">
                Coordinates
              </label>
              <input
                id={`${targetInputId}-picker-text`}
                type="text"
                value={coordText}
                placeholder="e.g. 41 29.959, -81 41.662"
                onChange={(e) => setCoordText(e.target.value)}
                onBlur={commitTyped}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTyped();
                  }
                }}
                aria-invalid={typedError ? true : undefined}
                aria-describedby={typedError ? `${targetInputId}-picker-error` : undefined}
                className="h-8 w-full min-w-0 max-w-64 rounded-md border border-input bg-transparent px-2 text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
            <Button type="button" size="sm" disabled={!picked} onClick={useLocation}>
              Use this location
            </Button>
          </div>
          {typedError ? (
            <p id={`${targetInputId}-picker-error`} role="alert" className="mt-1.5 text-xs text-destructive">
              {typedError}
            </p>
          ) : lowZoom && picked ? (
            <p className="mt-1.5 text-xs text-amber-700">
              Picked from far out - zoom in and fine-tune the pin for tree-level precision.
            </p>
          ) : null}
          <span aria-live="polite" className="sr-only">
            {picked ? `Selected ${format(picked)}` : ""}
          </span>
        </div>
      </dialog>
    </>
  );
}
