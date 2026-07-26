// Port of `AccountController.Register` GET/POST
// (`TMD/Controllers/AccountController.cs:104-143`, doc 04 §P2-04, doc 01 §1
// `/Account/Register` -> `/account/register`). Form submits via the
// `registerAction` server action (./actions.ts), which redirects back here
// with `?error=` or `?sent=1` -- same "redisplay the form with a message"
// shape as legacy's ModelState-driven re-render, just carried in the URL
// instead of view state so this stays a plain server-rendered form (works
// without client JS, same as every other form in this app, e.g.
// app/api/units/route.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerAction } from "./actions";

export const metadata: Metadata = {
  title: "Register - TreesDb",
  description: "Create a TreesDb account to submit tree measurements.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const sp = await searchParams;
  const error = firstParam(sp.error);
  const sent = firstParam(sp.sent) === "1";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="border-b bg-primary/5 py-4">
          <CardTitle className="font-semibold text-primary">Create an account</CardTitle>
          <CardDescription>
            Register to submit tree measurements. We&rsquo;ll email you a link to confirm your address.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {sent ? (
            <div className="space-y-3 text-sm">
              <p>
                Check your email for a confirmation link. You must confirm your email address before you can log in.
              </p>
              <Link href="/account/login" className="text-link underline underline-offset-4">
                Back to login
              </Link>
            </div>
          ) : (
            <form action={registerAction} className="space-y-4">
              {error ? (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="firstname" className="text-sm font-medium">
                    First name
                  </label>
                  <Input id="firstname" name="firstname" autoComplete="given-name" required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastname" className="text-sm font-medium">
                    Last name
                  </label>
                  <Input id="lastname" name="lastname" autoComplete="family-name" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmEmail" className="text-sm font-medium">
                  Confirm email
                </label>
                <Input id="confirmEmail" name="confirmEmail" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, covering at least two of: uppercase, lowercase, numbers, symbols.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </label>
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
