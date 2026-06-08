import { openDatabase } from '../db/database'

export async function getSetting(key: string): Promise<string | null> {
  const db = await openDatabase()
  const row = await db.getFirstAsync<{ value: string | null }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  )
  return row?.value ?? null
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  const db = await openDatabase()
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  )
}
