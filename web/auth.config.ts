/**
 * Edge-safe half of the Auth.js v5 config (task P2-03/P2-07, doc 04
 * §P2-03 step 5, §P2-06/07).
 *
 * Split out from auth.ts per the officially documented Auth.js pattern for
 * Next.js Middleware: middleware.ts runs on the Edge runtime, which cannot
 * load the Credentials provider (it pulls in node:crypto via
 * lib/crypto/password.ts, @node-rs/argon2's native binding, and the
 * postgres.js TCP client via db/queries/auth.sql.ts) -- so this file
 * contains only the session strategy, the custom sign-in page location, and
 * the callbacks that shape the JWT/session, all pure JS with no Node-only
 * dependencies. auth.ts imports this and adds the actual `providers` array
 * for everywhere else (the route handler, server components, server
 * actions) that does run in the Node runtime.
 *
 * Session shape (doc 04 §P2-03 step 5): "JWT with { userId, roles }
 * (bitmask decoded to ['import','export','admin'])". Carried at the TOP
 * level of the session object (not nested under `session.user`).
 *
 * --- Why no `declare module "next-auth" { interface Session { userId } }` ---
 * Tried first, reverted: @auth/core's own `session` callback parameter type
 * (`@auth/core/index.d.ts`'s `CallbacksOptions.session`) is an INTERSECTION
 * of the JWT-strategy shape (`{ session: Session; token: JWT }`) and the
 * database-strategy shape (`{ session: { user: AdapterUser } & AdapterSession }`),
 * unconditionally -- not narrowed by which `session.strategy` this app
 * actually uses. `AdapterSession` (@auth/core/adapters.d.ts:202-210) already
 * declares its own `userId: string`; intersecting that with an augmented
 * `Session.userId: number` collapses the field to `string & number` = `never`
 * or `AppSession` (a plain subtype of `Session`, not merged into it) is used
 * with an explicit unknown-cast at the one place a session is minted
 * (the `session` callback below) and read (middleware.ts) -- no global
 * augmentation, no collision with `AdapterSession`, still an actual type
 * (not `any`) at both call sites via `asAppSession`.
 */
import type { JWT } from "next-auth/jwt";
import type { Session, NextAuthConfig } from "next-auth";

/** doc 04 §P2-03 step 5 session shape -- see this file's header for why this
 * isn't merged into the library's own `Session` interface via `declare module`. */
export interface AppSession extends Session {
  userId: number;
  roles: string[];
}

/** Narrows an arbitrary (possibly claim-less/anonymous) session down to this
 * app's shape, defaulting to "no user, no roles" -- used by middleware.ts
 * and any other reader of `auth()`/`req.auth`. */
export function asAppSession(session: Session | null | undefined): AppSession | null {
  if (!session) return null;
  const s = session as AppSession;
  return { ...s, userId: s.userId ?? 0, roles: s.roles ?? [] };
}

// No `declare module "next-auth/jwt"` augmentation either: under this
// repo's "bundler" moduleResolution, TS's `declare module` merging cannot
// resolve that specifier (nor the `@auth/core/jwt` module it re-exports,
// which isn't independently reachable from web/'s node_modules under
// pnpm's strict layout) even though plain `import type` from the same
// specifier works fine. Same local-intersection-type workaround as above --
// `token.userId`/`token.roles` are only read inside this file's own two
// callbacks, so nothing outside this module needs the augmented type.
type AppJWT = JWT & { userId?: number; roles?: string[] };

export const authConfig = {
  pages: {
    // app/account/login/page.tsx (task P2-03). Auth.js redirects here on
    // both "please sign in" (anonymous + protected route, doc 04 §P2-07)
    // and sign-in failure (query params `error`/`code`, see auth.ts's
    // RateLimitedSignin) -- both cases are read by that page.
    signIn: "/account/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      // `user` is only present on the initial sign-in call (the object
      // `authorize()` returns in auth.ts) -- persist its id/roles onto the
      // long-lived JWT so subsequent requests don't need to hit the DB.
      const t = token as AppJWT;
      if (user) {
        t.userId = Number(user.id);
        t.roles = (user as { roles?: string[] }).roles ?? [];
      }
      return t;
    },
    session({ session, token }): AppSession {
      const t = token as AppJWT;
      return {
        ...session,
        userId: t.userId ?? 0,
        roles: t.roles ?? [],
      };
    },
  },
  providers: [],
} satisfies NextAuthConfig;
