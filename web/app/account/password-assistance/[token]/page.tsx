// Port of `AccountController.CompletePasswordAssistance` GET/POST
// (`TMD/Controllers/AccountController.cs:190-227`, doc 04 §P2-05, doc 01
// §6.3). Unlike the email-verification page, the GET here is read-only
// (`checkPasswordAssistanceToken` does not consume the token, mirroring
// legacy's `IsForgottenPasswordAssistanceTokenValid` check,
// `AccountController.cs:190-201`) -- consumption only happens in the POST
// action (./actions.ts). `force-dynamic` because validity is time-sensitive
// (the 1-hour window, doc 01 §6.3) and must never be served stale/cached.
import type { Metadata } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { checkPasswordAssistanceToken } from "@/lib/account-flows";
import { completePasswordAssistanceAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset your password - TreesDb",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface CompletePasswordAssistancePageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CompletePasswordAssistancePage({
  params,
  searchParams,
}: CompletePasswordAssistancePageProps) {
  const { token } = await params;
  const sp = await searchParams;
  const error = firstParam(sp.error);
  const done = firstParam(sp.done) === "1";

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
        <Card>
          <CardHeader className="rounded-t-xl border-b bg-primary/5">
            <CardTitle className="font-semibold text-primary">Password reset</CardTitle>
            <CardDescription>Your password has been changed. You can now log in with your new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/account/login" className={cn(buttonVariants({ variant: "default" }))}>
              Go to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not consumed by this check -- see file header.
  const valid = await checkPasswordAssistanceToken(token, new Date());
  if (!valid) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
        <Card>
          <CardHeader className="rounded-t-xl border-b bg-primary/5">
            <CardTitle className="font-semibold text-primary">Reset link invalid</CardTitle>
            <CardDescription>
              This password reset link is invalid, expired (links are valid for 1 hour), or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/account/password-assistance" className={cn(buttonVariants({ variant: "default" }))}>
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const boundAction = completePasswordAssistanceAction.bind(null, token);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card>
        <CardHeader className="rounded-t-xl border-b bg-primary/5">
          <CardTitle className="font-semibold text-primary">Reset your password</CardTitle>
          <CardDescription>Choose a new password for your TreesDb account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={boundAction} className="space-y-4">
            {error ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, covering at least two of: uppercase, lowercase, numbers, symbols.
              </p>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
            </div>
            <Button type="submit" className="w-full">
              Reset password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
