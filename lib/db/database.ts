import * as SQLite from 'expo-sqlite'

import { migrations } from './migrations'

let db: SQLite.SQLiteDatabase | null = null

async function applyMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  const version = row?.user_version ?? 0

  for (let i = version; i < migrations.length; i++) {
    await database.execAsync(migrations[i])
    // Integer interpolation is safe — i is always a loop-controlled number.
    await database.execAsync(`PRAGMA user_version = ${i + 1}`)
  }
}

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('frame.db')
    await applyMigrations(db)
  }
  return db
}
