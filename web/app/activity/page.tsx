// Port of `BrowseController.Activity` / `TMD/Views/Browse/Activity.cshtml`
// + `_RecentTrips.cshtml` (task P1-13, doc 03 "P1-13", doc 01 §1: legacy
// `/Browse/Activity` -> new `/activity` -- doc 03's URL table has no
// explicit row for this page yet; a row was added there alongside this
// file, see that doc's diff).
//
// "Recent trips" table: transcribed 1:1 from `_RecentTrips.cshtml` --
// Date (`{0:MM/dd/yyyy}`), Site (link to site details), County (plain
// text), State (link to state details), Measurers (`ConcatenatedNames`
// display template: 1 name verbatim, 2 names "A and B", 3+ names
// "A, B, and C"). Data source: `db/queries/activity.sql.ts`'s `recentTrips`
// -- see that file's header for why this port computes a true "40 most
// recent site visits" rather than replicating legacy's NHibernate
// fetch-join pagination quirk.
//
// "Measurer activity" table: REMOVED (owner request 2026-07). It had NO
// legacy UI equivalent -- `dbo.MeasurerActivity` was a reporting-only SQL
// view no legacy controller/view ever rendered; doc 03's P1-13 note had
// directed surfacing it anyway, and the owner has since reversed that.
// Legacy Activity.cshtml was exactly one "Recent trips" portlet, which is
// again this page's whole content. The ported query module
// (`db/queries/measurer-activity.sql.ts`) is left in place, unused, in
// case the data gets resurfaced elsewhere (e.g. an admin/report page).
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { recentTrips, type TripVisitor } from "@/db/queries/activity.sql";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrowseTabs } from "@/components/chrome/browse-tabs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activity - TreesDb",
  description: "Recent measurement trips across the registry.",
};

/** `Site.ComputedLastMeasurementDate`-style `[DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]`, applied to a raw `YYYY-MM-DD` string -- no Date/timezone parsing. */
function formatMDY(value: string): string {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

/** `Name.ToString()` (TMD.Model/Name.cs:34-38): "FirstName LastName". */
function formatName(v: TripVisitor): string {
  return `${v.firstName} ${v.lastName}`;
}

/**
 * `Views/Shared/DisplayTemplates/ConcatenatedNames.cshtml`, transcribed
 * exactly: 1 name -> itself; 2 names -> "A and B"; 3+ names -> "A, B, and C".
 */
function formatVisitors(visitors: TripVisitor[]): string {
  if (visitors.length === 0) return "";
  if (visitors.length === 1) return formatName(visitors[0]!);
  if (visitors.length === 2) return `${formatName(visitors[0]!)} and ${formatName(visitors[1]!)}`;
  const allButLast = visitors.slice(0, -1).map(formatName).join(", ");
  const last = formatName(visitors[visitors.length - 1]!);
  return `${allButLast}, and ${last}`;
}

// Design-audit item 6b: the standard amber `badge` pill (BRAND.md: "values
// that are DATA... render as amber `badge` pills") used for Recent trips'
// Date cells -- text unchanged, just no longer bare plain text.
function DateBadge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-badge px-2 py-0.5 text-xs font-medium text-badge-foreground">{children}</span>;
}

export default async function ActivityPage() {
  const trips = await recentTrips(40);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4">
      <BrowseTabs current="/activity" />
      {/*
        Legacy-parity sweep (owner request 2026-07): the standalone
        "Activity" heading strip is gone -- Locations/Species carry their h1
        INSIDE the card-header strip, and legacy Activity.cshtml had no
        page-level heading either (just the "Recent trips" portlet). "Recent
        trips" is therefore the page's h1 now, in the same card-header
        position as the other browse pages'.
      */}
      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="rounded-t-xl border-b border-border bg-secondary px-4 py-2.5">
          <h1 className="text-base font-semibold text-secondary-foreground">Recent trips</h1>
        </CardHeader>
        <CardContent className="overflow-x-auto p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="rounded-tl-md bg-primary text-primary-foreground">Date</TableHead>
                <TableHead className="bg-primary text-primary-foreground">Site</TableHead>
                <TableHead className="bg-primary text-primary-foreground">County</TableHead>
                <TableHead className="bg-primary text-primary-foreground">State</TableHead>
                <TableHead className="rounded-tr-md bg-primary text-primary-foreground">Measurers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip, i) => (
                <TableRow key={trip.siteVisitId} className={cn(i % 2 === 1 && "bg-muted/40")}>
                  <TableCell>
                    <DateBadge>{formatMDY(trip.visited)}</DateBadge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/sites/${trip.siteId}`} className="text-link hover:underline">
                      {trip.siteName}
                    </Link>
                  </TableCell>
                  <TableCell>{trip.county}</TableCell>
                  <TableCell>
                    <Link href={`/states/${trip.stateId}`} className="text-link hover:underline">
                      {trip.stateName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-normal">{formatVisitors(trip.visitors)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
