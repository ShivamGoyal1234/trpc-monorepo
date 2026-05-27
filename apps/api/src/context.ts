import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import type { Context } from "@repo/trpc";

import { getUserFromToken } from "./lib/auth";

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") === true
      ? authHeader.slice(7).trim()
      : null;

  const user = token ? await getUserFromToken(token) : null;

  return { req, res, user, token };
}
