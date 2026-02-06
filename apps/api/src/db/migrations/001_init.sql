-- v1 schema scaffold for Manipura API.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_couple_user
  ON memberships(couple_id, user_id);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id)
);
CREATE INDEX IF NOT EXISTS idx_threads_couple_created
  ON threads(couple_id, created_at);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  sender_user_id TEXT,
  source_text TEXT NOT NULL,
  mediated_text TEXT,
  tone TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_couple_thread_created
  ON messages(couple_id, thread_id, created_at);

CREATE TABLE IF NOT EXISTS mediation_events (
  id TEXT PRIMARY KEY,
  couple_id TEXT,
  thread_id TEXT,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  tone TEXT NOT NULL,
  runtime TEXT NOT NULL,
  fallback_reason TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mediation_events_couple_created
  ON mediation_events(couple_id, created_at);
