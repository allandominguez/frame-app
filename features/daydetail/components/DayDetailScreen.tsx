import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing, Typography } from '../../../lib/design'
import { DayEntry } from '../../../lib/repositories/day'
import { RootStackParamList } from '../../../navigation/types'
import { useDayDetailFeed } from '../hooks/useDayDetailFeed'
import { DayDetailPage } from './DayDetailPage'

type Props = NativeStackScreenProps<RootStackParamList, 'DayDetail'>

const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 }

export function DayDetailScreen({ navigation, route }: Props) {
  const { entries, initialIndex, isLoading } = useDayDetailFeed(route.params.date)
  const [pageHeight, setPageHeight] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null)
  const focusedIndex = visibleIndex ?? initialIndex
  const insets = useSafeAreaInsets()

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setVisibleIndex(viewableItems[0].index)
    }
  }).current

  return (
    <View style={styles.root}>
      <View style={styles.container} onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
        {!isLoading && pageHeight > 0 && entries.length > 0 && (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.date}
            initialScrollIndex={initialIndex}
            renderItem={({ item, index }: { item: DayEntry; index: number }) => (
              <DayDetailPage entry={item} isFocused={index === focusedIndex} height={pageHeight} />
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
          />
        )}
      </View>
      <Pressable
        style={[styles.back, { top: insets.top + Spacing.sm }]}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
  },
  container: {
    flex: 1,
  },
  back: {
    position: 'absolute',
    left: Spacing.md,
    padding: Spacing.md,
  },
  backLabel: {
    ...Typography.labelMd,
    color: Colors.surface,
  },
})
