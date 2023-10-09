import MagicString from 'magic-string'
import { colorToString, parseCssColor } from './colors'

export const themeFnRE = /theme\(\s*['"]?(.*?)['"]?\s*\)/g
export function transformThemeFn(code: string, theme: Record<string, any>, throwOnMissing = true) {
  const s = new MagicString(code)
  const matches = Array.from(code.toString().matchAll(themeFnRE))

  if (!matches.length)
    return s.toString()

  for (const match of matches) {
    const rawArg = match[1].trim()
    if (!rawArg)
      throw new Error('theme() expect exact one argument, but got 0')

    const [rawKey, alpha] = rawArg.split('/') as [string, string?]
    let value: any = theme
    const keys = rawKey.trim().split('.')

    keys.every((key) => {
      if (value[key] != null)
        value = value[key]
      else if (value[+key] != null)
        value = value[+key]
      else
        return false
      return true
    })

    if (typeof value === 'string') {
      if (alpha) {
        const color = parseCssColor(value)
        if (color)
          value = colorToString(color, alpha)
      }

      s.overwrite(
        match.index!,
        match.index! + match[0].length,
        value,
      )
    }
    else if (throwOnMissing) {
      throw new Error(`theme of "${rawArg}" did not found`)
    }
  }

  return s.toString()
}
