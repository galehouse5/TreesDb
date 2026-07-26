/**
 * Natural-key matching + generic row diffing for the replay-parity harness
 * (doc 07 §8, doc 05 §P3-02). Reimport is delete-then-reinsert, so every row
 * the merge engine touches gets a brand-new `id` (Postgres identity columns
 * never reuse values) -- comparing "the same" tree/site/measurement/visit
 * pre- vs post-reimport therefore has to match by NATURAL identity, never by
 * `id`, exactly as doc 07 §8 step 3 requires ("Compare by natural keys, not
 * identity ids").
 *
 * Design: rather than hand-enumerate every headline/metric column to
 * compare (error-prone -- easy to silently miss a column), `diffRow` below
 * compares EVERY column `select *` returns except a small, explicit
 * exclude-list (the row's own `id`, and FK columns that point at a *parent*
 * entity we already matched independently one level up -- e.g. a tree's
 * `site_id`, a measurement's `tree_id`). This is stricter than a hand-picked
 * column list, not looser: it fails on any drift in columns nobody thought
 * to list.
 */
import { fround } from "../../lib/units/float32";
import { planarDistanceMinutes } from "../../lib/geo/coordinates";
import { SITE_COORDINATE_PROXIMITY_MINUTES } from "../../lib/merge/predicates";

export type Row = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Value normalization -- doc 07 §6/§1.3 float32 discipline, date-only columns.
// ---------------------------------------------------------------------------

/**
 * `date` columns come back from postgres.js as a JS `Date` at UTC midnight
 * (same hazard documented in lib/merge/engine.ts's `toDateOnlyString` and
 * headline.ts's copy of the same function) -- read the UTC calendar fields,
 * never a local-timezone getter or `toISOString`.
 */
function dateOnlyString(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Normalizes one column value for comparison: dates to their calendar-day
 * string, numbers through `fround` (doc 07 §1.3 -- exact float32 equality,
 * no epsilon; harmless no-op on integer/count columns), everything else
 * as-is. `-0`/`0` are unified since Postgres has no signed-zero concept for
 * `real`/`int` columns read back out.
 */
export function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return dateOnlyString(value);
  if (typeof value === "number") {
    const f = fround(value);
    return Object.is(f, -0) ? 0 : f;
  }
  return value;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  return Object.is(a, b);
}

export interface FieldDiff {
  field: string;
  expected: unknown;
  actual: unknown;
}

/** Compares every column of `pre`/`post` except `exclude`, returning one entry per differing field. */
export function diffRow(pre: Row, post: Row, exclude: ReadonlySet<string>): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const keys = new Set([...Object.keys(pre), ...Object.keys(post)]);
  for (const key of keys) {
    if (exclude.has(key)) continue;
    const a = normalizeValue(pre[key]);
    const b = normalizeValue(post[key]);
    if (!valuesEqual(a, b)) diffs.push({ field: key, expected: a, actual: b });
  }
  return diffs;
}

// ---------------------------------------------------------------------------
// Natural-key builders (doc 05 §P3-01/§P3-02: site = name+state+county+
// calculated coords; tree = site identity + names + coords).
// ---------------------------------------------------------------------------

/**
 * Case-insensitive per doc 01 §10's OrdinalIgnoreCase site-name/county match
 * (predicates.ts's `shouldMergeSite`), PLUS calculated coordinates rounded
 * to 3 decimal places (~0.06 arc-minutes -- far finer than the merge
 * engine's own 25 arc-minute proximity threshold, so it can never conflate
 * two sites that `shouldMergeSite` would treat as distinct, while still
 * absorbing float32-ULP-level recompute noise between a pre- and
 * post-reimport snapshot of the SAME site).
 *
 * Coordinates are load-bearing here, not cosmetic: production legitimately
 * contains multiple DISTINCT sites sharing one name+state+county (e.g. two
 * unrelated "Pennypack Park" entries in Philadelphia County, PA, 40+ miles
 * apart -- verified in the task investigation) that were correctly NEVER
 * merged because they fail `shouldMergeSite`'s distance check. Without
 * coordinates in the key, `matchMultiset` would bucket both together and
 * report a false "extra site" diff purely from harness ambiguity, not any
 * real replay mismatch.
 */
export function siteIdentityKey(row: Row): string {
  return JSON.stringify([
    String(row.name).toLowerCase(),
    Number(row.state_id),
    String(row.county).toLowerCase(),
    Math.round(fround(Number(row.calculated_latitude)) * 1000) / 1000,
    Math.round(fround(Number(row.calculated_longitude)) * 1000) / 1000,
  ]);
}

