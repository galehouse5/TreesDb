"use server";

// Server action backing app/account/password-assistance/[token]/page.tsx's
// completion form. Field checks mirror `CompleteAccountPasswordAssistanceModel`
// (`TMD/Models/AccountModel.cs:68-81`). The token comes from the route
// segment, bound into this action via `.bind(null, token)` in the page (the
// standard Server Actions pattern for passing extra, non-form-field
// arguments alongside a form's FormData).
import { redirect } from "next/navigation";
import { completePasswordAssistance } from "@/lib/account-flows";

function failWith(token: string, message: string): never {
  redirect(`/account/password-assistance/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`);
}

export async function completePasswordAssistanceAction(token: string, formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) failWith(token, "You must enter a password.");
  if (!confirmPassword) failWith(token, "You must confirm your new password.");
  if (password !== confirmPassword) failWith(token, "Your passwords do not match.");

  const result = await completePasswordAssistance(token, password, new Date());
  if (!result.success) {
    failWith(token, result.message);
  }

  redirect(`/account/password-assistance/${encodeURIComponent(token)}?done=1`);
}
