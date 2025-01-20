import type { UnoGenerator } from '@unocss/core'
import type { CssNode, Rule } from 'css-tree'
import type MagicString from 'magic-string'
import { parse, walk } from 'css-tree'
import { getUtils } from './getUtils'
import { removeOuterQuotes } from './removeOuterQuotes'
import { writeUtilStyles } from './writeUtilStyles'

interface TransformApplyContext {
  s: MagicString
  uno: UnoGenerator
  applyVariables: string[]
}

export async function transformApply(ctx: TransformApplyContext): Promise<MagicString> {
  const ast = parse(ctx.s.original, {
    parseAtrulePrelude: false,
    positions: true,
  })

  if (ast.type !== 'StyleSheet')
    return ctx.s

  const stack: Promise<void>[] = []

  walk(ast, (node) => {
    if (node.type === 'Rule')
      stack.push(handleApply(ctx, node))
  })

  await Promise.all(stack)

  return ctx.s
}

/** transformerDirectives's handleApply function checks for style nesting (childNode.type === 'Raw') but we are not supporting it here as it is not valid syntax in Svelte style tags. If browser support becomes mainstream and Svelte updates in kind, we can support that. */
async function handleApply(ctx: TransformApplyContext, node: Rule) {
  const parsePromises = node.block.children.map(async (childNode) => {
    await parseApply(ctx, node, childNode)
  })
  await Promise.all(parsePromises)
}

async function parseApply({ s, uno, applyVariables }: TransformApplyContext, node: Rule, childNode: CssNode) {
  const body = getChildNodeValue(childNode, applyVariables)
  if (!body)
    return

  const utils = await getUtils(body, uno)
  if (!utils.length)
    return

  for (const util of utils)
    writeUtilStyles(util, s, node, childNode)

  s.remove(childNode!.loc!.start.offset, childNode!.loc!.end.offset)
}

function getChildNodeValue(childNode: CssNode, applyVariables: string[]): string | undefined {
  if (childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude && childNode.prelude.type === 'Raw')
    return childNode.prelude.value.trim()

  if (childNode!.type === 'Declaration' && applyVariables.includes(childNode.property) && childNode.value.type === 'Raw')
    return removeOuterQuotes(childNode.value.value.trim())
}

// const emptyRulesetsRE = /[^}]+{\s*}/g
// Changed to not removing empty rulesets (occur when using apply with only more complicated utilities) in favor of being able to easily output CSS sourcemaps. Since the parseApply function already removes the --at-apply line from the interior of a ruleset, we can't use magic-string's remove on the entire ruleset. It would have been nice for component library authors, but it will make the code very complex and the Svelte compiler will strip out the empty ruleset anyways.
