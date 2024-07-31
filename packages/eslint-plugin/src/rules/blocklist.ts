import type { ESLintUtils } from '@typescript-eslint/utils'
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/types'
import { CLASS_FIELDS } from '../constants'
import { createRule, syncAction } from './_'
import { IGNORE_ATTRIBUTES } from './order-attributify'

export default createRule({
  name: 'blocklist',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Utilities in UnoCSS blocklist',
      recommended: 'recommended',
    },
    messages: {
      'in-blocklist': '\"{{name}}\" is in blocklist{{reason}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const checkLiteral = (node: TSESTree.Literal) => {
      if (typeof node.value !== 'string' || !node.value.trim())
        return
      const input = node.value

      const blocked = syncAction(
        context.settings.unocss?.configPath,
        'blocklist',
        input,
        context.filename,
      )
      blocked.forEach(([name, meta]) => {
        context.report({
          node,
          messageId: 'in-blocklist',
          data: {
            name,
            reason: meta?.message ? `: ${meta.message}` : '',
          },
        })
      })
    }

    const scriptVisitor: RuleListener = {
      JSXAttribute(node) {
        if (typeof node.name.name === 'string' && CLASS_FIELDS.includes(node.name.name.toLowerCase()) && node.value) {
          if (node.value.type === 'Literal')
            checkLiteral(node.value)
        }
      },
      SvelteAttribute(node: any) {
        if (node.key.name === 'class') {
          if (node.value?.[0].type === 'SvelteLiteral')
            checkLiteral(node.value[0])
        }
      },
    }

    const templateBodyVisitor: RuleListener = {
      VAttribute(node: any) {
        if (node.key.name === 'class') {
          if (node.value.type === 'VLiteral')
            checkLiteral(node.value)
        }
      },
      // Attributify
      VStartTag(node: any) {
        const valueless = node.attributes.filter((i: any) => typeof i.key?.name === 'string' && !IGNORE_ATTRIBUTES.includes(i.key?.name?.toLowerCase()) && i.value == null)
        if (!valueless.length)
          return

        for (const node of valueless) {
          if (!node?.key?.name)
            continue
          const blocked = syncAction(
            context.settings.unocss?.configPath,
            'blocklist',
            node.key.name,
            context.filename,
          )
          blocked.forEach(([name, meta]) => {
            context.report({
              node,
              messageId: 'in-blocklist',
              data: {
                name,
                reason: meta?.message ? `: ${meta.message}` : '',
              },
            })
          })
        }
      },
    }

    const parserServices = context?.sourceCode.parserServices || context.parserServices
    // @ts-expect-error missing-types
    if (parserServices == null || parserServices.defineTemplateBodyVisitor == null) {
      return scriptVisitor
    }
    else {
      // For Vue
      // @ts-expect-error missing-types
      return parserServices?.defineTemplateBodyVisitor(templateBodyVisitor, scriptVisitor)
    }
  },
}) as any as ESLintUtils.RuleWithMeta<[], ''>
