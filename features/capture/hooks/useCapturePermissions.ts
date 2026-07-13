import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker'

export type PermissionStatus = 'granted' | 'denied' | 'blocked'

type UseCapturePermissionsResult = {
  requestCameraPermission: () => Promise<PermissionStatus>
  requestMediaLibraryPermission: () => Promise<PermissionStatus>
}

export function useCapturePermissions(): UseCapturePermissionsResult {
  const [, requestCamera] = useCameraPermissions()
  const [, requestMedia] = useMediaLibraryPermissions()

  const requestCameraPermission = async (): Promise<PermissionStatus> => {
    const result = await requestCamera()
    if (result.granted) return 'granted'
    if (!result.canAskAgain) return 'blocked'
    return 'denied'
  }

  const requestMediaLibraryPermission = async (): Promise<PermissionStatus> => {
    const result = await requestMedia()
    if (result.granted) return 'granted'
    if (!result.canAskAgain) return 'blocked'
    return 'denied'
  }

  return { requestCameraPermission, requestMediaLibraryPermission }
}
