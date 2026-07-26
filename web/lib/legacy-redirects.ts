/**
 * P4-01 legacy-URL redirect map (docs/migration/06-phase4-cutover.md §P4-01,
 * doc 07 §5.6). Pure function: `(method, pathname, search) -> {status,
 * location} | null`. No I/O, no Next.js types -- `middleware.ts` is the only
 * caller, on the Edge runtime.
 *
 * SOURCE OF TRUTH / REUSE: `web/lib/url-equivalence.ts`'s
 * `URL_EQUIVALENCE_TABLE` (formerly in `parity/normalize.ts`, which still
 * re-exports it; moved because `.vercelignore` excludes `parity/` from
 * deploys, so Edge middleware cannot import from there) is authoritative for
 * legacy shape <-> new-app path mapping (doc 07 §6, doc 06 P4-01: "same
 * table, now emitting 301s"). This file IMPORTS it directly rather than
 * transcribing -- the table module is Edge-safe by construction (only dep is
 * `./slug`, pure string manipulation: no `node:crypto`, no `postgres`,
 * nothing filesystem-bound). Per-shape handling below reuses each confirmed
 * (`provisional: false`) entry's `legacyPattern` (re-flagged case-insensitive
 * via `.source`, see `ci()`) so the actual route regexes stay pinned to a
 * single source of truth; only the OUTPUT-building differs per shape where
 * this redirect map needs behavior `normalize.ts` doesn't attempt (status
 * code, query passthrough, unresolvable-species handling) -- normalize.ts's
 * own `toNewPath` is written for parity-comparison purposes, not for a live
 * redirect, and is only reused as-is for the shapes where that distinction
 * doesn't matter (see comments per entry below).
 *
 * DEVIATIONS FROM normalize.ts's TABLE (each documented at point of use):
 *  - "home" (`/` -> `/map`) is EXCLUDED here. `app/route.ts` already
 *    hand-rolls legacy's exact 302 (D-017) for the bare "/" path outside
 *    this map entirely; duplicating it here would risk a conflicting status
 *    code (D-017 deliberately chose 302 over this doc's general "301s"
 *    policy, for future landing-page flexibility) and there is no reason
 *    for this file's matcher to even see "/".
 *  - "map-tree-marker" / "map-site-marker" (single-pin JSON, confirmed REAL
 *    legacy routes -- `MapController.TreeMarker`/`SiteMarker`, reached via
 *    the `DefaultWithId` route `{controller}/{id}/{action}`) are EXCLUDED:
 *    normalize.ts marks them `provisional: true` because no new-app target
 *    exists yet (`app/api/map/**` only has `markers`, and
 *    `{trees,sites,states}/{id}/info` -- no per-entity `/marker` endpoint).
 *    Redirecting to a path that 404s is worse than this map staying silent
 *    (falls through to the normal 404). TODO: once that API route ships,
 *    flip `provisional: false` in normalize.ts and add the two entries here.
 *  - "browse-index" (bare `/Browse`) is EXCLUDED: reading
 *    `TMD/Controllers/BrowseController.cs` + `TMD/Global.asax.cs` directly
 *    shows the `Browse` route maps to `BrowseController.Index`, but no
 *    `Index` action (or view) exists on that controller -- legacy ITSELF
 *    404s for bare `/Browse` (MVC's missing-action exception). normalize.ts's
 *    `provisional: true` guess (`/browse`, which also doesn't exist as a
 *    new-app page) was therefore never reachable traffic; nothing to
 *    redirect.
 *  - "browse-activity" is PROMOTED from `provisional: true` to a real 301
 *    here: `app/activity/page.tsx` now exists (it didn't when normalize.ts's
 *    comment was written), and `BrowseController.Activity()` is a real
 *    legacy action. Not required by doc 06's bullet list verbatim, but a
 *    real, cheap, low-risk shape to cover.
 *  - "account-complete-registration" / "account-complete-password-assistance"
 *    are reimplemented here rather than reusing `entry.toNewPath` verbatim:
 *    `app/(legacy-tokens)/Account/[token]/**` (P2-04) already implements
 *    both literal-case routes directly as Next.js route handlers, so this
 *    map's version exists ONLY to extend them to case-insensitive matching
 *    (doc 06's explicit requirement) and this map's general 301 policy
 *    (those route handlers use `NextResponse.redirect()`'s 307 default).
 *    Target paths are taken from the ACTUAL route handlers (source of
 *    truth), not from normalize.ts, which is stale for the password-
 *    assistance one: it guesses `/account/reset/{token}`, but
 *    `app/(legacy-tokens)/Account/[token]/CompletePasswordAssistance/route.ts`
 *    actually redirects to `/account/password-assistance/{token}`.
 *  - "/Main" is ADDED (not in normalize.ts's table at all). Legacy's
 *    `Main/{action}` route (default action `Index`) is the SAME controller
 *    action the bare `/` route resolves to (`TMD/Global.asax.cs`'s
 *    `Default` route also defaults to `controller=Main, action=Index`) --
 *    i.e. `/Main` behaves exactly like `/` in legacy (302 to `/Map`,
 *    confirmed by the captured snapshot `parity/snapshots/redirects/
 *    Main.json`). Emitted as a 301 here per this doc's general policy
 *    (unlike D-017's specific carve-out for the bare "/" route, which
 *    predates this task and lives outside this file).
 *  - Autocomplete endpoints (`/Trees/FindKnownSpeciesWithSimilar*`) are
 *    EXCLUDED: neither doc 06's "must handle" bullet list nor this task's
 *    middleware-matcher prefix enumeration (`/Browse`, `/Map`, `/Export`,
 *    `/Search`, `/Photos`, `/Account/{token}/...`, `/Main`) mentions
 *    `/Trees`. These were AJAX-only endpoints called by legacy's own JS,
 *    which stops running the moment DNS cuts over anyway.
 *
 * QUERY-STRING POLICY (doc 06 P4-01 + this task's brief point 1): passed
 * through VERBATIM for the grid/list/detail shapes, since doc 01 §1's
 * routing table and this app's own query param names (`page`/`sort`/
 * `sortAsc`/`botanicalNameFilter`/etc., confirmed by reading
 * `app/species/page.tsx` et al.) are IDENTICAL between legacy and the new
 * app -- normalize.ts is silent on query strings entirely (its own header
 * comment: pathname-only), so this is this file's own considered extension,
 * not a transcription. Dropped (documented per shape below) where no
 * meaningful new-app query surface exists.
 *
 * CASE-INSENSITIVITY (doc 06: "legacy IIS routes were case-insensitive --
 * middleware matches case-insensitively"): every shape pattern below is
 * built from the confirmed entry's regex `.source` re-flagged `"i"` via
 * `ci()`. Case-insensitive matching means a shape can match an ALREADY-
 * CANONICAL new-app path that happens to differ from its legacy source only
 * by case (e.g. requesting `/map` -- the real new-app page -- also matches
 * the case-insensitive `/Map` pattern; same for every `/Export/**` and
 * `/Photos/**` mirror, and `/Search`). `legacyRedirect` guards against this
 * generically at the end: if the computed target is byte-identical to the
 * (decoded) input, it returns `null` (no redirect) rather than a same-URL
 * redirect loop.
 *
 * UNRESOLVABLE SPECIES -> 404 WITH SEARCH BOX (doc 06 P4-01): "unresolvable"
 * is purely a PARSE check (`splitSpeciesRouteSegment`'s last `' ('` split,
 * see `lib/slug.ts`'s header on why this needs no DB lookup) -- when a
 * species segment doesn't parse, the matching shape's `build()` returns
 * `null`, `legacyRedirect` returns `null`, and `middleware.ts` falls through
 * to Next's normal routing, which 404s (no page matches an unmapped
 * `/Browse/**` path) straight to `app/not-found.tsx`. That page did NOT
 * need a dedicated `app/legacy-404/**` page: `app/layout.tsx` already wires
 * `<SearchWidget />` into the header nav (P1-09), and `app/not-found.tsx`
 * renders inside that root layout like every other page, so it already has
 * a working search box. Verified by reading both files.
 */
