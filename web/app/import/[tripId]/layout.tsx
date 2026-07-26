// Import-wizard step shell -- task P3-03 (doc 05 §P3-03). Every wizard step
// page (Trip, and later Sites/Trees/Review -- P3-04..06) renders under this
// layout, which:
//
//   1. Runs the SAME per-trip authorization check every legacy wizard
//      action runs before doing anything else (`User.IsAuthorizedToEdit(trip)`,
//      e.g. `ImportController.cs:58,88,226,339,369` -- role Import already
//      enforced by middleware.ts, PLUS creator-id equality, no admin
//      bypass -- see db/queries/import-drafts.sql.ts's header). Doing this
//      once here means every step page under app/import/[tripId]/** gets it
//      for free instead of re-checking per page.
//   2. Renders the step nav (Trip -> Sites -> Trees -> Review) every legacy
//      wizard page shares via `_WizardLayout.cshtml`'s portlet chrome (the
//      step links themselves live in each step's own view in legacy, e.g.
//      `SitesPartial.cshtml:19`'s "Back" link to Trip -- centralized here
//      instead since every step needs the full set of links, not just
//      "back").
//
// No actual HTTP 401 status is emitted for the unauthorized case: this repo
// has no Phase-4 error-page/`unauthorized()` boundary yet (same situation
// middleware.ts's header documents for the role-gate case; `next.config`
// does not enable `experimental.authInterrupts`, which Next.js 16's
// `unauthorized()` helper requires) -- a plain text body is rendered
// instead, consistent with that existing precedent.
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { TripAccessError, assertTripEditable } from "@/db/queries/import-drafts.sql";
import { StepNav } from "@/components/import/step-nav";

interface ImportTripLayoutProps {
  children: ReactNode;
  params: Promise<{ tripId: string }>;
}

export default async function ImportTripLayout({ children, params }: ImportTripLayoutProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const session = asAppSession(await auth());
  if (!session) {
    // `/import/{id}` itself has no page (steps live at /trip, /sites, ...),
    // so sending the bare trip URL as callbackUrl would land a freshly
    // logged-in user on a 404 (code-audit finding). Send them to the Trip
    // step; middleware.ts (which normally handles this first) preserves the
    // exact requested path, this fallback just needs a real page.
    redirect(`/account/login?callbackUrl=${encodeURIComponent(`/import/${tripIdParam}/trip`)}`);
  }

  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch (err) {
    if (err instanceof TripAccessError && err.reason === "not-found") {
      notFound();
    }
    // TripAccessError("unauthorized") -- role Import missing (shouldn't
    // reach here, middleware.ts already gates /import/**) or not the
    // trip's creator (`UnauthorizedResult()` in legacy, doc 01 §1).
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 p-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Unauthorized: this trip belongs to a different account.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-4">
      <Link
        href="/import"
        className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        All imports
      </Link>
      <StepNav tripId={tripId} />
      {children}
    </div>
  );
}
