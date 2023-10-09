import type { UnoGenerator } from '@unocss/core'
import { transformThemeFn } from '@unocss/rule-utils'
import type { Root } from 'postcss'

export function themeFnRE(directiveName: string) {
  return new RegExp(`${directiveName}\\((.*?)\\)`, 'g')
}
export async function parseTheme(root: Root, uno: UnoGenerator) {
  root.walkDecls((decl) => {
    decl.value = transformThemeFn(decl.value, uno.config.theme, false)
  })
}
