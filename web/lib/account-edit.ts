/**
 * Account edit (profile + change-password) -- task P2-06 (doc 04 §P2-06,
 * doc 01 §6). Pure, pglite-testable orchestration on top of the "dumb" data
 * functions APPENDED to db/queries/auth.sql.ts for this task
 * (`findUserById`, `updateUserNames`) plus the pre-existing
 * `upgradePasswordHash` (P2-03).
 *
 * SCOPE (read from `TMD/Controllers/AccountController.cs:229-270`,
 * `TMD/Models/AccountModel.cs:83-114`, `TMD/Mappings/AccountMapping.cs:16-63`,
 * `TMD.Model/Users/User.cs:25-39,126-137`, `TMD.Model/Users/Password.cs`):
 *
 * - Legacy's `Edit` view/model has exactly two independently-submitted
 *   forms sharing one action: "details" (name) and "password" (change).
 *   Legacy's `AccountEditDetailsModel` exposes a SINGLE "Lastname, Firstname"
 *   text field (`Name`, `AccountModel.cs:93-98`) which `AccountMapping.cs:38-62`
 *   splits on the first comma into `User.Firstname`/`User.Lastname`. This
 *   task's registration form (P2-04, `app/account/register/page.tsx`)
 *   already diverged from that combined-field UI by collecting first/last
 *   name as two separate inputs (see that file's actions.ts header) --
 *   account edit continues that same, already-established modernization
 *   rather than reintroducing the legacy "Lastname, Firstname" single-field
 *   format. The validation actually enforced against the persisted entity
 *   either way is `User.Firstname`/`User.Lastname`'s own `Length(50)`
 *   attributes (`User.cs:26,34`) -- reproduced here verbatim as the two
 *   per-field messages below. (Legacy's `AccountEditDetailsModel.Name` also
 *   carries a `StringLength(100)`/`RegularExpression(".+,.+")` pair, but
 *   those exist only to validate the combined display string this app
 *   doesn't have; they're intentionally NOT reproduced, same reasoning as
 *   the registration divergence.) Neither the view-model nor the entity
 *   marks first/last name `[Required]` -- legacy actually permits blanking
 *   a name out via account edit (an empty `Name` field passes
 *   `RegularExpression` and `Length(50)` alike) -- so this port does not
 *   invent a required check either; only the length ceiling is enforced.
 *
 * - Password change (`Edit` POST, `model.EditingPassword` branch,
 *   `AccountController.cs:238-255`): verifies the existing password
 *   (`User.VerifyPassword`, `User.cs:134-137`) and on failure adds
 *   `ModelState.AddModelError("Password.ExistingPassword", "Invalid
 *   password.")` (`AccountController.cs:244`) -- note this is a DIFFERENT
 *   message from login's "Invalid email or password." (doc 04 §P2-03),
 *   since here the account is already known/authenticated. On success,
 *   `User.ChangePasswordUsingExistingPassword` (`User.cs:126-132`) calls
 *   `Password.Create(newPassword, Email)` unconditionally, and only
 *   afterwards does `ValidateMappedModel` run `Password.RequiredValidate`
 *   (`Password.cs:29-46`) against the newly-created `Password` value object
 *   -- i.e. legacy checks "existing password correct?" BEFORE "is the new
 *   password policy-compliant?", the same order this port uses.
 *   `passwordPolicyError` (`lib/account-flows.ts`, already a faithful port
 *   of `Password.RequiredValidate`) is reused rather than reimplemented.
 *
 * - Success messages, verbatim (`AccountController.cs:253,266`, both via
 *   `TempData.SetAccountMessage` -- no trailing period in either legacy
 *   string): "Your password has been changed" / "Your account has been
 *   saved". These are returned as data for the caller (the page/action) to
 *   display, not hard-coded into a redirect here, matching how every other
 *   lib/*-flows.ts module in this app stays free of redirect/session
 *   concerns.
 *
 * - Email is NOT editable here (legacy's `AccountEditModel.Email` is
 *   `[ReadOnly(true)]`, `AccountModel.cs:85` -- there is no email-change UI
 *   in legacy's Edit view, `TMD/Views/Account/Edit.cshtml:14` only renders
 *   `Details.Name`). Per doc 04 §P2-03's "email is the salt" constraint,
 *   changing a legacy-sha256 user's email would require a same-transaction
 *   rehash (`changeEmailWithRehash`, already provided in auth.sql.ts) --
 *   but since legacy never exposes that here, this module doesn't add an
 *   email-change path either. That machinery stays dormant until some
 *   future admin tool needs it.
 *
 * "Unknown user" (`userId` not found) has no legacy equivalent -- legacy's
 * controller only ever operates on the already-loaded, session-bound
 * `User` -- but this port's functions take a bare `userId`, so a defensive
 * "not-found" result is added for callers (documented per-function below).
 */
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { legacyTitleCase, passwordPolicyError } from "@/lib/account-flows";
import { verifyPassword } from "@/lib/crypto/password";
import { findUserById, updateUserNames, upgradePasswordHash } from "@/db/queries/auth.sql";
import type { SqlTag } from "@/db/queries/sql-tag";
import { defaultSql } from "@/db/queries/sql-tag";

