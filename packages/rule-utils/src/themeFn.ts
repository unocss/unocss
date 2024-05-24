import MagicString from 'magic-string'
import { colorToString, parseCssColor } from './colors'

// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/strict, regexp/no-potentially-useless-backreference
export const themeFnRE = /theme\(\s*(['"])?([^\1]*?)\1?\s*\)/g

export function hasThemeFn(str: string) {
  return str.includes('theme(') && str.includes(')')
}

export function transformThemeFn(code: string, theme: Record<string, any>, throwOnMissing = true) {
  const matches = Array.from(code.toString().matchAll(themeFnRE))

  if (!matches.length)
    return code

  const s = new MagicString(code)

  for (const match of matches) {
    const rawArg = match[2]
    if (!rawArg)
      throw new Error('theme() expect exact one argument, but got 0')

    const value = transformThemeString(rawArg, theme, throwOnMissing)
    if (value) {
      s.overwrite(
        match.index!,
        match.index! + match[0].length,
        value,
      )
    }
  }

  return s.toString()
}

export function transformThemeString(code: string, theme: Record<string, any>, throwOnMissing = true) {
  const [rawKey, alpha] = code.split('/') as [string, string?]
  const keys = rawKey.trim().split('.')
  let value = keys.reduce((t, k) => t?.[k], theme) as unknown as string | undefined

  if (typeof value === 'string') {
    if (alpha) {
      const color = parseCssColor(value)
      if (color)
        value = colorToString(color, alpha)
    }

    return value
  }
  else if (throwOnMissing) {
    throw new Error(`theme of "${code}" did not found`)
  }
}
