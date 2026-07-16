import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing, Typography } from '../../../lib/design'
import { RootStackParamList } from '../../../navigation/types'
import { useCalendarData } from '../hooks/useCalendarData'
import { useMonthPager } from '../hooks/useMonthPager'
import { MONTH_NAMES } from '../utils'
import { CalendarGrid } from './CalendarGrid'

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>

export function CalendarScreen({ navigation }: Props) {
  const { entriesByDate, months, today, currentStreak, longestStreak, isLoading, refresh } =
    useCalendarData()

  const {
    displayMonths,
    pageHeight,
    setPageHeight,
    flatListRef,
    monthPanHandlers,
    yearPanHandlers,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useMonthPager(months)

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

  if (isLoading || displayMonths.length === 0) {
    return <SafeAreaView style={styles.root} />
  }

  return (
    <SafeAreaView style={styles.root}>
      <View
        style={styles.listContainer}
        onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
      >
        {pageHeight > 0 && (
          <FlatList
            ref={flatListRef}
            style={styles.list}
            data={displayMonths}
            initialScrollIndex={displayMonths.length - 1}
            keyExtractor={(item) => `${item.year}-${item.month}`}
            renderItem={({ item }) => (
              <View style={[styles.page, { height: pageHeight }]}>
                <View style={styles.pageHeader}>
                  <View {...monthPanHandlers} accessibilityRole="header">
                    <Text style={styles.monthLabel}>{MONTH_NAMES[item.month - 1]}</Text>
                  </View>
                  <View {...yearPanHandlers} accessibilityRole="header">
                    <Text style={styles.yearLabel}>{item.year}</Text>
                  </View>
                </View>
                <CalendarGrid
                  year={item.year}
                  month={item.month}
                  entriesByDate={entriesByDate}
                  today={today}
                  onDayPress={(date) => navigation.navigate('DayDetail', { date })}
                />
              </View>
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              flatListRef.current?.scrollToOffset({
                offset: averageItemLength * index,
                animated: true,
              })
            }}
          />
        )}
      </View>
      {longestStreak > 0 && (
        <View style={styles.streakRow}>
          {currentStreak > 0 && (
            <>
              <Text style={styles.streakText}>
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </Text>
              <Text style={styles.streakSeparator}>·</Text>
            </>
          )}
          <Text style={styles.streakText}>Best {longestStreak}</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
  },
  monthLabel: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
  },
  yearLabel: {
    ...Typography.displayMd,
    color: Colors.textSecondary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  streakText: {
    ...Typography.labelXs,
    color: Colors.textTertiary,
  },
  streakSeparator: {
    ...Typography.labelXs,
    color: Colors.textTertiary,
  },
})