/** `User.cs:26,34` -- `Length(50)`, applied identically to both fields. */
const NAME_MAX_LENGTH = 50;

// ---------------------------------------------------------------------------
// Profile (firstname/lastname) update
// ---------------------------------------------------------------------------

export type UpdateProfileError = "not-found" | "invalid-firstname" | "invalid-lastname";

export type UpdateProfileResult =
  | { success: true; firstname: string; lastname: string }
  | { success: false; error: UpdateProfileError; message: string };

/**
 * Title-cases both names (`legacyTitleCase`, matching the `Firstname`/
 * `Lastname` setters' `OrEmptyAndTrimToTitleCase`, `User.cs:25-39`) BEFORE
 * checking the length ceiling -- same order as legacy, where the setter's
 * transform runs first and the `Length(50)` validator checks the result
 * that's actually about to be persisted.
 */
export async function updateProfile(
  userId: number,
  firstname: string,
  lastname: string,
  sql: SqlTag = defaultSql(),
): Promise<UpdateProfileResult> {
  const user = await findUserById(userId, sql);
  if (!user) {
    return { success: false, error: "not-found", message: "Account not found." };
  }

  const titleCasedFirstname = legacyTitleCase(firstname);
  const titleCasedLastname = legacyTitleCase(lastname);

  if (titleCasedFirstname.length > NAME_MAX_LENGTH) {
    return {
      success: false,
      error: "invalid-firstname",
      message: "First name must not exceed 50 characters.", // User.cs:26
    };
  }
  if (titleCasedLastname.length > NAME_MAX_LENGTH) {
    return {
      success: false,
      error: "invalid-lastname",
      message: "Last name must not exceed 50 characters.", // User.cs:34
    };
  }

  await updateUserNames(userId, titleCasedFirstname, titleCasedLastname, sql);
  return { success: true, firstname: titleCasedFirstname, lastname: titleCasedLastname };
}

// ---------------------------------------------------------------------------
// Password change (requires current password)
// ---------------------------------------------------------------------------

export type ChangePasswordError = "not-found" | "invalid-current-password" | "invalid-new-password";

export type ChangePasswordResult =
  | { success: true }
  | { success: false; error: ChangePasswordError; message: string };

/**
 * Verifies `currentPassword` per the row's `password_algo` -- legacy-sha256
 * via `verifyPassword` (P2-01, trims the candidate itself), argon2id via
 * `@node-rs/argon2`'s `verify()` against the TRIMMED candidate (D-012,
 * same tolerance `lib/auth-flow.ts`'s login path already extends to argon2
 * rows). On success, stores an argon2id hash of the TRIMMED new password
 * via `upgradePasswordHash` -- which also flips `password_algo` to
 * `'argon2id'` unconditionally, so a legacy-sha256 user who changes their
 * password here is upgraded exactly as a successful login would upgrade
 * them (doc 04 §P2-03 step 3), even though this isn't the login path.
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
  sql: SqlTag = defaultSql(),
): Promise<ChangePasswordResult> {
  const user = await findUserById(userId, sql);
  if (!user) {
    return { success: false, error: "not-found", message: "Account not found." };
  }

  let currentPasswordOk: boolean;
  if (user.passwordAlgo === "legacy-sha256") {
    currentPasswordOk = verifyPassword(currentPassword, user.email, user.passwordHash);
  } else if (user.passwordAlgo === "argon2id" && user.passwordArgon2 !== null) {
    try {
      currentPasswordOk = await argon2Verify(user.passwordArgon2, currentPassword.trim());
    } catch {
      // Malformed/corrupt stored hash -- fail closed, same as lib/auth-flow.ts.
      currentPasswordOk = false;
    }
  } else {
    // Defensive: password_algo is free-text (db/schema.ts); an unrecognized
    // value or a null password_argon2 on an 'argon2id' row fails closed.
    currentPasswordOk = false;
  }

  if (!currentPasswordOk) {
    return { success: false, error: "invalid-current-password", message: "Invalid password." }; // AccountController.cs:244
  }

  const policyError = passwordPolicyError(newPassword);
  if (policyError) {
    return { success: false, error: "invalid-new-password", message: policyError };
  }

  const newHash = await argon2Hash(newPassword.trim());
  await upgradePasswordHash(userId, newHash, sql);
  return { success: true };
}
