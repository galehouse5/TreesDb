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
import { TripAccessError, createTrip, removeTrip } from "@/db/queries/import-drafts.sql";

export async function startTripAction(): Promise<void> {
  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/import");
  }

  const tripId = await createTrip(session.userId, new Date());
  redirect(`/import/${tripId}/trip`);
}

// The trip tables' "Remove" server action (formerly app/import/history/
// actions.ts, moved here when History folded into this page). Port of
// `ImportController.History([ModelBinder] ImportInnerActionModel)` POST
// (`TMD/Controllers/ImportController.cs:37-51`), whose only real branch is
// `Trip.{id}.Remove`:
//   var trip = Repositories.Imports.FindById(innerAction.Id);
//   if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
//   Repositories.Imports.Remove(trip);
//   Uow.Persist();
//   return View(...); // re-renders History with the trip gone
//
// `db/queries/import-drafts.sql.ts`'s `removeTrip` performs BOTH the auth
// check (internally, via `assertTripEditable`) and the full cascade delete
// (canonical orphan-cleanup + every draft row -- see that function's header
// for why this runs unconditionally for both draft and already-imported
// trips). This action is therefore thin: resolve the session, call
// `removeTrip`, and redirect back either way (legacy re-renders the same
// page after a successful remove; a failed auth/not-found check redirects
// to the same URL too, which will simply omit a trip that either never
// belonged to this user or no longer exists -- no separate error UI,
// matching this port's other wizard actions' "redirect back, don't surface
// a raw 401/404 page" convention, e.g. app/import/[tripId]/trip/actions.ts's
// `saveTripAction`).
export async function removeTripAction(formData: FormData): Promise<void> {
  const tripId = Number(formData.get("tripId") ?? "");

  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/import");
  }

  if (Number.isInteger(tripId) && tripId > 0) {
    try {
      await removeTrip(tripId, session.userId, session.roles);
    } catch (err) {
      if (!(err instanceof TripAccessError)) throw err;
      // not-found or unauthorized -- nothing to remove from this user's
      // perspective either way; fall through to the redirect below.
    }
  }

  redirect("/import");
}
