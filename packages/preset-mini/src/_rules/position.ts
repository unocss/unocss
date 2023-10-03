import type { CSSEntries, Rule, RuleContext, StaticRule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords, h, insetMap, makeGlobalStaticRules } from '../utils'

export const positions: Rule[] = [
  [/^(?:position-|pos-)?(relative|absolute|fixed|sticky)$/, ([, v]) => ({ position: v }), {
    autocomplete: [
      '(position|pos)-<position>',
      '(position|pos)-<globalKeyword>',
      '<position>',
    ],
  }],
  [/^(?:position-|pos-)([-\w]+)$/, ([, v]) => globalKeywords.includes(v) ? { position: v } : undefined],
  [/^(?:position-|pos-)?(static)$/, ([, v]) => ({ position: v })],
]

export const justifies: StaticRule[] = [
  // contents
  ['justify-start', { 'justify-content': 'flex-start' }],
  ['justify-end', { 'justify-content': 'flex-end' }],
  ['justify-center', { 'justify-content': 'center' }],
  ['justify-between', { 'justify-content': 'space-between' }],
  ['justify-around', { 'justify-content': 'space-around' }],
  ['justify-evenly', { 'justify-content': 'space-evenly' }],
  ['justify-stretch', { 'justify-content': 'stretch' }],
  ['justify-left', { 'justify-content': 'left' }],
  ['justify-right', { 'justify-content': 'right' }],
  ...makeGlobalStaticRules('justify', 'justify-content'),

  // items
  ['justify-items-start', { 'justify-items': 'start' }],
  ['justify-items-end', { 'justify-items': 'end' }],
  ['justify-items-center', { 'justify-items': 'center' }],
  ['justify-items-stretch', { 'justify-items': 'stretch' }],
  ...makeGlobalStaticRules('justify-items'),

  // selfs
  ['justify-self-auto', { 'justify-self': 'auto' }],
  ['justify-self-start', { 'justify-self': 'start' }],
  ['justify-self-end', { 'justify-self': 'end' }],
  ['justify-self-center', { 'justify-self': 'center' }],
  ['justify-self-stretch', { 'justify-self': 'stretch' }],
  ...makeGlobalStaticRules('justify-self'),
]

export const orders: Rule[] = [
  [/^order-(.+)$/, ([, v]) => ({ order: h.bracket.cssvar.number(v) })],
  ['order-first', { order: '-9999' }],
  ['order-last', { order: '9999' }],
  ['order-none', { order: '0' }],
]

export const alignments: StaticRule[] = [
  // contents
  ['content-center', { 'align-content': 'center' }],
  ['content-start', { 'align-content': 'flex-start' }],
  ['content-end', { 'align-content': 'flex-end' }],
  ['content-between', { 'align-content': 'space-between' }],
  ['content-around', { 'align-content': 'space-around' }],
  ['content-evenly', { 'align-content': 'space-evenly' }],
  ...makeGlobalStaticRules('content', 'align-content'),

  // items
  ['items-start', { 'align-items': 'flex-start' }],
  ['items-end', { 'align-items': 'flex-end' }],
  ['items-center', { 'align-items': 'center' }],
  ['items-baseline', { 'align-items': 'baseline' }],
  ['items-stretch', { 'align-items': 'stretch' }],
  ...makeGlobalStaticRules('items', 'align-items'),

  // selfs
  ['self-auto', { 'align-self': 'auto' }],
  ['self-start', { 'align-self': 'flex-start' }],
  ['self-end', { 'align-self': 'flex-end' }],
  ['self-center', { 'align-self': 'center' }],
  ['self-stretch', { 'align-self': 'stretch' }],
  ['self-baseline', { 'align-self': 'baseline' }],
  ...makeGlobalStaticRules('self', 'align-self'),
]

