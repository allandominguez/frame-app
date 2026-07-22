import { act, renderHook } from '@testing-library/react-native'
import { DetailOverlayVisibility, useDetailOverlayVisibility } from '../useDetailOverlayVisibility'

describe('useDetailOverlayVisibility', () => {
  it('starts hidden', () => {
    const { result } = renderHook(() => useDetailOverlayVisibility(0))
    expect(result.current.visible).toBe(false)
  })

  it('shows on toggle and hides on toggling again', () => {
    const { result } = renderHook(() => useDetailOverlayVisibility(0))

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(false)
  })

  it('hides immediately when close() is called', () => {
    const { result } = renderHook(() => useDetailOverlayVisibility(0))

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(true)

    act(() => {
      result.current.close()
    })
    expect(result.current.visible).toBe(false)
  })

  it('closes when the focused page changes', () => {
    const { result, rerender } = renderHook<DetailOverlayVisibility, { focusedIndex: number }>(
      ({ focusedIndex }) => useDetailOverlayVisibility(focusedIndex),
      { initialProps: { focusedIndex: 0 } },
    )

    act(() => {
      result.current.toggle()
    })
    expect(result.current.visible).toBe(true)

    rerender({ focusedIndex: 1 })

    expect(result.current.visible).toBe(false)
  })

  it('does not auto-show when the focused page changes again', () => {
    const { result, rerender } = renderHook<DetailOverlayVisibility, { focusedIndex: number }>(
      ({ focusedIndex }) => useDetailOverlayVisibility(focusedIndex),
      { initialProps: { focusedIndex: 0 } },
    )

    rerender({ focusedIndex: 1 })
    rerender({ focusedIndex: 0 })

    expect(result.current.visible).toBe(false)
  })
})
