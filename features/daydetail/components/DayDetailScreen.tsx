import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing, Typography } from '../../../lib/design'
import { RootStackParamList } from '../../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'DayDetail'>

export function DayDetailScreen({ navigation, route }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.date}>{route.params.date}</Text>
      <Pressable
        style={styles.back}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  date: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
  },
  back: {
    padding: Spacing.md,
  },
  backLabel: {
    ...Typography.labelMd,
    color: Colors.textSecondary,
  },
})
