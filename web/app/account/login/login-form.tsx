"use client";

// Failed-login UX: the original redirect-with-?code= flow (PRG) re-rendered
// a fresh empty form, clearing the typed email. useActionState keeps the
// failure on-page instead: the server action returns { code, email } rather
// than redirecting, so the uncontrolled email input's DOM value survives
// as-typed (defaultValue additionally covers the no-JS full-page
// re-render), while the password is cleared + refocused for the retry --
// matching legacy's ModelState-preserves-email / Html.PasswordFor-never-
// echoes behavior (AccountController.Logon re-rendered the POSTed model).
// The email deliberately does NOT go into the URL: query strings land in
// history/server logs, which is no place for an identifier like an email.
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LoginFormState {
  /** `CredentialsSignin.code`: "credentials" for every ordinary failure, "rate-limited" for D-013's lockout (see auth.ts). */
  code: string;
  /** The submitted email, echoed back so the field survives the failed attempt. */
  email: string;
}

/** Maps a failure code to the page's user-facing message -- same strings the
 * server component maps `?code=` to for redirect-driven arrivals. */
function messageForCode(code: string | undefined): string | null {
  if (!code) return null;
  return code === "rate-limited"
    ? "Too many failed attempts on this account. Please wait 15 minutes and try again."
    : "Invalid email or password.";
}

export function LoginForm({
  action,
  initialCode,
}: {
  action: (prev: LoginFormState | null, formData: FormData) => Promise<LoginFormState>;
  /** Failure code arriving via the URL (`?code=`) from redirect-driven flows (e.g. the Auth.js API-route path) -- superseded by in-page action state once the user resubmits. */
  initialCode?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state) {
      if (passwordRef.current) passwordRef.current.value = "";
      passwordRef.current?.focus();
    }
  }, [state]);

  const errorMessage = messageForCode(state?.code ?? initialCode);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {errorMessage && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <Button type="submit" className="mt-1 w-full">
        Log in
      </Button>
    </form>
  );
}
