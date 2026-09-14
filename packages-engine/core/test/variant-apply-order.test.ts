import type { Rule, UserConfig, Variant, VariantHandler } from '@unocss/core'
import { createGenerator, symbols } from '@unocss/core'
import { variantMatcher } from '@unocss/rule-utils'
import { describe, expect, it } from 'vitest'

const shared: VariantHandler = { matcher: 'foo', selector: () => '.target' }

const rules: Rule[] = [
  ['foo', { name: 'bar' }],
  [/^sup$/, () => ({ name: 'sup', [symbols.parent]: '@supports (x)' })],
  [/^grid$/, () => ({ name: 'grid', [symbols.variants]: [{ parent: '@supports (display: grid)' }] })],
  [/^target$/, () => ({ name: 'target', [symbols.selector]: () => '.target' })],
  // a callback mutating the handlers in place
  [/^mut$/, () => ({ name: 'mut', [symbols.variants]: (variants: VariantHandler[]) => {
    variants.unshift({ selector: () => '.target' })
    return variants
  } })],
  // a callback cloning the handlers
  [/^copied$/, () => ({ name: 'copied', [symbols.variants]: (variants: VariantHandler[]) => variants.map(v => ({ ...v })) })],
  // a callback rebuilding the handlers
  [/^rebuilt$/, () => ({ name: 'rebuilt', [symbols.variants]: (variants: VariantHandler[]) => variants.map(({ matcher, handle, selector, order }) => ({ matcher, handle, selector, order })) })],
  // a parent with an order provided by the rule
  [/^gridp$/, () => ({ name: 'gridp', [symbols.parent]: ['@supports (display: grid)', -1] })],
  // an order provided by the rule equal to the one of the leftmost variant
  [/^gridp2$/, () => ({ name: 'gridp2', [symbols.parent]: ['@supports (display: grid)', 3] })],
  [/^sorted$/, () => ({ name: 'sorted', [symbols.variants]: [{ sort: 2 }] })],
  // a rule injecting the handler object of a variant
  [/^inj$/, () => ({ name: 'inj', [symbols.variants]: [shared] })],
  // a callback replacing the handlers with as many new ones
  [/^replaced$/, () => ({ name: 'replaced', [symbols.variants]: () => [{ selector: () => '.target' }] })],
  // a callback appending a handler
  [/^icon$/, () => ({ name: 'icon', [symbols.variants]: (variants: VariantHandler[]) => [...variants, { selector: (s: string) => `${s} > .icon` }] })],
  // a callback appending a modified copy of a handler
  [/^mixed$/, () => ({ name: 'mixed', [symbols.variants]: (variants: VariantHandler[]) => [...variants, { ...variants[0], handle: undefined, selector: (s: string) => `${s} > .icon` }] })],
  // a layer provided by the rule
  [/^layered$/, () => ({ name: 'layered', [symbols.layer]: 'rule' })],
  // a callback appending a copy of a handler with a property removed
  [/^dropped$/, () => ({ name: 'dropped', [symbols.variants]: (variants: VariantHandler[]) => {
    const { handle: _, ...rest } = variants[0]
    return [...variants, { ...rest, selector: (s: string) => `${s} > .icon` }]
  } })],
]

