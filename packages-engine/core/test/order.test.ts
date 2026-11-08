import type { UserConfig } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { variantMatcher } from '@unocss/rule-utils'
import { describe, expect, it } from 'vitest'

describe('order', () => {
  it('static', async () => {
    const uno = await createGenerator({
      rules: [
        ['foo', { name: 'bar1' }],
        ['foo', { name: 'bar2' }],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  it('dynamic', async () => {
    const uno = await createGenerator({
      rules: [
        [/^foo$/, () => ({ name: 'bar1' })],
        [/^foo$/, () => ({ name: 'bar2' })],
      ],
      presets: [],
    })
    const { css } = await uno.generate('foo', { preflights: false })
    expect(css).toContain('bar2')
  })

  it('variant ordering', async () => {
    const uno = await createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => ({ prefix: `${input.prefix}.light $$ ` })),
        variantMatcher('group', input => ({ prefix: `${input.prefix}.group ` })),
        (v, ctx) => {
          const match = variantMatcher('dark', input => ({ prefix: `${input.prefix}.dark $$ ` })).match(v, ctx)
          if (typeof match === 'object') {
            return {
              ...match,
              order: 1,
            }
          }
        },
      ],
    })
    const code = [
      'light:group:foo-1',
      'group:light:foo-2',
      'dark:group:foo-3',
      'group:dark:foo-4',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  it('variant ordering reversed', async () => {
    const uno = await createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ name: m })],
      ],
      presets: [],
      variants: [
        variantMatcher('light', input => ({ prefix: `.light $$ ${input.prefix}` })),
        variantMatcher('group', input => ({ prefix: `.group ${input.prefix}` })),
        (v, ctx) => {
          const match = variantMatcher('dark', input => ({ prefix: `.dark $$ ${input.prefix}` })).match(v, ctx)
          if (typeof match === 'object') {
            return {
              ...match,
              order: 1,
            }
          }
        },
      ],
    })
    const code = [
      'light:group:foo-1',
      'group:light:foo-2',
      'dark:group:foo-3',
      'group:dark:foo-4',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  it('multiple variant sorting', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:group-hover:group-focus-within:bg-blue-600',
      'group-hover:group-focus-within:dark:bg-red-600',
      'parent-hover:light:parent-focus-within:bg-green-600',
      'parent-hover:light:group-focus-within:bg-yellow-600',
    ].join(' '), { preflights: false })

    expect(css).toMatchSnapshot()
  })

  it('pseudo-elements sorting', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
      ],
    })

    const { css } = await uno.generate([
      'dark:hover:file:marker:bg-red-600',
      'dark:file:marker:hover:bg-red-600',
    ].join(' '), { preflights: false })

    expect(css).toMatchSnapshot()
  })

  it('variant sorting', async () => {
    const uno = await createGenerator({
      rules: [
        [/^foo-.$/, ([m]) => ({ foo: m })],
      ],
      presets: [],
      variants: [
        (input: string) => {
          const m = input.match(/^(\w+):/)
          if (m) {
            return {
              matcher: input.slice(m[0].length),
              selector: s => `${m[1]} ${s}`,
              sort: {
                pre: -1,
                post: 1,
              }[m[1]],
            }
          }
        },
      ],
    })
    const code = [
      'any:foo-1',
      'post:foo-1',
      'pre:foo-1',
      'zzz:foo-1',
    ].join(' ')
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  it('fully controlled rules merged and sorted by body', async () => {
    const uno = await createGenerator({
      rules: [
        ['uno', { '--var': 'uno' }],
        [/^foo-(.+)$/, ([, match]) => {
          return `/* sort: ${match} */ .foo{--foo:0}`
        }],
        [/^bar-(.+)$/, ([, match]) => {
          return [
            `/* sort: ${match} */ .foo{--foo:0}`,
            { '--bar': match },
          ]
        }],
        ['css', { '--var': 'css' }],
      ],
      presets: [],
    })
    const code = 'foo-uno uno css bar-uno bar-css foo-css'
    const { css } = await uno.generate(code, { preflights: false })
    const { css: css2 } = await uno.generate(code, { preflights: false })
    expect(css).toMatchSnapshot()
    expect(css).toEqual(css2)
  })

  it('is independent of token order', async () => {
    const uno = await createGenerator({
      rules: [
        [/^anim-(.+)$/, ([, name]) => [`@keyframes ${name}{}`, { animation: name }]],
      ],
      shortcuts: {
        'anim-beat': 'anim-beat',
      },
      presets: [],
    })
    const tokens = ['anim-spin', 'anim-pulse', 'anim-beat']
    const { css } = await uno.generate(new Set(tokens), { preflights: false })
    const { css: reversed } = await uno.generate(new Set(tokens.toReversed()), { preflights: false })
    expect(reversed).toEqual(css)
  })
})

