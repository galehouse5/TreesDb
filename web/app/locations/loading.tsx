// Suspense fallback for `app/locations/page.tsx` while `browseSites()`
// (a DB round-trip) resolves. Purely cosmetic -- not part of parity
// extraction (extractors read the settled page, doc 07 §5.4). Not
// explicitly named in the task brief's deliverable list (only
// `app/species/loading.tsx` is), but included for UX parity between the
// two grid pages -- within this task's `app/locations/**` ownership.
//
// Design-audit fix: mimics the real page's shape (one card, green header
// row, N grid rows) instead of a single gray slab -- a plain h-96 box reads
// as "something broke" rather than "a table is loading".
//
// UX-quirk fix (tab FOUC): renders the SAME `BrowseTabs` the settled page
// renders (wrapper classes matched to the page's `space-y-4 p-4`) -- the
// page-level tabs otherwise vanish for the duration of every
// locations/species/activity navigation and pop back in with the settled
// page, reading as a flash of the whole tab bar. `current` is static here
// for the same reason it is in page.tsx: this fallback only ever renders
// for its own route.
import { BrowseTabs } from "@/components/chrome/browse-tabs";

export default function LocationsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-4">
      <BrowseTabs current="/locations" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Locations</h1>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
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
