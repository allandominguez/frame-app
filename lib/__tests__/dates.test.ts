import { formatDateAccessibilityLabel } from '../dates'

describe('formatDateAccessibilityLabel', () => {
  it('formats a full, spoken-friendly date', () => {
    expect(formatDateAccessibilityLabel('2026-06-08')).toBe('Monday, 8 June 2026')
  })

  it('does not zero-pad the day of month', () => {
    expect(formatDateAccessibilityLabel('2026-06-01')).toBe('Monday, 1 June 2026')
  })
})
