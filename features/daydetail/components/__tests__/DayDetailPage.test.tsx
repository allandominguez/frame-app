import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { DayEntry } from '../../../../lib/repositories/day'
import { DayDetailPage } from '../DayDetailPage'

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
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows the photo for the entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByLabelText('Photo from 2026-06-08')).toBeTruthy()
  })

  it('dims the page when it is not the focused entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused={false} height={400} />)
    expect(screen.getByTestId('dim-overlay')).toBeTruthy()
  })

  it('does not apply the static dim to the focused page', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.queryByTestId('dim-overlay')).toBeNull()
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
})
