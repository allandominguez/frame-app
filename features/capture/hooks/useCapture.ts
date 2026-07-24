import { useState } from 'react'
import { Alert } from 'react-native'
import { getDay, upsertDayPhoto } from '../../../lib/repositories/day'
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
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(null)

  const onCaptureComplete = async (result: CaptureResult) => {
    if (existingPhotoPath) {
      deletePhoto(existingPhotoPath)
      setExistingPhotoPath(null)
    }

    const coords = result.exifGps ?? result.deviceGps
    await upsertDayPhoto({
      date: new Date().toISOString().slice(0, 10),
      photo_path: result.localPath,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      location_name: result.locationName,
      location_source: result.locationSource,
      accent_color: null,
      share_color: null,
    })
  }

  const pickerResult = usePhotoPicker(onCaptureComplete)

  const openSheet = async () => {
    // Already confirmed replacement in this session — open directly without re-prompting
    if (existingPhotoPath !== null) {
      pickerResult.openSheet()
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const existing = await getDay(today)

    if (existing?.photo_path) {
      const confirmed = await confirmReplacement()
      if (!confirmed) return
      setExistingPhotoPath(existing.photo_path)
    }

    pickerResult.openSheet()
  }

  return { ...pickerResult, openSheet }
}
