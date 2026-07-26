// Port of `AccountController.CompleteRegistration`
// (`TMD/Controllers/AccountController.cs:145-159`, doc 04 §P2-04, doc 01
// §6.3/§12). Legacy renders this as a GET action with a side effect
// (verifying email on render) -- reproduced here as-is (a documented legacy
// quirk, not something to "fix" per ground rules §3): visiting the link
// consumes it. `force-dynamic` ensures Next never caches/prerenders this
// route, since every visit must re-run `verifyEmail`.
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { verifyEmail } from "@/lib/account-flows";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your email - TreesDb",
};

interface VerifyEmailPageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params;
  const result = await verifyEmail(token, new Date());

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card>
        <CardHeader className="rounded-t-xl border-b bg-primary/5">
          <CardTitle className={cn("font-semibold", result.success ? "text-primary" : "text-destructive")}>
            {result.success ? "Email confirmed" : "Confirmation failed"}
          </CardTitle>
          <CardDescription>
            {result.success
              ? "Your email address has been confirmed. You can now log in."
              : result.alreadyVerified
                ? "This email address has already been confirmed."
                : "This confirmation link is invalid. It may have already been used, or copied incorrectly."}
          </CardDescription>
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
