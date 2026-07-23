import {
  clearPhoto,
  deleteDay,
  DayEntryInput,
  getAllDays,
  getDay,
  updateNoteText,
  upsertDay,
} from '../day'

const mockDayStore = new Map<string, Record<string, unknown>>()

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      if (/pragma user_version/i.test(sql)) return { user_version: 1 }
      if (/from day_entries where date/i.test(sql))
        return mockDayStore.get(params![0] as string) ?? null
      return null
    }),
    getAllAsync: jest.fn().mockImplementation(async (sql: string) => {
      if (/from day_entries/i.test(sql)) {
        return [...mockDayStore.values()].sort((a, b) =>
          (b.date as string).localeCompare(a.date as string),
        )
      }
      return []
    }),
    runAsync: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
      if (/insert into day_entries/i.test(sql)) {
        const [
          date,
          photo_path,
          note_text,
          latitude,
          longitude,
          location_name,
          location_source,
          accent_color,
          share_color,
          created_at,
          updated_at,
        ] = params as [
          string,
          string | null,
          string | null,
          number | null,
          number | null,
          string | null,
          string | null,
          string | null,
          string | null,
          string,
          string,
        ]
        const existing = mockDayStore.get(date)
        mockDayStore.set(date, {
          date,
          photo_path,
          note_text,
          latitude,
          longitude,
          location_name,
          location_source,
          accent_color,
          share_color,
          created_at: existing ? (existing.created_at as string) : created_at,
          updated_at,
        })
      } else if (/update day_entries set note_text/i.test(sql)) {
        const [note_text, updated_at, date] = params as [string | null, string, string]
        const existing = mockDayStore.get(date)
        if (existing) {
          mockDayStore.set(date, { ...existing, note_text, updated_at })
        }
      } else if (/update day_entries set\s+photo_path/i.test(sql)) {
        const [updated_at, date] = params as [string, string]
        const existing = mockDayStore.get(date)
        if (existing) {
          mockDayStore.set(date, {
            ...existing,
            photo_path: null,
            latitude: null,
            longitude: null,
            location_name: null,
            location_source: null,
            accent_color: null,
            share_color: null,
            updated_at,
          })
        }
      } else if (/delete from day_entries/i.test(sql)) {
        mockDayStore.delete(params![0] as string)
      }
      return { lastInsertRowId: 0, changes: 1 }
    }),
  }),
}))

const makeInput = (overrides: Partial<DayEntryInput> = {}): DayEntryInput => ({
  date: '2026-06-08',
  photo_path: null,
  note_text: null,
  latitude: null,
  longitude: null,
  location_name: null,
  location_source: null,
  accent_color: null,
  share_color: null,
  ...overrides,
})

beforeEach(() => {
  mockDayStore.clear()
})

describe('upsertDay', () => {
  it('stores a new entry that can be retrieved', async () => {
    await upsertDay(
      makeInput({
        photo_path: '/photos/2026-06-08.jpg',
        note_text: 'A great day',
        latitude: 51.5074,
        longitude: -0.1278,
        location_name: 'London',
        location_source: 'device',
      }),
    )

    const entry = await getDay('2026-06-08')
    expect(entry?.date).toBe('2026-06-08')
    expect(entry?.photo_path).toBe('/photos/2026-06-08.jpg')
    expect(entry?.note_text).toBe('A great day')
    expect(entry?.latitude).toBe(51.5074)
    expect(entry?.longitude).toBe(-0.1278)
    expect(entry?.location_name).toBe('London')
    expect(entry?.location_source).toBe('device')
  })

  it('preserves created_at when updating an existing entry', async () => {
    await upsertDay(makeInput({ note_text: 'Original' }))
    const original = await getDay('2026-06-08')

    await upsertDay(makeInput({ note_text: 'Updated' }))
    const updated = await getDay('2026-06-08')

    expect(updated?.created_at).toBe(original?.created_at)
    expect(updated?.note_text).toBe('Updated')
  })

  it('overwrites all non-timestamp fields on update', async () => {
    await upsertDay(
      makeInput({ photo_path: '/old.jpg', latitude: 1.0, longitude: 2.0, location_source: 'exif' }),
    )
    await upsertDay(
      makeInput({
        photo_path: '/new.jpg',
        latitude: 3.0,
        longitude: 4.0,
        location_source: 'device',
      }),
    )

    const entry = await getDay('2026-06-08')
    expect(entry?.photo_path).toBe('/new.jpg')
    expect(entry?.latitude).toBe(3.0)
    expect(entry?.location_source).toBe('device')
  })

  it('stores and retrieves accent_color and share_color', async () => {
    await upsertDay(makeInput({ accent_color: '#A3C4F5', share_color: 'blue' }))

    const entry = await getDay('2026-06-08')
    expect(entry?.accent_color).toBe('#A3C4F5')
    expect(entry?.share_color).toBe('blue')
  })

  it('stores null for accent_color and share_color when not provided', async () => {
    await upsertDay(makeInput())

    const entry = await getDay('2026-06-08')
    expect(entry?.accent_color).toBeNull()
    expect(entry?.share_color).toBeNull()
  })

  it('overwrites accent_color and share_color on update', async () => {
    await upsertDay(makeInput({ accent_color: '#111111', share_color: 'black' }))
    await upsertDay(makeInput({ accent_color: '#A3C4F5', share_color: 'blue' }))

    const entry = await getDay('2026-06-08')
    expect(entry?.accent_color).toBe('#A3C4F5')
    expect(entry?.share_color).toBe('blue')
  })
})

