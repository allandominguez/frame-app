import { Image, StyleSheet, View } from 'react-native'
import { DayEntry } from '../../../lib/repositories/day'

type Props = {
  entry: DayEntry
  isFocused: boolean
  height: number
}

export function DayDetailPage({ entry, isFocused, height }: Props) {
  return (
    <View style={[styles.page, { height }]}>
      <Image
        source={{ uri: entry.photo_path! }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={`Photo from ${entry.date}`}
        accessibilityRole="image"
      />
      {!isFocused && <View testID="dim-overlay" style={styles.dim} />}
    </View>
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
