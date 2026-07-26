"use server";

// Server action backing app/account/register/page.tsx's form. Field-presence
// and Compare-attribute checks mirror `AccountRegistrationModel`
// (`TMD/Models/AccountModel.cs:31-52`) exactly, including its messages, since
// that's the closest legacy equivalent even though this task's registration
// form additionally collects first/last name up front (a modernization --
// legacy's `User.Create` left them empty at registration and only set them
// later via Account/Edit, doc 04 §P2-06).
import { redirect } from "next/navigation";
import { encodeToken } from "@/lib/crypto/secure-token";
import { registerUser } from "@/lib/account-flows";
import { verificationEmail } from "@/lib/email/templates";
import { getMailTransport } from "@/lib/email/transport";

function failWith(message: string): never {
  redirect(`/account/register?error=${encodeURIComponent(message)}`);
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const confirmEmail = String(formData.get("confirmEmail") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const firstname = String(formData.get("firstname") ?? "");
  const lastname = String(formData.get("lastname") ?? "");

  if (!email.trim()) failWith("You must enter an email.");
  if (email.trim().length > 100) failWith("Email must not exceed 100 characters.");
  if (!confirmEmail.trim()) failWith("You must confirm your email.");
  if (email !== confirmEmail) failWith("Your emails do not match.");
  if (!password) failWith("You must enter a password.");
  if (!confirmPassword) failWith("You must confirm your password.");
  if (password !== confirmPassword) failWith("Your passwords do not match.");

  const result = await registerUser(email, password, firstname, lastname, new Date());
  if (!result.success) {
    failWith(result.message);
  }

  const tokenString = encodeToken(result.verificationToken);
  const mail = verificationEmail(tokenString);
  await getMailTransport().sendMail({ to: email.trim().toLowerCase(), ...mail });

  redirect("/account/register?sent=1");
}
