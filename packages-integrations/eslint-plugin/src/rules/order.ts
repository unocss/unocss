import type { TSESTree } from '@typescript-eslint/types'
import type { AnyRuleModule, RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { SvelteAttribute, SvelteLiteral, SvelteMustacheTag } from 'svelte-eslint-parser/lib/ast/html'
import { AST_TOKEN_TYPES } from '@typescript-eslint/types'
import { AST_NODES_WITH_QUOTES, CLASS_FIELDS } from '../constants'
import { createRule, syncAction } from './_'

export default createRule({
  name: 'order',
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Order of UnoCSS utilities in class attribute',
    },
    messages: {
      'invalid-order': 'UnoCSS utilities are not ordered',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkLiteral(node: TSESTree.Literal | SvelteLiteral, addSpace?: 'before' | 'after' | undefined) {
      if (typeof node.value !== 'string' || !node.value.trim())
        return
      const input = node.value
      let sorted = syncAction(
        context.settings.unocss?.configPath,
        'sort',
        input,
      ).trim()

      if (addSpace === 'before')
        sorted = ` ${sorted}`
      else if (addSpace === 'after')
        sorted += ' '

      if (sorted !== input) {
        const nodeOrToken: TSESTree.Token | TSESTree.Node = node.type === 'SvelteLiteral' ? { type: AST_TOKEN_TYPES.String, value: node.value, loc: node.loc, range: node.range } : node

        context.report({
          node: nodeOrToken,
          loc: node.loc,
          messageId: 'invalid-order',
          fix(fixer) {
            if (AST_NODES_WITH_QUOTES.includes(node.type))
              return fixer.replaceTextRange([node.range[0] + 1, node.range[1] - 1], sorted)
            else
              return fixer.replaceText(nodeOrToken, sorted)
          },
        })
      }
    }

    const scriptVisitor: RuleListener = {
      JSXAttribute(node) {
        if (typeof node.name.name === 'string' && CLASS_FIELDS.includes(node.name.name.toLowerCase()) && node.value) {
          if (node.value.type === 'Literal')
            checkLiteral(node.value)
          else if (node.value.type === 'JSXExpressionContainer' && node.value.expression.type === 'Literal')
            checkLiteral(node.value.expression)
        }
      },
      SvelteAttribute(node: SvelteAttribute) {
        if (node.key.name === 'class') {
          if (!node.value.length)
            return

          function checkExpressionRecursively(expression: SvelteMustacheTag['expression']) {
            if (expression.type !== 'ConditionalExpression')
              return

            if (expression.consequent.type === 'Literal') {
              checkLiteral(expression.consequent as TSESTree.Literal)
            }
            if (expression.alternate) {
              if (expression.alternate.type === 'ConditionalExpression') {
                checkExpressionRecursively(expression.alternate)
              }
              else if (expression.alternate.type === 'Literal') {
                checkLiteral(expression.alternate as TSESTree.Literal)
              }
            }
          }

          (node.value).forEach((obj, i) => {
            if (obj.type === 'SvelteMustacheTag') {
              checkExpressionRecursively(obj.expression)
            }
            else if (obj.type === 'SvelteLiteral') {
              const addSpace: 'before' | 'after' | undefined = node.value?.[i - 1]?.type === 'SvelteMustacheTag' ? 'before' : node.value?.[i + 1]?.type === 'SvelteMustacheTag' ? 'after' : undefined

              checkLiteral(obj, addSpace)
            }
          })
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
}) as any as AnyRuleModule
