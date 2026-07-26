// Port of `BrowseController.Species` / `TMD/Views/Browse/Species.cshtml` +
// `GlobalSpeciesGridPartial.cshtml` (task P1-04, doc 03 "P1-03/04", doc 01
// §1: `/Browse/Species` -> `/species`, page size 40, params
// `page`/`sort`/`sortAsc`/`botanicalNameFilter`/`commonNameFilter`).
// NOTE: this file only owns the `/species` LIST page -- `/species/{slug}`
// (species details) is a different task's file (`app/species/[slug]/**`).
//
// Columns + cell rendering transcribed 1:1 from
// `TMD/Views/Browse/GlobalSpeciesGridPartial.cshtml` (read in full for this
// task): Botanical name / Common name (both link to the same species
// details page, filterable), Max height / Max girth / Max crown spread
// (link to the record-holding tree when `IsValidAndSpecified()`, i.e. the
// max is non-zero -- rendered "-" otherwise; not filterable, default-sorts
// descending). Max girth uses `UnitRenderMode.SubprefixOnly`
// (`distanceSubunit`: whole inches/cm), the other two use the default
// distance render (`formatDistance`).
//
// Query + business rules (default sort, filter predicates) live in
// `db/queries/browse-grids.sql.ts` -- this file only resolves
// `searchParams`/the units cookie into that query's inputs and formats the
// raw row values via `lib/units/format.ts`.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { DownloadIcon } from "lucide-react";
import {
  browseSpecies,
  resolveBrowsePageIndex,
  BROWSE_GRID_PAGE_SIZE,
} from "@/db/queries/browse-grids.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { distanceSubunit, formatDistance } from "@/lib/units/format";
import { speciesSlug } from "@/lib/slug";
import { BrowseGrid, type BrowseGridColumn, type BrowseGridRow } from "@/components/grids/browse-grid";
import { BrowseTabs } from "@/components/chrome/browse-tabs";

export const metadata: Metadata = {
  title: "Species - TreesDb",
  description: "Browse measured tree species by botanical or common name.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `bool.TryParse` semantics, same as `app/locations/page.tsx`. */
function parseBoolParam(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return undefined;
}

interface SpeciesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SpeciesPage({ searchParams }: SpeciesPageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);

  const pageRaw = firstParam(sp.page);
  const pageParam = pageRaw !== undefined ? Number(pageRaw) : undefined;
  const sort = firstParam(sp.sort);
  const sortAscending = parseBoolParam(firstParam(sp.sortAsc));
  const botanicalNameFilter = firstParam(sp.botanicalNameFilter);
  const commonNameFilter = firstParam(sp.commonNameFilter);

  const result = await browseSpecies({
    page: pageParam,
    sort,
    sortAscending,
    botanicalNameFilter,
    commonNameFilter,
  });

  // Plain metadata only -- no render functions (see
  // components/grids/browse-grid.tsx's file header).
  const columns: BrowseGridColumn[] = [
    { id: "BotanicalName", header: "Botanical name", sortable: true, filterable: true, filterParamName: "botanicalNameFilter", filterPlaceholder: "Search botanical names" },
    { id: "CommonName", header: "Common name", sortable: true, filterable: true, filterParamName: "commonNameFilter", filterPlaceholder: "Search common names" },
    { id: "MaxHeight", header: "Max height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxGirth", header: "Max girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxCrownSpread", header: "Max crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];

  // Same numericCell convention as the detail pages: right-aligned
  // tabular numerals under the right-aligned headers (this page's numeric
  // cells were bare links -- the one grid whose cells never got the
  // alignment treatment).
  const numericCell = (node: ReactNode): ReactNode => (
    <span className="block text-right tabular-nums">{node}</span>
  );

  const rows: BrowseGridRow[] = result.rows.map((row) => {
    const slug = speciesSlug(row.scientificName, row.commonName);
    return {
      key: `${row.scientificName}--${row.commonName}`,
      cells: [
        <Link key="bn" href={`/species/${slug}`} prefetch={false}>
          {row.scientificName}
        </Link>,
        <Link key="cn" href={`/species/${slug}`} prefetch={false}>
          {row.commonName}
        </Link>,
        numericCell(
          row.maxHeightTreeId !== null ? (
            <Link key="mh" href={`/trees/${row.maxHeightTreeId}`} prefetch={false}>
              {formatDistance(row.maxHeight, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          row.maxGirthTreeId !== null ? (
            <Link key="mg" href={`/trees/${row.maxGirthTreeId}`} prefetch={false}>
              {distanceSubunit(row.maxGirth, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          row.maxCrownSpreadTreeId !== null ? (
            <Link key="mcs" href={`/trees/${row.maxCrownSpreadTreeId}`} prefetch={false}>
              {formatDistance(row.maxCrownSpread, units)}
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

  // Export link (design-audit item: /export/speciesbyfilters existed but
  // was unlinked). Legacy links this from Views/Browse/Species.cshtml:12
  // as `Export/SpeciesByFilters?BotanicalNameFilter=...&CommonNameFilter=...`
  // -- only the two filter params the route itself reads
  // (app/export/speciesbyfilters/route.ts), matched case-insensitively
  // there, so lowercase param names here are equivalent. `page`/`sort` are
  // not part of that route's contract and are intentionally omitted.
  const exportParams = new URLSearchParams();
  if (botanicalNameFilter) exportParams.set("botanicalNameFilter", botanicalNameFilter);
  if (commonNameFilter) exportParams.set("commonNameFilter", commonNameFilter);
  const exportQuery = exportParams.toString();
  const exportHref = `/export/speciesbyfilters${exportQuery ? `?${exportQuery}` : ""}`;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4">
      <BrowseTabs current="/species" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Species</h1>
        </div>
        <div className="p-4">
          <BrowseGrid
            columns={columns}
            rows={rows}
            basePath="/species"
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
