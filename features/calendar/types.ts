export type CalendarDayData = {
  date: string | null // null for leading empty cells
  dayNumber: number // 0 for empty cells, 1–31 for real days
  accentColor: string | null
  hasPhoto: boolean
  isToday: boolean
  isFuture: boolean
}

export type MonthData = {
  year: number
  month: number // 1–12
}
