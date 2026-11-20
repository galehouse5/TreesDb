/**
 * Server-side error reporting (Sentry) -- the replacement for legacy's ELMAH
 * error mails (MODERNIZATION.md "Errors / logging"; doc 06 P4-04 watches
 * Sentry for two weeks after cutover).
 *
 * Inert by default: nothing is initialized and nothing is sent unless
 * `SENTRY_DSN` is set in the environment (Vercel project settings for
 * preview/production; leave it empty locally and in CI). Wired from
 * `instrumentation.ts`:
 *   - `register()` initializes the SDK for the current runtime (Node or
 *     Edge -- `@sentry/nextjs` resolves the right build per runtime).
 *   - `onRequestError` reports every uncaught server error: Server
 *     Components, Route Handlers, Server Actions and middleware. That
 *     covers the cases ELMAH alerted on, including a database that can't be
 *     reached. `notFound()`/`redirect()` are not errors and are not reported.
 *
 * Privacy: `sendDefaultPii: false`, so cookies, IPs and user details stay
 * out of events (ELMAH mails carried all of them). Tracing is off
 * (`tracesSampleRate: 0`) to stay inside the free tier; errors only.
 * Browser-side errors are not reported (legacy didn't either).
 */

export interface SentryServerOptions {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  sendDefaultPii: boolean;
}

type Env = Record<string, string | undefined>;

/** The options to initialize Sentry with, or `null` to leave it off (no DSN set). */
export function sentryServerOptions(env: Env): SentryServerOptions | null {
  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) return null;
  return {
    dsn,
    // Vercel sets VERCEL_ENV to production/preview/development; fall back
    // to NODE_ENV elsewhere so events are still split by environment.
    environment: env.SENTRY_ENVIRONMENT?.trim() || env.VERCEL_ENV || env.NODE_ENV || "development",
    // Ties an error to the deploy that produced it.
    release: env.VERCEL_GIT_COMMIT_SHA || undefined,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  };
}
