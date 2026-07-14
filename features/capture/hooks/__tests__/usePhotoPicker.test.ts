import { act, renderHook } from '@testing-library/react-native'
import { usePhotoPicker } from '../usePhotoPicker'

const mockRequestCameraPermission = jest.fn()
const mockRequestMediaLibraryPermission = jest.fn()
const mockLaunchCameraAsync = jest.fn()
const mockLaunchImageLibraryAsync = jest.fn()
const mockSavePhoto = jest.fn()

jest.mock('../useCapturePermissions', () => ({
  useCapturePermissions: () => ({
    requestCameraPermission: mockRequestCameraPermission,
    requestMediaLibraryPermission: mockRequestMediaLibraryPermission,
  }),
}))

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: (...args: unknown[]) => mockLaunchCameraAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  useCameraPermissions: () => [null, jest.fn()],
  useMediaLibraryPermissions: () => [null, jest.fn()],
}))

jest.mock('../../../../lib/storage/photoStorage', () => ({
  savePhoto: (...args: unknown[]) => mockSavePhoto(...args),
}))

describe('usePhotoPicker', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sheet is hidden and no pending photo initially', () => {
    const { result } = renderHook(() => usePhotoPicker(jest.fn()))
    expect(result.current.sheetVisible).toBe(false)
    expect(result.current.pendingUri).toBeNull()
  })

  it('openSheet makes the sheet visible', () => {
    const { result } = renderHook(() => usePhotoPicker(jest.fn()))

    act(() => result.current.openSheet())

    expect(result.current.sheetVisible).toBe(true)
  })

  it('onDismiss hides the sheet', () => {
    const { result } = renderHook(() => usePhotoPicker(jest.fn()))

    act(() => result.current.openSheet())
    act(() => result.current.sheetProps.onDismiss())

    expect(result.current.sheetVisible).toBe(false)
  })

  describe('Take photo', () => {
    it('saves the photo and calls onPhotoSelected with the local path', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://camera-temp.jpg' }],
      })
      mockSavePhoto.mockResolvedValue('file://documents/photos/123.jpg')
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(mockSavePhoto).toHaveBeenCalledWith('file://camera-temp.jpg')
      expect(onPhotoSelected).toHaveBeenCalledWith('file://documents/photos/123.jpg')
    })

    it('does not save or call onPhotoSelected when the user cancels the camera', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: null })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(mockSavePhoto).not.toHaveBeenCalled()
      expect(onPhotoSelected).not.toHaveBeenCalled()
    })

    it('does not launch the camera when permission is denied', async () => {
      mockRequestCameraPermission.mockResolvedValue('denied')
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(mockLaunchCameraAsync).not.toHaveBeenCalled()
    })

    it('sets permissionBlocked when camera permission is permanently denied', async () => {
      mockRequestCameraPermission.mockResolvedValue('blocked')
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(result.current.permissionBlocked).toBe(true)
    })

    it('closes the sheet before launching the camera then re-opens it if the user cancels', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: null })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      act(() => result.current.openSheet())
      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(result.current.sheetVisible).toBe(true)
    })

    it('reflects isSaving while the photo is being saved', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://camera-temp.jpg' }],
      })
      let resolveSave!: (path: string) => void
      mockSavePhoto.mockReturnValue(new Promise<string>((res) => (resolveSave = res)))
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      act(() => {
        result.current.sheetProps.onTakePhoto()
      })
      await act(async () => {})

      expect(result.current.isSaving).toBe(true)

      await act(async () => resolveSave('file://documents/photos/123.jpg'))

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('Choose from gallery', () => {
    it('sets pendingUri after a photo is selected so the user can preview before saving', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'content://gallery/photo.jpg' }],
      })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(result.current.pendingUri).toBe('content://gallery/photo.jpg')
      expect(mockSavePhoto).not.toHaveBeenCalled()
    })

    it('saves and calls onPhotoSelected when the user confirms the preview', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'content://gallery/photo.jpg' }],
      })
      mockSavePhoto.mockResolvedValue('file://documents/photos/456.jpg')
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })
      await act(async () => {
        await result.current.onConfirmPhoto()
      })

      expect(mockSavePhoto).toHaveBeenCalledWith('content://gallery/photo.jpg')
      expect(onPhotoSelected).toHaveBeenCalledWith('file://documents/photos/456.jpg')
      expect(result.current.pendingUri).toBeNull()
    })

    it('re-opens the gallery when the user cancels the preview', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'content://gallery/first.jpg' }],
        })
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'content://gallery/second.jpg' }],
        })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })
      await act(async () => {
        await result.current.onCancelPreview()
      })

      expect(mockLaunchImageLibraryAsync).toHaveBeenCalledTimes(2)
      expect(result.current.pendingUri).toBe('content://gallery/second.jpg')
    })

    it('re-opens the sheet when the user closes the re-opened gallery without selecting a photo', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: 'content://gallery/photo.jpg' }],
        })
        .mockResolvedValueOnce({ canceled: true, assets: null })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })
      await act(async () => {
        await result.current.onCancelPreview()
      })

      expect(result.current.pendingUri).toBeNull()
      expect(result.current.sheetVisible).toBe(true)
      expect(mockSavePhoto).not.toHaveBeenCalled()
      expect(onPhotoSelected).not.toHaveBeenCalled()
    })

    it('re-opens the sheet when the user closes the gallery without selecting a photo', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(result.current.pendingUri).toBeNull()
      expect(result.current.sheetVisible).toBe(true)
    })

    it('does not launch the gallery when permission is denied', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('denied')
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled()
    })

    it('sets permissionBlocked when media library permission is permanently denied', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('blocked')
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(result.current.permissionBlocked).toBe(true)
    })
  })
})
