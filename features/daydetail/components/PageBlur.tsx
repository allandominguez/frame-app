import { BlurView } from 'expo-blur'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

const TRANSITION_MS = 300

type Props = {
  visible: boolean
}

// Always mounted for the lifetime of the page — only opacity toggles — so
// the native blur is already warmed up by the time it needs to be visible,
// rather than cold-starting exactly when the photo would otherwise show.
export function PageBlur({ visible }: Props) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: TRANSITION_MS,
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [visible, opacity])

  return (
    <Animated.View testID="page-blur" style={[styles.container, { opacity }]} pointerEvents="none">
      <BlurView
        intensity={100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
})
