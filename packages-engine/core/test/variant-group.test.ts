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

  it('container and children variants inside a group body', () => {
    // These are valid as a group prefix, so they must also be valid inside one.
    expect(expandVariantGroup('hover:(@sm:text-red bg-blue)'))
      .toEqual('hover:@sm:text-red hover:bg-blue')
    expect(expandVariantGroup('hover:(*:text-red bg-blue)'))
      .toEqual('hover:*:text-red hover:bg-blue')
    expect(expandVariantGroup('hover:(**:text-red bg-blue)'))
      .toEqual('hover:**:text-red hover:bg-blue')
  })

  it('group nested inside an arbitrary variant', () => {
    expect(expandVariantGroup('[&>a]:([&>b]:(p-1 p-2))'))
      .toEqual('[&>a]:[&>b]:p-1 [&>a]:[&>b]:p-2')
    expect(expandVariantGroup('[&:nth-child(2)]:([&:nth-child(3)]:(text-red p-1))'))
      .toEqual('[&:nth-child(2)]:[&:nth-child(3)]:text-red [&:nth-child(2)]:[&:nth-child(3)]:p-1')
  })

  it('square bracket case2', async () => {
    expect(expandVariantGroup('[&]:(a-b c-d)')).toEqual('[&]:a-b [&]:c-d')
  })

  it('asterisk with tilde', async () => {
    // `*` is the children variant shorthand (issue: #5099)
    expect(expandVariantGroup('*:(~ a-b)')).toEqual('*:~ *:a-b')
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

  it('include []', async () => {
    expect(expandVariantGroup('a:(b-[c] d)')).toEqual('a:b-[c] a:d')
    expect(expandVariantGroup('a:(b-[c] d-[e])')).toEqual('a:b-[c] a:d-[e]')
    expect(expandVariantGroup('a:(b-[c]=d)')).toEqual('a:(b-[c]=d)')
    expect(expandVariantGroup('a:(b-[c]=d e[f])')).toEqual('a:(b-[c]=d e[f])')
  })
})

describe('collapse-variant-group', () => {
  it('basic', async () => {
    expect(collapseVariantGroup('', [])).toEqual('')
    expect(collapseVariantGroup('a:b:c a:c:b', [])).toEqual('a:b:c a:c:b')
    expect(collapseVariantGroup('hello a:b a:c middle c:a:b c:d a:d', ['a:', 'c:'])).toEqual('hello a:(b c d) middle c:(a:b d)')
  })
})
