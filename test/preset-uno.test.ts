import { createGenerator, escapeSelector } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, test } from 'vitest'

const targets = [
  // custom colors
  'text-custom-a',
  'bg-custom-b',
  'border-custom-b',
  'border-custom-b/0',
  'border-custom-b/10',

  // wind - placeholder
  'placeholder-red-400',
  'placeholder-inherit',
  'placeholder-opacity-10',
  'placeholder-op90',

  // mini + wind - placeholder
  'focus:placeholder-red-300',
  'hover:placeholder-op90',
]

const nonTargets = [
  '--p-2',
  'before:before:m2',
  'hi',
  'row-{row.id}',
  'tabs',
  'tab.hello',
  'text-anything',
  'p-anything',
  'rotate-[3]deg',
  'list-none-inside',

  // mini - color utility
  'color-gray-100-prefix/10',
  'color-gray-400-prefix',
  'color-blue-gray-400-prefix',
  'color-true-gray-400-prefix',
  'color-gray-400-500',
  'color-true-gray-400-500',

  // mini - behaviors
  'will-change-all',
  'will-change-none',
  'will-change-margins,padding',
  'will-change-padding,margins',

  // mini - filters
  'brightness',
  'hue-rotate',
  'saturate',
  'backdrop-brightness',
  'backdrop-hue-rotate',
  'backdrop-saturate',

  // mini - ring
  'ring-',

  // mini - shadow
  'shadow-',

  // mini - transition
  'property-colour',
  'property-background-color,colour-300',
  'property-colour-background-color-300',
  'transition-unset',
  'transition-colour',
  'transition-background-color,colour-300',
  'transition-colour,background-color-300',

  // mini - typography
  'tab-',

  // mini - variable
  'tab-$',
  'ws-$',

  // wind - placeholder
  '$-placeholder-red-200',
]

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
      },
    },
  },
})

test('targets', async() => {
  const code = targets.join(' ')
  const { css } = await uno.generate(code)
  const { css: css2 } = await uno.generate(code)

  const unmatched = []
  for (const i of targets) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  expect(css).toMatchSnapshot()
  expect(css).toEqual(css2)
})

test('non-targets', async() => {
  const code = nonTargets.join(' ')
  const { css, matched } = await uno.generate(code)

  expect(Array.from(matched)).toEqual([])
  expect(css).toBe('')
})
