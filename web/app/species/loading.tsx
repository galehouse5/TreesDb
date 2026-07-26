// Suspense fallback for `app/species/page.tsx` while `browseSpecies()`
// (a DB round-trip) resolves. Purely cosmetic -- not part of parity
// extraction (extractors read the settled page, doc 07 §5.4).
//
// Design-audit fix: this used to be a single `h-96` gray slab -- the exact
// anti-pattern `app/locations/loading.tsx`'s own comment calls out ("a
// plain h-96 box reads as 'something broke' rather than 'a table is
// loading'"). Rebuilt on that same shape (one card, green header row, N
// grid rows), with the filter-row count adjusted from locations' 3 down to
// 2 -- `app/species/page.tsx`'s columns array marks only BotanicalName and
// CommonName `filterable: true` (Max height/girth/crown spread aren't).
// UX-quirk fix (tab FOUC): same rationale as app/locations/loading.tsx --
// keep the tab bar present through the navigation so it doesn't flash.
import { BrowseTabs } from "@/components/chrome/browse-tabs";

export default function SpeciesLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4">
      <BrowseTabs current="/species" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Species</h1>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded-md bg-muted sm:w-44" />
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <div className="h-10 bg-primary/70" />
              <div className="divide-y divide-border/60">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse bg-muted/40" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
