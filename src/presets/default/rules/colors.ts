import { MiniwindTheme, MiniwindRule } from '../../../types'
import { h, hex2RGB } from '../../../utils'

const colorResolver
= (attribute: string, varName: string) =>
  ([, name, no = 'DEFAULT', opacity]: string[], theme: MiniwindTheme) => {
    if (name === 'transparent') {
      return {
        [attribute]: 'transparent',
      }
    }
    else if (name === 'inherit') {
      return {
        [attribute]: 'inherit',
      }
    }
    else if (name === 'current') {
      return {
        [attribute]: 'currentColor',
      }
    }
    let color = theme.colors[name]
    if (no && color && typeof color !== 'string')
      color = color[no]
    if (typeof color !== 'string')
      return
    const rgb = hex2RGB(color)
    if (rgb) {
      if (opacity) {
        return {
          [attribute]: `rgba(${rgb?.join(',')},${parseFloat(opacity) / 100})`,
        }
      }
      else {
        return {
          [`--mw-${varName}-opacity`]: 1,
          [attribute]: `rgba(${rgb?.join(',')},var(--mw-${varName}-opacity))`,
        }
      }
    }
  }

export const opacity: MiniwindRule[] = [
  [/^op(?:acity)?-(\d+)$/, ([, d]) => ({ opacity: h.opacity(d) })],
]

export const textColors: MiniwindRule[] = [
  [/^text-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, colorResolver('color', 'text')],
  [/^text-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--mw-text-opacity': h.opacity(opacity) })],
]

export const bgColors: MiniwindRule[] = [
  [/^bg-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, colorResolver('background-color', 'bg')],
  [/^bg-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--mw-bg-opacity': h.opacity(opacity) })],
]

export const borderColors: MiniwindRule[] = [
  [/^border-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, colorResolver('border-color', 'border')],
  [/^border-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--mw-border-opacity': h.opacity(opacity) })],
]
