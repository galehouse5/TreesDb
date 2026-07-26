"use client";

/**
 * Shared client grid for the Locations (`/locations`) and Species
 * (`/species`) browse pages (task P1-03/P1-04, doc 03 "P1-03/04"): header
 * sort toggles + filter inputs update the URL searchParams via
 * `router.replace`; page size + rows themselves are fully server-resolved
 * (`db/queries/browse-grids.sql.ts`) and passed in as props, this component
 * only ever *navigates*, it never re-sorts, re-filters, or re-paginates
 * client-side.
 *
 * (Perf audit 2026-07: originally rendered through @tanstack/react-table in
 * fully-manual mode -- `manualSorting/Filtering/Pagination` all true --
 * where the library reduced to an identity map over these pre-rendered
 * rows. Replaced with plain `columns.map()`/`rows.map()`, dropping
 * ~13-20KB gzip from the client chunk shared by every browse surface.
 * `prefetch={false}` on the sort/pager links for the same reason the row
 * links carry it: with default prefetch, every grid link entering the
 * viewport fired a full dynamic RSC render server-side -- 114 requests on
 * one /states/{id} view.)
 *
 * IMPORTANT: `columns`/`rows` below carry only plain, RSC-serializable
 * data (strings/booleans/already-rendered `ReactNode`s) -- NOT per-column
 * render *functions*. An earlier version of this component took a
 * `cell: (row) => ReactNode` callback per column, which crashed at runtime
 * ("Functions cannot be passed directly to Client Components") the moment
 * a real page tried it: this file is a Client Component, and the pages
 * that use it (`app/locations/page.tsx`, `app/species/page.tsx`) are
 * Server Components, so props crossing that boundary must survive React's
 * Flight serialization. A `React.ReactNode` produced by calling
 * `<Link>...</Link>` etc. server-side IS serializable (it's a plain
 * element descriptor); a closure is not. So the pages pre-render every
 * cell (and column metadata is plain data) and this component just lays
 * the already-built pieces out.
 *
 * Interaction semantics are transcribed from the legacy grid partials'
 * generated markup/links (`TMD/Extensions/DataTablesGrid.cs`
 * `DataTablesGridModel`/`DataTablesGridRenderer`, read in full for this
 * task) so the resulting URLs behave identically to clicking a legacy
 * grid's sort header / submitting its filter row / paging:
 *   - Sort header click (`GetSortUrl`, DataTablesGrid.cs:304-320): keeps
 *     every other current query param (including `page` -- legacy does
 *     NOT reset paging on sort!), and sets `sort`=this column's id,
 *     `sortAsc`=toggled-current-direction if this column was already
 *     active, else the column's own `defaultSortAscending`.
 *   - Filter row submit (`GetFilterUrl`/hidden sort fields,
 *     DataTablesGrid.cs:340-343,398-409): a real `<form method="get">`
 *     targeting the bare path, so it drops any query param that isn't one
 *     of the form's own fields -- concretely: drops `page` (form has no
 *     page field), keeps `sort`/`sortAsc` (rendered as hidden inputs only
 *     when currently present), and submits every filterable column's
 *     current value (even unchanged/blank ones, since it's one form).
 *     This component reproduces the same drop/keep/submit-all-together
 *     shape via `router.replace`, not an actual native form GET.
 *   - Pager links (`GetPageUrl`, DataTablesGrid.cs:322-332): keep every
 *     other current query param, set `page`=target index.
 *   - Pager text/enabled state (`DataTablesGridRenderer.RenderPager`,
 *     DataTablesGrid.cs:477-517): reproduced verbatim in `pageInfoText`/
 *     `hasPreviousPage`/`hasNextPage` below -- this is exactly what
 *     `parity/extractors/new/{locations,species}-grid.ts` (via the
 *     reused `parity/extractors/legacy/dom-helpers.ts` `parseGrid`) reads
 *     back out for comparison against the legacy extractor's JSON.
 *
 * Markup deliberately reuses the legacy grid's own class-name
 * conventions (`dataTablesGrid` / `display` / `sortable` /
 * `sorting_asc`/`sorting_desc` / `dataTables_info` /
 * `paginate_enabled_previous`/`paginate_enabled_next`) ALONGSIDE real
 * Tailwind utility classes -- purely so `parity/extractors/new/*.ts` can
 * import and reuse `parity/extractors/legacy/dom-helpers.ts`'s
 * `parseGrid` unmodified instead of re-implementing an equivalent parser
 * (no legacy CSS is loaded; these classes carry no styling here).
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Plain column metadata -- no render function (see file header). */
export interface BrowseGridColumn {
  /** Legacy `DataTablesGridColumnModel.ColumnName` -- exact case, compared case-insensitively against the `sort` param (`IsSorted`), and used verbatim as the `sort` value this header's link sets. */
  id: string;
  header: string;
  sortable: boolean;
  /** `DataTablesGridColumnModel.DefaultSortAscending` -- defaults `true` (DataTablesGrid.cs:356) unless the legacy column builder passed `defaultSortAscending: false`. */
  defaultSortAscending?: boolean;
  /**
   * "right" for number-like columns (owner pick 2026-07 after a 4-way
   * screenshot comparison): header text and values share one right edge so
   * magnitudes stack digit-over-digit (best on unitless decimals like the
   * RHI/RGI grids), and the sort chevron renders on the LEFT of a
   * right-aligned header so the header TEXT -- not the icon -- sits on the
   * shared edge. (Legacy aligned grid columns all-left with no numeric
   * special-casing; the original port's left-headers-over-right-values
   * mismatch is what kicked this off.) Cells are pre-rendered by the pages
   * (see the file header) -- pages right-align their own cell content via
   * their numericCell helpers; this flag only aligns the HEADER.
   */
  align?: "right";
  filterable: boolean;
  /** Required when `filterable` -- the query-string key this column's filter input writes/reads (e.g. `"siteFilter"`). */
  filterParamName?: string;
  filterPlaceholder?: string;
}

