import { reverseGeocodeAsync } from 'expo-location'
import { GpsCoordinates } from './exifGps'

export async function reverseGeocode(coords: GpsCoordinates): Promise<string | null> {
  const results = await reverseGeocodeAsync(coords)
  if (results.length === 0) return null

  const { district, city, region } = results[0]
  return district ?? city ?? region ?? null
}
