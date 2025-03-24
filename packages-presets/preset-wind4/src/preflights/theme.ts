import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { alphaPlaceholdersRE } from '@unocss/rule-utils'
import { compressCSS, getThemeByKey, hyphenate, passThemeKey, PRESET_NAME } from '../utils'

/** Exclude output for CSS Variables */
const ExcludeCssVarKeys = [
  'spacing',
  'breakpoint',
  'verticalBreakpoint',
  'shadow',
  'insetShadow',
  'dropShadow',
  'textShadow',
  'animation',
  'property',
  'aria',
  'media',
  'supports',
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
          const [key, prop] = k.split(':') as [keyof Theme, string]
          let v = getThemeByKey(theme, key, prop.split('-')) ?? getThemeByKey(theme, key, [prop])

          if (typeof v === 'object') {
            v = v.DEFAULT
          }

          if (v) {
            return `--${hyphenate(`${key}${prop !== 'DEFAULT' ? `-${prop}` : ''}`)}: ${v};`
          }

          return undefined
        })

        return compressCSS(`
:root, :host {
${depCSS.filter(Boolean).join('\n')}
}`, generator.config.envMode === 'dev')
      }
      else {
        const keys = Object.keys(theme).filter(k => !ExcludeCssVarKeys.includes(k))

        return compressCSS(`
:root {
--spacing: ${theme.spacing!.DEFAULT};
${themeToCSSVars(theme, keys).trim()}
}`, generator.config.envMode === 'dev')
      }
    },
  }
}
