import type { UnoGenerator } from '@unocss/core'
import type { Root } from 'postcss'
import MagicString from 'magic-string'

export function parseTheme(root: Root, uno: UnoGenerator, directiveName: string) {
  const themeFnRE = new RegExp(`${directiveName}\\((.*?)\\)`, 'g')
  root.walkDecls((decl) => {
    const matches = Array.from(decl.value.matchAll(themeFnRE))

    if (!matches.length)
      return

    for (const match of matches) {
      const rawArg = match[1].trim()
      if (!rawArg)
        throw new Error(`${directiveName}() expect exact one argument, but got 0`)

      let value = uno.config.theme as Record<string, any>
      const keys = rawArg.slice(1, -1).split('.')

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
