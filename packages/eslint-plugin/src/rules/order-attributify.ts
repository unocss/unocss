import { join } from 'path'
import { ESLintUtils } from '@typescript-eslint/utils'
import { createSyncFn } from 'synckit'
import type { RuleListener } from '@typescript-eslint/utils/dist/ts-eslint'
import type { TSESTree } from '@typescript-eslint/types'
import MagicString from 'magic-string'
import { distDir } from '../dirs'

const sortClasses = createSyncFn<(classes: string) => Promise<string>>(join(distDir, 'worker-sort.cjs'))

const INGORE_ATTRIBUTES = ['style', 'class', 'classname', 'value']

export default ESLintUtils.RuleCreator(name => name)({
  name: 'order-attributify',
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Order of UnoCSS attributes',
      recommended: false,
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
        const valueless = node.attributes.filter((i: any) => typeof i.key?.name === 'string' && !INGORE_ATTRIBUTES.includes(i.key?.name?.toLowerCase()) && i.value == null)
        if (!valueless.length)
          return

        const input = valueless.map((i: any) => i.key.name).join(' ').trim()
        const sorted = sortClasses(input)
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

              for (let [start, end] of sortedNodes.slice(1)) {
                if (code[start - 1] === ' ')
                  start--
                if (code[end] === ' ')
                  end++
                s.remove(start, end)
              }

              s.overwrite(sortedNodes[0][0], sortedNodes[0][1], ` ${sorted.trim()} `)

              return fixer.replaceText(node, s.toString())
            },
          })
        }
      },
    }

    // @ts-expect-error missing-types
    if (context.parserServices == null || context.parserServices.defineTemplateBodyVisitor == null) {
      return scriptVisitor
    }
    else {
      // For Vue
      // @ts-expect-error missing-types
      return context.parserServices?.defineTemplateBodyVisitor(templateBodyVisitor, scriptVisitor)
    }
  },
})
