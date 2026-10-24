import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

export function initSentry(app) {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.2,
  });
  Sentry.setupExpressErrorHandler(app);
}

export { Sentry };
