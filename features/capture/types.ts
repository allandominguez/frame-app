import { GpsCoordinates } from '../../lib/location/exifGps'

export type CaptureResult = {
  localPath: string
  exifGps: GpsCoordinates | null
  deviceGps: GpsCoordinates | null
  locationName: string | null
  locationSource: 'exif' | 'device' | null
}
