import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { PhotoPickerSheet } from './features/capture/components/PhotoPickerSheet'
import { PhotoPreview } from './features/capture/components/PhotoPreview'
import { useCapture } from './features/capture/hooks/useCapture'
import { Colors, Spacing, Typography, useAppFonts } from './lib/design'
import { DayEntry, getDay } from './lib/repositories/day'

export default function App() {
  const [fontsLoaded] = useAppFonts()
  const [todayEntry, setTodayEntry] = useState<DayEntry | null>(null)
  const { openSheet, sheetProps, pendingUri, isSaving, onConfirmPhoto, onCancelPreview } =
    useCapture()

  useEffect(() => {
    if (isSaving) return
    const today = new Date().toISOString().slice(0, 10)
    getDay(today).then(setTodayEntry)
  }, [isSaving])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.root}>
      {todayEntry?.photo_path ? (
        <Image
          source={{ uri: todayEntry.photo_path }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel="Today's photo"
          accessibilityRole="image"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No photo yet today</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={openSheet}
          accessibilityRole="button"
          accessibilityLabel="Capture photo"
        >
          <Text style={styles.buttonText}>Capture photo</Text>
        </Pressable>
      </View>

      <PhotoPickerSheet {...sheetProps} />
      <PhotoPreview
        uri={pendingUri}
        isSaving={isSaving}
        onConfirm={onConfirmPhoto}
        onCancel={onCancelPreview}
      />

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  photo: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.bodyLg,
    color: Colors.textTertiary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
})