describe('getDay', () => {
  it('returns null when no entry exists for the date', async () => {
    expect(await getDay('2026-01-01')).toBeNull()
  })

  it('returns the entry for an existing date', async () => {
    await upsertDay(makeInput({ note_text: 'Hello' }))
    expect((await getDay('2026-06-08'))?.note_text).toBe('Hello')
  })
})

describe('getAllDays', () => {
  it('returns an empty array when no entries exist', async () => {
    expect(await getAllDays()).toEqual([])
  })

  it('returns all entries ordered by date descending', async () => {
    await upsertDay(makeInput({ date: '2026-06-06' }))
    await upsertDay(makeInput({ date: '2026-06-08' }))
    await upsertDay(makeInput({ date: '2026-06-07' }))

    const dates = (await getAllDays()).map((e) => e.date)
    expect(dates).toEqual(['2026-06-08', '2026-06-07', '2026-06-06'])
  })
})

describe('deleteDay', () => {
  it('removes the entry for the given date', async () => {
    await upsertDay(makeInput())
    await deleteDay('2026-06-08')
    expect(await getDay('2026-06-08')).toBeNull()
  })

  it('does nothing when the date does not exist', async () => {
    await expect(deleteDay('2026-01-01')).resolves.not.toThrow()
  })
})

describe('updateNoteText', () => {
  it('updates the note text for an existing entry', async () => {
    await upsertDay(makeInput({ note_text: 'Original' }))
    await updateNoteText('2026-06-08', 'Updated')

    expect((await getDay('2026-06-08'))?.note_text).toBe('Updated')
  })

  it('clears the note text when given null', async () => {
    await upsertDay(makeInput({ note_text: 'Original' }))
    await updateNoteText('2026-06-08', null)

    expect((await getDay('2026-06-08'))?.note_text).toBeNull()
  })

  it('does not affect other fields on the entry', async () => {
    await upsertDay(makeInput({ photo_path: '/photo.jpg', location_name: 'London' }))
    await updateNoteText('2026-06-08', 'Updated')

    const entry = await getDay('2026-06-08')
    expect(entry?.photo_path).toBe('/photo.jpg')
    expect(entry?.location_name).toBe('London')
  })
})

describe('clearPhoto', () => {
  it('clears photo, location, and color fields', async () => {
    await upsertDay(
      makeInput({
        photo_path: '/photo.jpg',
        latitude: 51.5074,
        longitude: -0.1278,
        location_name: 'London',
        location_source: 'device',
        accent_color: '#A3C4F5',
        share_color: 'blue',
      }),
    )

    await clearPhoto('2026-06-08')

    const entry = await getDay('2026-06-08')
    expect(entry?.photo_path).toBeNull()
    expect(entry?.latitude).toBeNull()
    expect(entry?.longitude).toBeNull()
    expect(entry?.location_name).toBeNull()
    expect(entry?.location_source).toBeNull()
    expect(entry?.accent_color).toBeNull()
    expect(entry?.share_color).toBeNull()
  })

  it('preserves note_text and created_at', async () => {
    await upsertDay(makeInput({ photo_path: '/photo.jpg', note_text: 'A great day' }))
    const original = await getDay('2026-06-08')

    await clearPhoto('2026-06-08')

    const entry = await getDay('2026-06-08')
    expect(entry?.note_text).toBe('A great day')
    expect(entry?.created_at).toBe(original?.created_at)
  })

  it('does nothing when the date does not exist', async () => {
    await expect(clearPhoto('2026-01-01')).resolves.not.toThrow()
  })
})
