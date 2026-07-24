import { IconTrash } from '@tabler/icons-react-native'
import { Modal, Pressable, StyleSheet, Text } from 'react-native'
import { formatDateAccessibilityLabel } from '../../../lib/dates'
import { Colors, Radii, Spacing, Typography } from '../../../lib/design'
import { useDeletePhoto } from '../../../lib/hooks/useDeletePhoto'

type Props = {
  date: string
  photoPath: string
  onClose: () => void
  onDeleted: () => void
}

export function DayActionMenu({ date, photoPath, onClose, onDeleted }: Props) {
  const { confirmAndDelete } = useDeletePhoto(date, photoPath, () => {
    onDeleted()
    onClose()
  })

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      >
        {/* Swallows taps so they don't bubble to the backdrop and dismiss the menu. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.dateLabel}>{formatDateAccessibilityLabel(date)}</Text>
          <Pressable
            style={styles.action}
            onPress={confirmAndDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete photo"
          >
            <IconTrash size={20} color={Colors.textPrimary} />
            <Text style={styles.actionLabel}>Delete photo</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.md,
    borderTopRightRadius: Radii.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dateLabel: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
    paddingBottom: Spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionLabel: {
    ...Typography.bodyLg,
    color: Colors.textPrimary,
  },
})
