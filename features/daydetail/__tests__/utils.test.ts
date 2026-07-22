import { formatDateAccessibilityLabel, formatDateOverlayLabel, pickNotePlaceholder } from '../utils'

describe('formatDateOverlayLabel', () => {
  it('formats as day-of-month and abbreviated weekday on separate lines', () => {
    expect(formatDateOverlayLabel('2026-06-08')).toBe('8\nMon')
  })

  it('does not zero-pad the day of month', () => {
    expect(formatDateOverlayLabel('2026-06-01')).toBe('1\nMon')
  })

  it('formats a Sunday correctly', () => {
    expect(formatDateOverlayLabel('2026-06-07')).toBe('7\nSun')
  })
})

describe('formatDateAccessibilityLabel', () => {
  it('formats a full, spoken-friendly date', () => {
    expect(formatDateAccessibilityLabel('2026-06-08')).toBe('Monday, 8 June 2026')
  })

  it('does not zero-pad the day of month', () => {
    expect(formatDateAccessibilityLabel('2026-06-01')).toBe('Monday, 1 June 2026')
  })
})

describe('pickNotePlaceholder', () => {
  it('returns one of the known placeholder prompts', () => {
    const knownPlaceholders = [
      'Just type...',
      'Leave a note...',
      'Anything to remember?',
      'Dear future me...',
      'Behind the scenes...',
      "What's happening?",
    ]

    for (let i = 0; i < 20; i++) {
      expect(knownPlaceholders).toContain(pickNotePlaceholder())
    }
  })
})
