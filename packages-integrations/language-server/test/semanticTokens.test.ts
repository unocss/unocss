import { describe, expect, it } from 'vitest'
import { buildSemanticTokensData } from '../src/capabilities/semanticTokens'

// Data is delta-encoded in groups of 5:
//   [deltaLine, deltaStartChar, length, tokenType, tokenModifiers]
function range(line: number, start: number, end: number, endLine = line) {
  return { start: { line, character: start }, end: { line: endLine, character: end } }
}

describe('buildSemanticTokensData', () => {
  it('encodes single-line tokens on the same line as char deltas', () => {
    // second token's deltaStart is relative to the previous start (12 - 5 = 7)
    expect(buildSemanticTokensData([range(0, 5, 10), range(0, 12, 15)]))
      .toEqual([0, 5, 5, 0, 0, 0, 7, 3, 0, 0])
  })

  it('sorts unordered ranges before encoding', () => {
    // a new line resets to an absolute start char
    expect(buildSemanticTokensData([range(1, 0, 3), range(0, 2, 5)]))
      .toEqual([0, 2, 3, 0, 0, 1, 0, 3, 0, 0])
  })

  it('drops tokens that overlap the previous one (variant matches)', () => {
    // range(0, 8, 12) starts inside range(0, 5, 10) → dropped
    expect(buildSemanticTokensData([range(0, 5, 10), range(0, 8, 12)]))
      .toEqual([0, 5, 5, 0, 0])
  })

  it('keeps adjacent, non-overlapping tokens', () => {
    // range(0, 10, 14) starts exactly where the previous ends → kept
    expect(buildSemanticTokensData([range(0, 5, 10), range(0, 10, 14)]))
      .toEqual([0, 5, 5, 0, 0, 0, 5, 4, 0, 0])
  })

  it('drops multi-line and empty ranges', () => {
    // line-spanning and zero-width ranges are filtered out, leaving only range(2, 4, 7)
    expect(buildSemanticTokensData([range(0, 5, 2, 1), range(2, 3, 3), range(2, 4, 7)]))
      .toEqual([2, 4, 3, 0, 0])
  })

  it('returns an empty array for no ranges', () => {
    expect(buildSemanticTokensData([])).toEqual([])
  })
})
