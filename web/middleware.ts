/**
 * Two independent concerns, one Next.js middleware file (Next.js allows
 * exactly one `middleware.ts`/one `matcher`, so both live here even though
 * they're unrelated -- kept as two clearly-separated functions, dispatched
 * by path prefix in the default export below, rather than merged into one
 * blob):
 *
 * 1. IMPORT AUTH GATE -- task P2-07 (doc 04 §P2-06/07, doc 01 §1
 *    authorization matrix). Gates `/import/**` on session role `import`.
 *    Everything else (Browse/Search/Map/Export/Photos-view/Trees/Main --
 *    doc 01 §1) is anonymous and MUST stay that way. UNCHANGED from the
 *    original P2-07 implementation -- same checks, same redirect/401
 *    responses, byte-identical -- just extracted into `importAuthMiddleware`
 *    so it can be dispatched to only for `/import/**` requests (see
 *    "DISPATCH" below for why the matcher had to grow without touching this
 *    behavior).
 *
 *    Runs on the Edge runtime, so it imports auth.config.ts (not auth.ts) --
 *    see that file's header for why: it has no providers, so it can only
 *    READ an existing JWT session, never call authorize() itself. That's all
 *    this needs, since sign-in itself happens via the Node-runtime route
 *    handler (app/api/auth/[...nextauth]/route.ts), not here.
 *
 *    Legacy mirror (`AuthorizeUserAttribute`, TMD/Controllers/AccountController.cs:
 *    16-41 -- the same attribute class backs `[AuthorizeUser(Roles = UserRoles.Import)]`
 *    on every ImportController action, e.g. ImportController.cs:30):
 *      - Anonymous + lacks role -> stash the return URL
 *        (`Session.SetDefaultReturnUrl`) and redirect to `~/Account/Logon`.
 *        Mirrored here as a redirect to `/account/login?callbackUrl=<path>`
 *        (auth.config.ts's `pages.signIn` target), the App Router equivalent
 *        of "remember where they were going, then send them to log in".
 *      - AUTHENTICATED but lacks role -> `new UnauthorizedResult()`, which in
 *        classic ASP.NET MVC is HTTP **401**, not 403 (`HttpUnauthorizedResult`
 *        sets `Response.StatusCode = 401`) -- despite the class name reading
 *        like a 403. Mirrored here as a plain 401 response. There is no
 *        Phase-4 error-page component yet to render into, so this returns a
 *        minimal text body rather than a styled page; revisit once Phase 4's
 *        error UI lands.
 *
 *    Per-trip creator checks (doc 01 §1: "Import/* requires role Import AND
 *    per-trip creator == user") are explicitly OUT of scope here -- doc 04
 *    §P2-06/07 places those "in the data layer", not middleware, since they
 *    need to know which trip is being requested.
 *
 * 2. LEGACY-URL REDIRECT MAP -- task P4-01 (doc 06 §P4-01, doc 07 §5.6). The
 *    actual shape table lives in `lib/legacy-redirects.ts` (pure function,
 *    fully unit-tested there); this file's only job is turning its result
 *    into an HTTP response, via `NextResponse.redirect()`. (A hand-rolled
 *    `Response` with a bare relative `Location` header -- the approach
 *    `app/route.ts` (D-017) uses for the `/` -> `/map` redirect, chosen
 *    there to match legacy's exact relative `Location` byte-for-byte --
 *    was tried FIRST here and crashes: unlike a Route Handler's Response,
 *    which Next.js passes straight through, a Middleware's returned
 *    Response is re-parsed by Next's own edge adapter, which expects an
 *    absolute `Location` and throws `TypeError: Invalid URL` on a relative
 *    one -- confirmed live against the dev server, see this task's report.
 *    `NextResponse.redirect(new URL(location, req.nextUrl), status)` avoids
 *    that crash AND still ends up sending a relative `Location` on the wire
 *    for same-origin targets (verified live: `Location: /map`, not
 *    `Location: http://localhost:3000/map`) -- Next.js does this
 *    normalization itself, so the D-017 parity rationale (relative,
 *    host/proxy-agnostic, verbatim-comparable by
 *    `parity/verify/redirects.ts`) still holds.
 *
 * DISPATCH: the matcher (below) necessarily grew from `/import/:path*` alone
 * to also cover the legacy shapes' prefixes, but the two concerns must not
 * bleed into each other -- in particular, `auth()`'s wrapper decodes the
 * session JWT on every matched request, which the legacy redirect map has
 * no use for and shouldn't pay for. So the default export is a PLAIN
 * function (not `auth(...)`-wrapped) that dispatches on `pathname`:
 * `/import/**` delegates to the auth-wrapped handler (unchanged behavior,
 * unchanged cost); everything else runs the legacy mapper directly, with no
 * session decode at all.
 *
 * MATCHER SHAPE: doc 06 P4-01 requires case-INsensitive matching (legacy
 * IIS routes were case-insensitive) -- each legacy prefix below is written
 * as `:name([Xx][Yy]...)/` (a path-to-regexp custom per-segment regex, one
 * character class per letter) rather than a plain literal segment, so e.g.
 * `/browse/...`, `/BROWSE/...`, and `/Browse/...` all reach the mapper (which
 * itself matches every remaining path segment case-insensitively too --
 * see lib/legacy-redirects.ts). This is deliberately scoped to exactly the
 * prefixes doc 06 enumerates (`Browse`, `Map`, `Export`, `Search`, `Photos`,
 * `Account`, `Main`) rather than a blanket catch-all, to avoid adding
 * edge-runtime cost to every page. Unavoidable side effect: because legacy
 * and new-app paths share these same words differing only by case (`/Map`
 * vs `/map`, `/Export/**` vs `/export/**`, `/Search` vs `/search`,
 * `/Photos/**` vs `/photos/**`), REAL new-app requests under those exact
 * lowercase paths now also pass through this middleware -- lib/legacy-
 * redirects.ts's `legacyRedirect` guards against redirecting a URL to
 * itself, so they're a cheap no-op pass-through (`NextResponse.next()`),
 * not a loop, but it is a real (small) added cost on otherwise-unrelated
 * hot paths. Accepted trade-off: those are exactly the prefixes doc 06
 * requires case-insensitive coverage for.
 */
