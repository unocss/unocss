import type { FunctionNode, StringNode } from 'css-tree'
import { transformThemeString } from '@unocss/rule-utils'
import type { TransformerDirectivesContext } from './types'

export function handleFunction({ code, uno, options }: TransformerDirectivesContext, node: FunctionNode) {
  const { throwOnMissing = true } = options

  switch (node.name) {
    case 'theme': {
      if (node.children.size !== 1)
        throw new Error('theme() expect exact one argument')

      const themeStr = (node.children.first as StringNode).value
      const value = transformThemeString(themeStr, uno.config.theme, throwOnMissing)
      if (value)
        code.overwrite(node.loc!.start.offset, node.loc!.end.offset, value)
    }
  }
}
