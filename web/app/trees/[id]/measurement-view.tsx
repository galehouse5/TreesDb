"use client";

// Measurement pager (owner design 2026-07, refined from three mockup
// rounds): the tree page's stacked per-measurement portlets are replaced by
// ONE Tree card whose fields swap to the selected measurement, with
// "Measurers" / "Measured on" appended as ordinary-looking fields and a
// quiet chevron pager ("n of N") in the card's lower-right corner. Latest
// measurement is the default; the pager disappears on single-measurement
// trees (the common case).
//
// Parity contract (parity/extractors/new/tree-details.ts):
//  - The Tree card's `table.reports_table` rows are collected WHOLESALE
//    (`toReportRowsExcluding`), so the new Measurers/Measured-on fields and
//    the pager are rendered OUTSIDE that table, in this footer -- plain
//    divs, invisible to the extractor (same posture as ExportDataLink).
//  - `tables[defaultIndex]` is the server-built table from the tree row's
//    own stored-latest values, so the served/SSR HTML is byte-identical to
//    the pre-pager page; older measurements only ever render after a
//    client-side step.
//  - The legacy "Measured on ..." portlets stay in the served DOM (hidden)
//    in app/trees/[id]/page.tsx -- the extractor walks them, users don't.
import { useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MeasurementView({
  tables,
  dates,
  measurers,
  defaultIndex,
}: {
  /** One pre-rendered Tree-card table per measurement, NEWEST first; `tables[defaultIndex]` is the tree row's own stored-latest render. */
  tables: ReactNode[];
  /** Formatted MM/DD/YYYY per measurement, aligned with `tables`. */
  dates: string[];
  /** Concatenated measurer names per measurement, aligned with `tables`. */
  measurers: string[];
  /** Index of the stored-latest measurement (`measured desc, id desc` tie-break -- NOT necessarily index 0 or N-1 of the served list, see page.tsx). */
  defaultIndex: number;
}) {
  const [selected, setSelected] = useState(defaultIndex);
  const count = tables.length;

  return (
    <div>
      {tables[selected]}
      <div className="mt-1 border-t border-border/60 text-sm">
        <div className="flex justify-between gap-3 border-b border-border/60 py-1.5">
          <span className="text-muted-foreground">Measurers</span>
          <span className="text-right">{measurers[selected]}</span>
        </div>
        <div className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-muted-foreground">Measured on</span>
          <span aria-live="polite">
            <Badge className="border-transparent bg-badge font-medium text-badge-foreground">
              {dates[selected]}
            </Badge>
          </span>
        </div>
        {count > 1 && (
          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Newer measurement"
              disabled={selected === 0}
              onClick={() => setSelected((i) => Math.max(0, i - 1))}
              className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <ChevronLeftIcon aria-hidden className="size-4" />
            </button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {selected + 1} of {count}
            </span>
            <button
              type="button"
              aria-label="Older measurement"
              disabled={selected === count - 1}
              onClick={() => setSelected((i) => Math.min(count - 1, i + 1))}
              className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <ChevronRightIcon aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
