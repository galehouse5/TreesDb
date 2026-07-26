"use server";

// Backs app/import/page.tsx's "start a new trip" button -- creates a blank
// draft (`Trip.Create()`, see db/queries/import-drafts.sql.ts's
// `createTrip`) and enters the wizard at the Trip step, same target legacy's
// mega-menu "New" link points at (`Url.Content("~/Import/Trip")`,
// `TMD/Views/Import/MenuWidget.cshtml:9`) -- except legacy defers actually
// persisting the trip until that blank form's first POST
// (`ImportController.Trip(int? id)` GET builds an in-memory
// `Model.Imports.Trip.Create()` when `id` is null, `ImportController.cs:56`),
// whereas this port's Trip-step route is keyed by `[tripId]`
// (app/import/[tripId]/trip/**, this task's exclusive file ownership) and so
// has no "no id yet" GET variant to mirror -- creating the row immediately
// here, on explicit user action (a real button click, not page render), is
// the faithful adaptation: still nothing is inserted until the user asks to
// start a trip, same as legacy.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { createTrip } from "@/db/queries/import-drafts.sql";

export async function startTripAction(): Promise<void> {
  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/import");
  }

  const tripId = await createTrip(session.userId, new Date());
  redirect(`/import/${tripId}/trip`);
}
