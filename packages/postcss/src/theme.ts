import type { UnoGenerator } from '@unocss/core'
import { colorToString, parseCssColor } from '@unocss/rule-utils'
import type { Root } from 'postcss'
import MagicString from 'magic-string'

export function themeFnRE(directiveName: string) {
  return new RegExp(`${directiveName}\\((.*?)\\)`, 'g')
}
export async function parseTheme(root: Root, uno: UnoGenerator, directiveName: string) {
  root.walkDecls((decl) => {
    const matches = Array.from(decl.value.matchAll(themeFnRE(directiveName)))

    if (!matches.length)
      return

    for (const match of matches) {
      const rawArg = match[1].trim()
      if (!rawArg)
        throw new Error(`${directiveName}() expect exact one argument, but got 0`)

      const [rawKey, alpha] = rawArg.slice(1, -1).split('/') as [string, string?]
      let value: any = uno.config.theme
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
        const code = new MagicString(decl.value)
        code.overwrite(
          match.index!,
          match.index! + match[0].length,
          value,
        )
        decl.value = code.toString()
      }
    }
  })
}
