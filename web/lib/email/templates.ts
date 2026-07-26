/**
 * Content for the two transactional emails (doc 01 §12, doc 04 §P2-04/05).
 *
 * Wording is modernized (D-009 permits this -- legacy subjects were
 * `[Tree Measurement Database] Email verification` / `... Password
 * Assistance`, `TMD/Emails/EmailVerificationEmail.cs:34`,
 * `PasswordAssistanceEmail.cs:34`). What must NOT change is the token URL
 * contract: verification links point at `{origin}/account/verify/{token}`
 * and password-assistance links at
 * `{origin}/account/password-assistance/{token}` -- these are the NEW-app
 * routes owned by this task (see app/account/verify/[token]/page.tsx,
 * app/account/password-assistance/[token]/page.tsx). The legacy
 * `/Account/{token}/Complete*` paths still exist as redirect-only handlers
 * (app/(legacy-tokens)/Account/[token]/...) for outstanding emailed legacy
 * links at cutover, but new mail is never sent with those paths. The 1-hour
 * password-assistance validity window (doc 01 §6.3) is called out in the
 * copy since D-009 only licenses wording changes, not silently dropping a
 * user-facing fact about the token's semantics.
 */

/**
 * Site origin used to build absolute links in emails. There is no
 * equivalent of legacy's `WebApplicationRegistry.Settings.HostName`
 * appsetting here, so preference order is:
 * 1. `NEXT_PUBLIC_SITE_URL` (set explicitly in production -- the intended
 *    long-term source of truth once a custom domain is attached).
 * 2. `VERCEL_URL` (host only, no scheme, auto-populated by Vercel on every
 *    deployment -- prefixed with `https://`).
 * 3. `http://localhost:3000` (local dev fallback).
 */
export function resolveSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function wrapHtml(bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5;color:#111827;max-width:480px;margin:0 auto;padding:24px;">${bodyHtml}</body></html>`;
}

/** Legacy: `/Account/{token}/CompleteRegistration` (doc 01 §12). New link target: `/account/verify/{token}`. */
export function verificationEmail(token: string, origin: string = resolveSiteOrigin()): RenderedEmail {
  const link = `${origin}/account/verify/${token}`;
  return {
    subject: "Confirm your TreesDb email",
    html: wrapHtml(`
      <p>Welcome to TreesDb.</p>
      <p>Confirm your email address to finish setting up your account:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `),
    text:
      "Welcome to TreesDb.\n\n" +
      "Confirm your email address to finish setting up your account:\n" +
      `${link}\n\n` +
      "If you didn't create this account, you can safely ignore this email.",
  };
}

/** Legacy: `/Account/{token}/CompletePasswordAssistance`, 1-hour validity (doc 01 §6.3, §12). New link target: `/account/password-assistance/{token}`. */
export function passwordAssistanceEmail(token: string, origin: string = resolveSiteOrigin()): RenderedEmail {
  const link = `${origin}/account/password-assistance/${token}`;
  return {
    subject: "Reset your TreesDb password",
    html: wrapHtml(`
      <p>We received a request to reset the password for your TreesDb account.</p>
      <p>This link is valid for <strong>1 hour</strong> and can only be used once:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't request this, you can safely ignore this email -- your password will not be changed.</p>
    `),
    text:
      "We received a request to reset the password for your TreesDb account.\n\n" +
      "This link is valid for 1 hour and can only be used once:\n" +
      `${link}\n\n` +
      "If you didn't request this, you can safely ignore this email -- your password will not be changed.",
  };
}
