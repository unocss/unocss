import { Rule } from '@unocss/core'
import { Theme } from '../theme'
import { parseColorUtil } from './color'

const colorResolver = (body: string, theme: Theme) => {
  const data = parseColorUtil(body, theme)

  if (!data)
    return

  const { color, rgba } = data

  if (!color)
    return

  if (rgba) {
    // shadow opacity ignored
    return {
      '--un-shadow-color': `${rgba.slice(0, 3).join(',')}`,
    }
  }
  else {
    return {
      '--un-shadow-color': color,
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
