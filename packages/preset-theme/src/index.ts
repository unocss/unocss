import type { Preset } from '@unocss/core'
import { mergeDeep } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'

export interface PresetTheme {
  theme: Record<'dark' | 'light', Theme>
  prefix: string
}

export const presetTheme = (options: PresetTheme): Preset<Theme> => {
  const { prefix = '--uno-preset-theme' } = options
  const { dark, light } = options.theme
  const themeValues = new Map<string, {
    light?: string
    dark?: string
  }>()
  const varsRE = new RegExp(`var\\((${prefix}.*)\\)`)

  const lightPreflightCss: string[] = []
  const darkPreflightCss: string[] = []

  const getTheme = (theme: any, keys: string[]) => {
    for (const key of keys) {
      theme = theme[key]
      if (theme === undefined)
        return
    }
    return theme
  }

  const recursiveTheme = (theme: Record<string, any>, preKeys: string[] = []) => {
    Object.keys(theme).forEach((key) => {
      const val = Reflect.get(theme, key)
      const nextKeys = preKeys.concat(key)

      if (typeof val !== 'object' && !Array.isArray(val)) {
        const varName = `${prefix}-${nextKeys.join('-')}`

        // TODO: remove
        lightPreflightCss.push(`${varName}: ${getTheme(light, nextKeys)}`)
        darkPreflightCss.push(`${varName}: ${getTheme(dark, nextKeys)}`)
        // TODO: use
        // themeValues.set(varName, {
        //   light: `${varName}: ${getTheme(light, nextKeys)}`,
        //   dark: `${varName}: ${getTheme(dark, nextKeys)}`,
        // })

        theme[key] = `var(${varName})`
      }
      else { recursiveTheme(val, nextKeys) }
    })
    return theme
  }

  const theme = recursiveTheme(mergeDeep(dark, light))

  return {
    name: '@unocss/preset-theme',
    theme,
    preflights: [
      {
        layer: 'theme',
        async getCSS() {
          return `root{${lightPreflightCss.join(';')}}.dark{${darkPreflightCss.join(';')}}`
        },
      },
    ],
    postprocess(util) {
      // TODO: use
      // util.entries.forEach(([, val]) => {
      //   if (typeof val === 'string') {
      //     const varName = val.match(varsRE)?.[1]
      //     if (!varName)
      //       return

      //     const { dark, light } = themeValues.get(varName) || {}
      //     if (dark)
      //       darkPreflightCss.push(dark)
      //     if (light)
      //       lightPreflightCss.push(light)
      //   }
      // })
    },
  }
}

export default presetTheme
