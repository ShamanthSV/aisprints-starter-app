-- Users table for Sprint 1 email/password auth (ISO-8601 timestamps in TEXT)
CREATE TABLE users (
	id TEXT PRIMARY KEY NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	name TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
