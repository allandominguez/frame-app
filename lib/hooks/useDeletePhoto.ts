import { Alert } from 'react-native'
import { clearPhoto } from '../repositories/day'
import { deletePhoto } from '../storage/photoStorage'

function confirmDelete(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert('Delete this photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ])
  })
}

export function useDeletePhoto(date: string, photoPath: string, onDeleted: () => void) {
  const confirmAndDelete = async () => {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    deletePhoto(photoPath)
    await clearPhoto(date)
    onDeleted()
  }

  return { confirmAndDelete }
}
