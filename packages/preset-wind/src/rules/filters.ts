import type { CSSValues, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { colorResolver, colorableShadows, globalKeywords, h } from '@unocss/preset-mini/utils'
import { varEmpty } from '@unocss/preset-mini/rules'

export const filterBase = {
  '--un-blur': varEmpty,
  '--un-brightness': varEmpty,
  '--un-contrast': varEmpty,
  '--un-drop-shadow': varEmpty,
  '--un-grayscale': varEmpty,
  '--un-hue-rotate': varEmpty,
  '--un-invert': varEmpty,
  '--un-saturate': varEmpty,
  '--un-sepia': varEmpty,
}
const filterProperty = 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia)'

export const backdropFilterBase = {
  '--un-backdrop-blur': varEmpty,
  '--un-backdrop-brightness': varEmpty,
  '--un-backdrop-contrast': varEmpty,
  '--un-backdrop-grayscale': varEmpty,
  '--un-backdrop-hue-rotate': varEmpty,
  '--un-backdrop-invert': varEmpty,
  '--un-backdrop-opacity': varEmpty,
  '--un-backdrop-saturate': varEmpty,
  '--un-backdrop-sepia': varEmpty,
}
const backdropFilterProperty = 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-opacity) var(--un-backdrop-saturate) var(--un-backdrop-sepia)'

function percentWithDefault(str?: string) {
  let v = h.bracket.cssvar(str || '')
  if (v != null)
    return v

  v = str ? h.percent(str) : '1'
  if (v != null && Number.parseFloat(v) <= 1)
    return v
}

function toFilter(varName: string, resolver: (str: string, theme: Theme) => string | undefined) {
  return ([, b, s]: string[], { theme }: RuleContext<Theme>): CSSValues | undefined => {
    const value = resolver(s, theme) ?? (s === 'none' ? '0' : '')
    if (value !== '') {
      if (b) {
        return {
          [`--un-${b}${varName}`]: `${varName}(${value})`,
          '-webkit-backdrop-filter': backdropFilterProperty,
          'backdrop-filter': backdropFilterProperty,
        }
      }
      else {
        return {
          [`--un-${varName}`]: `${varName}(${value})`,
          filter: filterProperty,
        }
      }
    }
  }
}

function dropShadowResolver([, s]: string[], { theme }: RuleContext<Theme>) {
  let v = theme.dropShadow?.[s || 'DEFAULT']
  if (v != null) {
    const shadows = colorableShadows(v, '--un-drop-shadow-color')
    return {
      '--un-drop-shadow': `drop-shadow(${shadows.join(') drop-shadow(')})`,
      'filter': filterProperty,
    }
  }

  v = h.bracket.cssvar(s)
  if (v != null) {
    return {
      '--un-drop-shadow': `drop-shadow(${v})`,
      'filter': filterProperty,
    }
  }
}

export const filters: Rule<Theme>[] = [
  // filters
  [/^(?:(backdrop-)|filter-)?blur(?:-(.+))?$/, toFilter('blur', (s, theme) => theme.blur?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s)), { autocomplete: ['(backdrop|filter)-blur-$blur', 'blur-$blur', 'filter-blur'] }],
  [/^(?:(backdrop-)|filter-)?brightness-(.+)$/, toFilter('brightness', s => h.bracket.cssvar.percent(s)), { autocomplete: ['(backdrop|filter)-brightness-<percent>', 'brightness-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?contrast-(.+)$/, toFilter('contrast', s => h.bracket.cssvar.percent(s)), { autocomplete: ['(backdrop|filter)-contrast-<percent>', 'contrast-<percent>'] }],
  // drop-shadow only on filter
  [/^(?:filter-)?drop-shadow(?:-(.+))?$/, dropShadowResolver, {
    autocomplete: [
      'filter-drop',
      'filter-drop-shadow',
      'filter-drop-shadow-color',
      'drop-shadow',
      'drop-shadow-color',
      'filter-drop-shadow-$dropShadow',
      'drop-shadow-$dropShadow',
      'filter-drop-shadow-color-$colors',
      'drop-shadow-color-$colors',
      'filter-drop-shadow-color-(op|opacity)',
      'drop-shadow-color-(op|opacity)',
      'filter-drop-shadow-color-(op|opacity)-<percent>',
      'drop-shadow-color-(op|opacity)-<percent>',
    ],
  }],
  [/^(?:filter-)?drop-shadow-color-(.+)$/, colorResolver('--un-drop-shadow-color', 'drop-shadow', 'shadowColor')],
  [/^(?:filter-)?drop-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-drop-shadow-opacity': h.bracket.percent(opacity) })],
  [/^(?:(backdrop-)|filter-)?grayscale(?:-(.+))?$/, toFilter('grayscale', percentWithDefault), { autocomplete: ['(backdrop|filter)-grayscale', '(backdrop|filter)-grayscale-<percent>', 'grayscale-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?hue-rotate-(.+)$/, toFilter('hue-rotate', s => h.bracket.cssvar.degree(s))],
  [/^(?:(backdrop-)|filter-)?invert(?:-(.+))?$/, toFilter('invert', percentWithDefault), { autocomplete: ['(backdrop|filter)-invert', '(backdrop|filter)-invert-<percent>', 'invert-<percent>'] }],
  // opacity only on backdrop-filter
  [/^(backdrop-)op(?:acity)?-(.+)$/, toFilter('opacity', s => h.bracket.cssvar.percent(s)), { autocomplete: ['backdrop-(op|opacity)', 'backdrop-(op|opacity)-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?saturate-(.+)$/, toFilter('saturate', s => h.bracket.cssvar.percent(s)), { autocomplete: ['(backdrop|filter)-saturate', '(backdrop|filter)-saturate-<percent>', 'saturate-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?sepia(?:-(.+))?$/, toFilter('sepia', percentWithDefault), { autocomplete: ['(backdrop|filter)-sepia', '(backdrop|filter)-sepia-<percent>', 'sepia-<percent>'] }],

  // base
  ['filter', { filter: filterProperty }],
  ['backdrop-filter', {
    '-webkit-backdrop-filter': backdropFilterProperty,
    'backdrop-filter': backdropFilterProperty,
  }],

  // nones
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter-none', {
    '-webkit-backdrop-filter': 'none',
    'backdrop-filter': 'none',
  }],

  ...globalKeywords.map(keyword => [`filter-${keyword}`, { filter: keyword }] as Rule),
  ...globalKeywords.map(keyword => [`backdrop-filter-${keyword}`, {
    '-webkit-backdrop-filter': keyword,
    'backdrop-filter': keyword,
  }] as Rule),
]
