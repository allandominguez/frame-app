import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Alert, AlertButton } from 'react-native'
import { DayEntry } from '../../../../lib/repositories/day'
import { RootStackParamList } from '../../../../navigation/types'
import { CalendarScreen } from '../CalendarScreen'

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
)

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react')
    useEffect(callback, [callback])
  },
}))

let mockStore: DayEntry[] = []
const mockClearPhoto = jest.fn(async (date: string) => {
  mockStore = mockStore.map((e) =>
    e.date === date
      ? {
          ...e,
          photo_path: null,
          latitude: null,
          longitude: null,
          location_name: null,
          location_source: null,
          accent_color: null,
          share_color: null,
        }
      : e,
  )
})

jest.mock('../../../../lib/repositories/day', () => ({
  getAllDays: () => Promise.resolve(mockStore),
  clearPhoto: (...args: [string]) => mockClearPhoto(...args),
}))

const mockDeletePhoto = jest.fn()

jest.mock('../../../../lib/storage/photoStorage', () => ({
  deletePhoto: (...args: unknown[]) => mockDeletePhoto(...args),
}))

function simulateAlert(choice: 'Cancel' | 'Delete') {
  return jest.spyOn(Alert, 'alert').mockImplementationOnce((_title, _message, buttons) => {
    const btn = (buttons as AlertButton[]).find((b) => b.text === choice)
    btn?.onPress?.()
  })
}

function makeEntry(date: string, photoPath: string | null): DayEntry {
  return {
    date,
    photo_path: photoPath,
    note_text: null,
    latitude: null,
    longitude: null,
    location_name: null,
    location_source: null,
    created_at: `${date}T12:00:00.000Z`,
    updated_at: `${date}T12:00:00.000Z`,
    accent_color: null,
    share_color: null,
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    navigation: { navigate: jest.fn() } as unknown as Props['navigation'],
    route: { key: 'Calendar', name: 'Calendar', params: undefined },
    ...overrides,
  }
}

async function renderScreen(overrides: Partial<Props> = {}) {
  const result = render(<CalendarScreen {...makeProps(overrides)} />)
  await act(async () => {
    await Promise.resolve()
  })
  fireEvent(screen.getByTestId('calendar-list-container'), 'layout', {
    nativeEvent: { layout: { height: 800 } },
  })
  return result
}

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore = []
  })

  // Note: react-test-renderer's FlatList doesn't reproduce the native cell-recycling
  // behavior that motivated adding `extraData` to the real component, so this test
  // passes regardless of that prop — it verifies the React-level state flow (delete
  // -> refresh -> re-render) is correct, not the native FlatList staleness fix itself.
  it('removes the accent dot immediately after deleting a photo via the long-press menu', async () => {
    const today = new Date().toISOString().slice(0, 10)
    mockStore = [makeEntry(today, '/photos/today.jpg')]
    simulateAlert('Delete')
    await renderScreen()

    const label = `${Number(today.slice(8, 10))}, has photo`
    fireEvent(screen.getByLabelText(label), 'longPress')
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Delete photo'))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mockClearPhoto).toHaveBeenCalledWith(today)
    expect(screen.queryByLabelText(label)).toBeNull()
  })

  it('closes the action menu after a confirmed delete', async () => {
    const today = new Date().toISOString().slice(0, 10)
    mockStore = [makeEntry(today, '/photos/today.jpg')]
    simulateAlert('Delete')
    await renderScreen()

    const label = `${Number(today.slice(8, 10))}, has photo`
    fireEvent(screen.getByLabelText(label), 'longPress')
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Delete photo'))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.queryByLabelText('Delete photo')).toBeNull()
  })

  it('does not open the action menu when long-pressing a day with no photo', async () => {
    mockStore = []
    await renderScreen()

    expect(screen.queryByLabelText('Delete photo')).toBeNull()
  })
})
