import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, detectThemeValue, generateThemeVariable, globalKeywords, h, makeGlobalStaticRules, parseColor, positionMap, SpecialColorKey, themeTracking } from '../utils'

const properties = {
  'gradient-position': defineProperty('--un-gradient-position'),
  'gradient-from': defineProperty('--un-gradient-from', { syntax: '<color>', initialValue: '#0000' }),
  'gradient-via': defineProperty('--un-gradient-via', { syntax: '<color>', initialValue: '#0000' }),
  'gradient-to': defineProperty('--un-gradient-to', { syntax: '<color>', initialValue: '#0000' }),
  'gradient-stops': defineProperty('--un-gradient-stops'),
  'gradient-via-stops': defineProperty('--un-gradient-via-stops'),
  'gradient-from-position': defineProperty('--un-gradient-from-position', { syntax: '<length-percentage>', initialValue: '0%' }),
  'gradient-via-position': defineProperty('--un-gradient-via-position', { syntax: '<length-percentage>', initialValue: '50%' }),
  'gradient-to-position': defineProperty('--un-gradient-to-position', { syntax: '<length-percentage>', initialValue: '100%' }),
}

function resolveModifier(modifier?: string) {
  let interpolationMethod = 'in oklab'

  if (modifier) {
    if (modifier.startsWith('[') && modifier.endsWith(']')) {
      interpolationMethod = modifier.slice(1, -1)
    }
    else {
      switch (modifier) {
        case 'longer':
        case 'shorter':
        case 'increasing':
        case 'decreasing':
          interpolationMethod = `in oklch ${modifier} hue`
          break
        default:
          interpolationMethod = `in ${modifier}`
      }
    }
  }

  return interpolationMethod
}

function bgGradientColorResolver() {
  return function* ([, position, body]: string[], { theme }: RuleContext<Theme>) {
    const css: CSSObject = {}
    const data = parseColor(body, theme)

    if (data) {
      const { color, keys, alpha } = data

      if (color) {
        if (Object.values(SpecialColorKey).includes(color)) {
          css[`--un-gradient-${position}`] = color
        }
        else {
          css[`--un-${position}-opacity`] = alpha
          const value = keys ? generateThemeVariable('colors', keys) : color
          css[`--un-gradient-${position}`] = `color-mix(in oklab, ${value} var(--un-${position}-opacity), transparent)`

          yield defineProperty(`--un-${position}-opacity`, { syntax: '<percentage>', initialValue: '100%' })
        }

        if (keys) {
          themeTracking(`colors`, keys)
        }
        if (theme) {
          detectThemeValue(color, theme)
        }
      }
    }
    else {
      css[`--un-gradient-${position}`] = h.bracket.cssvar(body)
    }

    if (css[`--un-gradient-${position}`]) {
      switch (position) {
        case 'from':
          yield {
            ...css,
            '--un-gradient-stops': 'var(--un-gradient-via-stops, var(--un-gradient-position), var(--un-gradient-from) var(--un-gradient-from-position), var(--un-gradient-to) var(--un-gradient-to-position))',
          }
          break
        case 'via':
          yield {
            ...css,
            '--un-gradient-via-stops': `var(--un-gradient-position), var(--un-gradient-from) var(--un-gradient-from-position), var(--un-gradient-via) var(--un-gradient-via-position), var(--un-gradient-to) var(--un-gradient-to-position)`,
            '--un-gradient-stops': `var(--un-gradient-via-stops)`,
          }
          break
        case 'to':
          yield {
            ...css,
            '--un-gradient-stops': 'var(--un-gradient-via-stops, var(--un-gradient-position), var(--un-gradient-from) var(--un-gradient-from-position), var(--un-gradient-to) var(--un-gradient-to-position))',
          }
          break
        case 'stops':
          yield {
            ...css,
          }
          break
      }
      for (const p of Object.values(properties))
        yield p
    }
  }
}

function bgGradientPositionResolver() {
  return function* ([, mode, body]: string[]) {
    yield {
      [`--un-gradient-${mode}-position`]: `${h.bracket.cssvar.percent(body)}`,
    }
    for (const p of Object.values(properties))
      yield p
  }
}

