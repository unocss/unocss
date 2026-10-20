import type { CSSObject, Rule, StaticRule, VariantHandler } from '@unocss/core'
import type { Theme } from '../theme'
import {
  colorResolver,
  defineProperty,
  directionSize,
  generateThemeVariable,
  h,
  themeTracking,
} from '../utils'

export const scrolls: Rule<Theme>[] = [
  [
    /^scrollbar-(thumb|track)-(.+)$/,
    function* ([, part, body], ctx) {
      const result = colorResolver(`--un-scrollbar-${part}`, `scrollbar-${part}`)(['', body], ctx)
      if (result) {
        const [css, ...rest] = result
        yield {
          ...(css as CSSObject),
          'scrollbar-color': 'var(--un-scrollbar-thumb) var(--un-scrollbar-track)',
        }
        yield* rest
        yield defineProperty('--un-scrollbar-thumb', { syntax: '<color>', initialValue: '#0000' })
        yield defineProperty('--un-scrollbar-track', { syntax: '<color>', initialValue: '#0000' })
      }
    },
    { autocomplete: 'scrollbar-(thumb|track)-$colors' },
  ],
  [
    /^scrollbar-(thumb|track)-op(?:acity)?-?(.+)$/,
    ([, part, opacity], { theme }) => ({
      [`--un-scrollbar-${part}-opacity`]: h.bracket.percent(opacity, theme),
    }),
    {
      autocomplete: [
        'scrollbar-(thumb|track)-(op|opacity)',
        'scrollbar-(thumb|track)-(op|opacity)-<percent>',
      ],
    },
  ],
  [
    /^scrollbar-(w|h)-(.+)$/,
    ([, w, v], { theme, symbols }) => {
      let value: string | undefined
      if (h.number(v) != null) {
        themeTracking('spacing')
        value = `calc(var(--spacing) * ${h.number(v)})`
      }
      else {
        value = h.bracket.cssvar.global.fraction.rem(v, theme)
      }
      if (value != null) {
        return {
          [symbols.variants]: [scrollbarPseudoVariant('::-webkit-scrollbar')],
          [w === 'w' ? 'width' : 'height']: value,
        }
      }
    },
    { autocomplete: 'scrollbar-(w|h)-<num>' },
  ],

  [
    /^scrollbar-(?:(track|thumb)-)?radius-(.+)$/,
    function* ([, part, v], { theme, symbols }) {
      let value: string | undefined
      if (v === 'full') {
        value = 'calc(infinity * 1px)'
      }
      else if (theme.radius && v in theme.radius) {
        themeTracking('radius', v)
        value = generateThemeVariable('radius', v)
      }
      else {
        value = h.bracket.cssvar.global.fraction.rem(v, theme)
      }
      if (value != null) {
        for (const target of part ? [part] : ['thumb', 'track']) {
          yield {
            [symbols.variants]: [scrollbarPseudoVariant(`::-webkit-scrollbar-${target}`)],
            'border-radius': value,
          }
        }
      }
    },
    { autocomplete: ['scrollbar-radius-$radius', 'scrollbar-(track|thumb)-radius-$radius'] },
  ],

  ['scrollbar-auto', { 'scrollbar-width': 'auto' }],
  ['scrollbar-thin', { 'scrollbar-width': 'thin' }],
  ['scrollbar-none', { 'scrollbar-width': 'none' }],

  ['scrollbar-gutter-auto', { 'scrollbar-gutter': 'auto' }],
  ['scrollbar-gutter-stable', { 'scrollbar-gutter': 'stable' }],
  ['scrollbar-gutter-both', { 'scrollbar-gutter': 'stable both-edges' }],

  ...['x', 'y', 'both'].map<StaticRule>(d => [
    `snap-${d}`,
    [
      { 'scroll-snap-type': `${d} var(--un-scroll-snap-strictness)` },
      defineProperty('--un-scroll-snap-strictness', { initialValue: 'proximity' }),
    ],
  ]),
  ...['mandatory', 'proximity'].map<StaticRule>(d => [
    `snap-${d}`,
    [
      { '--un-scroll-snap-strictness': d },
      defineProperty('--un-scroll-snap-strictness', { initialValue: 'proximity' }),
    ],
  ]),
  ['snap-none', { 'scroll-snap-type': 'none' }],

  // snap align
  ['snap-start', { 'scroll-snap-align': 'start' }],
  ['snap-end', { 'scroll-snap-align': 'end' }],
  ['snap-center', { 'scroll-snap-align': 'center' }],
  ['snap-align-none', { 'scroll-snap-align': 'none' }],

  // snap stop
  ['snap-normal', { 'scroll-snap-stop': 'normal' }],
  ['snap-always', { 'scroll-snap-stop': 'always' }],

  // scroll margin

  [
    /^scroll-ma?()-?(.+)$/,
    directionSize('scroll-margin'),
    {
      autocomplete: [
        'scroll-(m|p|ma|pa|block|inline)',
        'scroll-(m|p|ma|pa|block|inline)-$spacing',
        'scroll-(m|p|ma|pa|block|inline)-(x|y|r|l|t|b|bs|be|is|ie)',
        'scroll-(m|p|ma|pa|block|inline)-(x|y|r|l|t|b|bs|be|is|ie)-$spacing',
      ],
    },
  ],
  [/^scroll-m-?([xy])-?(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([rltb])-?(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-(block|inline)-(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([bi][se])-?(.+)$/, directionSize('scroll-margin')],

  // scroll padding

  [/^scroll-pa?()-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([xy])-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([rltb])-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-(block|inline)-(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([bi][se])-?(.+)$/, directionSize('scroll-padding')],
]

function scrollbarPseudoVariant(pseudo: string): VariantHandler {
  return {
    handle: (input, next) => next({
      ...input,
      pseudo: `${input.pseudo}${pseudo}`,
      noMerge: true,
    }),
  }
}
