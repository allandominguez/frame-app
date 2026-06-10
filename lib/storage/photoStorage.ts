import { Directory, File, Paths } from 'expo-file-system'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { Image } from 'react-native'

const MAX_DIMENSION = 1920

function ensurePhotoDirExists(): Directory {
  const dir = new Directory(Paths.document, 'photos')
  dir.create({ idempotent: true })
  return dir
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject),
  )
}

export async function savePhoto(uri: string): Promise<string> {
  const dir = ensurePhotoDirExists()

  const { width, height } = await getImageSize(uri)
  const resize =
    width >= height
      ? { width: Math.min(width, MAX_DIMENSION) }
      : { height: Math.min(height, MAX_DIMENSION) }

  const context = ImageManipulator.manipulate(uri)
  context.resize(resize)
  const imageRef = await context.renderAsync()
  const { uri: cachedUri } = await imageRef.saveAsync({
    compress: 0.85,
    format: SaveFormat.JPEG,
  })

  const dest = new File(dir, `${Date.now()}.jpg`)
  new File(cachedUri).move(dest)
  return dest.uri
}

export function deletePhoto(localPath: string): void {
  const file = new File(localPath)
  if (file.exists) {
    file.delete()
  }
}
