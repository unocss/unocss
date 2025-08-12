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
    schema: [
      {
        type: 'object',
        properties: {
          unoFunctions: {
            type: 'array',
            items: { type: 'string' },
          },
          unoVariables: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      unoFunctions: ['clsx', 'classnames'],
      unoVariables: ['^cls', 'classNames?$'], // for example `clsButton = ''` or `buttonClassNames = {}`
    },
  ],
  create(context) {
    let { unoFunctions = ['clsx', 'classnames'], unoVariables = ['^cls', 'classNames?$'] } = context.options[0] || {}

    unoFunctions = unoFunctions.map(name => name.toLowerCase())
    function isUnoFunction(name: string) {
      return unoFunctions.includes(name.toLowerCase())
    }

    const unoVariablesRegexes = unoVariables.map(regex => new RegExp(regex, 'i'))
    function isUnoVariable(name: string) {
      return unoVariablesRegexes.some(reg => reg.test(name))
    }

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

    function checkTemplateElement(quasi: TSESTree.TemplateElement) {
      const input = quasi.value.raw
      if (!input)
        return

      const getRange = () => {
        const text = context.sourceCode.getText(quasi)
        const raw = quasi.value.raw
        if (!text.includes(raw))
          return
        const rawStart = text.indexOf(raw)
        const start = quasi.range[0] + rawStart
        const end = quasi.range[0] + rawStart + raw.length
        if (start < quasi.range[0] || end > quasi.range[1])
          return
        return [start, end] as const
      }
      const realRange = getRange()
      if (!realRange)
        return

      let sorted = syncAction(
        context.settings.unocss?.configPath,
        'sort',
        input,
      ).trim()
      if (/^\s/.test(input))
        sorted = ` ${sorted}`
      if (/\s$/.test(input))
        sorted += ' '

      if (sorted !== input) {
        context.report({
          node: quasi,
          loc: quasi.loc,
          messageId: 'invalid-order',
          fix(fixer) {
            const realRange = getRange()
            if (!realRange)
              return null
            return fixer.replaceTextRange(realRange, sorted)
          },
        })
      }
    }

    // check if `checkPossibleLiteral` will handle this `node` ?
    function isPossibleLiteral(node: TSESTree.Node) {
      return node.type === 'Literal' || node.type === 'TemplateLiteral' || node.type === 'TaggedTemplateExpression'
    }
    function checkPossibleLiteral(...nodes: TSESTree.Expression[]) {
      nodes.forEach((node) => {
        if (!isPossibleLiteral(node))
          return

        if (node.type === 'Literal' && typeof node.value === 'string') {
          return checkLiteral(node)
        }

        // `some-class more-class`
        const isSimpleTemplateLiteral = (node: TSESTree.TemplateLiteral) => {
          return node.expressions.length === 0 && node.quasis.length === 1
        }
        if (node.type === 'TemplateLiteral' && isSimpleTemplateLiteral(node)) {
          return checkTemplateElement(node.quasis[0])
        }

        // String.raw`some-class more-class`
        const isStringRaw = (tag: TSESTree.Expression) => {
          return tag.type === 'MemberExpression'
            && tag.object.type === 'Identifier' && tag.object.name === 'String'
            && tag.property.type === 'Identifier' && tag.property.name === 'raw'
        }
        if (node.type === 'TaggedTemplateExpression' && isStringRaw(node.tag) && isSimpleTemplateLiteral(node.quasi)) {
          return checkTemplateElement(node.quasi.quasis[0])
        }

        // TemplateLiteral with interpolations
        if (node.type === 'TemplateLiteral' && node.expressions.length > 0 && node.quasis.length > 0) {
          return void node.quasis.forEach((quasi) => {
            checkTemplateElement(quasi)
          })
        }
      })
    }

    const scriptVisitor: RuleListener = {
      JSXAttribute(node) {
        if (typeof node.name.name === 'string' && CLASS_FIELDS.includes(node.name.name.toLowerCase()) && node.value) {
          if (isPossibleLiteral(node.value))
            return checkPossibleLiteral(node.value)
          else if (node.value.type === 'JSXExpressionContainer' && isPossibleLiteral(node.value.expression))
            return checkPossibleLiteral(node.value.expression)
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

      // for Future node types
      // https://typescript-eslint.io/play/#ts=5.8.3&showAST=es&fileType=.tsx&code=PTAEDMCcHsFtQBYBckAcDOAuEB3PA6AO1VgCt18BjOYVAQ0oGs6BzAU2EoBt0APAfgZIAlgDc2AFToAjALzUAJm1AAoEKG59OPXvgX4k6FUu51IywnVht09Sss29QAbxWhQSAJ6plAYS506OgAanRcAK7KsqD%2BgegAgpCQdJ6gAD4xAUEAIsKUItCWkKkZ6EiQwoQs6aCE4bDSbJA10sIslUg1dVxcLdDQXGx0hDXhhErglWwKANxuHt5%2BWei5%2BcKFZqnRAEps1JAKADxlFVUANKDDngB8c%2B5ePplxiclbT0GhEWwA2gC6dxAxmtChodAAKfCQyqocKGTDvEJhSJ-ACU8JOlRYcwAvsY9gFzIDCMCRo4IVDiLCsKC%2BPhYh8kT9fmjQBiqnMVNRCGUPDYkABGUDRcqRTmFHlIPkAJiFEDC6DYYu5nUlZQAzLKRYquTy2LxynR6egAHJWKKgADksEgAFoACyoXgWlSDTqmIKm6zo8qY0bjNiTQjTFRqMDoYSwVCDDSBbXLT3msnzC2oG38x2ga02qWOi1neaqgWgfiW6RcaBMC2geEWwiFNh5gvS0AAMhbpfLlfz7mcoAARAg2D1oH34VqLn2cNBIFwFKO5TxlNj8yiQ%2BpYNPlEgEMNQPXQ6AAAaFwVt3llGVni3gQZOw%2BgQD6coB6M1AABloO1KGEAKK8VDmIJ1kIA93FAG1QEGcAkDHPlT3bQspRA9xwIqFhkBrG89SrV9hElZIuAPQBRU0AODkjxPVt22vW8LXvQBJb0AGBVABBNQAwFzXMAD0lSMAklVkfSqA9OXjM1ZSTe5YIoo9MN4Q9u3PIsz0PKTQAAEmcPUDSNBNsRkpsyjg0AAGU%2BJYfBkhwRTb1AaQWBtb5RDMMEbRtdA4DYAAdAB9eyKhkQYUV%2BHSxL0iSjNOEyzIsvUrJsuyHKclzrE87zhF8th-JUtT9WSTSzW0lcgA&eslintrc=N4KABGBEBOCuA2BTAzpAXGYBfEWg&tsconfig=N4KABGBEDGD2C2AHAlgGwKYCcDyiAuysAdgM6QBcYoEEkJemy0eAcgK6qoDCAFutAGsylBm3TgwAXxCSgA&tokens=false
      CallExpression(node) {
        if (!(node.callee.type === 'Identifier' && isUnoFunction(node.callee.name)))
          return

        node.arguments.forEach((arg) => {
          if (isPossibleLiteral(arg)) {
            return checkPossibleLiteral(arg)
          }

          // true ? 'block' : 'none',
          if (arg.type === 'ConditionalExpression') {
            return checkPossibleLiteral(arg.consequent, arg.alternate)
          }

          // true && 'block',
          if (arg.type === 'LogicalExpression') {
            return checkPossibleLiteral(arg.left, arg.right)
          }

          function handleObjectExpression(node: TSESTree.ObjectExpression) {
            node.properties.forEach((p) => {
              if (p.type !== 'Property')
                return

              if (isPossibleLiteral(p.value)) {
                return checkPossibleLiteral(p.value)
              }

              if (p.value.type === 'ObjectExpression') {
                return handleObjectExpression(p.value)
              }
            })

            // {"hello": true, "world": false}
            const keys = node.properties.filter(p => p.type === 'Property').map(p => p.key)
            return checkPossibleLiteral(...keys)
          }

          if (arg.type === 'ObjectExpression') {
            return handleObjectExpression(arg)
          }
        })
      },

      // https://typescript-eslint.io/play/#ts=5.8.2&showAST=es&fileType=.tsx&code=MYewdgzgLgBApgDygJwIYGEA2qIQHKoC2cMAvDAOQBeAtAIwAMDFAUCwPTswBuqyAlqgBGmEgBM4wbGij9wLUJFhSIAIQCuUKODKVCyeq0XQYKjVvAAmXQAN99GABIA3ohQZsuAsQC%2BNheAmZpraYADMtvZ0Tq5IaFg4%2BERwfjA4poFQbJwwIEIAVpKwElJ8qLLyxrBCUGAJXskQus4sMDASAGao6phQAFx6mDSWAA4IFAA0rTAA7vxQABYAonGoAzYdoggw83CEEDTAcGBQcMgwQgDmNDMLuzCnSDQiqMAA1jFu8Z5JvjZTbQQAxabTaAE8BhRCENRuNpj4WAiOFx0lV2pJpOU5GAAkoLrV6r84BBrOQQeiuj1%2BoNhmNJtMgTByeDIdDaXC2gifGkmlUgA&eslintrc=N4KABGBEBOCuA2BTAzpAXGYBfEWg&tsconfig=N4KABGBEDGD2C2AHAlgGwKYCcDyiAuysAdgM6QBcYoEEkJemy0eAcgK6qoDCAFutAGsylBm3TgwAXxCSgA&tokens=false
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || !node.init || !isUnoVariable(node.id.name))
          return

        if (isPossibleLiteral(node.init)) {
          return checkPossibleLiteral(node.init)
        }

        if (node.init.type === 'TSAsExpression' && isPossibleLiteral(node.init.expression)) {
          return checkPossibleLiteral(node.init.expression)
        }

        function handleObjectExpression(node: TSESTree.ObjectExpression) {
          node.properties.forEach((p) => {
            if (p.type !== 'Property')
              return

            if (isPossibleLiteral(p.value)) {
              return checkPossibleLiteral(p.value)
            }

            if (p.value.type === 'ObjectExpression') {
              return handleObjectExpression(p.value)
            }
          })
        }
        if (node.init.type === 'ObjectExpression') {
          return handleObjectExpression(node.init)
        }
        if (node.init.type === 'TSAsExpression' && node.init.expression.type === 'ObjectExpression') {
          return handleObjectExpression(node.init.expression)
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
