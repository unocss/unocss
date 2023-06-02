import path from 'node:path'
import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import { toArray } from '@unocss/core'
import * as babel from '@babel/core'

// @ts-expect-error no types
import ts from '@babel/preset-typescript'

// @ts-expect-error no types
import jsx from '@babel/plugin-syntax-jsx'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null

function createFilter(
  include: FilterPattern,
  exclude: FilterPattern,
): (id: string) => boolean {
  const includePattern = toArray(include || [])
  const excludePattern = toArray(exclude || [])
  return (id: string) => {
    if (excludePattern.some(p => id.match(p)))
      return false
    return includePattern.some(p => id.match(p))
  }
}

export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]

  /**
   * Regex of modules to be included from processing
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: FilterPattern

  /**
   * Regex of modules to exclude from processing
   *
   * @default []
   */
  exclude?: FilterPattern
}

export default function transformerAttributifyJsx(options: TransformerAttributifyJsxOptions = {}): SourceCodeTransformer {
  const {
    blocklist = [],
  } = options

  const isBlocked = (matchedRule: string) => {
    for (const blockedRule of blocklist) {
      if (blockedRule instanceof RegExp) {
        if (blockedRule.test(matchedRule))
          return true
      }
      else if (matchedRule === blockedRule) {
        return true
      }
    }

    return false
  }

  const idFilter = createFilter(
    options.include || [/\.[jt]sx$/, /\.mdx$/],
    options.exclude || [],
  )

  interface InternaalBabelContext {
    tasks: Promise<void>[]
    matched: string[]
  }

  function babelPlugin(uno: UnoGenerator, ctx: InternaalBabelContext): babel.PluginObj {
    return {
      name: '@unocss/transformer-attributify-jsx-babel',
      visitor: {
        JSXAttribute(path) {
          if (path.node.value === null) {
            const attr = babel.types.isJSXNamespacedName(path.node.name)
              ? `${path.node.name.namespace.name}:${path.node.name.name.name}`
              : path.node.name.name

            if (isBlocked(attr))
              return

            if (ctx.matched.includes(attr)) {
              path.node.value = babel.types.stringLiteral('')
            }
            else {
              ctx.tasks.push(
                uno.parseToken(attr).then((matched) => {
                  if (matched)
                    ctx.matched.push(attr)
                }),
              )
            }
          }
        },
      },
    }
  }

  return {
    name: '@unocss/transformer-attributify-jsx-babel',
    enforce: 'pre',
    idFilter,
    async transform(code, id, { uno }) {
      const ctx: InternaalBabelContext = { tasks: [], matched: [] }
      const babelOptions = {
        presets: [ts],
        plugins: [
          babelPlugin(uno, ctx),
          jsx,
        ],
        filename: path.basename(id),
      }
      // extract attributes without a value
      await babel.transformAsync(code.toString(), babelOptions)
      // parse extracted attributes
      await Promise.all(ctx.tasks)
      // add empty value to matched attributes
      const result = await babel.transformAsync(code.toString(), babelOptions)

      if (result)
        code.overwrite(0, code.original.length, result.code || '')
    },
  }
}
