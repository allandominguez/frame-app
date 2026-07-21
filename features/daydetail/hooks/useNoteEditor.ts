import { useEffect, useRef, useState } from 'react'
import { updateNoteText } from '../../../lib/repositories/day'

const DEBOUNCE_MS = 600

export type NoteEditor = {
  value: string
  isEditing: boolean
  onChangeText: (text: string) => void
  onFocus: () => void
  onBlur: () => void
}

function normalize(text: string): string | null {
  return text.trim() === '' ? null : text
}

export function useNoteEditor(date: string, initialNoteText: string | null): NoteEditor {
  const [value, setValue] = useState(initialNoteText ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const valueRef = useRef(value)
  valueRef.current = value
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingSave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const onChangeText = (text: string) => {
    setValue(text)
    clearPendingSave()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      updateNoteText(date, normalize(text))
    }, DEBOUNCE_MS)
  }

  const onFocus = () => setIsEditing(true)

  const onBlur = () => {
    clearPendingSave()
    updateNoteText(date, normalize(valueRef.current))
    setIsEditing(false)
  }

  useEffect(() => {
    return () => {
      // A pending debounce means the last edit hasn't been saved yet — flush
      // it rather than lose it if the page unmounts before the timer fires.
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        updateNoteText(date, normalize(valueRef.current))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { value, isEditing, onChangeText, onFocus, onBlur }
}
