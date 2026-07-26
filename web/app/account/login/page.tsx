// Login page -- task P2-03 (doc 04 §P2-03). Legacy equivalent:
// `AccountController.LogOn`/`Logon` (TMD/Controllers/AccountController.cs:56-91),
// view `TMD/Views/Account/LogOn.cshtml`.
//
// Error message: legacy's POST handler (AccountController.cs:70-83) uses
// the EXACT SAME `ModelState.AddModelError("Email", "Invalid email or
// password.")` for an unknown email, an unverified one, AND a wrong
// password (see lib/auth-flow.ts's header for the full citation) -- so
// this page shows that identical string for all three cases too, rather
// than inventing a "distinct unverified message" legacy never had. The
// one genuinely new case is D-013's rate limit (no legacy equivalent,
// doc 01 §13: legacy never enforced a lockout), which gets its own message
// via auth.ts's `RateLimitedSignin.code` -- see that file's header.
//
// Redirect after success: to the `callbackUrl` query param (set by
// middleware.ts when redirecting an anonymous user away from a protected
// `/import/**` route) or `/map` by default (doc 04 §P2-03 task brief).
import type { Metadata } from "next";
import Link from "next/link";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm, type LoginFormState } from "./login-form";

export const metadata: Metadata = {
  title: "Log in - TreesDb",
  description: "Log in to your TreesDb account.",
};

const DEFAULT_CALLBACK_URL = "/map";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Only allow same-app relative paths through as a redirect target (no open redirect). */
function sanitizeCallbackUrl(candidate: string | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_CALLBACK_URL;
  }
  return candidate;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(firstString(sp.callbackUrl));
  const code = firstString(sp.code);

  // Server-side `signIn` THROWS on a failed credentials attempt (@auth/core
  // raw mode rethrows AuthError instead of redirecting with
  // `?error=...&code=...` the way the API-route flow does). Rather than
  // translating that into a PRG redirect (which re-rendered a FRESH form,
  // clearing the typed email -- UX report 2026-07), the failure is returned
  // as useActionState state: login-form.tsx echoes the email back into the
  // field and maps `code` ("credentials" for authorize() returning null,
  // "rate-limited" for auth.ts's RateLimitedSignin) to the same messages
  // this page maps `?code=` to for redirect-driven arrivals.
  async function login(_prev: LoginFormState | null, formData: FormData): Promise<LoginFormState> {
    "use server";
    const email = String(formData.get("email") ?? "");
    try {
      await signIn("credentials", {
        email,
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof CredentialsSignin) {
        return { code: error.code, email };
      }
      // Success path: signIn redirects to `redirectTo` by throwing
      // NEXT_REDIRECT, which must propagate. Non-credentials AuthErrors
      // (e.g. misconfiguration) are genuine 500s and propagate too.
      throw error;
    }
    // Unreachable in practice -- a successful signIn always throws
    // NEXT_REDIRECT above -- but TypeScript needs a tail return.
    return { code: "credentials", email };
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="border-b bg-primary/5 py-4">
          <CardTitle className="font-semibold text-primary">Log in</CardTitle>
          <CardDescription>Enter your TreesDb account email and password.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <LoginForm action={login} initialCode={code} />
          {/* Registration + reset were previously reachable only by typing
              the URL (code-audit finding: no inbound links anywhere) -- a
              dead end for new or locked-out users. */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
            <Link
              href="/account/password-assistance"
              className="text-link underline underline-offset-4 hover:no-underline"
            >
              Forgot your password?
            </Link>
            <Link
              href="/account/register"
              className="text-link underline underline-offset-4 hover:no-underline"
            >
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
