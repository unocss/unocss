import type { SourceCodeTransformer } from '@unocss/core'
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

// eslint-disable-next-line regexp/no-super-linear-backtracking
const elementRE = /<([^/?<>0-9$_!][^\s>]*)\s+((?:"[^"]*"|'[^"]*'|(\{[^}]*\})|[^{>])+)>/g
const attributeRE = /(?<![~`!$%^&*()_+\-=[{;':"|,.<>/?]\s*)([a-z()#][[?\w\-:()#%\]]*)(?:\s*=\s*('[^']*'|"[^"]*"|\S+))?/gi
// eslint-disable-next-line regexp/no-super-linear-backtracking
const valuedAttributeRE = /((?!\d|-{2}|-\d)[\w\u00A0-\uFFFF:!%.~<-]+)=(?:"[^"]*"|'[^']*'|(\{)((?:[`(][^`)]*[`)]|[^}])+)(\}))/g

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
      const tasks: Promise<void>[] = []
      const attributify = uno.config.presets.find(i => i.name === '@unocss/preset-attributify')
      const attributifyPrefix = attributify?.options?.prefix ?? 'un-'
      for (const item of Array.from(code.original.matchAll(elementRE))) {
        // Get the length of the className part, and replace it with the equal length of empty string
        let attributifyPart = item[2]
        if (valuedAttributeRE.test(attributifyPart)) {
          attributifyPart = attributifyPart.replace(valuedAttributeRE, (match, _, dynamicFlagStart) => {
            if (!dynamicFlagStart)
              return ' '.repeat(match.length)
            let preLastModifierIndex = 0
            let temp = match
            // No more recursively processing the more complex situations of jsx in attributes.
            for (const _item of match.matchAll(elementRE)) {
              const attrAttributePart = _item[2]
              if (valuedAttributeRE.test(attrAttributePart))
                attrAttributePart.replace(valuedAttributeRE, (m: string) => ' '.repeat(m.length))

              const pre = temp.slice(0, preLastModifierIndex) + ' '.repeat(_item.index + _item[0].indexOf(_item[2]) - preLastModifierIndex) + attrAttributePart
              temp = pre + ' '.repeat(_item.input.length - pre.length)
              preLastModifierIndex = pre.length
            }
            if (preLastModifierIndex !== 0)
              return temp

            return ' '.repeat(match.length)
          })
        }
        for (const attr of attributifyPart.matchAll(attributeRE)) {
          const matchedRule = attr[0].replace(/:/, '-')
          if (matchedRule.includes('=') || isBlocked(matchedRule))
            continue
          const updatedMatchedRule = matchedRule.startsWith(attributifyPrefix) ? matchedRule.slice(attributifyPrefix.length) : matchedRule
          tasks.push(uno.parseToken(updatedMatchedRule).then((matched) => {
            if (matched) {
              const startIdx = (item.index || 0) + (attr.index || 0) + item[0].indexOf(item[2])
              const endIdx = startIdx + matchedRule.length
              code.overwrite(startIdx, endIdx, `${matchedRule}=""`)
            }
          }))
        }
      }

      await Promise.all(tasks)
    },
  }
}
