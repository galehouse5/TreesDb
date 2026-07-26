// GET /trees/[id] -- port of `BrowseController.TreeDetails`
// (`TMD/Controllers/BrowseController.cs:24-47`) + `TMD/Views/Browse/
// TreeDetails.cshtml` + its DisplayTemplates (`BrowseTreeDetailsModel`,
// `BrowseTreeSummaryModel`, `BrowsePhotoSummaryList`/`BrowsePhotoSumaryModel`)
// -- task P1-05, doc 03 "P1-05..08", doc 01 §1
// (`/trees/{id}` <- `/Browse/Trees/{id}/Details`).
//
// Server component; every displayed value goes through `lib/units/format.ts`
// / `lib/geo/coordinates.ts` / `components/details/legacy-format.ts`'s thin
// wrappers around them (never hand-formatted). 404 (`notFound()`) when the
// tree id doesn't resolve, matching legacy's `Repositories.Trees.FindById`
// null check.
//
// Markup mirrors the legacy view's structure (Tree / per-measurement
// Summary+Details / Location / Photos portlets) using the legacy
// class-name/id conventions (`reports_table`, `description`/`value`,
// `portlet`, `LocationSummary`, `support_table`) as PURE structural hooks
// for `parity/extractors/new/tree-details.ts` (no legacy CSS loaded) --
// see `components/details/report-table.tsx`'s file header. The tree id
// itself (legacy scrapes it off the "Export tree data" link's href, which
// this page doesn't render since CSV export, P1-11, is a separate task) is
// exposed via `data-tree-id` on the root element instead.
import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { treeDetails, type TreeMeasurementRow } from "@/db/queries/details.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import type { Units } from "@/lib/units/format";
import { speciesSlug } from "@/lib/slug";
import { ExportDataLink, Portlet, PhotoSummaryTable, ReportRow, ReportTable, ViewOnMapLink } from "@/components/details/report-table";
import { MeasurementView } from "./measurement-view";
import {
  calculateTDI2,
  calculateTDI3,
  concatenateNames,
  formatDateMMDDYYYY,
  formatDistanceField,
  formatHeightMeasurementMethod,
  formatPlainFixed2,
  formatPlainFixed2OrNotEnough,
  formatStateWithCountry,
  formatVolumeField,
  selectCoordinatesRow,
} from "@/components/details/legacy-format";

interface TreeDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Perf audit 2026-07: generateMetadata and the page body both need the tree
// row -- React `cache()` dedupes them to one fetch per request.
const treeDetailsCached = cache(treeDetails);

export async function generateMetadata({ params }: TreeDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const treeId = Number(id);
  if (!Number.isInteger(treeId)) return { title: "Tree - TreesDb" };
  const data = await treeDetailsCached(treeId);
  if (!data) return { title: "Tree - TreesDb" };
  return { title: `${data.scientificName} (${data.commonName}) - TreesDb` };
}

function championPointsRow(championPoints: number | null, abbreviated: number | null) {
  if (championPoints !== null) return { label: "Champion points", value: formatPlainFixed2(championPoints) };
  if (abbreviated !== null) return { label: "Champion points (abbreviated)", value: formatPlainFixed2(abbreviated) };
  return { label: "Champion points", value: "(not enough data)" };
}

/** The field shape the Tree card renders -- satisfied by BOTH the tree row
 * (stored-latest values) and each `TreeMeasurementRow`, which is what lets
 * the measurement pager swap the whole card per measurement. */
interface TreeCardFields {
  scientificName: string;
  commonName: string;
  height: number;
  heightInputFormat: number;
  heightMeasurementMethod: number;
  girth: number;
  girthInputFormat: number;
  crownSpread: number;
  crownSpreadInputFormat: number;
  entspts: number | null;
  entspts2: number | null;
  championPoints: number | null;
  abbreviatedChampionPoints: number | null;
  diameter: number;
  diameterInputFormat: number;
  conicalVolume: number;
  conicalVolumeInputFormat: number;
  generalComments: string;
  /** Species-wide maxima (TDI divisors) -- both the tree row and each measurement row carry them from the global_species join. */
  maxHeight: number;
  maxGirth: number;
  maxCrownSpread: number;
}

