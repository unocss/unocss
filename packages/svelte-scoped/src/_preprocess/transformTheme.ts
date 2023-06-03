import MagicString from 'magic-string'

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

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  const theme = {
    colors: {
      blue: {
        500: '#3b82f6',
      },
    },
    spacing: {
      sm: '0.875rem',
    },
  }

  describe('transformTheme', () => {
    it('loops over all occurrences and replaces', () => {
      const code = `
div { 
  background: theme('colors.blue.500');
  margin-right: theme("spacing.sm"); 
}`.trim()
      expect(transformTheme(new MagicString(code), theme).toString()).toMatchInlineSnapshot(`
        "div { 
          background: #3b82f6;
          margin-right: 0.875rem; 
        }"
      `)
    })

    it('does nothing if contains no arguments', () => {
      const noArgument = 'div { background: theme() }'
      expect(transformTheme(new MagicString(noArgument), theme).toString()).toBe(noArgument)
    })
  })

  describe('getThemeValue', () => {
    it('splits string into keys and traverses theme', () => {
      expect(getThemeValue('colors.blue.500', theme)).toBe('#3b82f6')
      expect(getThemeValue('spacing.sm', theme)).toBe('0.875rem')
    })

    it('throws error if not found', () => {
      expect(async () => getThemeValue('size.lg', theme)).rejects.toMatchInlineSnapshot('[Error: "size.lg" is not found in your theme]')
    })
  })
}
