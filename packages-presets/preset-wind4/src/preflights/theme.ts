import type { CSSEntry, Preflight } from '@unocss/core'
import type { PreflightsTheme, PresetWind4Options } from '..'
import type { Theme } from '../theme/types'
import { toArray, uniq } from '@unocss/core'
import { alphaPlaceholdersRE } from '@unocss/rule-utils'
import { compressCSS, detectThemeValue, getThemeByKey, themeTracking, trackedTheme } from '../utils'

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
      const safelist = uniq(generator.config.safelist.flatMap(s => typeof s === 'function' ? s(ctx) : s))
      const { mode, process } = options.preflights!.theme as PreflightsTheme
      if (mode === false) {
        return undefined
      }

      if (safelist.length > 0) {
        for (const s of safelist) {
          const [key, ...prop] = s.trim().split(':')
          if (key in theme && prop.length <= 1) {
            const props = prop.length === 0 ? ['DEFAULT'] : prop[0].split('-')
            const v = getThemeByKey(theme, key as keyof Theme, props)

            if (typeof v === 'string') {
              themeTracking(key, props)
              detectThemeValue(v, theme)
            }
          }
        }
      }

      let deps: CSSEntry[]
      const generateCSS = (deps: CSSEntry[]) => {
        if (process) {
          for (const utility of deps) {
            for (const p of toArray(process)) {
              p(utility, ctx)
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

      if (mode === 'on-demand') {
        if (trackedTheme.size === 0)
          return undefined

        deps = Array.from(trackedTheme).map((k) => {
          const [key, prop] = k.split(':') as [keyof Theme, string]
          const v = getThemeByKey(theme, key, prop.split('-'))

          if (typeof v === 'string') {
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
