// Suspense fallback for `app/activity/page.tsx` while `recentTrips()` /
// `measurerActivity()` (DB round-trips) resolve. Purely cosmetic, mirroring
// `app/locations/loading.tsx`'s rationale (including its tab-FOUC note).
import { BrowseTabs } from "@/components/chrome/browse-tabs";

export default function ActivityLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4">
      <BrowseTabs current="/activity" />
      {/* One card mirroring the settled page: "Recent trips" is the page's
          only content (and its h1) since the measurer-activity table's
          removal -- see app/activity/page.tsx's header. */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Recent trips</h1>
        </div>
        <div className="h-96 animate-pulse bg-muted/40 p-4" />
      </div>
    </div>
  );
}
