// View page -- task P3-07 (doc 05 §P3-03..07). Port of `ImportController.
// ViewImport(int id)` (`[ActionName("View")]`,
// `TMD/Controllers/ImportController.cs:390-396`) + its view
// (`TMD/Views/Import/View.cshtml`) + the shared `ImportFinishedTripModel`/
// `ImportFinishedSiteModel`/`ImportFinishedTreeModel` DisplayTemplates
// (`TMD/Views/Import/DisplayTemplates/ImportFinished{Trip,Site,Tree}Model.
// cshtml`) -- the SAME templates `ImportController.Review` renders
// (`ImportController.cs:365-371`), since both actions map the identical
// `Trip -> ImportFinishedTripModel` (`ImportMapping.cs:105-116`) straight
// from the import DRAFT's own `Trip`/`Site`/`TreeBase` domain objects, NOT
// from any canonical `sites`/`trees` row -- i.e. this reads the SAME
// `import_sites`/`import_trees` draft rows Review shows, which is why a
// legacy trip can still be "Revise"d and re-Finished after import (History's
// EditorTemplate offers this) and why the doc 05 P3-02 note that "the
// staging log is NOT immutable" holds: View always reflects the CURRENT
// draft, not a frozen snapshot taken at Finish time.
//
// `ViewImport` has NO `trip.IsImported` gate (same as `Review`) -- reachable
// for a still-draft trip too, rendering whatever partial data exists so far
// under the same "Viewing trip" heading. Not gated here either.
//
// Auth: this route lives under app/import/[tripId]/layout.tsx, which already
// runs the same `assertTripEditable` check every wizard step gets for free
// (see that layout's header) -- no second check needed here, same
// convention as app/import/[tripId]/trip/page.tsx.
//
// Content, transcribed field-for-field from the DisplayTemplates above:
//   Trip:  Name (heading), Date, MeasurerContactInfo, FirstMeasurer (always),
//          Second/ThirdMeasurer (only if specified -- `IfSpecifiedSummaryDisplayFor`).
//   Site:  Name (heading), State ("{Name} ({Country.Code})"), County,
//          OwnershipType, then its Trees. Photos (`PhotoGalleryModel`) are
//          skipped -- P3-08 (photo upload) is not built yet, so every
//          import site/tree currently has zero photo_references rows
//          regardless (same `Photos.Count > 0` gate legacy applies would
//          never pass yet either).
//   Tree:  ScientificName (heading, "(Unidentified)" fallback -- NOTE this
//          fallback is Tree.cshtml's own display-time default, NOT the same
//          "(Unidentified)" the merge engine writes into a MEASUREMENT's
//          scientific_name at Finish time (graph.ts's buildTreeGraph) --
//          this page reads the raw `import_trees.scientific_name` draft
//          column, which is independently blank-or-not), CommonName
//          (always), Height/Girth/CrownSpread (only if specified).
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTrip, listImportSites, listStates, type ImportSite } from "@/db/queries/import-drafts.sql";
import { listAllSiteTreesForTrip, type TreeRecord } from "@/db/queries/import-trees.sql";
import { toFormalName } from "@/lib/import-wizard";
import { formatDateMMDDYYYY, formatDistanceField, isSpecifiedFormat } from "@/components/details/legacy-format";
import { Portlet, ReportRow, ReportTable } from "@/components/details/report-table";
import { readUnitsPreference } from "@/lib/units/cookie";
import type { Units } from "@/lib/units/format";

export const metadata: Metadata = {
  title: "Import - View - TreesDb",
  description: "Read-only view of an imported trip.",
};

interface ViewPageProps {
  params: Promise<{ tripId: string }>;
}

