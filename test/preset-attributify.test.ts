import { createGenerator, toEscapedSelector as e } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { autocompleteExtractorAttributify, presetAttributify, variantAttributify } from '@unocss/preset-attributify'
import { describe, expect, it } from 'vitest'

describe('attributify', async () => {
  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
      presetUno({ attributifyPseudo: true }),
    ],
    rules: [
      [/^custom-(\d+)$/, ([_, value], { rawSelector }) => {
        // return a string instead of an object
        const selector = e(rawSelector)
        return `
  ${selector} {
    font-size: ${value}px;
  }
  /* you can have multiple rules */
  ${selector}::after {
    content: 'after';
  }
  .foo > ${selector} {
    color: red;
  }
  /* or media queries */
  @media (min-width: 680px) {
    ${selector} {
      font-size: 16px;
    }
  }
  `
      }],
    ],
  })

  describe('cases', () => {
    const cases = import.meta.glob('./cases/preset-attributify/*/input.html', { as: 'raw' })
    for (const [path, input] of Object.entries(cases)) {
      it(path, async () => {
        const { css } = await uno.generate(await input(), { preflights: false })
        await expect(css).toMatchFileSnapshot(path.replace('input.html', 'output.css'))
      })
    }
  })

  const fixture1 = (await import('./cases/preset-attributify/case-1/input.html?raw')).default

  it('variant', async () => {
    const variant = variantAttributify({
      prefix: 'un-',
      prefixedOnly: false,
      strict: true,
    })

    const promises = Array.from(await uno.applyExtractors(fixture1) || [])
      .map(async (i) => {
        const r = await variant.match(i, {} as any)
        return typeof r === 'string' ? r : r ? r.matcher : r
      })

    expect(await Promise.all(promises))
      .toMatchSnapshot()
  })

  it('prefixedOnly', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true, prefix: 'un-', prefixedOnly: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })

    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  describe('autocomplete extractor', async () => {
    it('without prefix', async () => {
      const res = await autocompleteExtractorAttributify().extract({
        content: fixture1,
        cursor: 187,
      })

      expect(res).not.toBeNull()

      expect(res!.extracted).toMatchInlineSnapshot('"bg-blue-400"')
      expect(res!.transformSuggestions!([`${res!.extracted}1`, `${res!.extracted}2`]))
        .toMatchInlineSnapshot(`
          [
            "blue-4001",
            "blue-4002",
          ]
        `)

      const reversed = res!.resolveReplacement(`${res!.extracted}1`)
      expect(reversed).toMatchInlineSnapshot(`
        {
          "end": 192,
          "replacement": "blue-4001",
          "start": 184,
        }
      `)

      expect(fixture1.slice(reversed.start, reversed.end))
        .toMatchInlineSnapshot('"blue-400"')
    })

    it('with prefix', async () => {
      const fixtureWithPrefix = `
<div un-text-cent>
  <div un-text="cent
</div>
      `
      const res1 = await autocompleteExtractorAttributify({ prefix: 'un-' }).extract({
        content: fixtureWithPrefix,
        cursor: 18,
      })

      expect(res1).not.toBeNull()

      expect(res1!.extracted).toMatchInlineSnapshot('"text-cent"')

      const reversed1 = res1!.resolveReplacement(`${res1!.extracted}1`)
      expect(reversed1).toMatchInlineSnapshot(`
        {
          "end": 18,
          "replacement": "text-cent1",
          "start": 9,
        }
      `)

      expect(fixtureWithPrefix.slice(reversed1.start, reversed1.end))
        .toMatchInlineSnapshot('"text-cent"')

      const res2 = await autocompleteExtractorAttributify({ prefix: 'un-' }).extract({
        content: fixtureWithPrefix,
        cursor: 40,
      })

      expect(res2).not.toBeNull()

      expect(res2!.extracted).toMatchInlineSnapshot('"text-cent"')
      expect(res2!.transformSuggestions!([`${res2!.extracted}1`, `${res2!.extracted}2`]))
        .toMatchInlineSnapshot(`
          [
            "cent1",
            "cent2",
          ]
        `)

      const reversed2 = res2!.resolveReplacement(`${res2!.extracted}1`)
      expect(reversed2).toMatchInlineSnapshot(`
        {
          "end": 40,
          "replacement": "cent1",
          "start": 36,
        }
      `)

      expect(fixtureWithPrefix.slice(reversed2.start, reversed2.end))
        .toMatchInlineSnapshot('"cent"')
    })

    it('only prefix', async () => {
      const fixtureOnlyPrefix = `
<div text-cent>
  <div text="cent
</div>
      `
      const res1 = await autocompleteExtractorAttributify({ prefix: 'un-', prefixedOnly: true }).extract({
        content: fixtureOnlyPrefix,
        cursor: 15,
      })

      expect(res1).toBeNull()

      const res2 = await autocompleteExtractorAttributify({ prefix: 'un-', prefixedOnly: true }).extract({
        content: fixtureOnlyPrefix,
        cursor: 34,
      })

      expect(res2).toBeNull()
    })
  })

  it('with trueToNonValued', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ trueToNonValued: true }),
        presetUno(),
      ],
    })
    const { css } = await uno.generate(`
      <div flex="true"></div>
      <div grid="~ cols-2"></div>
    `, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  it('with incomplete element', async () => {
    await uno.generate('<div class="w-fullllllllllllll"')
  }, 20)

  it('merge attribute name and value-only', async () => {
    const { css } = await uno.generate(`
      <div bg="[&:nth-child(3)]:[#123456]"></div>
      <div class="foo" bg="[&.foo]:[&:nth-child(3)]:[#123]"></div>
    `, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  it('support inline arrow functions', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify(),
        presetUno(),
      ],
    })
    const { css: css1 } = await uno.generate('<div v-for="(v, i) of [0].map(() => 1)" h-1px />', { preflights: false })
    expect(css1).toMatchSnapshot()

    const { css: css2 } = await uno.generate(`
      <div
        h-1px
        v-for="(
          v, i
        ) of [0].map(() => 1)"
      />
    `, { preflights: false })
    expect(css2).toMatchSnapshot()

    const { css: css3 } = await uno.generate(`
      <div v-for="(
          v, i
        ) of [0].map(() => 1)"
        h-1px
      />
    `, { preflights: false })
    expect(css3).toMatchSnapshot()
  })
})
