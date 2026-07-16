export type StreakData = {
  currentStreak: number
  longestStreak: number
}

export function computeStreaks(
  photoDates: string[],
  today: string = new Date().toISOString().slice(0, 10),
): StreakData {
  if (photoDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

  const sorted = [...photoDates].sort()
  const dateSet = new Set(sorted)

  // Longest streak: walk ascending and count consecutive days
  let longestStreak = 0
  let run = 0
  let prevDate: string | null = null

  for (const date of sorted) {
    if (prevDate === null) {
      run = 1
    } else {
      const diffMs = new Date(date).getTime() - new Date(prevDate).getTime()
      run = Math.round(diffMs / 86_400_000) === 1 ? run + 1 : 1
    }
    longestStreak = Math.max(longestStreak, run)
    prevDate = date
  }

  // Current streak: walk backwards from today (or yesterday if today has no photo yet)
  const d = new Date(today + 'T00:00:00.000Z')
  d.setUTCDate(d.getUTCDate() - 1)
  const yesterday = d.toISOString().slice(0, 10)

  const anchor = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null
  if (!anchor) return { currentStreak: 0, longestStreak }

  let currentStreak = 0
  const cursor = new Date(anchor + 'T00:00:00.000Z')
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    currentStreak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return { currentStreak, longestStreak }
}
