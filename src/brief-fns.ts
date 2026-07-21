import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

// Helper: validate session token, return userId or throw
function validateToken(token: string): number {
  if (!token) throw new Error("Authentication required");
  const session = db.getUserBySessionToken(token);
  if (!session) throw new Error("Session expired or invalid");
  return session.userId;
}

// Start a new brief or resume existing draft
export const startOrResumeBrief = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const existing = db.getLatestDraftBrief(userId);
    if (existing) {
      return {
        brief: {
          id: existing.id,
          user_id: existing.user_id,
          title: existing.title,
          status: existing.status,
          answers: JSON.parse(existing.answers),
          created_at: existing.created_at,
          updated_at: existing.updated_at,
        },
        isResumed: true,
      };
    }
    const brief = db.createBrief(userId);
    return {
      brief: {
        id: brief.id,
        user_id: brief.user_id,
        title: brief.title,
        status: brief.status,
        answers: {},
        created_at: brief.created_at,
        updated_at: brief.updated_at,
      },
      isResumed: false,
    };
  });

// Save answers for a step (auto-save)
export const saveBriefStep = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as {
        token: string;
        briefId: number;
        answers: Record<string, unknown>;
        title?: string;
      };
      if (!d.token || !d.briefId) throw new Error("Brief ID and token are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const brief = db.getBriefById(data.briefId);
    if (!brief || brief.user_id !== userId) {
      throw new Error("Brief not found");
    }
    // Merge new answers with existing
    const existing = JSON.parse(brief.answers || "{}");
    const merged = { ...existing, ...data.answers };
    if (data.title !== undefined) {
      db.updateBriefTitleAndAnswers(data.briefId, data.title, JSON.stringify(merged));
    } else {
      db.updateBriefAnswers(data.briefId, JSON.stringify(merged));
    }
    return { success: true };
  });

// Submit the brief (mark complete)
export const submitBrief = createServerFn()
  .validator(
    (data: unknown) => {
      const d = data as { token: string; briefId: number };
      if (!d.token || !d.briefId) throw new Error("Brief ID and token are required");
      return d;
    }
  )
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const brief = db.getBriefById(data.briefId);
    if (!brief || brief.user_id !== userId) {
      throw new Error("Brief not found");
    }
    db.submitBrief(data.briefId);
    return { success: true };
  });

// Get all briefs for a user
export const listBriefs = createServerFn()
  .validator((data: unknown) => data as { token: string })
  .handler(async ({ data }) => {
    const userId = validateToken(data.token);
    const briefs = db.listBriefs(userId);
    return briefs.map((b) => ({
      id: b.id,
      title: b.title,
      status: b.status,
      answers: JSON.parse(b.answers || "{}"),
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));
  });
