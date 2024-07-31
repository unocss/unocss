import type { ESLintUtils } from '@typescript-eslint/utils'
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/types'
import MagicString from 'magic-string'
import { createRule, syncAction } from './_'

export const IGNORE_ATTRIBUTES = ['style', 'class', 'classname', 'value']

export default createRule({
  name: 'order-attributify',
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Order of UnoCSS attributes',
      recommended: 'recommended',
    },
    messages: {
      'invalid-order': 'UnoCSS attributes are not ordered',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const scriptVisitor: RuleListener = {
    }

    const templateBodyVisitor: RuleListener = {
      VStartTag(node: any) {
        const valueless = node.attributes.filter((i: any) => typeof i.key?.name === 'string' && !IGNORE_ATTRIBUTES.includes(i.key?.name?.toLowerCase()) && i.value == null)
        if (!valueless.length)
          return

        const input = valueless.map((i: any) => i.key.name).join(' ').trim()
        const sorted = syncAction(
          context.settings.unocss?.configPath,
          'sort',
          input,
        )
        if (sorted !== input) {
          context.report({
            node,
            messageId: 'invalid-order',
            fix(fixer) {
              const codeFull = context.getSourceCode()
              const offset = node.range[0]
              const code = codeFull.getText().slice(node.range[0], node.range[1])

              const s = new MagicString(code)

              const sortedNodes = valueless
                .map((i: TSESTree.Node) => [i.range[0] - offset, i.range[1] - offset] as const)
                .sort((a: any, b: any) => b[0] - a[0])

              for (const [start, end] of sortedNodes.slice(1))
                s.remove(start, end)

              s.overwrite(sortedNodes[0][0], sortedNodes[0][1], ` ${sorted.trim()} `)

              return fixer.replaceText(node, s.toString())
            },
          })
        }
      },
    }

    const parserServices = context?.sourceCode.parserServices || context.parserServices
    // @ts-expect-error missing types
    if (parserServices == null || parserServices.defineTemplateBodyVisitor == null) {
      return scriptVisitor
    }
    else {
      // For Vue
      // @ts-expect-error missing types
      return parserServices?.defineTemplateBodyVisitor(templateBodyVisitor, scriptVisitor)
    }
  },
}) as any as ESLintUtils.RuleWithMeta<[], ''>
