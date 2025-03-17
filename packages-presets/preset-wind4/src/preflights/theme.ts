import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { isObject } from '@unocss/core'
import { alphaPlaceholdersRE } from '@unocss/rule-utils'
import { camelToHyphen, compressCSS, passThemeKey, PRESET_NAME } from '../utils'

/** Output for CSS Variables */
const DefaultCssVarKeys = [
  'font',
  'colors',
  // 'spacing', // spacing is a special case

  // 'breakpoint',
  // 'verticalBreakpoint',

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
        cssVariables += `${camelToHyphen(`--${prefix}`)}: ${obj[key].replace(alphaPlaceholdersRE, '1')};\n`
      }

      if (passThemeKey.includes(key))
        continue

      if (Array.isArray(obj[key])) {
        cssVariables += `${camelToHyphen(`--${prefix}-${key}`)}: ${obj[key].join(',').replace(alphaPlaceholdersRE, '1')};\n`
      }
      else if (typeof obj[key] === 'object') {
        process(obj[key], `${prefix}-${key}`)
      }
      else {
        cssVariables += `${camelToHyphen(`--${prefix}-${key}`)}: ${obj[key].replace(alphaPlaceholdersRE, '1')};\n`
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
  // let themeKeys: string[]

  // if (typeof options.themeKeys === 'function') {
  //   themeKeys = options.themeKeys(DefaultCssVarKeys)
  // }
  // else {
  //   themeKeys = options.themeKeys ?? DefaultCssVarKeys
  // }

  return {
    layer: 'theme',
    getCSS({ theme, generator }) {
      const self = generator.config.presets.find(p => p.name === PRESET_NAME)
      if (!self)
        return

      const depCSS = Array.from<string>(self.meta!.themeDeps).map((key) => {
        const keys = key.split('-')
        let v = keys.reduce<any>((t, k) => t[k], theme)

        if (isObject(v)) {
          v = v.DEFAULT
        }

        if (v) {
          return `--${key}: ${v};`
        }
      })

      return compressCSS(`
:root {
${depCSS.filter(Boolean).join('\n')}
}`)
    },
  }
}
