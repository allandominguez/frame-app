import { useCallback, useMemo, useState } from 'react'
import { DayEntry, getAllDays } from '../../../lib/repositories/day'
import { computeStreaks } from '../streaks'
import { MonthData } from '../types'
import { getMonthsUpToNow } from '../utils'

type CalendarData = {
  entriesByDate: Record<string, DayEntry>
  months: MonthData[]
  today: string
  currentStreak: number
  longestStreak: number
  isLoading: boolean
  refresh: () => void
}

export function useCalendarData(): CalendarData {
  const [entries, setEntries] = useState<DayEntry[]>([])
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10))
  const [isLoading, setIsLoading] = useState(true)

  // No mount-effect here — CalendarScreen's useFocusEffect already calls refresh()
  // on initial focus, which fires on mount too. A second effect here previously
  // caused two concurrent getAllDays() calls on the shared SQLite connection,
  // a confirmed cause of a native NullPointerException on Android.
  const load = useCallback(async () => {
    setToday(new Date().toISOString().slice(0, 10))
    const all = await getAllDays()
    setEntries(all)
    setIsLoading(false)
  }, [])

  const entriesByDate = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.date, e])),
    [entries],
  )

  const photoDates = useMemo(
    () => entries.filter((e) => e.photo_path).map((e) => e.date),
    [entries],
  )

  const { currentStreak, longestStreak } = useMemo(
    () => computeStreaks(photoDates, today),
    [photoDates, today],
  )

  const months = useMemo(() => {
    // Show at least 6 months of history so new users have months to scroll through.
    // If the earliest entry predates that window, extend back to cover it.
    const floor = new Date(today + 'T00:00:00.000Z')
    floor.setUTCMonth(floor.getUTCMonth() - 6)
    let startYear = floor.getUTCFullYear()
    let startMonth = floor.getUTCMonth() + 1

    if (entries.length > 0) {
      const earliest = entries[entries.length - 1].date
      const ey = parseInt(earliest.slice(0, 4), 10)
      const em = parseInt(earliest.slice(5, 7), 10)
      if (ey < startYear || (ey === startYear && em < startMonth)) {
        startYear = ey
        startMonth = em
      }
    }

    return getMonthsUpToNow(startYear, startMonth)
  }, [entries, today])

  return { entriesByDate, months, today, currentStreak, longestStreak, isLoading, refresh: load }
}
