import type { Declaration } from 'css-tree'
import { transformThemeFn } from '@unocss/rule-utils'
import type { TransformerDirectivesContext } from '.'

export function handleThemeFn({ code, uno, options }: TransformerDirectivesContext, node: Declaration) {
  const { throwOnMissing = true } = options

  const offset = node.value.loc!.start.offset
  const str = code.original.slice(offset, node.value.loc!.end.offset)

  code.overwrite(offset, node.value.loc!.end.offset, transformThemeFn(str, uno.config.theme, throwOnMissing))
}
