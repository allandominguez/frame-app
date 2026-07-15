import { Alert } from 'react-native'
import { getDay, upsertDay } from '../../../lib/repositories/day'
import { deletePhoto } from '../../../lib/storage/photoStorage'
import { CaptureResult } from '../types'
import { usePhotoPicker } from './usePhotoPicker'

function confirmReplacement(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert("Replace today's photo?", 'Your current photo will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Replace', style: 'destructive', onPress: () => resolve(true) },
    ])
  })
}

export function useCapture() {
  const onCaptureComplete = async (result: CaptureResult) => {
    const today = new Date().toISOString().slice(0, 10)
    const existing = await getDay(today)

    if (existing?.photo_path) {
      const confirmed = await confirmReplacement()
      if (!confirmed) {
        deletePhoto(result.localPath)
        return
      }
      deletePhoto(existing.photo_path)
    }

    const coords = result.exifGps ?? result.deviceGps
    await upsertDay({
      date: today,
      photo_path: result.localPath,
      note_text: null,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      location_name: result.locationName,
      location_source: result.locationSource,
      accent_color: null,
      share_color: null,
    })
  }

  return usePhotoPicker(onCaptureComplete)
}
