import { useRef, useState } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { DayEntry } from '../../../lib/repositories/day'
import { useDateOverlayVisibility } from '../hooks/useDateOverlayVisibility'
import { useDetailOverlayVisibility } from '../hooks/useDetailOverlayVisibility'
import { useNoteEditor } from '../hooks/useNoteEditor'
import { formatDateOverlayLabel, pickNotePlaceholder } from '../utils'
import { DateOverlay } from './DateOverlay'
import { DetailOverlay } from './DetailOverlay'
import { PageBlur } from './PageBlur'

type Props = {
  entry: DayEntry
  isFocused: boolean
  height: number
}

export function DayDetailPage({ entry, isFocused, height }: Props) {
  const { visible: dateOverlayVisible, dismiss } = useDateOverlayVisibility(isFocused)
  const { visible: detailOverlayVisible, toggle: toggleDetailOverlay } =
    useDetailOverlayVisibility(isFocused)
  const noteEditor = useNoteEditor(entry.date, entry.note_text)
  // Picked once per mount rather than on every render, so it doesn't change
  // while the user is looking at (or clearing) an empty note.
  const [notePlaceholder] = useState(() => pickNotePlaceholder())

  // The photo only becomes visible once it's the settled, focused page AND
  // the date overlay has fully finished — otherwise it stays blurred, so
  // there's no gap between "not yet focused" and "overlay showing" where an
  // unblurred frame could flash through.
  const revealed = isFocused && !dateOverlayVisible

  // Tapping outside the note while editing blurs (and saves) the note via
  // native focus loss, but that same tap would otherwise also land on this
  // Pressable and toggle the detail overlay shut — jarring mid-edit. This
  // ref-based flag consumes exactly one such press. It self-clears on the
  // next tick rather than staying set indefinitely, so a blur from some
  // other cause (scrolling away, the back control) doesn't wrongly swallow
  // an unrelated later tap.
  const wasEditingRef = useRef(false)
  const handleNoteBlur = () => {
    wasEditingRef.current = true
    noteEditor.onBlur()
    setTimeout(() => {
      wasEditingRef.current = false
    }, 0)
  }

  // While the date label is showing, a tap dismisses it early; once it's
  // gone, the same tap toggles the location/note overlay instead.
  const handlePress = () => {
    if (wasEditingRef.current) {
      wasEditingRef.current = false
      return
    }
    if (dateOverlayVisible) {
      dismiss()
      return
    }
    toggleDetailOverlay()
  }

  const accessibilityLabel = dateOverlayVisible
    ? 'Dismiss date label'
    : detailOverlayVisible
      ? 'Hide day details'
      : 'Show day details'

  return (
    <Pressable
      style={[styles.page, { height }]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={{ uri: entry.photo_path! }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Photo from ${entry.date}`}
        accessibilityRole="image"
      />
      <PageBlur visible={!revealed} />
      {isFocused && (
        <DateOverlay
          label={formatDateOverlayLabel(entry.date)}
          accentColor={entry.accent_color}
          visible={dateOverlayVisible}
        />
      )}
      {isFocused && (
        <DetailOverlay
          visible={detailOverlayVisible}
          locationName={entry.location_name}
          noteValue={noteEditor.value}
          notePlaceholder={notePlaceholder}
          onNoteChangeText={noteEditor.onChangeText}
          onNoteFocus={noteEditor.onFocus}
          onNoteBlur={handleNoteBlur}
          pageHeight={height}
        />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
  },
  photo: {
    flex: 1,
  },
})
