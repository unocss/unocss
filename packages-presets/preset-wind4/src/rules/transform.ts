import type { CSSValues, Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h, makeGlobalStaticRules, numberResolver, positionMap, transformXYZ, xyzMap } from '../utils'

const transformValues = [
  'translate',
  'rotate',
  'scale',
]

const transformCpu = [
  'var(--un-rotate-x)',
  'var(--un-rotate-y)',
  'var(--un-rotate-z)',
  'var(--un-skew-x)',
  'var(--un-skew-y)',
].join(' ')

const transform = transformCpu

const transformGpu = [
  'translateZ(0)',
  transformCpu,
].join(' ')

export const transformBase = {
  // transform
  '--un-rotate-x': 'rotateX(0)',
  '--un-rotate-y': 'rotateY(0)',
  '--un-rotate-z': 'rotateZ(0)',
  '--un-skew-x': 'skewX(0)',
  '--un-skew-y': 'skewY(0)',
  '--un-translate-x': 0,
  '--un-translate-y': 0,
  '--un-translate-z': 0,
}

export const transforms: Rule<Theme>[] = [
  // origins
  [
    /^(?:transform-)?origin-(.+)$/,
    ([, s]) => ({ 'transform-origin': positionMap[s] ?? h.bracket.cssvar(s) }),
    { autocomplete: [`transform-origin-(${Object.keys(positionMap).join('|')})`, `origin-(${Object.keys(positionMap).join('|')})`] },
  ],

  // perspectives
  [/^(?:transform-)?perspect(?:ive)?-(.+)$/, ([, s], { theme }) => {
    const v = theme.perspective?.[s] ?? h.bracket.cssvar.px.numberWithUnit(s)
    if (v != null) {
      return {
        perspective: s in (theme.perspective ?? {}) ? `var(--un-perspective-${s})` : v,
      }
    }
  }],

  // skip 1 & 2 letters shortcut
  [/^(?:transform-)?perspect(?:ive)?-origin-(.+)$/, ([, s]) => {
    const v = h.bracket.cssvar(s) ?? (s.length >= 3 ? positionMap[s] : undefined)
    if (v != null) {
      return {
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
  ['transform-3d', { 'transform-style': 'preserve-3d' }],
  ['transform-flat', { 'transform-style': 'flat' }],

  // transform-box
  [/^transform-(border|content|fill|stroke|view)$/, ([,d]) => ({ 'transform-box': `${d}-box` })],

  // base
  ['transform', { transform }],
  ['transform-cpu', { transform: transformCpu }],
  ['transform-gpu', { transform: transformGpu }],
  ['transform-none', { transform: 'none' }],
  ...makeGlobalStaticRules('transform'),
]

function handleTranslate([, d, b]: string[]): CSSValues | undefined {
  const v = numberResolver(b) ?? h.bracket.cssvar.none.rem(b)

  if (v != null) {
    if (v === 'none') {
      return {
        translate: 'none',
      }
    }

    return [
      ...transformXYZ(d, typeof v === 'number' ? `calc(var(--spacing) * ${v})` : v, 'translate'),
      ['translate', `var(--un-translate-x) var(--un-translate-y)${d === 'z' ? ' var(--un-translate-z)' : ''}`],
    ]
  }
}

function handleScale([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.none.fraction.percent(b)

  if (v != null) {
    if (v === 'none') {
      return {
        scale: 'none',
      }
    }

    return [
      ...transformXYZ(d, v, 'scale'),
      ['scale', `var(--un-scale-x) var(--un-scale-y)${d === 'z' ? ' var(--un-scale-z)' : ''}`],
    ]
  }
}

function handleRotate([, d = '', b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.none.degree(b)
  if (v != null) {
    if (v === 'none') {
      return {
        rotate: 'none',
      }
    }

    if (d) {
      return [
        ...transformXYZ(d, v.endsWith('deg') ? `rotate${d.toUpperCase()}(${v})` : v, 'rotate'),
        ['transform', transform],
      ]
    }
    else {
      return {
        rotate: h.bracket.cssvar.degree(b),
      }
    }
  }
}

function handleSkew([, d, b]: string[]): CSSValues | undefined {
  const v = h.bracket.cssvar.degree(b)
  const ds = xyzMap[d]
  if (v != null && ds) {
    return [
      ...ds.map(_d => [`--un-skew${_d}`, v.endsWith('deg') ? `skew${_d.slice(1).toUpperCase()}(${v})` : v]) as any,
      ['transform', transform],
    ]
  }
}
