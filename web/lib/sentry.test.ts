import { describe, expect, it } from "vitest";
import { sentryServerOptions } from "./sentry";

describe("sentryServerOptions", () => {
  it("stays off when SENTRY_DSN is unset or blank", () => {
    expect(sentryServerOptions({})).toBeNull();
    expect(sentryServerOptions({ SENTRY_DSN: "" })).toBeNull();
    expect(sentryServerOptions({ SENTRY_DSN: "   " })).toBeNull();
  });

  it("turns on with a DSN, errors only and no personal data", () => {
    const options = sentryServerOptions({ SENTRY_DSN: " https://key@o1.ingest.sentry.io/1 ", NODE_ENV: "production" });
    expect(options).toEqual({
      dsn: "https://key@o1.ingest.sentry.io/1",
      environment: "production",
      release: undefined,
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
  });

  it("tags events with the Vercel environment and commit when present", () => {
    const options = sentryServerOptions({
      SENTRY_DSN: "https://key@o1.ingest.sentry.io/1",
      VERCEL_ENV: "preview",
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "abc123",
    });
    expect(options?.environment).toBe("preview");
    expect(options?.release).toBe("abc123");
  });

  it("lets SENTRY_ENVIRONMENT override the detected environment", () => {
    const options = sentryServerOptions({
      SENTRY_DSN: "https://key@o1.ingest.sentry.io/1",
      SENTRY_ENVIRONMENT: "staging",
      VERCEL_ENV: "preview",
    });
    expect(options?.environment).toBe("staging");
  });
});
