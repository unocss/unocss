import { Rule, toArray, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

const varEmpty = 'var(--un-empty,/*!*/ /*!*/)'

const persentWithDefault = (defaultValue = '1') => (str?: string) => {
  const v = str ? h.bracket.percent(str) : defaultValue
  return v && parseFloat(v) <= 1 ? v : undefined
}

const toFilter = (varName: string, resolver: (str: string, theme: Theme) => string | undefined) =>
  ([, b, s]: string[], { theme }: Readonly<RuleContext<Theme>>) => {
    const value = resolver(s, theme)
    if (value)
      return { [`--un-${b || ''}${varName}`]: `${varName}(${value})` }
  }

const filterContnet = 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia) var(--un-drop-shadow)'

const filter = {
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
}

const backdropFilterContent = 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-saturate) var(--un-backdrop-sepia)'

const backdropFilter = {
  '--un-backdrop-blur': varEmpty,
  '--un-backdrop-brightness': varEmpty,
  '--un-backdrop-contrast': varEmpty,
  '--un-backdrop-grayscale': varEmpty,
  '--un-backdrop-hue-rotate': varEmpty,
  '--un-backdrop-invert': varEmpty,
  '--un-backdrop-saturate': varEmpty,
  '--un-backdrop-sepia': varEmpty,
  '--un-backdrop-drop-shadow': varEmpty,
  '-webkit-backdrop-filter': backdropFilterContent,
  'filter': backdropFilterContent,
}

export const filters: Rule<Theme>[] = [
  ['filter', filter],
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter', backdropFilter],
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
  [/^(backdrop-)?grayscale(?:-(\d+))?$/, toFilter('grayscale', persentWithDefault())],
  [/^(backdrop-)?hue-rotate-(\d+)$/, toFilter('hue-rotate', s => `${h.bracket.number(s)}deg`)],
  [/^(backdrop-)?invert(?:-(\d+))?$/, toFilter('invert', persentWithDefault())],
  [/^(backdrop-)?saturate(?:-(\d+))?$/, toFilter('saturate', persentWithDefault('0'))],
  [/^(backdrop-)?sepia(?:-(\d+))?$/, toFilter('sepia', persentWithDefault())],
]
