import { expandVariantGroup } from '@unocss/core'
import { describe, expect, test } from 'vitest'

describe('variant-group', () => {
  test('basic', async () => {
    expect(expandVariantGroup('')).toEqual('')
    expect(expandVariantGroup('a b c')).toEqual('a b c')
    expect(expandVariantGroup('a:b:c')).toEqual('a:b:c')
    expect(expandVariantGroup('hello a:(b c) c:(a:b d)')).toEqual('hello a:b a:c c:a:b c:d')
  })

  test('hoist-important', async () => {
    expect(expandVariantGroup('b:c:d:(!a z)')).toEqual('!b:c:d:a b:c:d:z')
  })

  test('dash separator', async () => {
    expect(expandVariantGroup('a-(b c) c-(a:b d)')).toEqual('a-b a-c c-a:b c-d')
  })

  test('tilde symbol', () => {
    expect(expandVariantGroup('a-(~ b c)')).toEqual('a a-b a-c')
  })

  test('nested', () => {
    expect(expandVariantGroup('a-(b c-(d e f))')).toEqual('a-b a-c-d a-c-e a-c-f')
  })

  test('spaces', () => {
    expect(expandVariantGroup('a-( ~ b c )')).toEqual('a a-b a-c')
  })

  test('square bracket', async () => {
    expect(expandVariantGroup('b:[&:not(c)]:d:(!a z)')).toEqual('!b:[&:not(c)]:d:a b:[&:not(c)]:d:z')
  })

  test('square bracket case2', async () => {
    expect(expandVariantGroup('[&]:(a-b c-d)')).toEqual('[&]:a-b [&]:c-d')
  })

  test('expand with space', async () => {
    const shortcut = '  a:(b:(c-d d-c)) '
    expect(expandVariantGroup(shortcut)).toEqual('  a:b:c-d a:b:d-c ')
    expect(expandVariantGroup(shortcut.trim()).split(/\s+/g)).toMatchInlineSnapshot(`
      [
        "a:b:c-d",
        "a:b:d-c",
      ]
    `)
  })
})
