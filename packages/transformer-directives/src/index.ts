import { cssIdRE } from '@unocss/core'
import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type { Atrule, CssNode, Declaration, List, ListItem, Rule } from 'css-tree'
import { parse, walk } from 'css-tree'
import type MagicString from 'magic-string'
import { handleThemeFn, themeFnRE } from './theme'
import { handleScreen } from './screen'
import { handleApply } from './apply'

export interface TransformerDirectivesOptions {
  enforce?: SourceCodeTransformer['enforce']
  /**
   * Treat CSS variables as directives for CSS syntax compatible.
   *
   * Pass `false` to disable, or a string to use as a prefix.
   *
   * @default '--at-'
   */
  varStyle?: false | string

  /**
   * Throw an error if utils or themes are not found.
   *
   * @default true
   */
  throwOnMissing?: boolean
  /**
   * Overwrite code with offset
   *
   * @default 0
   */
  offset?: number
}

export interface TransformerDirectivesContext {
  code: MagicString
  node: Atrule | Declaration | Rule
  uno: UnoGenerator
}

export default function transformerDirectives(options: TransformerDirectivesOptions = {}): SourceCodeTransformer {
  return {
    name: 'css-directive',
    enforce: options?.enforce,
    idFilter: id => !!id.match(cssIdRE),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, options, id)
    },
  }
}

export async function transformDirectives(
  code: MagicString,
  uno: UnoGenerator,
  options: TransformerDirectivesOptions,
  filename?: string,
  originalCode?: string,
) {
  const { varStyle = '--at-' } = options

  const isApply = code.original.includes('@apply') || (varStyle !== false && code.original.includes(varStyle))
  const isScreen = code.original.includes('@screen')
  const hasThemeFn = code.original.match(themeFnRE)

  if (!isApply && !hasThemeFn && !isScreen)
    return

  const ast = parse(originalCode || code.original, {
    parseAtrulePrelude: false,
    positions: true,
    filename,
  })

  if (ast.type !== 'StyleSheet')
    return

  const stack: Promise<void>[] = []

  const processNode = async (node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
    if (isScreen && node.type === 'Atrule')
      handleScreen(options, { uno, code, node })

    if (hasThemeFn && node.type === 'Declaration')
      handleThemeFn(options, { uno, code, node })

    if (isApply && node.type === 'Rule')
      await handleApply(options, { uno, code, node }, filename)
  }

  walk(ast, (...args) => stack.push(processNode(...args)))

  await Promise.all(stack)
}
