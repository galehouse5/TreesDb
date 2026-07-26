// Trees step -- task P3-05 (doc 05 §P3-05). Port of `ImportController.Trees`
// GET (`ImportController.cs:222-234`) and its view (`TMD/Views/Import/Trees.cshtml`
// + `EditorTemplates/ImportSiteTreesModel.cshtml` + `DisplayTemplates/ImportTreeModel.cshtml`):
// ALL of the trip's sites render on this one page (no separate site-nav --
// `Trees.cshtml:31-34`'s `for (site in Model.Sites)` loop), each showing its
// own nested list of trees with per-site "Add tree".
//
// See lib/import-trees.ts's header for the field-set/single-vs-multi-trunk
// finding this page's design follows (it exposes the fuller domain-model
// field set -- Status/AgeClass/AgeType/TerrainType/FormType/trunks -- per
// this task's explicit brief, not the trimmed legacy HTML).
import type { Metadata } from "next";
import Link from "next/link";
import { TreePineIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/import/confirm-submit-button";
import { SECTION_HEADER_CLASS, SECTION_TITLE_CLASS } from "@/components/import/wizard-ui";
import { cn } from "@/lib/utils";
import { listImportSites } from "@/db/queries/import-drafts.sql";
import {
  initializeTreesForTrip,
  listAllSiteTreesForTrip,
  listTrunksByTree,
  type TreeRecord,
  type TrunkRecord,
} from "@/db/queries/import-trees.sql";
import { ImportTreeType, distanceToEditableText } from "@/lib/import-trees";
import type { TreeRedisplayState } from "./actions";
import { TreeForm } from "./tree-form";
import { addTreeAction, continueAction, removeTreeAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - Trees - TreesDb",
  description: "Add the trees measured at each site on this trip.",
};

interface TreesStepPageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function treeSummaryLabel(tree: TreeRecord): string {
  return tree.scientificName.trim() !== "" ? tree.scientificName : "(Unidentified)";
}

export default async function TreesStepPage({ params, searchParams }: TreesStepPageProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  const sp = await searchParams;

  // Auth/ownership is layout.tsx's job (it runs assertTripEditable and
  // renders the unauthorized notice) -- the duplicate page-level re-check
  // that used to live here mapped the same condition to notFound(),
  // diverging from every sibling step page (code-audit finding).

  // `Trip.InitializeTrees` + `Uow.Persist()` -- unconditional on every GET
  // (ImportController.cs:229-230).
  await initializeTreesForTrip(tripId, new Date());

  const sites = await listImportSites(tripId);
  const treesBySite = await listAllSiteTreesForTrip(tripId);

  const editIdRaw = firstParam(sp.edit);
  const editId = editIdRaw ? Number(editIdRaw) : null;
  const errorBanner = firstParam(sp.error);

  let redisplay: TreeRedisplayState | null = null;
  const stateRaw = firstParam(sp.state);
  if (stateRaw) {
    try {
      redisplay = JSON.parse(stateRaw) as TreeRedisplayState;
    } catch {
      redisplay = null;
    }
  }

  let editingTrunks: TrunkRecord[] = [];
  if (editId) {
    for (const trees of Object.values(treesBySite)) {
      if (trees.some((t) => t.id === editId)) {
        editingTrunks = await listTrunksByTree(editId);
        break;
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className={cn("bg-primary/5 py-4", errorBanner && "border-b")}>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TreePineIcon className="size-4 text-primary/70" aria-hidden />
            Enter trees
          </CardTitle>
          <CardDescription>Add every tree measured at each site, single- or multi-trunk.</CardDescription>
        </CardHeader>
        {errorBanner ? (
          <CardContent className="pt-4">
            <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
              {errorBanner}
            </p>
          </CardContent>
        ) : null}
      </Card>

      {sites.map((site) => {
        const trees = treesBySite[site.id] ?? [];
        return (
          <Card key={site.id}>
            <CardHeader className={SECTION_HEADER_CLASS}>
              <CardTitle className={SECTION_TITLE_CLASS}>{site.name || "(unnamed site)"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {trees.map((tree) =>
                tree.id === editId ? (
                  <TreeForm
                    key={tree.id}
                    tripId={tripId}
                    tree={tree}
                    trunks={editingTrunks}
                    redisplay={redisplay}
                  />
                ) : (
                  <div key={tree.id} className="rounded-lg border bg-card p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">{treeSummaryLabel(tree)}</h4>
                      <Link
                        href={`/import/${tripId}/trees?edit=${tree.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <li>{tree.commonName || "(no common name)"}</li>
                      {tree.heightInputFormat !== 1 ? <li>Height: {distanceToEditableText(tree.height, tree.heightInputFormat)}</li> : null}
                      {tree.girthInputFormat !== 1 ? (
                        <li>{tree.type === ImportTreeType.MultiTrunk ? "Combined girth" : "Girth"}: {distanceToEditableText(tree.girth, tree.girthInputFormat)}</li>
                      ) : null}
                      {tree.crownSpreadInputFormat !== 1 ? (
                        <li>Crown spread: {distanceToEditableText(tree.crownSpread, tree.crownSpreadInputFormat)}</li>
                      ) : null}
                    </ul>
                    {trees.length > 1 ? (
                      <form action={removeTreeAction} className="mt-2">
                        <input type="hidden" name="tripId" value={tripId} />
                        <input type="hidden" name="treeId" value={tree.id} />
                        <ConfirmSubmitButton variant="destructive" size="sm" message="Remove this tree?">
                          Remove
                        </ConfirmSubmitButton>
                      </form>
                    ) : null}
                  </div>
                ),
              )}

              {/* Full-width dashed "add" affordance -- same design-review
                  treatment `sites/page.tsx`'s "Add site" already uses, so
                  the two per-list "add" controls (site list here, but the
                  card also NESTS a per-site tree list) read consistently
                  instead of one being a small plain button (code-audit
                  finding). */}
              <form action={addTreeAction}>
                <input type="hidden" name="tripId" value={tripId} />
                <input type="hidden" name="siteId" value={site.id} />
                <Button type="submit" variant="outline" className="w-full border-dashed">
                  Add tree
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <Link href={`/import/${tripId}/sites`} className={cn(buttonVariants({ variant: "outline" }))}>
            Back
          </Link>
          <form action={continueAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <Button type="submit" size="lg">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
