import { useEffect, useState } from 'react'

const FADE_IN_MS = 200
const HOLD_MS = 1500

export type DateOverlayVisibility = {
  visible: boolean
  dismiss: () => void
}

export function useDateOverlayVisibility(focusedIndex: number): DateOverlayVisibility {
  const [visible, setVisible] = useState(true)
  const [prevFocusedIndex, setPrevFocusedIndex] = useState(focusedIndex)

  // Reset synchronously during render, not via effect — an effect-based reset flashed stale state for one frame.
  if (focusedIndex !== prevFocusedIndex) {
    setPrevFocusedIndex(focusedIndex)
    setVisible(true)
  }

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), FADE_IN_MS + HOLD_MS)
    return () => clearTimeout(timer)
  }, [focusedIndex])

  return { visible, dismiss: () => setVisible(false) }
}
