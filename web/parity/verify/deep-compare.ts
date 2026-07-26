/**
 * Generic, schema-agnostic deep-JSON comparator shared by the `markers` and
 * `pages`/`markerinfo` categories (doc 07 §5.2/§5.4). Pure - no I/O, no
 * knowledge of HTTP/fetch/manifests, so it's trivially unit-testable with
 * inline fixtures.
 *
 * Rules (doc 07 §6, applied uniformly across both JSON payload shapes since
 * both are machine-readable structures, not free HTML text):
 *  - Objects compared key-order-insensitively; the union of both sides' keys
 *    is walked so a key present on only one side is reported as a mismatch
 *    rather than silently ignored.
 *  - Arrays compared element-wise IN ORDER by default (callers that need
 *    the doc's order-INsensitive "keyed set" semantics - markers' `Markers`
 *    array, W-004 - pre-sort/bucket themselves before calling this, since
 *    that keying is category-specific).
 *  - Numbers compared via `normalize.ts`'s float32 rule (no epsilon).
 *  - Strings compared verbatim by default (doc §5.4: "formatted strings are
 *    compared verbatim - that is the point"), EXCEPT fields named in
 *    `urlEquivalenceFields`/`pathnameOnlyFields` (matched case-insensitively
 *    against the last path segment), which get URL-aware comparison instead
 *    - hrefs/URLs differ in shape by design (legacy MVC route vs. new-app
 *      route), and asset paths may carry an incidental cache-busting query
 *      string neither side is expected to agree on byte-for-byte.
 *  - `null`/`undefined` are treated as the same "missing" value on both
 *    sides (JSON.parse never produces `undefined`, but the legacy/new
 *    extractor JSON shapes use `undefined` for "field not applicable to
 *    this page" - schema.ts's `SpeciesMaxRowsJson`/optional page sections).
 */
import { urlsEquivalent, floatEquals } from "../normalize";

export interface FieldMismatch {
  /** Dotted/bracketed path into the compared structure, e.g. "location.rows.County" or "Markers[3].Title". */
  path: string;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface DeepCompareOptions {
  /** Field names (last path segment, case-insensitive) compared via `normalize.ts`'s `urlsEquivalent` instead of strict equality. Default: href, url, infoloaderurl. */
  urlEquivalenceFields?: Set<string>;
  /** Field names (last path segment, case-insensitive) compared by pathname only (query string and origin stripped from both sides) - for static-asset URLs that legitimately differ by an incidental cache-busting query. Default: iconurl, thumbnailsrc. */
  pathnameOnlyFields?: Set<string>;
}

const DEFAULT_URL_FIELDS = new Set(["href", "url", "infoloaderurl"]);
const DEFAULT_PATHNAME_FIELDS = new Set(["iconurl", "thumbnailsrc"]);

function isMissing(v: unknown): boolean {
  return v === null || v === undefined;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Strips origin and query string, for asset-path comparison (see `pathnameOnlyFields` above). */
export function pathnameOnly(url: string): string {
  const withoutQuery = url.split("?")[0]!.split("#")[0]!;
  const originMatch = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]*/.exec(withoutQuery);
  return originMatch ? withoutQuery.slice(originMatch[0].length) : withoutQuery;
}

function lastSegment(path: string): string {
  const m = /([A-Za-z0-9_]+)(\[\d+\])?$/.exec(path);
  return (m?.[1] ?? path).toLowerCase();
}

function mismatch(path: string, expected: unknown, actual: unknown, message?: string): FieldMismatch {
  return {
    path,
    expected,
    actual,
    message: message ?? `${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  };
}

/**
 * Deep-compares `expected` (legacy) against `actual` (new), appending every
 * mismatch found to `out`. Returns nothing - callers read `out`.
 */
export function deepCompareJson(
  path: string,
  expected: unknown,
  actual: unknown,
  out: FieldMismatch[],
  opts: DeepCompareOptions = {},
): void {
  const urlFields = opts.urlEquivalenceFields ?? DEFAULT_URL_FIELDS;
  const pathnameFields = opts.pathnameOnlyFields ?? DEFAULT_PATHNAME_FIELDS;

  if (isMissing(expected) || isMissing(actual)) {
    if (isMissing(expected) !== isMissing(actual)) {
      out.push(mismatch(path, expected, actual, `${path}: one side is missing (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`));
    }
    return;
  }

  if (typeof expected === "number" || typeof actual === "number") {
    if (typeof expected !== "number" || typeof actual !== "number" || !floatEquals(expected, actual)) {
      out.push(mismatch(path, expected, actual));
    }
    return;
  }

  if (typeof expected === "boolean" || typeof actual === "boolean") {
    if (expected !== actual) out.push(mismatch(path, expected, actual));
    return;
  }

  if (typeof expected === "string" && typeof actual === "string") {
    const field = lastSegment(path);
    if (urlFields.has(field)) {
      if (!urlsEquivalent(expected, actual)) {
        out.push(mismatch(path, expected, actual, `${path}: URLs not route-equivalent (legacy ${JSON.stringify(expected)} vs new ${JSON.stringify(actual)})`));
      }
      return;
    }
    if (pathnameFields.has(field)) {
      if (pathnameOnly(expected) !== pathnameOnly(actual)) {
        out.push(mismatch(path, expected, actual, `${path}: asset pathnames differ (legacy ${JSON.stringify(expected)} vs new ${JSON.stringify(actual)})`));
      }
      return;
    }
    if (expected !== actual) out.push(mismatch(path, expected, actual));
    return;
  }

  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) {
      out.push(mismatch(path, expected, actual, `${path}: type mismatch (array vs non-array)`));
      return;
    }
    if (expected.length !== actual.length) {
      out.push(mismatch(path, expected.length, actual.length, `${path}: array length mismatch (legacy ${expected.length}, new ${actual.length})`));
    }
    const n = Math.min(expected.length, actual.length);
    for (let i = 0; i < n; i++) {
      deepCompareJson(`${path}[${i}]`, expected[i], actual[i], out, opts);
    }
    return;
  }

  if (isPlainObject(expected) || isPlainObject(actual)) {
    if (!isPlainObject(expected) || !isPlainObject(actual)) {
      out.push(mismatch(path, expected, actual, `${path}: type mismatch (object vs non-object)`));
      return;
    }
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key;
      deepCompareJson(childPath, expected[key], actual[key], out, opts);
    }
    return;
  }

  // Primitives not otherwise handled (shouldn't occur for JSON-derived values).
  if (expected !== actual) out.push(mismatch(path, expected, actual));
}

/** Convenience wrapper: returns the mismatch list instead of writing through an out-param. */
export function diffJson(expected: unknown, actual: unknown, opts?: DeepCompareOptions): FieldMismatch[] {
  const out: FieldMismatch[] = [];
  deepCompareJson("", expected, actual, out, opts);
  return out;
}

/**
 * Counts terminal (leaf) values in a JSON structure - used as an
 * approximate "how many individual field checks did this comparison
 * attempt" count for `checksRun` (doc §1.5's pass/fail/waived accounting
 * convention, reused from `data/report.ts`). An empty object/array/
 * null/undefined counts as one leaf (there's still "something" being
 * compared: presence/absence of that field).
 */
export function countLeaves(value: unknown): number {
  if (value === null || value === undefined) return 1;
  if (Array.isArray(value)) {
    if (value.length === 0) return 1;
    return value.reduce((n: number, v) => n + countLeaves(v), 0);
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as object);
    if (keys.length === 0) return 1;
    return keys.reduce((n, k) => n + countLeaves((value as Record<string, unknown>)[k]), 0);
  }
  return 1;
}
