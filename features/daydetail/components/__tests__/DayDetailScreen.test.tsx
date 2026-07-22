import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { RootStackParamList } from '../../../../navigation/types'
import { DayDetailScreen } from '../DayDetailScreen'

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
)

const mockGetAllDays = jest.fn()

jest.mock('../../../../lib/repositories/day', () => ({
  getAllDays: () => mockGetAllDays(),
}))

type Props = NativeStackScreenProps<RootStackParamList, 'DayDetail'>

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    navigation: { goBack: jest.fn() } as unknown as Props['navigation'],
    route: { key: 'DayDetail', name: 'DayDetail', params: { date: '2026-06-08' } },
    ...overrides,
  }
}

describe('DayDetailScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockGetAllDays.mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  async function renderScreen(overrides: Partial<Props> = {}) {
    const result = render(<DayDetailScreen {...makeProps(overrides)} />)
    // Flush the getAllDays() microtask so no state update lands after the test ends.
    await act(async () => {
      await Promise.resolve()
    })
    return result
  }

  it('hides the close control while the date overlay is showing', async () => {
    await renderScreen()
    expect(screen.queryByLabelText('Back')).toBeNull()
  })

  it('shows the close control once the date overlay clears', async () => {
    await renderScreen()

    act(() => {
      jest.advanceTimersByTime(1700)
    })

    expect(screen.getByLabelText('Back')).toBeTruthy()
  })

  it('exits to the calendar when the close control is tapped', async () => {
    const goBack = jest.fn()
    await renderScreen({ navigation: { goBack } as unknown as Props['navigation'] })

    act(() => {
      jest.advanceTimersByTime(1700)
    })
    fireEvent.press(screen.getByLabelText('Back'))

    expect(goBack).toHaveBeenCalledTimes(1)
  })
})
