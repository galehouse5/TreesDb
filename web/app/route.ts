// Legacy `/` -> `/Map` (TMD/Controllers/MainController.cs:16-19, `Index()`
// -> `RedirectToAction("Index", "Map")`, an ASP.NET MVC default 302).
//
// Status code decision (D-017, supersedes the 308 this route shipped with
// in Phase 1): the repo owner chose a TEMPORARY redirect so the default
// landing page can change later - a 301/308 is cached indefinitely by
// browsers, pinning returning visitors to `/map` forever. A route handler
// (not a page component) because Next's `redirect()` emits 307 and
// `permanentRedirect()` 308; only a raw `Response` can produce legacy's
// exact 302, which also makes the `redirects` parity check byte-exact
// (no W-008 waiver needed).
// Hand-rolled Response (not Response.redirect, which requires an absolute
// URL): legacy sends a RELATIVE `Location: /Map`, and the parity
// comparator checks the header verbatim-modulo-route-equivalence, so the
// relative form is part of the contract (also host/proxy-agnostic).
export function GET(): Response {
  return new Response(null, { status: 302, headers: { Location: "/map" } });
}
