import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'
import { getThemeValue, transformTheme } from './transformTheme'

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

  it('throws error if not found', async () => {
    await expect(async () => getThemeValue('size.lg', theme)).rejects.toMatchInlineSnapshot('[Error: "size.lg" is not found in your theme]')
  })
})
