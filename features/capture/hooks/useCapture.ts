import { upsertDay } from '../../../lib/repositories/day'
import { CaptureResult } from '../types'
import { usePhotoPicker } from './usePhotoPicker'

export function useCapture() {
  const onCaptureComplete = async (result: CaptureResult) => {
    const coords = result.exifGps ?? result.deviceGps
    await upsertDay({
      date: new Date().toISOString().slice(0, 10),
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
