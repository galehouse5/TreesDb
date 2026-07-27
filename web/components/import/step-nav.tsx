"use client";

// Branded wizard step indicator for app/import/[tripId]/layout.tsx.
// Presentation only: renders the exact same four <Link>s
// (/import/{tripId}/trip|sites|trees|review) the plain-text nav rendered
// before this restyle -- navigation semantics (real links, no click
// interception, no actual disabling) are unchanged. This is a client
// component only because determining which step is "current" needs the
// live pathname (usePathname), which a Server Component layout has no way
// to read for its own not-yet-rendered child route -- everything else in
// the wizard stays a Server Component per docs/design/BRAND.md's
// constraint.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarIcon, CheckIcon, ClipboardCheckIcon, MapPinIcon, TreePineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { slug: "trip", label: "Trip", Icon: CarIcon },
  { slug: "sites", label: "Sites", Icon: MapPinIcon },
  { slug: "trees", label: "Trees", Icon: TreePineIcon },
  { slug: "review", label: "Review", Icon: ClipboardCheckIcon },
] as const;

export function StepNav({ tripId }: { tripId: number }) {
  const pathname = usePathname();
  const currentSlug = pathname?.split("/")[3];
  const currentIndex = STEPS.findIndex((step) => step.slug === currentSlug);

  return (
    <nav aria-label="Import wizard steps" className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = currentIndex >= 0 && index < currentIndex;
          const isFuture = currentIndex >= 0 && index > currentIndex;
          const StepIcon = step.Icon;

          return (
            <li key={step.slug} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
              <Link
                href={`/import/${tripId}/${step.slug}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md text-sm font-medium transition-colors",
                  isCurrent && "text-primary",
                  isCompleted && "text-foreground hover:text-primary",
                  isFuture && "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary/10 text-primary",
                    isFuture && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="size-3.5" aria-hidden />
                  ) : (
                    <>
                      <StepIcon className="hidden size-3.5 sm:block" aria-hidden />
                      <span aria-hidden className="sm:hidden">{index + 1}</span>
                    </>
                  )}
                </span>
                {/* sr-only, not hidden, below sm: `hidden` removed the label
                    from the accessibility tree too, leaving the wizard's only
                    navigation as four nameless links on phones (WCAG 2.4.4 /
                    4.1.2 -- UX audit 2026-07). */}
                <span className="sr-only sm:not-sr-only">{step.label}</span>
              </Link>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("mx-2 h-px flex-1 sm:mx-3", isCompleted ? "bg-primary/50" : "bg-border")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      {currentIndex >= 0 ? (
        <p className="mt-2 text-center text-sm font-medium text-primary sm:hidden">
          Step {currentIndex + 1} of {STEPS.length}: {STEPS[currentIndex].label}
        </p>
      ) : null}
    </nav>
  );
}
