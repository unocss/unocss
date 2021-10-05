import { Theme, Rule, handler as h, hex2RGB } from '@unocss/core'

const colorResolver
= (attribute: string, varName: string) =>
  ([, body]: string[], theme: Theme) => {
    const [main, opacity] = body.split('/')
    const [name, no = 'DEFAULT'] = main.split(/-/g)

    if (!name)
      return

    let color: string | Record<string, string> | undefined
    const bracket = h.bracket(main) || main
    if (bracket.startsWith('#'))
      color = bracket.slice(1)
    if (bracket.startsWith('hex-'))
      color = bracket.slice(4)

    if (!color) {
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
      color = theme.colors[name]
      if (no && color && typeof color !== 'string')
        color = color[no]
    }

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
          [`--un-${varName}-opacity`]: 1,
          [attribute]: `rgba(${rgb?.join(',')},var(--un-${varName}-opacity))`,
        }
      }
    }
  }

export const opacity: Rule[] = [
  [/^op(?:acity)?-(\d+)$/, ([, d]) => ({ opacity: h.opacity(d) })],
]

export const textColors: Rule[] = [
  [/^text-(.+)$/, colorResolver('color', 'text')],
  [/^text-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--un-text-opacity': h.opacity(opacity) })],
]

export const bgColors: Rule[] = [
  [/^bg-(.+)$/, colorResolver('background-color', 'bg')],
  [/^bg-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--un-bg-opacity': h.opacity(opacity) })],
]

export const borderColors: Rule[] = [
  [/^border-(.+)$/, colorResolver('border-color', 'border')],
  [/^border-op(?:acity)?-(\d+)$/m, ([, opacity]) => ({ '--un-border-opacity': h.opacity(opacity) })],
]
