import type { CSSEntry, Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { toArray } from '@unocss/core'
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

function getThemeVarsMap(theme: Theme, keys: string[]): Map<string, string> {
  const themeMap = new Map<string, string>([
    ['--spacing', theme.spacing!.DEFAULT],
  ])

  function process(obj: any, prefix: string) {
    for (const key in obj) {
      if (key === 'DEFAULT' && Object.keys(obj).length === 1) {
        themeMap.set(hyphenate(`--${prefix}`), obj[key].replace(alphaPlaceholdersRE, '1'))
      }

      if (passThemeKey.includes(key))
        continue

      if (Array.isArray(obj[key])) {
        themeMap.set(hyphenate(`--${prefix}-${key}`), obj[key].join(',').replace(alphaPlaceholdersRE, '1'))
      }
      else if (typeof obj[key] === 'object') {
        process(obj[key], `${prefix}-${key}`)
      }
      else {
        themeMap.set(hyphenate(`--${prefix}-${key}`), obj[key].replace(alphaPlaceholdersRE, '1'))
      }
    }
  }

  for (const key in theme) {
    if (!keys.includes(key))
      continue
    process((theme as any)[key], key)
  }

  return themeMap
}

export function theme(options: PresetWind4Options): Preflight<Theme> {
  return {
    layer: 'theme',
    getCSS(ctx) {
      const { theme, generator } = ctx
      if (options.themePreflight === false) {
        return undefined
      }

      let deps
      const generateCSS = (deps: CSSEntry[]) => {
        if (options.utilityResolver) {
          const resolver = toArray(options.utilityResolver)
          for (const utility of deps) {
            for (const r of resolver) {
              r(utility, 'theme', ctx)
            }
          }
        }

        const resolvedDeps = deps.map(([key, value]) => (key && value) ? `${key}: ${value};` : undefined).filter(Boolean)
        if (resolvedDeps.length === 0) {
          return undefined
        }
        const depCSS = resolvedDeps.join('\n')

        return compressCSS(`
:root, :host {
${depCSS}
}`, generator.config.envMode === 'dev')
      }

      if (options.themePreflight === 'on-demand') {
        const self = generator.config.presets.find(p => p.name === PRESET_NAME)
        if (!self || (self.meta!.themeDeps as Set<string>).size === 0)
          return undefined

        deps = Array.from(self.meta!.themeDeps as Set<string>).map((k) => {
          const [key, prop] = k.split(':') as [keyof Theme, string]
          let v = getThemeByKey(theme, key, prop.split('-')) ?? getThemeByKey(theme, key, [prop])

          if (typeof v === 'object') {
            v = v.DEFAULT
          }

          if (v) {
            return [`--${hyphenate(`${key}${prop !== 'DEFAULT' ? `-${prop}` : ''}`)}`, v]
          }

          return undefined
        }).filter(Boolean) as CSSEntry[]
      }
      else {
        const keys = Object.keys(theme).filter(k => !ExcludeCssVarKeys.includes(k))
        deps = Array.from(getThemeVarsMap(theme, keys))
      }

      return generateCSS(deps)
    },
  }
}
