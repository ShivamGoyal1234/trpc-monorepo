import type { Request, Response } from "express";

import type { users } from "@repo/db";

export type SessionUser = typeof users.$inferSelect;

export interface Context {
  req: Request;
  res: Response;
  user: SessionUser | null;
  token: string | null;
}
