import { collapseVariantGroup, expandVariantGroup } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('variant-group', () => {
  it('basic', async () => {
    expect(expandVariantGroup('')).toEqual('')
    expect(expandVariantGroup('a b c')).toEqual('a b c')
    expect(expandVariantGroup('a:b:c')).toEqual('a:b:c')
    expect(expandVariantGroup('hello a:(b c) c:(a:b d)')).toEqual('hello a:b a:c c:a:b c:d')
  })

  it('hoist-important', async () => {
    expect(expandVariantGroup('b:c:d:(!a z)')).toEqual('!b:c:d:a b:c:d:z')
  })

  it('dash separator', async () => {
    expect(expandVariantGroup('a-(b c) c-(a:b d)')).toEqual('a-b a-c c-a:b c-d')
  })

  it('tilde symbol', () => {
    expect(expandVariantGroup('a-(~ b c)')).toEqual('a a-b a-c')
  })

  it('nested', () => {
    expect(expandVariantGroup('a-(b c-(d e f))')).toEqual('a-b a-c-d a-c-e a-c-f')
  })

  it('spaces', () => {
    expect(expandVariantGroup('a-( ~ b c )')).toEqual('a a-b a-c')
  })

  it('square bracket', async () => {
    expect(expandVariantGroup('b:[&:not(c)]:d:(!a z)')).toEqual('!b:[&:not(c)]:d:a b:[&:not(c)]:d:z')
  })

  it('square bracket case2', async () => {
    expect(expandVariantGroup('[&]:(a-b c-d)')).toEqual('[&]:a-b [&]:c-d')
  })

  it('expand with space', async () => {
    const shortcut = '  a:(b:(c-d d-c)) '
    expect(expandVariantGroup(shortcut)).toEqual('  a:b:c-d a:b:d-c ')
    expect(expandVariantGroup(shortcut.trim()).split(/\s+/g)).toMatchInlineSnapshot(`
      [
        "a:b:c-d",
        "a:b:d-c",
      ]
    `)
  })

  it('expand @', async () => {
    expect(expandVariantGroup('@a:(c-d d-c)')).toEqual('@a:c-d @a:d-c')
    expect(expandVariantGroup('!@a:(c-d d-c)')).toEqual('!@a:c-d !@a:d-c')
  })

  it('inlucde ?', async () => {
    expect(expandVariantGroup('a:(b?c d)')).toEqual('a:b?c a:d')
  })
})

describe('collapse-variant-group', () => {
  it('basic', async () => {
    expect(collapseVariantGroup('', [])).toEqual('')
    expect(collapseVariantGroup('a:b:c a:c:b', [])).toEqual('a:b:c a:c:b')
    expect(collapseVariantGroup('hello a:b a:c middle c:a:b c:d a:d', ['a:', 'c:'])).toEqual('hello a:(b c d) middle c:(a:b d)')
  })
})
