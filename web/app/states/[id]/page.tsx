// GET /states/[id] -- port of `BrowseController.StateDetails`
// (`TMD/Controllers/BrowseController.cs:163-207`) + `TMD/Views/Browse/
// StateDetails.cshtml` + `StateSpeciesGridPartial.cshtml`/
// `SitesGridPartial.cshtml` -- task P1-08, doc 03 "P1-05..08", doc 01 §1
// (`/states/{id}` <- `/Browse/States/{id}/Details`, two embedded grids
// page size 10, param prefixes `stateSpecies*`/`sites*`).
//
// Server component; every displayed value goes through `lib/units/format.ts`
// / `components/details/legacy-format.ts`'s thin wrappers around it. 404
// (`notFound()`) when the state id doesn't resolve, matching legacy's
// `Repositories.Locations.FindStateById` null check.
//
// Markup mirrors the legacy view's structure (State / Species / Location /
// Sites portlets) using the shared `components/details/report-table.tsx`
// primitives (legacy class-name/id conventions as pure structural hooks for
// `parity/extractors/new/state-details.ts` -- no legacy CSS loaded). The
// state id itself (legacy scrapes it off the "Export tree data" link's
// href, not rendered here since CSV export is a separate task, P1-11) is
// exposed via `data-state-id` on the root element instead.
//
// "Coordinates" row: `BrowseMapping.cs:75` maps `Model.Coordinates` from
// `State.CoordinateBounds.Center`, NOT the raw/calculated-coordinate
// row-selection tree/site details use. Per `Locations.hbm.xml`'s
// `CoordinateBounds` component mapping, only NE/SW `Latitude`/`Longitude`'s
// `TotalDegrees` are persisted columns -- `InputFormat` is NOT mapped, so it
// always hydrates to `CoordinatesFormat.Default` (2) for a state loaded from
// the database. That makes `Center.IsSpecified`/`IsValidAndSpecified()`
// ALWAYS true for any real row (verified: production snapshot
// `Browse/States/1/Details.extracted.json` shows a real value, "32 34.369,
// -086 40.844", not the "(no data)" NullDisplayText) -- so this page always
// renders the bounds-midpoint coordinates, no gating needed.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  boundsMidpoint,
  sitesForStateGrid,
  stateSpeciesGrid,
  stateSummary,
  SPECIES_STATE_GRID_PAGE_SIZE,
} from "@/db/queries/species-state-details.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { Units, distanceSubunit, formatDistance, formatRuckerIndex } from "@/lib/units/format";
import { speciesSlug } from "@/lib/slug";
import { ExportDataLink, Portlet, ReportRow, ReportTable } from "@/components/details/report-table";
import { BrowseGrid, type BrowseGridColumn, type BrowseGridRow } from "@/components/grids/browse-grid";
import { codeOf, formatCoordinatesValue, formatDateMMDDYYYY, formatRuckerField, isValidAndSpecifiedFormat } from "@/components/details/legacy-format";

// Design-audit item 7: `BrowseGridColumn` (components/grids/browse-grid.tsx,
// not owned by this task) has no per-column className/align hook -- but
// cells are pre-rendered `ReactNode`s built server-side by this page, so
// right-aligning the numeric Max height/girth/crown columns is done here, at
// the cell level, instead.
function numericCell(node: ReactNode): ReactNode {
  return <span className="block text-right tabular-nums">{node}</span>;
}

interface StateDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `bool.TryParse` semantics (same convention as `app/sites/[id]/page.tsx`). */
function parseBoolParam(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return undefined;
}

// Perf audit 2026-07: generateMetadata and the page body both need the
// summary row -- React `cache()` dedupes them to one query per request
// instead of two byte-identical ones.
const stateSummaryCached = cache(stateSummary);

export async function generateMetadata({ params }: StateDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const stateId = Number(id);
  if (!Number.isInteger(stateId)) return { title: "State - TreesDb" };
  const data = await stateSummaryCached(stateId);
  if (!data) return { title: "State - TreesDb" };
  return { title: `${data.name} - TreesDb` };
}

