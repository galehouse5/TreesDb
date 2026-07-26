// POST route that sets the `unitsPreference` cookie.
//
// Legacy equivalent: `POST /Main/SetUnits` (`TMD/Controllers/MainController.cs:22-27`):
//   Response.Cookies.SetUnitsPreference(units); return Redirect(returnUrl);
//
// Location decision: this lives at `app/api/units/route.ts` (not
// `app/units/route.ts`) to group with the other `/api/*` JSON/action
// endpoints the URL-scheme table in docs/migration/03-phase1-readonly.md
// establishes (`/api/map/markers`, `/api/species/suggest`, ...), even
// though this one redirects rather than returning JSON.
//
// Cookie semantics (doc 01 §7, CookieExtensions.cs): name `unitsPreference`,
// value = enum NAME, path `/`, 10-year maxAge, NOT httpOnly (legacy set a
// plain cookie -- nothing server-only reads it, only client-visible
// formatting), sameSite `lax` (default-safe for a same-site form POST;
// legacy predates SameSite entirely so there's no legacy behavior to match
// here -- this is a deliberate modernization, not a parity concern).
//
// Redirect target: legacy trusted `returnUrl` verbatim (an open-redirect
// footgun carried by the old app). We use `redirectTo` form field if
// present, else the `Referer` header, else `/map` -- but only after
// confirming the resolved URL is same-origin, downgrading to `/map`
// otherwise. Response status 303 (See Other): correct code for
// redirecting after a POST regardless of the original method semantics,
// and forces the follow-up navigation to GET.

import { NextRequest, NextResponse } from "next/server";
import { UNITS_COOKIE_MAX_AGE_SECONDS, UNITS_COOKIE_NAME, isValidUnitsName } from "@/lib/units/cookie";

function resolveRedirectTarget(request: NextRequest, redirectToField: FormDataEntryValue | null): string {
  const candidate =
    typeof redirectToField === "string" && redirectToField.length > 0
      ? redirectToField
      : request.headers.get("referer");

  if (!candidate) return "/map";

  try {
    const requestOrigin = new URL(request.url).origin;
    const resolved = new URL(candidate, request.url);
    if (resolved.origin !== requestOrigin) return "/map";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/map";
  }
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const units = form.get("units");

  if (typeof units !== "string" || !isValidUnitsName(units)) {
    return NextResponse.json(
      { error: `invalid units value; expected one of Default, Feet, Meters, Yards` },
      { status: 400 },
    );
  }

  const target = resolveRedirectTarget(request, form.get("redirectTo"));

  const response = NextResponse.redirect(new URL(target, request.url), 303);
  response.cookies.set(UNITS_COOKIE_NAME, units, {
    path: "/",
    maxAge: UNITS_COOKIE_MAX_AGE_SECONDS,
    httpOnly: false,
    sameSite: "lax",
  });
  return response;
}
