import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://6741ef24a34c83f9035614040466cc80@o4509490662342656.ingest.us.sentry.io/4510951207796736",
    enableLogs: true,
    integrations: [
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
});
