"use server";

// Trip-step server action -- task P3-03 (doc 05 §P3-03). Port of
// `ImportController.Trip(ImportTripModel model)` POST
// (`TMD/Controllers/ImportController.cs:66-82`): maps the form onto the
// trip, validates with the Required tag, and on success saves + redirects
// to the Sites step (`RedirectToAction(MVC.Import.Sites(trip.Id))`,
// ImportController.cs:81) -- on failure, redirects back to this same page
// carrying both the field errors AND the user's just-submitted (possibly
// invalid) values, so the form redisplays what they typed rather than the
// last-saved draft (legacy's `return View(model)` re-renders the posted
// `model`, not a re-fetched entity, for exactly this reason).
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { assertTripEditable, saveTripStep } from "@/db/queries/import-drafts.sql";
import { buildTripStep, type TripStepFieldError, type TripStepInput } from "@/lib/import-wizard";

interface TripStepRedisplayState {
  input: TripStepInput;
  errors: TripStepFieldError[];
}

function encodeState(state: TripStepRedisplayState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export async function saveTripAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const tripId = Number(tripIdRaw);

  const session = asAppSession(await auth());
  if (!session) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(`/import/${tripIdRaw}/trip`)}`);
  }

  // `ImportController.cs:71-72` -- `if (!User.IsAuthorizedToEdit(trip)) return
  // new UnauthorizedResult();`. Re-checked here (not just trusted from the
  // layout's earlier GET-time check) because this is a separate POST -- a
  // forged `tripId` hidden field must be re-validated server-side. Either
  // failure mode (not-found or unauthorized) redirects back into
  // `/import/{tripId}/trip`, whose layout performs the exact same check and
  // renders the correct not-found/unauthorized outcome -- no need to
  // duplicate that branching here.
  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch {
    redirect(`/import/${tripId}/trip`);
  }

  const input: TripStepInput = {
    name: String(formData.get("name") ?? ""),
    date: String(formData.get("date") ?? ""),
    measurerContactInfo: String(formData.get("measurerContactInfo") ?? ""),
    makeMeasurerContactInfoPublic: formData.get("makeMeasurerContactInfoPublic") === "on",
    firstMeasurer: String(formData.get("firstMeasurer") ?? ""),
    secondMeasurer: String(formData.get("secondMeasurer") ?? ""),
    thirdMeasurer: String(formData.get("thirdMeasurer") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const { normalized, errors } = buildTripStep(input);
  if (errors.length > 0) {
    redirect(`/import/${tripId}/trip?state=${encodeState({ input, errors })}`);
  }

  await saveTripStep(
    tripId,
    {
      name: normalized.name,
      date: normalized.date,
      measurerContactInfo: normalized.measurerContactInfo,
      makeMeasurerContactInfoPublic: normalized.makeMeasurerContactInfoPublic,
      website: normalized.website,
    },
    normalized.measurers,
    new Date(),
  );

  // ImportController.cs:81. The Sites step (P3-04) is not built by this
  // task -- this 404s until that task lands, same as the wizard nav links
  // in app/import/[tripId]/layout.tsx.
  redirect(`/import/${tripId}/sites`);
}
