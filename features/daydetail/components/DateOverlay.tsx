import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import { Typography } from '../../../lib/design'

const FADE_IN_MS = 200
const FADE_OUT_MS = 400

// Photos aren't themed by light/dark mode, so the fallback must stay white
// regardless of theme — it can't reuse a themeable design token like Colors.surface.
const DEFAULT_ACCENT_COLOR = '#FFFFFF'

type Props = {
  label: string
  accentColor: string | null
  visible: boolean
}

export function DateOverlay({ label, accentColor, visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? FADE_IN_MS : FADE_OUT_MS,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [visible, opacity])

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <View testID="date-overlay-scrim" style={styles.scrim} />
      <Text style={[styles.label, { color: accentColor ?? DEFAULT_ACCENT_COLOR }]}>{label}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Nested inside the animated container so it fades in/out in lockstep with
  // the label, rather than needing its own separately-timed animation.
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  label: {
    ...Typography.displayXl,
    textAlign: 'center',
  },
})
