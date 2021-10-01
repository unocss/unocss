import { NanowindTheme } from '../..'
import { h } from '../../handlers'
import { NanowindRule } from '../../types'

export function hex2RGB(hex: string): number[] | undefined {
  const RGB_HEX = /^#?(?:([\da-f]{3})[\da-f]?|([\da-f]{6})(?:[\da-f]{2})?)$/i
  const [, short, long] = String(hex).match(RGB_HEX) || []

  if (long) {
    const value = Number.parseInt(long, 16)
    return [value >> 16, (value >> 8) & 0xFF, value & 0xFF]
  }
  else if (short) {
    return Array.from(short, s => Number.parseInt(s, 16)).map(
      n => (n << 4) | n,
    )
  }
}

function resolveColor(theme: NanowindTheme, name: string, no = 'DEFAULT') {
  let color = theme.colors[name]
  if (no && color && typeof color !== 'string')
    color = color[no]
  if (typeof color !== 'string')
    return
  const rgb = hex2RGB(color)
  return rgb
}

export const opacity: NanowindRule[] = [
  [/^op(?:acity)?-(\d+)$/, ([, d]) => ({ opacity: h.opacity(d) })],
]

export const textColors: NanowindRule[] = [
  [/^text-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    const rgb = resolveColor(theme, name, no)
    if (rgb) {
      return {
        '--nw-text-opacity': parseFloat(opacity) / 100,
        'color': `rgba(${rgb?.join(',')},var(--nw-text-opacity))`,
      }
    }
  }],
  [/^text-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-text-opacity': h.opacity(opacity) })],
]

export const bgColors: NanowindRule[] = [
  [/^bg-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    const rgb = resolveColor(theme, name, no)
    if (rgb) {
      return {
        '--nw-bg-opacity': parseFloat(opacity) / 100,
        'background-color': `rgba(${rgb?.join(',')},var(--nw-bg-opacity))`,
      }
    }
  }],
  [/^bg-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-bg-opacity': h.opacity(opacity) })],
]

export const borderColors: NanowindRule[] = [
  [/^border-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    const rgb = resolveColor(theme, name, no)
    if (rgb) {
      return {
        '--nw-border-opacity': parseFloat(opacity) / 100,
        'border-color': `rgba(${rgb?.join(',')},var(--nw-border-opacity))`,
      }
    }
  }],
  [/^border-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-border-opacity': h.opacity(opacity) })],
]
