CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_path TEXT UNIQUE,
  name TEXT,
  extension TEXT,
  size INTEGER,
  created_at TEXT,
  status TEXT DEFAULT 'unassigned',
  copied_path TEXT,
  source_root TEXT,
  dest_root TEXT
);