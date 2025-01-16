import type { FunctionNode } from 'css-tree'
import type { TransformerDirectivesContext } from './types'
import { transformThemeFn, transformThemeString } from '@unocss/rule-utils'
import { transformIconString } from './icon'

export async function handleFunction({ code, uno, options }: TransformerDirectivesContext, node: FunctionNode) {
  const { throwOnMissing = true } = options

  switch (node.name) {
    case 'theme': {
      if (node.children.size !== 1)
        throw new Error('theme() expect exact one argument')

      if (node.children.first!.type !== 'String')
        throw new Error('theme() expect a string argument')

      const themeStr = node.children.first.value
      const value = transformThemeString(themeStr, uno.config.theme, throwOnMissing)
      if (value)
        code.overwrite(node.loc!.start.offset, node.loc!.end.offset, value)

      break
    }
    case 'icon': {
      const params = node.children.toArray().filter(node => node.type === 'String').map(node => node.value)

      if (params.length === 0)
        throw new Error('icon() expects at least one argument')

      let [icon, color] = params as [string, string?]
      if (color) {
        color = encodeURIComponent(transformThemeFn(color, uno.config.theme, throwOnMissing))
      }

      const value = await transformIconString(uno, icon, color)

      if (value)
        code.overwrite(node.loc!.start.offset, node.loc!.end.offset, value)

      break
    }
  }
}