const variants: Variant[] = [
  variantMatcher('a', input => ({ selector: `${input.selector}:a` })),
  variantMatcher('b', input => ({ selector: `${input.selector}:b` })),
  variantMatcher('first', input => ({ selector: `${input.selector}:first` }), { order: -1 }),
  variantMatcher('pa', input => ({ parent: `${input.parent ? `${input.parent} $$ ` : ''}@media a`, parentOrder: 3 })),
  variantMatcher('pb', input => ({ parent: `${input.parent ? `${input.parent} $$ ` : ''}@media b`, parentOrder: 2 })),
  variantMatcher('pc', input => ({ parent: `${input.parent ? `${input.parent} $$ ` : ''}@media c`, parentOrder: 1 })),
  variantMatcher('pd', input => ({ parent: `${input.parent ? `${input.parent} $$ ` : ''}@media d` })),
  variantMatcher('pe', input => ({ parent: `${input.parent ? `${input.parent} $$ ` : ''}@media e` })),
  variantMatcher('sa', input => ({ selector: `${input.selector}:sa`, sort: 2 })),
  variantMatcher('sb', input => ({ selector: `${input.selector}:sb`, sort: 1 })),
  // a variant leaving the selector alone
  variantMatcher('bo', () => ({})),
  variantMatcher('la', () => ({ layer: 'la' })),
  variantMatcher('lb', () => ({ layer: 'lb' })),
  // handlers that cannot be mutated
  { name: 'sealed', match: (matcher: string) => matcher.startsWith('sealed:') ? Object.seal({ matcher: matcher.slice(7), selector: (s: string) => `${s}:sealed` }) : undefined },
  { name: 'frozen', match: (matcher: string) => matcher.startsWith('frozen:') ? Object.freeze({ matcher: matcher.slice(7), selector: (s: string) => `${s}:frozen` }) : undefined },
  { name: 'sharedv', match: (matcher: string) => matcher === 'sharedv:foo' ? shared : undefined },
]

async function generate(code: string, config: UserConfig = {}) {
  const uno = await createGenerator({
    presets: [],
    rules,
    variants,
    shortcuts: [['sc', 'b:foo'], ['sc2', 'sup'], ['sc3', 'mut'], ['sc4', 'b:copied'], ['sc5', 'b:rebuilt'], ['sc6', 'a:replaced'], ['plain', 'icon'], ['strong', 'bo:icon'], ['sc7', 'b:mixed'], ['sc8', 'b:dropped'], ['alias', 'a:icon']],
    ...config,
  })
  const { css } = await uno.generate(code, { preflights: false })
  return css
}

