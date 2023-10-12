import { collapseVariantGroup, expandVariantGroup } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('variant-group', () => {
  it('basic', async () => {
    expect(expandVariantGroup('<div></div>')).toEqual('<div></div>')
    expect(expandVariantGroup('<div a b c>a b c</div>')).toEqual('<div a b c>a b c</div>')
    expect(expandVariantGroup('<div a:b:c>a:b:c</div>')).toEqual('<div a:b:c>a:b:c</div>')
    expect(expandVariantGroup('<div hello a:(b c) c:(a:b d)>hello a:(b c) c:(a:b d)</div>')).toEqual('<div hello a:b a:c c:a:b c:d>hello a:(b c) c:(a:b d)</div>')
  })

  it('hoist-important', async () => {
    expect(expandVariantGroup('<div b:c:d:(!a z)>b:c:d:(!a z)</div>')).toEqual('<div !b:c:d:a b:c:d:z>b:c:d:(!a z)</div>')
  })

  it('dash separator', async () => {
    expect(expandVariantGroup('<div a-(b c) c-(a:b d)>a-(b c) c-(a:b d)</div>')).toEqual('<div a-b a-c c-a:b c-d>a-(b c) c-(a:b d)</div>')
  })

  it('tilde symbol', () => {
    expect(expandVariantGroup('<div a-(~ b c)>a-(~ b c)</div>')).toEqual('<div a a-b a-c>a-(~ b c)</div>')
  })

  it('nested', () => {
    expect(expandVariantGroup('<div a-(b c-(d e f))>a-(b c-(d e f))</div>')).toEqual('<div a-b a-c-d a-c-e a-c-f>a-(b c-(d e f))</div>')
  })

  it('spaces', () => {
    expect(expandVariantGroup('<div a-( ~ b c )>a-( ~ b c )</div>')).toEqual('<div a a-b a-c>a-( ~ b c )</div>')
  })

  it('square bracket', async () => {
    expect(expandVariantGroup('<div b:[&:not(c)]:d:(!a z)>b:[&:not(c)]:d:(!a z)</div>')).toEqual('<div !b:[&:not(c)]:d:a b:[&:not(c)]:d:z>b:[&:not(c)]:d:(!a z)</div>')
  })

  it('square bracket case2', async () => {
    expect(expandVariantGroup('<div [&]:(a-b c-d)>[&]:(a-b c-d)</div>')).toEqual('<div [&]:a-b [&]:c-d>[&]:(a-b c-d)</div>')
  })

  it('expand with space', async () => {
    const shortcut = '  a:(b:(c-d d-c)) '
    expect(expandVariantGroup(shortcut)).toEqual('  a:(b:(c-d d-c)) ')
    expect(expandVariantGroup(shortcut.trim()).split(/\s+/g)).toMatchInlineSnapshot(`
      [
        "a:(b:(c-d",
        "d-c))",
      ]
    `)
  })

  it('expand @', async () => {
    expect(expandVariantGroup('<div @a:(c-d d-c)>@a:(c-d d-c)</div>')).toEqual('<div @a:c-d @a:d-c>@a:(c-d d-c)</div>')
    expect(expandVariantGroup('<div !@a:(c-d d-c)>!@a:(c-d d-c)</div>')).toEqual('<div !@a:c-d !@a:d-c>!@a:(c-d d-c)</div>')
  })

  it('include ?', async () => {
    expect(expandVariantGroup('<div a:(b?c d)>a:(b?c d)</div>')).toEqual('<div a:b?c a:d>a:(b?c d)</div>')
  })
})

describe('collapse-variant-group', () => {
  it('basic', async () => {
    expect(collapseVariantGroup('', [])).toEqual('')
    expect(collapseVariantGroup('a:b:c a:c:b', [])).toEqual('a:b:c a:c:b')
    expect(collapseVariantGroup('hello a:b a:c middle c:a:b c:d a:d', ['a:', 'c:'])).toEqual('hello a:(b c d) middle c:(a:b d)')
  })
})