import {
  URL_EQUIVALENCE_TABLE,
  splitSpeciesRouteSegment,
  type UrlEquivalenceEntry,
} from "./url-equivalence";
import { speciesSlug } from "./slug";

export interface LegacyRedirect {
  status: 301 | 302;
  location: string;
}

const TABLE_BY_ID: ReadonlyMap<string, UrlEquivalenceEntry> = new Map(
  URL_EQUIVALENCE_TABLE.map((e) => [e.id, e]),
);

function entry(id: string): UrlEquivalenceEntry {
  const e = TABLE_BY_ID.get(id);
  if (!e) throw new Error(`legacy-redirects: normalize.ts's URL_EQUIVALENCE_TABLE has no entry "${id}" (table changed out from under this file)`);
  return e;
}

/** Re-flags a `normalize.ts` pattern case-insensitive without retyping it (doc 06: "middleware matches case-insensitively"). */
function ci(re: RegExp): RegExp {
  return new RegExp(re.source, "i");
}

/**
 * Decodes a legacy pathname the same way `normalize.ts`'s (private)
 * `decodePathname` does -- transcribed rather than imported since it isn't
 * exported; kept a 2-line function so drift is easy to spot against the
 * original. Handles raw spaces (no-op), `%20` (via `decodeURIComponent`),
 * and `+` (translated to a space first, matching legacy's tolerant decoding
 * -- doc 06 P4-01: "decode both raw-space and %20/+ encodings").
 */
function decodeLegacyPathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname.replace(/\+/g, " "));
  } catch {
    return pathname;
  }
}

function stripLeadingQuestionMark(search: string): string {
  return search.startsWith("?") ? search.slice(1) : search;
}

/** Appends the legacy request's query string verbatim (doc 06 + this file's header "QUERY-STRING POLICY"). */
function passthroughQuery(path: string, search: string): string {
  return search ? `${path}${search}` : path;
}

/**
 * Builds `/species/{slug}` (or scoped `?site=`/`?state=`) for a species
 * route, mirroring `parity/verify/url-resolve.ts`'s `resolveSpeciesDetailsPath`
 * (same design: nested-path scoping wins when given directly via
 * `fixedSite`/`fixedState`; otherwise legacy's own query-param scoped form
 * -- `?siteId=`/`?stateId=`, confirmed real, doc comment on normalize.ts's
 * `site-species-details` entry -- is translated). Returns `null` when the
 * segment doesn't parse (doc 06: unresolvable -> 404-with-search, see file
 * header).
 */
function buildSpeciesTarget(
  speciesSegment: string,
  search: string,
  fixedSite?: string,
  fixedState?: string,
): string | null {
  const parts = splitSpeciesRouteSegment(speciesSegment);
  if (!parts) return null;
  const slug = speciesSlug(parts.scientificName, parts.commonName);
  const q = new URLSearchParams(stripLeadingQuestionMark(search));
  const site = fixedSite ?? q.get("siteId") ?? undefined;
  const state = fixedState ?? q.get("stateId") ?? undefined;
  const out = new URLSearchParams();
  if (site) out.set("site", site);
  if (state) out.set("state", state);
  const qs = out.toString();
  return `/species/${slug}${qs ? `?${qs}` : ""}`;
}

/**
 * The three `/Export/**` species shapes deliberately mirror the legacy
 * `{bn} ({cn})` segment LITERALLY (not the D-011 slug) -- see
 * `normalize.ts`'s `export-species` entry doc comment, which traces this to
 * `app/export/_lib/species-segment.ts` + the literal `Global.asax.cs` route
 * templates. No unresolvable-null check here (unlike the UI species-details
 * shapes above): an export segment that doesn't parse still gets mirrored
 * literally, and the export route's own `parseSpeciesSegment` rejects it
 * with that route's normal (non-search-box) 404 -- consistent with how
 * every other malformed export request already behaves, not a shape this
 * redirect map needs to special-case.
 */
function buildExportSpeciesMirror(speciesSegment: string): string {
  return `/export/species/${encodeURIComponent(speciesSegment)}`;
}

