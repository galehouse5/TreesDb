// History page -- task P3-07 (doc 05 §P3-03..07). Port of
// `ImportController.History()` GET (`TMD/Controllers/ImportController.cs:
// 30-35`) + its view (`TMD/Views/Import/History.cshtml`) + the per-trip
// summary EditorTemplate (`TMD/Views/Import/EditorTemplates/
// ImportTripSummaryModel.cshtml`).
//
// Legacy renders two portlets, each only if non-empty: "Started imports"
// (`!IsImported`) and "Finished imports" (`IsImported`)
// (`History.cshtml:11,25`), both listing `ImportTripSummaryModel` rows
// (Name, Date if present, Sites name list if any) via one shared
// EditorTemplate whose action buttons differ by `IsImported`
// (`ImportTripSummaryModel.cshtml:5-31`):
//   - draft: "Continue" -> `/Import/{id}/Trip`, plus "Remove".
//   - imported: "View" -> `/Import/{id}/View`, "Revise" -> `/Import/{id}
//     /Trip` (legacy allows re-editing an already-finished trip, which
//     Finish then re-imports -- see app/import/[tripId]/trip/**, already
//     built with no `IsImported` gate), plus "Remove".
// Both sections' "Remove" post the SAME single inner action the legacy
// controller supports (`Trip.{id}.Remove` -- `History()` POST,
// ImportController.cs:37-51, whose ONLY non-`NotImplementedException`
// branch is `ImportModelLevel.Trip` + `ImportModelAction.Remove` for either
// section, no `IsImported` branch there either) -- ported as this page's
// single `removeTripAction` form.
//
// Route: `/import/history` (not `/import/{tripId}/history` -- History is
// per-USER, not per-trip; matches app/import/page.tsx's existing
// "View import history" link, which already points here).
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { listTripsForUser, type TripSummary } from "@/db/queries/import-drafts.sql";
import { describeTripStarted } from "@/lib/import-history";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateMMDDYYYY } from "@/components/details/legacy-format";
import { DataBadge, MutedBadge } from "@/components/import/wizard-ui";
import { ConfirmSubmitButton } from "@/components/import/confirm-submit-button";
import { cn } from "@/lib/utils";
import { removeTripAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - History - TreesDb",
  description: "Your started and finished measurement-trip imports.",
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

export default async function ImportHistoryPage() {
  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/import/history");
  }

  const trips = await listTripsForUser(session.userId);
  const now = new Date();
  const started = trips.filter((t) => !t.isImported);
  const finished = trips.filter((t) => t.isImported);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4">
      {/* Code-audit finding: previously the only way back to `/import` was
          the empty-state copy below, which never renders once the user has
          at least one trip -- a persistent, quiet link near the heading so
          it's always reachable regardless of history's contents. */}
      <Link
        href="/import"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" aria-hidden />
        Back to import
      </Link>

      {started.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-primary">Started imports</h2>
          <TripTable trips={started} now={now} />
        </section>
      ) : null}

      {finished.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-primary">Finished imports</h2>
          <TripTable trips={finished} now={now} />
        </section>
      ) : null}

      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t started any imports yet.{" "}
          <Link href="/import" className="text-link underline underline-offset-4 hover:no-underline">
            Start one
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
