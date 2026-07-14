import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker'
import { useState } from 'react'
import { savePhoto } from '../../../lib/storage/photoStorage'
import { useCapturePermissions } from './useCapturePermissions'

type UsePhotoPickerResult = {
  openSheet: () => void
  sheetVisible: boolean
  permissionBlocked: boolean
  isSaving: boolean
  pendingUri: string | null
  onConfirmPhoto: () => Promise<void>
  onCancelPreview: () => Promise<void>
  sheetProps: {
    visible: boolean
    onTakePhoto: () => Promise<void>
    onChooseFromGallery: () => Promise<void>
    onDismiss: () => void
  }
}

export function usePhotoPicker(onPhotoSelected: (localPath: string) => void): UsePhotoPickerResult {
  const [sheetVisible, setSheetVisible] = useState(false)
  const [permissionBlocked, setPermissionBlocked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingUri, setPendingUri] = useState<string | null>(null)
  const { requestCameraPermission, requestMediaLibraryPermission } = useCapturePermissions()

  const openSheet = () => setSheetVisible(true)
  const closeSheet = () => setSheetVisible(false)

  const saveAndNotify = async (uri: string) => {
    setIsSaving(true)
    try {
      const localPath = await savePhoto(uri)
      onPhotoSelected(localPath)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTakePhoto = async () => {
    closeSheet()
    const status = await requestCameraPermission()
    if (status === 'blocked') {
      setPermissionBlocked(true)
      return
    }
    if (status === 'denied') return

    const result = await launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
    if (result.canceled) {
      openSheet()
    } else {
      await saveAndNotify(result.assets[0].uri)
    }
  }

  const openGallery = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: false,
    })
    if (result.canceled) {
      openSheet()
    } else {
      setPendingUri(result.assets[0].uri)
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

    await openGallery()
  }

  const onConfirmPhoto = async () => {
    if (!pendingUri) return
    const uri = pendingUri
    setPendingUri(null)
    await saveAndNotify(uri)
  }

  const onCancelPreview = async () => {
    setPendingUri(null)
    await openGallery()
  }

  return {
    openSheet,
    sheetVisible,
    permissionBlocked,
    isSaving,
    pendingUri,
    onConfirmPhoto,
    onCancelPreview,
    sheetProps: {
      visible: sheetVisible,
      onTakePhoto: handleTakePhoto,
      onChooseFromGallery: handleChooseFromGallery,
      onDismiss: closeSheet,
    },
  }
}
