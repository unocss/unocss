import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind from '@unocss/preset-wind'
import { describe, expect, it } from 'vitest'
import { presetWindNonTargets, presetWindTargets } from './assets/preset-wind-targets'

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

describe('preset-wind', () => {
  it('targets', async () => {
    const targets = presetWindTargets
    const code = targets.join(' ')
    const { css } = await uno.generate(code)
    const { css: css2 } = await uno.generate(code)

    const unmatched = []
    for (const i of targets) {
      if (!css.includes(escapeSelector(i)))
        unmatched.push(i)
    }
    expect(unmatched).toEqual([])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-targets.css')
    expect(css).toEqual(css2)
  })

  it('non-targets', async () => {
    const { matched } = await uno.generate(new Set(presetWindNonTargets), { preflights: false })

    expect([...matched]).toEqual([])
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
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-containers.css')
  })

  it('centered containers', async () => {
    const uno = createGenerator({
      presets: [
        presetWind(),
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
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-containers-centered.css')
  })

  it('containers with max width', async () => {
    const uno = createGenerator({
      presets: [
        presetWind(),
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
    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-containers-max-width.css')
  })

  it('custom var prefix', async () => {
    const uno = createGenerator({
      presets: [
        presetWind({
          variablePrefix: 'hi-',
        }),
      ],
    })

    const { css } = await uno.generate([
      'text-opacity-50',
      'text-red',
      'scale-100',
    ].join(' '), { preflights: false })

    await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-custom-var-prefix.css')
  })

  describe('important', () => {
    it(`should add " !important" at the end when "true" unless it's already marked important`, async () => {
      const uno = createGenerator({
        presets: [
          presetWind({
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

      await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-important-true.css')
    })

    it(`should prefix selector with provided important string and wrap the original selector in ":is()"`, async () => {
      const uno = createGenerator({
        presets: [
          presetWind({
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

      await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-important-string.css')
    })
  })
})

it('empty prefix', async () => {
  const uno = createGenerator({
    presets: [
      presetWind({
        variablePrefix: '',
      }),
    ],
  })

  const { css } = await uno.generate([
    'text-opacity-50',
    'text-red',
    'scale-100',
  ].join(' '), { preflights: false })

  await expect(css).toMatchFileSnapshot('./assets/output/preset-wind-empty-var-prefix.css')
})
