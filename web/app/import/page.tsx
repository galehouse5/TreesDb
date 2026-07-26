// Import-wizard entry point -- task P3-03 (doc 05 §P3-03, doc 01 §1
// "`/Import` ... Import/*" route table"). Redesigned per the design-audit
// follow-up: the original version auto-redirected straight into the
// latest unfinished trip's Trip step, leaving no way back to a list (a
// user-reported dead end). This page is explicitly UNCONSTRAINED on
// content (task brief) -- legacy's bare `/Import` is a dead route (see the
// routing history below, preserved from the prior revision), so there is
// no legacy rendered-text parity to preserve here.
//
// --- What "legacy's Import index action" actually is ------------------
// The doc 01 route table lists `/Import` as a working entry alongside
// `/Import/History` etc, and this task's brief says to mirror "legacy's
// Import index action" -- but reading the controller (as directed) finds
// there IS no `Index` action: `Global.asax.cs:68` maps bare `Import` to
// `{ controller = "Import", action = "Index" }`, yet
// `TMD/Controllers/ImportController.cs`'s full action list (confirmed
// against the T4MVC-generated `ActionNamesClass`,
// `TMD/ImportController.generated.cs:118-128`) is only: MenuWidget,
// History, Trip, Sites, Trees, Review, Finish, View -- no Index. Hitting
// bare `/Import` in legacy is therefore a dead route, in the same family as
// the already-documented dead `Import/New` (doc 01 §1's "Quirks" line,
// doc 01 §13's do-not-blindly-fix list) -- ASP.NET MVC throws
// "action not found" for both.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CarIcon } from "lucide-react";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { listTripsForUser } from "@/db/queries/import-drafts.sql";
import { describeTripStarted } from "@/lib/import-history";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { startTripAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - TreesDb",
  description: "Start or continue a measurement-trip import.",
};

/** Site-name summary for a draft row's muted second line: join up to two
 * names, else collapse to a count -- keeps the row to one line. */
function siteSummary(siteNames: string[]): string | null {
  if (siteNames.length === 0) return null;
  if (siteNames.length > 2) return `${siteNames.length} sites`;
  return siteNames.join(", ");
}

export default async function ImportEntryPage() {
  const session = asAppSession(await auth());
  if (!session) {
    // middleware.ts already redirects anonymous requests to /import/** to
    // login -- this is a defensive fallback for direct rendering, same
    // belt-and-suspenders pattern as app/account/page.tsx.
    redirect("/account/login?callbackUrl=/import");
  }

  // listTripsForUser orders by id desc -- newest first, matching the
  // "newest first" requirement for the unfinished-drafts list below.
  const trips = await listTripsForUser(session.userId);
  const now = new Date();
  const unfinished = trips.filter((t) => !t.isImported);
  const hasUnfinished = unfinished.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4">
      {hasUnfinished ? (
        <Card className="gap-0">
          <CardHeader className="border-b bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <CarIcon className="size-4 text-primary/70" aria-hidden />
              Continue your import
            </CardTitle>
            <CardDescription>Pick up where you left off.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 pt-4">
            {unfinished.map((trip) => {
              const sites = siteSummary(trip.siteNames);
              return (
                <div key={trip.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{trip.name || "(untitled trip)"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      started {describeTripStarted(trip.created, now)}
                      {sites ? ` · ${sites}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/import/${trip.id}/trip`}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0")}
                  >
                    Continue
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-0">
        <CardHeader className="border-b bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <CarIcon className="size-4 text-primary/70" aria-hidden />
            Start a new trip
          </CardTitle>
          <CardDescription>Submit a new set of tree measurements.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={startTripAction}>
            <Button type="submit" size="lg" variant={hasUnfinished ? "outline" : "default"} className="w-full">
              Start a new trip
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link
        href="/import/history"
        className="block text-center text-sm text-link underline underline-offset-4 hover:no-underline"
      >
        View import history →
      </Link>
    </div>
  );
}
