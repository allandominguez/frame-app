import { act, renderHook } from '@testing-library/react-native'
import { useHoldToUnlock } from '../useHoldToUnlock'

describe('useHoldToUnlock', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does not unlock before 13 seconds have elapsed', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(12_999))

    expect(onUnlock).not.toHaveBeenCalled()
  })

  it('unlocks after holding for 13 seconds', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(13_000))

    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('cancels the hold when released before 13 seconds', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(6_000))
    act(() => result.current.onPressOut())
    act(() => jest.advanceTimersByTime(10_000))

    expect(onUnlock).not.toHaveBeenCalled()
  })

  it('starts a fresh hold after a cancelled one, rather than resuming', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(10_000))
    act(() => result.current.onPressOut())

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(10_000))
    expect(onUnlock).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(3_000))
    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('reports a completed long hold exactly once via consumeLongHold', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(13_000))

    expect(result.current.consumeLongHold()).toBe(true)
    expect(result.current.consumeLongHold()).toBe(false)
  })

  it('reports no completed long hold for a normal short press', () => {
    const onUnlock = jest.fn()
    const { result } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(500))
    act(() => result.current.onPressOut())

    expect(result.current.consumeLongHold()).toBe(false)
  })

  it('does not fire onUnlock again after the timer is cleared on unmount', () => {
    const onUnlock = jest.fn()
    const { result, unmount } = renderHook(() => useHoldToUnlock(onUnlock))

    act(() => result.current.onPressIn())
    act(() => jest.advanceTimersByTime(6_000))
    unmount()
    act(() => jest.advanceTimersByTime(10_000))

    expect(onUnlock).not.toHaveBeenCalled()
  })
})
