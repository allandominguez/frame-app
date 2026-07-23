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
    `INSERT INTO day_entries (date, photo_path, note_text, latitude, longitude, location_name, location_source, accent_color, share_color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       photo_path      = excluded.photo_path,
       note_text       = excluded.note_text,
       latitude        = excluded.latitude,
       longitude       = excluded.longitude,
       location_name   = excluded.location_name,
       location_source = excluded.location_source,
       accent_color    = excluded.accent_color,
       share_color     = excluded.share_color,
       updated_at      = excluded.updated_at`,
    [
      input.date,
      input.photo_path,
      input.note_text,
      input.latitude,
      input.longitude,
      input.location_name,
      input.location_source,
      input.accent_color,
      input.share_color,
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

export async function updateNoteText(date: string, noteText: string | null): Promise<void> {
  const db = await openDatabase()
  await db.runAsync('UPDATE day_entries SET note_text = ?, updated_at = ? WHERE date = ?', [
    noteText,
    new Date().toISOString(),
    date,
  ])
}

export async function clearPhoto(date: string): Promise<void> {
  const db = await openDatabase()
  await db.runAsync(
    `UPDATE day_entries SET
       photo_path      = NULL,
       latitude        = NULL,
       longitude       = NULL,
       location_name   = NULL,
       location_source = NULL,
       accent_color    = NULL,
       share_color     = NULL,
       updated_at      = ?
     WHERE date = ?`,
    [new Date().toISOString(), date],
  )
}
