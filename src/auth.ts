import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";

// --- Server Functions ---

export const signup = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { name: string; email: string; password: string };
      if (!d.name || !d.email || !d.password) {
        throw new Error("Name, email, and password are required");
      }
      if (d.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
        throw new Error("Invalid email format");
      }
      return d;
    }
  )
  .handler(async ({ data }) => {
    const existing = db.getUserByEmail(data.email);
    if (existing) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = db.createUser(data.email, passwordHash, data.name);

    const token = crypto.randomBytes(32).toString("hex");
    db.createSession(user.id, token);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscription_status,
        trialEndsAt: user.trial_ends_at,
      },
      token,
    };
  });

export const login = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { email: string; password: string };
      if (!d.email || !d.password) {
        throw new Error("Email and password are required");
      }
      return d;
    }
  )
  .handler(async ({ data }) => {
    const user = db.getUserByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = crypto.randomBytes(32).toString("hex");
    db.createSession(user.id, token);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscription_status,
        trialEndsAt: user.trial_ends_at,
      },
      token,
    };
  });

export const logout = createServerFn().handler(async () => {
  // Token is passed via data from client
  return { success: true };
});

export const validateSession = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    if (!data.token) return null;
    const session = db.getUserBySessionToken(data.token);
    if (!session) return null;
    return {
      userId: session.userId,
      name: session.name,
      email: session.email,
      subscriptionStatus: session.subscriptionStatus,
      trialEndsAt: session.trialEndsAt,
    };
  });
