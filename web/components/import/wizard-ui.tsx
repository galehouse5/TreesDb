// Shared presentational primitives for the import-wizard brand restyle.
// Styling only -- no data/behavior. Kept local to components/import/**
// rather than touching the shared components/ui/** / components/details/**
// primitives used elsewhere in the app (browse/detail pages, etc.), since
// this restyle's scope is exclusively the import wizard (see task brief).
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Amber "data value" pill -- docs/design/BRAND.md's detail-row idiom
 * (label muted, value rendered as an amber `bg-badge` pill) applied to the
 * Review step's read-only summary rows and History's imported-date column.
 * Always wraps EXISTING rendered text -- never introduces new copy, so it
 * stays presentation-only.
 */
export function DataBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-badge px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-badge-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Muted/neutral pill -- same shape as DataBadge, used for not-yet-imported
 * ("draft") state text so drafts read as visually distinct from finished,
 * dated imports (amber) without inventing any new label text. */
export function MutedBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Green-tinted card-header-strip classes (BRAND.md: "card-header strip
 * (semibold green-tinted heading)") -- applied via className on the shared
 * CardHeader/CardTitle primitives (components/ui/card.tsx) rather than
 * forking them, so every other page using that shared component is
 * unaffected by this wizard-only restyle. */
export const SECTION_HEADER_CLASS = "border-b bg-primary/5";
export const SECTION_TITLE_CLASS = "text-primary";

/**
 * Shared native `<select>` styling (code-audit finding: `app/import/
 * [tripId]/sites/page.tsx`'s state select and `tree-form.tsx`'s
 * `selectClassName` were hand-copying the same long class string). This is
 * the SUPERSET of the two -- it includes the `aria-invalid:*` variants
 * `tree-form.tsx`'s selects never used (none of them set `aria-invalid`, so
 * those variants simply never match there) alongside the plain
 * `border-input`/`focus-visible:*` styling both already shared. One
 * constant, one visual result either way.
 */
export const NATIVE_SELECT_CLASS_NAME =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30";
