"use server";

// Server action backing app/account/password-assistance/page.tsx's request
// form. Field checks mirror `AccountPasswordAssistanceModel`
// (`TMD/Models/AccountModel.cs:54-66`). Silent-success is intentional (doc 04
// §P2-05, `AccountController.PasswordAssistance` POST,
// `TMD/Controllers/AccountController.cs:166-188`): the redirect target is
// identical whether or not `email` belongs to a real account.
import { redirect } from "next/navigation";
import { requestPasswordAssistance } from "@/lib/account-flows";
import { encodeToken } from "@/lib/crypto/secure-token";
import { passwordAssistanceEmail } from "@/lib/email/templates";
import { getMailTransport } from "@/lib/email/transport";

function failWith(message: string): never {
  redirect(`/account/password-assistance?error=${encodeURIComponent(message)}`);
}

export async function passwordAssistanceAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const confirmEmail = String(formData.get("confirmEmail") ?? "");

  if (!email.trim()) failWith("You must enter an email.");
  if (!confirmEmail.trim()) failWith("You must confirm your email.");
  if (email !== confirmEmail) failWith("Your emails do not match.");

  const result = await requestPasswordAssistance(email, new Date());
  if (result.sent) {
    const tokenString = encodeToken(result.sent.token);
    const mail = passwordAssistanceEmail(tokenString);
    await getMailTransport().sendMail({ to: email.trim().toLowerCase(), ...mail });
  }

  redirect("/account/password-assistance?sent=1");
}
