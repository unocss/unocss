import type { SourceCodeTransformer } from '@unocss/core'
import process from 'node:process'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { toArray } from '@unocss/core'

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

  return {
    name: '@unocss/transformer-attributify-jsx',
    enforce: 'pre',
    idFilter,
    async transform(code, _, { uno }) {
      // Skip if running in VSCode extension context
      if (process.env.VSCODE_CWD)
        return
      const tasks: Promise<void>[] = []
      const ast = parse(code.toString(), {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })

      traverse(ast, {
        JSXAttribute(path) {
          if (path.node.value === null) {
            const attr = path.node.name.type === 'JSXNamespacedName'
              ? `${path.node.name.namespace.name}:${path.node.name.name.name}`
              : path.node.name.name

            if (isBlocked(attr))
              return

            tasks.push(
              uno.parseToken(attr).then((matched) => {
                if (matched) {
                  code.appendRight(path.node.end!, '=""')
                }
              }),
            )
          }
        },
      })

      await Promise.all(tasks)
    },
  }
}
