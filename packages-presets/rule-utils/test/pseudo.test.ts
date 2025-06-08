import type { PseudoVariantUtilities } from '../src/pseudo'
import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'
import {
  createPartClasses,
  createPseudoClassesAndElements,
  createPseudoClassFunctions,
  createTaggedPseudoClasses,
} from '../src/pseudo'
import { variantGetBracket } from '../src/variants'

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
  h: {
    bracket: (str: string) => {
      // Simple bracket value parser for tests
      if (str && str.startsWith('[') && str.endsWith(']')) {
        return str.slice(1, -1)
      }
      return undefined
    },
  },
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

  const result = await uno.generate([
    'nth-[2n+1]:foo-1',
    'nth-[odd]:foo-2',
    'nth-[3]:foo-3',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "nth-[odd]:foo-2",
        "nth-[3]:foo-3",
      }
    `)

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .nth-\\[3\\]\\:foo-3:nth-child(3){order:3;}
      .nth-\\[odd\\]\\:foo-2:nth-child(odd){order:2;}"
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
