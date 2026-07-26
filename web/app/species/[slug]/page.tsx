// GET /species/[slug] (+ `?site=`/`?state=` scoping) -- port of
// `BrowseController.SpeciesDetails` (`TMD/Controllers/BrowseController.cs:
// 84-160`) + `TMD/Views/Browse/SpeciesDetails.cshtml` + its 3 grid partials
// (`SpeciesByStateGridPartial`/`SiteSpeciesGridPartial`/`TreesGridPartial`)
// -- task P1-07, doc 03 "P1-05..08", doc 01 §1 (`/species/{slug}` <-
// `/Browse/Species/{bn} ({cn})/Details` + scoped forms, embedded grids page
// size 10, param prefixes `stateSpecies*`/`siteSpecies*`/`trees*`).
//
// Slug resolution (D-011, forward-only per `lib/slug.ts`): re-derives every
// known species' slug and matches (`resolveSpeciesSlug`); 404 when no match
// (covers both a genuinely-unknown slug and the `(Unidentified)` placeholder
// species, which is just another (scientificName, commonName) pair in the
// same lookup domain -- no special-casing needed).
//
// Scoping semantics, transcribed exactly from the controller (read in full
// for this task):
//   - `?site=` implies state scoping too: the controller derives
//     `stateId = siteSpecies.Site.State.Id` from the resolved site,
//     OVERWRITING whatever `?state=` might separately say. A site-scoped
//     page therefore ALWAYS also renders the state-scoped section (in that
//     order: state portlet before site portlet), and any mismatched
//     `?state=` is silently ignored in favor of the site's real state --
//     this is the source of the corpus's ~9 known-mispaired species-site
//     404 artifacts (a `?site=` whose actual state doesn't match a
//     separately-passed `?state=` still resolves to the SITE's real state,
//     so those artifacts 404 only when the species genuinely isn't recorded
//     at that site/state, same as here).
//   - `?state=` alone (no `?site=`) shows only the state-scoped section.
//   - Neither present shows only the global section.
//   - 404 whenever a resolved scope's species lookup comes back empty
//     (`FindMeasuredSpeciesByName{AndStateId,AndSiteId}` returning null in
//     legacy) -- e.g. a `?site=` that exists but has no trees of this
//     species.
//
// Server component; every displayed value goes through `lib/units/format.ts`
// / `components/details/legacy-format.ts`. Markup mirrors the legacy view's
// structure via `components/details/report-table.tsx`'s shared primitives
// (legacy class-name/id conventions as pure structural hooks for
// `parity/extractors/new/species-details.ts` -- no legacy CSS loaded).
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  globalSpeciesMaxima,
  recordedSitesForSpeciesInState,
  recordedStatesForSpecies,
  recordedTreesForSpeciesInSite,
  resolveSpeciesSlug,
  RECORDED_SITES_SORT_KEYS,
  RECORDED_STATES_SORT_KEYS,
  RECORDED_TREES_SORT_KEYS,
  siteSpeciesMaxima,
  sortAndPage,
  stateSpeciesMaxima,
  stateSummary,
  SPECIES_STATE_GRID_PAGE_SIZE,
  type SpeciesMaximaRow,
} from "@/db/queries/species-state-details.sql";
import { siteDetails } from "@/db/queries/details.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { type Units, distanceSubunit, formatDistance } from "@/lib/units/format";
import { ExportDataLink, Portlet, ReportRow, ReportTable } from "@/components/details/report-table";
import { BrowseGrid, type BrowseGridColumn, type BrowseGridRow } from "@/components/grids/browse-grid";
import { formatStateWithCountry, isValidAndSpecifiedFormat } from "@/components/details/legacy-format";

interface SpeciesDetailsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `bool.TryParse` semantics (same convention as the other detail pages). */
function parseBoolParam(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  return undefined;
}

function numberOrUndefined(value: string | undefined): number | undefined {
  return value !== undefined ? Number(value) : undefined;
}

