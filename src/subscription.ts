import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

// --- Server function to check subscription ---

export const checkSubscription = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    if (!data.token) {
      return { valid: false, reason: "no_token" as const };
    }

    const session = db.getUserBySessionToken(data.token);
    if (!session) {
      return { valid: false, reason: "invalid_token" as const };
    }

    const sub = db.getSubscription(session.userId);
    if (!sub) {
      return { valid: false, reason: "no_subscription" as const };
    }

    // Only active subscriptions grant access
    if (sub.status === "active") {
      return {
        valid: true,
        status: "active" as const,
      };
    }

    // Everything else (pending, canceled, expired, etc.) — no access
    return {
      valid: false,
      reason: "not_active" as const,
      status: sub.status as string,
    };
  });

// --- Server function to activate subscription ---

export const activateSubscription = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    if (!data.token) {
      return { success: false, error: "no_token" };
    }

    const session = db.getUserBySessionToken(data.token);
    if (!session) {
      return { success: false, error: "invalid_token" };
    }

    db.updateSubscriptionStatus(session.userId, "active");
    return { success: true };
  });