export default async function StateDetailsPage({ params, searchParams }: StateDetailsPageProps) {
  const { id } = await params;
  const stateId = Number(id);
  if (!Number.isInteger(stateId) || stateId <= 0) notFound();

  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);
  const sp = await searchParams;

  // Perf audit 2026-07: the summary and the two embedded grids have no data
  // dependency on one another -- fired together they pipeline over the
  // single postgres.js connection (≈1 round trip instead of 3 sequential).
  const [data, speciesGrid, sitesGrid] = await Promise.all([
    stateSummaryCached(stateId),
    stateSpeciesGrid(stateId, {
      page: numberOrUndefined(firstParam(sp.stateSpeciesPage)),
      sort: firstParam(sp.stateSpeciesSort),
      sortAscending: parseBoolParam(firstParam(sp.stateSpeciesSortAsc)),
    }),
    sitesForStateGrid(stateId, {
      page: numberOrUndefined(firstParam(sp.sitesPage)),
      sort: firstParam(sp.sitesSort),
      sortAscending: parseBoolParam(firstParam(sp.sitesSortAsc)),
    }),
  ]);
  if (!data) notFound();

  const coordinatesValue = formatCoordinatesValue({
    latitude: boundsMidpoint(data.neLatitude, data.swLatitude),
    latitudeInputFormat: 2, // CoordinatesFormat.Default -- see file header.
    longitude: boundsMidpoint(data.neLongitude, data.swLongitude),
    longitudeInputFormat: 2,
  });

  const speciesColumns: BrowseGridColumn[] = [
    { id: "BotanicalName", header: "Botanical name", sortable: true, filterable: false },
    { id: "CommonName", header: "Common name", sortable: true, filterable: false },
    { id: "MaxHeight", header: "Max height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxGirth", header: "Max girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxCrownSpread", header: "Max crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];
  const speciesRows: BrowseGridRow[] = speciesGrid.rows.map((s) => {
    const slug = speciesSlug(s.scientificName, s.commonName);
    const scopedHref = `/species/${slug}?state=${stateId}`;
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
          isValidAndSpecifiedFormat(s.maxHeightInputFormat) && s.maxHeightTreeId !== null ? (
            <Link key="mh" href={`/trees/${s.maxHeightTreeId}`} prefetch={false} className="hover:underline">
              {formatDistance(s.maxHeight, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          isValidAndSpecifiedFormat(s.maxGirthInputFormat) && s.maxGirthTreeId !== null ? (
            <Link key="mg" href={`/trees/${s.maxGirthTreeId}`} prefetch={false} className="hover:underline">
              {distanceSubunit(s.maxGirth, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          isValidAndSpecifiedFormat(s.maxCrownSpreadInputFormat) && s.maxCrownSpreadTreeId !== null ? (
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

  const sitesColumns: BrowseGridColumn[] = [
    { id: "Site", header: "Site", sortable: true, filterable: false },
    { id: "RHI5", header: "RHI5", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "RHI10", header: "RHI10", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "RGI5", header: "RGI5", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "RGI10", header: "RGI10", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];
  // NOTE (documented legacy quirk, see file header on species-state-details.sql.ts):
  // these 4 cells intentionally ignore the visitor's `units` cookie --
  // `SitesGridPartial.cshtml` calls `RuckerIndex.ToString()` (no Units arg),
  // always feet-basis, unlike every other Rucker-index value on this page.
  const sitesRows: BrowseGridRow[] = sitesGrid.rows.map((s) => ({
    key: s.id,
    cells: [
      <Link key="site" href={`/sites/${s.id}`} prefetch={false} className="hover:underline">
        {s.name}
      </Link>,
      s.computedRhi5 !== null ? formatRuckerIndex(s.computedRhi5, Units.Default) : "-",
      s.computedRhi10 !== null ? formatRuckerIndex(s.computedRhi10, Units.Default) : "-",
      s.computedRgi5 !== null ? formatRuckerIndex(s.computedRgi5, Units.Default) : "-",
      s.computedRgi10 !== null ? formatRuckerIndex(s.computedRgi10, Units.Default) : "-",
    ],
  }));

  const currentParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    const v = firstParam(value);
    if (v !== undefined) currentParams[key] = v;
  }

  return (
    /* Layout review 2026-07: meta band + full-width grids -- the shared
       detail-page template (see app/sites/[id]/page.tsx's wrapper note).
       This page was the worst horizontal offender: the 5-column Sites grid
       needs 613px min-content vs the 512px a half column offers, clipping
       101px of table with no scroll cue. Full width fits every grid. */
    <div data-state-id={data.id} className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4">
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Portlet heading="State" tabNav={<ExportDataLink href={`/export/states/${stateId}`} />}>
          {/* Emphasis sweep 2026-07: emphasizeIdentity dropped -- identity
              rows now render at standard size on ALL detail pages (species
              never enlarged its identity row; trees' enlarged link and this
              page's promoted badge were conflicting treatments of the same
              concept). */}
          <ReportTable>
            <ReportRow label="Name">{data.name}</ReportRow>
            <ReportRow label="Code">{codeOf(data.doubleLetterCode, data.tripleLetterCode)}</ReportRow>
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
          </ReportTable>
        </Portlet>

        <Portlet heading="Location">
          <ReportTable>
            <ReportRow label="Coordinates">{coordinatesValue}</ReportRow>
            <ReportRow label="Country">{data.countryName}</ReportRow>
          </ReportTable>
        </Portlet>
      </div>

      <Portlet heading="Species">
        <BrowseGrid
          columns={speciesColumns}
          rows={speciesRows}
          basePath={`/states/${stateId}`}
          currentParams={currentParams}
          sortParamName="stateSpeciesSort"
          sortAscParamName="stateSpeciesSortAsc"
          pageParamName="stateSpeciesPage"
          pageIndex={speciesGrid.pageIndex}
          pageSize={SPECIES_STATE_GRID_PAGE_SIZE}
          totalCount={speciesGrid.totalCount}
          filteredCount={null}
        />
      </Portlet>

      <Portlet heading="Sites">
        <BrowseGrid
          columns={sitesColumns}
          rows={sitesRows}
          basePath={`/states/${stateId}`}
          currentParams={currentParams}
          sortParamName="sitesSort"
          sortAscParamName="sitesSortAsc"
          pageParamName="sitesPage"
          pageIndex={sitesGrid.pageIndex}
          pageSize={SPECIES_STATE_GRID_PAGE_SIZE}
          totalCount={sitesGrid.totalCount}
          filteredCount={null}
        />
      </Portlet>
    </div>
  );
}

function numberOrUndefined(value: string | undefined): number | undefined {
  return value !== undefined ? Number(value) : undefined;
}
