import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, Radii, Typography } from '../../../lib/design'
import { CalendarDayData } from '../types'

const CELL_HEIGHT = 52
// RN's Pressable defaults to 500ms before a long press registers — noticeably
// sluggish for a menu trigger. 300ms still comfortably clears a normal tap.
const LONG_PRESS_DELAY_MS = 300

type Props = {
  cell: CalendarDayData
  size: number
  onPress: (date: string) => void
  onLongPress: (date: string) => void
}

export function DayCell({ cell, size, onPress, onLongPress }: Props) {
  const cellStyle = [styles.cell, { width: size, height: CELL_HEIGHT }]
  const dayNumStyle = [
    styles.dayNumber,
    cell.isFuture && styles.dayNumberFuture,
    cell.isToday && styles.dayNumberToday,
  ]

  if (!cell.date) {
    return <View style={cellStyle} />
  }

  if (cell.hasPhoto) {
    return (
      <Pressable
        style={cellStyle}
        onPress={() => onPress(cell.date!)}
        onLongPress={() => onLongPress(cell.date!)}
        delayLongPress={LONG_PRESS_DELAY_MS}
        accessibilityRole="button"
        accessibilityLabel={`${cell.dayNumber}, has photo`}
      >
        <Text style={dayNumStyle}>{cell.dayNumber}</Text>
        <View
          testID="photo-dot"
          style={[styles.dot, { backgroundColor: cell.accentColor ?? Colors.textTertiary }]}
        />
      </Pressable>
    )
  }

  return (
    <View style={cellStyle}>
      <Text style={dayNumStyle}>{cell.dayNumber}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    gap: 4,
  },
  dayNumber: {
    ...Typography.labelSm,
    color: Colors.textPrimary,
  },
  dayNumberFuture: {
    color: Colors.textTertiary,
  },
  dayNumberToday: {
    ...Typography.labelSmMedium,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: Radii.full,
  },
})
