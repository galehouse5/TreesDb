// Suspense fallback for `app/species/[slug]/page.tsx` while the slug
// resolution + maxima/grid queries (several DB round-trips, see that page's
// PERF comments) resolve. Purely cosmetic -- not part of parity extraction
// (extractors read the settled page, same convention as
// `app/species/loading.tsx`/`app/locations/loading.tsx`).
//
// Design-audit fix: mimics the real page's two-column card layout (left:
// "Species" portlet + a possible state/site-scoped portlet, both
// `reports_table` label/value rows; right: "Recorded states/sites/trees"
// grids) instead of a single gray slab -- since scoping (`?site=`/`?state=`)
// isn't known until the page itself resolves, this renders a representative
// default shape (two stacked card shells on the left, a grid shell on the
// right) rather than trying to predict which portlets/grids will appear.
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

export default function SpeciesDetailsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 md:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <PortletSkeleton headingWidth="w-20" rows={5} />
        <PortletSkeleton headingWidth="w-48" rows={4} />
      </div>
      <div className="min-w-0 space-y-4">
        <GridSkeleton headingWidth="w-32" />
      </div>
    </div>
  );
}
