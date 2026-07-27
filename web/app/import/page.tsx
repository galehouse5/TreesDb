// Import index -- consolidation (owner request 2026-07) of the former
// two-page split: the P3-03 entry page (unfinished-draft list + "Start a
// new trip") and the P3-07 History page (`/import/history`). History's
// content was a strict superset of the entry page's draft list -- same
// `listTripsForUser` query, same signed-in audience, richer rows (status
// badge, site list, Remove) plus the "Finished imports" table the entry
// page lacked entirely -- so this page now renders History's two tables
// with the start-a-new-trip card, and `/import/history` permanently
// redirects here.
//
// Legacy lineage, preserved from the two source files:
//  - Bare `/Import` is a DEAD route in legacy: `Global.asax.cs:68` maps it
//    to `{ controller = "Import", action = "Index" }` but
//    `TMD/Controllers/ImportController.cs` has no Index action (confirmed
//    against T4MVC's ActionNamesClass, ImportController.generated.cs:118-
//    128 -- only MenuWidget, History, Trip, Sites, Trees, Review, Finish,
//    View). So there is no legacy rendered-text parity to preserve here.
//  - The tables port `ImportController.History()` GET (ImportController.
//    cs:30-35) + `TMD/Views/Import/History.cshtml`: two portlets, each
//    only if non-empty -- "Started imports" (`!IsImported`) and "Finished
//    imports" (`IsImported`) -- listing Name, Date if present, Sites name
//    list if any, via one shared EditorTemplate whose action buttons
//    differ by `IsImported` (ImportTripSummaryModel.cshtml:5-31): draft ->
//    Continue + Remove; imported -> View, Revise (legacy allows re-editing
//    a finished trip; Finish then re-imports) + Remove.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CarIcon } from "lucide-react";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { listTripsForUser, type TripSummary } from "@/db/queries/import-drafts.sql";
import { describeTripStarted } from "@/lib/import-history";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateMMDDYYYY } from "@/components/details/legacy-format";
import { DataBadge, MutedBadge } from "@/components/import/wizard-ui";
import { ConfirmSubmitButton } from "@/components/import/confirm-submit-button";
import { cn } from "@/lib/utils";
import { removeTripAction, startTripAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - TreesDb",
  description: "Start a measurement-trip import, or continue and review your existing ones.",
};

// Branded table -- docs/design/BRAND.md: "Tables: primary green header row
// with white text; zebra-subtle rows; linked cells in link teal." Shared by
// both the "Started imports" and "Finished imports" sections below.
function TripTable({ trips, now }: { trips: TripSummary[]; now: Date }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground">Trip</TableHead>
            <TableHead className="text-primary-foreground">Status</TableHead>
            <TableHead className="text-primary-foreground">Sites</TableHead>
            <TableHead className="text-right text-primary-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id} className="align-top odd:bg-muted/30">
              <TableCell className="font-medium whitespace-normal">{trip.name || "(untitled trip)"}</TableCell>
              <TableCell className="whitespace-normal">
                {trip.isImported ? (
                  trip.date ? (
                    <DataBadge>{formatDateMMDDYYYY(trip.date)}</DataBadge>
                  ) : null
                ) : (
                  <MutedBadge>started {describeTripStarted(trip.created, now)}</MutedBadge>
                )}
              </TableCell>
              <TableCell className="whitespace-normal">
                {trip.siteNames.length > 0 ? (
                  <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                    {trip.siteNames.map((name, i) => (
                      // Site names aren't guaranteed unique within a trip
                      // (two blank/duplicate-named draft sites are possible
                      // before Finish) -- index is the only stable key
                      // available here.
                      <li key={i}>{name || "(unnamed site)"}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm text-muted-foreground">&mdash;</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  {trip.isImported ? (
                    <>
                      <Link
                        href={`/import/${trip.id}/view`}
                        className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                      >
                        View
                      </Link>
                      <Link
                        href={`/import/${trip.id}/trip`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Revise
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/import/${trip.id}/trip`}
                      className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                    >
                      Continue
                    </Link>
                  )}
                  <form action={removeTripAction}>
                    <input type="hidden" name="tripId" value={trip.id} />
                    <ConfirmSubmitButton
                      size="sm"
                      variant="destructive"
                      message="Remove this trip and everything it imported? This cannot be undone."
                    >
                      Remove
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function ImportIndexPage() {
  const session = asAppSession(await auth());
  if (!session) {
    // middleware.ts already redirects anonymous requests to /import/** to
    // login -- this is a defensive fallback for direct rendering, same
    // belt-and-suspenders pattern as app/account/page.tsx.
    redirect("/account/login?callbackUrl=/import");
  }

  // listTripsForUser orders by id desc -- newest first in both sections.
  const trips = await listTripsForUser(session.userId);
  const now = new Date();
  const started = trips.filter((t) => !t.isImported);
  const finished = trips.filter((t) => t.isImported);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4">
      {/* Active work first: unfinished drafts (whose Continue button is the
          likeliest action on this page), then the start card -- demoted to
          outline when drafts exist, same emphasis rule as the pre-
          consolidation entry page -- then the finished-imports archive. */}
      {started.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-primary">Started imports</h2>
          <TripTable trips={started} now={now} />
        </section>
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
            <Button type="submit" size="lg" variant={started.length > 0 ? "outline" : "default"} className="w-full">
              Start a new trip
            </Button>
          </form>
        </CardContent>
      </Card>

      {finished.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-primary">Finished imports</h2>
          <TripTable trips={finished} now={now} />
        </section>
      ) : null}
    </div>
  );
}
