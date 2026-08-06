const mockExecAsync = jest.fn().mockResolvedValue(undefined)
const mockGetFirstAsync = jest.fn().mockResolvedValue({ user_version: 999 })

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: mockExecAsync,
    getFirstAsync: mockGetFirstAsync,
  }),
}))

describe('openDatabase', () => {
  beforeEach(() => {
    jest.resetModules()
    mockExecAsync.mockClear()
    mockGetFirstAsync.mockClear()
  })

  it('enables WAL mode and a busy timeout before applying migrations', async () => {
    const { openDatabase } = require('../database')
    await openDatabase()

    const calls = mockExecAsync.mock.calls.map((call) => call[0])
    expect(calls).toContain('PRAGMA journal_mode = WAL')
    expect(calls).toContain('PRAGMA busy_timeout = 3000')

    const walIndex = calls.indexOf('PRAGMA journal_mode = WAL')
    const versionCallIndex = mockGetFirstAsync.mock.invocationCallOrder[0]
    const walCallIndex = mockExecAsync.mock.invocationCallOrder[walIndex]
    expect(walCallIndex).toBeLessThan(versionCallIndex)
  })

  it('reuses the same connection on subsequent calls instead of reopening', async () => {
    const { openDatabase } = require('../database')
    await openDatabase()
    await openDatabase()

    const walCalls = mockExecAsync.mock.calls.filter(
      (call) => call[0] === 'PRAGMA journal_mode = WAL',
    )
    expect(walCalls).toHaveLength(1)
  })
})
