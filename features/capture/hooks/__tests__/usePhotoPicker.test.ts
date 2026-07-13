import { act, renderHook } from '@testing-library/react-native'
import { usePhotoPicker } from '../usePhotoPicker'

const mockRequestCameraPermission = jest.fn()
const mockRequestMediaLibraryPermission = jest.fn()
const mockLaunchCameraAsync = jest.fn()
const mockLaunchImageLibraryAsync = jest.fn()

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

describe('usePhotoPicker', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sheet is hidden initially', () => {
    const { result } = renderHook(() => usePhotoPicker(jest.fn()))
    expect(result.current.sheetVisible).toBe(false)
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
    it('calls onPhotoSelected with the URI when camera permission is granted and photo is taken', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://photo.jpg' }],
      })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(onPhotoSelected).toHaveBeenCalledWith('file://photo.jpg')
    })

    it('does not call onPhotoSelected when the user cancels the camera', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: null })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(onPhotoSelected).not.toHaveBeenCalled()
    })

    it('does not call onPhotoSelected when camera permission is denied', async () => {
      mockRequestCameraPermission.mockResolvedValue('denied')
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(onPhotoSelected).not.toHaveBeenCalled()
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

    it('closes the sheet before launching the camera', async () => {
      mockRequestCameraPermission.mockResolvedValue('granted')
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: null })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      act(() => result.current.openSheet())
      await act(async () => {
        await result.current.sheetProps.onTakePhoto()
      })

      expect(result.current.sheetVisible).toBe(false)
    })
  })

  describe('Choose from gallery', () => {
    it('calls onPhotoSelected with the URI when media permission is granted and photo is chosen', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://gallery.jpg' }],
      })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(onPhotoSelected).toHaveBeenCalledWith('file://gallery.jpg')
    })

    it('does not call onPhotoSelected when the user cancels the gallery picker', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null })
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(onPhotoSelected).not.toHaveBeenCalled()
    })

    it('does not call onPhotoSelected when media library permission is denied', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('denied')
      const onPhotoSelected = jest.fn()
      const { result } = renderHook(() => usePhotoPicker(onPhotoSelected))

      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(onPhotoSelected).not.toHaveBeenCalled()
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

    it('closes the sheet before launching the gallery picker', async () => {
      mockRequestMediaLibraryPermission.mockResolvedValue('granted')
      mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null })
      const { result } = renderHook(() => usePhotoPicker(jest.fn()))

      act(() => result.current.openSheet())
      await act(async () => {
        await result.current.sheetProps.onChooseFromGallery()
      })

      expect(result.current.sheetVisible).toBe(false)
    })
  })
})