interface Shape {
  id: string;
  pattern: RegExp;
  status: 301 | 302;
  /** `null` = unresolvable (species parse failure) -> no redirect, fall through to the 404-with-search-box. */
  build: (params: Record<string, string>, search: string) => string | null;
}

const SHAPES: Shape[] = [
  // --- Map -----------------------------------------------------------
  { id: "map", pattern: ci(entry("map").legacyPattern), status: 301, build: (_p, s) => passthroughQuery("/map", s) },
  // Marker JSON URLs get 301s too (doc 06: "any cached legacy clients die at DNS switch anyway"). No query passthrough -- legacy's AllMarkers/MarkerInfo actions take none.
  { id: "map-all-markers", pattern: ci(entry("map-all-markers").legacyPattern), status: 301, build: () => "/api/map/markers" },
  { id: "map-state-marker-info", pattern: ci(entry("map-state-marker-info").legacyPattern), status: 301, build: (p) => `/api/map/states/${p.id}/info` },
  { id: "map-site-marker-info", pattern: ci(entry("map-site-marker-info").legacyPattern), status: 301, build: (p) => `/api/map/sites/${p.id}/info` },
  { id: "map-tree-marker-info", pattern: ci(entry("map-tree-marker-info").legacyPattern), status: 301, build: (p) => `/api/map/trees/${p.id}/info` },

  // --- Browse ----------------------------------------------------------
  { id: "browse-locations", pattern: ci(entry("browse-locations").legacyPattern), status: 301, build: (_p, s) => passthroughQuery("/locations", s) },
  { id: "browse-species-list", pattern: ci(entry("browse-species-list").legacyPattern), status: 301, build: (_p, s) => passthroughQuery("/species", s) },
  // Promoted from normalize.ts's provisional guess -- see file header.
  { id: "browse-activity", pattern: ci(entry("browse-activity").legacyPattern), status: 301, build: (_p, s) => passthroughQuery("/activity", s) },
  { id: "tree-details", pattern: ci(entry("tree-details").legacyPattern), status: 301, build: (p, s) => passthroughQuery(`/trees/${p.id}`, s) },
  { id: "site-details", pattern: ci(entry("site-details").legacyPattern), status: 301, build: (p, s) => passthroughQuery(`/sites/${p.id}`, s) },
  { id: "state-details", pattern: ci(entry("state-details").legacyPattern), status: 301, build: (p, s) => passthroughQuery(`/states/${p.id}`, s) },
  // Scoped forms matched FIRST (more specific prefixes: Sites/{id}/Species, States/{id}/Species) so the bare species-details pattern below can't shadow them -- all three are mutually exclusive by literal prefix anyway (Species/ vs Sites/.../Species/ vs States/.../Species/), order is for readability only.
  {
    id: "site-species-details",
    pattern: ci(entry("site-species-details").legacyPattern),
    status: 301,
    build: (p, s) => buildSpeciesTarget(p.species!, s, p.siteId, undefined),
  },
  {
    id: "state-species-details",
    pattern: ci(entry("state-species-details").legacyPattern),
    status: 301,
    build: (p, s) => buildSpeciesTarget(p.species!, s, undefined, p.stateId),
  },
  {
    id: "species-details",
    pattern: ci(entry("species-details").legacyPattern),
    status: 301,
    build: (p, s) => buildSpeciesTarget(p.species!, s),
  },

  // --- Search ------------------------------------------------------------
  { id: "search", pattern: ci(entry("search").legacyPattern), status: 301, build: (_p, s) => passthroughQuery("/search", s) },

  // --- Export (all eight shapes: 302, doc 06 P4-01) -----------------------
  { id: "export-trees", pattern: ci(entry("export-trees").legacyPattern), status: 302, build: (p) => `/export/trees/${p.id}` },
  { id: "export-sites", pattern: ci(entry("export-sites").legacyPattern), status: 302, build: (p) => `/export/sites/${p.id}` },
  { id: "export-states", pattern: ci(entry("export-states").legacyPattern), status: 302, build: (p) => `/export/states/${p.id}` },
  { id: "export-species", pattern: ci(entry("export-species").legacyPattern), status: 302, build: (p) => buildExportSpeciesMirror(p.species!) },
  { id: "export-sites-species", pattern: ci(entry("export-sites-species").legacyPattern), status: 302, build: (p) => `/export/sites/${p.siteId}/species/${encodeURIComponent(p.species!)}` },
  { id: "export-states-species", pattern: ci(entry("export-states-species").legacyPattern), status: 302, build: (p) => `/export/states/${p.stateId}/species/${encodeURIComponent(p.species!)}` },
  { id: "export-species-by-filters", pattern: ci(entry("export-species-by-filters").legacyPattern), status: 302, build: (_p, s) => passthroughQuery("/export/speciesbyfilters", s) },
  { id: "export-locations-by-filters", pattern: ci(entry("export-locations-by-filters").legacyPattern), status: 302, build: (_p, s) => passthroughQuery("/export/locationsbyfilters", s) },

  // --- Photos --------------------------------------------------------------
  // Size segment's case is passed through unchanged -- app/photos/[id]/[[...size]]/route.ts's canonicalizePhotoSizeName already matches size names case-insensitively (read directly), so no normalization needed here.
  { id: "photos", pattern: ci(entry("photos").legacyPattern), status: 301, build: (p) => `/photos/${p.id}/${p.size}` },
  { id: "photos-default-size", pattern: ci(entry("photos-default-size").legacyPattern), status: 301, build: (p) => `/photos/${p.id}/Original` },

  // --- Account tokens (emailed links!) --------------------------------------
  // Reimplemented (not entry.toNewPath) -- see file header "DEVIATIONS".
  {
    id: "account-complete-registration",
    pattern: ci(entry("account-complete-registration").legacyPattern),
    status: 301,
    build: (p) => `/account/verify/${encodeURIComponent(p.token!)}`,
  },
  {
    id: "account-complete-password-assistance",
    pattern: ci(entry("account-complete-password-assistance").legacyPattern),
    status: 301,
    build: (p) => `/account/password-assistance/${encodeURIComponent(p.token!)}`,
  },

  // --- Main (legacy odds and ends, doc 07 §5.6) -----------------------------
  // Not in normalize.ts's table -- added here, see file header.
  { id: "main", pattern: /^\/Main$/i, status: 301, build: (_p, s) => passthroughQuery("/map", s) },
];

