import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import { redis } from "../lib/redis";

function createRedisStore(prefix: string) {
  return new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<number>,
    prefix: `rl:${prefix}:`,
  });
}

export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("public"),
  message: { error: "Too many requests, please try again later." },
});

export const submitResponseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("submit"),
  message: { error: "Submission limit reached. Try again later." },
});

export const formViewLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("formview"),
  keyGenerator: (req) => {
    const formId =
      (req.query.formId as string | undefined) ??
      (req.body as { formId?: string } | undefined)?.formId ??
      "unknown";
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    return `${formId}:${ip}`;
  },
  message: { error: "View already recorded for this form." },
});
