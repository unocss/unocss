import type { Rule, RuleContext, CSSValues } from '@unocss/core'
import { toArray } from '@unocss/core'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '@unocss/preset-mini/variants'
import type { Theme } from '@unocss/preset-mini'
import { handler as h } from '@unocss/preset-mini/utils'

const varEmpty = 'var(--un-empty,/*!*/ /*!*/)'
const filterContnet = 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia) var(--un-drop-shadow)'

const filterBase = {
  '--un-blur': varEmpty,
  '--un-brightness': varEmpty,
  '--un-contrast': varEmpty,
  '--un-grayscale': varEmpty,
  '--un-hue-rotate': varEmpty,
  '--un-invert': varEmpty,
  '--un-saturate': varEmpty,
  '--un-sepia': varEmpty,
  '--un-drop-shadow': varEmpty,
  'filter': filterContnet,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const backdropFilterContent = 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-saturate) var(--un-backdrop-sepia)'

const backdropFilterBase = {
  '--un-backdrop-blur': varEmpty,
  '--un-backdrop-brightness': varEmpty,
  '--un-backdrop-contrast': varEmpty,
  '--un-backdrop-grayscale': varEmpty,
  '--un-backdrop-hue-rotate': varEmpty,
  '--un-backdrop-invert': varEmpty,
  '--un-backdrop-saturate': varEmpty,
  '--un-backdrop-sepia': varEmpty,
  '-webkit-backdrop-filter': backdropFilterContent,
  'backdrop-filter': backdropFilterContent,
  [CONTROL_BYPASS_PSEUDO_CLASS]: '',
}

const percentWithDefault = (defaultValue = '1') => (str?: string) => {
  const v = str ? h.bracket.percent(str) : defaultValue
  return v && parseFloat(v) <= 1 ? v : undefined
}

const toFilter = (varName: string, resolver: (str: string, theme: Theme) => string | undefined) =>
  ([, b, s]: string[], { theme }: Readonly<RuleContext<Theme>>): CSSValues | undefined => {
    const value = resolver(s, theme)
    if (value) {
      return [
        b ? backdropFilterBase : filterBase,
        { [`--un-${b || ''}${varName}`]: `${varName}(${value})` },
      ]
    }
  }

export const filters: Rule<Theme>[] = [
  ['filter', filterBase],
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter', backdropFilterBase],
  ['backdrop-filter-none', {
    '-webkit-backdrop-filter': 'none',
    'backdrop-filter': 'none',
  }],
  [/^(backdrop-)?blur(?:-(.+))?$/, toFilter('blur', (s, theme) => theme.blur?.[s || 'DEFAULT'] || h.bracket.px(s))],
  [/^(backdrop-)?brightness-(\d+)$/, toFilter('brightness', s => h.bracket.percent(s))],
  [/^(backdrop-)?contrast-(\d+)$/, toFilter('contrast', s => h.bracket.percent(s))],
  [/^()?drop-shadow(?:-(.+))?$/, toFilter('drop-shadow', (s, theme) => {
    const v = h.bracket(s) || theme.dropShadow?.[s || 'DEFAULT']
    if (v)
      return toArray(v).map(v => `drop-shadow(${v})`).join(' ')
  })],
  [/^(backdrop-)?grayscale(?:-(\d+))?$/, toFilter('grayscale', percentWithDefault())],
  [/^(backdrop-)?hue-rotate-(\d+)$/, toFilter('hue-rotate', s => `${h.bracket.number(s)}deg`)],
  [/^(backdrop-)?invert(?:-(\d+))?$/, toFilter('invert', percentWithDefault())],
  [/^(backdrop-)?saturate(?:-(\d+))?$/, toFilter('saturate', percentWithDefault('0'))],
  [/^(backdrop-)?sepia(?:-(\d+))?$/, toFilter('sepia', percentWithDefault())],
]
