import type { CSSValues, PresetOptions, Rule } from '@unocss/core'
import { cacheFunction } from '@unocss/core'
import { handler as h, xyzMap } from '../utils'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '../variants/pseudo'

const transformGpu = cacheFunction((p: string) => ({
  transform: `rotate(var(--${p}rotate)) scaleX(var(--${p}scale-x)) scaleY(var(--${p}scale-y)) scaleZ(var(--${p}scale-z)) skewX(var(--${p}skew-x)) skewY(var(--${p}skew-y)) translate3d(var(--${p}translate-x), var(--${p}translate-y), var(--${p}translate-z))`,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}))

const transformCpu = cacheFunction((p: string) => ({
  transform: `rotate(var(--${p}rotate)) scaleX(var(--${p}scale-x)) scaleY(var(--${p}scale-y)) scaleZ(var(--${p}scale-z)) skewX(var(--${p}skew-x)) skewY(var(--${p}skew-y)) translateX(var(--${p}translate-x)) translateY(var(--${p}translate-y)) translateZ(var(--${p}translate-z))`,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}))

const transformBase = cacheFunction((p: string) => ({
  [`--${p}rotate`]: 0,
  [`--${p}scale-x`]: 1,
  [`--${p}scale-y`]: 1,
  [`--${p}scale-z`]: 1,
  [`--${p}skew-x`]: 0,
  [`--${p}skew-y`]: 0,
  [`--${p}translate-x`]: 0,
  [`--${p}translate-y`]: 0,
  [`--${p}translate-z`]: 0,
  ...transformCpu(p),
}))

export const transforms: Rule[] = [
  [/^transform$/, (_, ctx) => transformBase(ctx.options.variablePrefix)],
  [/^preserve-(3d|flat)$/, ([, value]) => ({ 'transform-style': value === '3d' ? `preserve-${value}` : value })],
  [/^translate()-(.+)$/, handleTranslate],
  [/^translate-([xyz])-(.+)$/, handleTranslate],
  [/^scale()-(.+)$/, handleScale],
  [/^scale-([xyz])-(.+)$/, handleScale],
  [/^rotate-(.+)$/, handleRotate],
  [/^rotate-((?!\[)[^-]+?)(?:deg)?$/, handleRotateWithUnit],
  [/^skew-([xy])-(.+)$/, handleSkew],
  [/^skew-([xy])-((?!\[)[^-]+?)(?:deg)?$/, handleSkewWithUnit],
  [/^transform-gpu$/, (_, ctx) => transformGpu(ctx.options.variablePrefix)],
  [/^transform-cpu$/, (_, ctx) => transformCpu(ctx.options.variablePrefix)],
  ['transform-none', { transform: 'none' }],

  // transform origins
  ['origin-center', { 'transform-origin': 'center' }],
  ['origin-top', { 'transform-origin': 'top' }],
  ['origin-top-right', { 'transform-origin': 'top right' }],
  ['origin-right', { 'transform-origin': 'right' }],
  ['origin-bottom-right', { 'transform-origin': 'bottom right' }],
  ['origin-bottom', { 'transform-origin': 'bottom' }],
  ['origin-bottom-left', { 'transform-origin': 'bottom left' }],
  ['origin-left', { 'transform-origin': 'left' }],
  ['origin-top-left', { 'transform-origin': 'top left' }],
]

function handleTranslate([, d, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket.fraction.auto.rem(b)
  if (v != null) {
    return [
      transformBase(p),
      [
        ...xyzMap[d].map((i): [string, string] => [`--${p}translate${i}`, v]),
      ],
    ]
  }
}

function handleScale([, d, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket.fraction.percent(b)
  if (v != null) {
    return [
      transformBase(p),
      [
        ...xyzMap[d].map((i): [string, string] => [`--${p}scale${i}`, v]),
      ],
    ]
  }
}

function handleRotateWithUnit([, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket.number(b)
  if (v != null) {
    return [
      transformBase(p),
      { [`--${p}rotate`]: `${v}deg` },
    ]
  }
}

function handleRotate([, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket(b)
  if (v != null) {
    return [
      transformBase(p),
      { [`--${p}rotate`]: v },
    ]
  }
}

function handleSkewWithUnit([, d, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket.number(b)
  if (v != null) {
    return [
      transformBase(p),
      { [`--${p}skew-${d}`]: `${v}deg` },
    ]
  }
}

function handleSkew([, d, b]: string[], { options: { variablePrefix: p } }: PresetOptions): CSSValues | undefined {
  const v = h.bracket(b)
  if (v != null) {
    return [
      transformBase(p),
      { [`--${p}skew-${d}`]: v },
    ]
  }
}
