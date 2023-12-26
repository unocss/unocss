import { createGenerator, escapeSelector } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, it } from 'vitest'
import { nonTargets, targets, targets2 } from './assets/preset-uno-targets'

const uno = createGenerator({
  presets: [
    presetUno({
      dark: 'media',
    }),
  ],
  theme: {
    colors: {
      custom: {
        a: 'var(--custom)',
        b: 'rgba(var(--custom), %alpha)',
        c: 'rgba(var(--custom-c) / %alpha)',
        d: 'hsl(var(--custom-d), %alpha)',
        e: 'hsl(var(--custom-e) / <alpha-value>)',
        f: 'lch(var(--custom-f) / <alpha-value>)',
      },
      info: 'hsl(200.1, 100%, 54.3%)',
    },
  },
})

it('targets', async () => {
  const code = targets.join(' ')
  const { css } = await uno.generate(code, { preflights: false })
  const { css: css2 } = await uno.generate(code, { preflights: false })

  const unmatched = []
  for (const i of targets) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  await expect(css).toMatchFileSnapshot('./assets/output/preset-uno-targets.css')
  expect(css).toEqual(css2)
})

it('targets 2', async () => {
  const code = targets2.join(' ')
  const { css } = await uno.generate(code, { preflights: false })
  const { css: css2 } = await uno.generate(code, { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-uno-targets-2.css')
  expect(css).toEqual(css2)
})

it('non-targets', async () => {
  const code = nonTargets.join(' ')
  const { css, matched } = await uno.generate(code, { preflights: false })

  expect(Array.from(matched)).toEqual([])
  expect(css).toBe('')
})

it('custom var prefix', async () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        variablePrefix: 'hi-',
      }),
    ],
  })

  const { css } = await uno.generate([
    'text-opacity-50',
    'text-red',
    'scale-100',
  ].join(' '), { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-uno-custom-var-prefix.css')
})

it('empty prefix', async () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        variablePrefix: '',
      }),
    ],
  })

  const { css } = await uno.generate([
    'text-opacity-50',
    'text-red',
    'scale-100',
  ].join(' '), { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-uno-empty-prefix.css')
})

it('define breakpoints with irregular sorting', async () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
    theme: {
      breakpoints: {
        'xxs': '320px',
        'sm': '640px',
        'xs': '480px',
        'xl': '1280px',
        '2xl': '1536px',
        'md': '768px',
        'lg': '1024px',
      },
      container: {
        center: true,
        padding: {
          'DEFAULT': '1rem',
          'xl': '5rem',
          '2xl': '6rem',
        },
      },
    },
  })

  expect((await uno.generate('2xl:container', { preflights: false })).css)
    .toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      @media (min-width: 1536px){
      .\\32 xl\\:container{max-width:1536px;margin-left:auto;margin-right:auto;padding-left:6rem;padding-right:6rem;}
      }"
    `)
})
