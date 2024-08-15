import type MagicString from 'magic-string'

interface Theme { [key: string]: any }

export const themeRE = /theme\((.+?)\)/g

export function transformTheme(s: MagicString, theme: Theme): MagicString {
  return s.replace(themeRE, (_, match) => {
    const argumentsWithoutQuotes = match.slice(1, -1)
    return getThemeValue(argumentsWithoutQuotes, theme)
  })
}

export function getThemeValue(rawArguments: string, theme: Theme): string {
  const keys = rawArguments.split('.')

  let current = theme

  for (const key of keys) {
    if (current[key] === undefined)
      throw new Error(`"${rawArguments}" is not found in your theme`)

    else
      current = current[key]
  }

  return current as unknown as string
}
