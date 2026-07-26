"use client";

// React content mounted into a MapLibre `Popup` (see map-view.tsx) when a
// marker is clicked. Fetches the marker's `InfoLoaderUrl` client-side and
// renders the same fields the legacy `Map/*MarkerInfo.cshtml` partials
// displayed (D-007, doc 01 §9) -- values arrive already formatted server-
// side (`db/queries/map.sql.ts`, via `lib/units/format.ts`) so they're
// rendered verbatim here, not recomputed.
//
// BUGFIX (surfaced by the P1-15 preview deploy): this used to import its
// types from `@/parity/extractors/schema` - `.vercelignore` deliberately
// excludes the whole `parity/` directory from deployment (PII in
// parity/dumps, thousands of files in parity/snapshots the app doesn't
// need at runtime), so `next build` on Vercel failed with "Cannot find
// module '@/parity/extractors/schema'" even though it built fine locally
// (parity/ exists on disk there). Switched to the structurally-identical
// production types `db/queries/map.sql.ts` already exports
// (`StateMarkerInfoData`/`SiteMarkerInfoData`/`TreeMarkerInfoData` -
// field-for-field the same shape as the parity schema's JSON types, per
// that file's own doc comments) - aliased on import so the rest of this
// file's `*MarkerInfoJson` references didn't need to change.
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteMarkerInfoData as SiteMarkerInfoJson, StateMarkerInfoData as StateMarkerInfoJson, TreeMarkerInfoData as TreeMarkerInfoJson } from "@/db/queries/map.sql";
import type { MarkerKind } from "./types";

type InfoJson = StateMarkerInfoJson | SiteMarkerInfoJson | TreeMarkerInfoJson;

type FetchState = { status: "loading" } | { status: "error" } | { status: "ready"; data: InfoJson };

// Shared footprint for all three fetch states (loading/error/ready) so the
// popup doesn't resize as the fetch resolves (was w-64 -> w-72, a visible
// "jump"; see BRAND.md-adjacent design-audit notes).
const POPUP_FOOTPRINT = "w-72 max-w-full overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10";

export interface MarkerInfoPopupProps {
  kind: MarkerKind;
  infoLoaderUrl: string;
  /** Marker list `Title`, shown as a placeholder while the info payload loads. */
  title: string;
  /** Closes the owning MapLibre popup (map-view.tsx's `popup.remove()`). */
  onRequestClose: () => void;
}

export function MarkerInfoPopup({ kind, infoLoaderUrl, title, onRequestClose }: MarkerInfoPopupProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(infoLoaderUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`request failed: ${res.status}`);
        return res.json() as Promise<InfoJson>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [infoLoaderUrl]);

  if (state.status === "loading") {
    return (
      <div className={`${POPUP_FOOTPRINT} p-3 text-sm text-muted-foreground`}>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-3.5 shrink-0 animate-pulse rounded-full border-2 border-muted-foreground/40 border-t-transparent"
          />
          <span>Loading {title}…</span>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-muted-foreground/15" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted-foreground/15" />
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className={`${POPUP_FOOTPRINT} bg-destructive/5 p-3 text-sm text-destructive`}>
        Couldn&apos;t load details for {title}.
      </div>
    );
  }

  const { data } = state;
  const heading = kind === "tree" ? (data as TreeMarkerInfoJson).scientificName : (data as StateMarkerInfoJson | SiteMarkerInfoJson).name;
  const photos = kind === "state" ? [] : (data as SiteMarkerInfoJson | TreeMarkerInfoJson).photos;
  const trailing =
    kind === "tree"
      ? { label: "Measured", value: (data as TreeMarkerInfoJson).lastMeasured }
      : kind === "site"
        ? { label: "Last measurement date", value: (data as SiteMarkerInfoJson).lastMeasurementDate }
        : null;

  return (
    <div className={`${POPUP_FOOTPRINT} text-sm`}>
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-3 py-2">
        <span title={heading} className="min-w-0 flex-1 truncate font-semibold leading-snug text-primary">
          {heading}
        </span>
        {data.detailsLink.href ? (
          <a
            href={data.detailsLink.href}
            className="shrink-0 whitespace-nowrap py-1.5 text-xs text-link underline underline-offset-2 hover:text-link/80"
          >
            {data.detailsLink.text}
          </a>
        ) : (
          // Task P1-16 (href-less anchor): no destination to link to --
          // render plain (non-link-styled) text instead of an `<a>` with no
          // `href`, which looked clickable but wasn't.
          <span className="shrink-0 whitespace-nowrap py-1.5 text-xs text-muted-foreground">{data.detailsLink.text}</span>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onRequestClose}
          className="relative -my-1 -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-primary/70 after:absolute after:-inset-1.5 hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </div>
      <div className="space-y-2 p-3">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
          {Object.entries(data.rows).map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
          {trailing ? <InfoRow label={trailing.label} value={trailing.value} /> : null}
        </dl>
        {photos.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {photos.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnails come from the P1-12 /photos/{id}/{size} route, no next/image benefit here.
              <img key={i} src={photo.thumbnailSrc} alt="" className="h-14 w-14 rounded object-cover ring-1 ring-border" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Values arrive pre-formatted from the server (see file header). Some are
 * literal placeholder text for absent data (e.g. "(not enough data)",
 * "(no data)", "(none)" -- matching the legacy `*MarkerInfo.cshtml`
 * partials' own placeholder strings, BRAND.md's "empty values ... as muted
 * text, not badges" idiom). Detecting that shape purely for the visual
 * treatment (badge vs. plain muted text) doesn't touch the string itself.
 */
function isPlaceholderValue(value: string): boolean {
  return /^\(.*\)$/.test(value.trim());
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="justify-self-end">
        {isPlaceholderValue(value) ? (
          <span className="text-muted-foreground">{value}</span>
        ) : (
          <span className="inline-block rounded-full bg-badge px-2 py-0.5 text-xs font-medium text-badge-foreground">
            {value}
          </span>
        )}
      </dd>
    </>
  );
}
