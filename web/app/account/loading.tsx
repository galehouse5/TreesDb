// Suspense fallback for `app/account/page.tsx` while `auth()` +
// `findUserById()` resolve -- see app/import/loading.tsx's rationale
// (perf audit 2026-07).
export default function AccountLoading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-11 border-b border-border bg-secondary" />
          <div className="space-y-3 p-6">
            <div className="h-9 animate-pulse rounded-md bg-muted/40" />
            <div className="h-9 animate-pulse rounded-md bg-muted/40" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
