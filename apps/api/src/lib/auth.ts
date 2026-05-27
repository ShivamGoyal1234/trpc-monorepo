import { randomBytes } from "node:crypto";

import { and, eq, gt } from "drizzle-orm";

import { db, sessions, users } from "./db";
import type { DbUser } from "./user";
import { redis } from "./redis";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_PREFIX = "session:";

interface SessionCachePayload {
  userId: string;
  expiresAt: string;
}

function sessionKey(token: string): string {
  return `${SESSION_PREFIX}${token}`;
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  const payload: SessionCachePayload = {
    userId,
    expiresAt: expiresAt.toISOString(),
  };

  try {
    await redis.setex(
      sessionKey(token),
      SESSION_TTL_SECONDS,
      JSON.stringify(payload),
    );
  } catch {
    // Redis unavailable — DB session still valid
  }

  return token;
}

async function getUserById(userId: string): Promise<DbUser | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user ?? null;
}

export async function getUserFromToken(token: string): Promise<DbUser | null> {
  try {
    const cached = await redis.get(sessionKey(token));
    if (cached) {
      const payload = JSON.parse(cached) as SessionCachePayload;
      if (new Date(payload.expiresAt) > new Date()) {
        return getUserById(payload.userId);
      }
      await redis.del(sessionKey(token));
      return null;
    }
  } catch {
    // Fall through to DB
  }

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())),
    with: { user: true },
  });

  if (!session?.user) {
    return null;
  }

  try {
    const ttl = Math.max(
      1,
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    );
    const payload: SessionCachePayload = {
      userId: session.userId,
      expiresAt: session.expiresAt.toISOString(),
    };
    await redis.setex(sessionKey(token), ttl, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures
  }

  return session.user;
}

export async function invalidateSession(token: string): Promise<void> {
  try {
    await redis.del(sessionKey(token));
  } catch {
    // Ignore
  }

  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
  });

  try {
    if (userSessions.length > 0) {
      const keys = userSessions.map((s: { token: string }) => sessionKey(s.token));
      await redis.del(...keys);
    }
  } catch {
    // Ignore
  }

  await db.delete(sessions).where(eq(sessions.userId, userId));
}
