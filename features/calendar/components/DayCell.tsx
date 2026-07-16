import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, Radii, Typography } from '../../../lib/design'
import { CalendarDayData } from '../types'

const CELL_HEIGHT = 52

type Props = {
  cell: CalendarDayData
  size: number
  onPress: (date: string) => void
}

export function DayCell({ cell, size, onPress }: Props) {
  const cellStyle = [styles.cell, { width: size, height: CELL_HEIGHT }]
  const dayNumStyle = [styles.dayNumber, cell.isToday && styles.dayNumberToday]

  if (!cell.date) {
    return <View style={cellStyle} />
  }

  if (cell.hasPhoto) {
    return (
      <Pressable
        style={cellStyle}
        onPress={() => onPress(cell.date!)}
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
    justifyContent: 'center',
    gap: 4,
  },
  dayNumber: {
    ...Typography.labelSm,
    color: Colors.textPrimary,
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
