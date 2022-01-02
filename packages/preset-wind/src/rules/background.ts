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
  // attachments
  ['bg-fixed', { 'background-attachment': 'fixed' }],
  ['bg-local', { 'background-attachment': 'local' }],
  ['bg-scroll', { 'background-attachment': 'scroll' }],

  // blends
  ['bg-blend-multiply', { 'background-blend-mode': 'multiply' }],
  ['bg-blend-screen', { 'background-blend-mode': 'screen' }],
  ['bg-blend-overlay', { 'background-blend-mode': 'overlay' }],
  ['bg-blend-darken', { 'background-blend-mode': 'darken' }],
  ['bg-blend-lighten', { 'background-blend-mode': 'lighten' }],
  ['bg-blend-color-dodge', { 'background-blend-mode': 'color-dodge' }],
  ['bg-blend-color-burn', { 'background-blend-mode': 'color-burn' }],
  ['bg-blend-hard-light', { 'background-blend-mode': 'hard-light' }],
  ['bg-blend-soft-light', { 'background-blend-mode': 'soft-light' }],
  ['bg-blend-difference', { 'background-blend-mode': 'difference' }],
  ['bg-blend-exclusion', { 'background-blend-mode': 'exclusion' }],
  ['bg-blend-hue', { 'background-blend-mode': 'hue' }],
  ['bg-blend-saturation', { 'background-blend-mode': 'saturation' }],
  ['bg-blend-color', { 'background-blend-mode': 'color' }],
  ['bg-blend-luminosity', { 'background-blend-mode': 'luminosity' }],
  ['bg-blend-normal', { 'background-blend-mode': 'normal' }],

  // clips
  ['bg-clip-border', { '-webkit-background-clip': 'border-box', 'background-attachment': 'border-box' }],
  ['bg-clip-content', { '-webkit-background-clip': 'content-box', 'background-attachment': 'content-box' }],
  ['bg-clip-padding', { '-webkit-background-clip': 'padding-box', 'background-attachment': 'padding-box' }],
  ['bg-clip-text', { '-webkit-background-clip': 'text', 'background-attachment': 'text' }],

  // gradients
  [/^(?:bg-gradient-)?from-(.+)$/, bgGradientColorResolver('from')],
  [/^(?:bg-gradient-)?to-(.+)$/, bgGradientColorResolver('to')],
  [/^(?:bg-gradient-)?via-(.+)$/, bgGradientColorResolver('via')],
  [/^(?:bg-gradient-)?from-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-from-opacity': h.bracket.percent(opacity) })],
  [/^(?:bg-gradient-)?to-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-to-opacity': h.bracket.percent(opacity) })],
  [/^(?:bg-gradient-)?via-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-via-opacity': h.bracket.percent(opacity) })],

  // images
  // ignore any center position
  [/^bg-gradient-to-([trbl]{1,2})$/, ([, d]) => {
    if (d in positionMap)
      return { 'background-image': `linear-gradient(to ${positionMap[d]}, var(--un-gradient-stops))` }
  }],
  ['bg-none', { 'background-image': 'none' }],

  // origins
  ['bg-origin-border', { 'background-origin': 'border-box' }],
  ['bg-origin-padding', { 'background-origin': 'padding-box' }],
  ['bg-origin-content', { 'background-origin': 'content-box' }],

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

  // size
  ['bg-auto', { 'background-size': 'auto' }],
  ['bg-cover', { 'background-size': 'cover' }],
  ['bg-contain', { 'background-size': 'contain' }],
]
