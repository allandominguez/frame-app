import { computeStreaks } from '../streaks'

describe('computeStreaks', () => {
  it('returns zero for both when no dates are given', () => {
    expect(computeStreaks([], '2026-07-16')).toEqual({ currentStreak: 0, longestStreak: 0 })
  })

  it('returns 1 for both when only today has a photo', () => {
    expect(computeStreaks(['2026-07-16'], '2026-07-16')).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    })
  })

  it('counts consecutive days ending at today', () => {
    const dates = ['2026-07-14', '2026-07-15', '2026-07-16']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 3, longestStreak: 3 })
  })

  it('keeps the current streak alive when the most recent photo was yesterday', () => {
    const dates = ['2026-07-14', '2026-07-15']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 2, longestStreak: 2 })
  })

  it('resets the current streak when the last photo was more than one day ago', () => {
    const dates = ['2026-07-13', '2026-07-14']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 0, longestStreak: 2 })
  })

  it('distinguishes current streak from longest streak across a gap', () => {
    // Longest run was in early July; current streak broken 2 days ago
    const dates = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-13']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 0, longestStreak: 4 })
  })

  it('finds the longest streak even when it is not the most recent run', () => {
    const dates = [
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-07-14',
      '2026-07-15',
      '2026-07-16',
    ]
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 3, longestStreak: 5 })
  })

  it('handles dates provided in unsorted order', () => {
    const dates = ['2026-07-16', '2026-07-14', '2026-07-15']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 3, longestStreak: 3 })
  })

  it('returns current streak of 0 and preserves longestStreak when no recent photos', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03']
    expect(computeStreaks(dates, '2026-07-16')).toEqual({ currentStreak: 0, longestStreak: 3 })
  })
})
