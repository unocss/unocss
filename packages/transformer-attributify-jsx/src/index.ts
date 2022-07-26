import { isRegExp } from 'util/types'
import type { SourceCodeTransformer } from '@unocss/core'

export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]
}

const elementRE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/gs

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

  return {
    name: 'transformer-jsx',
    enforce: 'pre',
    idFilter: id => id.endsWith('.jsx') || id.endsWith('.js') || id.endsWith('.tsx'),
    async transform(code, _, { uno }) {
      for (const item of Array.from(code.toString().matchAll(elementRE))) {
        for (const attr of item[3].matchAll(/([a-zA-Z()#][\[?a-zA-Z0-9-_:()#%\]?]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g)) {
          const matchedRule = attr[0]
          if (!matchedRule.includes('=')
            && await uno.parseToken(matchedRule)
            && !isRuleContainedInBlocklist(matchedRule)
          ) {
            const tag = item[2]
            const startIdx = (item.index || 0) + (attr.index || 0) + tag.length + 1
            const endIdx = startIdx + matchedRule.length
            code.overwrite(startIdx, endIdx, `${matchedRule}=""`)
          }
        }
      }
    },
  }
}
