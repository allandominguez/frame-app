import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker'
import { useState } from 'react'
import { useCapturePermissions } from './useCapturePermissions'

type UsePhotoPickerResult = {
  openSheet: () => void
  sheetVisible: boolean
  permissionBlocked: boolean
  sheetProps: {
    visible: boolean
    onTakePhoto: () => Promise<void>
    onChooseFromGallery: () => Promise<void>
    onDismiss: () => void
  }
}

export function usePhotoPicker(onPhotoSelected: (uri: string) => void): UsePhotoPickerResult {
  const [sheetVisible, setSheetVisible] = useState(false)
  const [permissionBlocked, setPermissionBlocked] = useState(false)
  const { requestCameraPermission, requestMediaLibraryPermission } = useCapturePermissions()

  const openSheet = () => setSheetVisible(true)
  const closeSheet = () => setSheetVisible(false)

  const handleTakePhoto = async () => {
    closeSheet()
    const status = await requestCameraPermission()
    if (status === 'blocked') {
      setPermissionBlocked(true)
      return
    }
    if (status === 'denied') return

    const result = await launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
    if (!result.canceled) {
      onPhotoSelected(result.assets[0].uri)
    }
  }

  const handleChooseFromGallery = async () => {
    closeSheet()
    const status = await requestMediaLibraryPermission()
    if (status === 'blocked') {
      setPermissionBlocked(true)
      return
    }
    if (status === 'denied') return

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: false,
    })
    if (!result.canceled) {
      onPhotoSelected(result.assets[0].uri)
    }
  }

  return {
    openSheet,
    sheetVisible,
    permissionBlocked,
    sheetProps: {
      visible: sheetVisible,
      onTakePhoto: handleTakePhoto,
      onChooseFromGallery: handleChooseFromGallery,
      onDismiss: closeSheet,
    },
  }
}