export const placements: Rule[] = [
  // contents
  ['place-content-center', { 'place-content': 'center' }],
  ['place-content-start', { 'place-content': 'start' }],
  ['place-content-end', { 'place-content': 'end' }],
  ['place-content-between', { 'place-content': 'space-between' }],
  ['place-content-around', { 'place-content': 'space-around' }],
  ['place-content-evenly', { 'place-content': 'space-evenly' }],
  ['place-content-stretch', { 'place-content': 'stretch' }],
  ...makeGlobalStaticRules('place-content'),

  // items
  ['place-items-start', { 'place-items': 'start' }],
  ['place-items-end', { 'place-items': 'end' }],
  ['place-items-center', { 'place-items': 'center' }],
  ['place-items-stretch', { 'place-items': 'stretch' }],
  ...makeGlobalStaticRules('place-items'),

  // selfs
  ['place-self-auto', { 'place-self': 'auto' }],
  ['place-self-start', { 'place-self': 'start' }],
  ['place-self-end', { 'place-self': 'end' }],
  ['place-self-center', { 'place-self': 'center' }],
  ['place-self-stretch', { 'place-self': 'stretch' }],
  ...makeGlobalStaticRules('place-self'),
]

/**
 * This is to add `flex-` and `grid-` prefix to the alignment rules,
 * supporting `flex="~ items-center"` in attributify mode.
 */
export const flexGridJustifiesAlignments = [...justifies, ...alignments]
  .flatMap(([k, v]): StaticRule[] => [
    [`flex-${k}`, v],
    [`grid-${k}`, v],
  ])

function handleInsetValue(v: string, { theme }: RuleContext<Theme>): string | number | undefined {
  return theme.spacing?.[v] ?? h.bracket.cssvar.global.auto.fraction.rem(v)
}

function handleInsetValues([, d, v]: string[], ctx: RuleContext): CSSEntries | undefined {
  const r = handleInsetValue(v, ctx)
  if (r != null && d in insetMap)
    return insetMap[d].map(i => [i.slice(1), r])
}

export const insets: Rule[] = [
  [
    /^(?:position-|pos-)?inset-(.+)$/,
    ([, v], ctx) => ({ inset: handleInsetValue(v, ctx) }),
    {
      autocomplete: [
        '(position|pos)-inset-<directions>-$spacing',
        '(position|pos)-inset-(block|inline)-$spacing',
        '(position|pos)-inset-(bs|be|is|ie)-$spacing',
        '(position|pos)-(top|left|right|bottom)-$spacing',
      ],
    },
  ],
  [/^(?:position-|pos-)?(start|end)-(.+)$/, handleInsetValues],
  [/^(?:position-|pos-)?inset-([xy])-(.+)$/, handleInsetValues],
  [/^(?:position-|pos-)?inset-([rltbse])-(.+)$/, handleInsetValues],
  [/^(?:position-|pos-)?inset-(block|inline)-(.+)$/, handleInsetValues],
  [/^(?:position-|pos-)?inset-([bi][se])-(.+)$/, handleInsetValues],
  [/^(?:position-|pos-)?(top|left|right|bottom)-(.+)$/, ([, d, v], ctx) => ({ [d]: handleInsetValue(v, ctx) })],
]

export const floats: Rule[] = [
  // floats
  ['float-left', { float: 'left' }],
  ['float-right', { float: 'right' }],
  ['float-none', { float: 'none' }],
  ...makeGlobalStaticRules('float'),

  // clears
  ['clear-left', { clear: 'left' }],
  ['clear-right', { clear: 'right' }],
  ['clear-both', { clear: 'both' }],
  ['clear-none', { clear: 'none' }],
  ...makeGlobalStaticRules('clear'),
]

export const zIndexes: Rule[] = [
  [/^(?:position-|pos-)?z([\d.]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
  [/^(?:position-|pos-)?z-(.+)$/, ([, v], { theme }: RuleContext<Theme>) => ({ 'z-index': theme.zIndex?.[v] ?? h.bracket.cssvar.global.auto.number(v) }), { autocomplete: 'z-<num>' }],
]

export const boxSizing: Rule[] = [
  ['box-border', { 'box-sizing': 'border-box' }],
  ['box-content', { 'box-sizing': 'content-box' }],
  ...makeGlobalStaticRules('box', 'box-sizing'),
]
