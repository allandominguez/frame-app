import { DayEntry } from '../../../lib/repositories/day'
import { buildMonthCells, getMonthsUpToNow } from '../utils'

const noEntries: Record<string, DayEntry> = {}

function makeEntry(date: string, accentColor: string | null = null): DayEntry {
  return {
    date,
    photo_path: `/photos/${date}.jpg`,
    note_text: null,
    latitude: null,
    longitude: null,
    location_name: null,
    location_source: null,
    created_at: `${date}T12:00:00.000Z`,
    updated_at: `${date}T12:00:00.000Z`,
    accent_color: accentColor,
    share_color: null,
  }
}

describe('buildMonthCells', () => {
  it('produces 2 leading empty cells for a month starting on Wednesday', () => {
    // July 2026: 1st is a Wednesday → 2 leading empty cells (Mon, Tue)
    const cells = buildMonthCells(2026, 7, noEntries, '2026-07-16')
    expect(cells[0].date).toBeNull()
    expect(cells[1].date).toBeNull()
    expect(cells[2].date).toBe('2026-07-01')
    expect(cells[2].dayNumber).toBe(1)
  })

  it('produces zero leading empty cells for a month starting on Monday', () => {
    // June 2026: 1st is a Monday → no leading empties
    const cells = buildMonthCells(2026, 6, noEntries, '2026-06-01')
    expect(cells[0].date).toBe('2026-06-01')
    expect(cells[0].dayNumber).toBe(1)
  })

  it('generates one cell per day in the month', () => {
    // July has 31 days
    const cells = buildMonthCells(2026, 7, noEntries, '2026-07-16')
    const dayCells = cells.filter((c) => c.date !== null)
    expect(dayCells).toHaveLength(31)
  })

  it('marks only today as isToday', () => {
    const cells = buildMonthCells(2026, 7, noEntries, '2026-07-16')
    const today = cells.find((c) => c.date === '2026-07-16')
    const other = cells.find((c) => c.date === '2026-07-15')
    expect(today?.isToday).toBe(true)
    expect(other?.isToday).toBe(false)
  })

  it('sets hasPhoto and accentColor from the entries map', () => {
    const entries: Record<string, DayEntry> = {
      '2026-07-10': makeEntry('2026-07-10', '#4A90E2'),
    }
    const cells = buildMonthCells(2026, 7, entries, '2026-07-16')
    const day10 = cells.find((c) => c.date === '2026-07-10')
    expect(day10?.hasPhoto).toBe(true)
    expect(day10?.accentColor).toBe('#4A90E2')
  })

  it('marks days after today as future and days on or before today as not future', () => {
    const cells = buildMonthCells(2026, 7, noEntries, '2026-07-16')
    expect(cells.find((c) => c.date === '2026-07-17')?.isFuture).toBe(true)
    expect(cells.find((c) => c.date === '2026-07-16')?.isFuture).toBe(false)
    expect(cells.find((c) => c.date === '2026-07-15')?.isFuture).toBe(false)
  })

  it('marks days without entries as having no photo', () => {
    const cells = buildMonthCells(2026, 7, noEntries, '2026-07-16')
    const day11 = cells.find((c) => c.date === '2026-07-11')
    expect(day11?.hasPhoto).toBe(false)
    expect(day11?.accentColor).toBeNull()
  })

  it('falls back to textTertiary colour for a photo day with no accent_color', () => {
    const entry = makeEntry('2026-07-10')
    entry.accent_color = null
    const cells = buildMonthCells(2026, 7, { '2026-07-10': entry }, '2026-07-16')
    const day10 = cells.find((c) => c.date === '2026-07-10')
    // hasPhoto is still true; accentColor is null — DayCell handles the fallback colour
    expect(day10?.hasPhoto).toBe(true)
    expect(day10?.accentColor).toBeNull()
  })
})

describe('getMonthsUpToNow', () => {
  it('returns months from start to the given date inclusive', () => {
    const months = getMonthsUpToNow(2026, 6, new Date(2026, 6, 16)) // July 2026
    expect(months).toHaveLength(2)
    expect(months[0]).toEqual({ year: 2026, month: 6 })
    expect(months[1]).toEqual({ year: 2026, month: 7 })
  })

  it('returns a single entry when start equals now', () => {
    const months = getMonthsUpToNow(2026, 7, new Date(2026, 6, 16))
    expect(months).toHaveLength(1)
    expect(months[0]).toEqual({ year: 2026, month: 7 })
  })

  it('crosses year boundaries correctly', () => {
    const months = getMonthsUpToNow(2025, 11, new Date(2026, 6, 16))
    expect(months).toHaveLength(9) // Nov, Dec 2025 + Jan–Jul 2026
    expect(months[0]).toEqual({ year: 2025, month: 11 })
    expect(months[8]).toEqual({ year: 2026, month: 7 })
  })
})
