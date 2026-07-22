import { useState } from 'react'

export type DetailOverlayVisibility = {
  visible: boolean
  toggle: () => void
  close: () => void
}

export function useDetailOverlayVisibility(focusedIndex: number): DetailOverlayVisibility {
  const [visible, setVisible] = useState(false)
  const [prevFocusedIndex, setPrevFocusedIndex] = useState(focusedIndex)

  // Reset synchronously during render, not via an effect — see
  // useDateOverlayVisibility for why an effect-based reset causes a
  // one-frame flash of the previous page's state on the newly-focused page.
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
