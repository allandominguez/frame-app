import { act, renderHook } from '@testing-library/react-native'
import { useNoteEditor } from '../useNoteEditor'

const mockUpdateNoteText = jest.fn()

jest.mock('../../../../lib/repositories/day', () => ({
  updateNoteText: (...args: unknown[]) => mockUpdateNoteText(...args),
}))

describe('useNoteEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts with the existing note text', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', 'A great day'))
    expect(result.current.value).toBe('A great day')
  })

  it('starts empty when the day has no note yet', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', null))
    expect(result.current.value).toBe('')
  })

  it('tracks editing state via focus and blur', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onFocus())
    expect(result.current.isEditing).toBe(true)

    act(() => result.current.onBlur())
    expect(result.current.isEditing).toBe(false)
  })

  it('saves automatically after the debounce elapses while typing', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onChangeText('A great day'))
    expect(mockUpdateNoteText).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(600))
    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great day')
  })

  it('resets the debounce on each keystroke rather than saving early', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onChangeText('A'))
    act(() => jest.advanceTimersByTime(400))
    act(() => result.current.onChangeText('A great'))
    act(() => jest.advanceTimersByTime(400))

    expect(mockUpdateNoteText).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(200))
    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great')
  })

  it('saves immediately on blur without waiting for the debounce', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onChangeText('A great day'))
    act(() => result.current.onBlur())

    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great day')
  })

  it('saves null rather than an empty string when the note is cleared', () => {
    const { result } = renderHook(() => useNoteEditor('2026-06-08', 'A great day'))

    act(() => result.current.onChangeText('   '))
    act(() => result.current.onBlur())

    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', null)
  })

  it('flushes a pending debounced save on unmount', () => {
    const { result, unmount } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onChangeText('A great day'))
    unmount()

    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great day')
  })

  it('does not save again on unmount when there is nothing pending', () => {
    const { result, unmount } = renderHook(() => useNoteEditor('2026-06-08', null))

    act(() => result.current.onChangeText('A great day'))
    act(() => jest.advanceTimersByTime(600))
    mockUpdateNoteText.mockClear()

    unmount()

    expect(mockUpdateNoteText).not.toHaveBeenCalled()
  })
})
