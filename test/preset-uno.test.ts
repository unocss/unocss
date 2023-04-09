import { createGenerator, escapeSelector } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, test } from 'vitest'
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

test('targets', async () => {
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

test('targets 2', async () => {
  const code = targets2.join(' ')
  const { css } = await uno.generate(code, { preflights: false })
  const { css: css2 } = await uno.generate(code, { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-uno-targets-2.css')
  expect(css).toEqual(css2)
})

test('non-targets', async () => {
  const code = nonTargets.join(' ')
  const { css, matched } = await uno.generate(code, { preflights: false })

  expect(Array.from(matched)).toEqual([])
  expect(css).toBe('')
})

test('custom var prefix', async () => {
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

test('empty prefix', async () => {
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
