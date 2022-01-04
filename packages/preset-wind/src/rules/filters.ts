import type { CSSValues, Rule, RuleContext } from '@unocss/core'
import { toArray } from '@unocss/core'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '@unocss/preset-mini/variants'
import type { Theme } from '@unocss/preset-mini'
import { handler as h } from '@unocss/preset-mini/utils'
import { varEmpty } from '@unocss/preset-mini/rules'

const filterContnet = 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia)'

const filterBase = {
  '--un-blur': varEmpty,
  '--un-brightness': varEmpty,
  '--un-contrast': varEmpty,
  '--un-drop-shadow': varEmpty,
  '--un-grayscale': varEmpty,
  '--un-hue-rotate': varEmpty,
  '--un-invert': varEmpty,
  '--un-saturate': varEmpty,
  '--un-sepia': varEmpty,
  'filter': filterContnet,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const backdropFilterContent = 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-opacity) var(--un-backdrop-saturate) var(--un-backdrop-sepia)'

const backdropFilterBase = {
  '--un-backdrop-blur': varEmpty,
  '--un-backdrop-brightness': varEmpty,
  '--un-backdrop-contrast': varEmpty,
  '--un-backdrop-grayscale': varEmpty,
  '--un-backdrop-hue-rotate': varEmpty,
  '--un-backdrop-invert': varEmpty,
  '--un-backdrop-opacity': varEmpty,
  '--un-backdrop-saturate': varEmpty,
  '--un-backdrop-sepia': varEmpty,
  '-webkit-backdrop-filter': backdropFilterContent,
  'backdrop-filter': backdropFilterContent,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const percentWithDefault = (str?: string) => {
  let v = h.bracket(str || '')
  if (v != null)
    return v

  v = str ? h.percent(str) : '1'
  if (v != null && parseFloat(v) <= 1)
    return v
}

const toFilter = (varName: string, resolver: (str: string, theme: Theme) => string | undefined) =>
  ([, b, s]: string[], { theme }: RuleContext<Theme>): CSSValues | undefined => {
    const value = resolver(s, theme)
    if (value != null && value !== '') {
      return [
        b ? backdropFilterBase : filterBase,
        { [`--un-${b || ''}${varName}`]: `${varName}(${value})` },
      ]
    }
  }

export const filters: Rule<Theme>[] = [
  ['filter', filterBase],
  ['backdrop-filter', backdropFilterBase],

  // filters
  [/^(backdrop-)?blur(?:-(.+))?$/, toFilter('blur', (s, theme) => theme.blur?.[s || 'DEFAULT'] || h.bracket.px(s))],
  [/^(backdrop-)?brightness-(.+)$/, toFilter('brightness', s => h.bracket.percent(s))],
  [/^(backdrop-)?contrast-(.+)$/, toFilter('contrast', s => h.bracket.percent(s))],
  // drop-shadow only on filter
  [/^()?drop-shadow(?:-(.+))?$/, toFilter('drop-shadow', (s, theme) => {
    let v = theme.dropShadow?.[s || 'DEFAULT']
    if (v != null)
      return toArray(v).map(v => `drop-shadow(${v})`).join(' ')

    v = h.bracket(s)
    if (v != null)
      return `drop-shadow(${v})`
  })],
  [/^(backdrop-)?grayscale(?:-(.+))?$/, toFilter('grayscale', percentWithDefault)],
  [/^(backdrop-)?hue-rotate-(.+)$/, toFilter('hue-rotate', s => h.bracket.degree(s))],
  [/^(backdrop-)?invert(?:-(.+))?$/, toFilter('invert', percentWithDefault)],
  // opacity only on backdrop-filter
  [/^(backdrop-)opacity-(.+)$/, toFilter('opacity', s => h.bracket.percent(s))],
  [/^(backdrop-)?saturate-(.+)$/, toFilter('saturate', s => h.bracket.percent(s))],
  [/^(backdrop-)?sepia(?:-(.+))?$/, toFilter('sepia', percentWithDefault)],

  // nones
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter-none', {
    '-webkit-backdrop-filter': 'none',
    'backdrop-filter': 'none',
  }],
  [/^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia)-none$/, ([, s]) => ({ filter: `${s}(0)` })],
  [/^backdrop-(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)-none$/, ([, s]) => ({
    '-webkit-backdrop-filter': `${s}(0)`,
    'backdrop-filter': `${s}(0)`,
  })],
]
