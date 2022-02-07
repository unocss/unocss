import type { CSSValues, Rule, RuleContext } from '@unocss/core'
import { CONTROL_SHORTCUT_NO_MERGE } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { colorResolver, colorableShadows, handler as h } from '@unocss/preset-mini/utils'
import { varEmpty } from '@unocss/preset-mini/rules'

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
  '--un-filter': 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia)',
  [CONTROL_SHORTCUT_NO_MERGE]: '',
}

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
  '--un-backdrop-filter': 'var(--un-backdrop-blur) var(--un-backdrop-brightness) var(--un-backdrop-contrast) var(--un-backdrop-grayscale) var(--un-backdrop-hue-rotate) var(--un-backdrop-invert) var(--un-backdrop-opacity) var(--un-backdrop-saturate) var(--un-backdrop-sepia)',
  [CONTROL_SHORTCUT_NO_MERGE]: '',
}

const percentWithDefault = (str?: string) => {
  let v = h.bracket.cssvar(str || '')
  if (v != null)
    return v

  v = str ? h.percent(str) : '1'
  if (v != null && parseFloat(v) <= 1)
    return v
}

const toFilter = (varName: string, resolver: (str: string, theme: Theme) => string | undefined) =>
  ([, b, s]: string[], { theme }: RuleContext<Theme>): CSSValues | undefined => {
    const value = resolver(s, theme) ?? (s === 'none' ? '0' : '')
    if (value !== '') {
      if (b) {
        return [
          backdropFilterBase,
          {
            [`--un-${b}${varName}`]: `${varName}(${value})`,
            '-webkit-backdrop-filter': 'var(--un-backdrop-filter)',
            'backdrop-filter': 'var(--un-backdrop-filter)',
          },
        ]
      }
      else {
        return [
          filterBase,
          {
            [`--un-${varName}`]: `${varName}(${value})`,
            filter: 'var(--un-filter)',
          },
        ]
      }
    }
  }

const dropShadowResolver = ([, s]: string[], { theme }: RuleContext<Theme>) => {
  let v = theme.dropShadow?.[s || 'DEFAULT']
  if (v != null) {
    const shadows = colorableShadows(v, '--un-drop-shadow-color')
    return [
      filterBase,
      {
        '--un-drop-shadow': `drop-shadow(${shadows.join(') drop-shadow(')})`,
        'filter': 'var(--un-filter)',
      },
    ]
  }

  v = h.bracket.cssvar(s)
  if (v != null) {
    return [
      filterBase,
      {
        '--un-drop-shadow': `drop-shadow(${v})`,
        'filter': 'var(--un-filter)',
      },
    ]
  }
}

export const filters: Rule<Theme>[] = [
  // filters
  [/^(?:(backdrop-)|filter-)?blur(?:-(.+))?$/, toFilter('blur', (s, theme) => theme.blur?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s))],
  [/^(?:(backdrop-)|filter-)?brightness-(.+)$/, toFilter('brightness', s => h.bracket.cssvar.percent(s))],
  [/^(?:(backdrop-)|filter-)?contrast-(.+)$/, toFilter('contrast', s => h.bracket.cssvar.percent(s))],
  // drop-shadow only on filter
  [/^(?:filter-)?drop-shadow(?:-(.+))?$/, dropShadowResolver],
  [/^(?:filter-)?drop-shadow-color-(.+)$/, colorResolver('--un-drop-shadow-color', 'drop-shadow')],
  [/^(?:filter-)?drop-shadow-color-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-drop-shadow-opacity': h.bracket.percent(opacity) })],
  [/^(?:(backdrop-)|filter-)?grayscale(?:-(.+))?$/, toFilter('grayscale', percentWithDefault)],
  [/^(?:(backdrop-)|filter-)?hue-rotate-(.+)$/, toFilter('hue-rotate', s => h.bracket.cssvar.degree(s))],
  [/^(?:(backdrop-)|filter-)?invert(?:-(.+))?$/, toFilter('invert', percentWithDefault)],
  // opacity only on backdrop-filter
  [/^(backdrop-)opacity-(.+)$/, toFilter('opacity', s => h.bracket.cssvar.percent(s))],
  [/^(?:(backdrop-)|filter-)?saturate-(.+)$/, toFilter('saturate', s => h.bracket.cssvar.percent(s))],
  [/^(?:(backdrop-)|filter-)?sepia(?:-(.+))?$/, toFilter('sepia', percentWithDefault)],

  // base
  [/^filter$/, () => [
    filterBase,
    { filter: 'var(--un-filter)' },
  ]],
  [/^backdrop-filter$/, () => [
    backdropFilterBase,
    {
      '-webkit-backdrop-filter': 'var(--un-backdrop-filter)',
      'backdrop-filter': 'var(--un-backdrop-filter)',
    },
  ]],

  // nones
  ['filter-none', { filter: 'none' }],
  ['backdrop-filter-none', {
    '-webkit-backdrop-filter': 'none',
    'backdrop-filter': 'none',
  }],
]
