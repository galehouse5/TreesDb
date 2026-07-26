// Port of `AccountController.PasswordAssistance` GET/POST
// (`TMD/Controllers/AccountController.cs:161-188`, doc 04 §P2-05, doc 01 §1
// `/Account/PasswordAssistance` -> `/account/password-assistance`).
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { passwordAssistanceAction } from "./actions";

export const metadata: Metadata = {
  title: "Password assistance - TreesDb",
  description: "Request a link to reset your TreesDb password.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface PasswordAssistancePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PasswordAssistancePage({ searchParams }: PasswordAssistancePageProps) {
  const sp = await searchParams;
  const error = firstParam(sp.error);
  const sent = firstParam(sp.sent) === "1";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="border-b bg-primary/5 py-4">
          <CardTitle className="font-semibold text-primary">Password assistance</CardTitle>
          <CardDescription>
            Enter your account email and we&rsquo;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {sent ? (
            <div className="space-y-3 text-sm">
              <p>
                If that email is associated with a TreesDb account, we&rsquo;ve sent a password reset link. It&rsquo;s
                valid for 1 hour.
              </p>
              <Link href="/account/login" className="text-link underline underline-offset-4">
                Back to login
              </Link>
            </div>
          ) : (
            <form action={passwordAssistanceAction} className="space-y-4">
              {error ? (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
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
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
