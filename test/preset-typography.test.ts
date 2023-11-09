import { createGenerator } from '@unocss/core'
import presetAttributify, { type AttributifyOptions } from '@unocss/preset-attributify'
import { presetUno } from '@unocss/preset-uno'
import { type TypographyOptions, presetTypography } from '@unocss/preset-typography'
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
]

describe('typography', () => {
  for (const tc of testConfigs) {
    it(tc.name, async () => {
      const generator = createGenerator({
        presets: [
          presetAttributify(tc.attributifyOptions),
          presetUno({ preflight: false }),
          presetTypography(tc.typographyOptions),
        ],
      })

      const { css } = await generator.generate(tc.input)
      expect(css).toMatchSnapshot()
    })
  }
})
