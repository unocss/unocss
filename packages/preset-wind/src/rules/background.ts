import type { Rule, RuleContext } from '@unocss/core'
import { globalKeywords, h, makeGlobalStaticRules, parseColor, positionMap } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'
import type { CSSColorValue } from '@unocss/rule-utils'
import { colorOpacityToString, colorToString } from '@unocss/rule-utils'

function bgGradientToValue(cssColor: CSSColorValue | undefined) {
  if (cssColor)
    return colorToString(cssColor, 0)

  return 'rgb(255 255 255 / 0)'
}

function bgGradientColorValue(mode: string, cssColor: CSSColorValue | undefined, color: string, alpha: any) {
  if (cssColor) {
    if (alpha != null)
      return colorToString(cssColor, alpha)
    else
      return colorToString(cssColor, `var(--un-${mode}-opacity, ${colorOpacityToString(cssColor)})`)
  }

  return colorToString(color, alpha)
}

function bgGradientColorResolver() {
  return ([, mode, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColor(body, theme, 'backgroundColor')

    if (!data)
      return

    const { alpha, color, cssColor } = data

    if (!color)
      return

    const colorString = bgGradientColorValue(mode, cssColor, color, alpha)

    switch (mode) {
      case 'from':
        return {
          '--un-gradient-from-position': '0%',
          '--un-gradient-from': `${colorString} var(--un-gradient-from-position)`,
          '--un-gradient-to-position': '100%',
          '--un-gradient-to': `${bgGradientToValue(cssColor)} var(--un-gradient-to-position)`,
          '--un-gradient-stops': 'var(--un-gradient-from), var(--un-gradient-to)',
        }
      case 'via':
        return {
          '--un-gradient-via-position': '50%',
          '--un-gradient-to': bgGradientToValue(cssColor),
          '--un-gradient-stops': `var(--un-gradient-from), ${colorString} var(--un-gradient-via-position), var(--un-gradient-to)`,
        }
      case 'to':
        return {
          '--un-gradient-to-position': '100%',
          '--un-gradient-to': `${colorString} var(--un-gradient-to-position)`,
        }
    }
  }
}

function bgGradientPositionResolver() {
  return ([, mode, body]: string[]) => {
    return {
      [`--un-gradient-${mode}-position`]: `${Number(h.bracket.cssvar.percent(body)) * 100}%`,
    }
  }
}

export const backgroundStyles: Rule[] = [
  // gradients
  [/^bg-gradient-(.+)$/, ([, d]) => ({ '--un-gradient': h.bracket(d) }), {
    autocomplete: ['bg-gradient', 'bg-gradient-(from|to|via)', 'bg-gradient-(from|to|via)-$colors', 'bg-gradient-(from|to|via)-(op|opacity)', 'bg-gradient-(from|to|via)-(op|opacity)-<percent>'],
  }],
  [/^(?:bg-gradient-)?stops-(\[.+\])$/, ([, s]) => ({ '--un-gradient-stops': h.bracket(s) })],
  [/^(?:bg-gradient-)?(from)-(.+)$/, bgGradientColorResolver()],
  [/^(?:bg-gradient-)?(via)-(.+)$/, bgGradientColorResolver()],
  [/^(?:bg-gradient-)?(to)-(.+)$/, bgGradientColorResolver()],
  [/^(?:bg-gradient-)?(from|via|to)-op(?:acity)?-?(.+)$/, ([, position, opacity]) => ({ [`--un-${position}-opacity`]: h.bracket.percent(opacity) })],
  [/^(from|via|to)-([\d.]+)%$/, bgGradientPositionResolver()],
  // images
  [/^bg-gradient-((?:repeating-)?(?:linear|radial|conic))$/, ([, s]) => ({
    'background-image': `${s}-gradient(var(--un-gradient, var(--un-gradient-stops, rgb(255 255 255 / 0))))`,
  }), { autocomplete: ['bg-gradient-repeating', 'bg-gradient-(linear|radial|conic)', 'bg-gradient-repeating-(linear|radial|conic)'] }],
  // ignore any center position
  [/^bg-gradient-to-([rltb]{1,2})$/, ([, d]) => {
    if (d in positionMap) {
      return {
        '--un-gradient-shape': `to ${positionMap[d]}`,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
        'background-image': 'linear-gradient(var(--un-gradient))',
      }
    }
  }, { autocomplete: `bg-gradient-to-(${Object.keys(positionMap).filter(k => k.length <= 2 && Array.from(k).every(c => 'rltb'.includes(c))).join('|')})` }],
  [/^(?:bg-gradient-)?shape-(.+)$/, ([, d]) => {
    const v = d in positionMap ? `to ${positionMap[d]}` : h.bracket(d)
    if (v != null) {
      return {
        '--un-gradient-shape': v,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
      }
    }
  }, { autocomplete: ['bg-gradient-shape', `bg-gradient-shape-(${Object.keys(positionMap).join('|')})`, `shape-(${Object.keys(positionMap).join('|')})`] }],
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
  }] as Rule),

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
