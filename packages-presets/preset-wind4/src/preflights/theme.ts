import type { CSSEntry, Preflight } from '@unocss/core'
import type { PreflightsTheme, PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { toArray } from '@unocss/core'
import { alphaPlaceholdersRE } from '@unocss/rule-utils'
import { compressCSS, getThemeByKey, trackedTheme } from '../utils'

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

  const normalizeValue = (value: string) => value.replace(alphaPlaceholdersRE, '1')

  function process(obj: any, prefix: string) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        themeMap.set(`--${prefix}-${key}`, normalizeValue(obj[key].join(',')))
      }
      else if (typeof obj[key] === 'object') {
        process(obj[key], `${prefix}-${key}`)
      }
      else {
        themeMap.set(`--${prefix}-${key}`, normalizeValue(obj[key]))
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
      const preflightsTheme = options.preflights!.theme as PreflightsTheme
      if (preflightsTheme.mode === false) {
        return undefined
      }

      let deps
      const generateCSS = (deps: CSSEntry[]) => {
        if (preflightsTheme.process) {
          for (const utility of deps) {
            for (const process of toArray(preflightsTheme.process)) {
              process(utility, ctx)
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

      if (preflightsTheme.mode === 'on-demand') {
        if (trackedTheme.size === 0)
          return undefined

        deps = Array.from(trackedTheme).map((k) => {
          const [key, prop] = k.split(':') as [keyof Theme, string]
          const v = getThemeByKey(theme, key, prop.split('-'))

          if (v) {
            return [`--${key}${`${key === 'spacing' && prop === 'DEFAULT' ? '' : `-${prop}`}`}`, v]
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