/** One Tree-card `ReportTable` for one measurement's (or the tree row's)
 * values -- extracted rows (`toReportRowsExcluding`) come only from here;
 * the pager/Measurers/Measured-on footer lives OUTSIDE in
 * measurement-view.tsx. */
function treeCardTable(f: TreeCardFields, units: Units, speciesHref: string) {
  const tdi2 = calculateTDI2(f);
  const tdi3 = calculateTDI3(f);
  const champion = championPointsRow(f.championPoints, f.abbreviatedChampionPoints);
  return (
    <ReportTable>
      <ReportRow label="Botanical name" tone="text">
        <Link href={speciesHref} className="italic text-link hover:underline">
          {f.scientificName}
        </Link>
      </ReportRow>
      <ReportRow label="Common name" tone="text">
        <Link href={speciesHref} className="text-link hover:underline">
          {f.commonName}
        </Link>
      </ReportRow>
      <ReportRow label="Height">{formatDistanceField(f.height, f.heightInputFormat, units)}</ReportRow>
      <ReportRow label="Height measurement method">
        {formatHeightMeasurementMethod(f.heightMeasurementMethod)}
      </ReportRow>
      <ReportRow label="Girth">{formatDistanceField(f.girth, f.girthInputFormat, units, "subprefix")}</ReportRow>
      <ReportRow label="Crown spread">
        {formatDistanceField(f.crownSpread, f.crownSpreadInputFormat, units)}
      </ReportRow>
      <ReportRow label="ENTSPTS2">{formatPlainFixed2OrNotEnough(f.entspts2)}</ReportRow>
      <ReportRow label="ENTSPTS">{formatPlainFixed2OrNotEnough(f.entspts)}</ReportRow>
      <ReportRow label="TDI3">{formatPlainFixed2OrNotEnough(tdi3)}</ReportRow>
      <ReportRow label="TDI2">{formatPlainFixed2OrNotEnough(tdi2)}</ReportRow>
      <ReportRow label={champion.label}>{champion.value}</ReportRow>
      <ReportRow label="Diameter">{formatDistanceField(f.diameter, f.diameterInputFormat, units, "subprefix")}</ReportRow>
      <ReportRow label="Conical volume">{formatVolumeField(f.conicalVolume, f.conicalVolumeInputFormat, units)}</ReportRow>
      <ReportRow label="General comments" tone="text">
        {f.generalComments === "" ? "(none)" : f.generalComments}
      </ReportRow>
    </ReportTable>
  );
}

