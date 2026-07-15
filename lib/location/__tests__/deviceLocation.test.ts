import { getDeviceLocation } from '../deviceLocation'

const mockRequestForegroundPermissionsAsync = jest.fn()
const mockGetCurrentPositionAsync = jest.fn()

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args),
}))

describe('getDeviceLocation', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns coordinates when foreground permission is granted', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' })
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })

    const result = await getDeviceLocation()

    expect(result).toEqual({ latitude: 37.7749, longitude: -122.4194 })
  })

  it('returns null when foreground permission is denied', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' })

    const result = await getDeviceLocation()

    expect(result).toBeNull()
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled()
  })
})