export const backgroundStyles: Rule<Theme>[] = [
  // gradients
  [/^bg-(linear|radial|conic)-([^/]+)(?:\/(.+))?$/, ([, m, d, s]) => {
    let v

    if (h.number(d) != null) {
      v = `from ${h.number(d)}deg ${resolveModifier(s)};`
    }
    else {
      v = h.bracket(d)
    }

    if (v) {
      return {
        '--un-gradient-position': v,
        'background-image': `${m}-gradient(var(--un-gradient-stops))`,
      }
    }
  }, {
    autocomplete: ['bg-(linear|radial|conic)', '(from|to|via)-$colors', '(from|to|via)-(op|opacity)', '(from|to|via)-(op|opacity)-<percent>'],
  }],

  [/^(from|via|to|stops)-(.+)$/, bgGradientColorResolver()],
  [/^(from|via|to)-op(?:acity)?-?(.+)$/, ([, position, opacity]) => ({ [`--un-${position}-opacity`]: h.bracket.percent(opacity) })],
  [/^(from|via|to)-([\d.]+%)$/, bgGradientPositionResolver()],
  // images
  [/^bg-((?:repeating-)?(?:linear|radial|conic))$/, ([, s]) => ({
    'background-image': `${s}-gradient(var(--un-gradient, var(--un-gradient-stops, rgb(255 255 255 / 0))))`,
  }), { autocomplete: ['bg-gradient-repeating', 'bg-gradient-(linear|radial|conic)', 'bg-gradient-repeating-(linear|radial|conic)'] }],
  // ignore any center position
  [/^bg-(linear|radial|conic)(?:-to-([rltb]{1,2}))?(?:\/(.+))?$/, ([, m, d, s]) => {
    return {
      '--un-gradient-position': `${d in positionMap ? `to ${positionMap[d]} ` : ' '}${resolveModifier(s)}`,
      'background-image': `${m}-gradient(var(--un-gradient-stops))`,
    }
  }, { autocomplete: `bg-gradient-to-(${Object.keys(positionMap).filter(k => k.length <= 2 && Array.from(k).every(c => 'rltb'.includes(c))).join('|')})` }],
  ['bg-none', { 'background-image': 'none' }],

  ['box-decoration-slice', { 'box-decoration-break': 'slice' }],
  ['box-decoration-clone', { 'box-decoration-break': 'clone' }],
  ...makeGlobalStaticRules('box-decoration', 'box-decoration-break'),

  // size
  ['bg-auto', { 'background-size': 'auto' }],
  ['bg-cover', { 'background-size': 'cover' }],
  ['bg-contain', { 'background-size': 'contain' }],

  // attachments
  ['bg-fixed', { 'background-attachment': 'fixed' }],
  ['bg-local', { 'background-attachment': 'local' }],
  ['bg-scroll', { 'background-attachment': 'scroll' }],

  // clips
  ['bg-clip-border', { '-webkit-background-clip': 'border-box', 'background-clip': 'border-box' }],
  ['bg-clip-content', { '-webkit-background-clip': 'content-box', 'background-clip': 'content-box' }],
  ['bg-clip-padding', { '-webkit-background-clip': 'padding-box', 'background-clip': 'padding-box' }],
  ['bg-clip-text', { '-webkit-background-clip': 'text', 'background-clip': 'text' }],
  ...globalKeywords.map(keyword => [`bg-clip-${keyword}`, {
    '-webkit-background-clip': keyword,
    'background-clip': keyword,
  }] as Rule<Theme>),

  // positions
  // skip 1 & 2 letters shortcut
  [/^bg-([-\w]{3,})$/, ([, s]) => ({ 'background-position': positionMap[s] })],

  // repeats
  ['bg-repeat', { 'background-repeat': 'repeat' }],
  ['bg-no-repeat', { 'background-repeat': 'no-repeat' }],
  ['bg-repeat-x', { 'background-repeat': 'repeat-x' }],
  ['bg-repeat-y', { 'background-repeat': 'repeat-y' }],
  ['bg-repeat-round', { 'background-repeat': 'round' }],
  ['bg-repeat-space', { 'background-repeat': 'space' }],
  ...makeGlobalStaticRules('bg-repeat', 'background-repeat'),

  // origins
  ['bg-origin-border', { 'background-origin': 'border-box' }],
  ['bg-origin-padding', { 'background-origin': 'padding-box' }],
  ['bg-origin-content', { 'background-origin': 'content-box' }],
  ...makeGlobalStaticRules('bg-origin', 'background-origin'),
]
