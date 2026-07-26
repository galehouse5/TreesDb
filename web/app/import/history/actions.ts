"use server";

// History's "Remove" server action -- task P3-07 (doc 05 §P3-03..07). Port
// of `ImportController.History([ModelBinder] ImportInnerActionModel)` POST
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
// `removeTrip`, and redirect back to History either way (legacy re-renders
// the same page after a successful remove; a failed auth/not-found check
// here redirects to the same URL too, which will simply omit a trip that
// either never belonged to this user or no longer exists -- no separate
// error UI, matching this port's other wizard actions' "redirect back,
// don't surface a raw 401/404 page" convention, e.g. app/import/[tripId]/
// trip/actions.ts's `saveTripAction`).
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { TripAccessError, removeTrip } from "@/db/queries/import-drafts.sql";

export async function removeTripAction(formData: FormData): Promise<void> {
  const tripId = Number(formData.get("tripId") ?? "");

  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/import/history");
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

  redirect("/import/history");
}
