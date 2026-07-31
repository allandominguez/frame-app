import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export function useDayDetailBackHandler(
  detailOverlayVisible: boolean,
  closeDetailOverlay: () => void,
): void {
  useEffect(() => {
    // DayDetail is always top-of-stack here, so mount/unmount is enough — revisit if that changes.
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
