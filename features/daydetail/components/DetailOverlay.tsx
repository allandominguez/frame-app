import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Typography } from '../../../lib/design'

const APPEAR_MS = 200
const DISMISS_MS = 250

type Props = {
  visible: boolean
  locationName: string | null
  noteText: string | null
}

export function DetailOverlay({ visible, locationName, noteText }: Props) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? APPEAR_MS : DISMISS_MS,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [visible, opacity])

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <View testID="detail-overlay-dim" style={styles.dim} />
      {locationName && (
        <View style={styles.locationWrap}>
          <Text style={styles.location}>{locationName}</Text>
        </View>
      )}
      {noteText && (
        <View style={styles.noteWrap}>
          <Text style={styles.note}>{noteText}</Text>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  locationWrap: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  location: {
    ...Typography.bodyLg,
    color: Colors.surface,
    textAlign: 'center',
  },
  noteWrap: {
    position: 'absolute',
    top: '60%',
    left: Spacing.lg,
    right: Spacing.lg,
  },
  note: {
    ...Typography.labelMd,
    color: Colors.surface,
  },
})
