"use server";

// Review-step server action -- task P3-06 (doc 05 §P3-06). Ports
// `ImportController.Finish` (`TMD/Controllers/ImportController.cs:373-388`):
// authorization, branch on `trip.IsImported` (Import vs Reimport -- legacy's
// `Repositories.Imports.Import(trip)`/`.Reimport(trip)`, this port's
// `finishTrip`/`reimportTrip`, lib/merge/engine.ts / reimport.ts), then
// redirect to History (`RedirectToAction(MVC.Import.History())`, cs:387).
//
// Deviation from legacy worth flagging (see lib/import-finish.ts's file
// header for the full reasoning): legacy has NO validation step of its own
// here -- `Import()`/`Reimport()`'s internal `AssertIsValid(Required)` just
// throws an uncaught exception into a 500 page when the trip graph is
// incomplete. This action instead runs the full-graph check
// (`validateTripForFinish`) BEFORE ever calling the engine, and simply
// redirects back to Review without touching the engine at all when blocked
// -- the Review page's own GET recomputes and displays the identical
// errors, so there's no redisplay state to thread through the redirect
// (unlike the Trip/Sites/Trees steps' `?state=` convention, which exists
// because THOSE actions are echoing a just-submitted, not-yet-persisted
// form; Review has no form fields of its own to lose).
//
// `finishTrip`/`reimportTrip` are each already fully transactional
// (`withTransaction` inside lib/merge/engine.ts / reimport.ts) -- this
// action does NOT wrap them in a second transaction.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { TripAccessError, assertTripEditable } from "@/db/queries/import-drafts.sql";
import { defaultSql } from "@/db/queries/sql-tag";
import { hasBlockingErrors, validateTripForFinish } from "@/lib/import-finish";
import { finishTrip } from "@/lib/merge/engine";
import { reimportTrip } from "@/lib/merge/reimport";
import { loadReviewGraph, toFinishGraphInput } from "./load-graph";

async function requireEditableTrip(tripIdRaw: string): Promise<number> {
  const tripId = Number(tripIdRaw);
  const session = asAppSession(await auth());
  if (!session) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(`/import/${tripIdRaw}/review`)}`);
  }
  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch (err) {
    if (err instanceof TripAccessError) redirect(`/import/${tripId}/review`);
    throw err;
  }
  return tripId;
}

/**
 * `ImportController.Finish` (`ImportController.cs:373-388`). Surfaces
 * engine-thrown errors that pre-validation cannot predict (they depend on
 * OTHER trips'/sites' already-persisted rows, not this trip's own draft
 * data) -- e.g. `finishTrip`'s ambiguous-tree-match guard
 * (`lib/merge/engine.ts`'s `findMergeCandidateTreeId`, mirroring
 * `Trees.SingleOrDefault` throwing on more than one `Tree.ShouldMerge`
 * match) -- as a readable `?error=` banner rather than an unhandled 500,
 * same spirit as legacy's uncaught-exception behavior but without the blank
 * error page.
 */
export async function finishAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const tripId = await requireEditableTrip(tripIdRaw);

  const graph = await loadReviewGraph(tripId);
  if (!graph) redirect(`/import/${tripId}/review`);

  const validation = validateTripForFinish(toFinishGraphInput(graph));
  if (hasBlockingErrors(validation)) {
    redirect(`/import/${tripId}/review`);
  }

  try {
    if (graph.trip.isImported) {
      await reimportTrip(tripId, defaultSql());
    } else {
      await finishTrip(tripId, defaultSql());
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Finish failed.";
    redirect(`/import/${tripId}/review?error=${encodeURIComponent(message)}`);
  }

  // ImportController.cs:387 `RedirectToAction(MVC.Import.History())`.
  // History's tables now live on the import index (app/import/page.tsx --
  // /import/history is just a permanent redirect there), so land the user
  // on /import directly, where the freshly finished trip tops the
  // "Finished imports" table.
  redirect(`/import`);
}
