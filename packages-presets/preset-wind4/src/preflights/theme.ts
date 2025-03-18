import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { alphaPlaceholdersRE } from '@unocss/rule-utils'
import { compressCSS, hyphenate, passThemeKey, PRESET_NAME } from '../utils'

/** Output for CSS Variables */
const DefaultCssVarKeys = [
  'font',
  'colors',
  // 'spacing', // spacing is a special case

  'container',
  'text',
  'fontWeight',
  'tracking',
  'leading',
  'textStrokeWidth',
  'radius',
  'shadow',
  'insetShadow',
  'dropShadow',
  'textShadow',
  'ease',
  'blur',
  'perspective',
  'property',
  'defaults',
]

function themeToCSSVars(theme: Theme, keys: string[]): string {
  let cssVariables = ''

  function process(obj: any, prefix: string) {
    for (const key in obj) {
      if (key === 'DEFAULT' && Object.keys(obj).length === 1) {
        cssVariables += `${hyphenate(`--${prefix}`)}: ${obj[key].replace(alphaPlaceholdersRE, '1')};\n`
      }

      if (passThemeKey.includes(key))
        continue

      if (Array.isArray(obj[key])) {
        cssVariables += `${hyphenate(`--${prefix}-${key}`)}: ${obj[key].join(',').replace(alphaPlaceholdersRE, '1')};\n`
      }
      else if (typeof obj[key] === 'object') {
        process(obj[key], `${prefix}-${key}`)
      }
      else {
        cssVariables += `${hyphenate(`--${prefix}-${key}`)}: ${obj[key].replace(alphaPlaceholdersRE, '1')};\n`
      }
    }
  }

  for (const key in theme) {
    if (!keys.includes(key))
      continue
    process((theme as any)[key], key)
  }

  return cssVariables
}

export function theme(options: PresetWind4Options): Preflight<Theme> {
  return {
    layer: 'theme',
    getCSS({ theme, generator }) {
      if (options.themeVariable === false) {
        return undefined
      }

      else if (options.themeVariable === 'on-demand') {
        const self = generator.config.presets.find(p => p.name === PRESET_NAME)
        if (!self || (self.meta!.themeDeps as Set<string>).size === 0)
          return

        const depCSS = Array.from(self.meta!.themeDeps as Set<string>).map((k) => {
          const [key, prop] = k.split(':')
          const props = prop.split('-')
          const v = props.reduce((o, p) => o?.[p], (theme as any)[key])

          if (v) {
            return `--${key}${prop !== 'DEFAULT' ? `-${prop}` : ''}: ${v};`
          }
          return undefined
        })

        return compressCSS(`
:root {
${depCSS.filter(Boolean).join('\n')}
}`)
      }
      else {
        return compressCSS(`
:root {
--spacing: ${theme.spacing!.DEFAULT};
${themeToCSSVars(theme, DefaultCssVarKeys).trim()}
}`)
      }
    },
  }
}
