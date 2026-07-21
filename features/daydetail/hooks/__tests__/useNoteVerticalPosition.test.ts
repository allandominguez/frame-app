import { computeKeyboardShift } from '../useNoteVerticalPosition'

describe('computeKeyboardShift', () => {
  it('does not shift when the keyboard is hidden', () => {
    expect(computeKeyboardShift(1000, 0)).toBe(0)
  })

  it('shifts up by exactly the overlap when the keyboard covers the band', () => {
    // Band bottom at 80% of 1000 = 800; visible bottom = 1000 - 400 - 16 = 584
    // overlap = 800 - 584 = 216
    expect(computeKeyboardShift(1000, 400)).toBe(-216)
  })

  it('does not shift when the band already sits above the keyboard', () => {
    expect(computeKeyboardShift(1000, 50)).toBe(0)
  })
})
