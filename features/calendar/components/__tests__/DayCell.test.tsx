import { fireEvent, render, screen } from '@testing-library/react-native'
import { CalendarDayData } from '../../types'
import { DayCell } from '../DayCell'

const noop = () => {}
const SIZE = 44

function makeCell(overrides: Partial<CalendarDayData> = {}): CalendarDayData {
  return {
    date: '2026-07-14',
    dayNumber: 14,
    accentColor: null,
    hasPhoto: false,
    isToday: false,
    isFuture: false,
    ...overrides,
  }
}

describe('DayCell', () => {
  it('renders the day number', () => {
    render(<DayCell cell={makeCell()} size={SIZE} onPress={noop} onLongPress={noop} />)
    expect(screen.getByText('14')).toBeTruthy()
  })

  it('shows an accent dot when the day has a photo', () => {
    render(
      <DayCell
        cell={makeCell({ hasPhoto: true, accentColor: '#4A90E2' })}
        size={SIZE}
        onPress={noop}
        onLongPress={noop}
      />,
    )
    expect(screen.getByTestId('photo-dot')).toBeTruthy()
  })

  it('does not show a dot when the day has no photo', () => {
    render(<DayCell cell={makeCell()} size={SIZE} onPress={noop} onLongPress={noop} />)
    expect(screen.queryByTestId('photo-dot')).toBeNull()
  })

  it('calls onPress with the date when a photo day is pressed', () => {
    const onPress = jest.fn()
    render(
      <DayCell
        cell={makeCell({ hasPhoto: true, accentColor: '#4A90E2' })}
        size={SIZE}
        onPress={onPress}
        onLongPress={noop}
      />,
    )
    fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledWith('2026-07-14')
  })

  it('calls onLongPress with the date when a photo day is long-pressed', () => {
    const onLongPress = jest.fn()
    render(
      <DayCell
        cell={makeCell({ hasPhoto: true, accentColor: '#4A90E2' })}
        size={SIZE}
        onPress={noop}
        onLongPress={onLongPress}
      />,
    )
    fireEvent(screen.getByRole('button'), 'longPress')
    expect(onLongPress).toHaveBeenCalledWith('2026-07-14')
  })

  it('is not pressable when the day has no photo', () => {
    render(<DayCell cell={makeCell()} size={SIZE} onPress={noop} onLongPress={noop} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders future days with reduced visual emphasis', () => {
    const { getByText } = render(
      <DayCell cell={makeCell({ isFuture: true })} size={SIZE} onPress={noop} onLongPress={noop} />,
    )
    // Future days are not interactive — no button role
    expect(screen.queryByRole('button')).toBeNull()
    // Day number is still rendered
    expect(getByText('14')).toBeTruthy()
  })

  it('renders nothing for an empty leading cell', () => {
    render(
      <DayCell
        cell={{
          date: null,
          dayNumber: 0,
          accentColor: null,
          hasPhoto: false,
          isToday: false,
          isFuture: false,
        }}
        size={SIZE}
        onPress={noop}
        onLongPress={noop}
      />,
    )
    expect(screen.queryByText(/\d+/)).toBeNull()
    expect(screen.queryByTestId('photo-dot')).toBeNull()
  })
})
