import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'
import { createAutocomplete, parseAutocomplete } from '@unocss/autocomplete'
import presetAttributify from '@unocss/preset-attributify'

describe('autocomplete', () => {
  const uno = createGenerator({
    presets: [
      presetAttributify(),
      presetUno(),
    ],
    shortcuts: [
      {
        'foo': 'text-red',
        'foo-bar': 'text-red',
      },
      [/^bg-mode-(.+)$/, ([, mode]) => `bg-blend-${mode}`, { autocomplete: ['bg-mode-(color|normal)'] }],
    ],
  })

  const ac = createAutocomplete(uno)

  async function enumerateSuggestions(inputs: string[]) {
    return Object.fromEntries(await Promise.all(inputs.map(async input => [
      input,
      (await ac.suggest(input)).slice(0, 10).join(' '),
    ])))
  }

  const fixture = `
<div bg="blue-500">
  <div border="~ b-
</div>
`

  it('should resolve autocomplete config', () => {
    expect(ac.templates.length).toBeGreaterThan(0)

    ac.templates.forEach((i) => {
      if (typeof i === 'string')
        parseAutocomplete(i, uno.config.theme)
    })
  })

  it('should work', async () => {
    expect((await ac.suggest('m-1'))[0])
      .toMatchInlineSnapshot('"m-1"')

    expect((await ac.suggest('invalid'))[0])
      .not.toBe('invalid')
  })

  it('should provide autocomplete', async () => {
    expect(
      await enumerateSuggestions([
        // sort this list in alphabetical order
        'align-',
        'bg-',
        'bg-gradient-',
        'bg-r',
        'border',
        'border-',
        'border-r',
        'border-spacing-',
        'columns-',
        'divide-',
        'fill-',
        'filter-',
        'fle',
        'font-',
        'font-',
        'keyframes-',
        'leading-',
        'line-clamp-',
        'm-',
        'max-w-',
        'mx-',
        'object-',
        'origin-',
        'outline-',
        'outline-offset-',
        'placeholder-',
        'scroll-',
        'scroll-m-',
        'shadow-',
        'space-',
        'text-r',
        'text-red-',
        'touch-',
        'transition-',
        'v-',
        'w-',
        'z-',
      ]),
    ).toMatchSnapshot()
  })

  it('should provide skip DEFAULT', async () => {
    expect((await ac.suggest('text-red-')))
      .toMatchSnapshot()
  })

  it('should provide variants', async () => {
    expect(await ac.suggest('lt-'))
      .toMatchInlineSnapshot(`
        [
          "lt-2xl:",
          "lt-lg:",
          "lt-md:",
          "lt-sm:",
          "lt-xl:",
        ]
      `)
  })

  it('should accept variants', async () => {
    expect(await ac.suggest('dark:md:m-'))
      .toMatchSnapshot()
  })

  it('should skip single-pass variants', async () => {
    expect(await ac.suggest('dark:dar')).not.toContain('dark:')
    expect(await ac.suggest('active:fir')).toContain('active:first:')
  })

  it('should support extractors', async () => {
    const res = await ac.suggestInFile(fixture, 40)

    expect(res.suggestions.every(i => i[0].startsWith('border-'))).toBeTruthy()
    expect(res.suggestions.some(i => i[1].startsWith('border-'))).toBeFalsy()

    const replacement = res.resolveReplacement(res.suggestions[0][0])
    expect(replacement).toMatchInlineSnapshot(`
      {
        "end": 40,
        "replacement": "b-0",
        "start": 38,
      }
    `)

    expect(fixture.slice(0, replacement.start) + replacement.replacement + fixture.slice(replacement.end))
      .toMatchInlineSnapshot(`
      "
      <div bg=\\"blue-500\\">
        <div border=\\"~ b-0
      </div>
      "
    `)
  })

  it('should escape regex', async () => {
    expect((await ac.suggest('m-['))[0])
      .toMatchInlineSnapshot('undefined')
  })

  it('should suggest static shortcuts', async () => {
    expect(await ac.suggest('foo'))
      .toMatchInlineSnapshot(`
        [
          "foo",
          "foo-bar",
        ]
      `)
  })

  it('should suggest shortcuts with autocomplete key', async () => {
    expect(await ac.suggest('bg-mode-'))
      .toMatchInlineSnapshot(`
        [
          "bg-mode-color",
          "bg-mode-normal",
        ]
      `)
  })
})

describe('use uno cache', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    shortcuts: [
      {
        'foo': 'text-red',
        'foo-bar': 'text-red',
      },
      [/^btn-(red|green)$/, m => `text-${m[1]}`],
    ],
  })

  const ac = createAutocomplete(uno)

  it('use cache', async () => {
    expect(await ac.suggest('btn'))
      .toMatchInlineSnapshot('[]')

    await uno.generate('btn-red btn-green m-100')
    ac.reset()

    expect(await ac.suggest('btn'))
      .toMatchInlineSnapshot(`
        [
          "btn-green",
          "btn-red",
        ]
      `)
    expect(await ac.suggest('m-1'))
      .toMatchInlineSnapshot(`
        [
          "m-1",
          "m-100",
        ]
      `)
  })
})