function TreeCard({ tree, units }: { tree: TreeRecord; units: Units }) {
  const heightSpecified = isSpecifiedFormat(tree.heightInputFormat);
  const girthSpecified = isSpecifiedFormat(tree.girthInputFormat);
  const crownSpreadSpecified = isSpecifiedFormat(tree.crownSpreadInputFormat);

  return (
    <Portlet heading={tree.scientificName || "(Unidentified)"}>
      <ReportTable>
        <ReportRow label="Common name">{tree.commonName}</ReportRow>
        {heightSpecified ? (
          <ReportRow label="Height">{formatDistanceField(tree.height, tree.heightInputFormat, units)}</ReportRow>
        ) : null}
        {girthSpecified ? (
          <ReportRow label="Girth">{formatDistanceField(tree.girth, tree.girthInputFormat, units, "subprefix")}</ReportRow>
        ) : null}
        {crownSpreadSpecified ? (
          <ReportRow label="Crown spread">{formatDistanceField(tree.crownSpread, tree.crownSpreadInputFormat, units)}</ReportRow>
        ) : null}
      </ReportTable>
    </Portlet>
  );
}

function SiteCard({
  site,
  trees,
  stateLabel,
  units,
}: {
  site: ImportSite;
  trees: TreeRecord[];
  stateLabel: string;
  units: Units;
}) {
  return (
    <Portlet heading={site.name || "(unnamed site)"}>
      <div className="space-y-4">
        <ReportTable>
          <ReportRow label="State">{stateLabel}</ReportRow>
          <ReportRow label="County">{site.county}</ReportRow>
          <ReportRow label="Ownership type">{site.ownershipType}</ReportRow>
        </ReportTable>
        <div className="space-y-3">
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} units={units} />
          ))}
        </div>
      </div>
    </Portlet>
  );
}

export default async function ImportViewPage({ params }: ViewPageProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  if (!Number.isInteger(tripId) || tripId <= 0) notFound();

  // The layout (app/import/[tripId]/layout.tsx) already ran
  // assertTripEditable for this request -- these fetches are just the data
  // read, not a second authorization check (same convention as the Trip
  // step's page.tsx).
  const [trip, sites, treesBySite, states] = await Promise.all([
    getTrip(tripId),
    listImportSites(tripId),
    listAllSiteTreesForTrip(tripId),
    listStates(),
  ]);
  if (!trip) notFound();

  const units = readUnitsPreference(await cookies());
  const stateById = new Map(states.map((s) => [s.id, s]));

  const firstMeasurer = trip.measurers[0] ? toFormalName(trip.measurers[0]) : "";
  const secondMeasurer = trip.measurers[1] ? toFormalName(trip.measurers[1]) : "";
  const thirdMeasurer = trip.measurers[2] ? toFormalName(trip.measurers[2]) : "";

  return (
    // The section headers below are `components/details/report-table.tsx`'s
    // shared `Portlet` (used unmodified by browse/detail pages too, out of
    // this restyle's scope) -- rather than forking that shared component,
    // these descendant selectors apply the wizard's green-tinted
    // card-header-strip idiom (docs/design/BRAND.md) ONLY within this page's
    // own subtree, leaving Portlet's other callers untouched.
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-4 [&_.portlet-header]:border-primary/20 [&_.portlet-header]:bg-primary/5 [&_.portlet-header_h4]:text-primary">
      <Portlet heading={trip.name || "(untitled trip)"}>
        <ReportTable>
          <ReportRow label="Date">{trip.date ? formatDateMMDDYYYY(trip.date) : ""}</ReportRow>
          <ReportRow label="Measurer contact">{trip.measurerContactInfo}</ReportRow>
          <ReportRow label="First measurer">{firstMeasurer}</ReportRow>
          {secondMeasurer ? <ReportRow label="Second measurer">{secondMeasurer}</ReportRow> : null}
          {thirdMeasurer ? <ReportRow label="Third measurer">{thirdMeasurer}</ReportRow> : null}
        </ReportTable>
      </Portlet>

      {sites.map((site) => {
        const state = site.stateId != null ? stateById.get(site.stateId) : undefined;
        const stateLabel = state ? `${state.name} (${state.code})` : "";
        return (
          <SiteCard key={site.id} site={site} trees={treesBySite[site.id] ?? []} stateLabel={stateLabel} units={units} />
        );
      })}
    </div>
  );
}
