import { act, renderHook } from '@testing-library/react-native'
import { DetailOverlayVisibility, useDetailOverlayVisibility } from '../useDetailOverlayVisibility'

describe('useDetailOverlayVisibility', () => {
  it('starts hidden', () => {
    const { result } = renderHook(() => useDetailOverlayVisibility(true))
    expect(result.current.visible).toBe(false)
  })

  it('shows on toggle and hides on toggling again', () => {
    const { result } = renderHook(() => useDetailOverlayVisibility(true))

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(false)
  })

  it('hides when the page loses focus', () => {
    const { result, rerender } = renderHook<DetailOverlayVisibility, { isFocused: boolean }>(
      ({ isFocused }) => useDetailOverlayVisibility(isFocused),
      { initialProps: { isFocused: true } },
    )

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(true)

    rerender({ isFocused: false })

    expect(result.current.visible).toBe(false)
  })

  it('does not auto-show when the page regains focus', () => {
    const { result, rerender } = renderHook<DetailOverlayVisibility, { isFocused: boolean }>(
      ({ isFocused }) => useDetailOverlayVisibility(isFocused),
      { initialProps: { isFocused: true } },
    )

    rerender({ isFocused: false })
    rerender({ isFocused: true })

    expect(result.current.visible).toBe(false)
  })
})
