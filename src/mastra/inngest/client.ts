import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";

// Use development configuration when NODE_ENV is not "production"
export const inngest = new Inngest(
  process.env.NODE_ENV === "production"
    ? {
        id: process.env.INNGEST_APP_ID || "replit-agent-workflow",
        name: process.env.INNGEST_APP_NAME || "Replit Agent Workflow System",
        // Add event key for production if available
        ...(process.env.INNGEST_EVENT_KEY && {
          eventKey: process.env.INNGEST_EVENT_KEY,
        }),
        // Add signing key for production if available
        ...(process.env.INNGEST_SIGNING_KEY && {
          signingKey: process.env.INNGEST_SIGNING_KEY,
        }),
      }
    : {
        id: "mastra",
        baseUrl: "http://localhost:3000",
        isDev: true,
        middleware: [realtimeMiddleware()],
      },
);
