import type { VariantHandler } from '@unocss/core'
import { createGenerator, symbols } from '@unocss/core'
import { expect, it } from 'vitest'

it('shortcuts-no-merge', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color]) {
        yield {
          color,
        }
        yield {
          'font-weight': 'bold',
        }
      }],
      [/^bg-(.*)$/, function ([, color]) {
        return {
          'background-color': color,
        }
      }],
    ],
    shortcuts: [
      ['shortcut', 'color-red bg-red'],
    ],
  })
  expect((await uno1.generate('shortcut')).css)
    .toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut{color:red;font-weight:bold;background-color:red;}"
    `)

  const uno2 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
        }
        yield {
          'font-weight': 'bold',
          [ctx.symbols.shortcutsNoMerge]: true,
        }
      }],
      [/^bg-(.*)$/, function ([, color]) {
        return {
          'background-color': color,
        }
      }],
    ],
    shortcuts: [
      ['shortcut', 'color-red bg-red'],
    ],
  })
  expect((await uno2.generate('shortcut')).css)
    .toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut{color:red;background-color:red;}
      .shortcut{font-weight:bold;}"
    `)
})

it('variants', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
        }

        yield {
          color,
          [ctx.symbols.variants]: [
            {
              matcher: 'foo',
              selector: s => `${s}:hover`,
              parent: '@supports (display: grid)',
            },
          ] as VariantHandler[],
        }
      }],
    ],

    shortcuts: [
      ['shortcut1', 'color-red color-blue'],
    ],
  })

  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .color-red{color:red;}
      @supports (display: grid){
      .color-red:hover{color:red;}
      }"
    `)

  expect((await uno1.generate('shortcut1')).css)
    .toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .shortcut1{color:red;color:blue;}
      @supports (display: grid){
      .shortcut1:hover{color:red;color:blue;}
      }"
    `)
})

it('parent', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
        }
        yield {
          [ctx.symbols.parent]: '@supports (display: grid)',
          color,
        }
        // CSS Entries style
        yield [
          [ctx.symbols.parent, '@supports (display: flex)'],
          ['color', color],
        ]
      }],
    ],
  })
  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .color-red{color:red;}
      @supports (display: flex){
      .color-red{color:red;}
      }
      @supports (display: grid){
      .color-red{color:red;}
      }"
    `)
})

it('selector', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
        }
        yield {
          [ctx.symbols.selector]: s => `${s}:hover`,
          color: `lighten(${color}, 10%)`,
        }
      }],
    ],
  })
  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .color-red{color:red;}
      .color-red:hover{color:lighten(red, 10%);}"
    `)
})

it('layer', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
          [ctx.symbols.layer]: color,
        }
      }],
    ],
  })
  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: red */
      .color-red{color:red;}"
    `)
})

it('layer string', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* ([, color], ctx) {
        yield {
          color,
          [ctx.symbols.layer]: 'custom-layer',
        }
      }],
    ],
  })
  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: custom-layer */
      .color-red{color:red;}"
    `)
})

it('sort', async () => {
  const uno1 = await createGenerator({
    rules: [
      [/^color-(.*)$/, function* (_, ctx) {
        yield {
          color: 'green',
          [ctx.symbols.selector]: () => '.a',
          [ctx.symbols.sort]: 2,
        }
        yield {
          color: 'red',
          [ctx.symbols.selector]: () => '.b',
          [ctx.symbols.sort]: 1,
        }
      }],
    ],
  })
  expect((await uno1.generate('color-red')).css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .b{color:red;}
      .a{color:green;}"
    `)
})

it('hoist static rule', async () => {
  const uno = await createGenerator({
    rules: [
      ['foo', [
        { color: 'red' },
        {
          [symbols.parent]: '@media (min-width: 640px)',
          [symbols.selector]: s => `${s}:hover`,
          color: 'blue',
        },
      ]],
    ],
  })
  const { css } = await uno.generate('foo', { preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .foo{color:red;}
    @media (min-width: 640px){
    .foo:hover{color:blue;}
    }"
  `)
})
