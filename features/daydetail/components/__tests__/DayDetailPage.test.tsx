import { ComponentProps } from 'react'
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

type Props = ComponentProps<typeof DayDetailPage>

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    entry: makeEntry(),
    isFocused: true,
    height: 400,
    dateOverlayVisible: false,
    dismissDateOverlay: jest.fn(),
    detailOverlayVisible: false,
    toggleDetailOverlay: jest.fn(),
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
    render(<DayDetailPage {...makeProps()} />)
    expect(screen.getByLabelText('Photo from Monday, 8 June 2026')).toBeTruthy()
  })

  it('shows the date overlay when focused and the date overlay is visible', () => {
    render(<DayDetailPage {...makeProps({ dateOverlayVisible: true })} />)
    expect(screen.getByText('8\nMon')).toBeTruthy()
  })

  it('does not show the date overlay when not focused, even if marked visible', () => {
    render(<DayDetailPage {...makeProps({ isFocused: false, dateOverlayVisible: true })} />)
    expect(screen.queryByText('8\nMon')).toBeNull()
  })

  it('dismisses the date overlay when tapped while it is showing', () => {
    const dismissDateOverlay = jest.fn()
    const toggleDetailOverlay = jest.fn()
    render(
      <DayDetailPage
        {...makeProps({ dateOverlayVisible: true, dismissDateOverlay, toggleDetailOverlay })}
      />,
    )

    fireEvent.press(screen.getByLabelText('Dismiss date label'))

    expect(dismissDateOverlay).toHaveBeenCalledTimes(1)
    expect(toggleDetailOverlay).not.toHaveBeenCalled()
  })

  it('toggles day details when tapped once the date overlay has cleared', () => {
    const toggleDetailOverlay = jest.fn()
    render(<DayDetailPage {...makeProps({ dateOverlayVisible: false, toggleDetailOverlay })} />)

    fireEvent.press(screen.getByLabelText('Show day details'))

    expect(toggleDetailOverlay).toHaveBeenCalledTimes(1)
  })

  it('shows day details overlay when focused and detailOverlayVisible is true', () => {
    render(
      <DayDetailPage
        {...makeProps({
          entry: makeEntry({ location_name: 'Mission District' }),
          detailOverlayVisible: true,
        })}
      />,
    )
    expect(screen.getByText('Mission District')).toBeTruthy()
  })

  it('does not show day details overlay when not focused, even if marked visible', () => {
    render(
      <DayDetailPage
        {...makeProps({
          entry: makeEntry({ location_name: 'Mission District' }),
          isFocused: false,
          detailOverlayVisible: true,
        })}
      />,
    )
    expect(screen.queryByText('Mission District')).toBeNull()
  })

  it('does not respond to taps when not focused', () => {
    const dismissDateOverlay = jest.fn()
    const toggleDetailOverlay = jest.fn()
    render(
      <DayDetailPage
        {...makeProps({ isFocused: false, dismissDateOverlay, toggleDetailOverlay })}
      />,
    )

    fireEvent.press(screen.getByRole('button'))

    expect(dismissDateOverlay).not.toHaveBeenCalled()
    expect(toggleDetailOverlay).not.toHaveBeenCalled()
  })

  it('blurs the photo when not focused', () => {
    render(<DayDetailPage {...makeProps({ isFocused: false })} />)
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('blurs the photo while the date overlay is still showing', () => {
    render(<DayDetailPage {...makeProps({ dateOverlayVisible: true })} />)
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('reveals the photo once the date overlay has cleared', () => {
    render(<DayDetailPage {...makeProps({ dateOverlayVisible: false })} />)
    expect(screen.getByText('false')).toBeTruthy()
  })

  function renderWithDetailsOpen(overrides: Partial<Props> = {}) {
    return render(<DayDetailPage {...makeProps({ detailOverlayVisible: true, ...overrides })} />)
  }

  it('saves the note after the debounce elapses while typing', () => {
    renderWithDetailsOpen({ entry: makeEntry({ date: '2026-06-08' }) })

    fireEvent.changeText(screen.getByLabelText('Note for this day'), 'A great day')
    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockUpdateNoteText).toHaveBeenCalledWith('2026-06-08', 'A great day')
  })

  it('consumes the tap immediately following a note blur, without toggling day details', () => {
    const toggleDetailOverlay = jest.fn()
    renderWithDetailsOpen({ toggleDetailOverlay })

    fireEvent(screen.getByLabelText('Note for this day'), 'blur')
    fireEvent.press(screen.getByLabelText('Hide day details'))

    expect(toggleDetailOverlay).not.toHaveBeenCalled()
  })

  it('toggles day details normally once the post-blur tap has settled', () => {
    const toggleDetailOverlay = jest.fn()
    renderWithDetailsOpen({ toggleDetailOverlay })

    fireEvent(screen.getByLabelText('Note for this day'), 'blur')
    act(() => {
      jest.advanceTimersByTime(1)
    })
    fireEvent.press(screen.getByLabelText('Hide day details'))

    expect(toggleDetailOverlay).toHaveBeenCalledTimes(1)
  })
})
