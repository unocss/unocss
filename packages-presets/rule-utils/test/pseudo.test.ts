import type { Rule, VariantHandlerContext } from '@unocss/core'
import type { PseudoVariantUtilities } from '../src/pseudo'
import { createGenerator } from '@unocss/core'
import { h } from '@unocss/preset-wind4/utils'
import { expect, it } from 'vitest'
import {
  createPartClasses,
  createPseudoClassesAndElements,
  createPseudoClassFunctions,
  createTaggedPseudoClasses,
} from '../src/pseudo'
import { variantGetBracket, variantMatcher, variantPrefix } from '../src/variants'

// Create utilities similar to what presets use
const utils: PseudoVariantUtilities = {
  getBracket: (str: string, open: string, close: string) => {
    // Simple bracket parser for tests
    const startIndex = str.indexOf(open)
    if (startIndex === -1)
      return undefined
    const endIndex = str.indexOf(close, startIndex + 1)
    if (endIndex === -1)
      return undefined
    return [str.slice(startIndex + 1, endIndex), str.slice(endIndex + 1)]
  },
  h: h as unknown as PseudoVariantUtilities['h'],
  variantGetBracket,
}

// https://github.com/unocss/unocss/issues/2713
it('pseudo variant order', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const css = await uno.generate([
    'foo-1',
    'hover:foo-2',
    'focus:foo-3',
    'disabled:foo-4',
  ]).then(r => r.css)

  expect(css.indexOf('foo-1')).toBeLessThan(css.indexOf('foo-2'))
  expect(css.indexOf('foo-2')).toBeLessThan(css.indexOf('foo-3'))
  expect(css.indexOf('foo-3')).toBeLessThan(css.indexOf('foo-4'))
  expect(css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .foo-1{text:foo-1;}
      .hover\\:foo-2:hover{text:foo-2;}
      .focus\\:foo-3:focus{text:foo-3;}
      .disabled\\:foo-4:disabled{text:foo-4;}"
    `)

  const css2 = await uno.generate([
    'foo-1',
    'hover:foo-1',
    'focus:foo-1',
    'disabled:foo-1',
  ]).then(r => r.css)

  expect(css2)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .foo-1{text:foo-1;}
      .hover\\:foo-1:hover{text:foo-1;}
      .focus\\:foo-1:focus{text:foo-1;}
      .disabled\\:foo-1:disabled{text:foo-1;}"
    `)
})

// https://github.com/unocss/unocss/issues/2733
it('focus-visible variant', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'focus-visible:foo-1',
    'focus:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "focus-visible:foo-1",
        "focus:foo-2",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .focus\\:foo-2:focus{text:foo-2;}
      .focus-visible\\:foo-1:focus-visible{text:foo-1;}"
    `)
})

it('nested named groups containing hyphens', async () => {
  const uno = await createGenerator({
    variants: [
      ...createTaggedPseudoClasses({}, utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'group-hover/named:foo-1',
    'group-hover/named-group:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "group-hover/named:foo-1",
        "group-hover/named-group:foo-2",
      }
    `)

  expect(result.css).toMatchInlineSnapshot(`
    "/* layer: default */
    .group\\/named-group:hover .group-hover\\/named-group\\:foo-2{text:foo-2;}
    .group\\/named:hover .group-hover\\/named\\:foo-1{text:foo-1;}"
  `)
})

