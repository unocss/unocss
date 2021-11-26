import { expandVariantGroup } from '@unocss/core'

describe('variant-group', () => {
  test('basic', async() => {
    expect(expandVariantGroup('')).toEqual('')
    expect(expandVariantGroup('a b c')).toEqual('a b c')
    expect(expandVariantGroup('a:b:c')).toEqual('a:b:c')
    expect(expandVariantGroup('hello a:(b c) c:(a:b d)')).toEqual('hello a:b a:c c:a:b c:d')
  })

  test('hoist-important', async() => {
    expect(expandVariantGroup('b:c:d:(!a z)')).toEqual('!b:c:d:a b:c:d:z')
  })

  test('dash seperator', async() => {
    expect(expandVariantGroup('a-(b c) c-(a:b d)')).toEqual('a-b a-c c-a:b c-d')
  })
})
