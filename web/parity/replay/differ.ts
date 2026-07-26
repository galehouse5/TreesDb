/**
 * Structured pre/post diff for one trip's replay (doc 07 §8, doc 05
 * §P3-02). Applies `matchMultiset` (natural-keys.ts) uniformly at every
 * nesting level -- sites within the trip's scope, trees within a site,
 * measurements within a tree, visits within a site, and the leaf
 * measurer/visitor/photo-reference bags -- so the same "bucket by a coarse
 * key, prefer an exact-content match, positionally pair any leftovers"
 * algorithm handles both the ordinary 1:1 case and the rare
 * multiple-candidates-share-a-key case without a separate code path.
 */
import type { GlobalCounts, MeasurementSnapshot, SiteSnapshot, TreeSnapshot, TripCaptureScope, VisitSnapshot } from "./capture";
import { diffRow, matchMultiset, normalizeValue, type FieldDiff, type Row, rowSignature, siteIdentityKey, treeIdentityKey } from "./natural-keys";

export type DiffKind = "value-mismatch" | "missing-row" | "extra-row";

/**
 * Structured entity ids for downstream evidence-checked tooling
 * (analyze.ts's DB-verified bucket classification) -- avoids re-parsing the
 * human-readable `identity` string. Always sourced from the PRE-capture row
 * when available (the live, un-rolled-back `treesdb` still has that row
 * under that id at analysis time -- the POST-capture row's id only ever
 * existed inside the rolled-back transaction and is never queryable
 * afterward, so it is intentionally omitted here).
 */
export interface DiffContext {
  siteId?: number;
  treeId?: number;
  measurementId?: number;
  visitId?: number;
}

export interface StructuredDiff {
  entity:
    | "site"
    | "state"
    | "tree"
    | "measurement"
    | "visit"
    | "tree-measurer"
    | "site-visitor"
    | "photo-reference";
  /** Human-readable natural-key description, for the report. */
  identity: string;
  kind: DiffKind;
  field?: string;
  expected?: unknown;
  actual?: unknown;
  context?: DiffContext;
}

// ---------------------------------------------------------------------------
// Exclude-lists -- doc 05 §P3-02: compare every headline/metric column
// exactly, but never `id` (churns on delete+reinsert) or a child row's
// owning FK (its identity is established by the nesting context, not the FK
// value itself -- the FK necessarily changes when a parent is recreated
// under a new id) or a wall-clock recompute timestamp.
// ---------------------------------------------------------------------------

const SITE_EXCLUDE = new Set(["id", "last_metrics_update_timestamp"]);
const STATE_EXCLUDE = new Set(["id", "last_metrics_update_timestamp"]);
const TREE_EXCLUDE = new Set(["id", "site_id"]);
const MEASUREMENT_EXCLUDE = new Set(["id", "tree_id"]);
const VISIT_EXCLUDE = new Set(["id", "site_id"]);
const NAME_BAG_EXCLUDE = new Set(["id", "tree_id", "measurement_id", "site_id", "site_visit_id"]);
const PHOTO_EXCLUDE = new Set([
  "id",
  "import_site_id",
  "import_tree_id",
  "site_id",
  "site_visit_id",
  "tree_id",
  "tree_measurement_id",
]);

function siteLabel(site: Row): string {
  return `site "${String(site.name)}" (state ${String(site.state_id)}, county "${String(site.county)}", id ${String(site.id)})`;
}

function treeLabel(siteLbl: string, tree: Row): string {
  return `${siteLbl} / tree "${String(tree.common_name)}" / "${String(tree.scientific_name)}" @ (${String(tree.latitude)},${String(tree.longitude)}) (id ${String(tree.id)})`;
}

/** `{firstName, lastName}` bag rows (tree_measurers / site_visitors): identity IS the name pair, per Name.cs's exact-match dedup (headline.ts's `dedupMeasurers`/`dedupVisitors`). */
function nameBagKey(row: Row): string {
  return JSON.stringify([row.first_name, row.last_name]);
}

function photoKey(row: Row): string {
  return JSON.stringify([row.photo_id]);
}

function diffNameBag(
  entity: "tree-measurer" | "site-visitor",
  ownerLabel: string,
  ctx: DiffContext,
  pre: readonly Row[],
  post: readonly Row[],
): StructuredDiff[] {
  const diffs: StructuredDiff[] = [];
  const m = matchMultiset(pre, post, nameBagKey, nameBagKey);
  for (const { pre: p, post: q } of m.pairs) {
    for (const fd of diffRow(p, q, NAME_BAG_EXCLUDE)) {
      diffs.push({ entity, identity: `${ownerLabel} / ${p.first_name} ${p.last_name}`, kind: "value-mismatch", context: ctx, ...fd });
    }
  }
  for (const p of m.missing) {
    diffs.push({ entity, identity: `${ownerLabel} / ${p.first_name} ${p.last_name}`, kind: "missing-row", context: ctx, expected: p });
  }
  for (const q of m.extra) {
    diffs.push({ entity, identity: `${ownerLabel} / ${q.first_name} ${q.last_name}`, kind: "extra-row", context: ctx, actual: q });
  }
  return diffs;
}

