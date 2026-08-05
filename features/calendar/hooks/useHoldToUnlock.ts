import { useCallback, useEffect, useRef } from 'react'

const HOLD_DURATION_MS = 13_000

export type HoldToUnlock = {
  onPressIn: () => void
  onPressOut: () => void
  // Call from the button's onPress; returns true if that press just completed a long hold, so
  // the caller can skip its normal tap action instead of also firing it.
  consumeLongHold: () => boolean
}

// In-memory only — resets on app restart, unlike Android's own persistent Easter egg.
export function useHoldToUnlock(onUnlock: () => void): HoldToUnlock {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onPressIn = useCallback(() => {
    completedRef.current = false
    timerRef.current = setTimeout(() => {
      completedRef.current = true
      timerRef.current = null
      onUnlock()
    }, HOLD_DURATION_MS)
  }, [onUnlock])

  const consumeLongHold = useCallback(() => {
    const was = completedRef.current
    completedRef.current = false
    return was
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  return { onPressIn, onPressOut: clearTimer, consumeLongHold }
}
