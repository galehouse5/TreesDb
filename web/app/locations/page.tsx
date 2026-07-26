// Port of `BrowseController.Locations` / `TMD/Views/Browse/Locations.cshtml`
// + `LocationsGridPartial.cshtml` (task P1-03, doc 03 "P1-03/04", doc 01
// §1: `/Browse/Locations` -> `/locations`, page size 40, params
// `page`/`sort`/`sortAsc`/`stateFilter`/`countyFilter`/`siteFilter`).
//
// Columns + cell rendering transcribed 1:1 from
// `TMD/Views/Browse/LocationsGridPartial.cshtml` (read in full for this
// task): Site (link to site details, filterable), County (plain text,
// filterable), State (link to state details, filterable), RHI5/RHI10/
// RGI5/RGI10 (`ComputedRHI*?.ToString(UserSession.Units) ?? "-"`, not
// filterable, default-sorts descending), Last measurement
// (`ComputedLastMeasurementDate`, `{0:MM/dd/yyyy}`, not filterable).
//
// Query + business rules (default sort, filter predicates, NULL ordering)
// live in `db/queries/browse-grids.sql.ts` -- this file only resolves
// `searchParams`/the units cookie into that query's inputs and formats the
// raw row values via `lib/units/format.ts` (float32 discipline preserved by
// never touching the numbers except through that module).
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DownloadIcon } from "lucide-react";
import { browseSites, resolveBrowsePageIndex, BROWSE_GRID_PAGE_SIZE } from "@/db/queries/browse-grids.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { formatRuckerIndex } from "@/lib/units/format";
import { BrowseGrid, type BrowseGridColumn, type BrowseGridRow } from "@/components/grids/browse-grid";
import { BrowseTabs } from "@/components/chrome/browse-tabs";

export const metadata: Metadata = {
  title: "Locations - TreesDb",
  description: "Browse measured-tree sites by name, county, and state.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `bool.TryParse` semantics (DataTablesGridModel.SortAscending / BrowseController.cs `sortAsc` binder): exact case-insensitive "true"/"false", else not-parsed. */
function parseBoolParam(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return undefined;
}

/** `Site.ComputedLastMeasurementDate`'s `[DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]` (TMD.Model/Sites/Site.cs:34), applied to a raw `YYYY-MM-DD` string so no Date/timezone parsing is involved. Null -> "" (no `NullDisplayText` override in legacy -> the MVC default). */
function formatLastMeasurementDate(value: string | null): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

interface LocationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);

  const pageRaw = firstParam(sp.page);
  const pageParam = pageRaw !== undefined ? Number(pageRaw) : undefined;
  const sort = firstParam(sp.sort);
  const sortAscending = parseBoolParam(firstParam(sp.sortAsc));
  const stateFilter = firstParam(sp.stateFilter);
  const countyFilter = firstParam(sp.countyFilter);
  const siteFilter = firstParam(sp.siteFilter);

  const result = await browseSites({
    page: pageParam,
    sort,
    sortAscending,
    stateFilter,
    countyFilter,
    siteFilter,
  });

  // Plain metadata only -- no render functions (BrowseGrid is a Client
  // Component; see components/grids/browse-grid.tsx's file header for why
  // cell rendering happens here, server-side, into plain ReactNodes).
  const columns: BrowseGridColumn[] = [
    { id: "Site", header: "Site", sortable: true, filterable: true, filterParamName: "siteFilter", filterPlaceholder: "Search sites" },
    { id: "County", header: "County", sortable: true, filterable: true, filterParamName: "countyFilter", filterPlaceholder: "Search county" },
    { id: "State", header: "State", sortable: true, filterable: true, filterParamName: "stateFilter", filterPlaceholder: "Search states" },
    { id: "RHI5", header: "RHI5", sortable: true, defaultSortAscending: false, filterable: false },
    { id: "RHI10", header: "RHI10", sortable: true, defaultSortAscending: false, filterable: false },
    { id: "RGI5", header: "RGI5", sortable: true, defaultSortAscending: false, filterable: false },
    { id: "RGI10", header: "RGI10", sortable: true, defaultSortAscending: false, filterable: false },
    { id: "LastMeasurement", header: "Last measurement", sortable: true, filterable: false },
  ];

  const rows: BrowseGridRow[] = result.rows.map((row) => ({
    key: row.id,
    cells: [
      <Link key="site" href={`/sites/${row.id}`} prefetch={false}>
        {row.name}
      </Link>,
      row.county,
      <Link key="state" href={`/states/${row.stateId}`} prefetch={false}>
        {row.stateName}
      </Link>,
      row.computedRhi5 !== null ? formatRuckerIndex(row.computedRhi5, units) : "-",
      row.computedRhi10 !== null ? formatRuckerIndex(row.computedRhi10, units) : "-",
      row.computedRgi5 !== null ? formatRuckerIndex(row.computedRgi5, units) : "-",
      row.computedRgi10 !== null ? formatRuckerIndex(row.computedRgi10, units) : "-",
      formatLastMeasurementDate(row.computedLastMeasurementDate),
    ],
  }));

  const currentParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    const v = firstParam(value);
    if (v !== undefined) currentParams[key] = v;
  }

  // Export link (design-audit item: /export/locationsbyfilters existed but
  // was unlinked). Legacy links this from Views/Browse/Locations.cshtml:12
  // as `Export/LocationsByFilters?StateFilter=...&CountyFilter=...&SiteFilter=...`
  // -- only the three filter params the route itself reads
  // (app/export/locationsbyfilters/route.ts), matched case-insensitively
  // there, so lowercase param names here are equivalent. `page`/`sort` are
  // not part of that route's contract and are intentionally omitted.
  const exportParams = new URLSearchParams();
  if (stateFilter) exportParams.set("stateFilter", stateFilter);
  if (countyFilter) exportParams.set("countyFilter", countyFilter);
  if (siteFilter) exportParams.set("siteFilter", siteFilter);
  const exportQuery = exportParams.toString();
  const exportHref = `/export/locationsbyfilters${exportQuery ? `?${exportQuery}` : ""}`;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4">
      <BrowseTabs current="/locations" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Locations</h1>
        </div>
        <div className="p-4">
          <BrowseGrid
            columns={columns}
            rows={rows}
            basePath="/locations"
            currentParams={currentParams}
            pageIndex={resolveBrowsePageIndex(pageParam)}
            pageSize={BROWSE_GRID_PAGE_SIZE}
            totalCount={result.totalCount}
            filteredCount={result.filteredCount}
          />
          <div className="mt-3 flex justify-end">
            <Link
              href={exportHref}
              className="inline-flex items-center gap-1.5 text-sm text-link hover:underline"
            >
              <DownloadIcon aria-hidden="true" className="size-3.5" />
              Export tree data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
