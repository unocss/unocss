import type { ESLintUtils } from '@typescript-eslint/utils'
import type { ReportFixFunction, RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/types'
import type { AST } from 'vue-eslint-parser'
import { createRule } from './_'

export default createRule<[{ prefix: string, enableFix: boolean }], 'missing'>({
  name: 'enforce-class-compile',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Enforce class compilation',
    },
    messages: {
      missing: 'prefix: `{{prefix}}` is missing',
    },
    schema: [{
      type: 'object',
      properties: {
        prefix: {
          type: 'string',
        },
        enableFix: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
    }],
  },
  defaultOptions: [{ prefix: ':uno:', enableFix: true }],
  create(context, [mergedOptions]) {
    const CLASS_COMPILE_PREFIX = `${mergedOptions.prefix} `
    const ENABLE_FIX = mergedOptions.enableFix

    function report({ node, fix }: { node: AST.VNode | AST.ESLintNode, fix: ReportFixFunction }) {
      context.report({
        node: node as unknown as TSESTree.Node,
        loc: node.loc,
        messageId: 'missing',
        data: { prefix: CLASS_COMPILE_PREFIX.trim() },
        fix: (...args) => ENABLE_FIX ? fix(...args) : null,
      })
    }

    const scriptVisitor: RuleListener = {
      JSXAttribute(_node) {
        // todo: add support | NEED HELP
      },
      SvelteAttribute(_node: any) {
        // todo: add support | NEED HELP
      },
    }

    const reportClassList = (node: AST.VNode | AST.ESLintNode, classList: string) => {
      if (classList.startsWith(CLASS_COMPILE_PREFIX))
        return

      report({
        node,
        fix(fixer) {
          return fixer.replaceTextRange([node.range[0] + 1, node.range[1] - 1], `${CLASS_COMPILE_PREFIX}${classList}`)
        },
      })
    }

    const templateBodyVisitor: RuleListener = {
      [`VAttribute[key.name=class]`](attr: AST.VAttribute) {
        const valueNode = attr.value
        if (!valueNode || !valueNode.value)
          return

        reportClassList(valueNode, valueNode.value)
      },
      [`VAttribute[key.argument.name=class] VExpressionContainer Literal:not(ConditionalExpression .test Literal):not(Property .value Literal)`](
        literal: AST.ESLintStringLiteral,
      ) {
        if (!literal.value || typeof literal.value !== 'string')
          return

        reportClassList(literal, literal.value)
      },
      [`VAttribute[key.argument.name=class] VExpressionContainer TemplateElement`](
        templateElement: AST.ESLintTemplateElement,
      ) {
        if (!templateElement.value.raw)
          return

        reportClassList(templateElement, templateElement.value.raw)
      },
      [`VAttribute[key.argument.name=class] VExpressionContainer Property`](
        property: AST.ESLintProperty,
      ) {
        if (property.key.type !== 'Identifier')
          return

        const classListString = property.key.name
        if (classListString.startsWith(CLASS_COMPILE_PREFIX))
          return

        report({
          node: property.key,
          fix(fixer) {
            let replacePropertyKeyText = `'${CLASS_COMPILE_PREFIX}${classListString}'`

            if (property.shorthand)
              replacePropertyKeyText = `${replacePropertyKeyText}: ${classListString}`

            return fixer.replaceTextRange(property.key.range, replacePropertyKeyText)
          },
        })
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
