import { formatDateOverlayLabel } from '../utils'

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
