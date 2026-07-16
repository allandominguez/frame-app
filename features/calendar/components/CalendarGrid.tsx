import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { Spacing } from '../../../lib/design'
import { DayEntry } from '../../../lib/repositories/day'
import { buildMonthCells } from '../utils'
import { DayCell } from './DayCell'

type Props = {
  year: number
  month: number
  entriesByDate: Record<string, DayEntry>
  today: string
  onDayPress: (date: string) => void
}

export function CalendarGrid({ year, month, entriesByDate, today, onDayPress }: Props) {
  const { width } = useWindowDimensions()
  const cellSize = (width - Spacing.lg * 2) / 7
  const cells = buildMonthCells(year, month, entriesByDate, today)

  return (
    <View style={styles.grid}>
      {cells.map((cell, index) => (
        <DayCell
          key={cell.date ?? `empty-${index}`}
          cell={cell}
          size={cellSize}
          onPress={onDayPress}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
  },
})
