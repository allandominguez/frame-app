import { trace } from '../trace'

const LOG_DIR_URI = 'file:///documents/logs/'

const mockDirCreate = jest.fn()
const mockFileCreate = jest.fn()
const mockFileWrite = jest.fn()

let mockFileExists = false
let mockFileText = ''

jest.mock('expo-file-system', () => {
  const mockDir = { uri: LOG_DIR_URI, create: (...args: unknown[]) => mockDirCreate(...args) }
  const MockDirectory = jest.fn().mockReturnValue(mockDir)

  const MockFile = jest.fn().mockImplementation(() => ({
    get exists() {
      return mockFileExists
    },
    create: (...args: unknown[]) => {
      mockFileCreate(...args)
      mockFileExists = true
    },
    textSync: () => mockFileText,
    write: (content: string) => {
      mockFileWrite(content)
      mockFileText = content
    },
  }))

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: { uri: 'file:///documents/' } },
  }
})

describe('trace', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFileExists = false
    mockFileText = ''
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  it('logs the event and data to the console', () => {
    trace('[thing] happened', { count: 3 })
    expect(console.log).toHaveBeenCalledWith('[thing] happened', { count: 3 })
  })

  it('ensures the logs directory exists before writing', () => {
    trace('[thing] happened')
    expect(mockDirCreate).toHaveBeenCalledWith({ idempotent: true })
  })

  it('creates the log file the first time it writes', () => {
    trace('[thing] happened')
    expect(mockFileCreate).toHaveBeenCalledTimes(1)
  })

  it('does not recreate the log file on subsequent writes', () => {
    mockFileExists = true
    trace('[thing] happened')
    expect(mockFileCreate).not.toHaveBeenCalled()
  })

  it('appends a new line after any existing content', () => {
    mockFileExists = true
    mockFileText = 'existing line\n'
    trace('[thing] happened', { count: 3 })
    const written = mockFileWrite.mock.calls[0][0] as string
    expect(written.startsWith('existing line\n')).toBe(true)
    expect(written).toContain('[thing] happened')
    expect(written).toContain('"count":3')
  })

  it('never writes a line for data that was not passed in', () => {
    trace('[thing] happened')
    const written = mockFileWrite.mock.calls[0][0] as string
    expect(written).toContain('[thing] happened {}')
  })

  it('truncates from the head once the size cap is exceeded, keeping only whole lines', () => {
    // Each line is ~20 bytes; 1500 of them comfortably exceeds the 20,000-byte cap.
    mockFileExists = true
    mockFileText =
      Array.from({ length: 1500 }, (_, i) => `line-${i}`.padEnd(19, ' ')).join('\n') + '\n'

    trace('[thing] happened')

    const written = mockFileWrite.mock.calls[0][0] as string
    expect(written.length).toBeLessThanOrEqual(20_000)
    // No partial line at the start — every surviving line starts a real entry.
    expect(written.startsWith('line-')).toBe(true)
    expect(written.endsWith('[thing] happened {}\n')).toBe(true)
  })

  it('does not throw when file I/O fails', () => {
    mockFileExists = true
    mockFileWrite.mockImplementation(() => {
      throw new Error('disk full')
    })
    expect(() => trace('[thing] happened')).not.toThrow()
    expect(console.log).toHaveBeenCalled()
  })
})
