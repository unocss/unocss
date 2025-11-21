import { describe, expect, it } from 'vitest'
import { ResolvedIdRegexes } from '../src/constants'

describe('resolvedIdRegexes', () => {
  it('should use default prefix when no prefix is set', () => {
    const regexes = ResolvedIdRegexes.get()

    expect(regexes.RESOLVED_ID_RE.test('/__uno.css')).toBe(true)
    expect(regexes.RESOLVED_ID_RE.test('/__uno_layer.css')).toBe(true)
    expect(regexes.RESOLVED_ID_RE.test('/custom.css')).toBe(false)
    expect(ResolvedIdRegexes.currentPrefix()).toBe('__uno')
  })

  it('should use set prefix when prefix is set', () => {
    ResolvedIdRegexes.set('__custom')
    const regexes = ResolvedIdRegexes.get()

    expect(regexes.RESOLVED_ID_RE.test('/__custom.css')).toBe(true)
    expect(regexes.RESOLVED_ID_RE.test('/__custom_layer.css')).toBe(true)
    expect(regexes.RESOLVED_ID_RE.test('/__uno.css')).toBe(false)
    expect(ResolvedIdRegexes.currentPrefix()).toBe('__custom')
  })
})
