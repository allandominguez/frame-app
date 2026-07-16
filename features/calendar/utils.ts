import { DayEntry } from '../../lib/repositories/day'
import { CalendarDayData, MonthData } from './types'

export function buildMonthCells(
  year: number,
  month: number,
  entriesByDate: Record<string, DayEntry>,
  today: string,
): CalendarDayData[] {
  const firstDayOfMonth = new Date(year, month - 1, 1)
  // JS getDay() is Sun=0..Sat=6; convert to Mon=0..Sun=6 for Monday-first weeks
  const leadingEmpties = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: CalendarDayData[] = []

  for (let i = 0; i < leadingEmpties; i++) {
    cells.push({ date: null, dayNumber: 0, accentColor: null, hasPhoto: false, isToday: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const entry = entriesByDate[date]
    cells.push({
      date,
      dayNumber: day,
      accentColor: entry?.accent_color ?? null,
      hasPhoto: !!entry?.photo_path,
      isToday: date === today,
    })
  }

  return cells
}

export function getMonthsUpToNow(
  startYear: number,
  startMonth: number,
  now: Date = new Date(),
): MonthData[] {
  const endYear = now.getFullYear()
  const endMonth = now.getMonth() + 1 // 1–12

  const months: MonthData[] = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month })
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return months
}
