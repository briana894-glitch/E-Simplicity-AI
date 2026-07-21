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

    // Active subscription — always valid
    if (sub.status === "active") {
      return {
        valid: true,
        status: "active" as const,
        trialEndsAt: null,
        daysRemaining: null,
      };
    }

    // Trialing — check if trial is still valid
    if (sub.status === "trialing") {
      if (!sub.trialEndsAt) {
        // No trial end set, treat as valid for now
        return {
          valid: true,
          status: "trialing" as const,
          trialEndsAt: null,
          daysRemaining: null,
        };
      }

      const trialEnd = new Date(sub.trialEndsAt + "Z");
      const now = new Date();
      const diffMs = trialEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        return {
          valid: false,
          reason: "trial_expired" as const,
          status: "trialing" as const,
          trialEndsAt: sub.trialEndsAt,
          daysRemaining: 0,
        };
      }

      return {
        valid: true,
        status: "trialing" as const,
        trialEndsAt: sub.trialEndsAt,
        daysRemaining,
      };
    }

    // Expired or canceled
    return { valid: false, reason: "expired" as const, status: sub.status as "expired" | "canceled" };
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
