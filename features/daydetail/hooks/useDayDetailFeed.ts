import { useEffect, useState } from 'react'
import { trace } from '../../../lib/logging/trace'
import { DayEntry, getAllDays } from '../../../lib/repositories/day'

export type DayDetailFeed = {
  entries: DayEntry[]
  initialIndex: number
  isLoading: boolean
}

export function useDayDetailFeed(initialDate: string): DayDetailFeed {
  const [entries, setEntries] = useState<DayEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    trace('[useDayDetailFeed] fetching all days', { initialDate })
    getAllDays().then((all) => {
      if (cancelled) return
      const withPhotos = all
        .filter((entry) => entry.photo_path)
        .sort((a, b) => a.date.localeCompare(b.date))
      trace('[useDayDetailFeed] fetched', {
        initialDate,
        count: withPhotos.length,
      })
      setEntries(withPhotos)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resolvedIndex = entries.findIndex((entry) => entry.date === initialDate)
  const initialIndex = resolvedIndex === -1 ? 0 : resolvedIndex

  return { entries, initialIndex, isLoading }
}
