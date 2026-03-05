import { describe, it, expect } from 'vitest'
import { computeWpm, computeAccuracy } from './typingMetrics'

describe('computeAccuracy', () => {
  it('returns 100 when expected is empty', () => {
    expect(computeAccuracy('', '')).toBe(100)
    expect(computeAccuracy('abc', '')).toBe(100)
  })

  it('returns 100 when typed is empty', () => {
    expect(computeAccuracy('', 'The quick brown')).toBe(100)
  })

  it('computes correct ratio: correct chars / expected length', () => {
    expect(computeAccuracy('The', 'The quick brown')).toBe(
      Math.round((3 / 15) * 1000) / 10
    )
  })

  it('handles full match', () => {
    expect(computeAccuracy('The quick brown', 'The quick brown')).toBe(100)
  })

  it('handles single typo', () => {
    const result = computeAccuracy('The quik brown', 'The quick brown')
    expect(result).toBeGreaterThan(40)
    expect(result).toBeLessThanOrEqual(100)
  })
})

describe('computeWpm', () => {
  it('returns 0 when startTime is null', () => {
    expect(computeWpm('The quick', 'The quick brown', null)).toBe(0)
  })

  it('returns 0 when expected is empty', () => {
    expect(computeWpm('', '', 0, 1)).toBe(0)
  })

  it('returns 0 when elapsed time is 0', () => {
    expect(computeWpm('The quick', 'The quick brown', 0, 0)).toBe(0)
  })

  it('counts only fully correct words', () => {
    const expected = 'The quick brown fox'
    const typed = 'The quik brown fox'
    const wpm = computeWpm(typed, expected, 0, 1 / 60)
    expect(wpm).toBe(180)
  })

  it('ignores words with errors', () => {
    const expected = 'one two three four five'
    const typed = 'one two thrx four five'
    const wpm = computeWpm(typed, expected, 0, 1)
    expect(wpm).toBe(4)
  })

  it('handles partial typing', () => {
    const expected = 'The quick brown'
    const typed = 'The quick'
    const wpm = computeWpm(typed, expected, 0, 0.5)
    expect(wpm).toBe(4)
  })
})