export default async function TreeDetailsPage({ params }: TreeDetailsPageProps) {
  const { id } = await params;
  const treeId = Number(id);
  if (!Number.isInteger(treeId) || treeId <= 0) notFound();

  const data = await treeDetailsCached(treeId);
  if (!data) notFound();

  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);
  const slug = speciesSlug(data.scientificName, data.commonName);
  const speciesHref = `/species/${slug}?site=${data.siteId}`;

  // Measurement pager (owner design 2026-07): NEWEST-first order -- the
  // default view is "1 of N" and paging forward walks back in time, like a
  // grid's page 1. The sort uses the same `measured desc, id desc`
  // tie-break as the tree row's stored-latest values (details.sql.ts), so
  // index 0 is by construction the measurement the tree row denormalizes.
  // (The served portlet list is `id asc` -- all three mockup agents
  // independently tripped over that mismatch; two shipped the wrong
  // default on their first pass.)
  const orderedMeasurements = [...data.measurements].sort((a, b) =>
    a.measured < b.measured ? 1 : a.measured > b.measured ? -1 : b.id - a.id,
  );
  const defaultIndex = 0;
  // `tables[defaultIndex]` renders from the tree row itself (not the
  // measurement row) so the served default is byte-identical to the
  // pre-pager page for the extractor.
  const measurementTables = orderedMeasurements.map((m, i) =>
    i === defaultIndex ? treeCardTable(data, units, speciesHref) : treeCardTable(m, units, speciesHref),
  );
  const measurementDates = orderedMeasurements.map((m) => formatDateMMDDYYYY(m.measured));
  const measurementMeasurers = orderedMeasurements.map((m) => concatenateNames(m.measurers));

  const coordinatesRow = selectCoordinatesRow(
    { latitude: data.latitude, latitudeInputFormat: data.latitudeInputFormat, longitude: data.longitude, longitudeInputFormat: data.longitudeInputFormat },
    {
      latitude: data.calculatedLatitude,
      latitudeInputFormat: data.calculatedLatitudeInputFormat,
      longitude: data.calculatedLongitude,
      longitudeInputFormat: data.calculatedLongitudeInputFormat,
    },
  );

  const photoRows = data.measurements
    .filter((m) => m.photoCount > 0)
    .map((m) => ({
      key: m.id,
      date: formatDateMMDDYYYY(m.measured),
      photoCount: m.photoCount,
      photographers: concatenateNames(m.measurers),
    }));

  return (
    /* Layout review 2026-07: meta band + full-width measurement history --
       the shared detail-page template (see app/sites/[id]/page.tsx's
       wrapper note). This was the worst-balanced page in the app: every
       measurement portlet stacked into the left column (unbounded count),
       measured 1659px of dead right column on a 2-measurement tree.
       Measurement portlets keep their relative DOM order (the extractor
       collects "Measured on " headings in document order). */
    <div data-tree-id={data.id} className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4">
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Portlet heading="Tree" tabNav={<ExportDataLink href={`/export/trees/${treeId}`} />}>
          {/* Measurement pager (owner design 2026-07): the card's fields
              swap per selected measurement; Measurers/"Measured on" render
              as footer fields with the quiet chevron pager at the card's
              lower right -- all OUTSIDE the extracted reports_table (see
              measurement-view.tsx's parity contract). */}
          <MeasurementView
            tables={measurementTables}
            dates={measurementDates}
            measurers={measurementMeasurers}
            defaultIndex={defaultIndex}
          />
        </Portlet>

        <div className="space-y-4">
        <Portlet heading="Location">
          <div id="LocationSummary">
            <ReportTable>
              <ReportRow label={coordinatesRow.label}>{coordinatesRow.value}</ReportRow>
              <ReportRow label="Site" tone="text">
                <Link href={`/sites/${data.siteId}`} className="text-link hover:underline">
                  {data.siteName}
                </Link>
              </ReportRow>
              <ReportRow label="Ownership type">{data.ownershipType}</ReportRow>
              <ReportRow label="County">{data.county}</ReportRow>
              <ReportRow label="State" tone="text">
                <Link href={`/states/${data.stateId}`} className="text-link hover:underline">
                  {formatStateWithCountry(data.stateName, data.countryDoubleLetterCode, data.countryTripleLetterCode)}
                </Link>
              </ReportRow>
            </ReportTable>
          </div>
          {coordinatesRow.coordinates && (
            <ViewOnMapLink latitude={coordinatesRow.coordinates.latitude} longitude={coordinatesRow.coordinates.longitude} />
          )}
        </Portlet>

        <Portlet heading="Photos">
          <PhotoSummaryTable rows={photoRows} photoRefType={7} />
        </Portlet>
        </div>
      </div>

      {/* Measurement pager parity stash: the "Measured on ..." portlets are
          no longer part of the visible page (the Tree card's pager replaced
          them) but parity/extractors/new/tree-details.ts walks their
          `#MeasurementSummary{n}`/`#MeasurementDetails{n}` tables and
          "Measured on " headings from the SERVED HTML in document order --
          cheerio is visibility-blind, so `hidden` keeps the contract intact
          while removing them from view and from the accessibility tree. */}
      <div hidden>
        {data.measurements.map((m, i) => (
          <MeasurementPortlet key={m.id} index={i} measurement={m} units={units} />
        ))}
      </div>
    </div>
  );
}

