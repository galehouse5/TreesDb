"use client";

// Header nav link with active-route styling (design-audit item 2). Client
// component (needs usePathname()) so app/layout.tsx -- itself a server
// component -- can render the shared brand header while still highlighting
// the current section. NAV_ITEMS text/hrefs live in layout.tsx; this only
// owns the active-match + pill styling.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** True when `pathname` is exactly `base` or nested under it (`base/...`). */
function matchesPrefix(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Active-route rule per nav item (design-audit item 2):
 *   /map       -- exact only (never active for a hypothetical /map/*)
 *   /locations -- also active for /sites/*, /states/*, /species/*, /trees/*,
 *                 /activity/* (all "Browse" entity families -- see
 *                 components/chrome/browse-tabs.tsx -- even though only
 *                 /locations itself is linked from the header nav)
 *   otherwise  -- ordinary prefix match (/import, /account)
 * /search has no nav item (header search widget is the entry point), so no
 * pill is active while on search results -- intentional.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/map") return pathname === "/map";
  if (href === "/locations") {
    return (
      matchesPrefix(pathname, "/locations") ||
      matchesPrefix(pathname, "/sites") ||
      matchesPrefix(pathname, "/states") ||
      matchesPrefix(pathname, "/species") ||
      matchesPrefix(pathname, "/trees") ||
      matchesPrefix(pathname, "/activity")
    );
  }
  return matchesPrefix(pathname, href);
}

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        // sm:h-9 (was h-8): one control height with the 36px search input,
        // so the header row has a single vertical rhythm (header-balance
        // review 2026-07).
        "h-10 rounded-full sm:h-9",
        active
          ? "bg-white/15 text-primary-foreground font-semibold"
          : "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
      )}
    >
      {children}
    </Link>
  );
}
