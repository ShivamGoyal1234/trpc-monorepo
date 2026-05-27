import { randomBytes } from "node:crypto";

import { OAuth2Client } from "google-auth-library";

import { redis } from "./redis";

const OAUTH_STATE_PREFIX = "oauth:google:";
const OAUTH_STATE_TTL = 60 * 10;

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

function getRedirectUri(): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`}/auth/google/callback`
  );
}

export function getGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getRedirectUri(),
  });
}

export async function createGoogleAuthUrl(callbackPath?: string): Promise<string> {
  const state = randomBytes(24).toString("hex");
  const payload = JSON.stringify({ callbackPath: callbackPath ?? "/dashboard" });

  try {
    await redis.setex(`${OAUTH_STATE_PREFIX}${state}`, OAUTH_STATE_TTL, payload);
  } catch {
    throw new Error("Unable to start Google sign-in");
  }

  return getGoogleOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
    state,
  });
}

export async function consumeGoogleOAuthState(
  state: string,
): Promise<{ callbackPath: string } | null> {
  try {
    const raw = await redis.get(`${OAUTH_STATE_PREFIX}${state}`);
    if (!raw) return null;
    await redis.del(`${OAUTH_STATE_PREFIX}${state}`);
    return JSON.parse(raw) as { callbackPath: string };
  } catch {
    return null;
  }
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function getGoogleProfileFromCode(
  code: string,
): Promise<GoogleProfile> {
  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new Error("Missing Google ID token");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Invalid Google profile");
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0] ?? "User",
    picture: payload.picture,
  };
}

export function getAppRedirectUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
