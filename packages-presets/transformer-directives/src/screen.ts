import type { Atrule } from 'css-tree'
import type { TransformerDirectivesContext } from './types'
import { resolveScreenMediaQuery } from '@unocss/rule-utils'

// eslint-disable-next-line regexp/no-misleading-capturing-group
const screenRuleRE = /(@screen [^{]+)(.+)/g

export function handleScreen({ code, uno }: TransformerDirectivesContext, node: Atrule) {
  let value = ''
  if (node.prelude?.type === 'Raw')
    value = node.prelude.value.trim()
  if (!value)
    return

  const mediaQuery = `@media ${resolveScreenMediaQuery(uno.config.theme, value)}`

  const offset = node.loc!.start.offset
  const str = code.original.slice(offset, node.loc!.end.offset)
  const matches = Array.from(str.matchAll(screenRuleRE))

  if (!matches.length)
    return

  for (const match of matches) {
    code.overwrite(
      offset + match.index!,
      offset + match.index! + match[1].length,
      mediaQuery,
    )
  }
}
