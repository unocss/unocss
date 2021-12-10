import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind from '@unocss/preset-wind'
import { expect, test } from 'vitest'

const targets: string[] = [
  // decoration
  'decoration-none',
  'decoration-transparent',
  'decoration-purple/50',
  'underline',
  'underline-dashed',
  'underline-red-500',
  'underline-op80',
  'underline-auto',
  'underline-5',
  'underline-1rem',
  'underline-offset-auto',
  'underline-offset-4',
  'underline-offset-0.6rem',
  // backdrop filters
  'backdrop-filter',
  'backdrop-blur',
  'backdrop-blur-md',
  'backdrop-blur-4',
  'backdrop-brightness-0',
  'backdrop-brightness-60',
  'backdrop-contrast-125',
  'backdrop-grayscale',
  'backdrop-grayscale-90',
  'backdrop-hue-rotate-0',
  'backdrop-hue-rotate-360',
  '-backdrop-hue-rotate-90',
  'backdrop-invert',
  'backdrop-invert-90',
  'backdrop-saturate',
  'backdrop-saturate-30',
  'backdrop-sepia',
  'backdrop-sepia-80',
  'line-clamp-7',
  'line-clamp-100',
  'line-clamp-none',
  // isolation
  'isolate',
  'isolate-auto',
  // filters
  'filter',
  'blur',
  'blur-md',
  'blur-4',
  'brightness-0',
  'brightness-60',
  'contrast-125',
  'drop-shadow',
  'drop-shadow-[0_4px_3px_#000]',
  'drop-shadow-none',
  'drop-shadow-md',
  'grayscale',
  'grayscale-90',
  'hue-rotate-0',
  'hue-rotate-360',
  '-hue-rotate-90',
  'invert',
  'invert-90',
  'saturate',
  'saturate-30',
  'sepia',
  'sepia-80',
  // animation
  'animate-none',
  '!animate-ping',
  'animate-pulse',
  'animate-pulse-alt',
  'hover:animate-bounce',
  'animate-300',
  'animate-100s',
  'animate-duration-100',
  'animate-duration-100.32',
  'animate-delay--1.37',
  'animate-speed-$speed',
  'animate-name-move',
  'animate-play-paused',
  'animate-normal',
  'animate-play-state-running',
  'animate-mode-none',
  'animate-fill-mode-both',
  'animate-direction-alternate-reverse',
  'animate-count-2.4',
  'animate-iteration-count-2',
  'animate-iteration-count-2-4-infinity',
]

const uno = createGenerator({
  presets: [
    presetWind({
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

test('containers', async() => {
  const targets = [
    'container',
    'md:container',
    'lg:container',
  ]
  const nonTargets = [
    '__container',
  ]
  const { css, matched } = await uno.generate(new Set([...targets, ...nonTargets]))

  expect(matched).toEqual(new Set(targets))
  expect(css).toMatchSnapshot()
})
