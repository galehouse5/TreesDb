// Design-audit item: legacy treesdb.org's "Browse" nav is a dropdown with
// three entries (Activity, Locations, Species; TMD/Views/Shared/_Layout.cshtml).
// In the new app /species and /activity were orphans -- nothing links to them
// (the header's single "Browse" pill only ever points at /locations). This
// segmented tab bar restores that three-way cross-navigation, rendered above
// each of the three pages' own heading/grid so it never touches the
// parity-tested grid/table containers below it.
//
// Server component: unlike components/chrome/nav-link.tsx (which needs
// usePathname() because app/layout.tsx can't know which child route is
// about to render), each page that renders BrowseTabs already knows its own
// route statically, so it just passes `current` as a prop -- no client JS
// needed here.
import Link from "next/link";
import { cn } from "@/lib/utils";

const BROWSE_TABS = [
  { href: "/locations", label: "Locations" },
  { href: "/species", label: "Species" },
  { href: "/activity", label: "Activity" },
] as const;

export type BrowseTab = (typeof BROWSE_TABS)[number]["href"];

export function BrowseTabs({ current }: { current: BrowseTab }) {
  return (
    <nav aria-label="Browse" className="flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1">
      {BROWSE_TABS.map((tab) => {
        const active = tab.href === current;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
