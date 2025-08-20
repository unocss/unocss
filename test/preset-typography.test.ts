import type { AttributifyOptions } from '@unocss/preset-attributify'
import type { TypographyOptions } from '@unocss/preset-typography'
import type { Theme } from '@unocss/preset-wind3'
import { createAutocomplete } from '@unocss/autocomplete'
import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import presetTypography from '@unocss/preset-typography'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'

const testConfigs: {
  name: string
  input: string
  typographyOptions: TypographyOptions
  attributifyOptions?: AttributifyOptions
}[] = [
  // prose test
  {
    name: 'prose-class',
    input: 'prose text-base prose-teal dark:prose-invert',
    typographyOptions: {},
  },

  // custom prose test
  {
    name: 'prose-class-custom',
    input: 'custom text-base custom-teal dark:custom-invert',
    typographyOptions: { selectorName: 'custom' },
  },

  // prose attribute test
  {
    name: 'prose-attribute',
    input: '<main prose text-base prose-teal dark="prose-invert"></main>',
    typographyOptions: {},
  },

  // custom prose attribute test
  {
    name: 'prose-attribute-custom',
    input: '<main custom text-base custom-teal dark="custom-invert"></main>',
    typographyOptions: { selectorName: 'custom' },
  },

  // custom css test
  {
    name: 'prose-custom-css',
    input: 'prose',
    typographyOptions: {
      cssExtend: {
        'code': {
          color: '#8b5cf6',
        },
        'a:hover': {
          color: '#f43f5e',
        },
        'a:visited': {
          color: '#14b8a6',
        },
      },
    },
  },

  // custom css test with function
  {
    name: 'prose-custom-css-function',
    input: 'prose',
    typographyOptions: {
      cssExtend: (theme: Theme) => {
        const purple = theme.colors?.purple as Record<string, string>
        return {
          'code': {
            'color': purple['600'],
            'font-family': theme.fontFamily?.sans,
          },
          'a:hover': {
            color: purple['500'],
          },
          'a:visited': {
            color: purple['400'],
          },
        }
      },
    },
  },

  // black
  {
    name: 'prose-black',
    input: 'prose-black',
    typographyOptions: {},
  },

  // other color
  {
    name: 'prose-missing-color',
    input: 'prose-missing-color',
    typographyOptions: {},
  },

  // custom prefixed attribute test #795
  {
    name: 'prose-custom-prefix-attribute',
    input: '<a u:prose class="prose"></a>',
    typographyOptions: {},
    attributifyOptions: {
      prefix: 'u:',
      strict: false,
    },
  },

  {
    name: 'prose-compatibility-no-colon-is',
    input: '<a prose class="prose"></a>',
    typographyOptions: { compatibility: { noColonIs: true } },
  },

  {
    name: 'prose-compatibility-no-colon-where',
    input: '<a prose class="prose"></a>',
    typographyOptions: { compatibility: { noColonWhere: true } },
  },

  {
    name: 'prose-compatibility-no-colon-not',
    input: '<a prose class="prose"></a>',
    typographyOptions: { compatibility: { noColonNot: true } },
  },

  // important
  {
    name: 'prose-important',
    input: '<a prose class="prose"></a>',
    typographyOptions: { important: true },
  },
  {
    name: 'prose-important',
    input: '<a prose class="prose"></a>',
    typographyOptions: { important: '#container' },
  },
]

describe('typography', () => {
  for (const tc of testConfigs) {
    it(tc.name, async () => {
      const uno = await createGenerator({
        presets: [
          presetAttributify(tc.attributifyOptions),
          presetWind3({ preflight: false }),
          presetTypography(tc.typographyOptions),
        ],
      })

      const { css } = await uno.generate(tc.input)
      expect(css).toMatchSnapshot()
    })
  }
})