import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextMiddleware, type NextRequest } from "next/server";
import { authConfig, asAppSession } from "./auth.config";
import { legacyRedirect } from "./lib/legacy-redirects";

const { auth } = NextAuth(authConfig);

// `auth(...)` is overloaded (route-handler shape vs. middleware shape,
// `next-auth/lib/index.d.ts`) and, given a single-argument callback like
// this one, TypeScript's overload resolution picks the ROUTE-HANDLER
// overload (`AppRouteHandlerFn`, expecting a `{params}` context object) --
// even though at runtime, used as it was before (`export default
// auth((req) => {...})`), it was always the middleware overload
// (`NextMiddleware`, `(req, event) => ...`) that actually ran. The `as
// NextMiddleware` below pins the TYPE to match the ACTUAL runtime shape now
// that this file calls it directly (previously this ambiguity never
// surfaced because the value was only ever re-exported, never invoked, in
// TS-checked code).
const importAuthMiddleware = auth((req) => {
  const session = asAppSession(req.auth);

  if (!session) {
    const loginUrl = new URL("/account/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!session.roles.includes("import")) {
    return new NextResponse("Unauthorized: this account does not have Import access.", {
      status: 401,
    });
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/import")) {
    // `auth()`'s wrapper is itself a valid Next.js middleware function --
    // it accepts the same `(req, event)` pair Next.js calls this file's
    // default export with, and decorates `req` with `.auth` before invoking
    // the callback above. Calling it directly here (rather than exporting
    // it as the top-level default, as before) is the only change to this
    // code path -- same wrapper, same callback, same behavior.
    return importAuthMiddleware(req, event);
  }

  const redirect = legacyRedirect(req.method, req.nextUrl.pathname, req.nextUrl.search);
  if (redirect) {
    return NextResponse.redirect(new URL(redirect.location, req.nextUrl), redirect.status);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/import/:path*",
    "/:legacy([Bb][Rr][Oo][Ww][Ss][Ee])/:rest*",
    "/:legacy([Mm][Aa][Pp])/:rest*",
    "/:legacy([Ee][Xx][Pp][Oo][Rr][Tt])/:rest*",
    "/:legacy([Ss][Ee][Aa][Rr][Cc][Hh])/:rest*",
    "/:legacy([Pp][Hh][Oo][Tt][Oo][Ss])/:rest*",
    "/:legacy([Aa][Cc][Cc][Oo][Uu][Nn][Tt])/:rest*",
    "/:legacy([Mm][Aa][Ii][Nn])/:rest*",
  ],
};
