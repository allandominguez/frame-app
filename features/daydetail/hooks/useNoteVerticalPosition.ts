import { useEffect, useRef, useState } from 'react'
import { Animated, Keyboard, KeyboardEvent } from 'react-native'

// A band (not a single point) so the note can grow across multiple lines
// while staying vertically centred around ~60% of the page, expanding both
// up and down via plain flexbox centring rather than manual measurement.
export const NOTE_BAND_TOP = 0.4
export const NOTE_BAND_BOTTOM = 0.8

const BOTTOM_PADDING = 16
const TRANSITION_MS = 200

// Only shifts the band up when the keyboard would actually cover its bottom
// edge, and only by however much overlap there is — not a blind full-height
// jump, since the band is usually well above the keyboard already.
export function computeKeyboardShift(pageHeight: number, keyboardHeight: number): number {
  const bandBottom = NOTE_BAND_BOTTOM * pageHeight
  const visibleBottom = pageHeight - keyboardHeight - BOTTOM_PADDING
  const overlap = Math.max(0, bandBottom - visibleBottom)
  return overlap === 0 ? 0 : -overlap
}

export function useNoteVerticalPosition(pageHeight: number): Animated.Value {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const translateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) =>
      setKeyboardHeight(event.endCoordinates.height),
    )
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useEffect(() => {
    const animation = Animated.timing(translateY, {
      toValue: computeKeyboardShift(pageHeight, keyboardHeight),
      duration: TRANSITION_MS,
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [pageHeight, keyboardHeight, translateY])

  return translateY
}
