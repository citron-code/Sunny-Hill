-- The site's database (Cloudflare D1, which is SQLite). Safe to run again: nothing is dropped.
-- No names, no e-mails: a student is a username (first name + first letter of the surname),
-- a class label and a PIN that is kept only as a keyed hash.

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  cls TEXT NOT NULL DEFAULT '',
  pin_hash TEXT NOT NULL,
  pin_salt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER NOT NULL DEFAULT 0,
  fails INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);

-- a login on a device (the cookie holds the token; only its hash is here)
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  role TEXT NOT NULL,                  -- 'student' or 'teacher'
  student_id INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;

-- one game's save for one student: its version (rev) and a short line for the teacher
CREATE TABLE IF NOT EXISTS save_meta (
  student_id INTEGER NOT NULL,
  game TEXT NOT NULL,
  rev INTEGER NOT NULL,
  played_at INTEGER NOT NULL,          -- when it was played (the device's clock)
  updated_at INTEGER NOT NULL,         -- when it reached the cloud
  backup_at INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  bytes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id, game)
) WITHOUT ROWID;

-- the save itself: the game's browser-storage keys, as they are
CREATE TABLE IF NOT EXISTS save_keys (
  student_id INTEGER NOT NULL,
  game TEXT NOT NULL,
  k TEXT NOT NULL,
  v TEXT NOT NULL,
  PRIMARY KEY (student_id, game, k)
) WITHOUT ROWID;

-- older copies of a save (every hour of play, and before anything replaces it): the last 12 are kept
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  game TEXT NOT NULL,
  saved_at INTEGER NOT NULL,
  reason TEXT NOT NULL,                -- hourly, conflict, device, old-site, before-restore
  summary TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS backups_of ON backups (student_id, game);

-- one-time codes for bringing an old save over from the old address
CREATE TABLE IF NOT EXISTS codes (
  code_hash TEXT PRIMARY KEY,
  student_id INTEGER NOT NULL,
  game TEXT NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
) WITHOUT ROWID;
