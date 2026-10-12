import { describe, expect, it } from 'vitest'
import {
  extractUnquotedClasses,
  skipExpression,
  skipQuoted,
  skipRegex,
} from '../src/extract-unquoted-classes'

describe('skipQuoted', () => {
  it('skips a quoted value', () => {
    expect(skipQuoted('"plain"tail', 0)).toBe(7)
  })

  it('skips a nested expression', () => {
    expect(skipQuoted('"before{a > b}after"tail', 0)).toBe(20)
  })

  it('skips an escaped quote', () => {
    expect(skipQuoted(String.raw`"a\"b"tail`, 0, true)).toBe(6)
  })

  it('skips to the end of an unterminated value', () => {
    expect(skipQuoted('"unterminated', 0)).toBe(13)
  })
})

describe('skipExpression', () => {
  it('skips an expression', () => {
    expect(skipExpression('{value}tail', 0)).toBe(7)
  })

  it('skips nested objects and braces in strings', () => {
    expect(skipExpression('{{ nested: { value: "}" } }}tail', 0)).toBe(28)
  })

  it('skips escaped braces in a regular expression', () => {
    expect(skipExpression(String.raw`{() => { return /\{/.test(id) }}tail`, 0)).toBe(32)
  })

  it('skips to the end of an unterminated expression', () => {
    expect(skipExpression('{value', 0)).toBe(6)
  })
})

describe('skipRegex', () => {
  it('skips a regular expression', () => {
    expect(skipRegex('/foo/tail', 0)).toBe(5)
  })

  it('skips escaped slashes and character classes', () => {
    expect(skipRegex(String.raw`/a\/[b]/tail`, 0)).toBe(8)
  })

  it('skips to the end of an unterminated regular expression', () => {
    expect(skipRegex('/unterminated', 0)).toBe(13)
  })
})

describe('extractUnquotedClasses', () => {
  it('extracts class values in source order', () => {
    expect(extractUnquotedClasses('<div class=text-red-500><span class=font-bold/>'))
      .toEqual(['text-red-500', 'font-bold'])
  })

  it('skips nested expressions before a class attribute', () => {
    expect(extractUnquotedClasses('<Component id={{ value: ">" }} class=hover:bg-red-500 />'))
      .toEqual(['hover:bg-red-500'])
  })

  it('ignores quoted, interpolated, and unterminated class values', () => {
    expect(extractUnquotedClasses('<div class="quoted">')).toEqual([])
    expect(extractUnquotedClasses('<div class=foo{bar}>')).toEqual([])
    expect(extractUnquotedClasses('<div class={value')).toEqual([])
  })
})
