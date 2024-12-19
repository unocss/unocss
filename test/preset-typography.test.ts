import { createGenerator } from '@unocss/core'
import presetAttributify, { type AttributifyOptions } from '@unocss/preset-attributify'
import { presetTypography, type TypographyOptions } from '@unocss/preset-typography'
import { presetUno } from '@unocss/preset-uno'
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
      cssExtend: (theme) => {
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
          presetUno({ preflight: false }),
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
        presetUno({ preflight: false }),
        presetTypography(),
      ],
    })

    const { css } = await uno.generate('<div prose-headings:text-red prose-img:rounded hover:prose-p-m2></div>', { preflights: false })

    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      [hover\\:prose-p-m2=""] :is(:where(p):not(:where(.not-prose,.not-prose *))):hover{margin:0.5rem;}
      .prose-img\\:rounded :is(:where(img):not(:where(.not-prose,.not-prose *))),
      [prose-img\\:rounded=""] :is(:where(img):not(:where(.not-prose,.not-prose *))){border-radius:0.25rem;}
      .prose-headings\\:text-red :is(:where(h1,h2,h3,h4,h5,h6,th):not(:where(.not-prose,.not-prose *))),
      [prose-headings\\:text-red=""] :is(:where(h1,h2,h3,h4,h5,h6,th):not(:where(.not-prose,.not-prose *))){--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}"
    `)
  })

  it('basic without compatibility', async () => {
    const uno = await createGenerator({
      presets: [
        presetAttributify(),
        presetUno({ preflight: false }),
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
