import { and, eq } from "drizzle-orm";

import { createSession } from "./auth";
import { db, accounts, users } from "./db";
import type { GoogleProfile } from "./google-oauth";
import { sanitizeUser } from "./user";
import { emailService } from "../services/email.service";

const GOOGLE_PROVIDER = "google";

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const linkedAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, GOOGLE_PROVIDER),
      eq(accounts.providerAccountId, profile.id),
    ),
    with: { user: true },
  });

  if (linkedAccount?.user) {
    return linkedAccount.user;
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, profile.email),
  });

  if (existingUser) {
    await db.insert(accounts).values({
      userId: existingUser.id,
      provider: GOOGLE_PROVIDER,
      providerAccountId: profile.id,
    });

    if (!existingUser.image && profile.picture) {
      await db
        .update(users)
        .set({ image: profile.picture, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id));
    }

    return existingUser;
  }

  const [user] = await db
    .insert(users)
    .values({
      email: profile.email,
      name: profile.name,
      image: profile.picture ?? null,
      emailVerified: true,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  await db.insert(accounts).values({
    userId: user.id,
    provider: GOOGLE_PROVIDER,
    providerAccountId: profile.id,
  });

  void emailService.sendWelcome(user.email, user.name);

  return user;
}

export async function signInWithGoogle(profile: GoogleProfile) {
  const user = await findOrCreateGoogleUser(profile);
  const token = await createSession(user.id);
  return { user: sanitizeUser(user), token };
}