function MeasurementPortlet({
  index,
  measurement: m,
  units,
}: {
  index: number;
  measurement: TreeMeasurementRow;
  units: Units;
}) {
  const tdi2 = calculateTDI2(m);
  const tdi3 = calculateTDI3(m);
  const champion = championPointsRow(m.championPoints, m.abbreviatedChampionPoints);
  const measurers = concatenateNames(m.measurers);
  const heightSpecified = m.heightInputFormat !== 1;
  const girthSpecified = m.girthInputFormat !== 1;
  const crownSpreadSpecified = m.crownSpreadInputFormat !== 1;

  return (
    <Portlet heading={`Measured on ${formatDateMMDDYYYY(m.measured)}`}>
      {/* Full-width band (layout review 2026-07): Summary and the Details
          disclosure sit side by side instead of stacking -- a full-width
          single reports_table would put a 434px label column on every row. */}
      <div className="grid items-start gap-x-6 gap-y-4 md:grid-cols-2">
        <div id={`MeasurementSummary${index}`}>
          <h5 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Summary</h5>
          <ReportTable>
            {heightSpecified && <ReportRow label="Height">{formatDistanceField(m.height, m.heightInputFormat, units)}</ReportRow>}
            {girthSpecified && (
              <ReportRow label="Girth">{formatDistanceField(m.girth, m.girthInputFormat, units, "subprefix")}</ReportRow>
            )}
            {crownSpreadSpecified && (
              <ReportRow label="Crown spread">{formatDistanceField(m.crownSpread, m.crownSpreadInputFormat, units)}</ReportRow>
            )}
            <ReportRow label="Measurers" tone="text">{measurers}</ReportRow>
          </ReportTable>
        </div>

        {/*
          Design-audit item 5 + layout review 2026-07: two near-identical
          "Summary"/"Details" blocks per measurement read as an accidental
          duplicate -- and the 15-row Details table is a near row-for-row
          copy of the Tree portlet. Legacy tabbed this exact content
          (BrowseTreeSummaryModel active, BrowseTreeDetailsModel behind a
          click, TreeDetails.cshtml:50-61), showing <=4 rows per
          measurement; collapsing Details BY DEFAULT restores that. The
          extractor reads `#MeasurementDetails{n} table.reports_table` via
          cheerio (served HTML, visibility-blind) -- the `open` attribute's
          absence changes nothing it sees.
        */}
        <details id={`MeasurementDetails${index}`} className="group">
          <summary className="mb-1 flex list-none cursor-pointer items-center gap-1.5 [&::-webkit-details-marker]:hidden">
            <ChevronRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
            <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</h5>
          </summary>
          <ReportTable>
            {/* Emphasis sweep 2026-07: italicize the binomial here too --
                this was the one botanical name in the app NOT italicized. */}
            <ReportRow label="Botanical name"><span className="italic">{m.scientificName}</span></ReportRow>
            <ReportRow label="Common name">{m.commonName}</ReportRow>
            <ReportRow label="Height">{formatDistanceField(m.height, m.heightInputFormat, units)}</ReportRow>
            <ReportRow label="Height measurement method">{formatHeightMeasurementMethod(m.heightMeasurementMethod)}</ReportRow>
            <ReportRow label="Girth">{formatDistanceField(m.girth, m.girthInputFormat, units, "subprefix")}</ReportRow>
            <ReportRow label="Crown spread">{formatDistanceField(m.crownSpread, m.crownSpreadInputFormat, units)}</ReportRow>
            <ReportRow label="ENTSPTS2">{formatPlainFixed2OrNotEnough(m.entspts2)}</ReportRow>
            <ReportRow label="ENTSPTS">{formatPlainFixed2OrNotEnough(m.entspts)}</ReportRow>
            <ReportRow label="TDI3">{formatPlainFixed2OrNotEnough(tdi3)}</ReportRow>
            <ReportRow label="TDI2">{formatPlainFixed2OrNotEnough(tdi2)}</ReportRow>
            <ReportRow label={champion.label}>{champion.value}</ReportRow>
            <ReportRow label="Diameter">{formatDistanceField(m.diameter, m.diameterInputFormat, units, "subprefix")}</ReportRow>
            <ReportRow label="Conical volume">{formatVolumeField(m.conicalVolume, m.conicalVolumeInputFormat, units)}</ReportRow>
            <ReportRow label="General comments" tone="text">
              {m.generalComments === "" ? "(none)" : m.generalComments}
            </ReportRow>
            <ReportRow label="Measurers" tone="text">{measurers}</ReportRow>
          </ReportTable>
        </details>
      </div>
    </Portlet>
  );
}
