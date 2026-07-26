// GET /sites/[id] -- port of `BrowseController.SiteDetails`
// (`TMD/Controllers/BrowseController.cs:49-82`) + `TMD/Views/Browse/
// SiteDetails.cshtml` + `SiteSpeciesGridPartial2.cshtml` + the
// `BrowsePhotoSummaryList`/`BrowsePhotoSumaryModel` DisplayTemplates --
// task P1-06, doc 03 "P1-05..08", doc 01 §1
// (`/sites/{id}` <- `/Browse/Sites/{id}/Details`, embedded species grid
// page size 10, params `page`/`sort`/`sortAsc` -- SAME bare names as the
// top-level `/locations`/`/species` grids since
// `SiteSpeciesGridPartial2`/`EntityGridModel<SiteMeasuredSpecies>` has no
// `ParameterNamePrefix`, `BrowseController.cs:69`).
//
// Server component; every displayed value goes through
// `lib/units/format.ts` / `lib/geo/coordinates.ts` /
// `components/details/legacy-format.ts`. 404 (`notFound()`) when the site
// id doesn't resolve. The embedded species grid reuses
// `components/grids/browse-grid.tsx` (already built for `/locations`/
// `/species`, P1-03/04) rather than re-implementing sortable/pageable grid
// markup -- its `.dataTablesGrid` output is exactly what
// `parity/extractors/new/site-details.ts` (via the shared `parseGrid`
// helper) expects.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteDetails, siteSpeciesGrid, SITE_SPECIES_GRID_PAGE_SIZE } from "@/db/queries/details.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { distanceSubunit, formatDistance } from "@/lib/units/format";
import { speciesSlug } from "@/lib/slug";
import { ExportDataLink, Portlet, PhotoSummaryTable, ReportRow, ReportTable, ViewOnMapLink } from "@/components/details/report-table";
import { BrowseGrid, type BrowseGridColumn, type BrowseGridRow } from "@/components/grids/browse-grid";
import { Badge } from "@/components/ui/badge";
import {
  concatenateNames,
  formatDateMMDDYYYY,
  formatRuckerField,
  formatStateWithCountry,
  formatTripReportUrl,
  isValidAndSpecifiedFormat,
  selectCoordinatesRow,
  tripReportUrlHref,
} from "@/components/details/legacy-format";

// Design-audit item 7: `BrowseGridColumn` (components/grids/browse-grid.tsx,
// not owned by this task) has no per-column className/align hook -- but
// cells are pre-rendered `ReactNode`s built server-side by this page, so
// right-aligning the numeric Max height/girth/crown columns is done here, at
// the cell level, instead.
function numericCell(node: ReactNode): ReactNode {
  return <span className="block text-right tabular-nums">{node}</span>;
}

interface SiteDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `bool.TryParse` semantics (same convention as `app/locations/page.tsx`/`components/grids/browse-grid.tsx`): exact case-insensitive "true"/"false", else not-parsed. */
function parseBoolParam(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return undefined;
}

// Perf audit 2026-07: generateMetadata and the page body both need the site
// row -- React `cache()` dedupes them to one fetch per request.
const siteDetailsCached = cache(siteDetails);

export async function generateMetadata({ params }: SiteDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const siteId = Number(id);
  if (!Number.isInteger(siteId)) return { title: "Site - TreesDb" };
  const data = await siteDetailsCached(siteId);
  if (!data) return { title: "Site - TreesDb" };
  return { title: `${data.name} - TreesDb` };
}

