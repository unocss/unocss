import type { CSSValues, Rule, RuleContext } from '@unocss/core'
import { CONTROL_SHORTCUT_NO_MERGE } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, positionMap, xyzMap } from '../utils'

const transformGpu = {
  '--un-transform': [
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
  ].join(' '),
}

const transformCpu = {
  '--un-transform': [
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
  ].join(' '),
}

const transformBase = {
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
  ...transformCpu,
  [CONTROL_SHORTCUT_NO_MERGE]: '',
}

export const transforms: Rule[] = [
  // origins
  [/^(?:transform-)?origin-(.+)$/, ([, s]) => ({ 'transform-origin': positionMap[s] ?? h.bracket.cssvar(s) })],

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
  [/^(?:transform-)?skew-([xy])-(.+)$/, handleSkew],
  [/^(?:transform-)?scale-()(.+)$/, handleScale],
  [/^(?:transform-)?scale-([xyz])-(.+)$/, handleScale],

  // style
  [/^(?:transform-)?preserve-3d$/, () => ({ 'transform-style': 'preserve-3d' })],
  [/^(?:transform-)?preserve-flat$/, () => ({ 'transform-style': 'flat' })],

  // base
  [/^transform$/, () => [
    transformBase,
    { transform: 'var(--un-transform)' },
  ]],
  ['transform-gpu', transformGpu],
  ['transform-cpu', transformCpu],
  ['transform-none', { transform: 'none' }],
]

function handleTranslate([, d, b]: string[], { theme }: RuleContext<Theme>): CSSValues | undefined {
  const v = theme.spacing?.[b] ?? h.bracket.cssvar.fraction.rem(b)
  if (v != null) {
    return [
      transformBase,
      [
        ...xyzMap[d].map((i): [string, string] => [`--un-translate${i}`, v]),
        ['transform', 'var(--un-transform)'],
      ],
    ]
  }
}

function handleScale([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.fraction.percent(b)
  if (v != null) {
    return [
      transformBase,
      [
        ...xyzMap[d].map((i): [string, string] => [`--un-scale${i}`, v]),
        ['transform', 'var(--un-transform)'],
      ],
    ]
  }
}

function handleRotate([, d = '', b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.degree(b)
  if (v != null) {
    if (d) {
      return [
        transformBase,
        {
          '--un-rotate': 0,
          [`--un-rotate-${d}`]: v,
          'transform': 'var(--un-transform)',
        },
      ]
    }
    else {
      return [
        transformBase,
        {
          '--un-rotate-x': 0,
          '--un-rotate-y': 0,
          '--un-rotate-z': 0,
          '--un-rotate': v,
          'transform': 'var(--un-transform)',
        },
      ]
    }
  }
}

function handleSkew([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.degree(b)
  if (v != null) {
    return [
      transformBase,
      {
        [`--un-skew-${d}`]: v,
        transform: 'var(--un-transform)',
      },
    ]
  }
}
