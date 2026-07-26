// Own-trip-scoped capture + diff for the walkthrough's final assertion (doc
// 05 §P3-10, doc 07 §8 last paragraph). REUSES parity/replay/capture.ts and
// parity/replay/differ.ts rather than reimplementing natural-key matching --
// per the task brief -- but neither module can be called completely as-is
// here, for a reason specific to this walkthrough's shape (not a bug in
// either module, which are correct for the replay harness's own scenario):
//
// `captureTripScope(sql, tripId)` resolves the SITES a trip is attributed to
// via `importing_trip_id`, then loads each resolved site in FULL (every
// visit/tree/measurement it currently has, from ANY trip) -- exactly right
// for replay's "delete this trip's rows, reimport, compare the same site
// before/after" scenario, where nothing else at the site changes between the
// two captures. This walkthrough instead ADDS a brand-new trip whose data
// duplicates an EXISTING, untouched historical trip's data -- the new trip's
// rows merge into the SAME site/trees the original trip already populated
// (that's the point: it proves the merge engine re-identifies the same
// entities). So `captureTripScope(sql, ORIGINAL_TRIP)` and
// `captureTripScope(sql, NEW_TRIP)`, called after Finish, both resolve to
// the SAME site and both load its FULL current content -- including BOTH
// trips' measurements on both sides. Diffing those two full loads directly
// would either (a) trivially pass by comparing identical data to itself
// (tree-level fields, same physical row read twice) or (b) always show a
// spurious "extra measurement" diff (the site now legitimately has one more
// measurement per tree than it did originally) -- neither is the assertion
// this walkthrough wants.
//
// `filterScopeToOwnTrip` below closes that gap: it keeps `captureTripScope`'s
// site-resolution and full nested-structure loading UNCHANGED (so site/tree
// NATURAL-KEY MATCHING -- did the merge engine identify the right entities --
// still runs for real), but then prunes each snapshot's `visits`/
// `measurements` arrays down to rows whose OWN `importing_trip_id` equals
// the trip that scope was captured for. Comparing the resulting pre
// (original trip's own rows) vs post (new trip's own rows) via the
// unmodified `diffTripScope` then answers the real question: did the new
// trip's rows end up with the same natural-keyed content as the original
// trip's rows. The one remaining expected difference -- `importing_trip_id`
// itself, which by construction always differs between the two sides -- is
// filtered out of the result afterward (not by editing differ.ts's
// exclude-lists, which are shared Phase-3 code outside this task's file
// ownership and correctly have no reason to know about this walkthrough's
// specific two-different-trips comparison).
import type { SqlTag } from "../../db/queries/sql-tag";
import {
  captureTripScope,
  type SiteSnapshot,
  type TripCaptureScope,
} from "../../parity/replay/capture";
import { diffTripScope, type StructuredDiff } from "../../parity/replay/differ";

function filterSiteToOwnTrip(site: SiteSnapshot, tripId: number): SiteSnapshot | null {
  const visits = site.visits.filter((v) => Number(v.visit.importing_trip_id) === tripId);
  const trees = site.trees
    .map((t) => ({
      ...t,
      measurements: t.measurements.filter((m) => Number(m.measurement.importing_trip_id) === tripId),
    }))
    .filter((t) => t.measurements.length > 0);

  if (visits.length === 0 && trees.length === 0) return null;
  return { ...site, visits, trees };
}

/** `captureTripScope(sql, tripId)`, then prunes every nested
 * visit/measurement down to rows this SPECIFIC trip contributed -- see file
 * header. Sites/trees that end up with nothing of this trip's own after
 * pruning are dropped entirely (defensive; doesn't happen for a trip that
 * legitimately has rows, but keeps the result meaningful if it ever did). */
export async function captureOwnTripScope(sql: SqlTag, tripId: number): Promise<TripCaptureScope> {
  const full = await captureTripScope(sql, tripId);
  const sites = new Map<number, SiteSnapshot>();
  for (const [id, site] of full.sites) {
    const filtered = filterSiteToOwnTrip(site, tripId);
    if (filtered) sites.set(id, filtered);
  }
  return { ...full, sites };
}

const EXPECTED_TRIP_ATTRIBUTION_FIELD = "importing_trip_id";

/** Diffs two own-trip-scoped captures (see `captureOwnTripScope`) via the
 * unmodified replay differ, then drops the one class of diff that is
 * EXPECTED by construction here (never in the ordinary same-trip replay
 * scenario `differ.ts`'s own exclude-lists are tuned for): a measurement/
 * visit row's `importing_trip_id` naturally differs between "the original
 * trip's own row" and "the new trip's own row" -- that's the whole
 * pre/post split, not a content mismatch. Every OTHER field stays fully
 * compared (ids and structural placement still excluded by differ.ts's own
 * exclude-lists, per doc 07 §8 step 3 "compare by natural keys, not
 * identity ids").
 */
export function diffOwnTripScopes(pre: TripCaptureScope, post: TripCaptureScope): StructuredDiff[] {
  const { diffs, globalCountDiffs } = diffTripScope(pre, post);
  if (globalCountDiffs.length > 0) {
    throw new Error(
      `diffOwnTripScopes: unexpected global row-count drift between captures: ${JSON.stringify(globalCountDiffs)}`,
    );
  }
  return diffs.filter((d) => !(d.kind === "value-mismatch" && d.field === EXPECTED_TRIP_ATTRIBUTION_FIELD));
}
