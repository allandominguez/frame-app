import { useState } from 'react'

export type DetailOverlayVisibility = {
  visible: boolean
  toggle: () => void
  close: () => void
}

export function useDetailOverlayVisibility(focusedIndex: number): DetailOverlayVisibility {
  const [visible, setVisible] = useState(false)
  const [prevFocusedIndex, setPrevFocusedIndex] = useState(focusedIndex)

  // Reset synchronously during render — see useDateOverlayVisibility for why an effect-based reset flashes stale state.
  if (focusedIndex !== prevFocusedIndex) {
    setPrevFocusedIndex(focusedIndex)
    setVisible(false)
  }

  return {
    visible,
    toggle: () => setVisible((current) => !current),
    close: () => setVisible(false),
  }
}
