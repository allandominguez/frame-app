import { reverseGeocode } from '../reverseGeocode'

const mockReverseGeocodeAsync = jest.fn()

jest.mock('expo-location', () => ({
  reverseGeocodeAsync: (...args: unknown[]) => mockReverseGeocodeAsync(...args),
}))

const COORDS = { latitude: 37.7749, longitude: -122.4194 }

describe('reverseGeocode', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns the district when available', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { district: 'Mission District', city: 'San Francisco', region: 'California' },
    ])

    expect(await reverseGeocode(COORDS)).toBe('Mission District')
  })

  it('falls back to city when district is absent', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { district: null, city: 'San Francisco', region: 'California' },
    ])

    expect(await reverseGeocode(COORDS)).toBe('San Francisco')
  })

  it('falls back to region when both district and city are absent', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([
      { district: null, city: null, region: 'California' },
    ])

    expect(await reverseGeocode(COORDS)).toBe('California')
  })

  it('returns null when the geocoder returns no results', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([])

    expect(await reverseGeocode(COORDS)).toBeNull()
  })

  it('returns null when all name fields are absent', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([{ district: null, city: null, region: null }])

    expect(await reverseGeocode(COORDS)).toBeNull()
  })

  it('passes the coordinates to reverseGeocodeAsync', async () => {
    mockReverseGeocodeAsync.mockResolvedValue([])

    await reverseGeocode(COORDS)

    expect(mockReverseGeocodeAsync).toHaveBeenCalledWith(COORDS)
  })
})
