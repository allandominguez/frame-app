import { act, renderHook } from '@testing-library/react-native'
import { CaptureResult } from '../../types'
import { useCapture } from '../useCapture'

let capturedOnComplete: ((result: CaptureResult) => void) | null = null
const mockUpsertDay = jest.fn()

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
  upsertDay: (...args: unknown[]) => mockUpsertDay(...args),
}))

const GPS = { latitude: 37.7749, longitude: -122.4194 }

describe('useCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedOnComplete = null
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('persists the photo with EXIF coordinates and location name when capture completes', async () => {
    renderHook(() => useCapture())

    await act(async () => {
      capturedOnComplete!({
        localPath: 'file://documents/photos/123.jpg',
        exifGps: GPS,
        deviceGps: null,
        locationName: 'Mission District',
        locationSource: 'exif',
      })
    })

    expect(mockUpsertDay).toHaveBeenCalledWith({
      date: '2026-06-15',
      photo_path: 'file://documents/photos/123.jpg',
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
        localPath: 'file://documents/photos/456.jpg',
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
        location_name: 'San Francisco',
      }),
    )
  })

  it('persists the photo with null coordinates when no GPS is available', async () => {
    renderHook(() => useCapture())

    await act(async () => {
      capturedOnComplete!({
        localPath: 'file://documents/photos/789.jpg',
        exifGps: null,
        deviceGps: null,
        locationName: null,
        locationSource: null,
      })
    })

    expect(mockUpsertDay).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: null,
        longitude: null,
        location_name: null,
        location_source: null,
      }),
    )
  })
})