describe('typography elements modify', () => {
  it('basic', async () => {
    const uno = await createGenerator({
      presets: [
        presetAttributify(),
        presetWind3({ preflight: false }),
        presetTypography(),
      ],
    })

    const { css } = await uno.generate('<div prose-headings:text-red prose-img:rounded hover:prose-p-m2></div>', { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      [hover\\:prose-p-m2=""] :is(:where(p):not(:where([class~="not-prose"],[class~="not-prose"] *))):hover{margin:0.5rem;}
      .prose-img\\:rounded :is(:where(img):not(:where([class~="not-prose"],[class~="not-prose"] *))),
      [prose-img\\:rounded=""] :is(:where(img):not(:where([class~="not-prose"],[class~="not-prose"] *))){border-radius:0.25rem;}
      .prose-headings\\:text-red :is(:where(h1,h2,h3,h4,h5,h6,th):not(:where([class~="not-prose"],[class~="not-prose"] *))),
      [prose-headings\\:text-red=""] :is(:where(h1,h2,h3,h4,h5,h6,th):not(:where([class~="not-prose"],[class~="not-prose"] *))){--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}"
    `)
  })

  it('basic without compatibility', async () => {
    const uno = await createGenerator({
      presets: [
        presetAttributify(),
        presetWind3({ preflight: false }),
        presetTypography({
          compatibility: {
            noColonIs: true,
            noColonWhere: true,
            noColonNot: true,
          },
        }),
      ],
    })

    const { css } = await uno.generate('<div prose-headings:text-red prose-img:rounded hover:prose-p-m2></div>', { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      [hover\\:prose-p-m2=""] p:hover{margin:0.5rem;}
      .prose-img\\:rounded img,
      [prose-img\\:rounded=""] img{border-radius:0.25rem;}
      .prose-headings\\:text-red h1,.prose-headings\\:text-red h2,.prose-headings\\:text-red h3,.prose-headings\\:text-red h4,.prose-headings\\:text-red h5,.prose-headings\\:text-red h6,.prose-headings\\:text-red th,
      [prose-headings\\:text-red=""] h1,[prose-headings\\:text-red=""] h2,[prose-headings\\:text-red=""] h3,[prose-headings\\:text-red=""] h4,[prose-headings\\:text-red=""] h5,[prose-headings\\:text-red=""] h6,[prose-headings\\:text-red=""] th{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}"
    `)
  })
})

describe('typography with custom theme colors', () => {
  it('with alpha', async () => {
    const uno = await createGenerator({
      presets: [
        presetTypography(),
      ],
      theme: {
        colors: {
          myColor: {
            50: 'oklch(0.95 0.018 0 / <alpha-value>)',
            100: 'oklch(0.93 0.05 0 / <alpha-value>)',
            200: 'oklch(0.88 0.09 0 / <alpha-value>)',
            300: 'oklch(0.82 0.14 0 / <alpha-value>)',
            400: 'oklch(0.73 0.195 0 / <alpha-value>)',
            500: 'oklch(0.64 0.24 0 / <alpha-value>)',
            600: 'oklch(0.56 0.235 0 / <alpha-value>)',
            700: 'oklch(0.49 0.22 0)', // prose-body will be no alpha.
            800: 'oklch(0.41 0.185 0 / <alpha-value>)',
            900: 'oklch(0.36 0.15 0 / <alpha-value>)',
            950: 'oklch(0.26 0.11 0 / <alpha-value>)',
          },
        },
      },
    })

    const { css } = await uno.generate('prose-myColor', { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: typography */
      :is(.prose-myColor){--un-prose-body:oklch(0.49 0.22 0);--un-prose-invert-body:oklch(0.82 0.14 0 / var(--un-prose-invert-body-opacity));--un-prose-invert-body-opacity:1;--un-prose-headings:oklch(0.36 0.15 0 / var(--un-prose-headings-opacity));--un-prose-invert-headings:white;--un-prose-headings-opacity:1;--un-prose-lead:oklch(0.56 0.235 0 / var(--un-prose-lead-opacity));--un-prose-invert-lead:oklch(0.73 0.195 0 / var(--un-prose-invert-lead-opacity));--un-prose-lead-opacity:1;--un-prose-invert-lead-opacity:1;--un-prose-links:oklch(0.36 0.15 0 / var(--un-prose-links-opacity));--un-prose-invert-links:white;--un-prose-links-opacity:1;--un-prose-bold:oklch(0.36 0.15 0 / var(--un-prose-bold-opacity));--un-prose-invert-bold:white;--un-prose-bold-opacity:1;--un-prose-counters:oklch(0.64 0.24 0 / var(--un-prose-counters-opacity));--un-prose-invert-counters:oklch(0.73 0.195 0 / var(--un-prose-invert-counters-opacity));--un-prose-counters-opacity:1;--un-prose-invert-counters-opacity:1;--un-prose-bullets:oklch(0.82 0.14 0 / var(--un-prose-bullets-opacity));--un-prose-invert-bullets:oklch(0.56 0.235 0 / var(--un-prose-invert-bullets-opacity));--un-prose-bullets-opacity:1;--un-prose-invert-bullets-opacity:1;--un-prose-hr:oklch(0.88 0.09 0 / var(--un-prose-hr-opacity));--un-prose-invert-hr:oklch(0.49 0.22 0);--un-prose-hr-opacity:1;--un-prose-quotes:oklch(0.36 0.15 0 / var(--un-prose-quotes-opacity));--un-prose-invert-quotes:oklch(0.93 0.05 0 / var(--un-prose-invert-quotes-opacity));--un-prose-quotes-opacity:1;--un-prose-invert-quotes-opacity:1;--un-prose-quote-borders:oklch(0.88 0.09 0 / var(--un-prose-quote-borders-opacity));--un-prose-invert-quote-borders:oklch(0.49 0.22 0);--un-prose-quote-borders-opacity:1;--un-prose-captions:oklch(0.64 0.24 0 / var(--un-prose-captions-opacity));--un-prose-invert-captions:oklch(0.73 0.195 0 / var(--un-prose-invert-captions-opacity));--un-prose-captions-opacity:1;--un-prose-invert-captions-opacity:1;--un-prose-kbd:oklch(0.36 0.15 0 / var(--un-prose-kbd-opacity));--un-prose-invert-kbd:white;--un-prose-kbd-opacity:1;--un-prose-kbd-shadows:oklch(0.36 0.15 0 / var(--un-prose-kbd-shadows-opacity));--un-prose-invert-kbd-shadows:white;--un-prose-kbd-shadows-opacity:1;--un-prose-code:oklch(0.36 0.15 0 / var(--un-prose-code-opacity));--un-prose-invert-code:white;--un-prose-code-opacity:1;--un-prose-pre-code:oklch(0.88 0.09 0 / var(--un-prose-pre-code-opacity));--un-prose-invert-pre-code:oklch(0.82 0.14 0 / var(--un-prose-invert-pre-code-opacity));--un-prose-pre-code-opacity:1;--un-prose-invert-pre-code-opacity:1;--un-prose-pre-bg:oklch(0.41 0.185 0 / var(--un-prose-pre-bg-opacity));--un-prose-invert-pre-bg:rgb(0 0 0 / 50%);--un-prose-pre-bg-opacity:1;--un-prose-th-borders:oklch(0.82 0.14 0 / var(--un-prose-th-borders-opacity));--un-prose-invert-th-borders:oklch(0.56 0.235 0 / var(--un-prose-invert-th-borders-opacity));--un-prose-th-borders-opacity:1;--un-prose-invert-th-borders-opacity:1;--un-prose-td-borders:oklch(0.88 0.09 0 / var(--un-prose-td-borders-opacity));--un-prose-invert-td-borders:oklch(0.49 0.22 0);--un-prose-td-borders-opacity:1;}"
    `)
  })
})

describe('autocomplete for typography', async () => {
  it('prose templates', async () => {
    const uno = await createGenerator({
      presets: [
        presetTypography(),
      ],
    })

    const ac = createAutocomplete(uno, { throwErrors: false })

    expect(ac.templates).toMatchInlineSnapshot(`
      [
        "prose-(sm|base|lg|xl|2xl)",
        "prose-$colors",
        "prose",
        "prose-(headings:|h1:|h2:|h3:|h4:|h5:|h6:|p:|a:|blockquote:|figure:|figcaption:|strong:|em:|kbd:|code:|pre:|ol:|ul:|li:|table:|thead:|tr:|th:|td:|img:|video:|hr:)",
      ]
    `)
  })
})
