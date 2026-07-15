import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location'
import { GpsCoordinates } from './exifGps'

export async function getDeviceLocation(): Promise<GpsCoordinates | null> {
  const { status } = await requestForegroundPermissionsAsync()
  if (status !== 'granted') return null

  const position = await getCurrentPositionAsync({})
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}
