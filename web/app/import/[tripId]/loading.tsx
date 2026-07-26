// Suspense fallback shared by every `[tripId]` wizard step (trip, sites,
// trees, review, view) while the step's own `auth()` + trip lookup resolve
// -- one file at this level covers them all, and the step nav rendered by
// this segment's layout.tsx stays mounted above it during the transition.
// See app/import/loading.tsx's rationale (perf audit 2026-07).
export default function ImportTripStepLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-11 border-b border-border bg-secondary" />
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
