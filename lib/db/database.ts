import * as SQLite from 'expo-sqlite'

import { migrations } from './migrations'

let db: SQLite.SQLiteDatabase | null = null

const TRACED_METHODS = new Set(['getFirstAsync', 'getAllAsync', 'runAsync', 'execAsync'])

// Diagnostic wrapper for an unconfirmed report of a query hanging indefinitely after a
// capture-then-navigate sequence. Traces every call made through the shared connection —
// a hang shows up as a "start" log with no matching "done" — without any repository
// function needing to know tracing exists. Remove once the actual cause is confirmed.
function withTracing(database: SQLite.SQLiteDatabase): SQLite.SQLiteDatabase {
  return new Proxy(database, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'function' || typeof prop !== 'string' || !TRACED_METHODS.has(prop)) {
        return typeof value === 'function' ? value.bind(target) : value
      }

      const original = value as (...args: unknown[]) => Promise<unknown>
      return async (...args: unknown[]) => {
        const label = `[db] ${prop}(${JSON.stringify(args[0])})`
        const start = Date.now()
        console.log(`${label} start`)
        try {
          const result = await original.apply(target, args)
          console.log(`${label} done (${Date.now() - start}ms)`)
          return result
        } catch (error) {
          console.log(`${label} threw (${Date.now() - start}ms)`, error)
          throw error
        }
      }
    },
  })
}

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
    const raw = await SQLite.openDatabaseAsync('frame.db')
    await applyMigrations(raw)
    db = __DEV__ ? withTracing(raw) : raw
  }
  return db
}
