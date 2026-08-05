import { Directory, File, Paths } from 'expo-file-system'

const LOG_DIR_NAME = 'logs'
const LOG_FILE_NAME = 'trace.log'
const MAX_BYTES = 20_000

function getLogFile(): File {
  const dir = new Directory(Paths.document, LOG_DIR_NAME)
  dir.create({ idempotent: true })
  return new File(dir, LOG_FILE_NAME)
}

// Truncates from the head, dropping the first partial line so every surviving line stays whole.
function capToMaxBytes(content: string): string {
  if (content.length <= MAX_BYTES) return content
  const trimmed = content.slice(content.length - MAX_BYTES)
  const firstNewline = trimmed.indexOf('\n')
  return firstNewline === -1 ? trimmed : trimmed.slice(firstNewline + 1)
}

// Small, scoped trail for the note-save/calendar-refresh journey only — not a general-purpose
// logger (see the Pit Stop item "Build a proper local observability/logging utility" for that).
// Runs in production so a real recurrence leaves a trail. Callers must only pass safe fields —
// dates, counts, lengths — never note text or precise coordinates. Never throws: diagnostics
// must not crash the app they're diagnosing.
export function trace(event: string, data?: Record<string, unknown>): void {
  console.log(event, data ?? {})
  try {
    const file = getLogFile()
    if (!file.exists) file.create()
    const line = `${new Date().toISOString()} ${event} ${JSON.stringify(data ?? {})}\n`
    const existing = file.exists ? file.textSync() : ''
    file.write(capToMaxBytes(existing + line))
  } catch {
    // Best-effort — a logging failure must never surface to the user.
  }
}

// For the hidden export action — null if nothing has been traced yet this install.
export function getTraceLogUri(): string | null {
  const file = getLogFile()
  return file.exists ? file.uri : null
}
