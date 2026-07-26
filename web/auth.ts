/**
 * Full Auth.js v5 config (task P2-03, doc 04 §P2-03) -- Node runtime only
 * (imports lib/auth-flow.ts, which touches the DB and @node-rs/argon2's
 * native binding). Re-exported by app/api/auth/[...nextauth]/route.ts and
 * used directly from server components/actions (e.g.
 * app/account/login/page.tsx's `signIn` call).
 *
 * middleware.ts deliberately does NOT import this file -- see auth.config.ts's
 * header for why (Edge runtime can't load the Credentials provider).
 */
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { attemptLogin } from "./lib/auth-flow";

/**
 * D-013 is a new rate-limit addition with no legacy error string to match
 * (doc 01 §13: legacy never enforced a lockout). Auth.js's default
 * `CredentialsSignin` reports `code: "credentials"` on the sign-in page's
 * `?error=CredentialsSignin&code=credentials` redirect query string for
 * EVERY authorize() failure -- overriding `code` here lets
 * app/account/login/page.tsx show a distinct rate-limit message while every
 * other failure (`unknown` email, `unverified`, `bad-password`) falls
 * through to `authorize()` returning `null`, which keeps Auth.js's default
 * `code: "credentials"` -- i.e. the SAME message for all three, matching
 * legacy's `AccountController.Logon` (TMD/Controllers/AccountController.cs:
 * 70-83), which uses the identical "Invalid email or password." string for
 * an unknown email, an unverified one, AND a wrong password alike.
 */
class RateLimitedSignin extends CredentialsSignin {
  code = "rate-limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
          return null;
        }

        const result = await attemptLogin(email, password, new Date());
        if (result.ok) {
          return {
            id: String(result.user.id),
            email: result.user.email,
            name: `${result.user.firstname} ${result.user.lastname}`,
            roles: result.user.roles,
          };
        }

        if (result.reason === "rate-limited") {
          throw new RateLimitedSignin();
        }
        // 'unknown' | 'unverified' | 'bad-password' -> generic failure,
        // same legacy-equivalent message for all three (see class doc above).
        return null;
      },
    }),
  ],
});
