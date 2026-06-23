import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In Cloud Run, local files are ephemeral between container cold restarts.
// This is an embedded SQLite fallback since CloudSQL provision failed.
const db = new Database(path.join(dataDir, 'database.sqlite'));

db.pragma('journal_mode = WAL');

// Initial Setup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT
  );

  INSERT OR IGNORE INTO users (id, name, email, role) VALUES 
    ('u1', 'Ketua Panitia', 'ketua@reuni2001.com', 'admin'),
    ('u2', 'Seksi Acara', 'acara@reuni2001.com', 'member'),
    ('u3', 'Seksi Dana', 'dana@reuni2001.com', 'member'),
    ('u4', 'Seksi Publikasi', 'humas@reuni2001.com', 'member');

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'not yet',
    picId TEXT,
    milestone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    taskId TEXT NOT NULL,
    userId TEXT,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    taskId TEXT NOT NULL,
    fileName TEXT NOT NULL,
    url TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

export default db;