it('pseudo class functions', async () => {
  const uno = await createGenerator({
    variants: [
      createPseudoClassFunctions(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'not-hover:foo-1',
    'is-hover:foo-2',
    'where-focus:foo-3',
    'has-hover:foo-4',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "not-hover:foo-1",
        "is-hover:foo-2",
        "where-focus:foo-3",
        "has-hover:foo-4",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .has-hover\\:foo-4:has(:hover){text:foo-4;}
      .is-hover\\:foo-2:is(:hover){text:foo-2;}
      .not-hover\\:foo-1:not(:hover){text:foo-1;}
      .where-focus\\:foo-3:where(:focus){text:foo-3;}"
    `)
})

it('pseudo elements', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ content: `"foo-${a}"` })],
    ],
  })

  const result = await uno.generate([
    'before:foo-1',
    'after:foo-2',
    'placeholder:foo-3',
    'first-letter:foo-4',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "before:foo-1",
        "after:foo-2",
        "placeholder:foo-3",
        "first-letter:foo-4",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .first-letter\\:foo-4::first-letter{content:"foo-4";}
      .placeholder\\:foo-3::placeholder{content:"foo-3";}
      .before\\:foo-1::before{content:"foo-1";}
      .after\\:foo-2::after{content:"foo-2";}"
    `)
})

it('part classes', async () => {
  const uno = await createGenerator({
    variants: [
      createPartClasses(),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ color: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'part-[button]:foo-1',
    'part-[slider-thumb]:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "part-[button]:foo-1",
        "part-[slider-thumb]:foo-2",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .part-\\[button\\]\\:foo-1::part(button){color:foo-1;}
      .part-\\[slider-thumb\\]\\:foo-2::part(slider-thumb){color:foo-2;}"
    `)
})

it('part classes after another variant', async () => {
  const uno = await createGenerator({
    variants: [
      createPartClasses(),
      variantMatcher('dark', input => ({ prefix: `.dark $$ ${input.prefix}` })),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ color: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'dark:part-[button]:foo-1',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "dark:part-[button]:foo-1",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .dark .dark\\:part-\\[button\\]\\:foo-1::part(button){color:foo-1;}"
    `)
})

it('tagged pseudo classes with attributify', async () => {
  const uno = await createGenerator({
    variants: [
      ...createTaggedPseudoClasses({ attributifyPseudo: true }, utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'group-hover:foo-1',
    'peer-focus:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "group-hover:foo-1",
        "peer-focus:foo-2",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      [group=""]:hover .group-hover\\:foo-1{text:foo-1;}
      [peer=""]:focus~.peer-focus\\:foo-2{text:foo-2;}"
    `)
})

it('tagged pseudo classes with prefix', async () => {
  const uno = await createGenerator({
    variants: [
      ...createTaggedPseudoClasses({ prefix: 'tw-' }, utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'group-hover:foo-1',
    'peer-focus:foo-2',
    'parent-hover:foo-3',
    'previous-focus:foo-4',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "group-hover:foo-1",
        "peer-focus:foo-2",
        "parent-hover:foo-3",
        "previous-focus:foo-4",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .tw-group:hover .group-hover\\:foo-1{text:foo-1;}
      .tw-parent:hover>.parent-hover\\:foo-3{text:foo-3;}
      .tw-peer:focus~.peer-focus\\:foo-2{text:foo-2;}
      .tw-previous:focus+.previous-focus\\:foo-4{text:foo-4;}"
    `)
})

it('nth-child with bracket notation', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ order: a })],
    ],
  })

  const result = await uno.generate(
    [
      'nth{}-[2n+1]:foo-1',
      'nth{}-[2n+1_of_li.foo]:foo-1',
      'nth{}-[odd]:foo-2',
      'nth{}-[3]:foo-3',
    ].flatMap(template => ['', '-last', '-last-of-type', '-of-type']
      .map(suffix => template.replace('{}', suffix))),
  )

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "nth-[2n+1]:foo-1",
        "nth-last-[2n+1]:foo-1",
        "nth-last-of-type-[2n+1]:foo-1",
        "nth-of-type-[2n+1]:foo-1",
        "nth-[2n+1_of_li.foo]:foo-1",
        "nth-last-[2n+1_of_li.foo]:foo-1",
        "nth-last-of-type-[2n+1_of_li.foo]:foo-1",
        "nth-of-type-[2n+1_of_li.foo]:foo-1",
        "nth-[odd]:foo-2",
        "nth-last-[odd]:foo-2",
        "nth-last-of-type-[odd]:foo-2",
        "nth-of-type-[odd]:foo-2",
        "nth-[3]:foo-3",
        "nth-last-[3]:foo-3",
        "nth-last-of-type-[3]:foo-3",
        "nth-of-type-[3]:foo-3",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .nth-\\[2n\\+1_of_li\\.foo\\]\\:foo-1:nth-child(2n+1 of li.foo){order:1;}
      .nth-\\[2n\\+1\\]\\:foo-1:nth-child(2n+1){order:1;}
      .nth-\\[3\\]\\:foo-3:nth-child(3){order:3;}
      .nth-\\[odd\\]\\:foo-2:nth-child(odd){order:2;}
      .nth-last-\\[2n\\+1_of_li\\.foo\\]\\:foo-1:nth-last-child(2n+1 of li.foo){order:1;}
      .nth-last-\\[2n\\+1\\]\\:foo-1:nth-last-child(2n+1){order:1;}
      .nth-last-\\[3\\]\\:foo-3:nth-last-child(3){order:3;}
      .nth-last-\\[odd\\]\\:foo-2:nth-last-child(odd){order:2;}
      .nth-last-of-type-\\[2n\\+1_of_li\\.foo\\]\\:foo-1:nth-last-of-type(2n+1 of li.foo){order:1;}
      .nth-last-of-type-\\[2n\\+1\\]\\:foo-1:nth-last-of-type(2n+1){order:1;}
      .nth-last-of-type-\\[3\\]\\:foo-3:nth-last-of-type(3){order:3;}
      .nth-last-of-type-\\[odd\\]\\:foo-2:nth-last-of-type(odd){order:2;}
      .nth-of-type-\\[2n\\+1_of_li\\.foo\\]\\:foo-1:nth-of-type(2n+1 of li.foo){order:1;}
      .nth-of-type-\\[2n\\+1\\]\\:foo-1:nth-of-type(2n+1){order:1;}
      .nth-of-type-\\[3\\]\\:foo-3:nth-of-type(3){order:3;}
      .nth-of-type-\\[odd\\]\\:foo-2:nth-of-type(odd){order:2;}"
    `)
})

it('nth-child simple cases', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^bg-(\w+)$/, ([_, color]) => ({ 'background-color': color })],
      [/^text-(\w+)$/, ([_, color]) => ({ color })],
    ],
  })

  const result = await uno.generate([
    'nth-2:bg-blue',
    'nth-3:text-red',
    'first:bg-green',
    'last:text-purple',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "nth-2:bg-blue",
        "nth-3:text-red",
        "first:bg-green",
        "last:text-purple",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .nth-2\\:bg-blue:nth-child(2){background-color:blue;}
      .first\\:bg-green:first-child{background-color:green;}
      .nth-3\\:text-red:nth-child(3){color:red;}
      .last\\:text-purple:last-child{color:purple;}"
    `)
})