/**
 * Filters `candidates` (already scoped by a SQL bounding-box pre-filter --
 * `candidateBoundingBox`, predicates.ts) down to those within the exact
 * circular `SITE_COORDINATE_PROXIMITY_MINUTES` (25') of `(latitude,
 * longitude)` -- the SECOND stage of the SAME two-stage filter
 * `shouldMergeSite` itself applies. A bounding box alone is not enough: it
 * is axis-aligned (a per-axis +/- offset, not a true circle -- see
 * `candidateBoundingBox`'s own header note), so two sites can sit near its
 * diagonal corner and both fall inside each other's box while the true
 * circular distance between them exceeds 25' (confirmed against production:
 * two distinct "Brecksville Reservation" sites in Cuyahoga County, OH, with
 * axis deltas of ~0.4158/~0.2055 degrees -- each individually passes a
 * ~0.4167-degree-per-axis box -- but an actual `planarDistanceMinutes` of
 * ~29.9', over the threshold). Used by capture.ts's `findSiteByIdentity` to
 * avoid pulling a genuinely untouched, unrelated sibling site into a trip's
 * post-capture scope, where it would misreport as a false "extra site".
 */
export function filterByExactSiteProximity<T extends Row>(candidates: readonly T[], latitude: number, longitude: number): T[] {
  const lat = fround(latitude);
  const lng = fround(longitude);
  return candidates.filter(
    (c) => planarDistanceMinutes(lat, lng, fround(Number(c.calculated_latitude)), fround(Number(c.calculated_longitude))) <= SITE_COORDINATE_PROXIMITY_MINUTES,
  );
}

/** Tree identity within a site: OrdinalIgnoreCase names + exact float32 coordinates (`shouldMergeTree`'s own equality rule). Unique within a site by construction -- the merge engine throws (`findMergeCandidateTreeId`) if two existing trees at one site would ever collide on this. */
export function treeIdentityKey(row: Row): string {
  return JSON.stringify([
    String(row.common_name).toLowerCase(),
    String(row.scientific_name).toLowerCase(),
    fround(Number(row.latitude)),
    fround(Number(row.longitude)),
  ]);
}

// ---------------------------------------------------------------------------
// Generic multiset matching -- used for measurements/visits/measurers/
// visitors/photo_references (leaf child rows with no further nested
// identity). Groups by a coarse key, then greedily pairs items with an
// IDENTICAL signature (a stronger, content-based key covering every
// comparable column) -- this correctly handles the common case (unique key)
// AND the rare case of multiple rows sharing a coarse key (e.g. several
// trees at a site with unspecified/identical coordinates, which never merge
// with each other per `shouldMergeTree`'s "both specified" gate) without
// needing two different code paths: identical-signature items produce zero
// diffs when paired; any genuinely-different leftover rows are paired
// positionally and diffed normally, surfacing a real mismatch exactly where
// one exists.
// ---------------------------------------------------------------------------

export interface MultisetMatch<T> {
  pairs: Array<{ pre: T; post: T }>;
  missing: T[]; // present pre, no post counterpart
  extra: T[]; // present post, no pre counterpart
}

function groupBy<T>(items: readonly T[], keyFn: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = keyFn(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

export function matchMultiset<T>(
  pre: readonly T[],
  post: readonly T[],
  keyFn: (t: T) => string,
  signatureFn: (t: T) => string,
): MultisetMatch<T> {
  const preByKey = groupBy(pre, keyFn);
  const postByKey = groupBy(post, keyFn);
  const pairs: Array<{ pre: T; post: T }> = [];
  const missing: T[] = [];
  const extra: T[] = [];

  const allKeys = new Set([...preByKey.keys(), ...postByKey.keys()]);
  for (const key of allKeys) {
    const preItems = [...(preByKey.get(key) ?? [])];
    const postItems = [...(postByKey.get(key) ?? [])];

    for (let i = preItems.length - 1; i >= 0; i--) {
      const sig = signatureFn(preItems[i]!);
      const j = postItems.findIndex((p) => signatureFn(p) === sig);
      if (j !== -1) {
        pairs.push({ pre: preItems[i]!, post: postItems[j]! });
        preItems.splice(i, 1);
        postItems.splice(j, 1);
      }
    }

    const n = Math.min(preItems.length, postItems.length);
    for (let i = 0; i < n; i++) pairs.push({ pre: preItems[i]!, post: postItems[i]! });
    missing.push(...preItems.slice(n));
    extra.push(...postItems.slice(n));
  }

  return { pairs, missing, extra };
}

/** Content signature for a row (used as `signatureFn` above) -- excludes `id` and any owner FK columns, so two rows with identical business content always signature-match regardless of id churn. */
export function rowSignature(row: Row, exclude: ReadonlySet<string>): string {
  const keys = Object.keys(row)
    .filter((k) => !exclude.has(k))
    .sort();
  return JSON.stringify(keys.map((k) => normalizeValue(row[k])));
}
