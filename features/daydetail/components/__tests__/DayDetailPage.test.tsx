import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { DayEntry } from '../../../../lib/repositories/day'
import { DayDetailPage } from '../DayDetailPage'

// PageBlur wraps expo-blur's native BlurView and Animated internals, which
// aren't meaningfully assertable here — mock it to expose the `visible` prop
// DayDetailPage passes in, so the reveal/blur wiring itself can be tested.
jest.mock('../PageBlur', () => {
  const { Text } = require('react-native')
  return {
    PageBlur: ({ visible }: { visible: boolean }) => <Text>{String(visible)}</Text>,
  }
})

const mockUpdateNoteText = jest.fn()

jest.mock('../../../../lib/repositories/day', () => ({
  updateNoteText: (...args: unknown[]) => mockUpdateNoteText(...args),
}))

function makeEntry(overrides: Partial<DayEntry> = {}): DayEntry {
  return {
    date: '2026-06-08',
    photo_path: '/photos/2026-06-08.jpg',
    note_text: null,
    latitude: null,
    longitude: null,
    location_name: null,
    location_source: null,
    created_at: '2026-06-08T00:00:00.000Z',
    updated_at: '2026-06-08T00:00:00.000Z',
    accent_color: null,
    share_color: null,
    ...overrides,
  }
}

describe('DayDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows the photo for the entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByLabelText('Photo from 2026-06-08')).toBeTruthy()
  })

  it('offers a way to dismiss the date overlay while it is showing', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByLabelText('Dismiss date label')).toBeTruthy()
  })

  it('no longer offers to dismiss once the date overlay auto-dismisses', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)

    act(() => {
      jest.advanceTimersByTime(1700)
    })

    expect(screen.queryByLabelText('Dismiss date label')).toBeNull()
  })

  it('dismisses the date overlay when the page is tapped', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)

    fireEvent.press(screen.getByLabelText('Dismiss date label'))

    expect(screen.queryByLabelText('Dismiss date label')).toBeNull()
  })

  it('shows the date overlay when the page is focused', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByText('8\nMon')).toBeTruthy()
  })

  it('does not show the date overlay when the page is not focused', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused={false} height={400} />)
    expect(screen.queryByText('8\nMon')).toBeNull()
  })

  it('shows day details on tap once the date overlay has cleared', () => {
    render(
      <DayDetailPage
        entry={makeEntry({ location_name: 'Mission District' })}
        isFocused
        height={400}
      />,
    )

    act(() => {
      jest.advanceTimersByTime(1700)
    })
    fireEvent.press(screen.getByLabelText('Show day details'))

    expect(screen.getByLabelText('Hide day details')).toBeTruthy()
  })

  it('hides day details when tapped again', () => {
    render(
      <DayDetailPage
        entry={makeEntry({ location_name: 'Mission District' })}
        isFocused
        height={400}
      />,
    )

    act(() => {
      jest.advanceTimersByTime(1700)
    })
    fireEvent.press(screen.getByLabelText('Show day details'))
    fireEvent.press(screen.getByLabelText('Hide day details'))

    expect(screen.getByLabelText('Show day details')).toBeTruthy()
  })

  it('dismisses the date overlay rather than showing day details on the first tap', () => {
    render(
      <DayDetailPage
        entry={makeEntry({ location_name: 'Mission District' })}
        isFocused
        height={400}
      />,
    )

    fireEvent.press(screen.getByLabelText('Dismiss date label'))

    expect(screen.getByLabelText('Show day details')).toBeTruthy()
  })

  it('keeps the photo blurred before it is focused', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused={false} height={400} />)
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('keeps the photo blurred immediately after gaining focus, while the date overlay is still showing', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('reveals the photo once the date overlay auto-dismisses', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)

    act(() => {
      jest.advanceTimersByTime(1700)
    })

    expect(screen.getByText('false')).toBeTruthy()
  })

  it('re-blurs the photo if focus is lost after being revealed', () => {
    const { rerender } = render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)

    act(() => {
      jest.advanceTimersByTime(1700)
    })
    expect(screen.getByText('false')).toBeTruthy()

    rerender(<DayDetailPage entry={makeEntry()} isFocused={false} height={400} />)

    expect(screen.getByText('true')).toBeTruthy()
  })

  function revealDayDetails(entry: DayEntry = makeEntry()) {
    render(<DayDetailPage entry={entry} isFocused height={400} />)
    act(() => {
      jest.advanceTimersByTime(1700)
    })
    fireEvent.press(screen.getByLabelText('Show day details'))
  }

  it('saves the note after the debounce elapses while typing', () => {
    revealDayDetails(makeEntry({ date: '2026-06-08' }))

    fireEvent.changeText(screen.getByLabelText('Note for this day'), 'A great day')
    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great day')
  })

  it('consumes the tap immediately following a note blur, without toggling day details', () => {
    revealDayDetails()

    fireEvent(screen.getByLabelText('Note for this day'), 'blur')
    fireEvent.press(screen.getByLabelText('Hide day details'))

    expect(screen.getByLabelText('Hide day details')).toBeTruthy()
  })

  it('toggles day details normally once the post-blur tap has settled', () => {
    revealDayDetails()

    fireEvent(screen.getByLabelText('Note for this day'), 'blur')
    act(() => {
      jest.advanceTimersByTime(1)
    })
    fireEvent.press(screen.getByLabelText('Hide day details'))

    expect(screen.getByLabelText('Show day details')).toBeTruthy()
  })
})
