import { isRegExp } from 'util/types'
import type { SourceCodeTransformer } from '@unocss/core'
import type { FilterPattern } from '@rollup/pluginutils'
import { createFilter } from '@rollup/pluginutils'

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

const elementRE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/gs
const attributeRE = /([a-zA-Z()#][\[?a-zA-Z0-9-_:()#%\]?]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g

export default function transformerAttributifyJsx(options: TransformerAttributifyJsxOptions = {}): SourceCodeTransformer {
  if (!options.blocklist)
    options.blocklist = []

  const isRuleContainedInBlocklist = (matchedRule: string) => {
    if (options.blocklist!.includes(matchedRule)) {
      return true
    }
    else {
      for (const blockedRule of options.blocklist!) {
        if (isRegExp(blockedRule) && blockedRule.test(matchedRule))
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
    name: 'transformer-jsx',
    enforce: 'pre',
    idFilter,
    async transform(code, _, { uno }) {
      const tasks: Promise<void>[] = []

      for (const item of Array.from(code.toString().matchAll(elementRE))) {
        for (const attr of item[3].matchAll(attributeRE)) {
          const matchedRule = attr[0]
          if (matchedRule.includes('=')
          || isRuleContainedInBlocklist(matchedRule))
            return

          tasks.push((async () => {
            if (await uno.parseToken(matchedRule)) {
              const tag = item[2]
              const startIdx = (item.index || 0) + (attr.index || 0) + tag.length + 1
              const endIdx = startIdx + matchedRule.length
              code.overwrite(startIdx, endIdx, `${matchedRule}=""`)
            }
          })())
        }
      }

      await Promise.all(tasks)
    },
  }
}
