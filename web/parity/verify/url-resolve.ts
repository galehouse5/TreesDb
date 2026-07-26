/**
 * verify.ts-owned URL-building logic layered on top of `normalize.ts`'s
 * generic (pathname-only) URL-equivalence table. `matchLegacyUrl` /
 * `toProvisionalNewPath` deliberately ignore query strings (normalize.ts's
 * own doc comment), so anything that needs a legacy URL's QUERY string to
 * build the right new-app fetch target - search terms, autocomplete
 * terms/results, species site/state scoping via `?siteId=`/`?stateId=`,
 * the `/Map/{Kind}MarkerInfo?id=` query-id shape used inside
 * `Markers[].InfoLoaderUrl` (as opposed to the path-id shape
 * `/Map/{id}/{Kind}MarkerInfo` used by direct `markerinfo` category
 * captures - both are real, confirmed by inspecting the committed
 * snapshots, see normalize.ts's site-species-details/state-species-details
 * doc comments) - lives here instead.
 */
import { matchLegacyUrl } from "../normalize";

export type UrlResolveResult =
  | { kind: "resolved"; newPath: string; routeId: string }
  | { kind: "skip"; reason: string };

/**
 * Strips a scheme+authority prefix, if present. `normalize.ts`'s
 * `matchLegacyUrl` matches against a bare PATH (its own patterns are all
 * anchored `^/...`, and every one of its own tests passes bare paths) - but
 * snapshot manifest entries store the FULL absolute legacy URL
 * (`https://www.treesdb.org/...`, `capture.ts`'s `urls.*` builders). Every
 * resolver in this file funnels through `resolveNewPath`, so this strip
 * happens once, centrally, rather than needing every call site in
 * `verify.ts` to remember to do it.
 */
export function toPath(url: string): string {
  return url.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]*/, "");
}

/**
 * Resolves a legacy URL's PATHNAME to a new-app path via `normalize.ts`,
 * skipping (with a reason) when no table entry matches, or when the
 * matched entry is still `provisional: true` (route not yet confirmed -
 * doc 03's table doesn't cover it, or the app-shell task hasn't shipped it
 * yet). Does not touch the query string - callers append/merge query
 * params themselves per category (see below). Accepts either a full
 * absolute URL or a bare path (see `toPath` above).
 */
export function resolveNewPath(legacyUrl: string): UrlResolveResult {
  const match = matchLegacyUrl(toPath(legacyUrl));
  if (!match) {
    return { kind: "skip", reason: `no URL-equivalence table entry matches the pathname of ${legacyUrl}` };
  }
  if (match.entry.provisional) {
    return {
      kind: "skip",
      reason: `route "${match.entry.id}" is still provisional (unconfirmed) in normalize.ts - ${match.entry.description}`,
    };
  }
  return { kind: "resolved", newPath: match.entry.toNewPath(match.params), routeId: match.entry.id };
}

function queryParams(url: string): URLSearchParams {
  const idx = url.indexOf("?");
  return new URLSearchParams(idx === -1 ? "" : url.slice(idx + 1));
}

function appendQuery(path: string, extra: URLSearchParams): string {
  if ([...extra.keys()].length === 0) return path;
  const [base, existing] = path.split("?");
  const merged = new URLSearchParams(existing ?? "");
  for (const [k, v] of extra) merged.set(k, v);
  return `${base}?${merged.toString()}`;
}

/**
 * Builds the full new-app fetch path for a `pages` category species-details
 * snapshot artifact, layering `?site=`/`?state=` onto the base
 * `/species/{slug}` mapping when the legacy URL carried the query-param
 * scoping form (`?siteId=`/`?stateId=` - the shape capture.ts's corpus
 * fetches actually use; the nested-path form
 * `/Browse/Sites/{id}/Species/.../Details` is a SEPARATE, also-real legacy
 * shape - see normalize.ts - whose scoping is already baked into
 * `resolveNewPath`'s output via the path capture groups, so this function
 * is a no-op for that shape since it has no `siteId`/`stateId` query
 * params to find).
 */
export function resolveSpeciesDetailsPath(legacyUrl: string): UrlResolveResult {
  const base = resolveNewPath(legacyUrl);
  if (base.kind === "skip") return base;
  const q = queryParams(legacyUrl);
  const extra = new URLSearchParams();
  if (q.has("siteId")) extra.set("site", q.get("siteId")!);
  if (q.has("stateId")) extra.set("state", q.get("stateId")!);
  return { kind: "resolved", newPath: appendQuery(base.newPath, extra), routeId: base.routeId };
}

