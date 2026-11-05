CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  session TEXT NOT NULL,
  child_age TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS giftaid_declarations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  amount REAL,
  frequency TEXT,
  method TEXT NOT NULL,
  stripe_session_id TEXT,
  declaration_version TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
