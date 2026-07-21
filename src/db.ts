import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "esimplicity.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");

    // Create tables
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        subscription_status TEXT NOT NULL DEFAULT 'pending',
        trial_ends_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Migration: add subscription columns if they don't exist (safe for existing DBs)
      `);

    // Run column migrations safely by checking if columns exist
    try {
      const cols = _db.pragma("table_info(users)") as { name: string }[];
      const colNames = cols.map((c) => c.name);

      if (!colNames.includes("subscription_status")) {
        _db.exec(`ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'pending'`);
      }
      if (!colNames.includes("trial_ends_at")) {
        _db.exec(`ALTER TABLE users ADD COLUMN trial_ends_at TEXT`);
      }
    } catch {
      // Columns already exist — ignore
    }

    _db.exec(`

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS project_briefs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        answers TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS business_blueprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        brief_id INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'generating',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (brief_id) REFERENCES project_briefs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'guides',
        emoji TEXT NOT NULL DEFAULT '📄',
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      `);
  }
  return _db;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface UserSession {
  userId: number;
  name: string;
  email: string;
  sessionToken: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
}

export interface ProjectBrief {
  id: number;
  user_id: number;
  title: string;
  status: string;
  answers: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessBlueprint {
  id: number;
  user_id: number;
  brief_id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

export interface Asset {
  id: number;
  title: string;
  description: string;
  category: string;
  emoji: string;
  body: string;
  created_at: string;
}

export const db = {
  // Users
  createUser(email: string, passwordHash: string, name: string): User {
    const stmt = getDb().prepare(
      "INSERT INTO users (email, password_hash, name, subscription_status) VALUES (?, ?, ?, 'pending')"
    );
    const result = stmt.run(email, passwordHash, name);
    return this.getUserById(Number(result.lastInsertRowid))!;
  },

  getUserById(id: number): User | undefined {
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | User
      | undefined;
  },

  getUserByEmail(email: string): User | undefined {
    return getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as User | undefined;
  },

  // Sessions
  createSession(userId: number, token: string): Session {
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ).toISOString();
    const stmt = getDb().prepare(
      "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
    );
    const result = stmt.run(userId, token, expiresAt);
    return this.getSessionByToken(token)!;
  },

  getSessionByToken(token: string): Session | undefined {
    return getDb()
      .prepare("SELECT * FROM sessions WHERE token = ?")
      .get(token) as Session | undefined;
  },

  getUserBySessionToken(token: string): UserSession | undefined {
    const row = getDb()
      .prepare(
        `SELECT u.id as userId, u.name, u.email, s.token as sessionToken,
                u.subscription_status as subscriptionStatus, u.trial_ends_at as trialEndsAt
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > datetime('now')`
      )
      .get(token) as UserSession | undefined;
    return row;
  },

  deleteSession(token: string): void {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  },

  deleteExpiredSessions(): void {
    getDb()
      .prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')")
      .run();
  },

  // Project Briefs
  createBrief(userId: number, title?: string): ProjectBrief {
    const stmt = getDb().prepare(
      "INSERT INTO project_briefs (user_id, title, status, answers) VALUES (?, ?, 'draft', '{}')"
    );
    const result = stmt.run(userId, title || "Untitled Brief");
    return this.getBriefById(Number(result.lastInsertRowid))!;
  },

  getBriefById(id: number): ProjectBrief | undefined {
    return getDb()
      .prepare("SELECT * FROM project_briefs WHERE id = ?")
      .get(id) as ProjectBrief | undefined;
  },

  getLatestDraftBrief(userId: number): ProjectBrief | undefined {
    return getDb()
      .prepare(
        "SELECT * FROM project_briefs WHERE user_id = ? AND status = 'draft' ORDER BY updated_at DESC LIMIT 1"
      )
      .get(userId) as ProjectBrief | undefined;
  },

  updateBriefAnswers(id: number, answers: string): void {
    getDb()
      .prepare(
        "UPDATE project_briefs SET answers = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .run(answers, id);
  },

  updateBriefTitleAndAnswers(id: number, title: string, answers: string): void {
    getDb()
      .prepare(
        "UPDATE project_briefs SET title = ?, answers = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .run(title, answers, id);
  },

  submitBrief(id: number): void {
    getDb()
      .prepare(
        "UPDATE project_briefs SET status = 'complete', updated_at = datetime('now') WHERE id = ?"
      )
      .run(id);
  },

  listBriefs(userId: number): ProjectBrief[] {
    return getDb()
      .prepare(
        "SELECT * FROM project_briefs WHERE user_id = ? ORDER BY updated_at DESC"
      )
      .all(userId) as ProjectBrief[];
  },

  getBriefCount(userId: number): number {
    const row = getDb()
      .prepare(
        "SELECT COUNT(*) as count FROM project_briefs WHERE user_id = ?"
      )
      .get(userId) as { count: number };
    return row.count;
  },

  // Business Blueprints
  createBlueprint(userId: number, briefId: number, title: string): BusinessBlueprint {
    const stmt = getDb().prepare(
      "INSERT INTO business_blueprints (user_id, brief_id, title, content, status) VALUES (?, ?, ?, '{}', 'generating')"
    );
    const result = stmt.run(userId, briefId, title);
    return this.getBlueprintById(Number(result.lastInsertRowid))!;
  },

  getBlueprintById(id: number): BusinessBlueprint | undefined {
    return getDb()
      .prepare("SELECT * FROM business_blueprints WHERE id = ?")
      .get(id) as BusinessBlueprint | undefined;
  },

  getBlueprintByBriefId(briefId: number): BusinessBlueprint | undefined {
    return getDb()
      .prepare("SELECT * FROM business_blueprints WHERE brief_id = ?")
      .get(briefId) as BusinessBlueprint | undefined;
  },

  updateBlueprintContent(id: number, title: string, content: string, status: string): void {
    getDb()
      .prepare(
        "UPDATE business_blueprints SET title = ?, content = ?, status = ? WHERE id = ?"
      )
      .run(title, content, status, id);
  },

  updateBlueprintStatus(id: number, status: string): void {
    getDb()
      .prepare("UPDATE business_blueprints SET status = ? WHERE id = ?")
      .run(status, id);
  },

  listBlueprints(userId: number): BusinessBlueprint[] {
    return getDb()
      .prepare(
        "SELECT * FROM business_blueprints WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId) as BusinessBlueprint[];
  },

  getBlueprintCount(userId: number): number {
    const row = getDb()
      .prepare(
        "SELECT COUNT(*) as count FROM business_blueprints WHERE user_id = ?"
      )
      .get(userId) as { count: number };
    return row.count;
  },

  // Assets
  listAssets(category?: string): Asset[] {
    if (category && category !== "all") {
      return getDb()
        .prepare("SELECT * FROM assets WHERE category = ? ORDER BY title")
        .all(category) as Asset[];
    }
    return getDb()
      .prepare("SELECT * FROM assets ORDER BY category, title")
      .all() as Asset[];
  },

  getAssetById(id: number): Asset | undefined {
    return getDb()
      .prepare("SELECT * FROM assets WHERE id = ?")
      .get(id) as Asset | undefined;
  },

  getAssetCount(): number {
    const row = getDb()
      .prepare("SELECT COUNT(*) as count FROM assets")
      .get() as { count: number };
    return row.count;
  },

  seedAssets(assets: Omit<Asset, "id" | "created_at">[]): void {
    if (this.getAssetCount() > 0) return; // already seeded
    const stmt = getDb().prepare(
      "INSERT INTO assets (title, description, category, emoji, body) VALUES (?, ?, ?, ?, ?)"
    );
    const insertMany = getDb().transaction((items: Omit<Asset, "id" | "created_at">[]) => {
      for (const a of items) {
        stmt.run(a.title, a.description, a.category, a.emoji, a.body);
      }
    });
    insertMany(assets);
  },

  // Subscription
  getSubscription(userId: number): { status: string; trialEndsAt: string | null } | undefined {
    const row = getDb()
      .prepare("SELECT subscription_status, trial_ends_at FROM users WHERE id = ?")
      .get(userId) as { subscription_status: string; trial_ends_at: string | null } | undefined;
    if (!row) return undefined;
    return { status: row.subscription_status, trialEndsAt: row.trial_ends_at };
  },

  updateSubscriptionStatus(userId: number, status: string): void {
    getDb()
      .prepare("UPDATE users SET subscription_status = ? WHERE id = ?")
      .run(status, userId);
  },
};
