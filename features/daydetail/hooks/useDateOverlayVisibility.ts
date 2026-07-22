import { useEffect, useState } from 'react'

const FADE_IN_MS = 200
const HOLD_MS = 1500

export type DateOverlayVisibility = {
  visible: boolean
  dismiss: () => void
}

export function useDateOverlayVisibility(isFocused: boolean): DateOverlayVisibility {
  const [visible, setVisible] = useState(isFocused)

  useEffect(() => {
    if (!isFocused) {
      setVisible(false)
      return
    }

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), FADE_IN_MS + HOLD_MS)
    return () => clearTimeout(timer)
  }, [isFocused])

  return { visible, dismiss: () => setVisible(false) }
}
