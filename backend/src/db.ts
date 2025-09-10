import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "app.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // migrations (idempotent)
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_user_id INTEGER NULL,
      name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      thumbnail_path TEXT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ).run();

  db.prepare(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      user_id INTEGER NULL,
      role TEXT NOT NULL CHECK (role IN ('user','assistant')),
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ).run();

  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_messages_character ON messages(character_id, created_at)`
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, created_at)`
  ).run();

  dbInstance = db;
  return dbInstance;
}

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: number;
};