const READ_METHODS = new Set(["GET", "HEAD"]);

/**
 * Resolves a legacy request to a redirect, or `null` (no redirect -- either
 * genuinely unmapped, matches a real new-app route already, or an
 * unresolvable species segment that should 404-with-search per doc 06).
 *
 * `search` is the query string INCLUDING a leading `?` if present (i.e.
 * `req.nextUrl.search`), or `""`.
 */
export function legacyRedirect(method: string, pathname: string, search: string): LegacyRedirect | null {
  if (!READ_METHODS.has(method.toUpperCase())) return null;

  const decodedPathname = decodeLegacyPathname(pathname);

  for (const shape of SHAPES) {
    const m = shape.pattern.exec(decodedPathname);
    if (!m) continue;

    const location = shape.build({ ...(m.groups ?? {}) }, search);
    if (location === null) return null; // unresolvable species -> fall through to 404-with-search-box

    // Self-redirect guard (file header "CASE-INSENSITIVITY"): a
    // case-insensitive shape pattern can match an ALREADY-canonical
    // new-app path (e.g. `/map`, `/export/trees/123`, `/search?term=x`)
    // that only differs from its legacy shape by case. Redirecting a
    // request to the exact URL it already is would be a same-URL loop.
    // Compare DECODED path against decoded path: `location` is built with
    // percent-encoded segments while `decodedPathname` is fully decoded, so
    // a raw string compare never matched any path containing a space
    // (virtually every species export segment) and the guard silently
    // failed into an infinite 302 loop on canonical /export/species/**
    // URLs (design-audit follow-up finding).
    const queryStart = location.indexOf("?");
    const locationPath = queryStart === -1 ? location : location.slice(0, queryStart);
    const locationSearch = queryStart === -1 ? "" : location.slice(queryStart);
    if (decodeLegacyPathname(locationPath) === decodedPathname && locationSearch === search) return null;

    return { status: shape.status, location };
  }

  return null;
}
