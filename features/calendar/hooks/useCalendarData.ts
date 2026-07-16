import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const load = useCallback(async () => {
    setToday(new Date().toISOString().slice(0, 10))
    const all = await getAllDays()
    setEntries(all)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

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
    // getAllDays returns DESC; last entry is the oldest
    const earliestDate = entries.length > 0 ? entries[entries.length - 1].date : today
    const startYear = parseInt(earliestDate.slice(0, 4), 10)
    const startMonth = parseInt(earliestDate.slice(5, 7), 10)
    return getMonthsUpToNow(startYear, startMonth)
  }, [entries, today])

  return { entriesByDate, months, today, currentStreak, longestStreak, isLoading, refresh: load }
}
