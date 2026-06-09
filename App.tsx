import { StatusBar } from 'expo-status-bar'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Typography, useAppFonts } from './lib/design'

export default function App() {
  const [fontsLoaded] = useAppFonts()

  if (!fontsLoaded) {
    return null
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={[Typography.displayXl, styles.primary]}>1 Sun</Text>
      <Text style={[Typography.displayMd, styles.primary]}>June 2026</Text>
      <Text style={[Typography.bodyLg, styles.primary]}>
        A quiet moment by the window. The light came in soft and low.
      </Text>
      <Text style={[Typography.labelMd, styles.secondary]}>Melbourne, VIC</Text>
      <Text style={[Typography.labelSm, styles.primary]}>9</Text>
      <Text style={[Typography.labelSmMedium, styles.primary]}>9 (today)</Text>
      <Text style={[Typography.labelXs, styles.tertiary]}>frame — design tokens</Text>

      <View style={styles.swatches}>
        {Object.entries(Colors).map(([name, value]) => (
          <View key={name} style={styles.swatchRow}>
            <View style={[styles.swatch, { backgroundColor: value }]} />
            <Text style={[Typography.labelXs, styles.tertiary]}>
              {name} {value}
            </Text>
          </View>
        ))}
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  primary: {
    color: Colors.textPrimary,
  },
  secondary: {
    color: Colors.textSecondary,
  },
  tertiary: {
    color: Colors.textTertiary,
  },
  swatches: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
})
