import { useState } from 'react'

export type DayActionTarget = {
  date: string
  photoPath: string
}

export function useDayActionMenu() {
  const [target, setTarget] = useState<DayActionTarget | null>(null)

  const open = (date: string, photoPath: string) => setTarget({ date, photoPath })
  const close = () => setTarget(null)

  return { target, open, close }
}
