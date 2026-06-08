import { getSetting, setSetting } from '../settings'

const mockSettingsStore = new Map<string, string | null>()

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      if (/pragma user_version/i.test(sql)) return { user_version: 1 }
      if (/from settings where key/i.test(sql)) {
        const key = params![0] as string
        return mockSettingsStore.has(key) ? { value: mockSettingsStore.get(key) } : null
      }
      return null
    }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    runAsync: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      if (/insert into settings/i.test(sql)) {
        const [key, value] = params as [string, string | null]
        mockSettingsStore.set(key, value)
      }
      return { lastInsertRowId: 0, changes: 1 }
    }),
  }),
}))

beforeEach(() => {
  mockSettingsStore.clear()
})

describe('getSetting', () => {
  it('returns null for a key that has never been set', async () => {
    expect(await getSetting('notification_enabled')).toBeNull()
  })

  it('returns the stored value for a key', async () => {
    await setSetting('notification_enabled', 'true')
    expect(await getSetting('notification_enabled')).toBe('true')
  })
})

describe('setSetting', () => {
  it('stores a value that can be retrieved', async () => {
    await setSetting('theme', 'dark')
    expect(await getSetting('theme')).toBe('dark')
  })

  it('updates an existing key with a new value', async () => {
    await setSetting('theme', 'light')
    await setSetting('theme', 'dark')
    expect(await getSetting('theme')).toBe('dark')
  })

  it('can store null as the value for a key', async () => {
    await setSetting('theme', 'dark')
    await setSetting('theme', null)
    expect(await getSetting('theme')).toBeNull()
  })
})
