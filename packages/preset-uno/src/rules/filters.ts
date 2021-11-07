import { Rule, toArray, RuleContext } from 'unocss'
import { Theme } from '../theme'
import { handler as h } from '../utils'

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
  '--un-blur': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-brightness': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-contrast': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-grayscale': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-hue-rotate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-invert': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-saturate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-sepia': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-drop-shadow': 'var(--un-empty,/*!*/ /*!*/)',
  'filter': filterContnet,
}

const backdropFilterContent = 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-saturate) var(--un-backdrop-sepia)'

const backdropFilter = {
  '--un-backdrop-blur': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-brightness': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-contrast': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-grayscale': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-hue-rotate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-invert': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-saturate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-sepia': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-backdrop-drop-shadow': 'var(--un-empty,/*!*/ /*!*/)',
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