export default async function SiteDetailsPage({ params, searchParams }: SiteDetailsPageProps) {
  const { id } = await params;
  const siteId = Number(id);
  if (!Number.isInteger(siteId) || siteId <= 0) notFound();

  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);

  const sp = await searchParams;
  const pageRaw = firstParam(sp.page);
  const pageParam = pageRaw !== undefined ? Number(pageRaw) : undefined;
  const sort = firstParam(sp.sort);
  const sortAscending = parseBoolParam(firstParam(sp.sortAsc));

  // Perf audit 2026-07: details + species grid are independent; pipeline
  // them together instead of awaiting sequentially.
  const [data, grid] = await Promise.all([
    siteDetailsCached(siteId),
    siteSpeciesGrid(siteId, { page: pageParam, sort, sortAscending }),
  ]);
  if (!data) notFound();

  const coordinatesRow = selectCoordinatesRow(
    { latitude: data.latitude, latitudeInputFormat: data.latitudeInputFormat, longitude: data.longitude, longitudeInputFormat: data.longitudeInputFormat },
    {
      latitude: data.calculatedLatitude,
      latitudeInputFormat: data.calculatedLatitudeInputFormat,
      longitude: data.calculatedLongitude,
      longitudeInputFormat: data.calculatedLongitudeInputFormat,
    },
  );

  const photoRows = data.visits
    .filter((v) => v.photoCount > 0)
    .map((v) => ({
      key: v.id,
      date: formatDateMMDDYYYY(v.visited),
      photoCount: v.photoCount,
      photographers: concatenateNames(v.visitors),
    }));

  const speciesColumns: BrowseGridColumn[] = [
    { id: "BotanicalName", header: "Botanical name", sortable: true, filterable: false },
    { id: "CommonName", header: "Common name", sortable: true, filterable: false },
    { id: "MaxHeight", header: "Max height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxGirth", header: "Max girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxCrownSpread", header: "Max crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];

  const speciesRows: BrowseGridRow[] = grid.rows.map((s) => {
    const slug = speciesSlug(s.scientificName, s.commonName);
    const scopedHref = `/species/${slug}?site=${siteId}`;
    const heightSpecified = isValidAndSpecifiedFormat(s.maxHeightInputFormat);
    const girthSpecified = isValidAndSpecifiedFormat(s.maxGirthInputFormat);
    const crownSpreadSpecified = isValidAndSpecifiedFormat(s.maxCrownSpreadInputFormat);
    return {
      key: `${s.scientificName}--${s.commonName}`,
      cells: [
        <Link key="bn" href={scopedHref} prefetch={false} className="italic hover:underline">
          {s.scientificName}
        </Link>,
        <Link key="cn" href={scopedHref} prefetch={false} className="hover:underline">
          {s.commonName}
        </Link>,
        numericCell(
          heightSpecified && s.maxHeightTreeId !== null ? (
            <Link key="mh" href={`/trees/${s.maxHeightTreeId}`} prefetch={false} className="hover:underline">
              {formatDistance(s.maxHeight, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          girthSpecified && s.maxGirthTreeId !== null ? (
            <Link key="mg" href={`/trees/${s.maxGirthTreeId}`} prefetch={false} className="hover:underline">
              {distanceSubunit(s.maxGirth, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          crownSpreadSpecified && s.maxCrownSpreadTreeId !== null ? (
            <Link key="mc" href={`/trees/${s.maxCrownSpreadTreeId}`} prefetch={false} className="hover:underline">
              {formatDistance(s.maxCrownSpread, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
      ],
    };
  });

  const currentParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    const v = firstParam(value);
    if (v !== undefined) currentParams[key] = v;
  }

  return (
    /* Layout review 2026-07 (3-agent brief): the old md:grid-cols-2 with
       stacked-portlet columns left 755px of dead space under the short
       column AND clipped the species grid 26px (a half column caps table
       area at 512px). General template now shared by all four detail
       pages: a two-column META band (identity card + location/photos) over
       FULL-WIDTH data grids. Parity extractors match portlets by
       id/heading, never position -- band wrappers are invisible to them. */
    <div data-site-id={data.id} className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4">
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Portlet heading="Site" tabNav={<ExportDataLink href={`/export/sites/${siteId}`} />}>
          {/* Emphasis sweep 2026-07: emphasizeIdentity dropped -- identity
              rows now render at standard size on ALL detail pages (species
              never enlarged its identity row; trees' enlarged link and this
              page's promoted badge were conflicting treatments of the same
              concept). */}
          <div id="SiteSummary">
            <ReportTable>
              <ReportRow label="Name">{data.name}</ReportRow>
              <ReportRow label="RHI5">{formatRuckerField(data.computedRhi5, units)}</ReportRow>
              <ReportRow label="RHI10">{formatRuckerField(data.computedRhi10, units)}</ReportRow>
              <ReportRow label="RHI20">{formatRuckerField(data.computedRhi20, units)}</ReportRow>
              <ReportRow label="RGI5">{formatRuckerField(data.computedRgi5, units)}</ReportRow>
              <ReportRow label="RGI10">{formatRuckerField(data.computedRgi10, units)}</ReportRow>
              <ReportRow label="RGI20">{formatRuckerField(data.computedRgi20, units)}</ReportRow>
              <ReportRow label="Trees measured">
                {data.computedTreesMeasuredCount === null ? "" : String(data.computedTreesMeasuredCount)}
              </ReportRow>
              <ReportRow label="Last measurement date">{formatDateMMDDYYYY(data.computedLastMeasurementDate)}</ReportRow>
              <ReportRow label="Ownership contact" tone="text">
                {data.makeOwnershipContactInfoPublic
                  ? data.ownershipContactInfo === ""
                    ? "(no data)"
                    : data.ownershipContactInfo
                  : "(private)"}
              </ReportRow>
              <ReportRow label="General comments" tone="text">
                {data.lastVisitComments === "" ? "(none)" : data.lastVisitComments}
              </ReportRow>
            </ReportTable>
          </div>

        </Portlet>

        <div className="space-y-4">
        <Portlet heading="Location">
          <div id="LocationSummary">
            <ReportTable>
              <ReportRow label={coordinatesRow.label}>{coordinatesRow.value}</ReportRow>
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
          <PhotoSummaryTable rows={photoRows} photoRefType={5} />
        </Portlet>

        {/*
          Trip history placement (UX experiments 2026-07): promoted from a
          collapsed <details> inside the Site portlet to its OWN card, in
          the meta band's right cell after Photos (both are visit-derived
          data; this cell was the band's one remaining dead space). Legacy
          made this a hidden portlet tab -- no count, invisible on load,
          unreachable without JS -- so a visible card with compact timeline
          rows beats both legacy and the disclosure on discoverability.
          Rows are one line when a trip has no url/comments (the common
          case): [date badge] visitor names.

          Parity: `#TripHistory` is matched by id anywhere on the page; the
          extractor walks `table.support_table > tbody > tr` reading td
          eq(0)'s `span.ticket` date and td eq(1)'s `table.reports_table`
          label/value rows. Tag names + classes are byte-identical; the
          one-line look is pure CSS (flex on the <tr> itself -- NO wrapper
          divs inside the table, the parser would hoist them out). Labels
          stay in the DOM (`sr-only`), and empty "(none)" markers stay as
          real text nodes (`hidden` attribute), so extracted text is
          unchanged.
        */}
        <Portlet
          heading="Trip history"
          tabNav={
            <span className="text-sm text-muted-foreground">
              {data.visits.length === 1 ? "1 trip" : `${data.visits.length} trips`}
            </span>
          }
        >
          <div id="TripHistory">
            {data.visits.length === 0 ? (
              <p className="text-sm text-muted-foreground">(no trips)</p>
            ) : (
              <table className="support_table block w-full text-sm">
                <tbody className="block">
                  {data.visits.map((v, i) => (
                    <tr
                      key={v.id}
                      className={cn("flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0", i > 0 && "border-t border-border/60")}
                    >
                      <td className="block shrink-0 p-0">
                        <Badge className="ticket open border-transparent bg-badge font-normal text-badge-foreground whitespace-nowrap">
                          {formatDateMMDDYYYY(v.visited)}
                        </Badge>
                      </td>
                      <td className="block min-w-0 flex-1 p-0 [&_td.description]:sr-only [&_td.value]:block [&_td.value]:py-0.5 [&_td.value]:text-left [&_tr]:border-0">
                        <ReportTable>
                          <ReportRow label="Visitors" tone="text">
                            <span className="font-medium">{concatenateNames(v.visitors)}</span>
                          </ReportRow>
                          <ReportRow label="Trip report url" tone="text">
                            {v.tripReportUrl === "" ? (
                              <span hidden>(none)</span>
                            ) : (
                              /* Same truncation treatment as the URL-display
                                 review: ReportRow's inline-flex anchors never
                                 line-break, so clamp + ellipsize with the full
                                 text left in the DOM for extraction. */
                              <a
                                href={tripReportUrlHref(v.tripReportUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={formatTripReportUrl(v.tripReportUrl)}
                                className="max-w-full min-w-0 gap-1.5 text-xs text-link hover:underline"
                              >
                                <span className="truncate">{formatTripReportUrl(v.tripReportUrl)}</span>
                                <ExternalLinkIcon aria-hidden="true" className="size-3 shrink-0" />
                              </a>
                            )}
                          </ReportRow>
                          <ReportRow label="General comments" tone="text">
                            {v.comments === "" ? (
                              <span hidden>(none)</span>
                            ) : (
                              <span className="block text-xs text-muted-foreground">{v.comments}</span>
                            )}
                          </ReportRow>
                        </ReportTable>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Portlet>
        </div>
      </div>

      <Portlet heading="Species">
        <BrowseGrid
          columns={speciesColumns}
          rows={speciesRows}
          basePath={`/sites/${siteId}`}
          currentParams={currentParams}
          pageIndex={grid.pageIndex}
          pageSize={SITE_SPECIES_GRID_PAGE_SIZE}
          totalCount={grid.totalCount}
          filteredCount={null}
        />
      </Portlet>
    </div>
  );
}
