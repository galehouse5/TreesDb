// Suspense fallback for `app/states/[id]/page.tsx` while `stateSummary()` +
// `stateSpeciesGrid()` + `sitesForStateGrid()` (several DB round-trips)
// resolve. Purely cosmetic -- not part of parity extraction (extractors read
// the settled page, same convention as `app/species/loading.tsx`/
// `app/species/[slug]/loading.tsx`).
//
// Modeled directly on `app/species/[slug]/loading.tsx`'s PortletSkeleton/
// GridSkeleton primitives (copied verbatim below), shaped to THIS page's own
// portlet stack (read read-only for row counts): left column "State" (10
// `ReportRow`s: Name/Code/RHI5/RHI10/RHI20/RGI5/RGI10/RGI20/Trees measured/
// Last measurement date) + "Species" grid; right column "Location" (2 rows:
// Coordinates/Country) + "Sites" grid.
function ReportRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

function PortletSkeleton({ headingWidth, rows }: { headingWidth: string; rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-secondary px-4 py-2.5">
        <div className={`h-4 ${headingWidth} animate-pulse rounded bg-secondary-foreground/20`} />
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <ReportRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function GridSkeleton({ headingWidth }: { headingWidth: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-secondary px-4 py-2.5">
        <div className={`h-4 ${headingWidth} animate-pulse rounded bg-secondary-foreground/20`} />
      </div>
      <div className="p-4">
        <div className="overflow-hidden rounded-md border border-border">
          <div className="h-10 bg-primary/70" />
          <div className="divide-y divide-border/60">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-muted/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StateDetailsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 md:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <PortletSkeleton headingWidth="w-14" rows={10} />
        <GridSkeleton headingWidth="w-16" />
      </div>
      <div className="min-w-0 space-y-4">
        <PortletSkeleton headingWidth="w-20" rows={2} />
        <GridSkeleton headingWidth="w-12" />
      </div>
    </div>
  );
}
