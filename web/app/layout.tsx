import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ChevronDownIcon } from "lucide-react";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { readUnitsPreference, UNITS_NAMES, unitsToName } from "@/lib/units/cookie";
import { SearchWidget } from "@/components/search/search-widget";
import { NavLink } from "@/components/chrome/nav-link";
import { SiteFooter } from "@/components/chrome/site-footer";
import { UnitsSelect } from "@/components/chrome/units-select";
import { Wordmark } from "@/components/chrome/wordmark";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TreesDb - a registry of measured trees",
  description:
    "A public registry of measured trees: browse sites, species, and champions, or view them on a map.",
};

// P1-01 nav: Map / Browse / Import / Account (docs/migration/03-phase1-readonly.md).
// "Search" was dropped from the nav (owner request 2026-07-19): the header
// search widget on every page already covers the entry point, so the link
// was redundant. /search itself still exists and serves results.
const NAV_ITEMS = [
  { href: "/map", label: "Map" },
  { href: "/locations", label: "Browse" },
  { href: "/import", label: "Import" },
  { href: "/account", label: "Account" },
] as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const currentUnits = unitsToName(readUnitsPreference(cookieStore));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Brand header: legacy treesdb.org's forest-green bar + the legacy
            wordmark, in which a conifer stands in place of the initial "t"
            of a lowercase "trees database" (TMD/images/Theme/title.png;
            traced geometry in lib/brand/wordmark.ts). Inline SVG rather
            than /tree-icon.png so it scales with the type, survives
            high-DPI/print/forced-colors, and needs no brightness-0/invert
            filter to go white. `leading-[0]` on the Link too: it's a flex
            item, and without it the link's own strut re-adds ~5px of
            descent under the wordmark. */}
        <header className="bg-primary text-primary-foreground shadow-sm">
          {/* Header-balance v2 (2026-07): symmetric py-2.5 -- the earlier
              asymmetric pt-1.5/pb-3 compensated for the 2.06em wordmark box
              but pushed the nav pills and search field ~3px above the bar's
              optical center. With the tree y-squashed to 1.71em
              (lib/brand/wordmark.ts's TREE_Y_SCALE) the 36px search input
              governs the row height instead, so plain centering is correct
              for everything at once. The after:* overlay keeps a ≥44px hit
              target on the shorter mark (WCAG 2.5.5). */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-4 py-2.5">
            <Link
              href="/map"
              aria-label="Trees database"
              className="relative rounded-sm leading-[0] text-lg after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Wordmark />
            </Link>
            <nav aria-label="Primary" className="order-last flex w-full items-center gap-1 sm:order-none sm:w-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <SearchWidget />
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        {/* SiteFooter hides this on /map (legacy parity: the map page is
            footerless so the map gets the full viewport). */}
        <SiteFooter>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground">
            {/* Legacy footer parity (design-audit): treesdb.org's footer on
                every non-map page carries a "Community Forum" and a
                "Website Technical Help" link alongside the copyright line
                (TMD/Views/Shared/_Layout.cshtml). Grouped into one flex row
                with the copyright text so they read as one footer block. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p>
                &copy; {new Date().getFullYear()} TreesDb - a registry of measured trees
              </p>
              <span aria-hidden="true" className="text-muted-foreground/40">
                &bull;
              </span>
              <a
                href="http://ents-bbs.org/viewforum.php?f=15"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline"
              >
                Community Forum
              </a>
              <span aria-hidden="true" className="text-muted-foreground/40">
                &bull;
              </span>
              <a href="mailto:treesdb.org@gmail.com" className="text-link hover:underline">
                Website Technical Help
              </a>
            </div>
            {/* Posts to app/api/units/route.ts, which sets the unitsPreference
                cookie and redirects back to the referring page (falls back
                to /map). Plain <form> so it works without client JS. */}
            <form
              action="/api/units"
              method="post"
              className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1 sm:w-auto sm:justify-start"
            >
              <label htmlFor="units" className="text-xs uppercase tracking-wide">
                Units
              </label>
              <span className="relative inline-flex items-center">
                {/* UnitsSelect (design-audit): auto-submits the form on
                    change via form.requestSubmit(), so picking a unit is one
                    interaction again (legacy: one-click ft|m|yd links) --
                    the Save button below remains the no-JS fallback and the
                    action/method/option values are unchanged. */}
                <UnitsSelect
                  id="units"
                  name="units"
                  defaultValue={currentUnits}
                  className="h-8 appearance-none rounded-md border border-input bg-transparent pl-2 pr-7 text-sm"
                >
                  {UNITS_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </UnitsSelect>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1.5 size-4 text-muted-foreground"
                />
              </span>
              <Button type="submit" size="sm" variant="outline">
                Save
              </Button>
            </form>
          </div>
        </footer>
        </SiteFooter>
      </body>
    </html>
  );
}
