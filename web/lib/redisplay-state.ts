// Sealed redisplay state for the import wizard's `?state=` query.
//
// When a wizard step fails validation, its server action redirects back to
// the step with the typed input and errors so the form can be refilled
// (legacy did this in one POST round trip; a Server Action redirect needs
// the data to travel in the URL). Plain JSON there put everything the user
// typed, measurer contact info included, into browser history, server logs
// and any Referer header. Sealing it with AES-256-GCM keeps the same
// round trip while making the value unreadable and tamper-evident; a token
// older than an hour, or one that fails to open, is ignored and the page
// falls back to the saved draft.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const MAX_AGE_MS = 60 * 60 * 1000;

let fallbackSecret: string | null = null;

function key(): Buffer {
  // AUTH_SECRET is required by Auth.js in every deployed environment. Tests
  // and bare local runs may lack it; a per-process random secret still lets
  // a redirect round trip work within that process.
  let secret = process.env.AUTH_SECRET;
  if (!secret) {
    fallbackSecret ??= randomBytes(32).toString("hex");
    secret = fallbackSecret;
  }
  return createHash("sha256").update(`treesdb-import-redisplay:${secret}`).digest();
}

export function sealState(state: unknown, now: number = Date.now()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const plaintext = Buffer.from(JSON.stringify({ t: now, s: state }), "utf8");
  const body = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function openState<T>(token: string | undefined | null, now: number = Date.now()): T | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const plaintext = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(plaintext) as { t: number; s: T };
    if (typeof parsed.t !== "number" || now - parsed.t > MAX_AGE_MS || parsed.t - now > MAX_AGE_MS) return null;
    return parsed.s;
  } catch {
    return null;
  }
}
