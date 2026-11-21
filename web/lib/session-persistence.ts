// "Remember me on this computer" (legacy Logon.cshtml:29-30,
// AccountController.cs:85: FormsAuthentication.SetAuthCookie(id, RememberMe)).
//
// Legacy issued a persistent cookie only when the box was ticked, and a
// browser-session cookie otherwise; either way the ticket lasted 7 days,
// sliding (Web.config forms timeout=10080). Auth.js has one cookie policy
// for every session, so this module does the per-login part:
//
//  - At sign-in, when the box is unticked, the session-token cookie Auth.js
//    just set is re-set without Expires/Max-Age, and a session-only marker
//    cookie is set beside it.
//  - When Auth.js later refreshes the session cookie (middleware.ts, on
//    /import requests), the same strip is applied while the marker is
//    present, so the session never turns persistent behind the user's back.
//
// Both cookies vanish when the browser closes. Edge-safe: no Node imports.
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_ONLY_MARKER = "treesdb.session-only";

/** Legacy's 7-day forms-auth timeout, also used as Auth.js session.maxAge. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Auth.js session-token cookie names, including the `__Secure-` form and chunked `.0`, `.1` parts. */
export function isSessionTokenCookie(name: string): boolean {
  return /^(__Secure-)?authjs\.session-token(\.\d+)?$/.test(name);
}

interface CookieLike {
  name: string;
  value: string;
  expires?: number | Date;
  maxAge?: number;
}

// Structural, so both a route's ResponseCookies and next/headers' cookies()
// store (a ResponseCookies inside Server Actions) fit.
interface CookieStoreLike {
  getAll(): CookieLike[];
  set(options: ResponseCookie): unknown;
}

/** Returns the cookie options to write back: everything but the expiry. */
export function withoutExpiry(cookie: CookieLike): ResponseCookie {
  const rest: Record<string, unknown> = { ...cookie };
  delete rest.expires;
  delete rest.maxAge;
  return rest as unknown as ResponseCookie;
}

/** Re-sets every non-empty session-token cookie in `store` as a browser-session cookie. Returns how many it changed. */
export function makeSessionCookiesSessionOnly(store: CookieStoreLike): number {
  let changed = 0;
  for (const cookie of store.getAll()) {
    if (!isSessionTokenCookie(cookie.name) || cookie.value === "") continue;
    // An explicit past expiry or zero max-age is a sign-out deletion; leave it.
    if (cookie.maxAge !== undefined && cookie.maxAge <= 0) continue;
    if (cookie.expires !== undefined) {
      const t = cookie.expires instanceof Date ? cookie.expires.getTime() : Number(cookie.expires);
      if (Number.isFinite(t) && t <= Date.now()) continue;
    }
    store.set(withoutExpiry(cookie));
    changed++;
  }
  return changed;
}
