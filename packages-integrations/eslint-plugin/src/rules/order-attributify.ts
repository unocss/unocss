import type { TSESTree } from '@typescript-eslint/types'
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint'
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
    },
    messages: {
      'invalid-order': 'UnoCSS attributes are not ordered',
    },
    schema: [],
    defaultOptions: [],
  },
  create(context) {
    const scriptVisitor: RuleListener = {
    }

    const templateBodyVisitor: RuleListener = {
      VStartTag(node: any) {
        // Identify valueless attributes that should be sorted
        const valueless = node.attributes.filter((i: any) => {
          const name = i.key?.name
          if (typeof name !== 'string')
            return false
          if (IGNORE_ATTRIBUTES.includes(name.toLowerCase()))
            return false

          const val = i.value
          // Vue parser may provide empty values for boolean attributes
          return val == null || val === true || (typeof val === 'object' && !('expression' in val) && val.value === '')
        })

        if (!valueless.length)
          return

        const input = valueless.map((i: any) => i.key.name).join(' ').trim()

        // Get sorted classes and normalize whitespace
        const sorted = syncAction(
          context.settings.unocss?.configPath,
          'sort',
          input,
          context.filename,
        ).trim()

        // Compare sorted string with input string
        if (sorted !== input) {
          context.report({
            node,
            messageId: 'invalid-order',
            fix(fixer) {
              const offset = node.range[0]
              const code = context.sourceCode.getText().slice(node.range[0], node.range[1])

              const s = new MagicString(code)

              const sortedNodes = valueless
                .map((i: TSESTree.Node) => [i.range[0] - offset, i.range[1] - offset] as const)
                .sort((a: any, b: any) => b[0] - a[0])

              for (const [start, end] of sortedNodes.slice(1))
                s.remove(start, end)

              s.overwrite(sortedNodes[0][0], sortedNodes[0][1], ` ${sorted} `)

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
})
