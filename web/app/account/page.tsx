// Account home / edit page -- port of `AccountController.Edit` GET
// (`TMD/Controllers/AccountController.cs:229-233`, doc 04 §P2-06), view
// `TMD/Views/Account/Edit.cshtml`. Anonymous users are redirected to login
// with a callback (mirroring `AuthorizeUserAttribute`'s unauthenticated
// branch, `AccountController.cs:27-38` -- same pattern middleware.ts already
// uses for `/import/**`, reproduced here directly since middleware.ts is
// deliberately scoped to `/import/:path*` only and does not gate `/account`).
//
// Two independent forms, each posting to its own server action
// (app/account/actions.ts) -- same "redisplay with a `?xError=`/`?xSaved=1`
// query message" shape as every other plain form in this app (see
// app/account/register/page.tsx's header). Email is rendered read-only
// (legacy `AccountEditModel.Email` is `[ReadOnly(true)]`, `AccountModel.cs:85`
// -- there is no email-change UI to mirror, see lib/account-edit.ts's header).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { findUserById } from "@/db/queries/auth.sql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { changePasswordAction, signOutAction, updateProfileAction } from "./actions";

export const metadata: Metadata = {
  title: "Account - TreesDb",
  description: "Edit your TreesDb account.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface AccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/account");
  }

  const user = await findUserById(session.userId);
  if (!user) {
    // Defensive: a session referencing a user no longer in the DB. No
    // legacy equivalent (legacy's session IS the DB row) -- treat as
    // logged out rather than throw.
    redirect("/account/login?callbackUrl=/account");
  }

  const sp = await searchParams;
  const profileError = firstParam(sp.profileError);
  const profileSaved = firstParam(sp.profileSaved) === "1";
  const passwordError = firstParam(sp.passwordError);
  const passwordSaved = firstParam(sp.passwordSaved) === "1";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4">
      <Card>
        <CardHeader className="rounded-t-xl border-b bg-primary/5">
          <CardTitle className="font-semibold text-primary">Account</CardTitle>
          <CardDescription>
            Update your name. Your email address can&rsquo;t be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            {profileSaved ? (
              <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                Your account has been saved
              </p>
            ) : null}
            {profileError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileError}
              </p>
            ) : null}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                readOnly
                aria-readonly="true"
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="firstname" className="text-sm font-medium">
                  First name
                </label>
                <Input
                  id="firstname"
                  name="firstname"
                  autoComplete="given-name"
                  defaultValue={user.firstname}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="lastname" className="text-sm font-medium">
                  Last name
                </label>
                <Input
                  id="lastname"
                  name="lastname"
                  autoComplete="family-name"
                  defaultValue={user.lastname}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="rounded-t-xl border-b bg-primary/5">
          <CardTitle className="font-semibold text-primary">Change password</CardTitle>
          <CardDescription>Enter your existing password and a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={changePasswordAction} className="space-y-4">
            {passwordSaved ? (
              <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                Your password has been changed
              </p>
            ) : null}
            {passwordError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {passwordError}
              </p>
            ) : null}
            <div className="space-y-1">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Existing password
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, covering at least two of: uppercase, lowercase, numbers, symbols.
              </p>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quiet row, deliberately NOT a card: a card with one lone button reads
          as an unfinished panel (design-review finding). */}
      <div className="flex justify-end">
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
}