// PERF (design-audit item 1): `resolveSpeciesSlug` re-derives EVERY known
// species' slug (via `measuredSpecies()`, which per-species also runs 3
// correlated MIN(id) subqueries for max height/girth/crown-spread tie-breaks
// this page's slug match doesn't even need -- see this file's report for why
// that narrowing wasn't done here: it lives in `measuredSpecies()`/
// `resolveSpeciesSlug()`, both in `db/queries/**`, out of this task's
// ownership). `generateMetadata` and the page component both call it with the
// same `slug` in the same request; wrapping in React's `cache()` dedupes that
// to a single DB round trip per request instead of two.
const resolveSpeciesSlugCached = cache(resolveSpeciesSlug);

export async function generateMetadata({ params }: SpeciesDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSpeciesSlugCached(slug);
  if (!resolved) return { title: "Species - TreesDb" };
  return { title: `${resolved.scientificName} (${resolved.commonName}) - TreesDb` };
}

/** Max height/girth/crown spread rows, shared by the global/state/site scoped portlets -- each row present only when `IsValidAndSpecified()` (max=0 -> Invalid, omitted; same gate as `app/species/page.tsx`/`app/sites/[id]/page.tsx`'s grid cells). */
function MaximaRows({ maxima, units }: { maxima: SpeciesMaximaRow; units: Units }) {
  return (
    <>
      {isValidAndSpecifiedFormat(maxima.maxHeightInputFormat) && (
        <ReportRow label="Max height" tone="text">
          <Link href={`/trees/${maxima.maxHeightTreeId}`} className="text-link hover:underline">
            {formatDistance(maxima.maxHeight, units)}
          </Link>
        </ReportRow>
      )}
      {isValidAndSpecifiedFormat(maxima.maxGirthInputFormat) && (
        <ReportRow label="Max girth" tone="text">
          <Link href={`/trees/${maxima.maxGirthTreeId}`} className="text-link hover:underline">
            {distanceSubunit(maxima.maxGirth, units)}
          </Link>
        </ReportRow>
      )}
      {isValidAndSpecifiedFormat(maxima.maxCrownSpreadInputFormat) && (
        <ReportRow label="Max crown spread" tone="text">
          <Link href={`/trees/${maxima.maxCrownSpreadTreeId}`} className="text-link hover:underline">
            {formatDistance(maxima.maxCrownSpread, units)}
          </Link>
        </ReportRow>
      )}
    </>
  );
}

