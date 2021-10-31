import { hex2rgba, Rule } from '@unocss/core'
import { Theme } from '../theme'
import { extractColor } from './color'

const colorResolver = (body: string, theme: Theme) => {
  const data = extractColor(body)

  if (!data)
    return

  const { name, no, color } = data

  if (!name)
    return

  let useColor = color

  if (!color) {
    if (name === 'transparent') {
      return {
        '--un-shadow-color': 'transparent',
      }
    }
    else if (name === 'current') {
      return {
        '--un-shadow-color': 'currentColor',
      }
    }
    useColor = theme.colors?.[name]
    if (no && useColor && typeof useColor !== 'string')
      useColor = useColor[no]
  }

  if (typeof useColor !== 'string')
    return

  const rgba = hex2rgba(useColor)
  if (rgba) {
    // shadow opacity ignore
    return {
      '--un-shadow-color': `${rgba.slice(0, 3).join(',')}`,
    }
  }
}

export const mixBlendModes: Rule[] = [
  ['mix-blend-normal', { 'mix-blend-mode': 'normal' }],
  ['mix-blend-multiply', { 'mix-blend-mode': 'multiply' }],
  ['mix-blend-screen', { 'mix-blend-mode': 'screen' }],
  ['mix-blend-overlay', { 'mix-blend-mode': 'overlay' }],
  ['mix-blend-darken', { 'mix-blend-mode': 'darken' }],
  ['mix-blend-lighten', { 'mix-blend-mode': 'lighten' }],
  ['mix-blend-color-dodge', { 'mix-blend-mode': 'color-dodge' }],
  ['mix-blend-color-burn', { 'mix-blend-mode': 'color-burn' }],
  ['mix-blend-color-light', { 'mix-blend-mode': 'color-light' }],
  ['mix-blend-soft-light', { 'mix-blend-mode': 'soft-light' }],
  ['mix-blend-difference', { 'mix-blend-mode': 'difference' }],
  ['mix-blend-exclusion', { 'mix-blend-mode': 'exclusion' }],
  ['mix-blend-hue', { 'mix-blend-mode': 'hue' }],
  ['mix-blend-saturation', { 'mix-blend-mode': 'saturation' }],
  ['mix-blend-color', { 'mix-blend-mode': 'color' }],
  ['mix-blend-luminosity', { 'mix-blend-mode': 'luminosity' }],
]

export const shadows: Rule<Theme>[] = [
  [/^shadow-?(.*)$/, ([, d], { theme }) => {
    const value = theme?.textShadow?.[d || 'DEFAULT']
    if (value) {
      return {
        '--un-shadow-color': '0,0,0',
        '--un-shadow': value,
        '-webkit-box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
        'box-shadow': 'var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000), var(--un-shadow)',
      }
    }

    const color = colorResolver(d, theme)
    if (color)
      return color
  }],
]
