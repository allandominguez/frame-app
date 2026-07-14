export type GpsCoordinates = {
  latitude: number
  longitude: number
}

export function extractGpsFromExif(exif: Record<string, unknown>): GpsCoordinates | null {
  // iOS wraps GPS fields under a "{GPS}" key; Android exposes them at the top level.
  const gps = (exif['{GPS}'] as Record<string, unknown> | undefined) ?? exif

  const lat = gps['Latitude'] ?? gps['GPSLatitude']
  const latRef = gps['LatitudeRef'] ?? gps['GPSLatitudeRef']
  const lng = gps['Longitude'] ?? gps['GPSLongitude']
  const lngRef = gps['LongitudeRef'] ?? gps['GPSLongitudeRef']

  if (lat == null || lng == null) return null

  const latitude = toDecimalDegrees(lat, latRef as string | undefined)
  const longitude = toDecimalDegrees(lng, lngRef as string | undefined)

  if (latitude == null || longitude == null) return null

  return { latitude, longitude }
}

function toDecimalDegrees(value: unknown, ref?: string): number | null {
  let decimal: number

  if (typeof value === 'number') {
    decimal = value
  } else if (Array.isArray(value) && value.length === 3) {
    const [d, m, s] = value as number[]
    decimal = d + m / 60 + s / 3600
  } else {
    return null
  }

  if (ref === 'S' || ref === 'W') decimal = -decimal

  return decimal
}
