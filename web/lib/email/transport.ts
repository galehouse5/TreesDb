/**
 * Email transport abstraction (task P2-04/P2-05, doc 04 §P2-04/05, doc 01
 * §12). Legacy sent two transactional emails via `SmtpClient`
 * (`TMD/Emails/EmailVerificationEmail.cs`, `PasswordAssistanceEmail.cs`)
 * reading HTML template files off disk and mailing them synchronously from
 * the controller action. The new app has no SMTP server available, so:
 *
 * - When `RESEND_API_KEY` is set, `ResendTransport` sends through Resend.
 * - Otherwise, `ConsoleTransport` logs the message to the server console.
 *   This is what local dev and this repo's test/CI runs use -- every
 *   account flow (registration, verification, password reset) stays fully
 *   exercisable without ever needing a real Resend account or key.
 *
 * `lib/account-flows.ts` (this task) is the only intended caller of
 * `getMailTransport()`; it never imports `Resend` directly.
 */
import { Resend } from "resend";

export interface OutgoingMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface MailTransport {
  sendMail(mail: OutgoingMail): Promise<void>;
}

/**
 * From address. Legacy used `WebApplicationRegistry.Settings.WebmasterEmail`
 * as the From address for both templates (`EmailVerificationEmail.cs:32`,
 * `PasswordAssistanceEmail.cs:32`) -- there is no equivalent settings table
 * here, so this reads an env var instead. The placeholder default is
 * deliberately obvious/non-deliverable (`treesdb.example` is a reserved
 * documentation domain, RFC 2606) so a misconfigured deploy is easy to spot
 * rather than silently mailing from a real-looking address nobody reads.
 */
const DEFAULT_FROM = "TreesDb <no-reply@treesdb.example>";

export function resolveFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

class ResendTransport implements MailTransport {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async sendMail(mail: OutgoingMail): Promise<void> {
    const { error } = await this.client.emails.send({
      from: resolveFromAddress(),
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (error) {
      throw new Error(`Resend send failed (${error.name}): ${error.message}`);
    }
  }
}

/**
 * Dev/test fallback: never throws, never requires credentials. Logs enough
 * of the message that a developer can copy the verification/reset link out
 * of the terminal during local dev, and so this codebase's account-flow
 * tests and CI runs never need a real `RESEND_API_KEY`.
 */
class ConsoleTransport implements MailTransport {
  async sendMail(mail: OutgoingMail): Promise<void> {
    console.log(
      `[email:dev-transport] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`,
    );
  }
}

let cachedTransport: MailTransport | null = null;

/**
 * Selects `ResendTransport` when `RESEND_API_KEY` is set in the current
 * process env, else `ConsoleTransport`. The choice (and instance) is cached
 * per process -- call `resetMailTransportCacheForTests()` between tests that
 * toggle `process.env.RESEND_API_KEY`.
 */
export function getMailTransport(): MailTransport {
  if (cachedTransport) return cachedTransport;
  const apiKey = process.env.RESEND_API_KEY;
  cachedTransport = apiKey ? new ResendTransport(apiKey) : new ConsoleTransport();
  return cachedTransport;
}

/** Test-only: forces the next `getMailTransport()` call to re-select/re-construct. */
export function resetMailTransportCacheForTests(): void {
  cachedTransport = null;
}
