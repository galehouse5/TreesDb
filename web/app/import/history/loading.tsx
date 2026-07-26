// Suspense fallback for `app/import/history/page.tsx` -- see
// app/import/loading.tsx's rationale (perf audit 2026-07).
export default function ImportHistoryLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-secondary" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-11 border-b border-border bg-secondary" />
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