function diffPhotoBag(ownerLabel: string, ctx: DiffContext, pre: readonly Row[], post: readonly Row[]): StructuredDiff[] {
  const diffs: StructuredDiff[] = [];
  const m = matchMultiset(pre, post, photoKey, (r) => rowSignature(r, PHOTO_EXCLUDE));
  for (const { pre: p, post: q } of m.pairs) {
    for (const fd of diffRow(p, q, PHOTO_EXCLUDE)) {
      diffs.push({ entity: "photo-reference", identity: `${ownerLabel} / photo ${p.photo_id}`, kind: "value-mismatch", context: ctx, ...fd });
    }
  }
  for (const p of m.missing) {
    diffs.push({ entity: "photo-reference", identity: `${ownerLabel} / photo ${p.photo_id}`, kind: "missing-row", context: ctx, expected: p });
  }
  for (const q of m.extra) {
    diffs.push({ entity: "photo-reference", identity: `${ownerLabel} / photo ${q.photo_id}`, kind: "extra-row", context: ctx, actual: q });
  }
  return diffs;
}

function diffMeasurements(treeLbl: string, ctx: DiffContext, pre: readonly MeasurementSnapshot[], post: readonly MeasurementSnapshot[]): StructuredDiff[] {
  const diffs: StructuredDiff[] = [];
  const m = matchMultiset(
    pre,
    post,
    (x) => JSON.stringify([normalizeValue(x.measurement.measured)]),
    (x) => rowSignature(x.measurement, MEASUREMENT_EXCLUDE),
  );
  for (const { pre: p, post: q } of m.pairs) {
    const label = `${treeLbl} / measurement measured ${String(normalizeValue(p.measurement.measured))}`;
    const measCtx: DiffContext = { ...ctx, measurementId: Number(p.measurement.id) };
    for (const fd of diffRow(p.measurement, q.measurement, MEASUREMENT_EXCLUDE)) {
      diffs.push({ entity: "measurement", identity: label, kind: "value-mismatch", context: measCtx, ...fd });
    }
    diffs.push(...diffNameBag("tree-measurer", label, measCtx, p.measurers, q.measurers));
    diffs.push(...diffPhotoBag(label, measCtx, p.photos, q.photos));
  }
  for (const p of m.missing) {
    diffs.push({
      entity: "measurement",
      identity: `${treeLbl} / measurement measured ${String(normalizeValue(p.measurement.measured))}`,
      kind: "missing-row",
      expected: p.measurement,
      context: { ...ctx, measurementId: Number(p.measurement.id) },
    });
  }
  for (const q of m.extra) {
    diffs.push({
      entity: "measurement",
      identity: `${treeLbl} / measurement measured ${String(normalizeValue(q.measurement.measured))}`,
      kind: "extra-row",
      actual: q.measurement,
      context: ctx,
    });
  }
  return diffs;
}

function diffTrees(siteLbl: string, ctx: DiffContext, pre: readonly TreeSnapshot[], post: readonly TreeSnapshot[]): StructuredDiff[] {
  const diffs: StructuredDiff[] = [];
  const m = matchMultiset(
    pre,
    post,
    (x) => treeIdentityKey(x.tree),
    (x) => rowSignature(x.tree, TREE_EXCLUDE),
  );
  for (const { pre: p, post: q } of m.pairs) {
    const label = treeLabel(siteLbl, p.tree);
    const treeCtx: DiffContext = { ...ctx, treeId: Number(p.tree.id) };
    for (const fd of diffRow(p.tree, q.tree, TREE_EXCLUDE)) {
      diffs.push({ entity: "tree", identity: label, kind: "value-mismatch", context: treeCtx, ...fd });
    }
    diffs.push(...diffNameBag("tree-measurer", label, treeCtx, p.measurers, q.measurers));
    diffs.push(...diffPhotoBag(label, treeCtx, p.photos, q.photos));
    diffs.push(...diffMeasurements(label, treeCtx, p.measurements, q.measurements));
  }
  for (const p of m.missing) {
    diffs.push({ entity: "tree", identity: treeLabel(siteLbl, p.tree), kind: "missing-row", expected: p.tree, context: { ...ctx, treeId: Number(p.tree.id) } });
  }
  for (const q of m.extra) {
    diffs.push({ entity: "tree", identity: treeLabel(siteLbl, q.tree), kind: "extra-row", actual: q.tree, context: ctx });
  }
  return diffs;
}

