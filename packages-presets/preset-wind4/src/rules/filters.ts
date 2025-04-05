import type { CSSValueInput, CSSValues, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorableShadows, colorResolver, defineProperty, globalKeywords, h } from '../utils'

const filterBaseKeys = [
  'blur',
  'brightness',
  'contrast',
  'grayscale',
  'hue-rotate',
  'invert',
  'saturate',
  'sepia',
  'drop-shadow',
]
const filterProperties = filterBaseKeys.map(i => defineProperty(`--un-${i}`))
const filterCSS = filterBaseKeys.map(i => `var(--un-${i},)`).join(' ')

const backdropBaseKeys = [
  'backdrop-blur',
  'backdrop-brightness',
  'backdrop-contrast',
  'backdrop-grayscale',
  'backdrop-hue-rotate',
  'backdrop-invert',
  'backdrop-opacity',
  'backdrop-saturate',
  'backdrop-sepia',
]
const backdropProperties = backdropBaseKeys.map(i => defineProperty(`--un-${i}`))
const backdropCSS = backdropBaseKeys.map(i => `var(--un-${i},)`).join(' ')

function percentWithDefault(str?: string) {
  let v = h.bracket.cssvar(str || '')
  if (v != null)
    return v

  v = str ? h.percent(str) : '100%'
  if (v != null && Number.parseFloat(v.slice(0, -1)) <= 100)
    return v
}

function toFilter(varName: string, resolver: (str: string, theme: Theme) => string | undefined) {
  return ([, b, s]: string[], { theme }: RuleContext<Theme>): CSSValues | (CSSValueInput | string)[] | undefined => {
    const value = resolver(s, theme) ?? (s === 'none' ? '0' : '')
    if (value !== '') {
      if (b) {
        return [
          {
            [`--un-${b}${varName}`]: `${varName}(${value})`,
            '-webkit-backdrop-filter': backdropCSS,
            'backdrop-filter': backdropCSS,
          },
          ...backdropProperties,
        ]
      }
      else {
        return [
          {
            [`--un-${varName}`]: `${varName}(${value})`,
            filter: filterCSS,
          },
          ...filterProperties,
        ]
      }
    }
  }
}

function dropShadowResolver([, s]: string[], { theme }: RuleContext<Theme>) {
  let v = theme.dropShadow?.[s || 'DEFAULT']
  if (v != null) {
    const shadows = colorableShadows(v, '--un-drop-shadow-color')
    return [
      {
        '--un-drop-shadow': `drop-shadow(${shadows.join(') drop-shadow(')})`,
        'filter': filterCSS,
      },
      ...filterProperties,
    ]
  }

  v = h.bracket.cssvar(s) ?? (s === 'none' ? '' : undefined)
  if (v != null) {
    return [
      {
        '--un-drop-shadow': v ? `drop-shadow(${v})` : v,
        'filter': filterCSS,
      },
      ...filterProperties,
    ]
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
  [/^(?:filter-)?drop-shadow-color-(.+)$/, colorResolver('--un-drop-shadow-color', 'drop-shadow')],
  [/^(?:filter-)?drop-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-drop-shadow-opacity': h.bracket.percent(opacity) })],
  [/^(?:(backdrop-)|filter-)?grayscale(?:-(.+))?$/, toFilter('grayscale', percentWithDefault), { autocomplete: ['(backdrop|filter)-grayscale', '(backdrop|filter)-grayscale-<percent>', 'grayscale-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?hue-rotate-(.+)$/, toFilter('hue-rotate', s => h.bracket.cssvar.degree(s))],
  [/^(?:(backdrop-)|filter-)?invert(?:-(.+))?$/, toFilter('invert', percentWithDefault), { autocomplete: ['(backdrop|filter)-invert', '(backdrop|filter)-invert-<percent>', 'invert-<percent>'] }],
  // opacity only on backdrop-filter
  [/^(backdrop-)op(?:acity)?-(.+)$/, toFilter('opacity', s => h.bracket.cssvar.percent(s)), { autocomplete: ['backdrop-(op|opacity)', 'backdrop-(op|opacity)-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?saturate-(.+)$/, toFilter('saturate', s => h.bracket.cssvar.percent(s)), { autocomplete: ['(backdrop|filter)-saturate', '(backdrop|filter)-saturate-<percent>', 'saturate-<percent>'] }],
  [/^(?:(backdrop-)|filter-)?sepia(?:-(.+))?$/, toFilter('sepia', percentWithDefault), { autocomplete: ['(backdrop|filter)-sepia', '(backdrop|filter)-sepia-<percent>', 'sepia-<percent>'] }],

  // base
  ['filter', { filter: filterCSS }],
  ['backdrop-filter', {
    '-webkit-backdrop-filter': backdropCSS,
    'backdrop-filter': backdropCSS,
  }],

  // nones
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter-none', {
    '-webkit-backdrop-filter': 'none',
    'backdrop-filter': 'none',
  }],

  ...globalKeywords.map(keyword => [`filter-${keyword}`, { filter: keyword }] as Rule<Theme>),
  ...globalKeywords.map(keyword => [`backdrop-filter-${keyword}`, {
    '-webkit-backdrop-filter': keyword,
    'backdrop-filter': keyword,
  }] as Rule<Theme>),
]
