import { useRef, useState } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { formatDateAccessibilityLabel } from '../../../lib/dates'
import { useDeletePhoto } from '../../../lib/hooks/useDeletePhoto'
import { DayEntry } from '../../../lib/repositories/day'
import { useNoteEditor } from '../hooks/useNoteEditor'
import { formatDateOverlayLabel, pickNotePlaceholder } from '../utils'
import { DateOverlay } from './DateOverlay'
import { DetailOverlay } from './DetailOverlay'
import { PageBlur } from './PageBlur'

type Props = {
  entry: DayEntry
  isFocused: boolean
  height: number
  dateOverlayVisible: boolean
  dismissDateOverlay: () => void
  detailOverlayVisible: boolean
  toggleDetailOverlay: () => void
  onPhotoDeleted: () => void
}

export function DayDetailPage({
  entry,
  isFocused,
  height,
  dateOverlayVisible,
  dismissDateOverlay,
  detailOverlayVisible,
  toggleDetailOverlay,
  onPhotoDeleted,
}: Props) {
  const noteEditor = useNoteEditor(entry.date, entry.note_text)
  const { confirmAndDelete } = useDeletePhoto(entry.date, entry.photo_path!, onPhotoDeleted)
  // Picked once per mount rather than on every render, so it doesn't change
  // while the user is looking at (or clearing) an empty note.
  const [notePlaceholder] = useState(() => pickNotePlaceholder())

  // Blurred until settled, focused, and the date overlay is fully gone, so no unblurred frame flashes through.
  const revealed = isFocused && !dateOverlayVisible

  // Consumes exactly one press after a note blur so it doesn't also toggle the overlay; self-clears next tick.
  const wasEditingRef = useRef(false)
  const handleNoteBlur = () => {
    wasEditingRef.current = true
    noteEditor.onBlur()
    setTimeout(() => {
      wasEditingRef.current = false
    }, 0)
  }

  // While the date label is showing, a tap dismisses it; once gone, the same tap toggles the note overlay.
  const handlePress = () => {
    if (wasEditingRef.current) {
      wasEditingRef.current = false
      return
    }
    if (dateOverlayVisible) {
      dismissDateOverlay()
      return
    }
    toggleDetailOverlay()
  }

  // dateOverlayVisible/detailOverlayVisible describe the focused page only; non-focused pages get no label.
  const accessibilityLabel = !isFocused
    ? undefined
    : dateOverlayVisible
      ? 'Dismiss date label'
      : detailOverlayVisible
        ? 'Hide day details'
        : 'Show day details'

  return (
    <Pressable
      style={[styles.page, { height }]}
      onPress={handlePress}
      disabled={!isFocused}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={{ uri: entry.photo_path! }}
        style={styles.photo}
        resizeMode="contain"
        accessibilityLabel={`Photo from ${formatDateAccessibilityLabel(entry.date)}`}
        accessibilityRole="image"
      />
      <PageBlur visible={!revealed} />
      {isFocused && (
        <DateOverlay
          label={formatDateOverlayLabel(entry.date)}
          accessibilityLabel={formatDateAccessibilityLabel(entry.date)}
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
          onDeletePhoto={confirmAndDelete}
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
