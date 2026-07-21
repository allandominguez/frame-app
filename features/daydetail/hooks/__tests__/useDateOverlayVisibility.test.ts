import { act, renderHook } from '@testing-library/react-native'
import { DateOverlayVisibility, useDateOverlayVisibility } from '../useDateOverlayVisibility'

describe('useDateOverlayVisibility', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('is visible as soon as the page becomes focused', () => {
    const { result } = renderHook(() => useDateOverlayVisibility(true))
    expect(result.current.visible).toBe(true)
  })

  it('is not visible when the page is not focused', () => {
    const { result } = renderHook(() => useDateOverlayVisibility(false))
    expect(result.current.visible).toBe(false)
  })

  it('stays visible through the fade-in and hold duration', () => {
    const { result } = renderHook(() => useDateOverlayVisibility(true))

    act(() => {
      jest.advanceTimersByTime(1699)
    })

    expect(result.current.visible).toBe(true)
  })

  it('auto-dismisses once the fade-in and hold duration elapse', () => {
    const { result } = renderHook(() => useDateOverlayVisibility(true))

    act(() => {
      jest.advanceTimersByTime(1700)
    })

    expect(result.current.visible).toBe(false)
  })

  it('dismisses immediately when dismiss() is called before the hold elapses', () => {
    const { result } = renderHook(() => useDateOverlayVisibility(true))

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.visible).toBe(false)
  })

  it('becomes visible again if the page regains focus after losing it', () => {
    const { result, rerender } = renderHook<DateOverlayVisibility, { isFocused: boolean }>(
      ({ isFocused }) => useDateOverlayVisibility(isFocused),
      { initialProps: { isFocused: true } },
    )

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.visible).toBe(false)

    rerender({ isFocused: false })
    rerender({ isFocused: true })

    expect(result.current.visible).toBe(true)
  })
})
