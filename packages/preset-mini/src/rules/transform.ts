import type { CSSValues, Rule } from '@unocss/core'
import { handler as h, positionMap, xyzMap } from '../utils'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '../variants/pseudo'

const transformGpu = {
  transform: 'rotate(var(--un-rotate)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) translate3d(var(--un-translate-x), var(--un-translate-y), var(--un-translate-z))',
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const transformCpu = {
  transform: 'rotate(var(--un-rotate)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z))',
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const transformBase = {
  '--un-rotate': 0,
  '--un-scale-x': 1,
  '--un-scale-y': 1,
  '--un-scale-z': 1,
  '--un-skew-x': 0,
  '--un-skew-y': 0,
  '--un-translate-x': 0,
  '--un-translate-y': 0,
  '--un-translate-z': 0,
  ...transformCpu,
}

export const transforms: Rule[] = [
  // base
  ['transform', transformBase],

  // origins
  // skip 1 & 2 letters shortcut
  [/^origin-([-\w]{3,})$/, ([, s]) => ({ 'transform-origin': positionMap[s] })],

  // modifiers
  [/^translate-()(.+)$/, handleTranslate],
  [/^translate-([xyz])-(.+)$/, handleTranslate],
  [/^rotate-(.+)$/, handleRotate],
  [/^skew-()(.+)$/, handleSkew],
  [/^skew-([xy])-(.+)$/, handleSkew],
  [/^scale-()(.+)$/, handleScale],
  [/^scale-([xyz])-(.+)$/, handleScale],

  // style
  ['preserve-3d', { 'transform-style': 'preserve-3d' }],
  ['preserve-flat', { 'transform-style': 'flat' }],
  ['transform-gpu', transformGpu],
  ['transform-cpu', transformCpu],
  ['transform-none', { transform: 'none' }],
]

function handleTranslate([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.fraction.auto.rem(b)
  if (v != null) {
    return [
      transformBase,
      xyzMap[d].map((i): [string, string] => [`--un-translate${i}`, v]),
    ]
  }
}

function handleScale([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.fraction.percent(b)
  if (v != null) {
    return [
      transformBase,
      xyzMap[d].map((i): [string, string] => [`--un-scale${i}`, v]),
    ]
  }
}

function handleRotate([, b]: string[]): CSSValues | undefined {
  const v = h.bracket.degree(b)
  if (v != null) {
    return [
      transformBase,
      { '--un-rotate': v },
    ]
  }
}

function handleSkew([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.degree(b)
  if (v != null) {
    return [
      transformBase,
      { [`--un-skew-${d}`]: v },
    ]
  }
}
