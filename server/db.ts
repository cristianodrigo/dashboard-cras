import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "dashboard.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    -- Status manual de cada CRA (verde/amarelo/vermelho)
    CREATE TABLE IF NOT EXISTS manual_status (
      cra_name  TEXT PRIMARY KEY,
      status    TEXT NOT NULL CHECK(status IN ('verde','amarelo','vermelho')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- CRAs que o usuário marcou como excluídos da visualização
    CREATE TABLE IF NOT EXISTS deleted_cras (
      cra_name   TEXT PRIMARY KEY,
      deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Garantias editadas pelo usuário (campos valor_minimo e valor_coberto)
    CREATE TABLE IF NOT EXISTS garantias_editaveis (
      cra_name      TEXT PRIMARY KEY,
      valor_minimo  TEXT,
      valor_coberto TEXT,
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Log de uploads de planilha CSV
    CREATE TABLE IF NOT EXISTS upload_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      filename    TEXT NOT NULL,
      cras_count  INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default db;
