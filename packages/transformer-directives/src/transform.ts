import type { UnoGenerator } from '@unocss/core'
import type { CssNode, List, ListItem } from 'css-tree'
import type MagicString from 'magic-string'
import type { TransformerDirectivesContext, TransformerDirectivesOptions } from './types'
import { toArray } from '@unocss/core'
import { hasThemeFn as hasThemeFunction } from '@unocss/rule-utils'
import { parse, walk } from 'css-tree'
import { handleApply } from './apply'
import { handleFunction } from './functions'
import { handleScreen } from './screen'

interface EmbedCssStylePosition {
  startOffset: number
  startLine: number
  startColumn: number
}

export async function transformDirectives(
  code: MagicString,
  uno: UnoGenerator,
  options: TransformerDirectivesOptions,
  filename?: string,
  originalCode?: string,
  offset?: number,
) {
  let { applyVariable } = options
  const varStyle = options.varStyle
  if (applyVariable === undefined) {
    if (varStyle !== undefined)
      applyVariable = varStyle ? [`${varStyle}apply`] : []
    applyVariable = ['--at-apply', '--uno-apply', '--uno']
  }
  applyVariable = toArray(applyVariable || [])

  const parseCode = originalCode || code.original
  const hasApply = parseCode.includes('@apply') || applyVariable.some(s => parseCode.includes(s))
  const hasScreen = parseCode.includes('@screen')
  const hasThemeFn = hasThemeFunction(parseCode)

  if (!hasApply && !hasThemeFn && !hasScreen)
    return

  const handleTransformDirectives = async (cssCode: string, position?: EmbedCssStylePosition) => {
    const ast = parse(cssCode, {
      parseCustomProperty: true,
      parseAtrulePrelude: false,
      positions: true,

      filename,
      line: position?.startLine,
      offset: position?.startOffset ?? offset,
      column: position?.startColumn,
    })

    if (ast.type !== 'StyleSheet')
      return

    const stack: Promise<void>[] = []
    const ctx: TransformerDirectivesContext = {
      options,
      applyVariable,
      uno,
      code,
      filename,
      offset,
    }

    const processNode = async (node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
      if (hasScreen && node.type === 'Atrule')
        handleScreen(ctx, node)

      if (node.type === 'Function')
        handleFunction(ctx, node)

      if (hasApply && node.type === 'Rule')
        await handleApply(ctx, node)
    }

    walk(ast, (...args) => stack.push(processNode(...args)))

    await Promise.all(stack)
  }

  // Two Cases:
  // 1. Complete stylesheet (e.g. .css file)
  // 2. Stylesheet embed in code as <style> </style>
  const STYLE_CHECK_RE = /<style[^>]*>[\s\S]*?<\/style>/i
  // Note: STYLE_RE is stateful with g flag
  if (!STYLE_CHECK_RE.test(parseCode)) {
    await handleTransformDirectives(parseCode)
  }
  else {
    const computePosition = (index: number): EmbedCssStylePosition => {
      const prefix = parseCode.slice(0, index)
      const lines = prefix.split('\n')
      return {
        startOffset: index,
        startLine: lines.length,
        startColumn: lines[lines.length - 1].length,
      }
    }

    const STYLE_RE = /(<style[^>]*>)([\s\S]*?)<\/style>/gi
    for (const match of Array.from(parseCode.matchAll(STYLE_RE))) {
      const cssStartIndex = match.index + match[1].length
      const position = computePosition(cssStartIndex)
      await handleTransformDirectives(match[2], position)
    }
  }
}
