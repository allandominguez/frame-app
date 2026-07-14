import { GpsCoordinates } from '../../lib/location/exifGps'

export type { GpsCoordinates }

export type CaptureResult = {
  localPath: string
  exifGps: GpsCoordinates | null
  deviceGps: GpsCoordinates | null
  locationName: string | null
  locationSource: 'exif' | 'device' | null
}
