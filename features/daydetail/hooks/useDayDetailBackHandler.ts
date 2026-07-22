import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export function useDayDetailBackHandler(
  detailOverlayVisible: boolean,
  closeDetailOverlay: () => void,
): void {
  useEffect(() => {
    // DayDetail is always the top of the nav stack in this app (Calendar ->
    // DayDetail, nothing is ever pushed on top of it), so a plain
    // mount/unmount effect is enough here — this would need to become
    // useFocusEffect if a screen is ever pushed on top of DayDetail.
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (detailOverlayVisible) {
        closeDetailOverlay()
        return true
      }
      return false
    })

    return () => subscription.remove()
  }, [detailOverlayVisible, closeDetailOverlay])
}
