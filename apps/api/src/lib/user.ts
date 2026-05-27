import type { users } from "@repo/db";

export type DbUser = typeof users.$inferSelect;

export type SafeUser = Omit<DbUser, "hashedPassword">;

export function sanitizeUser(user: DbUser): SafeUser {
  const { hashedPassword: _password, ...safe } = user;
  return safe;
}