it('multi pseudo classes', async () => {
  const uno = await createGenerator({
    variants: [
      ...createPseudoClassesAndElements(utils),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ content: `"${a}"` })],
    ],
  })

  const result = await uno.generate([
    'selection:foo-1',
    'marker:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "selection:foo-1",
        "marker:foo-2",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .marker\\:foo-2 *::marker,
      .marker\\:foo-2::marker{content:"2";}
      .selection\\:foo-1 *::selection,
      .selection\\:foo-1::selection{content:"1";}"
    `)
})

// https://github.com/unocss/unocss/issues/5043
it('tagged pseudo classes keep the written prefix order in both variant apply orders', async () => {
  for (const variantApplyOrder of ['right-to-left', 'left-to-right'] as const) {
    const uno = await createGenerator({
      variantApplyOrder,
      variants: [
        ...createTaggedPseudoClasses({}, utils),
        variantMatcher('dark', (input, ctx) => ({ prefix: variantPrefix(input, '.dark $$ ', ctx) })),
        // a third-party variant replacing the entries array
        {
          name: 'copy',
          match(matcher) {
            if (!matcher.startsWith('copy:'))
              return
            return {
              matcher: matcher.slice('copy:'.length),
              body: entries => entries.map(entry => [...entry] as typeof entry),
            }
          },
        },
        // a third-party variant rebuilding the context from its documented fields
        {
          name: 'plugin',
          match(matcher) {
            if (!matcher.startsWith('plugin:'))
              return
            return {
              matcher: matcher.slice('plugin:'.length),
              handle: (input, next) => next({
                prefix: input.prefix,
                selector: `${input.selector}:checked`,
                pseudo: input.pseudo,
                entries: input.entries,
                parent: input.parent,
                parentOrder: input.parentOrder,
                layer: input.layer,
                sort: input.sort,
                noMerge: input.noMerge,
              }),
            }
          },
        },
      ],
      rules: [
        [/^foo-(\d+)$/, ([_, a]) => ({ text: `foo-${a}` })],
      ],
      shortcuts: [['sc', 'group-focus:foo-14']],
    })

    const { css } = await uno.generate([
      'dark:group-hover:foo-1',
      'group-hover:dark:foo-2',
      'dark:group-hover:group-focus:foo-3',
      'group-hover:group-focus:group-active:foo-4',
      'group-hover:peer-[&_.group:focus_.group:active]:foo-5',
      'group-[&_.group:focus_.group:active]:foo-6',
      'group-[&_.group:focus_.group:active]:group-hover:foo-7',
      'group-hover:group-[&_.group:focus_.group:active]:foo-8',
      'group-hover:peer-hover:peer-focus:foo-9',
      'group-hover:plugin:group-focus:foo-0',
      'group-[&_.foo]:group-hover:group-focus:foo-10',
      'group-hover:group-[&_.foo]:group-focus:foo-11',
      'group-[.x&:first-child]:group-last:foo-12',
      'peer-[.x&:first-child]:peer-last:foo-13',
      'group-hover:sc',
      'group-hover:copy:group-focus:foo-16',
    ], { preflights: false })

    expect(css).toContain('.dark .group:hover .dark\\:group-hover\\:foo-1{')
    expect(css).toContain('.group:hover .dark .group-hover\\:dark\\:foo-2{')
    expect(css).toContain('.dark .group:hover:focus .dark\\:group-hover\\:group-focus\\:foo-3{')
    expect(css).toContain('.group:hover:focus:active .group-hover\\:group-focus\\:group-active\\:foo-4{')
    // only the segments of stacked simple `group-*` variants are merged, never arbitrary selectors
    expect(css).toContain('.group:hover .peer .group:focus .group:active~.group-hover\\:peer-')
    expect(css).toContain('.group .group:focus .group:active .group-\\[')
    expect(css).toContain('.group .group:focus .group:active .group:hover .group-\\[')
    expect(css).toContain('.group:hover .group .group:focus .group:active .group-hover\\:group-\\[')
    expect(css).not.toContain('.group:focus:active')
    // stacked segments of another tag are merged too
    expect(css).toContain('.group:hover .peer:hover:focus~.group-hover\\:peer-hover\\:peer-focus\\:foo-9{')
    // merging does not depend on the variants in between preserving anything but the prefix
    expect(css).toContain('.group:hover:focus .group-hover\\:plugin\\:group-focus\\:foo-0:checked{')
    // simple segments following an arbitrary one are merged, an arbitrary one in between is not
    expect(css).toContain('.group .foo .group:hover:focus .group-\\[')
    expect(css).toContain('.group:hover .group .foo .group:focus .group-hover\\:group-\\[')
    // a compound arbitrary segment is never merged with the simple segment that follows it
    expect(css).toContain('.x.group:first-child .group:last-child .group-\\[')
    expect(css).toContain('.x.peer:first-child~.peer:last-child~.peer-\\[')
    // the variants of a shortcut merge with the ones of its utilities
    expect(css).toContain('.group:hover:focus .group-hover\\:sc{')
    // merging survives a body transform replacing the entries
    expect(css).toContain('.group:hover:focus .group-hover\\:copy\\:group-focus\\:foo-16{')

    // merging keeps the scope placeholder of the preceding prefixes
    const { css: scoped } = await uno.generate(['dark:group-hover:group-focus:foo-3'], { preflights: false, scope: '.scope' })
    expect(scoped).toContain('.dark .scope .group:hover:focus .dark\\:group-hover\\:group-focus\\:foo-3{')
  }
})

// https://github.com/unocss/unocss/issues/5043
it('only merges the segments appended by tagged pseudo classes of the same utility', async () => {
  const config = {
    variantApplyOrder: 'left-to-right' as const,
    variants: [
      ...createTaggedPseudoClasses({}, utils),
      // a third-party variant writing a prefix that looks like a `group-hover` segment
      {
        name: 'custom',
        match(matcher: string) {
          if (!matcher.startsWith('custom:'))
            return
          return {
            matcher: matcher.slice('custom:'.length),
            handle: (input: VariantHandlerContext, next: (input: VariantHandlerContext) => VariantHandlerContext) => next({ ...input, prefix: `${input.prefix}.group:hover ` }),
          }
        },
      },
    ],
    // a static rule shares its entries array between all the utilities using it
    rules: [
      ['bar', [['text', 'bar']]],
    ] as Rule[],
  }
  const uno = await createGenerator(config)

  // the prefix produced by `group-hover:bar` must not be mistaken for the one of the next utility
  const { css } = await uno.generate(['group-hover:bar', 'custom:group-focus:bar'], { preflights: false })
  expect(css).toContain('.group:hover .group:focus .custom\\:group-focus\\:bar{')

  // nor across generators
  const { css: other } = await (await createGenerator(config)).generate(['custom:group-focus:bar'], { preflights: false })
  expect(other).toContain('.group:hover .group:focus .custom\\:group-focus\\:bar{')
})
