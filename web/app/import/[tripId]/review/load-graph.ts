// Review-step data loader -- task P3-06 (doc 05 §P3-06). Not a server
// action (no "use server" directive): both page.tsx (GET display) and
// actions.ts (`finishAction`'s pre-Finish full-graph validation) need the
// exact same read of the trip's persisted `import_*` graph, so it lives
// here once rather than duplicated per file the way smaller round-trip
// helpers are elsewhere in this wizard (e.g. lib/import-finish.ts's own
// header note on `tripDraftToStepInput`) -- both callers are inside this
// same task's file-ownership boundary (app/import/[tripId]/review/**), so
// there's no ownership-boundary reason to duplicate here.
//
// Reads only -- reuses db/queries/import-drafts.sql.ts (Trip/Sites step
// reads, P3-03/04) and db/queries/import-trees.sql.ts (Trees step reads,
// P3-05) exactly as they exist; no new query needed.
import {
  getTrip,
  listImportSites,
  listStates,
  type ImportSite,
  type ImportStateOption,
  type TripDraft,
} from "@/db/queries/import-drafts.sql";
import {
  listAllSiteTreesForTrip,
  listTrunksByTree,
  type TreeRecord,
  type TrunkRecord,
} from "@/db/queries/import-trees.sql";
import { siteToStepInput } from "@/lib/import-sites";
import { ImportTreeType } from "@/lib/import-trees";
import {
  treeRecordToStepInput,
  tripDraftToStepInput,
  trunkRecordToStepInput,
  type FinishGraphInput,
} from "@/lib/import-finish";

export interface ReviewTreeData {
  tree: TreeRecord;
  trunks: TrunkRecord[];
}

export interface ReviewSiteData {
  site: ImportSite;
  trees: ReviewTreeData[];
}

export interface ReviewTripGraph {
  trip: TripDraft;
  states: ImportStateOption[];
  sites: ReviewSiteData[];
}

/** Loads the trip + every site + every site's trees (+ every multi-trunk
 * tree's trunks) + the states lookup (for both the site-summary label and
 * `validateSiteOptional`'s bounds check) -- `null` when the trip itself
 * doesn't resolve (the layout's own `assertTripEditable` already gates
 * access; this is just the not-found case for a raced/removed trip). */
export async function loadReviewGraph(tripId: number): Promise<ReviewTripGraph | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const [sites, states, treesBySite] = await Promise.all([
    listImportSites(tripId),
    listStates(),
    listAllSiteTreesForTrip(tripId),
  ]);

  const siteData: ReviewSiteData[] = [];
  for (const site of sites) {
    const trees = treesBySite[site.id] ?? [];
    const treeData: ReviewTreeData[] = [];
    for (const tree of trees) {
      const trunks = tree.type === ImportTreeType.MultiTrunk ? await listTrunksByTree(tree.id) : [];
      treeData.push({ tree, trunks });
    }
    siteData.push({ site, trees: treeData });
  }

  return { trip, states, sites: siteData };
}

function treeLabel(tree: TreeRecord): string {
  return tree.scientificName.trim() !== "" ? tree.scientificName : "(Unidentified)";
}

/** Shapes a loaded `ReviewTripGraph` into `lib/import-finish.ts`'s pure
 * `FinishGraphInput` -- the DB-aware "assemble the graph" half of the
 * finish-time full-graph check, paired with that module's DB-free
 * "validate the graph" half. */
export function toFinishGraphInput(graph: ReviewTripGraph): FinishGraphInput {
  return {
    trip: tripDraftToStepInput(graph.trip),
    sites: graph.sites.map(({ site, trees }) => {
      const state = graph.states.find((s) => s.id === site.stateId) ?? null;
      return {
        id: site.id,
        name: site.name || "(unnamed site)",
        step: siteToStepInput(site),
        stateBounds: state,
        trees: trees.map(({ tree, trunks }) => ({
          id: tree.id,
          label: treeLabel(tree),
          step: treeRecordToStepInput(tree),
          trunks: trunks.map((trunk) => ({ id: trunk.id, step: trunkRecordToStepInput(trunk) })),
        })),
      };
    }),
  };
}
