import { Image, Pressable, StyleSheet } from 'react-native'
import { DayEntry } from '../../../lib/repositories/day'
import { useDateOverlayVisibility } from '../hooks/useDateOverlayVisibility'
import { useDetailOverlayVisibility } from '../hooks/useDetailOverlayVisibility'
import { formatDateOverlayLabel } from '../utils'
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

  // The photo only becomes visible once it's the settled, focused page AND
  // the date overlay has fully finished — otherwise it stays blurred, so
  // there's no gap between "not yet focused" and "overlay showing" where an
  // unblurred frame could flash through.
  const revealed = isFocused && !dateOverlayVisible

  // While the date label is showing, a tap dismisses it early; once it's
  // gone, the same tap toggles the location/note overlay instead.
  const handlePress = () => {
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
          noteText={entry.note_text}
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
