import { Image, Pressable, StyleSheet, View } from 'react-native'
import { DayEntry } from '../../../lib/repositories/day'
import { useDateOverlayVisibility } from '../hooks/useDateOverlayVisibility'
import { formatDateOverlayLabel } from '../utils'
import { DateOverlay } from './DateOverlay'

type Props = {
  entry: DayEntry
  isFocused: boolean
  height: number
}

export function DayDetailPage({ entry, isFocused, height }: Props) {
  const { visible: dateOverlayVisible, dismiss } = useDateOverlayVisibility(isFocused)

  return (
    <Pressable
      style={[styles.page, { height }]}
      onPress={dismiss}
      disabled={!dateOverlayVisible}
      accessibilityRole={dateOverlayVisible ? 'button' : undefined}
      accessibilityLabel={dateOverlayVisible ? 'Dismiss date label' : undefined}
    >
      <Image
        source={{ uri: entry.photo_path! }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Photo from ${entry.date}`}
        accessibilityRole="image"
      />
      {!isFocused && <View testID="dim-overlay" style={styles.dim} />}
      {isFocused && (
        <DateOverlay
          label={formatDateOverlayLabel(entry.date)}
          accentColor={entry.accent_color}
          visible={dateOverlayVisible}
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
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
})
