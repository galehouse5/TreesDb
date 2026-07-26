/**
 * Shared normalization rules for parity comparison, per
 * docs/migration/07-parity-testing.md §6. Consumed by the (not-yet-written)
 * comparator (`verify.ts`) and by extractors in `web/parity/extractors/**`.
 *
 * Rules implemented here:
 *  1. Numbers: parse -> Math.fround -> compare exactly (no epsilons).
 *  2. Dates: compare as ISO instants.
 *  3. Whitespace: collapse+trim for HTML-extracted text ONLY (never for
 *     CSV/JSON categories - those compare byte-for-byte per doc §5.1/§7.1).
 *  4. URL equivalence: single source-of-truth table mapping legacy route
 *     shapes to new-app route shapes (CONFIRMED ones per doc 03's "New URL
 *     scheme" table where covered, best-guess/`provisional: true` where
 *     not). Also intended to seed the Phase 4 redirect map (doc 06 P4-01) -
 *     one source of truth.
 */
import { URL_EQUIVALENCE_TABLE, type UrlEquivalenceEntry } from "../lib/url-equivalence";

// ---------------------------------------------------------------------------
// 1. Float32 numeric comparison
// ---------------------------------------------------------------------------

/**
 * Parses a numeric string the way legacy data / CSV / JSON would render one
 * (plain decimal, optional leading sign, optional exponent) and coerces to
 * float32. Throws on unparseable input - callers that need a lenient parse
 * (e.g. stripping a trailing unit suffix from a *formatted* display string)
 * should strip the suffix themselves before calling this; formatted-string
 * comparison is intentionally verbatim (doc §5.4), not numeric.
 */
export function toFloat32(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value.trim());
  if (Number.isNaN(n) && typeof value === "string" && value.trim().toLowerCase() !== "nan") {
    throw new Error(`toFloat32: unparseable numeric value ${JSON.stringify(value)}`);
  }
  return Math.fround(n);
}

/** Float32-exact equality. No epsilon - float32 coercion makes one unnecessary (doc §6). */
export function floatEquals(a: number | string, b: number | string): boolean {
  const fa = toFloat32(a);
  const fb = toFloat32(b);
  // Treat NaN === NaN as equal for parity purposes (both sides "no data" cases
  // should already be filtered to null/undefined before reaching here; this
  // guards against accidental NaN propagation being reported as a spurious diff).
  if (Number.isNaN(fa) && Number.isNaN(fb)) return true;
  return fa === fb;
}

/** Null-aware float32 equality: both null/undefined -> equal; one-sided -> not equal. */
export function floatEqualsNullable(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
): boolean {
  const aMissing = a === null || a === undefined;
  const bMissing = b === null || b === undefined;
  if (aMissing || bMissing) return aMissing === bMissing;
  return floatEquals(a, b);
}

// ---------------------------------------------------------------------------
// 2. Date / instant comparison
// ---------------------------------------------------------------------------

/**
 * Coerces a date-ish value to an ISO instant string for comparison.
 * Legacy local-time serialization is mapped per D-002 (treat as UTC).
 */
export function toIsoInstant(value: string | number | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`toIsoInstant: unparseable date value ${JSON.stringify(value)}`);
  }
  return d.toISOString();
}

export function dateEquals(a: string | number | Date, b: string | number | Date): boolean {
  return toIsoInstant(a) === toIsoInstant(b);
}

export function dateEqualsNullable(
  a: string | number | Date | null | undefined,
  b: string | number | Date | null | undefined,
): boolean {
  const aMissing = a === null || a === undefined || a === "";
  const bMissing = b === null || b === undefined || b === "";
  if (aMissing || bMissing) return aMissing === bMissing;
  return dateEquals(a, b);
}

/**
 * .NET `yyyy-MM-dd` date-only values (CSV export column 23, doc 01 §8) are
 * compared as plain strings - there is no time component or timezone to
 * normalize, and CSV categories must not be whitespace-normalized (doc §6).
 */
export function dateOnlyEquals(a: string, b: string): boolean {
  return a === b;
}

// ---------------------------------------------------------------------------
// 3. Whitespace normalization (HTML-extracted text only)
// ---------------------------------------------------------------------------

/**
 * Collapses internal whitespace runs to a single space and trims.
 * Use ONLY on text pulled out of HTML by an extractor. Never apply to
 * CSV or JSON payload strings (doc §6 is explicit: those compare raw).
 */
export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// 4. URL equivalence table
// ---------------------------------------------------------------------------

/**
 * MOVED to `web/lib/url-equivalence.ts` (re-exported here so every parity
 * consumer keeps its `parity/normalize` import unchanged). The move is a
 * deployment-boundary requirement, not a refactor for its own sake:
 * `lib/legacy-redirects.ts` -- Edge middleware SHIPPED to Vercel -- consumes
 * the table, and `.vercelignore` deliberately excludes all of `parity/` from
 * uploads (parity/dumps contains PII), so the table cannot live here. See
 * that file's header for the entry semantics and provenance.
 */
export {
  URL_EQUIVALENCE_TABLE,
  splitSpeciesRouteSegment,
  type UrlEquivalenceEntry,
} from "../lib/url-equivalence";

/** Result of matching a legacy URL against the equivalence table. */
export interface UrlMatch {
  entry: UrlEquivalenceEntry;
  params: Record<string, string>;
}

/** Decodes a legacy pathname (which may carry raw spaces/parens, doc 01 §1) for pattern matching. */
function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname.replace(/\+/g, " "));
  } catch {
    return pathname;
  }
}

/** Matches a legacy URL (path or path+query) against the table; returns null if no shape matches. */
export function matchLegacyUrl(legacyUrl: string): UrlMatch | null {
  const [rawPathname] = legacyUrl.split("?");
  const pathname = decodePathname(rawPathname);
  for (const entry of URL_EQUIVALENCE_TABLE) {
    const m = entry.legacyPattern.exec(pathname);
    if (m) {
      return { entry, params: { ...(m.groups ?? {}) } };
    }
  }
  return null;
}

/** Builds the provisional new-app path for a matched legacy URL. Returns null if unmatched. */
export function toProvisionalNewPath(legacyUrl: string): string | null {
  const match = matchLegacyUrl(legacyUrl);
  if (!match) return null;
  return match.entry.toNewPath(match.params);
}

/**
 * Compares a legacy URL against a candidate new-app URL for route-shape
 * equivalence (doc §5.2: `InfoLoaderUrl`/`IconUrl` compared "by route-shape
 * mapping"). Ignores query-string ordering; a trailing slash is normalized
 * away on both sides.
 */
export function urlsEquivalent(legacyUrl: string, newUrl: string): boolean {
  const expected = toProvisionalNewPath(legacyUrl);
  if (expected == null) return false;
  const stripSlash = (s: string) => (s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s);
  const [expPath, expQuery] = expected.split("?");
  const [actPath, actQuery] = newUrl.split("?");
  if (stripSlash(expPath) !== stripSlash(actPath)) return false;
  const norm = (q?: string) =>
    new URLSearchParams(q ?? "")
      .toString()
      .split("&")
      .filter(Boolean)
      .sort()
      .join("&");
  return norm(expQuery) === norm(actQuery);
}
