import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans'
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display'
import { useFonts } from 'expo-font'

export const FontFamily = {
  serif: 'PlayfairDisplay-Regular',
  sans: 'DMSans-Regular',
  sansMedium: 'DMSans-Medium',
} as const

export function useAppFonts() {
  return useFonts({
    [FontFamily.serif]: PlayfairDisplay_400Regular,
    [FontFamily.sans]: DMSans_400Regular,
    [FontFamily.sansMedium]: DMSans_500Medium,
  })
}
