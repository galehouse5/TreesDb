/**
 * Legacy <-> new-app URL equivalence table: the single source of truth for
 * legacy route-shape mapping (doc 07 §6 rule 4, doc 06 P4-01).
 *
 * WHY THIS LIVES IN lib/ AND NOT parity/: it has two consumers on opposite
 * sides of the deployment boundary. `parity/normalize.ts` (which re-exports
 * everything here, so parity-side callers are unchanged) uses it for
 * parity-comparison URL matching, and `lib/legacy-redirects.ts` -- Edge
 * middleware, SHIPPED to Vercel -- uses it to emit the P4-01 redirect map.
 * `.vercelignore` deliberately excludes the entire `parity/` directory from
 * uploads (parity/dumps contains PII and must never leave the machine), so
 * anything imported by deployed code cannot live under `parity/`. This file
 * is Edge-safe by construction: its only dependency is `./slug` (pure string
 * manipulation -- no node:crypto, no postgres, nothing filesystem-bound).
 *
 * Entry semantics, provisional-flag rules, and per-entry provenance comments
 * are unchanged from their original home in `parity/normalize.ts`.
 */
import { slugify, speciesSlug } from "./slug";

/**
 * A single legacy <-> new route-shape mapping.
 *
 * `legacyPattern` matches a legacy pathname (no query string) and captures
 * named params via RegExp named groups. `toNewPath` builds the new-app path
 * from those same params (query string, if any, is handled separately by
 * the caller when needed - most of these carry no meaningful query string
 * on the new side except grid/search params).
 *
 * `provisional` distinguishes routes CONFIRMED against the doc 03 §
 * "New URL scheme" table (docs/migration/03-phase1-readonly.md - the table
 * is explicitly marked authoritative there as of P0-08/P1 parity-harness
 * work) from routes that table does not cover, which stay best-guess/
 * unconfirmed until a later task lands and confirms them (single source of
 * truth also consumed by the Phase 4 redirect map, doc 06 P4-01).
 * `verify.ts` treats `provisional: true` as "route not yet confirmed - skip
 * with a clear log line" rather than attempting a comparison against it.
 */
export interface UrlEquivalenceEntry {
  /** Stable id for reporting, e.g. "tree-details". */
  id: string;
  /** Human description, cross-referenced to doc 01 §1 / doc 06 P4-01. */
  description: string;
  /** Matches the legacy URL's pathname (decoded). */
  legacyPattern: RegExp;
  /** Builds the new-app path from the legacy pattern's named capture groups. */
  toNewPath: (params: Record<string, string>) => string;
  /** False once confirmed per doc 03's authoritative table (see class doc above); true = still best-guess. */
  provisional: boolean;
}

/**
 * Splits a legacy species route segment `"{scientificName} ({commonName})"`
 * on the LAST ` (` per doc 06 P4-01 ("unresolvable -> 404 page"; the split
 * rule matches the legacy route binder so a common name containing parens
 * is still handled correctly).
 */
export function splitSpeciesRouteSegment(segment: string): { scientificName: string; commonName: string } | null {
  const idx = segment.lastIndexOf(" (");
  if (idx === -1 || !segment.endsWith(")")) return null;
  return {
    scientificName: segment.slice(0, idx),
    commonName: segment.slice(idx + 2, -1),
  };
}

const speciesSegment = "(?<species>.+ \\(.+\\))";

/** Resolves a matched species route segment to the real D-011 slug (web/lib/slug.ts), falling back to a bare slugify when the segment doesn't parse as "{bn} ({cn})" (shouldn't happen for real corpus data - defensive only). */
function speciesSlugFromSegment(segment: string): string {
  const parts = splitSpeciesRouteSegment(segment);
  return parts ? speciesSlug(parts.scientificName, parts.commonName) : slugify(segment);
}

/**
 * Entries below are marked `provisional: false` when the legacy shape and
 * new-app path are both given verbatim in docs/migration/03-phase1-
 * readonly.md's "New URL scheme" table (authoritative per that doc and this
 * task's brief) - species-containing routes use the real D-011 slug
 * (web/lib/slug.ts `speciesSlug`) per the paragraph directly below that
 * table. Entries doc 03's table does not cover (per-entity map pins vs. the
 * bulk `/api/map/markers` feed, the bare `/Browse`/`/Browse/Activity` nav
 * pages, Phase-2 account links) stay `provisional: true` - best-guess only,
 * and `verify.ts` skips them with a clear log line rather than comparing
 * against them.
 *
 * `/Export/*`: doc 03 says "mirror legacy paths, lowercased". Read literally
 * for the two non-species filter endpoints (single lowercased path segment,
 * query forwarded by the caller) and combined with the species-slug rule
 * for the three species-bearing export shapes (Trees/Sites/States id
 * segments were already lowercase-mirrored to begin with).
 */
