import { extractGpsFromExif } from '../exifGps'

describe('extractGpsFromExif', () => {
  describe('iOS format — GPS fields nested under {GPS}', () => {
    it('extracts decimal coordinates from the {GPS} block', () => {
      const exif = {
        '{GPS}': { Latitude: 37.7749, LatitudeRef: 'N', Longitude: 122.4194, LongitudeRef: 'W' },
      }

      expect(extractGpsFromExif(exif)).toEqual({ latitude: 37.7749, longitude: -122.4194 })
    })

    it('converts DMS arrays to decimal degrees', () => {
      const exif = {
        '{GPS}': {
          Latitude: [37, 46, 29.64],
          LatitudeRef: 'N',
          Longitude: [122, 25, 9.84],
          LongitudeRef: 'W',
        },
      }

      const result = extractGpsFromExif(exif)
      expect(result?.latitude).toBeCloseTo(37.7749, 3)
      expect(result?.longitude).toBeCloseTo(-122.4194, 3)
    })

    it('applies southern hemisphere correctly', () => {
      const exif = {
        '{GPS}': { Latitude: 33.8688, LatitudeRef: 'S', Longitude: 151.2093, LongitudeRef: 'E' },
      }

      expect(extractGpsFromExif(exif)).toEqual({ latitude: -33.8688, longitude: 151.2093 })
    })
  })

  describe('Android format — GPS fields at the top level', () => {
    it('extracts flat GPS fields', () => {
      const exif = {
        GPSLatitude: 37.7749,
        GPSLatitudeRef: 'N',
        GPSLongitude: 122.4194,
        GPSLongitudeRef: 'W',
      }

      expect(extractGpsFromExif(exif)).toEqual({ latitude: 37.7749, longitude: -122.4194 })
    })
  })

  describe('missing or invalid GPS data', () => {
    it('returns null when latitude is missing', () => {
      const exif = { '{GPS}': { Longitude: 122.4194, LongitudeRef: 'W' } }
      expect(extractGpsFromExif(exif)).toBeNull()
    })

    it('returns null when longitude is missing', () => {
      const exif = { '{GPS}': { Latitude: 37.7749, LatitudeRef: 'N' } }
      expect(extractGpsFromExif(exif)).toBeNull()
    })

    it('returns null when exif has no GPS fields at all', () => {
      expect(extractGpsFromExif({ Make: 'Apple', Model: 'iPhone 15' })).toBeNull()
    })

    it('returns null when GPS value is an unrecognised type', () => {
      const exif = { '{GPS}': { Latitude: 'invalid', Longitude: 122.4194 } }
      expect(extractGpsFromExif(exif)).toBeNull()
    })
  })
})
