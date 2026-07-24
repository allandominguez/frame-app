import { useState } from 'react'
import { Alert } from 'react-native'
import { getDay, upsertDayPhoto } from '../../../lib/repositories/day'
import { deletePhoto } from '../../../lib/storage/photoStorage'
import { CaptureResult } from '../types'
import { usePhotoPicker } from './usePhotoPicker'

function confirmReplacement(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert("Replace this day's photo?", 'Your current photo will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Replace', style: 'destructive', onPress: () => resolve(true) },
    ])
  })
}

// A single hook instance serves capture requests for any date — the calendar taps into
// it once for whichever cell (or the dedicated "today" button) the user pressed — so the
// in-flight target date travels with the request rather than being fixed at hook creation.
export function useCapture(onSaved?: (date: string) => void) {
  const [targetDate, setTargetDate] = useState<string | null>(null)
  const [confirmedReplacement, setConfirmedReplacement] = useState<{
    date: string
    photoPath: string
  } | null>(null)

  const onCaptureComplete = async (result: CaptureResult) => {
    if (!targetDate) return

    if (confirmedReplacement?.date === targetDate) {
      deletePhoto(confirmedReplacement.photoPath)
      setConfirmedReplacement(null)
    }

    const coords = result.exifGps ?? result.deviceGps
    await upsertDayPhoto({
      date: targetDate,
      photo_path: result.localPath,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      location_name: result.locationName,
      location_source: result.locationSource,
      accent_color: null,
      share_color: null,
    })

    onSaved?.(targetDate)
  }

  const pickerResult = usePhotoPicker(onCaptureComplete)

  const openSheet = async (date: string) => {
    // Diagnostic trail for an intermittent, not-yet-reproduced report that the sheet
    // stops reopening after several rapid open/dismiss cycles — remove once either a
    // reliable repro or a root cause is confirmed.
    if (__DEV__) {
      console.log('[useCapture] openSheet called', {
        date,
        previousTargetDate: targetDate,
        sheetVisibleBefore: pickerResult.sheetVisible,
      })
    }

    setTargetDate(date)

    // Already confirmed replacement for this date in this session — open directly without re-prompting
    if (confirmedReplacement?.date === date) {
      pickerResult.openSheet()
      return
    }

    const existing = await getDay(date)

    if (existing?.photo_path) {
      const confirmed = await confirmReplacement()
      if (!confirmed) return
      setConfirmedReplacement({ date, photoPath: existing.photo_path })
    }

    pickerResult.openSheet()
  }

  return { ...pickerResult, openSheet }
}
