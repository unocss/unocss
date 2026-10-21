import type { UnoGenerator } from '@unocss/core'
import type { Root } from 'postcss'
import { resolveScreenMediaQuery } from '@unocss/rule-utils'

export function parseScreen(root: Root, uno: UnoGenerator, directiveName: string) {
  root.walkAtRules(directiveName, (rule) => {
    const value = rule.params.trim()
    if (!value)
      return

    rule.name = 'media'
    rule.params = resolveScreenMediaQuery(uno.config.theme, value)
  })
}
