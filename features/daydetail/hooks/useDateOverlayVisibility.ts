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

  // Flip back to visible synchronously during render, not in an effect —
  // an effect-based reset lags one commit behind the focusedIndex change,
  // which painted a stale value from the previously-focused page for one
  // frame on every swipe.
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