/** A pre-rendered row: `cells[i]` corresponds to `columns[i]` (same order/length). */
export interface BrowseGridRow {
  key: string | number;
  cells: React.ReactNode[];
}

export interface BrowseGridProps {
  columns: BrowseGridColumn[];
  rows: BrowseGridRow[];
  /** Current pathname with no query string, e.g. `"/locations"`. */
  basePath: string;
  /** Every current query-string entry as already-decoded strings (from the server page's resolved `searchParams`). */
  currentParams: Record<string, string | undefined>;
  sortParamName?: string;
  sortAscParamName?: string;
  pageParamName?: string;
  /** 0-based, matching legacy `PageIndex`. */
  pageIndex: number;
  pageSize: number;
  /** Legacy `TotalEntitiesCount` -- the grand total, unaffected by filters. */
  totalCount: number;
  /** Legacy `FilteredEntitiesCount` -- `null` when no filter is currently applied. */
  filteredCount: number | null;
}

/** `bool.TryParse` semantics: exact case-insensitive "true"/"false"; anything else (incl. absent) -> not-parsed. */
function parseLooseBool(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return null;
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) usp.set(key, value);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export function BrowseGrid({
  columns,
  rows,
  basePath,
  currentParams,
  sortParamName = "sort",
  sortAscParamName = "sortAsc",
  pageParamName = "page",
  pageIndex,
  pageSize,
  totalCount,
  filteredCount,
}: BrowseGridProps) {
  const router = useRouter();

  const currentSortRaw = currentParams[sortParamName];
  // DataTablesGridModel.SortAscending (DataTablesGrid.cs:232-249): absent/unparseable -> true.
  const currentAscending = parseLooseBool(currentParams[sortAscParamName]) ?? true;

  const sortHref = React.useCallback(
    (column: BrowseGridColumn): string => {
      const isActive = currentSortRaw !== undefined && currentSortRaw.toLowerCase() === column.id.toLowerCase();
      const nextAscending = isActive ? !currentAscending : (column.defaultSortAscending ?? true);
      const next: Record<string, string | undefined> = {
        ...currentParams,
        [sortParamName]: column.id,
        [sortAscParamName]: String(nextAscending),
      };
      return `${basePath}${buildQueryString(next)}`;
    },
    [basePath, currentAscending, currentParams, currentSortRaw, sortAscParamName, sortParamName],
  );

  const pageHref = React.useCallback(
    (targetPageIndex: number): string => {
      const next: Record<string, string | undefined> = { ...currentParams, [pageParamName]: String(targetPageIndex) };
      return `${basePath}${buildQueryString(next)}`;
    },
    [basePath, currentParams, pageParamName],
  );

  const filterableColumns = columns.filter((c) => c.filterable);
  const [pendingFilters, setPendingFilters] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const c of filterableColumns) {
      if (c.filterParamName) initial[c.filterParamName] = currentParams[c.filterParamName] ?? "";
    }
    return initial;
  });

  function submitFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Legacy's filter form (GetFilterUrl -> bare Path) drops `page` and
    // keeps `sort`/`sortAsc` only if they were already present -- see the
    // file header note on DataTablesGrid.cs:340-343/398-409.
    const next: Record<string, string | undefined> = {};
    if (currentSortRaw !== undefined) next[sortParamName] = currentSortRaw;
    if (currentParams[sortAscParamName] !== undefined) next[sortAscParamName] = currentParams[sortAscParamName];
    for (const [key, value] of Object.entries(pendingFilters)) {
      if (value) next[key] = value;
    }
    // scroll: false (also on the sort/pager Links below): these
    // navigations re-render the same page with the grid re-sorted/paged/
    // filtered -- jumping to the top on every click made an embedded grid
    // (e.g. the species grid partway down /states/{id}) feel like a full
    // page load and lost the user's place.
    router.replace(`${basePath}${buildQueryString(next)}`, { scroll: false });
  }

  // DataTablesGridRenderer.RenderPager (DataTablesGrid.cs:477-517), verbatim.
  const effectiveCount = filteredCount ?? totalCount;
  const pageInfoText =
    effectiveCount < 1
      ? "No entries"
      : `Showing ${Math.min(pageIndex * pageSize + 1, effectiveCount)} to ${Math.min(
          (pageIndex + 1) * pageSize,
          effectiveCount,
        )} of ${effectiveCount} entries` + (filteredCount !== null ? ` (filtered from ${totalCount} total entries)` : "");
  const hasPreviousPage = pageIndex >= 1;
  const hasNextPage = (pageIndex + 1) * pageSize < effectiveCount;
  const pageCount = Math.max(1, Math.ceil(effectiveCount / pageSize));

  return (
    <div className="dataTablesGrid space-y-3">
      {filterableColumns.length > 0 && (
        <form onSubmit={submitFilters} className="flex flex-wrap items-end gap-2">
          {filterableColumns.map((column) => (
            <div key={column.id} className="flex min-w-[45%] flex-1 flex-col gap-1 sm:min-w-0 sm:flex-none">
              <label htmlFor={`filter-${column.id}`} className="text-xs font-medium text-muted-foreground">
                {column.header}
              </label>
              <Input
                id={`filter-${column.id}`}
                type="text"
                value={column.filterParamName ? (pendingFilters[column.filterParamName] ?? "") : ""}
                placeholder={column.filterPlaceholder}
                onChange={(e) =>
                  column.filterParamName &&
                  setPendingFilters((prev) => ({ ...prev, [column.filterParamName as string]: e.target.value }))
                }
                className="w-full bg-card sm:w-44"
              />
            </div>
          ))}
          <Button type="submit" size="sm" variant="default" className="self-end">
            Filter
          </Button>
        </form>
      )}

      <div className="relative overflow-hidden rounded-md border border-border shadow-[inset_-12px_0_8px_-8px_rgba(0,0,0,0.15)] sm:shadow-none">
        <Table className="display">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              {columns.map((column, headerIndex) => {
                // The leftmost column is the grid's anchor (and sticky) --
                // it always renders left/left with the chevron on the
                // right, even when its data is numeric (owner rule
                // 2026-07; only the species page's Height-first trees grid
                // hits this today). Cells get the matching override below.
                const align = headerIndex === 0 ? undefined : column.align;
                const isActive =
                  currentSortRaw !== undefined && currentSortRaw.toLowerCase() === column.id.toLowerCase();
                const sortState: "asc" | "desc" | "none" = isActive
                  ? currentAscending
                    ? "asc"
                    : "desc"
                  : "none";
                return (
                  <TableHead
                    key={column.id}
                    aria-sort={sortState === "asc" ? "ascending" : sortState === "desc" ? "descending" : undefined}
                    className={cn(
                      "bg-primary text-primary-foreground first:rounded-tl-md last:rounded-tr-md",
                      column.sortable && "sortable",
                      sortState === "asc" && "sorting_asc",
                      sortState === "desc" && "sorting_desc",
                      headerIndex === 0 && "sticky left-0 z-10",
                    )}
                  >
                    {column.sortable ? (
                      (() => {
                        const sortIcon =
                          sortState === "asc" ? (
                            <ChevronUp aria-hidden className="size-3.5" />
                          ) : sortState === "desc" ? (
                            <ChevronDown aria-hidden className="size-3.5" />
                          ) : (
                            <ChevronsUpDown aria-hidden className="size-3.5 opacity-40" />
                          );
                        return (
                          <Link
                            href={sortHref(column)}
                            scroll={false}
                            prefetch={false}
                            className={cn(
                              "flex min-h-10 items-center gap-1 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                              align === "right" && "justify-end",
                            )}
                          >
                            {/* Chevron LEFT of a right-aligned header so the
                                header text shares the values' right edge
                                (real JSX order, so a11y reads label last
                                consistently with the visual order). */}
                            {align === "right" && sortIcon}
                            <span>{column.header}</span>
                            {align !== "right" && sortIcon}
                          </Link>
                        );
                      })()
                    ) : (
                      <span className={cn(align === "right" && "block text-right")}>{column.header}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.key} className={cn(rowIndex % 2 === 1 && "bg-muted/40")}>
                {row.cells.map((cell, cellIndex) => (
                  <TableCell
                    key={`${row.key}-${columns[cellIndex]?.id ?? cellIndex}`}
                    className={cn(
                      "[&_a]:text-link [&_a]:hover:underline",
                      cellIndex === 0 && "sticky left-0 z-10 [&_span.tabular-nums]:text-left",
                      // Sticky cells need an OPAQUE backdrop (the row
                      // scrolls beneath them), but plain bg-muted read
                      // visibly darker than the row's bg-muted/40 --
                      // color-mix reproduces the exact blended zebra shade
                      // (visual review 2026-07).
                      cellIndex === 0 &&
                        (rowIndex % 2 === 1
                          ? "bg-[color-mix(in_oklab,var(--muted)_40%,var(--card))]"
                          : "bg-card"),
                    )}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pager restyle (owner design 2026-07): chevrons + "X of Y", the
          same quiet idiom as the tree page's measurement pager. Parity
          contract (parity/extractors/legacy/dom-helpers.ts parseGrid):
          `div.dataTables_info`'s TEXT is compared verbatim (so the legacy
          "Showing X to Y of Z entries" sentence stays, unchanged), and
          pager state is read from the PRESENCE of
          `a.paginate_enabled_previous`/`_next` -- the anchors keep those
          classes; their inner text ("Previous"/"Next") was never extracted,
          so icons + aria-labels are safe. The "X of Y" counter is new,
          unextracted markup. */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="dataTables_info">{pageInfoText}</div>
        <div className="dataTables_paginate flex items-center gap-2">
          {hasPreviousPage ? (
            <Link
              href={pageHref(pageIndex - 1)}
              scroll={false}
              prefetch={false}
              aria-label="Previous page"
              className="paginate_enabled_previous inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="paginate_disabled_previous inline-flex size-9 cursor-not-allowed items-center justify-center rounded-md border border-transparent bg-muted text-muted-foreground/50"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </span>
          )}
          {pageCount > 1 && (
            <span className="text-xs tabular-nums">
              {pageIndex + 1} of {pageCount}
            </span>
          )}
          {hasNextPage ? (
            <Link
              href={pageHref(pageIndex + 1)}
              scroll={false}
              prefetch={false}
              aria-label="Next page"
              className="paginate_enabled_next inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="paginate_disabled_next inline-flex size-9 cursor-not-allowed items-center justify-center rounded-md border border-transparent bg-muted text-muted-foreground/50"
            >
              <ChevronRight aria-hidden className="size-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
