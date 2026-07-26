"use server";

// Server actions backing app/account/page.tsx's two forms (profile,
// password change) -- task P2-06 (doc 04 §P2-06). Field-presence/Compare
// checks for the password form mirror `AccountEditPasswordModel`
// (`TMD/Models/AccountModel.cs:100-114`) exactly, including its messages --
// same "form-level checks live in the action, policy checks live in the
// lib module" split already established by
// app/account/register/actions.ts and
// app/account/password-assistance/[token]/actions.ts. The profile form has
// no such legacy view-model-level checks to mirror (see
// lib/account-edit.ts's header on why first/last name aren't `[Required]`),
// so its action only forwards to `updateProfile`.
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { asAppSession } from "@/auth.config";
import { changePassword, updateProfile } from "@/lib/account-edit";

async function requireUserId(): Promise<number> {
  const session = asAppSession(await auth());
  if (!session) {
    redirect("/account/login?callbackUrl=/account");
  }
  return session.userId;
}

function failProfile(message: string): never {
  redirect(`/account?profileError=${encodeURIComponent(message)}`);
}

function failPassword(message: string): never {
  redirect(`/account?passwordError=${encodeURIComponent(message)}`);
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const firstname = String(formData.get("firstname") ?? "");
  const lastname = String(formData.get("lastname") ?? "");

  const result = await updateProfile(userId, firstname, lastname);
  if (!result.success) {
    failProfile(result.message);
  }

  redirect("/account?profileSaved=1");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // AccountModel.cs:100-114 (AccountEditPasswordModel): Required messages
  // for both password fields are the SAME string ("You must enter a
  // password."); ConfirmPassword has its own distinct Required message and
  // is compared against NewPassword.
  if (!currentPassword) failPassword("You must enter a password.");
  if (!newPassword) failPassword("You must enter a password.");
  if (!confirmPassword) failPassword("You must confirm your new password.");
  if (newPassword !== confirmPassword) failPassword("Your passwords do not match.");

  const result = await changePassword(userId, currentPassword, newPassword);
  if (!result.success) {
    failPassword(result.message);
  }

  redirect("/account?passwordSaved=1");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/map" });
}
