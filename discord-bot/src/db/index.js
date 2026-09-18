import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'bot.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'support',
  status TEXT NOT NULL DEFAULT 'open',
  claimed_by TEXT,
  claimed_by_tag TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT,
  closed_by TEXT,
  closed_by_tag TEXT
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  author_id TEXT NOT NULL,
  author_tag TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS convocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  staff_tag TEXT NOT NULL,
  reason TEXT NOT NULL,
  channel_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS patchnotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_tag TEXT NOT NULL,
  message_id TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sanctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  moderator_tag TEXT NOT NULL,
  reason TEXT,
  duration TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// ---------- Config ----------

export const DEFAULT_CONFIG = {
  // Bienvenue
  welcome_enabled: true,
  welcome_message:
    "👋 Bienvenue **{user}** sur **{server}** !\n\n" +
    "🎮 Ici on développe le **projet GTA6**.\n\n" +
    "📜 Pour accéder au serveur, accepte le règlement dans le salon règlement.\n" +
    "🎫 Besoin d'aide ? Ouvre un ticket.\n\nBon jeu !",
  // Règlement
  rules_channel_id: null,
  member_role_id: null,
  rules_text:
    "**1.** Respect entre tous les membres.\n" +
    "**2.** Pas de spam ni de pub.\n" +
    "**3.** Pas de contenu NSFW.\n" +
    "**4.** Les décisions du staff sont finales.\n" +
    "**5.** Aucune fuite du contenu du projet.",
  // Patch notes
  patchnotes_channel_id: null,
  // Tickets
  tickets_category_id: null,
  staff_role_id: null,
  // Convocations
  convocations_category_id: null,
  // Logs
  logs_channel_id: null,
  // Logs GitHub (commits)
  github_logs_channel_id: null,
  // Sécurité
  antispam_enabled: true,
  antispam_max_messages: 6,
  antispam_interval_seconds: 4,
  antispam_mute_minutes: 10,
  antiraid_enabled: true,
  antiraid_max_joins: 8,
  antiraid_interval_seconds: 30,
  antiinvite_enabled: true,
  antinuke_enabled: true,
  antinuke_max_actions: 5,
  antinuke_interval_seconds: 20,
};

const getStmt = db.prepare('SELECT value FROM config WHERE key = ?');
const setStmt = db.prepare(
  'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);

export function getConfig(key) {
  const row = getStmt.get(key);
  if (!row) return DEFAULT_CONFIG[key] ?? null;
  return JSON.parse(row.value);
}

export function setConfig(key, value) {
  setStmt.run(key, JSON.stringify(value));
}

export function getAllConfig() {
  const result = { ...DEFAULT_CONFIG };
  for (const row of db.prepare('SELECT key, value FROM config').all()) {
    result[row.key] = JSON.parse(row.value);
  }
  return result;
}

// ---------- Tickets ----------

export const Tickets = {
  create: (userId, userTag, category) =>
    db
      .prepare('INSERT INTO tickets (user_id, user_tag, category) VALUES (?, ?, ?)')
      .run(userId, userTag, category).lastInsertRowid,
  setChannel: (id, channelId) =>
    db.prepare('UPDATE tickets SET channel_id = ? WHERE id = ?').run(channelId, id),
  claim: (id, staffId, staffTag) =>
    db
      .prepare('UPDATE tickets SET claimed_by = ?, claimed_by_tag = ? WHERE id = ?')
      .run(staffId, staffTag, id),
  close: (id, byId, byTag) =>
    db
      .prepare(
        "UPDATE tickets SET status = 'closed', closed_at = datetime('now'), closed_by = ?, closed_by_tag = ? WHERE id = ?"
      )
      .run(byId, byTag, id),
  byChannel: (channelId) =>
    db.prepare("SELECT * FROM tickets WHERE channel_id = ? AND status = 'open'").get(channelId),
  byId: (id) => db.prepare('SELECT * FROM tickets WHERE id = ?').get(id),
  openByUser: (userId) =>
    db.prepare("SELECT * FROM tickets WHERE user_id = ? AND status = 'open'").get(userId),
  all: () => db.prepare('SELECT * FROM tickets ORDER BY id DESC').all(),
  countOpen: () => db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE status = 'open'").get().n,
  addMessage: (ticketId, authorId, authorTag, content) =>
    db
      .prepare(
        'INSERT INTO ticket_messages (ticket_id, author_id, author_tag, content) VALUES (?, ?, ?, ?)'
      )
      .run(ticketId, authorId, authorTag, content),
  messages: (ticketId) =>
    db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY id').all(ticketId),
};

// ---------- Convocations ----------

export const Convocations = {
  create: (userId, userTag, staffId, staffTag, reason) =>
    db
      .prepare(
        'INSERT INTO convocations (user_id, user_tag, staff_id, staff_tag, reason) VALUES (?, ?, ?, ?, ?)'
      )
      .run(userId, userTag, staffId, staffTag, reason).lastInsertRowid,
  setChannel: (id, channelId) =>
    db.prepare('UPDATE convocations SET channel_id = ? WHERE id = ?').run(channelId, id),
  close: (id) =>
    db
      .prepare("UPDATE convocations SET status = 'closed', closed_at = datetime('now') WHERE id = ?")
      .run(id),
  byChannel: (channelId) =>
    db
      .prepare("SELECT * FROM convocations WHERE channel_id = ? AND status = 'open'")
      .get(channelId),
  all: () => db.prepare('SELECT * FROM convocations ORDER BY id DESC').all(),
};

// ---------- Patch notes ----------

export const PatchNotes = {
  create: (version, title, content, authorId, authorTag) =>
    db
      .prepare(
        'INSERT INTO patchnotes (version, title, content, author_id, author_tag) VALUES (?, ?, ?, ?, ?)'
      )
      .run(version, title, content, authorId, authorTag).lastInsertRowid,
  setMessage: (id, messageId) =>
    db.prepare('UPDATE patchnotes SET message_id = ? WHERE id = ?').run(messageId, id),
  all: () => db.prepare('SELECT * FROM patchnotes ORDER BY id DESC').all(),
  byId: (id) => db.prepare('SELECT * FROM patchnotes WHERE id = ?').get(id),
};

// ---------- Sanctions ----------

export const Sanctions = {
  add: (type, userId, userTag, modId, modTag, reason, duration = null) =>
    db
      .prepare(
        'INSERT INTO sanctions (type, user_id, user_tag, moderator_id, moderator_tag, reason, duration) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(type, userId, userTag, modId, modTag, reason, duration).lastInsertRowid,
  all: (limit = 200) =>
    db.prepare('SELECT * FROM sanctions ORDER BY id DESC LIMIT ?').all(limit),
  byUser: (userId) =>
    db.prepare('SELECT * FROM sanctions WHERE user_id = ? ORDER BY id DESC').all(userId),
  countRecent: (days = 7) =>
    db
      .prepare("SELECT COUNT(*) AS n FROM sanctions WHERE created_at >= datetime('now', ?)")
      .get(`-${days} days`).n,
};
