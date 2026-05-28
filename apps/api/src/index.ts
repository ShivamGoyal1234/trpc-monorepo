import { createExpressMiddleware } from "@trpc/server/adapters/express";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "node:http";
import pino from "pino";
import pinoHttp from "pino-http";

import { appRouter } from "./router";
import { createContext } from "./context";
import { startFlushViewsJob } from "./jobs/flushViews";
import {
  consumeGoogleOAuthState,
  getAppRedirectUrl,
  getGoogleProfileFromCode,
  isGoogleOAuthConfigured,
} from "./lib/google-oauth";
import { signInWithGoogle } from "./lib/oauth-users";
import { closeDb } from "./lib/db";
import { connectRedis, redis } from "./lib/redis";
import { publicApiLimiter } from "./middleware/rateLimit";

const PORT = Number(process.env.PORT ?? 3001);
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "FormCraft Public API",
    version: "1.0.0",
    description: "Public endpoints for FormCraft forms",
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    "/trpc/public.getForm": {
      get: {
        summary: "Get a published form by ID or slug",
        parameters: [
          {
            name: "input",
            in: "query",
            schema: {
              type: "object",
              properties: { idOrSlug: { type: "string" } },
              required: ["idOrSlug"],
            },
          },
        ],
      },
    },
    "/trpc/public.submitResponse": {
      post: {
        summary: "Submit a form response",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  formId: { type: "string", format: "uuid" },
                  answers: { type: "array" },
                  respondentEmail: { type: "string", format: "email" },
                },
              },
            },
          },
        },
      },
    },
    "/trpc/public.getPublicForms": {
      get: {
        summary: "List public published forms",
      },
    },
    "/trpc/public.recordFormView": {
      post: {
        summary: "Record a form view",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { formId: { type: "string", format: "uuid" } },
              },
            },
          },
        },
      },
    },
  },
};

async function main() {
  await connectRedis();

  const app = express();
  const server = http.createServer(app);
  // Running behind nginx on VPS; trust X-Forwarded-* headers.
  app.set("trust proxy", 1);

  app.use(
    pinoHttp({
      logger,
    }),
  );
  app.use(helmet());
  app.use(compression());
  const corsOrigins = (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin:
        corsOrigins.length === 1 && corsOrigins[0] === "*"
          ? true
          : (origin, callback) => {
              if (!origin || corsOrigins.includes(origin)) {
                callback(null, true);
                return;
              }
              callback(new Error("Not allowed by CORS"));
            },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const loginUrl = getAppRedirectUrl("/login");

    if (!isGoogleOAuthConfigured()) {
      res.redirect(`${loginUrl}?error=google_not_configured`);
      return;
    }

    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const oauthError =
      typeof req.query.error === "string" ? req.query.error : null;

    if (oauthError) {
      res.redirect(`${loginUrl}?error=google_denied`);
      return;
    }

    if (!code || !state) {
      res.redirect(`${loginUrl}?error=google_invalid`);
      return;
    }

    const statePayload = await consumeGoogleOAuthState(state);
    if (!statePayload) {
      res.redirect(`${loginUrl}?error=google_state`);
      return;
    }

    try {
      const profile = await getGoogleProfileFromCode(code);
      const { token } = await signInWithGoogle(profile);
      const callbackUrl = getAppRedirectUrl("/auth/callback");
      const redirectUrl = new URL(callbackUrl);
      redirectUrl.searchParams.set("token", token);
      redirectUrl.searchParams.set(
        "callbackUrl",
        statePayload.callbackPath || "/dashboard",
      );
      res.redirect(redirectUrl.toString());
    } catch (err) {
      logger.error({ err }, "Google OAuth callback failed");
      res.redirect(`${loginUrl}?error=google_failed`);
    }
  });

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use("/trpc", publicApiLimiter);

  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({
        error,
        path,
      }: {
        error: Error;
        path: string | undefined;
      }) => {
        logger.error({ err: error, path }, "tRPC error");
      },
    }),
  );

  const flushJob = startFlushViewsJob();

  server.listen(PORT, "0.0.0.0", () => {
    logger.info(`FormCraft API listening on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully");
    flushJob.stop();
    server.close();
    try {
      await redis.quit();
    } catch {
      // Ignore
    }
    try {
      await closeDb();
    } catch {
      // Ignore
    }
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error(err, "Failed to start server");
  process.exit(1);
});
