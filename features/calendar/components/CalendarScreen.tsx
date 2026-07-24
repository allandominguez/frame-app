import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IconArrowBarToDown, IconArrowForwardUp, IconPlus } from '@tabler/icons-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Animated, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PhotoPickerSheet } from '../../capture/components/PhotoPickerSheet'
import { PhotoPreview } from '../../capture/components/PhotoPreview'
import { useCapture } from '../../capture/hooks/useCapture'
import { Colors, Radii, Spacing, Typography } from '../../../lib/design'
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
    currentIndex,
    pageHeight,
    setPageHeight,
    flatListRef,
    monthPanHandlers,
    yearPanHandlers,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useMonthPager(months)

  // displayMonths is ascending (oldest first), so the current month is always last.
  const isViewingCurrentMonth = currentIndex === displayMonths.length - 1

  // 0 = showing the streak counter, 1 = showing the jump-back control. Both stay
  // mounted (see the footer below) and crossfade via this shared value rather than
  // hard-cutting between them.
  const footerTransition = useRef(new Animated.Value(isViewingCurrentMonth ? 0 : 1)).current
  useEffect(() => {
    const animation = Animated.timing(footerTransition, {
      toValue: isViewingCurrentMonth ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [isViewingCurrentMonth, footerTransition])

  const todayHasPhoto = Boolean(entriesByDate[today]?.photo_path)

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

  // Unlike handleDayPress, this always targets today regardless of whether today
  // already has a photo — openSheet's existing replace-confirmation flow (alert,
  // then delete-old-only-after-new-is-confirmed) handles that case for free.
  const handleCaptureTodayPress = () => {
    setCaptureDate(today)
    capture.openSheet(today)
  }

  const handleJumpToCurrentMonth = () => {
    flatListRef.current?.scrollToIndex({ index: displayMonths.length - 1, animated: true })
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
            // The current month is always the last item — rendering the capture button
            // as part of that page's own content (rather than a conditionally-mounted
            // sibling keyed off scroll position) means it scrolls away naturally with the
            // page instead of causing the list container to reflow on every month swipe.
            renderItem={({ item, index }) => (
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
                {index === displayMonths.length - 1 && (
                  <Pressable
                    style={styles.captureTodayButton}
                    onPress={handleCaptureTodayPress}
                    accessibilityRole="button"
                    accessibilityLabel={
                      todayHasPhoto ? "Replace today's photo" : "Add today's photo"
                    }
                  >
                    {todayHasPhoto ? (
                      <IconArrowForwardUp size={22} color={Colors.textPrimary} />
                    ) : (
                      <IconPlus size={22} color={Colors.textPrimary} />
                    )}
                  </Pressable>
                )}
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
      {/* Always mounted at a fixed height, unlike the capture button — only its content
          crossfades between the streak counter and the jump-back control depending on
          which month is in view, so this footer never itself moves or reflows the list
          above it. Both states stay mounted so they can fade into one another instead of
          hard-cutting; pointerEvents keeps the faded-out one from intercepting touches. */}
      <View style={styles.footerRow}>
        <Animated.View
          style={[
            styles.footerLayer,
            { opacity: footerTransition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
          pointerEvents={isViewingCurrentMonth ? 'auto' : 'none'}
        >
          {longestStreak > 0 && (
            <>
              {currentStreak > 0 && (
                <>
                  <Text style={styles.streakText}>
                    {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                  <Text style={styles.streakSeparator}>·</Text>
                </>
              )}
              <Text style={styles.streakText}>Best {longestStreak}</Text>
            </>
          )}
        </Animated.View>
        <Animated.View
          style={[styles.footerLayer, { opacity: footerTransition }]}
          pointerEvents={isViewingCurrentMonth ? 'none' : 'auto'}
        >
          <Pressable
            onPress={handleJumpToCurrentMonth}
            accessibilityRole="button"
            accessibilityLabel="Jump to current month"
            hitSlop={12}
          >
            <IconArrowBarToDown size={18} color={Colors.textTertiary} />
          </Pressable>
        </Animated.View>
      </View>
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
  captureTodayButton: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  footerRow: {
    paddingVertical: Spacing.md,
    // Fixed regardless of content (streak text, jump-back icon, or nothing when there's
    // no streak yet) so this row's height — and therefore the list above it — never
    // changes as its content swaps.
    minHeight: 18 + Spacing.md * 2,
  },
  footerLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
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
