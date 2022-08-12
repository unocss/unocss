import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'
import presetTheme from '../packages/preset-theme/src'

describe('theme', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
      presetTheme({
        theme: {
          dark: {
            colors: {
              main: {
                100: '#fffff1',
                200: '#fffff2',
                300: '#fffff3',
                400: '#fffff4',
                500: '#fffff4',
                600: '#fffff6',
                700: '#fffff7',
                800: '#fffff8',
              },
            },
          },
          light: {
            colors: {
              main: {
                100: '#000001',
                200: '#000002',
                300: '#000003',
                400: '#000004',
                500: '#000004',
                600: '#000006',
                700: '#000007',
                800: '#000008',
              },
            },
          },
        },
      }),
    ],
  })

  test('basic', async () => {
    const targets = [
      'text-main-100',
      'bg-main-200',
      'border-main-500',
      'text-xl',
      'text-xs',
    ]

    const { css } = await uno.generate(targets.join('\n'))
    expect(css).toMatchInlineSnapshot(`
      "/* layer: preflights */
      *,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: ;}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: ;}
      /* layer: default */
      .border-main-500{border-color:var(--uno-preset-theme-colors-main-500);}
      .bg-main-200{background-color:var(--uno-preset-theme-colors-main-200);}
      .text-xl{font-size:1.25rem;line-height:1.75rem;}
      .text-xs{font-size:0.75rem;line-height:1rem;}
      .text-main-100{color:var(--uno-preset-theme-colors-main-100);}
      /* layer: theme */
      root{--uno-preset-theme-colors-main-100: #000001;--uno-preset-theme-colors-main-200: #000002;--uno-preset-theme-colors-main-300: #000003;--uno-preset-theme-colors-main-400: #000004;--uno-preset-theme-colors-main-500: #000004;--uno-preset-theme-colors-main-600: #000006;--uno-preset-theme-colors-main-700: #000007;--uno-preset-theme-colors-main-800: #000008}.dark{--uno-preset-theme-colors-main-100: #fffff1;--uno-preset-theme-colors-main-200: #fffff2;--uno-preset-theme-colors-main-300: #fffff3;--uno-preset-theme-colors-main-400: #fffff4;--uno-preset-theme-colors-main-500: #fffff4;--uno-preset-theme-colors-main-600: #fffff6;--uno-preset-theme-colors-main-700: #fffff7;--uno-preset-theme-colors-main-800: #fffff8}"
    `)
  })
})
