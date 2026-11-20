// Next.js instrumentation hook: server-side error reporting via Sentry.
// Inert unless SENTRY_DSN is set -- see lib/sentry.ts for what is reported
// and why. The SDK is imported lazily so an unset DSN costs nothing.
import type { Instrumentation } from "next";
import { sentryServerOptions } from "@/lib/sentry";

export async function register() {
  const options = sentryServerOptions(process.env);
  if (!options) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init(options);
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (!sentryServerOptions(process.env)) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, request, context);
};
