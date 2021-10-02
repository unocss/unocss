import { NanowindTheme } from '../../..'
import { h } from '../../../handlers'
import { NanowindRule } from '../../../types'

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

function resolveColor(theme: NanowindTheme, attribute: string, varName: string, name: string, no = 'DEFAULT', opacity = '100') {
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
    return {
      [`--nw-${varName}-opacity`]: parseFloat(opacity) / 100,
      [attribute]: `rgba(${rgb?.join(',')},var(--nw-${varName}-opacity))`,
    }
  }
}

export const opacity: NanowindRule[] = [
  [/^op(?:acity)?-(\d+)$/, ([, d]) => ({ opacity: h.opacity(d) })],
]

export const textColors: NanowindRule[] = [
  [/^text-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    return resolveColor(theme, 'color', 'text', name, no, opacity)
  }],
  [/^text-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-text-opacity': h.opacity(opacity) })],
]

export const bgColors: NanowindRule[] = [
  [/^bg-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    return resolveColor(theme, 'background-color', 'bg', name, no, opacity)
  }],
  [/^bg-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-bg-opacity': h.opacity(opacity) })],
]

export const borderColors: NanowindRule[] = [
  [/^border-(\w+)(?:-(\d+))?(?:\/(\d+))?$/, ([, name, no, opacity = '100'], theme) => {
    return resolveColor(theme, 'border-color', 'border', name, no, opacity)
  }],
  [/^border-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--nw-border-opacity': h.opacity(opacity) })],
]