export default async function SpeciesDetailsPage({ params, searchParams }: SpeciesDetailsPageProps) {
  const { slug } = await params;
  const resolved = await resolveSpeciesSlugCached(slug);
  if (!resolved) notFound();
  const { scientificName, commonName } = resolved;

  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);

  const sp = await searchParams;
  const siteParam = firstParam(sp.site);
  const stateParamRaw = firstParam(sp.state);

  let siteId: number | undefined;
  if (siteParam !== undefined) {
    siteId = Number(siteParam);
    if (!Number.isInteger(siteId) || siteId <= 0) notFound();
  }

  // PERF (design-audit item 1b): the state scope is only known synchronously
  // up front when there's no `?site=` -- a `?site=` always wins/derives the
  // real state from `siteDetails` (see file header), so that case can't fire
  // its state-scoped queries until `siteIdentity` resolves (2nd wave below).
  // When state IS known up front, fire it in the SAME wave as everything else
  // instead of waiting on it serially.
  let stateIdFromParam: number | undefined;
  if (siteId === undefined && stateParamRaw !== undefined) {
    stateIdFromParam = Number(stateParamRaw);
    if (!Number.isInteger(stateIdFromParam) || stateIdFromParam <= 0) notFound();
  }

  const [global, recordedStatesAll, siteMaxima, siteIdentity, recordedTreesAll, stateMaximaUpfront, stateSumUpfront, recordedSitesAllUpfront] =
    await Promise.all([
      globalSpeciesMaxima(scientificName, commonName),
      // Natural order = State/Site name ascending (`ListMeasuredSpeciesForStatesByName`/
      // `ListMeasuredSpeciesForSitesByNameAndStateId`) -- re-sorted via
      // localeCompare (the `RECORDED_STATES_SORT_KEYS.State`/`RECORDED_SITES_SORT_KEYS.Site`
      // 4th arg), not trusted from the query's own Postgres `ORDER BY`; see
      // `sortAndPage`'s header in `db/queries/species-state-details.sql.ts`.
      recordedStatesForSpecies(scientificName, commonName),
      siteId !== undefined ? siteSpeciesMaxima(scientificName, commonName, siteId) : Promise.resolve(null),
      siteId !== undefined ? siteDetails(siteId) : Promise.resolve(null),
      siteId !== undefined ? recordedTreesForSpeciesInSite(scientificName, commonName, siteId) : Promise.resolve(null),
      stateIdFromParam !== undefined ? stateSpeciesMaxima(scientificName, commonName, stateIdFromParam) : Promise.resolve(null),
      stateIdFromParam !== undefined ? stateSummary(stateIdFromParam) : Promise.resolve(null),
      stateIdFromParam !== undefined ? recordedSitesForSpeciesInState(scientificName, commonName, stateIdFromParam) : Promise.resolve(null),
    ]);

  if (!global) notFound();

  let stateId: number | undefined = stateIdFromParam;
  let stateMaxima = stateMaximaUpfront;
  let stateSum = stateSumUpfront;
  let recordedSitesAll = recordedSitesAllUpfront;

  if (siteId !== undefined) {
    if (!siteMaxima) notFound();
    if (!siteIdentity) notFound();
    stateId = siteIdentity.stateId; // site scoping always wins over/derives state scoping (see file header)
    [stateMaxima, stateSum, recordedSitesAll] = await Promise.all([
      stateSpeciesMaxima(scientificName, commonName, stateId),
      stateSummary(stateId),
      recordedSitesForSpeciesInState(scientificName, commonName, stateId),
    ]);
  }

  if (stateId !== undefined) {
    if (!stateMaxima) notFound();
    if (!stateSum) notFound();
  }

  const currentParams: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(sp)) {
    const v = firstParam(value);
    if (v !== undefined) currentParams[key] = v;
  }

  const recordedStatesGrid = sortAndPage(
    recordedStatesAll,
    RECORDED_STATES_SORT_KEYS,
    {
      page: numberOrUndefined(firstParam(sp.stateSpeciesPage)),
      sort: firstParam(sp.stateSpeciesSort),
      sortAscending: parseBoolParam(firstParam(sp.stateSpeciesSortAsc)),
    },
    RECORDED_STATES_SORT_KEYS.State,
  );

  const recordedSitesGrid =
    stateId !== undefined
      ? sortAndPage(
          recordedSitesAll!,
          RECORDED_SITES_SORT_KEYS,
          {
            page: numberOrUndefined(firstParam(sp.siteSpeciesPage)),
            sort: firstParam(sp.siteSpeciesSort),
            sortAscending: parseBoolParam(firstParam(sp.siteSpeciesSortAsc)),
          },
          RECORDED_SITES_SORT_KEYS.Site,
        )
      : null;

  // No natural-key 4th arg here: this grid's natural order is Height
  // DESCENDING (`ListByNameAndSiteId`, `Order.Desc("Height.Feet")`) -- a
  // numeric column, not a name, so it carries none of the symbol-collation
  // exposure `sortAndPage`'s header documents; the raw SQL `ORDER BY height
  // desc` passthrough is already correct and must not be overridden with an
  // ascending name-based key.
  const recordedTreesGrid =
    siteId !== undefined
      ? sortAndPage(recordedTreesAll!, RECORDED_TREES_SORT_KEYS, {
          page: numberOrUndefined(firstParam(sp.treesPage)),
          sort: firstParam(sp.treesSort),
          sortAscending: parseBoolParam(firstParam(sp.treesSortAsc)),
        })
      : null;

  const statesColumns: BrowseGridColumn[] = [
    { id: "State", header: "State", sortable: true, filterable: false },
    { id: "MaxHeight", header: "Max height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxGirth", header: "Max girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxCrownSpread", header: "Max crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];
  const statesRows: BrowseGridRow[] = recordedStatesGrid.rows.map((r) => ({
    key: r.stateId,
    cells: [
      <Link key="state" href={`/states/${r.stateId}`} className="hover:underline">
        {r.stateName}
      </Link>,
      maximaCell(r.maxHeightInputFormat, r.maxHeightTreeId, formatDistance(r.maxHeight, units)),
      maximaCell(r.maxGirthInputFormat, r.maxGirthTreeId, distanceSubunit(r.maxGirth, units)),
      maximaCell(r.maxCrownSpreadInputFormat, r.maxCrownSpreadTreeId, formatDistance(r.maxCrownSpread, units)),
    ],
  }));

  const sitesColumns: BrowseGridColumn[] = [
    { id: "Site", header: "Site", sortable: true, filterable: false },
    { id: "MaxHeight", header: "Max height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxGirth", header: "Max girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "MaxCrownSpread", header: "Max crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];
  const sitesRows: BrowseGridRow[] =
    recordedSitesGrid?.rows.map((r) => ({
      key: r.siteId,
      cells: [
        <Link key="site" href={`/sites/${r.siteId}`} className="hover:underline">
          {r.siteName}
        </Link>,
        maximaCell(r.maxHeightInputFormat, r.maxHeightTreeId, formatDistance(r.maxHeight, units)),
        maximaCell(r.maxGirthInputFormat, r.maxGirthTreeId, distanceSubunit(r.maxGirth, units)),
        maximaCell(r.maxCrownSpreadInputFormat, r.maxCrownSpreadTreeId, formatDistance(r.maxCrownSpread, units)),
      ],
    })) ?? [];

  const treesColumns: BrowseGridColumn[] = [
    { id: "Height", header: "Height", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "Girth", header: "Girth", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
    { id: "CrownSpread", header: "Crown spread", sortable: true, defaultSortAscending: false, align: "right", filterable: false },
  ];
  const treesRows: BrowseGridRow[] =
    recordedTreesGrid?.rows.map((t) => ({
      key: t.id,
      cells: [
        numericCell(
          isValidAndSpecifiedFormat(t.heightInputFormat) ? (
            <Link key="h" href={`/trees/${t.id}`} className="hover:underline">
              {formatDistance(t.height, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          isValidAndSpecifiedFormat(t.girthInputFormat) ? (
            <Link key="g" href={`/trees/${t.id}`} className="hover:underline">
              {distanceSubunit(t.girth, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
        numericCell(
          isValidAndSpecifiedFormat(t.crownSpreadInputFormat) ? (
            <Link key="c" href={`/trees/${t.id}`} className="hover:underline">
              {formatDistance(t.crownSpread, units)}
            </Link>
          ) : (
            "-"
          ),
        ),
      ],
    })) ?? [];

  const stateLabel = stateSum ? formatStateWithCountry(stateSum.name, stateSum.countryDoubleLetterCode, stateSum.countryTripleLetterCode) : "";

  // Task P1-16 (export link): mirrors `parseSpeciesSegment`'s route-segment
  // shape (`app/export/_lib/species-segment.ts`) in reverse -- legacy's
  // literal `"Export/Species/{botanicalName} ({commonName})"` route
  // template, `encodeURIComponent`-escaped per path segment so a raw
  // space/paren/slash in either name can't be misread as a path separator.
  // This is the GLOBAL (unscoped) export link, matching this portlet's own
  // global maxima -- task brief explicitly calls for `/export/species/
  // {species-segment}`, not a site-/state-scoped variant.
  const exportHref = `/export/species/${encodeURIComponent(`${scientificName} (${commonName})`)}`;

  return (
    /* Layout review 2026-07: meta band + full-width grids -- the shared
       detail-page template (see app/sites/[id]/page.tsx's wrapper note).
       On a fully-scoped view this page's grid column towered 1581px over a
       699px summary column. Extractor constraint: the two "Species within"
       cards MUST stay state-before-site in DOM order
       (parity/extractors/new/species-details.ts assigns .eq(0)=state,
       .eq(1)=site by document order) -- the band below preserves that. */
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4">
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Portlet heading="Species" tabNav={<ExportDataLink href={exportHref} />}>
          <ReportTable>
            <ReportRow label="Botanical name">
              <span className="italic">{scientificName}</span>
            </ReportRow>
            <ReportRow label="Common name">{commonName}</ReportRow>
            <MaximaRows maxima={global} units={units} />
          </ReportTable>
        </Portlet>

        {stateSum && stateMaxima && (
          <Portlet heading={`Species within ${stateLabel}`}>
            <ReportTable>
              <ReportRow label="State" tone="text">
                <Link href={`/states/${stateSum.id}`} className="text-link hover:underline">
                  {stateLabel}
                </Link>
              </ReportRow>
              <MaximaRows maxima={stateMaxima} units={units} />
            </ReportTable>
          </Portlet>
        )}

        {siteIdentity && siteMaxima && (
          <Portlet heading={`Species within ${siteIdentity.name}`}>
            <ReportTable>
              <ReportRow label="Site" tone="text">
                <Link href={`/sites/${siteIdentity.id}`} className="text-link hover:underline">
                  {siteIdentity.name}
                </Link>
              </ReportRow>
              <ReportRow label="Ownership type">{siteIdentity.ownershipType}</ReportRow>
              <ReportRow label="County">{siteIdentity.county}</ReportRow>
              <MaximaRows maxima={siteMaxima} units={units} />
            </ReportTable>
          </Portlet>
        )}
      </div>

      {/* Grids full-width, DEEPEST scope first (IA review: a ?site= URL is
          a declaration of intent -- the visitor came from that site's page
          for its trees, which used to be the LAST portlet). Grid headings
          are each unique, so their order is extractor-safe. */}
      {recordedTreesGrid && siteIdentity && (
        <Portlet heading={`Recorded trees within ${siteIdentity.name}`}>
          <BrowseGrid
            columns={treesColumns}
            rows={treesRows}
            basePath={`/species/${slug}`}
            currentParams={currentParams}
            sortParamName="treesSort"
            sortAscParamName="treesSortAsc"
            pageParamName="treesPage"
            pageIndex={recordedTreesGrid.pageIndex}
            pageSize={SPECIES_STATE_GRID_PAGE_SIZE}
            totalCount={recordedTreesGrid.totalCount}
            filteredCount={null}
          />
        </Portlet>
      )}

      {recordedSitesGrid && (
        <Portlet heading={`Recorded sites within ${stateLabel}`}>
          <BrowseGrid
            columns={sitesColumns}
            rows={sitesRows}
            basePath={`/species/${slug}`}
            currentParams={currentParams}
            sortParamName="siteSpeciesSort"
            sortAscParamName="siteSpeciesSortAsc"
            pageParamName="siteSpeciesPage"
            pageIndex={recordedSitesGrid.pageIndex}
            pageSize={SPECIES_STATE_GRID_PAGE_SIZE}
            totalCount={recordedSitesGrid.totalCount}
            filteredCount={null}
          />
        </Portlet>
      )}

      <Portlet heading="Recorded states">
        <BrowseGrid
          columns={statesColumns}
          rows={statesRows}
          basePath={`/species/${slug}`}
          currentParams={currentParams}
          sortParamName="stateSpeciesSort"
          sortAscParamName="stateSpeciesSortAsc"
          pageParamName="stateSpeciesPage"
          pageIndex={recordedStatesGrid.pageIndex}
          pageSize={SPECIES_STATE_GRID_PAGE_SIZE}
          totalCount={recordedStatesGrid.totalCount}
          filteredCount={null}
        />
      </Portlet>
    </div>
  );
}

// Design-audit item 7: `BrowseGridColumn` (components/grids/browse-grid.tsx,
// not owned by this task) has no per-column className/align hook -- but
// cells are pre-rendered `ReactNode`s built server-side by this page, so
// right-aligning the numeric Max height/girth/crown (and Height/Girth/Crown
// spread) columns is done here, at the cell level, instead.
function numericCell(node: ReactNode): ReactNode {
  return <span className="block text-right tabular-nums">{node}</span>;
}

function maximaCell(inputFormat: number, treeId: number | null, formatted: string) {
  if (!isValidAndSpecifiedFormat(inputFormat) || treeId === null) return numericCell("-");
  return numericCell(
    <Link key="v" href={`/trees/${treeId}`} className="hover:underline">
      {formatted}
    </Link>,
  );
}
