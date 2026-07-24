import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Linking, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PhotoPickerSheet } from '../../capture/components/PhotoPickerSheet'
import { PhotoPreview } from '../../capture/components/PhotoPreview'
import { useCapture } from '../../capture/hooks/useCapture'
import { Colors, Spacing, Typography } from '../../../lib/design'
import { RootStackParamList } from '../../../navigation/types'
import { useCalendarData } from '../hooks/useCalendarData'
import { useDayActionMenu } from '../hooks/useDayActionMenu'
import { useMonthPager } from '../hooks/useMonthPager'
import { MONTH_NAMES } from '../utils'
import { CalendarGrid } from './CalendarGrid'
import { DayActionMenu } from './DayActionMenu'

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>

function alertPermissionBlocked() {
  Alert.alert(
    'Permission needed',
    'Frame needs access to your camera or photos to add a picture. You can enable this in Settings.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  )
}

export function CalendarScreen({ navigation }: Props) {
  const { entriesByDate, months, today, currentStreak, longestStreak, isLoading, refresh } =
    useCalendarData()
  const { target, open: openDayActionMenu, close: closeDayActionMenu } = useDayActionMenu()

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

  // Tracked separately from useCapture's internal target so the sheet's allowCamera
  // can be derived here, where "today" is already known — capture itself doesn't
  // need to care which date it's serving beyond the one passed to openSheet.
  const [captureDate, setCaptureDate] = useState<string | null>(null)
  // Landing on the entry right after capture (rather than back on the calendar)
  // matches the natural next step — add a note, see the location — and means the
  // calendar only needs to catch up via its existing focus-refetch when the user
  // eventually backs out, not a separate manual refresh here.
  const capture = useCapture((date) => navigation.navigate('DayDetail', { date }))

  useEffect(() => {
    if (capture.permissionBlocked) alertPermissionBlocked()
  }, [capture.permissionBlocked])

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

  const handleDayPress = (date: string) => {
    if (entriesByDate[date]?.photo_path) {
      navigation.navigate('DayDetail', { date })
      return
    }
    setCaptureDate(date)
    capture.openSheet(date)
  }

  if (isLoading || displayMonths.length === 0) {
    return <SafeAreaView style={styles.root} />
  }

  return (
    <SafeAreaView style={styles.root}>
      <View
        testID="calendar-list-container"
        style={styles.listContainer}
        onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
      >
        {pageHeight > 0 && (
          <FlatList
            ref={flatListRef}
            style={styles.list}
            data={displayMonths}
            // renderItem closes over entriesByDate (via CalendarGrid), which isn't
            // part of `data` — without this, FlatList has no reason to re-render
            // already-mounted month cells when a day's entry changes in place
            // (e.g. a photo delete), so the accent dot would keep showing stale data.
            extraData={entriesByDate}
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
                  onDayPress={handleDayPress}
                  onDayLongPress={(date) => {
                    const photoPath = entriesByDate[date]?.photo_path
                    if (photoPath) openDayActionMenu(date, photoPath)
                  }}
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
      {target && (
        <DayActionMenu
          date={target.date}
          photoPath={target.photoPath}
          onClose={closeDayActionMenu}
          onDeleted={refresh}
        />
      )}
      <PhotoPickerSheet {...capture.sheetProps} allowCamera={captureDate === today} />
      <PhotoPreview
        uri={capture.pendingUri}
        isSaving={capture.isSaving}
        onConfirm={capture.onConfirmPhoto}
        onCancel={capture.onCancelPreview}
      />
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
