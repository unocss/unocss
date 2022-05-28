import type { Rule, RuleContext } from '@unocss/core'
import { colorToString, handler as h, parseColor, positionMap } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

const bgGradientColorResolver = (mode: 'from' | 'to' | 'via') =>
  ([, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColor(body, theme)

    if (!data)
      return

    const { alpha, color, cssColor } = data

    if (!color)
      return

    let colorString = color
    if (cssColor) {
      if (alpha != null)
        colorString = colorToString(cssColor, alpha)
      else
        colorString = colorToString(cssColor, `var(--un-${mode}-opacity, ${cssColor.alpha ?? 1})`)
    }

    switch (mode) {
      case 'from':
        return {
          '--un-gradient-from': colorString,
          '--un-gradient-stops': 'var(--un-gradient-from), var(--un-gradient-to, rgba(255, 255, 255, 0))',
        }
      case 'via':
        return {
          '--un-gradient-stops': `var(--un-gradient-from), ${colorString}, var(--un-gradient-to, rgba(255, 255, 255, 0))`,
        }
      case 'to':
        return {
          '--un-gradient-to': colorString,
        }
    }
  }

export const backgroundStyles: Rule[] = [
  [/^bg-(.*)$/, ([, d]) => {
    if (/^\[url\((.+)\)\]$/.test(d))
      return { '--un-url': `${h.bracket(d)}`, 'background-image': 'var(--un-url)' }
    else if (/^\[length:(.+)\]$/.test(d) && h.bracketOfLength(d) != null)
      return { 'background-size': h.bracketOfLength(d)!.split(' ').map(e => h.fraction.auto.px.cssvar(e)).join(' ') }
    else if (/^\[position:(.+)\]$/.test(d) && h.bracketOfPosition(d) != null)
      return { 'background-position': h.bracketOfPosition(d)!.split(' ').map(e => h.fraction.auto.px.cssvar(e)).join(' ') }
  }],

  // gradients
  [/^bg-gradient-(.+)$/, ([, d]) => ({ '--un-gradient': h.bracket(d) }), {
    autocomplete: ['bg-gradient', 'bg-gradient-(from|to|via)', 'bg-gradient-(from|to|via)-$colors', 'bg-gradient-(from|to|via)-(op|opacity)', 'bg-gradient-(from|to|via)-(op|opacity)-<percent>'],
  }],
  [/^(?:bg-gradient-)?stops-(\[.+\])$/, ([, s]) => ({ '--un-gradient-stops': h.bracket(s) })],
  [/^(?:bg-gradient-)?from-(.+)$/, bgGradientColorResolver('from')],
  [/^(?:bg-gradient-)?to-(.+)$/, bgGradientColorResolver('to')],
  [/^(?:bg-gradient-)?via-(.+)$/, bgGradientColorResolver('via')],
  [/^(?:bg-gradient-)?from-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-from-opacity': h.bracket.percent(opacity) })],
  [/^(?:bg-gradient-)?to-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-to-opacity': h.bracket.percent(opacity) })],
  [/^(?:bg-gradient-)?via-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-via-opacity': h.bracket.percent(opacity) })],

  // images
  [/^bg-gradient-((?:repeating-)?(?:linear|radial|conic))$/, ([, s]) => ({
    'background-image': `${s}-gradient(var(--un-gradient, var(--un-gradient-stops, rgba(255, 255, 255, 0))))`,
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

  // size
  ['bg-auto', { 'background-size': 'auto' }],
  ['bg-cover', { 'background-size': 'cover' }],
  ['bg-contain', { 'background-size': 'contain' }],

  // attachments
  ['bg-fixed', { 'background-attachment': 'fixed' }],
  ['bg-local', { 'background-attachment': 'local' }],
  ['bg-scroll', { 'background-attachment': 'scroll' }],

  // clips
  ['bg-clip-border', { '-webkit-background-clip': 'border-box', 'background-attachment': 'border-box' }],
  ['bg-clip-content', { '-webkit-background-clip': 'content-box', 'background-attachment': 'content-box' }],
  ['bg-clip-padding', { '-webkit-background-clip': 'padding-box', 'background-attachment': 'padding-box' }],
  ['bg-clip-text', { '-webkit-background-clip': 'text', 'background-attachment': 'text' }],

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

  // origins
  ['bg-origin-border', { 'background-origin': 'border-box' }],
  ['bg-origin-padding', { 'background-origin': 'padding-box' }],
  ['bg-origin-content', { 'background-origin': 'content-box' }],
]
