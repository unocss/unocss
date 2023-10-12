import MagicString from 'magic-string'
import { colorToString, parseCssColor } from './colors'

export const themeFnRE = /theme\(\s*['"]?(.*?)['"]?\s*\)/g

export function hasThemeFn(str: string) {
  return str.includes('theme(') && str.includes(')')
}

export function transformThemeFn(code: string, theme: Record<string, any>, throwOnMissing = true) {
  const matches = Array.from(code.toString().matchAll(themeFnRE))

  if (!matches.length)
    return code

  const s = new MagicString(code)

  for (const match of matches) {
    const rawArg = match[1]
    if (!rawArg)
      throw new Error('theme() expect exact one argument, but got 0')

    const [rawKey, alpha] = rawArg.split('/') as [string, string?]
    const keys = rawKey.trim().split('.')
    let value = keys.reduce((t, k) => t?.[k], theme) as unknown as string | undefined

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
