// Suspense fallback for `app/trees/[id]/page.tsx` while `treeDetails()` (a
// DB round-trip) resolves. Purely cosmetic -- not part of parity extraction
// (extractors read the settled page, same convention as
// `app/species/loading.tsx`/`app/species/[slug]/loading.tsx`).
//
// Modeled directly on `app/species/[slug]/loading.tsx`'s PortletSkeleton
// primitive (copied verbatim below; this page has no grid, so
// `GridSkeleton` isn't needed), shaped to THIS page's own portlet stack
// (read read-only for row counts): left column "Tree" (14 `ReportRow`s:
// Botanical name/Common name/Height/Height measurement method/Girth/Crown
// spread/ENTSPTS2/ENTSPTS/TDI3/TDI2/Champion points/Diameter/Conical
// volume/General comments) + one representative "Measured on ..."
// portlet -- the real count varies per tree (one per measurement visit),
// same "representative default shape" call `app/species/[slug]/loading.tsx`
// itself makes for content whose size isn't known until the page resolves;
// right column "Location" (5 rows: Coordinates/Site/Ownership type/County/
// State) + "Photos" (represented with the same row primitive --
// `PhotoSummaryTable`'s actual gallery/badge columns aren't worth modeling
// pixel-for-pixel in a loading skeleton).
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

export default function TreeDetailsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 md:grid-cols-2">
      <div className="min-w-0 space-y-4">
        <PortletSkeleton headingWidth="w-28" rows={14} />
        <PortletSkeleton headingWidth="w-40" rows={4} />
      </div>
      <div className="min-w-0 space-y-4">
        <PortletSkeleton headingWidth="w-20" rows={5} />
        <PortletSkeleton headingWidth="w-16" rows={3} />
      </div>
    </div>
  );
}
