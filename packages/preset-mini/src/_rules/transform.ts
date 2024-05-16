import type { CSSValues, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { h, makeGlobalStaticRules, positionMap, transformXYZ } from '../utils'

const transformValues = [
  'translate',
  'rotate',
  'scale',
]

const transformCpu = [
  'translateX(var(--un-translate-x))',
  'translateY(var(--un-translate-y))',
  // 'translateZ(var(--un-translate-z))',
  'rotate(var(--un-rotate))',
  // 'rotateX(var(--un-rotate-x))',
  // 'rotateY(var(--un-rotate-y))',
  'rotateZ(var(--un-rotate-z))',
  'skewX(var(--un-skew-x))',
  'skewY(var(--un-skew-y))',
  'scaleX(var(--un-scale-x))',
  'scaleY(var(--un-scale-y))',
  // 'scaleZ(var(--un-scale-z))',
].join(' ')

const transform = [
  'translateX(var(--un-translate-x))',
  'translateY(var(--un-translate-y))',
  'translateZ(var(--un-translate-z))',
  'rotate(var(--un-rotate))',
  'rotateX(var(--un-rotate-x))',
  'rotateY(var(--un-rotate-y))',
  'rotateZ(var(--un-rotate-z))',
  'skewX(var(--un-skew-x))',
  'skewY(var(--un-skew-y))',
  'scaleX(var(--un-scale-x))',
  'scaleY(var(--un-scale-y))',
  'scaleZ(var(--un-scale-z))',
].join(' ')

const transformGpu = [
  'translate3d(var(--un-translate-x), var(--un-translate-y), var(--un-translate-z))',
  'rotate(var(--un-rotate))',
  'rotateX(var(--un-rotate-x))',
  'rotateY(var(--un-rotate-y))',
  'rotateZ(var(--un-rotate-z))',
  'skewX(var(--un-skew-x))',
  'skewY(var(--un-skew-y))',
  'scaleX(var(--un-scale-x))',
  'scaleY(var(--un-scale-y))',
  'scaleZ(var(--un-scale-z))',
].join(' ')

export const transformBase = {
  // transform
  '--un-rotate': 0,
  '--un-rotate-x': 0,
  '--un-rotate-y': 0,
  '--un-rotate-z': 0,
  '--un-scale-x': 1,
  '--un-scale-y': 1,
  '--un-scale-z': 1,
  '--un-skew-x': 0,
  '--un-skew-y': 0,
  '--un-translate-x': 0,
  '--un-translate-y': 0,
  '--un-translate-z': 0,
}

export const transforms: Rule[] = [
  // origins
  [/^(?:transform-)?origin-(.+)$/, ([, s]) => ({ 'transform-origin': positionMap[s] ?? h.bracket.cssvar(s) }), { autocomplete: [`transform-origin-(${Object.keys(positionMap).join('|')})`, `origin-(${Object.keys(positionMap).join('|')})`] }],

  // perspectives
  [/^(?:transform-)?perspect(?:ive)?-(.+)$/, ([, s]) => {
    const v = h.bracket.cssvar.px.numberWithUnit(s)
    if (v != null) {
      return {
        '-webkit-perspective': v,
        'perspective': v,
      }
    }
  }],

  // skip 1 & 2 letters shortcut
  [/^(?:transform-)?perspect(?:ive)?-origin-(.+)$/, ([, s]) => {
    const v = h.bracket.cssvar(s) ?? (s.length >= 3 ? positionMap[s] : undefined)
    if (v != null) {
      return {
        '-webkit-perspective-origin': v,
        'perspective-origin': v,
      }
    }
  }],

  // modifiers
  [/^(?:transform-)?translate-()(.+)$/, handleTranslate],
  [/^(?:transform-)?translate-([xyz])-(.+)$/, handleTranslate],
  [/^(?:transform-)?rotate-()(.+)$/, handleRotate],
  [/^(?:transform-)?rotate-([xyz])-(.+)$/, handleRotate],
  [/^(?:transform-)?skew-()(.+)$/, handleSkew],
  [/^(?:transform-)?skew-([xy])-(.+)$/, handleSkew, { autocomplete: ['transform-skew-(x|y)-<percent>', 'skew-(x|y)-<percent>'] }],
  [/^(?:transform-)?scale-()(.+)$/, handleScale],
  [/^(?:transform-)?scale-([xyz])-(.+)$/, handleScale, { autocomplete: [`transform-(${transformValues.join('|')})-<percent>`, `transform-(${transformValues.join('|')})-(x|y|z)-<percent>`, `(${transformValues.join('|')})-<percent>`, `(${transformValues.join('|')})-(x|y|z)-<percent>`] }],

  // style
  [/^(?:transform-)?preserve-3d$/, () => ({ 'transform-style': 'preserve-3d' })],
  [/^(?:transform-)?preserve-flat$/, () => ({ 'transform-style': 'flat' })],

  // base
  ['transform', { transform }],
  ['transform-cpu', { transform: transformCpu }],
  ['transform-gpu', { transform: transformGpu }],
  ['transform-none', { transform: 'none' }],
  ...makeGlobalStaticRules('transform'),
]

function handleTranslate([, d, b]: string[], { theme }: RuleContext<Theme>): CSSValues | undefined {
  const v = theme.spacing?.[b] ?? h.bracket.cssvar.fraction.rem(b)
  if (v != null) {
    return [
      ...transformXYZ(d, v, 'translate'),
      ['transform', transform],
    ]
  }
}

function handleScale([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.fraction.percent(b)
  if (v != null) {
    return [
      ...transformXYZ(d, v, 'scale'),
      ['transform', transform],
    ]
  }
}

function handleRotate([, d = '', b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.degree(b)
  if (v != null) {
    if (d) {
      return {
        '--un-rotate': 0,
        [`--un-rotate-${d}`]: v,
        'transform': transform,
      }
    }
    else {
      return {
        '--un-rotate-x': 0,
        '--un-rotate-y': 0,
        '--un-rotate-z': 0,
        '--un-rotate': v,
        'transform': transform,
      }
    }
  }
}

function handleSkew([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.degree(b)
  if (v != null) {
    return [
      ...transformXYZ(d, v, 'skew'),
      ['transform', transform],
    ]
  }
}
