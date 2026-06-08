export const migrations: string[] = [
  // v1: initial schema — day_entries and settings
  `
    CREATE TABLE IF NOT EXISTS day_entries (
      date             TEXT PRIMARY KEY NOT NULL,
      photo_path       TEXT,
      note_text        TEXT,
      latitude         REAL,
      longitude        REAL,
      location_name    TEXT,
      location_source  TEXT,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key    TEXT PRIMARY KEY NOT NULL,
      value  TEXT
    );
  `,
]
