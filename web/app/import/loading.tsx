// Suspense fallback for `app/import/page.tsx` while `auth()` +
// `listTripsForUser()` resolve (perf audit 2026-07: the import wizard --
// the app's highest-frequency authenticated surface -- had NO loading
// boundaries at all, so every hop blocked on a blank page while the
// read-only browse routes all stream skeletons). Same shape-mimicking
// rationale as app/locations/loading.tsx.
export default function ImportLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-secondary" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-11 border-b border-border bg-secondary" />
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
