import { openDatabase } from '../db/database'

export type DayEntry = {
  date: string
  photo_path: string | null
  note_text: string | null
  latitude: number | null
  longitude: number | null
  location_name: string | null
  location_source: 'exif' | 'device' | 'place' | null
  created_at: string
  updated_at: string
  accent_color: string | null
  share_color: string | null
}

export type DayEntryInput = Omit<DayEntry, 'created_at' | 'updated_at'>

export async function upsertDay(input: DayEntryInput): Promise<void> {
  const db = await openDatabase()
  const now = new Date().toISOString()
  await db.runAsync(
    `INSERT INTO day_entries (date, photo_path, note_text, latitude, longitude, location_name, location_source, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       photo_path      = excluded.photo_path,
       note_text       = excluded.note_text,
       latitude        = excluded.latitude,
       longitude       = excluded.longitude,
       location_name   = excluded.location_name,
       location_source = excluded.location_source,
       updated_at      = excluded.updated_at`,
    [
      input.date,
      input.photo_path,
      input.note_text,
      input.latitude,
      input.longitude,
      input.location_name,
      input.location_source,
      now,
      now,
    ],
  )
}

export async function getDay(date: string): Promise<DayEntry | null> {
  const db = await openDatabase()
  return db.getFirstAsync<DayEntry>('SELECT * FROM day_entries WHERE date = ?', [date])
}

export async function getAllDays(): Promise<DayEntry[]> {
  const db = await openDatabase()
  return db.getAllAsync<DayEntry>('SELECT * FROM day_entries ORDER BY date DESC')
}

export async function deleteDay(date: string): Promise<void> {
  const db = await openDatabase()
  await db.runAsync('DELETE FROM day_entries WHERE date = ?', [date])
}
