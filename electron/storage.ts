import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";

export type JournalEntry = {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number | null;
};

interface JournalStorage {
  saveEntry(text: string): Promise<JournalEntry>;
  listEntries(limit?: number, offset?: number): Promise<JournalEntry[]>;
}

class SQLiteStorage implements JournalStorage {
  private db: Database.Database;
  private insertStmt: Database.Statement;
  private listStmt: Database.Statement;

  constructor(private readonly dbPath: string) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS entries (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER
        )
      `,
      )
      .run();

    this.insertStmt = this.db.prepare(
      "INSERT INTO entries (id, text, createdAt, updatedAt) VALUES (@id, @text, @createdAt, @updatedAt)",
    );
    this.listStmt = this.db.prepare("SELECT id, text, createdAt, updatedAt FROM entries ORDER BY createdAt DESC LIMIT ? OFFSET ?");
  }

  async saveEntry(text: string): Promise<JournalEntry> {
    const entry = {
      id: randomUUID(),
      text,
      createdAt: Date.now(),
      updatedAt: null,
    };

    this.insertStmt.run(entry);
    return entry;
  }

  async listEntries(limit = 20, offset = 0): Promise<JournalEntry[]> {
    return this.listStmt.all(limit, offset) as JournalEntry[];
  }
}

class JsonStorage implements JournalStorage {
  private cache: JournalEntry[] = [];
  private readonly tempPath: string;

  constructor(private readonly filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.tempPath = `${filePath}.tmp`;

    if (fs.existsSync(filePath)) {
      try {
        const contents = fs.readFileSync(filePath, "utf8");
        this.cache = JSON.parse(contents) as JournalEntry[];
      } catch {
        this.cache = [];
      }
    }
  }

  async saveEntry(text: string): Promise<JournalEntry> {
    const entry: JournalEntry = { id: randomUUID(), text, createdAt: Date.now() };
    this.cache.unshift(entry);
    await this.write();
    return entry;
  }

  async listEntries(limit = 20, offset = 0): Promise<JournalEntry[]> {
    return this.cache.slice(offset, offset + limit);
  }

  private async write() {
    const payload = JSON.stringify(this.cache);
    await fs.promises.writeFile(this.tempPath, payload, "utf8");
    await fs.promises.rename(this.tempPath, this.filePath);
  }
}

export const createStorage = (basePath: string): JournalStorage => {
  const sqlitePath = path.join(basePath, "journal.db");
  try {
    return new SQLiteStorage(sqlitePath);
  } catch (error) {
    console.warn(`[storage] Falling back to JSON due to: ${String((error as Error)?.message ?? error)}`);
    const jsonPath = path.join(basePath, "journal.json");
    return new JsonStorage(jsonPath);
  }
};
