"use client";

// Coordinate picker -- task P3-04 (doc 05 §P3-04): "Coordinate picker:
// MapLibre modal writing DDM text into the field (legacy parity of stored
// value, not of widget)." Legacy's own picker is a Google Maps widget
// (`Sites.cshtml`'s `//maps.google.com/maps/api/js` script,
// `CoordinatePickerModel`/`Classification("CoordinatePicker Coordinates
// ShowIfJavascriptEnabled")`, `ImportSiteModel.cs:18-20`) that writes a
// formatted coordinate string into the SAME text field the user could also
// type into by hand -- this is a from-scratch MapLibre replacement of that
// widget (reusing the Phase-1 map stack, `components/map/map-view.tsx`),
// preserving only the CONTRACT: clicking a point on the map writes
// "<lat>, <lng>" (each axis in `DegreesDecimalMinutes` format, matching
// `ImportSiteModel`'s field hint text "e.g. 41 29.959, -81 41.662") into
// the target text input, exactly the format `lib/units/parse-coordinates.ts`
// parses back out (comma-split, DDM pattern) -- so the picker and manual
// typing are two equally-valid ways to fill the SAME field, never a
// separate hidden lat/lng representation.
//
// `maplibre-gl` touches `window`/canvas at module scope (same constraint
// documented in map-view.tsx), and this component is embedded directly
// inside the Sites-step form -- a Server Component tree, not behind a
// `next/dynamic(..., { ssr: false })` boundary like the full-page map is.
// Rather than adding a second wrapper file/route just to get an `ssr:
// false` dynamic-import boundary, this component defers the ENTIRE
// `maplibre-gl` module load into a `useEffect` (which never runs during
// SSR/RSC rendering) via a runtime `import("maplibre-gl")` -- only the
// (side-effect-free) CSS import stays at module scope.
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLatitude, formatLongitude } from "@/lib/geo/coordinates";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

// Same continental-US-ish placeholder viewport as map-view.tsx.
const INITIAL_CENTER: [number, number] = [-98.5, 39.8];
const INITIAL_ZOOM = 3.3;

export interface CoordinatePickerProps {
  /** `id` of the text `<input>` this picker writes "<lat>, <lng>" into on
   * "Use this location" -- the same field the user can type into by hand. */
  targetInputId: string;
  /** Optional label for the trigger button (defaults to "Pick on map"). */
  label?: string;
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

export function CoordinatePicker({ targetInputId, label = "Pick on map" }: CoordinatePickerProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize the map once the dialog has actually opened (its container
  // has real layout dimensions only once visible -- MapLibre sizes its
  // canvas from the container's rect at construction time).
  useEffect(() => {
    if (!isOpen || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !containerRef.current) return;
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
          // Same desaturated-basemap treatment as components/map/
          // map-view.tsx (map UX audit): mutes the warm OSM palette so the
          // picked-location marker stands out.
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
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 0,
        maxZoom: 22,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("click", (e) => {
        const { lat, lng } = e.lngLat;
        setPicked({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          // Brand forest-green (map UX audit: MapLibre's stock #3FB1CE
          // measured ~2:1 against OSM land tiles; #255648 is 6.8:1).
          markerRef.current = new maplibregl.Marker({ color: "#255648" }).setLngLat([lng, lat]).addTo(map);
        }
      });
      mapRef.current = map;
      // The dialog's open transition can finish after MapLibre reads the
      // container's initial (possibly still-zero) size; force one resize
      // pass on the next frame to be safe.
      requestAnimationFrame(() => map.resize());
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]);

  function open() {
    setPicked(null);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setIsOpen(false);
  }

  function useLocation() {
    if (!picked) return;
    const input = document.getElementById(targetInputId);
    if (input instanceof HTMLInputElement) {
      const text = `${formatLatitude(picked.lat, "DegreesDecimalMinutes")}, ${formatLongitude(picked.lng, "DegreesDecimalMinutes")}`;
      writeInputValue(input, text);
    }
    close();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={open}>
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        className="w-[min(90vw,42rem)] overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between bg-primary p-3 text-primary-foreground">
          <h2 className="text-sm font-medium">Pick a location</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-1 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        </div>
        <div ref={containerRef} className="h-80 w-full" role="application" aria-label="Coordinate picker map" />
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card p-3 text-sm">
          <span className="text-muted-foreground">
            {picked ? (
              <span className="inline-flex items-center rounded-full bg-badge px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-badge-foreground">
                {formatLatitude(picked.lat, "DegreesDecimalMinutes")}, {formatLongitude(picked.lng, "DegreesDecimalMinutes")}
              </span>
            ) : (
              "Click the map to choose a location."
            )}
          </span>
          <Button type="button" size="sm" disabled={!picked} onClick={useLocation}>
            Use this location
          </Button>
        </div>
      </dialog>
    </>
  );
}