function diffVisits(siteLbl: string, ctx: DiffContext, pre: readonly VisitSnapshot[], post: readonly VisitSnapshot[]): StructuredDiff[] {
  const diffs: StructuredDiff[] = [];
  const m = matchMultiset(
    pre,
    post,
    (x) => JSON.stringify([normalizeValue(x.visit.visited)]),
    (x) => rowSignature(x.visit, VISIT_EXCLUDE),
  );
  for (const { pre: p, post: q } of m.pairs) {
    const label = `${siteLbl} / visit visited ${String(normalizeValue(p.visit.visited))}`;
    const visitCtx: DiffContext = { ...ctx, visitId: Number(p.visit.id) };
    for (const fd of diffRow(p.visit, q.visit, VISIT_EXCLUDE)) {
      diffs.push({ entity: "visit", identity: label, kind: "value-mismatch", context: visitCtx, ...fd });
    }
    diffs.push(...diffNameBag("site-visitor", label, visitCtx, p.visitors, q.visitors));
    diffs.push(...diffPhotoBag(label, visitCtx, p.photos, q.photos));
  }
  for (const p of m.missing) {
    diffs.push({
      entity: "visit",
      identity: `${siteLbl} / visit visited ${String(normalizeValue(p.visit.visited))}`,
      kind: "missing-row",
      expected: p.visit,
      context: { ...ctx, visitId: Number(p.visit.id) },
    });
  }
  for (const q of m.extra) {
    diffs.push({
      entity: "visit",
      identity: `${siteLbl} / visit visited ${String(normalizeValue(q.visit.visited))}`,
      kind: "extra-row",
      actual: q.visit,
      context: ctx,
    });
  }
  return diffs;
}

function diffSite(pre: SiteSnapshot, post: SiteSnapshot): StructuredDiff[] {
  const label = siteLabel(pre.site);
  const ctx: DiffContext = { siteId: Number(pre.site.id) };
  const diffs: StructuredDiff[] = [];
  for (const fd of diffRow(pre.site, post.site, SITE_EXCLUDE)) {
    diffs.push({ entity: "site", identity: label, kind: "value-mismatch", context: ctx, ...fd });
  }
  diffs.push(...diffNameBag("site-visitor", label, ctx, pre.visitors, post.visitors));
  diffs.push(...diffPhotoBag(label, ctx, pre.photos, post.photos));
  diffs.push(...diffVisits(label, ctx, pre.visits, post.visits));
  diffs.push(...diffTrees(label, ctx, pre.trees, post.trees));
  return diffs;
}

export interface TripDiffResult {
  diffs: StructuredDiff[];
  globalCountDiffs: FieldDiff[];
}

export function diffTripScope(pre: TripCaptureScope, post: TripCaptureScope): TripDiffResult {
  const diffs: StructuredDiff[] = [];

  const preSites = [...pre.sites.values()];
  const postSites = [...post.sites.values()];
  const siteMatch = matchMultiset(
    preSites,
    postSites,
    (s) => siteIdentityKey(s.site),
    (s) => rowSignature(s.site, SITE_EXCLUDE),
  );
  for (const { pre: p, post: q } of siteMatch.pairs) diffs.push(...diffSite(p, q));
  for (const p of siteMatch.missing) {
    diffs.push({ entity: "site", identity: siteLabel(p.site), kind: "missing-row", expected: p.site, context: { siteId: Number(p.site.id) } });
  }
  for (const q of siteMatch.extra) diffs.push({ entity: "site", identity: siteLabel(q.site), kind: "extra-row", actual: q.site });

  const stateIds = new Set([...pre.states.keys(), ...post.states.keys()]);
  for (const id of stateIds) {
    const a = pre.states.get(id);
    const b = post.states.get(id);
    if (a && b) {
      for (const fd of diffRow(a, b, STATE_EXCLUDE)) diffs.push({ entity: "state", identity: `state ${id}`, kind: "value-mismatch", ...fd });
    } else if (a && !b) {
      diffs.push({ entity: "state", identity: `state ${id}`, kind: "missing-row" });
    } else if (!a && b) {
      diffs.push({ entity: "state", identity: `state ${id}`, kind: "extra-row" });
    }
  }

  const globalCountDiffs: FieldDiff[] = [];
  for (const key of Object.keys(pre.globalCounts) as (keyof GlobalCounts)[]) {
    if (pre.globalCounts[key] !== post.globalCounts[key]) {
      globalCountDiffs.push({ field: key, expected: pre.globalCounts[key], actual: post.globalCounts[key] });
    }
  }

  return { diffs, globalCountDiffs };
}