/** Builds the new-app search fetch path from a legacy `/Search?term=...` URL. */
export function resolveSearchPath(legacyUrl: string): UrlResolveResult {
  const base = resolveNewPath(legacyUrl);
  if (base.kind === "skip") return base;
  const q = queryParams(legacyUrl);
  const extra = new URLSearchParams();
  if (q.has("term")) extra.set("term", q.get("term")!);
  return { kind: "resolved", newPath: appendQuery(base.newPath, extra), routeId: base.routeId };
}

/** Builds the new-app autocomplete fetch path from a legacy `/Trees/FindKnownSpeciesWithSimilar{CommonName,ScientificName}?term=&results=` URL. */
export function resolveAutocompletePath(legacyUrl: string): UrlResolveResult {
  const base = resolveNewPath(legacyUrl);
  if (base.kind === "skip") return base;
  const q = queryParams(legacyUrl);
  const extra = new URLSearchParams();
  if (q.has("term")) extra.set("term", q.get("term")!);
  if (q.has("results")) extra.set("results", q.get("results")!);
  return { kind: "resolved", newPath: appendQuery(base.newPath, extra), routeId: base.routeId };
}

/** Query param names capture.ts adds purely for AJAX plumbing, never forwarded to the new app. */
const AJAX_PLUMBING_QUERY_KEYS = ["parameterNamePrefix"];

/**
 * Builds the new-app fetch path for an `exports` category snapshot
 * artifact. Only the two filter-driven export endpoints
 * (`export-species-by-filters`/`export-locations-by-filters`) carry a
 * meaningful query string (the current grid filter/sort state, same params
 * as `/Browse/Locations`/`/Browse/Species`) - every other export shape's
 * scoping is already baked into the path by `resolveNewPath`.
 */
export function resolveExportPath(legacyUrl: string): UrlResolveResult {
  const base = resolveNewPath(legacyUrl);
  if (base.kind === "skip") return base;
  if (base.routeId !== "export-species-by-filters" && base.routeId !== "export-locations-by-filters") return base;
  const q = queryParams(legacyUrl);
  for (const k of AJAX_PLUMBING_QUERY_KEYS) q.delete(k);
  const qs = q.toString();
  return { kind: "resolved", newPath: qs ? `${base.newPath}?${qs}` : base.newPath, routeId: base.routeId };
}

/**
 * Route-shape equivalence for the query-id marker-info URL form found
 * inside `Markers[].InfoLoaderUrl` (`/Map/StateMarkerInfo?id=1`, distinct
 * from the path-id form `/Map/1/StateMarkerInfo` normalize.ts's table
 * matches). Doc 07 §5.2: "InfoLoaderUrl ... compared by route-shape
 * mapping" - reuses the SAME confirmed target paths
 * (`/api/map/{trees,sites,states}/{id}/info`) as the path-id entries in
 * normalize.ts's table, just extracting `id` from the query string instead
 * of a path segment.
 */
const MARKER_INFO_QUERY_KIND_TO_SEGMENT: Record<string, string> = {
  State: "states",
  Site: "sites",
  Tree: "trees",
};

export function legacyMarkerInfoQueryUrlToNewPath(legacyUrl: string): string | null {
  const [rawPathname] = legacyUrl.split("?");
  const m = /^\/Map\/(State|Site|Tree)MarkerInfo$/.exec(rawPathname ?? "");
  if (!m) return null;
  const id = queryParams(legacyUrl).get("id");
  if (!id) return null;
  const segment = MARKER_INFO_QUERY_KIND_TO_SEGMENT[m[1]!];
  return `/api/map/${segment}/${id}/info`;
}

/**
 * `InfoLoaderUrl` equivalence for the `markers` category (doc §5.2):
 * legacy always uses the query-id form inside `Markers[]`; compares its
 * mapped new path against the actual new-side `InfoLoaderUrl`, ignoring
 * query-string order/trailing slash the same way `normalize.ts`'s
 * `urlsEquivalent` does for the path-id form.
 */
export function markerInfoLoaderUrlEquivalent(legacyInfoLoaderUrl: string, newInfoLoaderUrl: string): boolean {
  const expected = legacyMarkerInfoQueryUrlToNewPath(legacyInfoLoaderUrl);
  if (expected == null) return false;
  const stripSlash = (s: string) => (s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s);
  return stripSlash(expected) === stripSlash(newInfoLoaderUrl.split("?")[0]!);
}
