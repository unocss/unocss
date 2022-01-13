import type { Rule, RuleContext } from '@unocss/core'
import { handler as h, parseColor, positionMap } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

const bgGradientColorResolver = (mode: 'from' | 'to' | 'via') =>
  ([, body]: string[], { theme }: RuleContext<Theme>) => {
    const data = parseColor(body, theme)

    if (!data)
      return

    const { alpha, color, rgba } = data

    if (!color)
      return

    let colorString = color
    if (rgba) {
      if (alpha != null)
        colorString = `rgba(${rgba.join(',')})`
      else
        colorString = `rgba(${rgba.join(',')}, var(--un-${mode}-opacity, 1))`
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
  // TODO: bg-[url] { background-image: x }

  // gradients
  [/^bg-gradient-(.+)$/, ([, d]) => ({ '--un-gradient': h.bracket(d) })],
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
  })],
  // ignore any center position
  [/^bg-gradient-to-([rltb]{1,2})$/, ([, d]) => {
    if (d in positionMap) {
      return {
        '--un-gradient-shape': `to ${positionMap[d]}`,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
        'background-image': 'linear-gradient(var(--un-gradient))',
      }
    }
  }],
  [/^(?:bg-gradient-)?shape-(.+)$/, ([, d]) => {
    const v = d in positionMap ? `to ${positionMap[d]}` : h.bracket(d)
    if (v != null) {
      return {
        '--un-gradient-shape': v,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops)',
      }
    }
  }],
  ['bg-none', { 'background-image': 'none' }],

  ['box-decoration-slice', { 'box-decoration-break': 'slice' }],
  ['box-decoration-clone', { 'box-decoration-break': 'clone' }],

  // TODO: bg-[number] { background-size: x }

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
  ['bg-repeat-x', { 'background-position': 'repeat-x' }],
  ['bg-repeat-y', { 'background-position': 'repeat-y' }],
  ['bg-repeat-round', { 'background-position': 'round' }],
  ['bg-repeat-space', { 'background-position': 'space' }],

  // origins
  ['bg-origin-border', { 'background-origin': 'border-box' }],
  ['bg-origin-padding', { 'background-origin': 'padding-box' }],
  ['bg-origin-content', { 'background-origin': 'content-box' }],
]
