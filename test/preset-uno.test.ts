import { createGenerator, escapeSelector } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { expect, test } from 'vitest'

const targets = [
  'bg-auto',
  'bg-blend-normal',
  'bg-blend-color-burn',
  'bg-blend-luminosity',
  'bg-bottom',
  'bg-clip-border',
  'bg-clip-text',
  'bg-cover',
  'bg-fixed',
  'bg-gradient-to-t',
  'bg-gradient-to-tl',
  'bg-local',
  'bg-no-repeat',
  'bg-none',
  'bg-origin-border',
  'bg-repeat-space',
  'bg-right-bottom',
  'bg-scroll',
  'caption-top',
  'caption-bottom',
  '.dark:text-xl',
  '@dark:text-xl',
  'from-current',
  'from-green-500',
  'from-transparent',
  'inline-table',
  'mix-blend-normal',
  'mix-blend-color-light',
  'overscroll-x-auto',
  'overscroll-contain',
  'table',
  'table-auto',
  'table-caption',
  'table-empty-cells-visible',
  'table-empty-cells-hidden',
  'table-footer-group',
  'table-row-group',
  'to-current',
  'to-green-500',
  'to-transparent',
  'via-current',
  'via-green-500',
  'via-green-500/30',
  'via-transparent',
  'via-opacity-30',
  'list-none',
  'list-disc',
  'list-outside',
  'list-none-inside',
  'image-render-pixel',
  'decoration-slice',
  'accent-op-90',
  'accent-red',
  'caret-op-90',
  'caret-red',
  'space-x-2',
  'space-y-4',
  '-space-x-4',
  'space-x-reverse',
  'lining-nums',
  'normal-nums',
  'tabular-nums',
  'hyphens-none',
  'write-normal',
  'write-orient-sideways',
  'bg-blend-$data',
  'space-x-$space',
  'touch-pan-left',
  'touch-pan-y',
  'columns-3',
  'columns-5em',
  'columns-auto',
  // scroll-spaces
  'scroll-m-[3em]',
  'scroll-m-0',
  'scroll-m-1/2',
  'scroll-m-auto',
  '-scroll-mb-px',
  'scroll-p-2',
  'scroll-p-t-2',
  'scroll-p2',
  'scroll-pl-10px',
  'scroll-pt-2',
  'scroll-pt2',
  '-scroll-p-px',
  // custom colors
  'text-custom-a',
  'bg-custom-b',
  'border-custom-b/10',
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
  'will-change-all',
  'will-change-none',
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
