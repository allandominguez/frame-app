import { act, renderHook } from '@testing-library/react-native'
import { Alert, AlertButton } from 'react-native'
import { CaptureResult } from '../../types'
import { useCapture } from '../useCapture'

let capturedOnComplete: ((result: CaptureResult) => void) | null = null
const mockGetDay = jest.fn()
const mockUpsertDay = jest.fn()
const mockDeletePhoto = jest.fn()

jest.mock('../usePhotoPicker', () => ({
  usePhotoPicker: (onCaptureComplete: (result: CaptureResult) => void) => {
    capturedOnComplete = onCaptureComplete
    return {
      openSheet: jest.fn(),
      sheetVisible: false,
      permissionBlocked: false,
      isSaving: false,
      pendingUri: null,
      onConfirmPhoto: jest.fn(),
      onCancelPreview: jest.fn(),
      sheetProps: {
        visible: false,
        onTakePhoto: jest.fn(),
        onChooseFromGallery: jest.fn(),
        onDismiss: jest.fn(),
      },
    }
  },
}))

jest.mock('../../../../lib/repositories/day', () => ({
  getDay: (...args: unknown[]) => mockGetDay(...args),
  upsertDay: (...args: unknown[]) => mockUpsertDay(...args),
}))

jest.mock('../../../../lib/storage/photoStorage', () => ({
  deletePhoto: (...args: unknown[]) => mockDeletePhoto(...args),
}))

const GPS = { latitude: 37.7749, longitude: -122.4194 }

const RESULT: CaptureResult = {
  localPath: 'file://documents/photos/new.jpg',
  exifGps: GPS,
  deviceGps: null,
  locationName: 'Mission District',
  locationSource: 'exif',
}

function simulateAlert(choice: 'Cancel' | 'Replace') {
  jest.spyOn(Alert, 'alert').mockImplementationOnce((_title, _message, buttons) => {
    const btn = (buttons as AlertButton[]).find((b) => b.text === choice)
    btn?.onPress?.()
  })
}

describe('useCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedOnComplete = null
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-15'))
    mockGetDay.mockResolvedValue(null)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('persists the photo with EXIF coordinates and location name when capture completes', async () => {
    renderHook(() => useCapture())

    await act(async () => {
      capturedOnComplete!(RESULT)
    })

    expect(mockUpsertDay).toHaveBeenCalledWith({
      date: '2026-06-15',
      photo_path: 'file://documents/photos/new.jpg',
      note_text: null,
      latitude: 37.7749,
      longitude: -122.4194,
      location_name: 'Mission District',
      location_source: 'exif',
      accent_color: null,
      share_color: null,
    })
  })

  it('persists the photo with device coordinates when EXIF GPS is absent', async () => {
    renderHook(() => useCapture())

    await act(async () => {
      capturedOnComplete!({
        localPath: 'file://documents/photos/new.jpg',
        exifGps: null,
        deviceGps: GPS,
        locationName: 'San Francisco',
        locationSource: 'device',
      })
    })

    expect(mockUpsertDay).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 37.7749,
        longitude: -122.4194,
        location_source: 'device',
      }),
    )
  })

  it('persists the photo with null coordinates when no GPS is available', async () => {
    renderHook(() => useCapture())

    await act(async () => {
      capturedOnComplete!({
        localPath: 'file://documents/photos/new.jpg',
        exifGps: null,
        deviceGps: null,
        locationName: null,
        locationSource: null,
      })
    })

    expect(mockUpsertDay).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: null, longitude: null, location_source: null }),
    )
  })

  describe('one-photo-per-day replacement', () => {
    it('does not show a confirmation prompt when today has no existing photo', async () => {
      mockGetDay.mockResolvedValue(null)
      const alertSpy = jest.spyOn(Alert, 'alert')
      renderHook(() => useCapture())

      await act(async () => {
        capturedOnComplete!(RESULT)
      })

      expect(alertSpy).not.toHaveBeenCalled()
      expect(mockUpsertDay).toHaveBeenCalled()
    })

    it('prompts for confirmation when today already has a photo', async () => {
      mockGetDay.mockResolvedValue({ photo_path: 'file://documents/photos/old.jpg' })
      simulateAlert('Cancel')
      const alertSpy = jest.spyOn(Alert, 'alert')
      renderHook(() => useCapture())

      await act(async () => {
        capturedOnComplete!(RESULT)
      })

      expect(alertSpy).toHaveBeenCalledWith(
        "Replace today's photo?",
        'Your current photo will be permanently deleted.',
        expect.any(Array),
      )
    })

    it('deletes the old photo and saves the new one when the user confirms', async () => {
      mockGetDay.mockResolvedValue({ photo_path: 'file://documents/photos/old.jpg' })
      simulateAlert('Replace')
      renderHook(() => useCapture())

      await act(async () => {
        capturedOnComplete!(RESULT)
      })

      expect(mockDeletePhoto).toHaveBeenCalledWith('file://documents/photos/old.jpg')
      expect(mockUpsertDay).toHaveBeenCalledWith(
        expect.objectContaining({ photo_path: 'file://documents/photos/new.jpg' }),
      )
    })

    it('deletes the new photo and aborts when the user cancels', async () => {
      mockGetDay.mockResolvedValue({ photo_path: 'file://documents/photos/old.jpg' })
      simulateAlert('Cancel')
      renderHook(() => useCapture())

      await act(async () => {
        capturedOnComplete!(RESULT)
      })

      expect(mockDeletePhoto).toHaveBeenCalledWith('file://documents/photos/new.jpg')
      expect(mockDeletePhoto).not.toHaveBeenCalledWith('file://documents/photos/old.jpg')
      expect(mockUpsertDay).not.toHaveBeenCalled()
    })
  })
})
