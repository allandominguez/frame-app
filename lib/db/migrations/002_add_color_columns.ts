export const migration = `
  ALTER TABLE day_entries ADD COLUMN accent_color TEXT;
  ALTER TABLE day_entries ADD COLUMN share_color  TEXT;
`
