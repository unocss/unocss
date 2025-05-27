import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'
import { nonTargets, targets, targets2, targetsWithThemes } from './assets/preset-wind3-targets'

const uno = await createGenerator({
  presets: [
    presetWind3({
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
    data: {
      dropdown: 'data-bs-toggle="dropdown"',
    },
    container: {
      center: true,
      padding: {
        'DEFAULT': '1rem',
        'sm': '2rem',
        'lg': '4rem',
        'xl': '5rem',
        '2xl': '6rem',
      },
    },
  },
})

it('targets', async () => {
  const code = [
    ...targets,
    ...targetsWithThemes,
  ].join(' ')
  const { css } = await uno.generate(code, { preflights: false })
  const { css: css2 } = await uno.generate(code, { preflights: false })

  const unmatched = []
  for (const i of targets) {
    if (!css.includes(escapeSelector(i)))
      unmatched.push(i)
  }
  expect(unmatched).toEqual([])
  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-targets.css')
  expect(css).toEqual(css2)
})

it('targets 2', async () => {
  const code = targets2.join(' ')
  const { css } = await uno.generate(code, { preflights: false })
  const { css: css2 } = await uno.generate(code, { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-targets-2.css')
  expect(css).toEqual(css2)
})

it('non-targets', async () => {
  const code = nonTargets.join(' ')
  const { css, matched } = await uno.generate(code, { preflights: false })

  expect(Array.from(matched)).toEqual([])
  expect(css).toBe('')
})

it('custom var prefix', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3({
        variablePrefix: 'hi-',
      }),
    ],
  })

  const { css } = await uno.generate([
    'text-opacity-50',
    'text-red',
    'scale-100',
  ].join(' '), { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-custom-var-prefix.css')
})

it('empty prefix', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3({
        variablePrefix: '',
      }),
    ],
  })

  const { css } = await uno.generate([
    'text-opacity-50',
    'text-red',
    'scale-100',
  ].join(' '), { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-empty-prefix.css')
})

it('define breakpoints with irregular sorting', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
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

it('containers', async () => {
  const targets = [
    'container',
    'md:container',
    'lg:container',
  ]
  const nonTargets = [
    '__container',
  ]
  const { css, matched } = await uno.generate(new Set([...targets, ...nonTargets]), { preflights: false })

  expect(matched).toEqual(new Set(targets))
  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-containers.css')
})

it('centered containers', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
    ],
    theme: {
      container: {
        center: true,
      },
    },
  })

  const targets = [
    'container',
    'md:container',
    'lg:container',
  ]
  const { css, matched } = await uno.generate(new Set(targets), { preflights: false })

  expect(matched).toEqual(new Set(targets))
  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-containers-centered.css')
})

it('containers with max width', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind3(),
    ],
    theme: {
      container: {
        maxWidth: {
          sm: '540px',
          md: '720px',
          lg: '960px',
          xl: '1140px',
          xxl: '1320px',
        },
      },
    },
  })

  const targets = [
    'container',
    'md:container',
    'lg:container',
  ]

  const { css, matched } = await uno.generate(new Set(targets), { preflights: false })

  expect(matched).toEqual(new Set(targets))
  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-containers-max-width.css')
})

describe('important', () => {
  it(`should add " !important" at the end when "true" unless it's already marked important`, async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3({
          important: true,
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'important:scale-100',
      'dark:bg-blue',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-important-true.css')
  })

  it(`should prefix selector with provided important string and wrap the original selector in ":is()"`, async () => {
    const uno = await createGenerator({
      presets: [
        presetWind3({
          important: '#app',
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'important:scale-100',
      'dark:bg-blue',
      'after:m-4',
      'selection:bg-yellow',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind3-important-string.css')
  })
})