export const URL_EQUIVALENCE_TABLE: UrlEquivalenceEntry[] = [
  {
    id: "home",
    description: "/ redirects to /Map (legacy); new app's landing page",
    legacyPattern: /^\/$/,
    toNewPath: () => "/map",
    provisional: false,
  },
  {
    id: "map",
    description: "/Map -> /map",
    legacyPattern: /^\/Map$/,
    toNewPath: () => "/map",
    provisional: false,
  },
  {
    id: "map-all-markers",
    description: "/Map/AllMarkers -> /api/map/markers",
    legacyPattern: /^\/Map\/AllMarkers$/,
    toNewPath: () => "/api/map/markers",
    provisional: false,
  },
  {
    id: "map-tree-marker",
    description:
      "/Map/{id}/TreeMarker -> /api/map/trees/{id}/marker (best-guess: doc 03 table only confirms the bulk /api/map/markers feed and the *Info popups, not a per-entity pin endpoint)",
    legacyPattern: new RegExp("^/Map/(?<id>\\d+)/TreeMarker$"),
    toNewPath: (p) => `/api/map/trees/${p.id}/marker`,
    provisional: true,
  },
  {
    id: "map-site-marker",
    description:
      "/Map/{id}/SiteMarker -> /api/map/sites/{id}/marker (best-guess, see map-tree-marker)",
    legacyPattern: new RegExp("^/Map/(?<id>\\d+)/SiteMarker$"),
    toNewPath: (p) => `/api/map/sites/${p.id}/marker`,
    provisional: true,
  },
  {
    id: "map-state-marker-info",
    description: "/Map/{id}/StateMarkerInfo -> /api/map/states/{id}/info",
    legacyPattern: new RegExp("^/Map/(?<id>\\d+)/StateMarkerInfo$"),
    toNewPath: (p) => `/api/map/states/${p.id}/info`,
    provisional: false,
  },
  {
    id: "map-site-marker-info",
    description: "/Map/{id}/SiteMarkerInfo -> /api/map/sites/{id}/info",
    legacyPattern: new RegExp("^/Map/(?<id>\\d+)/SiteMarkerInfo$"),
    toNewPath: (p) => `/api/map/sites/${p.id}/info`,
    provisional: false,
  },
  {
    id: "map-tree-marker-info",
    description: "/Map/{id}/TreeMarkerInfo -> /api/map/trees/{id}/info (doc 07 §5.2 example)",
    legacyPattern: new RegExp("^/Map/(?<id>\\d+)/TreeMarkerInfo$"),
    toNewPath: (p) => `/api/map/trees/${p.id}/info`,
    provisional: false,
  },
  {
    id: "browse-locations",
    description: "/Browse/Locations -> /locations",
    legacyPattern: /^\/Browse\/Locations$/,
    toNewPath: () => "/locations",
    provisional: false,
  },
  {
    id: "browse-species-list",
    description: "/Browse/Species -> /species",
    legacyPattern: /^\/Browse\/Species$/,
    toNewPath: () => "/species",
    provisional: false,
  },
  {
    id: "browse-index",
    description: "/Browse -> /browse (not in doc 03's table - best-guess only)",
    legacyPattern: /^\/Browse$/,
    toNewPath: () => "/browse",
    provisional: true,
  },
  {
    id: "browse-activity",
    description: "/Browse/Activity -> /activity (not in doc 03's table - best-guess only)",
    legacyPattern: /^\/Browse\/Activity$/,
    toNewPath: () => "/activity",
    provisional: true,
  },
  {
    id: "tree-details",
    description: "/Browse/Trees/{id}/Details -> /trees/{id}",
    legacyPattern: new RegExp("^/Browse/Trees/(?<id>\\d+)/Details$"),
    toNewPath: (p) => `/trees/${p.id}`,
    provisional: false,
  },
  {
    id: "site-details",
    description: "/Browse/Sites/{id}/Details -> /sites/{id}",
    legacyPattern: new RegExp("^/Browse/Sites/(?<id>\\d+)/Details$"),
    toNewPath: (p) => `/sites/${p.id}`,
    provisional: false,
  },
  {
    id: "state-details",
    description: "/Browse/States/{id}/Details -> /states/{id}",
    legacyPattern: new RegExp("^/Browse/States/(?<id>\\d+)/Details$"),
    toNewPath: (p) => `/states/${p.id}`,
    provisional: false,
  },
  {
    id: "species-details",
    description: "/Browse/Species/{bn} ({cn})/Details -> /species/{slug} (D-011 speciesSlug)",
    legacyPattern: new RegExp(`^\\/Browse\\/Species\\/${speciesSegment}\\/Details$`),
    toNewPath: (p) => `/species/${speciesSlugFromSegment(p.species)}`,
    provisional: false,
  },
  {
    id: "site-species-details",
    description:
      "/Browse/Sites/{siteId}/Species/{bn} ({cn})/Details -> /species/{slug}?site={siteId} (nested-path legacy shape - doc 01 §1; the query-param scoped shape `/Browse/Species/{bn} ({cn})/Details?siteId=` that capture.ts's corpus fetches actually use resolves to the SAME new path and is handled by verify.ts layering `?site=` from the legacy query string onto the unscoped species-details mapping above, since matchLegacyUrl intentionally matches on pathname only)",
    legacyPattern: new RegExp(`^\\/Browse\\/Sites\\/(?<siteId>\\d+)\\/Species\\/${speciesSegment}\\/Details$`),
    toNewPath: (p) => `/species/${speciesSlugFromSegment(p.species)}?site=${p.siteId}`,
    provisional: false,
  },
  {
    id: "state-species-details",
    description:
      "/Browse/States/{stateId}/Species/{bn} ({cn})/Details -> /species/{slug}?state={stateId} (see site-species-details doc re: the query-param scoped shape)",
    legacyPattern: new RegExp(`^\\/Browse\\/States\\/(?<stateId>\\d+)\\/Species\\/${speciesSegment}\\/Details$`),
    toNewPath: (p) => `/species/${speciesSlugFromSegment(p.species)}?state=${p.stateId}`,
    provisional: false,
  },
  {
    id: "search",
    description: "/Search?term=... -> /search?term=...",
    legacyPattern: /^\/Search$/,
    toNewPath: () => "/search",
    provisional: false,
  },
  {
    id: "autocomplete-common-name",
    description:
      "/Trees/FindKnownSpeciesWithSimilarCommonName?term=&results= -> /api/species/suggest?by=common&term=&results=",
    legacyPattern: /^\/Trees\/FindKnownSpeciesWithSimilarCommonName$/,
    toNewPath: () => "/api/species/suggest?by=common",
    provisional: false,
  },
  {
    id: "autocomplete-scientific-name",
    description:
      "/Trees/FindKnownSpeciesWithSimilarScientificName?term=&results= -> /api/species/suggest?by=scientific&term=&results=",
    legacyPattern: /^\/Trees\/FindKnownSpeciesWithSimilarScientificName$/,
    toNewPath: () => "/api/species/suggest?by=scientific",
    provisional: false,
  },
  {
    id: "export-trees",
    description: "/Export/Trees/{id} -> /export/trees/{id} (lowercased mirror)",
    legacyPattern: new RegExp("^/Export/Trees/(?<id>\\d+)$"),
    toNewPath: (p) => `/export/trees/${p.id}`,
    provisional: false,
  },
  {
    id: "export-sites",
    description: "/Export/Sites/{id} -> /export/sites/{id} (lowercased mirror)",
    legacyPattern: new RegExp("^/Export/Sites/(?<id>\\d+)$"),
    toNewPath: (p) => `/export/sites/${p.id}`,
    provisional: false,
  },
  {
    id: "export-states",
    description: "/Export/States/{id} -> /export/states/{id} (lowercased mirror)",
    legacyPattern: new RegExp("^/Export/States/(?<id>\\d+)$"),
    toNewPath: (p) => `/export/states/${p.id}`,
    provisional: false,
  },
  {
    // BUGFIX (surfaced by the P1-15 sweep): unlike the UI species-details
    // route (`/species/{slug}`, D-011), the THREE export routes below
    // deliberately mirror the legacy `{bn} ({cn})` segment LITERALLY
    // (lowercased path prefix only) - see `app/export/_lib/species-
    // segment.ts`'s doc comment, which cites `TMD/Global.asax.cs`'s literal
    // route templates directly, and doc 03's "New URL scheme" table, where
    // `/export/...` ("mirror legacy paths, lowercased") is a SEPARATE row
    // from `/species/{slug}`. This entry previously called
    // `speciesSlugFromSegment`, sending every individual-species export
    // check at a slug path the app never registers (`parseSpeciesSegment`
    // rejects a slug - no " (" + trailing ")" shape - so the route 404s),
    // which is why every `/Export/Species/{bn} ({cn})` check failed with a
    // literal "Not Found" body. `encodeURIComponent` re-escapes the
    // (already pathname-decoded, see `matchLegacyUrl`) segment for use in a
    // URL path; it leaves `(`, `)`, `'` unescaped (not in its reserved set)
    // exactly like the legacy segment shape, and Next.js decodes the
    // dynamic `[species]` segment back to the identical text server-side.
    id: "export-species",
    description: "/Export/Species/{bn} ({cn}) -> /export/species/{bn} ({cn}) (literal lowercased mirror, NOT the D-011 slug - doc 03 §export row)",
    legacyPattern: new RegExp(`^\\/Export\\/Species\\/${speciesSegment}$`),
    toNewPath: (p) => `/export/species/${encodeURIComponent(p.species)}`,
    provisional: false,
  },
  {
    id: "export-sites-species",
    description: "/Export/Sites/{id}/Species/{bn} ({cn}) -> /export/sites/{id}/species/{bn} ({cn}) (literal mirror, see export-species)",
    legacyPattern: new RegExp(`^\\/Export\\/Sites\\/(?<siteId>\\d+)\\/Species\\/${speciesSegment}$`),
    toNewPath: (p) => `/export/sites/${p.siteId}/species/${encodeURIComponent(p.species)}`,
    provisional: false,
  },
  {
    id: "export-states-species",
    description: "/Export/States/{id}/Species/{bn} ({cn}) -> /export/states/{id}/species/{bn} ({cn}) (literal mirror, see export-species)",
    legacyPattern: new RegExp(`^\\/Export\\/States\\/(?<stateId>\\d+)\\/Species\\/${speciesSegment}$`),
    toNewPath: (p) => `/export/states/${p.stateId}/species/${encodeURIComponent(p.species)}`,
    provisional: false,
  },
  {
    id: "export-species-by-filters",
    description: "/Export/SpeciesByFilters?... -> /export/speciesbyfilters?... (lowercased mirror, doc 03: literal, no re-segmenting)",
    legacyPattern: /^\/Export\/SpeciesByFilters$/,
    toNewPath: () => "/export/speciesbyfilters",
    provisional: false,
  },
  {
    id: "export-locations-by-filters",
    description: "/Export/LocationsByFilters?... -> /export/locationsbyfilters?... (lowercased mirror)",
    legacyPattern: /^\/Export\/LocationsByFilters$/,
    toNewPath: () => "/export/locationsbyfilters",
    provisional: false,
  },
  {
    id: "photos",
    description: "/Photos/{id}/{size} -> /photos/{id}/{size}",
    legacyPattern: new RegExp("^/Photos/(?<id>\\d+)/(?<size>\\w+)$"),
    toNewPath: (p) => `/photos/${p.id}/${p.size}`,
    provisional: false,
  },
  {
    id: "photos-default-size",
    description: "/Photos/{id} (size defaults Original) -> /photos/{id}/Original",
    legacyPattern: new RegExp("^/Photos/(?<id>\\d+)$"),
    toNewPath: (p) => `/photos/${p.id}/Original`,
    provisional: false,
  },
  {
    id: "account-complete-registration",
    description: "/Account/{token}/CompleteRegistration -> /account/verify/{token} (Phase 2 - not in doc 03's Phase 1 table)",
    legacyPattern: new RegExp("^/Account/(?<token>[A-Za-z0-9_-]{43})/CompleteRegistration$"),
    toNewPath: (p) => `/account/verify/${p.token}`,
    provisional: true,
  },
  {
    id: "account-complete-password-assistance",
    description: "/Account/{token}/CompletePasswordAssistance -> /account/reset/{token} (Phase 2 - not in doc 03's Phase 1 table)",
    legacyPattern: new RegExp("^/Account/(?<token>[A-Za-z0-9_-]{43})/CompletePasswordAssistance$"),
    toNewPath: (p) => `/account/reset/${p.token}`,
    provisional: true,
  },
];