describe('variantApplyOrder', () => {
  it('defaults to applying the rightmost variant first', async () => {
    expect(await generate('a:b:foo')).toContain('.a\\:b\\:foo:b:a{')
    expect(await generate('b:first:foo')).toContain('.b\\:first\\:foo:first:b{')
    expect(await generate('pa:pb:foo')).toContain('@media b{@media a{')
    expect(await generate('a:sc')).toContain('.a\\:sc:b:a{')
    // the handlers injected by the rules are applied first
    expect(await generate('pa:sup')).toContain('@supports (x){@media a{')
    expect(await generate('pa:grid')).toContain('@supports (display: grid){@media a{')
    expect(await generate('a:target')).toContain('.target:a{')
    expect(await generate('pa:sc2')).toContain('@supports (x){@media a{')
    expect(await generate('a:mut')).toContain('.target:a{')
    expect(await generate('a:sc3')).toContain('.target:a{')
    expect(await generate('a:sc4')).toContain('.a\\:sc4:b:a{')
    expect(await generate('a:sc5')).toContain('.a\\:sc5:b:a{')
    expect(await generate('a:sealed:foo')).toContain('.a\\:sealed\\:foo:sealed:a{')
    expect(await generate('a:frozen:foo')).toContain('.a\\:frozen\\:foo:frozen:a{')
    // the `parentOrder` of the rule is a default, the variants of the utility decide
    const css = await generate('foo pa:gridp')
    expect(css.indexOf('.foo{')).toBeLessThan(css.indexOf('.pa\\:gridp'))
    // the handler object of a variant used by a rule is still injected by the rule
    await generate('sharedv:foo')
    expect(await generate('a:inj')).toContain('.target:a{')
    // handlers replacing or appended to the ones of the utility are injected by the rule
    expect(await generate('b:sc6')).toContain('.target:b{')
    expect(await generate('a:icon')).toContain('.a\\:icon:a > .icon{')
    expect(await generate('a:plain')).toContain('.a\\:plain > .icon:a{')
    expect(await generate('a:strong')).toContain('.a\\:strong > .icon:a{')
    // a modified copy of a variant is injected by the rule
    expect(await generate('a:mixed')).toContain('.a\\:mixed:a > .icon{')
    expect(await generate('a:sc7')).toContain('.a\\:sc7:b > .icon:a{')
    expect(await generate('a:dropped')).toContain('.a\\:dropped:a > .icon{')
    expect(await generate('a:sc8')).toContain('.a\\:sc8:b > .icon:a{')
    // a shortcut without variants keeps the order of the utility
    expect(await generate('alias')).toContain('.alias:a > .icon{')
  })

  it('applies variants in the written order with `left-to-right`', async () => {
    const config: UserConfig = { variantApplyOrder: 'left-to-right' }
    expect(await generate('a:b:foo', config)).toContain('.a\\:b\\:foo:a:b{')
    // `order` on a handler still wins over the position
    expect(await generate('b:first:foo', config)).toContain('.b\\:first\\:foo:first:b{')
    expect(await generate('pa:pb:foo', config)).toContain('@media a{@media b{')
    // variants of a shortcut wrap the variants of its utilities
    expect(await generate('a:sc', config)).toContain('.a\\:sc:a:b{')
    // the handlers injected by the rules are still applied first
    expect(await generate('pa:sup', config)).toContain('@supports (x){@media a{')
    expect(await generate('pa:grid', config)).toContain('@supports (display: grid){@media a{')
    expect(await generate('a:target', config)).toContain('.target:a{')
    expect(await generate('pa:sc2', config)).toContain('@supports (x){@media a{')
    expect(await generate('a:mut', config)).toContain('.target:a{')
    expect(await generate('a:sc3', config)).toContain('.target:a{')
    // cloned or rebuilt handlers keep being the variants of the utility
    expect(await generate('a:sc4', config)).toContain('.a\\:sc4:a:b{')
    expect(await generate('a:sc5', config)).toContain('.a\\:sc5:a:b{')
    // the handlers of the variants are never mutated
    expect(await generate('a:sealed:foo', config)).toContain('.a\\:sealed\\:foo:a:sealed{')
    expect(await generate('a:frozen:foo', config)).toContain('.a\\:frozen\\:foo:a:frozen{')
    // the `parentOrder` of the rule is a default, the variants of the utility decide
    const css = await generate('foo pa:gridp', config)
    expect(css.indexOf('.foo{')).toBeLessThan(css.indexOf('.pa\\:gridp'))
    // the handler object of a variant used by a rule is still injected by the rule
    await generate('sharedv:foo', config)
    expect(await generate('a:inj', config)).toContain('.target:a{')
    // handlers replacing or appended to the ones of the utility are injected by the rule
    expect(await generate('b:sc6', config)).toContain('.target:b{')
    expect(await generate('a:icon', config)).toContain('.a\\:icon:a > .icon{')
    expect(await generate('a:plain', config)).toContain('.a\\:plain > .icon:a{')
    expect(await generate('a:strong', config)).toContain('.a\\:strong > .icon:a{')
    // a modified copy of a variant is injected by the rule
    expect(await generate('a:mixed', config)).toContain('.a\\:mixed:a > .icon{')
    expect(await generate('a:sc7', config)).toContain('.a\\:sc7 > .icon:a:b{')
    expect(await generate('a:dropped', config)).toContain('.a\\:dropped:a > .icon{')
    expect(await generate('a:sc8', config)).toContain('.a\\:sc8 > .icon:a:b{')
    // a shortcut without variants keeps the order of the utility
    expect(await generate('alias', config)).toContain('.alias:a > .icon{')
  })

  it('places the blocks with more conditions after the ones with fewer in `left-to-right`', async () => {
    // `@media d $$ @media e` sorts before `@media e` alphabetically, but has more conditions
    const css = await generate('pe:foo pd:pe:foo', { variantApplyOrder: 'left-to-right' })
    expect(css.indexOf('.pe\\:foo')).toBeLessThan(css.indexOf('.pd\\:pe\\:foo'))
  })

  it('lets the leftmost variant decide the position of the rule and of its block in both orders', async () => {
    for (const config of [{}, { variantApplyOrder: 'left-to-right' as const }]) {
      // `pa:pc:foo` takes the `parentOrder` of `pa` (3), `pc:pa:foo` the one of `pc` (1)
      const blocks = await generate('pb:foo pa:pc:foo pc:pa:foo', config)
      expect(blocks.indexOf('.pc\\:pa\\:foo')).toBeLessThan(blocks.indexOf('.pb\\:foo'))
      expect(blocks.indexOf('.pb\\:foo')).toBeLessThan(blocks.indexOf('.pa\\:pc\\:foo'))

      // also when the rule provides the same value as the leftmost variant
      const equal = await generate('pb:foo pa:pc:gridp2 sb:foo sa:sb:sorted', config)
      expect(equal.indexOf('.pb\\:foo')).toBeLessThan(equal.indexOf('.pa\\:pc\\:gridp2'))
      expect(equal.indexOf('.sb\\:foo{')).toBeLessThan(equal.indexOf('.sa\\:sb\\:sorted'))

      // `sa:sb:foo` takes the `sort` of `sa` (2), `sb:sa:foo` the one of `sb` (1)
      const rules = await generate('sa:sb:foo sb:sa:foo sa:foo', config)
      expect(rules.indexOf('.sb\\:sa\\:foo')).toBeLessThan(rules.indexOf('.sa\\:foo'))
      expect(rules.indexOf('.sb\\:sa\\:foo')).toBeLessThan(rules.indexOf('.sa\\:sb\\:foo'))
    }
  })

  it('lets the leftmost variant decide the layer in both orders', async () => {
    for (const config of [{}, { variantApplyOrder: 'left-to-right' as const }]) {
      const uno = await createGenerator({ presets: [], rules, variants, shortcuts: [['red', 'lb:foo']], ...config })
      const result = await uno.generate('la:lb:foo la:red la:layered layered', { preflights: false })
      expect(result.getLayer('la')).toContain('.la\\:lb\\:foo')
      expect(result.getLayer('la')).toContain('.la\\:red')
      // the layer of the rule is a default
      expect(result.getLayer('la')).toContain('.la\\:layered')
      expect(result.getLayer('rule')).toContain('.layered')
    }
  })

  it('gives the handlers of a utility the same `application`', async () => {
    for (const config of [{}, { variantApplyOrder: 'left-to-right' as const }]) {
      const seen: { raw: string, application: object | undefined }[] = []
      const record = (name: string) => variantMatcher(name, (input, ctx) => {
        seen.push({ raw: ctx.rawSelector, application: input.application })
        return {}
      })
      const uno = await createGenerator({ presets: [], rules, variants: [record('t1'), record('t2')], ...config })
      await uno.generate('t1:t2:foo t1:foo', { preflights: false })

      const stacked = seen.filter(i => i.raw === 't1:t2:foo').map(i => i.application)
      const single = seen.filter(i => i.raw === 't1:foo').map(i => i.application)
      expect(stacked).toHaveLength(2)
      expect(stacked[0]).toBeDefined()
      expect(stacked[0]).toBe(stacked[1])
      expect(single).toHaveLength(1)
      expect(single[0]).not.toBe(stacked[0])
    }
  })

  it('can be set by a preset and overridden by the user config', async () => {
    const preset = { name: 'test', variantApplyOrder: 'left-to-right' as const }

    const fromDefault = await createGenerator({ presets: [] })
    expect(fromDefault.config.variantApplyOrder).toBe('right-to-left')

    const fromPreset = await createGenerator({ presets: [preset] })
    expect(fromPreset.config.variantApplyOrder).toBe('left-to-right')

    const fromUser = await createGenerator({ presets: [preset], variantApplyOrder: 'right-to-left' })
    expect(fromUser.config.variantApplyOrder).toBe('right-to-left')
  })
})
