import { createGenerator, toEscapedSelector as e } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { autocompleteExtractorAttributify, presetAttributify, variantAttributify } from '@unocss/preset-attributify'
import { describe, expect, test } from 'vitest'

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
      test(path, async () => {
        const { css } = await uno.generate(await input(), { preflights: false })
        await expect(css).toMatchFileSnapshot(path.replace('input.html', 'output.css'))
      })
    }
  })

  const fixture1 = (await import('./cases/preset-attributify/case-1/input.html?raw')).default

  test('variant', async () => {
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

  test('prefixedOnly', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true, prefix: 'un-', prefixedOnly: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })

    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  test('autocomplete extractor', async () => {
    const res = await autocompleteExtractorAttributify.extract({
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

  test('with trueToNonValued', async () => {
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

  test('with incomplete element', async () => {
    await uno.generate('<div class="w-fullllllllllllll"')
  }, 20)

  test('merge attribute name and value-only', async () => {
    const { css } = await uno.generate(`
      <div bg="[&:nth-child(3)]:[#123456]"></div>
      <div class="foo" bg="[&.foo]:[&:nth-child(3)]:[#123]"></div>
    `, { preflights: false })
    expect(css).toMatchSnapshot()
  })
})
