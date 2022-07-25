import type { SourceCodeTransformer } from '@unocss/core'

const elementRE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/gs

export default function transformerAttributifyJsx(): SourceCodeTransformer {
  return {
    name: 'attributify-jsx',
    enforce: 'pre',
    transform(code) {
      Array.from(code.toString().matchAll(elementRE)).forEach((item) => {
        for (const attr of item[3].matchAll(/([a-zA-Z()#][a-zA-Z0-9-_:()#]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g)) {
          if (!attr[0].includes('=')) {
            const matchedRule = attr[0]
            const tag = item[2]
            const startIdx = (item.index || 0) + (attr.index || 0) + tag.length + 1
            const endIdx = startIdx + matchedRule.length
            code.overwrite(startIdx, endIdx, `${matchedRule}=""`)
          }
        }
      })
    },
  }
}
