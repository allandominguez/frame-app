import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Typography } from '../../../lib/design'

type Props = {
  uri: string | null
  isSaving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PhotoPreview({ uri, isSaving, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={uri !== null} animationType="fade">
      <View style={styles.container}>
        {uri && (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel="Selected photo preview"
            accessibilityRole="image"
          />
        )}
        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Back"
            disabled={isSaving}
          >
            <Text style={styles.cancelText}>Back</Text>
          </Pressable>
          <Pressable
            style={styles.confirmButton}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Use photo"
            disabled={isSaving}
          >
            <Text style={styles.confirmText}>{isSaving ? 'Saving…' : 'Use photo'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    justifyContent: 'space-between',
  },
  image: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.textPrimary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.labelMd,
    color: Colors.surface,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    alignItems: 'center',
  },
  confirmText: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
})
