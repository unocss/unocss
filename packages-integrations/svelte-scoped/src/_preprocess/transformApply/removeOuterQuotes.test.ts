import { describe, expect, it } from 'vitest'
import { removeOuterQuotes } from './removeOuterQuotes'

describe('removeOuterQuotes', () => {
  it('removes single quotes', () => {
    expect(removeOuterQuotes('\'hello\'')).toBe('hello')
  })

  it('removes double quotes', () => {
    expect(removeOuterQuotes('"hello"')).toBe('hello')
  })

  it('pass through normal', () => {
    expect(removeOuterQuotes('hello')).toBe('hello')
  })

  it('handles null', () => {
    expect(removeOuterQuotes(null as unknown as string)).toBe('')
  })
})
