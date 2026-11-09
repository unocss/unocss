import type { SourceCodeTransformer, UnocssPluginContext, UnoGenerator } from '@unocss/core'
import type { TransformerBuildThemesOptions } from '@unocss/transformer-build-themes'
import { createGenerator, sortRules } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import presetMini from '@unocss/preset-mini'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
import transformerBuildThemes, { variantBuildThemes } from '@unocss/transformer-build-themes'
import transformerCompileClass from '@unocss/transformer-compile-class'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
import { defaultPipelineInclude } from '#integration/defaults'
import { applyTransformers } from '#integration/transformers'

const options: TransformerBuildThemesOptions = {
  facets: {
    client: ['acme', 'globex'],
    edition: ['standard', 'premium'],
  },
  active: { client: 'acme', edition: 'premium' },
}

async function transform(code: string, opts = options, uno?: UnoGenerator) {
  const transformer = transformerBuildThemes(opts)
  const s = new MagicString(code)
  await transformer.transform(s, 'fixture.vue', { uno } as UnocssPluginContext)
  return s.toString()
}

describe('transformer-build-themes', () => {
  describe('options', () => {
    it('requires at least one facet', () => {
      expect(() => transformerBuildThemes({ facets: {}, active: {} })).toThrow('at least one facet')
    })

    it('requires an active value for every facet', () => {
      expect(() => transformerBuildThemes({ facets: { client: ['acme'] }, active: {} }))
        .toThrow('No active value for facet "client"')
    })

    it('rejects an active value that is not listed', () => {
      expect(() => transformerBuildThemes({ facets: { client: ['acme'] }, active: { client: 'initech' } }))
        .toThrow('"initech" is not listed in facet "client"')
    })

    it('rejects an active facet that is not defined', () => {
      expect(() => transformerBuildThemes({ facets: { client: ['acme'] }, active: { client: 'acme', region: 'eu' } }))
        .toThrow('facet "region"')
    })

    it('rejects values listed in two facets', () => {
      expect(() => transformerBuildThemes({ facets: { a: ['acme'], b: ['acme'] }, active: { a: 'acme', b: 'acme' } }))
        .toThrow('listed in both facets "a" and "b"')
    })

    it('rejects values that cannot be a variant', () => {
      expect(() => transformerBuildThemes({ facets: { client: ['ac me'] }, active: { client: 'ac me' } }))
        .toThrow('Invalid value')
    })
  })

  it('filters code that mentions no theme', () => {
    const transformer = transformerBuildThemes(options)
    expect(transformer.codeFilter?.('<div class="hover:c-red">', 'a.vue')).toBe(false)
    expect(transformer.codeFilter?.('<div class="acme:c-red">', 'a.vue')).toBe(true)
    expect(transformer.codeFilter?.('<div class="xacme:c-red">', 'a.vue')).toBe(false)
  })

  it('keeps active and removes inactive classes', async () => {
    const cases = [
      'acme:c-red',
      'globex:c-blue',
      'acme:premium:bg-black',
      'acme:standard:bg-white',
      'premium:acme:bg-black',
      'hover:acme:c-red',
      'md:hover:premium:c-red',
      'hover:globex:c-red',
      '!acme:c-red',
      '!globex:c-red',
      'acme:!c-red',
      'globex:!c-red',
      'acme:c-red!',
      'acme:w-1/2',
      'acme:[&>*]:c-red',
      '[&_.x]:acme:c-red',
      'acme:bg-[url(/a.png)]',
      'acme:grid-cols-[1fr,50%]',
      'acme:-m-2',
    ]
    const results = await Promise.all(cases.map(async c => `${c} => ${await transform(`"${c}"`)}`))
    expect(results).toMatchInlineSnapshot(`
      [
        "acme:c-red => "c-red"",
        "globex:c-blue => """,
        "acme:premium:bg-black => "bg-black"",
        "acme:standard:bg-white => """,
        "premium:acme:bg-black => "bg-black"",
        "hover:acme:c-red => "hover:c-red"",
        "md:hover:premium:c-red => "md:hover:c-red"",
        "hover:globex:c-red => """,
        "!acme:c-red => "!c-red"",
        "!globex:c-red => """,
        "acme:!c-red => "!c-red"",
        "globex:!c-red => """,
        "acme:c-red! => "c-red!"",
        "acme:w-1/2 => "w-1/2"",
        "acme:[&>*]:c-red => "[&>*]:c-red"",
        "[&_.x]:acme:c-red => "[&_.x]:c-red"",
        "acme:bg-[url(/a.png)] => "bg-[url(/a.png)]"",
        "acme:grid-cols-[1fr,50%] => "grid-cols-[1fr,50%]"",
        "acme:-m-2 => "-m-2"",
      ]
    `)
  })

  it('cleans up whitespace around removed classes', async () => {
    expect(await transform('<div class="p-2 globex:c-blue m-2">')).toBe('<div class="p-2 m-2">')
    expect(await transform('<div class="p-2 globex:c-blue">')).toBe('<div class="p-2">')
    expect(await transform('<div class="globex:c-blue p-2">')).toBe('<div class="p-2">')
    expect(await transform('<div class="globex:c-blue">')).toBe('<div class="">')
    expect(await transform('<div class="p-2 globex:a globex:b standard:c">')).toBe('<div class="p-2">')
    expect(await transform('<div class="p-2 acme:c-red globex:c-blue premium:m-1">')).toBe('<div class="p-2 c-red m-1">')
    // Arbitrary values are removed with their class, not left behind.
    expect(await transform('<div class="p-2 globex:lg:rows-[1fr_auto] standard:bg-[url(/a.png)]">')).toBe('<div class="p-2">')
    expect(await transform('<div\n  class="\n    p-2\n    globex:c-blue\n    m-2\n  "\n>'))
      .toBe('<div\n  class="\n    p-2\n    m-2\n  "\n>')
  })

  it('handles variant groups', async () => {
    expect(await transform('"acme:(c-red bg-blue) p-2"')).toBe('"c-red bg-blue p-2"')
    expect(await transform('"p-2 globex:(c-red bg-blue) m-2"')).toBe('"p-2 m-2"')
    expect(await transform('"hover:(acme:c-red globex:c-blue)"')).toBe('"hover:c-red"')
    expect(await transform('"acme:(premium:c-red standard:c-blue)"')).toBe('"c-red"')
    expect(await transform('"!globex:(c-red bg-blue)"')).toBe('""')
    expect(await transform('"p-2 standard:c-red globex:(c-red bg-blue) globex:m-2"')).toBe('"p-2"')
    expect(await transform('"p-2 acme:(c-red bg-blue) globex:(m-2) standard:p-1"')).toBe('"p-2 c-red bg-blue"')
    expect(await transform('"md:(acme:(c-red standard:p-1) globex:c-blue)"')).toBe('"md:c-red"')
    // Groups with the `-` separator.
    expect(await transform('"p-2 globex:bg-(red-500 op-50) m-2"')).toBe('"p-2 m-2"')
    expect(await transform('"acme:bg-(red-500 op-50)"')).toBe('"bg-red-500 bg-op-50"')
    expect(await transform('"globex:hover:text-(sm red)"')).toBe('""')
    // Groups without a theme are left for transformer-variant-group.
    expect(await transform('"hover:(c-red bg-blue) acme:p-2"')).toBe('"hover:(c-red bg-blue) p-2"')
  })

  it('works in @apply and other class contexts', async () => {
    expect(await transform('.btn { @apply p-2 acme:c-red globex:c-blue; }')).toBe('.btn { @apply p-2 c-red; }')
    expect(await transform('.btn { --at-apply: acme:c-red globex:c-blue; }')).toBe('.btn { --at-apply: c-red; }')
    expect(await transform('const cls = [\'acme:c-red\', `globex:c-blue`]')).toBe('const cls = [\'c-red\', ``]')
    expect(await transform('<div className={clsx(\'p-2 acme:c-red\', on && \'globex:c-blue\')} />'))
      .toBe('<div className={clsx(\'p-2 c-red\', on && \'\')} />')
  })

  it('handles attributify attributes', async () => {
    const uno = await createGenerator({ presets: [presetMini(), presetAttributify()], variants: variantBuildThemes(options) })
    const run = (code: string) => transform(code, options, uno)
    // Facet values in the value, like any variant.
    expect(await run('<div text="acme:red-300 globex:blue">')).toBe('<div text="red-300">')
    // Facet values in the name, like `hover:text="red"`.
    expect(await run('<div acme:text="red-300" globex:text="blue">')).toBe('<div text="red-300">')
    expect(await run('<div acme:premium:text="hover:blue-200" globex:standard:text="sm">')).toBe('<div text="hover:blue-200">')
    expect(await run('<div acme:text=\'red\' />')).toBe('<div text=\'red\' />')
    expect(await run('<div acme:text="globex:red p-1">')).toBe('<div text="p-1">')
    // An emptied attribute that attributify reads as a utility is removed: `border=""` is `border`.
    expect(await run('<div border="globex:2" p="2">')).toBe('<div p="2">')
    expect(await run('<div p="2" border="globex:2">')).toBe('<div p="2">')
    expect(await run('<div acme:border="globex:2">')).toBe('<div>')
    // Any other emptied attribute stays, so a component prop keeps its value instead of its default.
    expect(await run('<Form class-submit-button="globex:c-blue">')).toBe('<Form class-submit-button="">')
    expect(await run('<div class="globex:c-blue" id="x">')).toBe('<div class="" id="x">')
    expect(await run('<div :border="\'globex:2\'">')).toBe('<div :border="\'\'">')
    // Without attributify, an empty attribute is not a utility.
    expect(await transform('<div border="globex:2">')).toBe('<div border="">')
    // Outside a tag, only the class is removed, not the assignment.
    expect(await run('const x="globex:c-blue";')).toBe('const x="";')
    // A group in the value of a removed attribute goes with it.
    expect(await run('<div globex:text="acme:(red-300 sm)" p-2>')).toBe('<div p-2>')
  })

  it('removes emptied attributify attributes by the name they end up with', async () => {
    // Facet values in the name are resolved first, even without `variantBuildThemes`.
    const plain = await createGenerator({ presets: [presetMini(), presetAttributify()] })
    expect(await transform('<div acme:border="globex:2" p="2">', options, plain)).toBe('<div p="2">')

    // A prefixed attribute is read the way the attributify extractor reads it.
    const prefixed = await createGenerator({ presets: [presetMini(), presetAttributify({ prefix: 'un-' })] })
    const code = await transform('<div un-border="globex:2" un-p="2">', options, prefixed)
    expect(code).toBe('<div un-p="2">')
    const { css } = await prefixed.generate(code, { preflights: false })
    expect(css).not.toContain('border')

    // With valueless attributes disabled, an empty attribute is not a utility.
    const valued = await createGenerator({ presets: [presetMini(), presetAttributify({ nonValuedAttribute: false })] })
    expect(await transform('<div border="globex:2">', options, valued)).toBe('<div border="">')
  })

  it('removes @apply statements that lose all their classes', async () => {
    expect(await transform('.a { @apply globex:c-blue; color: red; }')).toBe('.a { color: red; }')
    expect(await transform('.a { color: red; @apply globex:c-blue }')).toBe('.a { color: red; }')
    expect(await transform('.a {\n  @apply globex:c-blue standard:p-2;\n  color: red;\n}')).toBe('.a {\n  color: red;\n}')
    expect(await transform('.a { @apply globex:(c-blue p-2); @apply standard:m-1; color: red; }')).toBe('.a { color: red; }')
    expect(await transform('.a { --at-apply: globex:c-blue; color: red; }')).toBe('.a { color: red; }')
    expect(await transform('.a { --uno: "globex:c-blue standard:p-2"; color: red; }')).toBe('.a { color: red; }')
    expect(await transform('.a { --custom-apply: \'globex:c-blue\'; color: red; }')).toBe('.a { color: red; }')
    // Statements that keep a class stay, with only the removed classes gone.
    expect(await transform('.a { @apply p-1 globex:c-blue; }')).toBe('.a { @apply p-1; }')
    expect(await transform('.a { --at-apply: "acme:c-red globex:c-blue"; }')).toBe('.a { --at-apply: "c-red"; }')
    // A custom property inside a class attribute is not a statement.
    expect(await transform('<div class="[--x:1] globex:c-blue">')).toBe('<div class="[--x:1]">')
  })

  it('leaves code that is not a themed class alone', async () => {
    const cases = [
      'const url = "acme://host/path"',
      'const map = { acme: true, globex: false }',
      'switch (x) { case acme: break }',
      'const a = cond ? acme : globex',
      'a { color: red; }',
      'xacme:c-red globexy:c-blue',
      'acme-x:c-red',
      'acme',
      'globex::before',
      'hover:c-red',
    ]
    for (const code of cases)
      expect(await transform(code)).toBe(code)
  })

  it('throws when a facet value collides with a variant', async () => {
    const uno = await createGenerator({ presets: [presetMini()] })
    await expect(transform('"dark:c-red"', { facets: { edition: ['dark', 'premium'] }, active: { edition: 'premium' } }, uno))
      .rejects
      .toThrow('Facet values collide with registered variants: "dark"')
  })

  it('keeps throwing for every file after a failed check', async () => {
    const uno = await createGenerator({ presets: [presetMini()] })
    const transformer = transformerBuildThemes({ facets: { edition: ['dark', 'premium'] }, active: { edition: 'premium' } })
    for (let i = 0; i < 2; i++) {
      await expect(transformer.transform(new MagicString('"dark:c-red"'), 'a.vue', { uno } as UnocssPluginContext))
        .rejects
        .toThrow('Facet values collide with registered variants')
    }
  })

  it('does not count its own helper variants as collisions', async () => {
    const uno = await createGenerator({
      presets: [presetMini()],
      variants: variantBuildThemes(options),
    })
    expect(await transform('"acme:c-red globex:c-blue"', options, uno)).toBe('"c-red"')
  })

  it('variantBuildThemes gives unocss/order the same class order for every active value', async () => {
    const classes = 'globex:flex p-4 acme:flex-col m-2 premium:acme:c-red standard:c-blue hover:acme:underline'
    const [first, second] = await Promise.all([
      { client: 'acme', edition: 'standard' },
      { client: 'globex', edition: 'premium' },
    ].map(async (active) => {
      const uno = await createGenerator({ presets: [presetMini()], variants: variantBuildThemes({ ...options, active }) })
      return sortRules(classes, uno)
    }))
    expect(first).toBe(second)
    // Each facet value counts as a variant, so themed classes follow plain ones.
    expect(first).toMatch(/^m-2 p-4 /)
  })

  it('variantBuildThemes lets tooling generate CSS for any theme', async () => {
    const uno = await createGenerator({
      presets: [presetMini()],
      variants: variantBuildThemes(options),
    })
    const { css } = await uno.generate('acme:c-red globex:hover:c-blue', { preflights: false })
    expect(css).toContain('.acme\\:c-red{')
    expect(css).toContain('.globex\\:hover\\:c-blue:hover{')
  })

  it('emits no CSS and no markup for inactive themes', async () => {
    const uno = await createGenerator({ presets: [presetMini()] })
    const source = '<div class="p-2 acme:c-red globex:c-blue premium:bg-black standard:bg-white">'
    const html = await transform(source, options, uno)
    expect(html).toBe('<div class="p-2 c-red bg-black">')

    const { css } = await uno.generate(html, { preflights: false })
    expect(css).toContain('.c-red{')
    expect(css).toContain('.bg-black{')
    expect(css).not.toContain('blue')
    expect(css).not.toContain('white')
  })

  describe('syntax coverage', () => {
    // [source, output with `acme` + `premium` active]
    const cases: [string, string][] = [
      // Arbitrary variants, including escaped selectors and nested brackets.
      ['[&_a]:acme:(underline break-words)', '[&_a]:underline [&_a]:break-words'],
      ['acme:[&_a]:(underline break-words)', '[&_a]:underline [&_a]:break-words'],
      ['p-2 globex:[&_table,&_th,&_td]:(b mx-a)', 'p-2'],
      [String.raw`p-2 [.\<md\:text-center_&_ol]:<md:globex:mx-a`, 'p-2'],
      [String.raw`[.\<md\:text-right_&_ol]:<md:acme:(mx-a mr-0)`, String.raw`[.\<md\:text-right_&_ol]:<md:mx-a [.\<md\:text-right_&_ol]:<md:mr-0`],
      ['acme:[&:has([data-x])]:c-red', '[&:has([data-x])]:c-red'],
      ['acme:[&:has([data-x=[y]])]:c-red', '[&:has([data-x=[y]])]:c-red'],
      ['data-[state=open]:acme:c-red aria-[acme]:c-red', 'data-[state=open]:c-red aria-[acme]:c-red'],
      // Arbitrary values: quotes, `]` inside quotes, `;` and `=` inside brackets.
      ['p-2 globex:content-[\'a_b\']', 'p-2'],
      ['acme:content-[\'a]b\']', 'content-[\'a]b\']'],
      ['acme:[content:\'acme:x\']', '[content:\'acme:x\']'],
      ['acme:bg-[url(data:image/svg+xml;base64,AAA=)]', 'bg-[url(data:image/svg+xml;base64,AAA=)]'],
      ['globex:bg-[url(data:image/svg+xml;base64,AAA=)] p-2', 'p-2'],
      ['acme:bg-[url(/a.png)] globex:bg-[url(/b.png)]', 'bg-[url(/a.png)]'],
      // CSS variable values, with and without parentheses.
      ['acme:bg-(--accent) globex:bg-(--other) p-2', 'bg-(--accent) p-2'],
      ['acme:c-$accent globex:c-$other', 'c-$accent'],
      ['acme:text-60% acme:p-0.5 acme:c-#fff', 'text-60% p-0.5 c-#fff'],
      // Variant prefixes around the theme.
      [
        '@md:acme:p-2 acme:@container *:acme:c-red **:globex:c-blue ~md:acme:p-1 lt-md:globex:p-2 group-hover/acme:c-red peer-checked:acme:c-red',
        '@md:p-2 @container *:c-red ~md:p-1 group-hover/acme:c-red peer-checked:c-red',
      ],
      ['!hover:acme:c-red !hover:globex:c-blue', '!hover:c-red'],
      ['globex:c-red! acme:c-blue!', 'c-blue!'],
      // compile-class triggers.
      [':uno: acme:c-red globex:c-blue p-2', ':uno: c-red p-2'],
      [':uno-card: globex:c-blue acme:p-2', ':uno-card: p-2'],
    ]

    it.each(cases)('%s', async (source, expected) => {
      expect(await transform(`"${source}"`)).toBe(`"${expected}"`)
    })

    it('handles class strings in code', async () => {
      // eslint-disable-next-line no-template-curly-in-string
      expect(await transform('`p-2 ${on ? \'acme:c-red\' : \'globex:c-blue\'} acme:m-1`'))
        // eslint-disable-next-line no-template-curly-in-string
        .toBe('`p-2 ${on ? \'c-red\' : \'\'} m-1`')
      expect(await transform(':class="{ \'acme:c-red\': a, \'globex:c-blue\': b }"'))
        .toBe(':class="{ \'c-red\': a, \'\': b }"')
      expect(await transform(':class="[\'acme:c-red\', x && \'globex:c-blue\']"'))
        .toBe(':class="[\'c-red\', x && \'\']"')
      expect(await transform('"p-2\r\n  globex:c-blue\r\n  m-2"')).toBe('"p-2\r\n  m-2"')
      expect(await transform('"p-2\tglobex:c-blue\tm-2"')).toBe('"p-2\tm-2"')
      // Markup inside a string, with escaped quotes.
      expect(await transform(String.raw`el.innerHTML = "<div class=\"acme:c-red globex:c-blue\">"`))
        .toBe(String.raw`el.innerHTML = "<div class=\"c-red\">"`)
      expect(await transform(String.raw`'<p class=\'globex:c-blue p-2\'>'`)).toBe(String.raw`'<p class=\'p-2\'>'`)
    })

    it('handles classes completed by an interpolation', async () => {
      /* eslint-disable no-template-curly-in-string */
      expect(await transform('const c = `p-2 globex:text-${size}`')).toBe('const c = `p-2`')
      expect(await transform('const c = `p-2 acme:text-${size}`')).toBe('const c = `p-2 text-${size}`')
      expect(await transform('const c = `globex:${cls} p-2`')).toBe('const c = `p-2`')
      expect(await transform('const c = `globex:text-${a ? `x${b}` : \'}\'}-500 p-2`')).toBe('const c = `p-2`')
      expect(await transform('const c = `globex:bg-${a}-${b} acme:p-${n}`')).toBe('const c = `p-${n}`')
      /* eslint-enable no-template-curly-in-string */
      // Svelte and Astro expressions.
      expect(await transform('<div class="p-2 globex:text-{size} m-1">')).toBe('<div class="p-2 m-1">')
      expect(await transform('<div class="acme:text-{size}">')).toBe('<div class="text-{size}">')
      // A brace that never closes leaves the class alone.
      expect(await transform('"globex:text-{size p-2"')).toBe('"globex:text-{size p-2"')
    })

    it('handles classes in text', async () => {
      expect(await transform('<p>globex:c-blue</p>')).toBe('<p></p>')
      expect(await transform('<td>acme:c-red</td>')).toBe('<td>c-red</td>')
      expect(await transform('<code>p-2 globex:c-blue</code> next')).toBe('<code>p-2</code> next')
    })

    it('handles valueless attributify attributes', async () => {
      expect(await transform('<div acme:c-red globex:c-blue p-2>')).toBe('<div c-red p-2>')
      expect(await transform('<Card acme:c-red/>')).toBe('<Card c-red/>')
      expect(await transform('<Card p-2 globex:c-blue/>')).toBe('<Card p-2/>')
    })

    it('leaves code that only looks like a themed class alone', async () => {
      const untouched = [
        String.raw`.acme\:c-red { color: red }`,
        String.raw`document.querySelector('.globex\:c-blue')`,
        'const x = a?acme:globex',
        'fetch("https://acme:8080/x")',
        '@media (orientation:landscape) {}',
        ':root{--acme:red;--globex:blue}',
        '<p>acme: hello</p>',
        'const time = \'10:30\'',
        'acme:',
        '"[acme:c-red] [&_.globex]:c-red content-[\'globex:x\']"',
        '<button class:globex:c-blue={on}>',
        '"hover:(c-red bg-blue)"',
      ]
      for (const code of untouched)
        expect(await transform(code)).toBe(code)
    })

    it('scans pathological input without quadratic time', async () => {
      const startedAt = performance.now()
      // Brackets that never close, close once at the end, or nest deeply.
      expect(await transform(`${'['.repeat(200_000)} globex:c-blue acme:c-red`)).toBe(`${'['.repeat(200_000)} c-red`)
      expect(await transform(`${'['.repeat(200_000)}] globex:c-blue`)).toBe(`${'['.repeat(200_000)}]`)
      expect(await transform(`${'['.repeat(5_000)}${']'.repeat(5_000)} globex:c-blue`)).toBe(`${'['.repeat(5_000)}${']'.repeat(5_000)}`)
      expect(await transform(`${'a-('.repeat(100_000)} globex:c-blue`)).toBe(`${'a-('.repeat(100_000)}`)
      const large = '<div class="p-2 acme:c-red globex:c-blue premium:(m-1 p-1)"></div>\n'.repeat(20_000)
      expect((await transform(large)).includes('globex')).toBe(false)
      // Statement lookup, which runs once a class is removed: a run of dashes,
      // and many custom properties before a distant `{`.
      expect(await transform(`${'-'.repeat(100_000)} globex:c-blue`)).toBe('-'.repeat(100_000))
      const customProperties = `${'<div class="[--x:1] globex:c-blue"></div>\n'.repeat(20_000)}<script>{}</script>`
      expect((await transform(customProperties)).includes('globex')).toBe(false)
      // Interpolations that never close.
      expect(await transform(`${'globex:a-{'.repeat(50_000)}`)).toBe(`${'globex:a-{'.repeat(50_000)}`)
      // About 0.3 s locally; the quadratic version took over 2.5 s for the first case alone.
      expect(performance.now() - startedAt).toBeLessThan(2_500)
    })
  })

  describe('with other transformers', () => {
    async function pipeline(code: string, id: string, transformers: SourceCodeTransformer[], uno?: UnoGenerator) {
      uno ??= await createGenerator({ presets: [presetMini()], variants: variantBuildThemes(options) })
      uno.config.transformers = transformers
      const ctx = { uno, filter: () => true, tokens: new Set(), invalidate: () => {} } as unknown as UnocssPluginContext
      for (const enforce of ['pre', 'default', 'post'] as const)
        code = (await applyTransformers(ctx, code, id, enforce))?.code ?? code
      return { code, uno }
    }

    it('gives the same result before or after transformer-variant-group', async () => {
      const source = '<div class="p-2 hover:(acme:c-red globex:c-blue) globex:bg-(red-500 op-50) acme:bg-(--accent) md:(premium:p-1 standard:p-2)">'
      const first = await pipeline(source, 'a.html', [transformerBuildThemes(options), transformerVariantGroup()])
      const second = await pipeline(source, 'a.html', [transformerVariantGroup(), transformerBuildThemes(options)])
      expect(first.code).toBe(second.code)
      expect(first.code).toBe('<div class="p-2 hover:c-red bg---accent md:p-1">')
    })

    it('compiles only active classes with transformer-compile-class', async () => {
      const source = [
        'const classes = `:uno:',
        '  [&_a]:(underline break-words)',
        '  [&_a]:acme:c-red [&_a]:globex:c-blue',
        String.raw`  [.\<md\:text-center_&_ol]:<md:globex:mx-a`,
        '  [&_ol]:acme:(font-bold pl-6) [&_ol]:globex:(italic pl-8)',
        '`',
      ].join('\n')
      const { code, uno } = await pipeline(source, 'a.ts', [transformerBuildThemes(options), transformerCompileClass()])
      expect(code).toMatch(/^const classes = `uno-\w+`$/)
      const { css } = await uno.generate(code, { preflights: false })
      expect(css).toContain('color:rgb(248 113 113')
      expect(css).toContain('font-weight:700')
      expect(css).not.toContain('96 165 250')
      expect(css).not.toContain('italic')
      expect(css).not.toContain('margin-left:auto')
    })

    it('applies only active classes with transformer-directives', async () => {
      const source = '.btn { @apply p-2 acme:c-red globex:c-blue; --at-apply: premium:m-1 standard:m-2; }'
      const { code } = await pipeline(source, 'a.css', [transformerBuildThemes(options), transformerDirectives()])
      expect(code).toContain('color:rgb(248 113 113')
      expect(code).toContain('margin:0.25rem')
      expect(code).not.toContain('96 165 250')
      expect(code).not.toContain('margin:0.5rem')
    })

    it.each([
      ['groups', '.a { @apply acme:(c-red p-1) globex:(c-blue p-2); }', '.a { padding:0.25rem;--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity)); }'],
      ['variants around the value', '.a { @apply hover:acme:c-red hover:globex:c-blue; }', '.a:hover{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}'],
      ['arbitrary variants', '.a { @apply acme:[&>*]:c-red globex:[&>*]:c-blue; }', '.a>*{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}'],
      ['important', '.a { @apply !acme:c-red !globex:c-blue; }', '.a { --un-text-opacity:1 !important;color:rgb(248 113 113 / var(--un-text-opacity)) !important; }'],
      ['quoted --at-apply', '.a { --at-apply: "acme:c-red globex:c-blue"; }', '.a { --un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity)); }'],
      ['an emptied @apply', '.a { @apply globex:c-blue; color: red; }', '.a { color: red; }'],
      ['an emptied @apply in a nested rule', '.a { .b { @apply globex:(c-blue p-2); } color: red; }', '.a { .b { } color: red; }'],
      ['an emptied --at-apply', '.a { --at-apply: "globex:c-blue"; color: red; }', '.a { color: red; }'],
    ])('expands @apply with transformer-directives: %s', async (_, source, expected) => {
      const { code } = await pipeline(source, 'a.css', [transformerVariantGroup(), transformerBuildThemes(options), transformerDirectives()])
      expect(code).toBe(expected)
    })

    it('rewrites @apply in stylesheets outside pipeline.include', async () => {
      const uno = await createGenerator({ presets: [presetMini()], variants: variantBuildThemes(options) })
      uno.config.transformers = [transformerBuildThemes(options), transformerDirectives()]
      const filter = (_code: string, id: string) => defaultPipelineInclude.some(re => re.test(id))
      const ctx = { uno, filter, tokens: new Set(), invalidate: () => {} } as unknown as UnocssPluginContext
      const run = async (code: string, id: string) => {
        for (const enforce of ['pre', 'default', 'post'] as const)
          code = (await applyTransformers(ctx, code, id, enforce))?.code ?? code
        return code
      }
      const css = await run('.btn { @apply p-2 acme:c-red globex:c-blue; }', 'styles.css')
      expect(css).toContain('color:rgb(248 113 113')
      expect(css).not.toContain('96 165 250')
      // Other files still follow the pipeline filter.
      expect(await run('"globex:c-blue"', 'node_modules/x/a.js')).toBe('"globex:c-blue"')
      expect(await run('"globex:c-blue p-2"', 'a.vue')).toBe('"p-2"')
    })

    it('resolves valueless attributes before transformer-attributify-jsx', async () => {
      const uno = await createGenerator({ presets: [presetMini(), presetAttributify()], variants: variantBuildThemes(options) })
      const source = 'export default () => <div acme:text-red globex:text-blue p-2 />'
      const { code } = await pipeline(source, 'a.tsx', [transformerBuildThemes(options), transformerAttributifyJsx()], uno)
      expect(code).toBe('export default () => <div text-red="" p-2="" />')
    })

    it('generates only active attributify utilities', async () => {
      const uno = await createGenerator({ presets: [presetMini(), presetAttributify()], variants: variantBuildThemes(options) })
      const source = '<div p="2" border="globex:2" acme:text="red-300" globex:text="blue" bg="acme:premium:white globex:black">'
      const { code } = await pipeline(source, 'a.vue', [transformerBuildThemes(options)], uno)
      expect(code).toBe('<div p="2" text="red-300" bg="white">')
      const { css } = await uno.generate(code, { preflights: false })
      expect(css).toContain('[text~="red-300"]')
      expect(css).toContain('[bg~="white"]')
      expect(css).not.toContain('border')
      expect(css).not.toContain('blue')
      expect(css).not.toContain('black')
    })

    it('leaves @unocss-skip regions alone', async () => {
      const source = '<p class="globex:c-blue acme:c-red"></p><!-- @unocss-skip-start --><p class="globex:c-blue"></p><!-- @unocss-skip-end -->'
      const { code } = await pipeline(source, 'a.html', [transformerBuildThemes(options)])
      expect(code).toBe('<p class="c-red"></p><!-- @unocss-skip-start --><p class="globex:c-blue"></p><!-- @unocss-skip-end -->')
    })

    it.each([
      ['transformer-compile-class', transformerCompileClass()],
      ['transformer-attributify-jsx', transformerAttributifyJsx()],
      ['transformer-directives with enforce: pre', transformerDirectives({ enforce: 'pre' })],
    ])('throws when %s runs first', async (_, other) => {
      await expect(pipeline('"acme:c-red"', 'a.tsx', [other, transformerBuildThemes(options)]))
        .rejects
        .toThrow('must come after transformerBuildThemes()')
    })
  })
})
