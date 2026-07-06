CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  session TEXT NOT NULL,
  child_age TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
