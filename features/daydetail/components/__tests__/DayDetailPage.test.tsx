import { render, screen } from '@testing-library/react-native'
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
  it('shows the photo for the entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.getByLabelText('Photo from 2026-06-08')).toBeTruthy()
  })

  it('dims the page when it is not the focused entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused={false} height={400} />)
    expect(screen.getByTestId('dim-overlay')).toBeTruthy()
  })

  it('does not dim the page when it is the focused entry', () => {
    render(<DayDetailPage entry={makeEntry()} isFocused height={400} />)
    expect(screen.queryByTestId('dim-overlay')).toBeNull()
  })
})