describe('composed parent priorities', () => {
  const parent = (name: string, order?: number) => variantMatcher(name, input => ({
    parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports (${name}: 1)`,
    ...(order == null ? {} : { parentOrder: order }),
  }))
  const config: UserConfig = {
    presets: [],
    rules: [[/^value-(.+)$/, ([, value]) => ({ '--value': value })]],
    variants: [parent('outer', 10), parent('z', 1), parent('m', 2), parent('a', 3)],
  }
  const values = (css: string) => [...css.matchAll(/--value:([^;]+);/g)].map(m => m[1])

  it('retains intermediate ranks for fresh, cached and partially warmed tokens', async () => {
    const tokens = ['outer:value-base', 'outer:z:value-low', 'outer:m:value-mid', 'outer:a:value-high']
    const uno = await createGenerator(config)
    const { css } = await uno.generate(tokens, { preflights: false })
    expect(values(css)).toEqual(['base', 'low', 'mid', 'high'])
    expect(uno.getParentOrder('@supports (z: 1) $$ @supports (outer: 1)')).toBe(10)
    expect(uno.getParentOrder('@supports (z: 1)')).toBeUndefined()
    expect((await uno.generate(tokens.toReversed(), { preflights: false })).css).toBe(css)
    const fresh = await createGenerator(config)
    expect((await fresh.generate(tokens.toReversed(), { preflights: false })).css).toBe(css)
    const warm = await createGenerator(config)
    await warm.generate([tokens[2], tokens[0]], { preflights: false })
    expect((await warm.generate(tokens.toReversed(), { preflights: false })).css).toBe(css)
  })

  it('keeps final scalar priorities authoritative', async () => {
    const uno = await createGenerator({ ...config, variants: [...config.variants!, parent('first', -10), parent('last', 20)] })
    const { css } = await uno.generate(['last:z:value-last', 'first:a:value-first', 'outer:m:value-middle'], { preflights: false })
    expect(values(css)).toEqual(['first', 'middle', 'last'])
    expect(uno.getParentOrder('@supports (a: 1) $$ @supports (first: 1)')).toBe(-10)
    expect(uno.getParentOrder('@supports (z: 1) $$ @supports (last: 1)')).toBe(20)
  })

  it('retains signed ranks and lexical fallback for zero and unranked parents', async () => {
    const uno = await createGenerator({ ...config, variants: [parent('outer', 10), parent('negative', -1), parent('zero', 0), parent('unranked')] })
    const { css } = await uno.generate(['outer:value-base', 'outer:zero:value-zero', 'outer:negative:value-negative', 'outer:unranked:value-unranked'], { preflights: false })
    expect(values(css)).toEqual(['negative', 'base', 'unranked', 'zero'])
  })

  it('captures tuple parents and ignores discarded ancestry', async () => {
    const uno = await createGenerator({ ...config, variants: [
      parent('outer', 10),
      { match: token => token.startsWith('tuple:') ? { matcher: token.slice(6), parent: ['@supports (z: 1)', 1] } : undefined },
      parent('a', 2),
      variantMatcher('replace', () => ({ parent: '@supports (replaced: 1)', parentOrder: 10 })),
      parent('discarded', 100),
      { match: token => token.startsWith('short:') ? { matcher: token.slice(6), handle: input => ({ ...input, parent: '@supports (short: 1)', parentOrder: 10 }) } : undefined },
    ] })
    const { css } = await uno.generate(['outer:a:value-high', 'outer:tuple:value-low', 'replace:discarded:value-replaced', 'short:value-short'], { preflights: false })
    expect(values(css)).toEqual(['replaced', 'short', 'low', 'high'])
    expect(css).not.toContain('@supports (discarded: 1)')
    expect(uno.getParentOrder('@supports (z: 1)')).toBeUndefined()
  })

  it.each([
    { shortcut: false, low: 1 },
    { shortcut: true, low: 1 },
    { shortcut: false, low: 0 },
    { shortcut: true, low: 0 },
    { shortcut: false, low: -1 },
    { shortcut: true, low: -1 },
  ])('uses lexical order for a conflicting priority bucket (shortcut: $shortcut, low: $low)', async ({ shortcut, low }) => {
    const shared = (name: string, parentOrder: number) => variantMatcher(name, input => ({
      parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports (shared: 1)`,
      parentOrder,
    }))
    const tokens = ['outer:value-base', 'outer:low:value-low', 'outer:m:value-middle', 'outer:high:value-high', 'outer:a:value-a', 'outer:z:value-z']
    const sharedConfig: UserConfig = {
      ...config,
      variants: [...config.variants!, shared('low', low), shared('high', 3), parent('first', -10)],
      shortcuts: shortcut ? [['combined', tokens.join(' '), { layer: 'default' }]] : [],
    }
    const input = shortcut ? ['combined'] : tokens
    const fresh = await createGenerator(sharedConfig)
    const { css } = await fresh.generate([...input, 'first:value-first'], { preflights: false })
    // The whole tied bucket falls back, including groups with unambiguous ranks.
    expect(values(css)).toEqual(['first', 'a', 'middle', 'base', ...(shortcut ? ['low', 'high'] : ['high', 'low']), 'z'])
    for (const warmup of [tokens, tokens.toReversed()]) {
      const warm = await createGenerator(sharedConfig)
      for (const token of warmup)
        await warm.generate(token, { preflights: false })
      expect((await warm.generate([...input.toReversed(), 'first:value-first'], { preflights: false })).css).toBe(css)
      const subset = ['outer:z:value-z', 'outer:a:value-a', 'outer:value-base']
      const clean = await createGenerator(sharedConfig)
      const expected = await clean.generate(subset, { preflights: false })
      expect(values(expected.css)).toEqual(['base', 'z', 'a'])
      expect((await warm.generate(subset, { preflights: false })).css).toBe(expected.css)
    }
  })

  it.each([0, -1, 3])('combines missing ancestry with a known priority of %s without changing cached metadata', async (order) => {
    const sharedConfig: UserConfig = {
      ...config,
      variants: [parent('outer', 10), parent('m', 2), variantMatcher('known', input => ({
        parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports (shared: 1)`,
        parentOrder: order,
      })), variantMatcher('unknown', input => ({
        parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports (shared: 1)`,
      }))],
    }
    const tokens = ['outer:unknown:value-unknown', 'outer:known:value-known', 'outer:m:value-middle']
    const uno = await createGenerator(sharedConfig)
    // Cache the unranked output first, then render it together with known metadata.
    await uno.generate(tokens[0], { preflights: false })
    const { css } = await uno.generate(tokens, { preflights: false })
    expect(values(css)).toEqual(order > 2 ? ['middle', 'known', 'unknown'] : ['known', 'unknown', 'middle'])
    const fresh = await createGenerator(sharedConfig)
    expect((await fresh.generate(tokens.toReversed(), { preflights: false })).css).toBe(css)
    const { css: unknownOnly } = await uno.generate([tokens[0], tokens[2]], { preflights: false })
    expect(values(unknownOnly)).toEqual(['unknown', 'middle'])
  })

  it('clears ancestry on configuration reset', async () => {
    const uno = await createGenerator(config)
    await uno.generate(['outer:z:value-z', 'outer:a:value-a'])
    await uno.setConfig({ ...config, variants: [parent('outer', 10), parent('z'), parent('a')] })
    expect(uno.getParentOrder('@supports (z: 1) $$ @supports (outer: 1)')).toBeUndefined()
    const { css } = await uno.generate(['outer:z:value-z', 'outer:a:value-a'], { preflights: false })
    expect(values(css)).toEqual(['a', 'z'])
  })
})
