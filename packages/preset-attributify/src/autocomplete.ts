import type { AutoCompleteExtractor } from '@unocss/core'
import { variantsRE } from './variant'
import type { AttributifyOptions } from '.'

// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-dupe-disjunctions
const elementRE = /(<\w[\w:.$-]*\s)((?:'[^>']*'|"[^>"]*"|`[^>`]*`|\{[^>}]*\}|[^>]*?)*)/g
const valuedAttributeRE = /(\?|(?!\d|-{2}|-\d)[\w\u00A0-\uFFFF-:%]+)(?:=("[^"]*|'[^']*))?/g
const splitterRE = /[\s'"`;>]+/

export function autocompleteExtractorAttributify(options?: AttributifyOptions): AutoCompleteExtractor {
  return {
    name: 'attributify',
    extract: ({ content, cursor }) => {
      const matchedElements = content.matchAll(elementRE)
      let attrs: string | undefined
      let elPos = 0
      for (const match of matchedElements) {
        const [, prefix, content] = match
        const currentPos = match.index! + prefix.length
        if (cursor > currentPos && cursor <= currentPos + content.length) {
          elPos = currentPos
          attrs = content
          break
        }
      }
      if (!attrs)
        return null

      const matchedAttributes = attrs.matchAll(valuedAttributeRE)
      let attrsPos = 0
      let attrName: string | undefined
      let attrValues: string | undefined
      for (const match of matchedAttributes) {
        const [matched, name, rawValues] = match
        const currentPos = elPos + match.index!
        if (cursor > currentPos && cursor <= currentPos + matched.length) {
          attrsPos = currentPos
          attrName = name
          attrValues = rawValues?.slice(1)
          break
        }
      }
      if (!attrName)
        return null

      if (attrName === 'class' || attrName === 'className' || attrName === ':class')
        return null

      const hasPrefix = !!options?.prefix && attrName.startsWith(options.prefix)
      if (options?.prefixedOnly && !hasPrefix)
        return null

      const attrNameWithoutPrefix = hasPrefix ? attrName.slice(options.prefix!.length) : attrName

      if (attrValues === undefined) {
        return {
          extracted: attrNameWithoutPrefix,
          resolveReplacement(suggestion) {
            const startOffset = hasPrefix ? options.prefix!.length : 0
            return {
              start: attrsPos + startOffset,
              end: attrsPos + attrName!.length,
              replacement: suggestion,
            }
          },
        }
      }

      const attrValuePos = attrsPos + attrName.length + 2

      let matchSplit = splitterRE.exec(attrValues)
      let currentPos = 0
      let value: string | undefined
      while (matchSplit) {
        const [matched] = matchSplit
        if (cursor > attrValuePos + currentPos
          && cursor <= attrValuePos + currentPos + matchSplit.index) {
          value = attrValues.slice(currentPos, currentPos + matchSplit.index)
          break
        }
        currentPos += matchSplit.index + matched.length
        matchSplit = splitterRE.exec(attrValues.slice(currentPos))
      }
      if (value === undefined)
        value = attrValues.slice(currentPos)

      const [, variants = '', body] = value.match(variantsRE) || []

      return {
        extracted: `${variants}${attrNameWithoutPrefix}-${body}`,
        transformSuggestions(suggestions) {
          return suggestions
            .filter(v => v.startsWith(`${variants}${attrNameWithoutPrefix}-`))
            .map(v => variants + v.slice(variants.length + attrNameWithoutPrefix!.length + 1))
        },
        resolveReplacement(suggestion) {
          return {
            start: currentPos + attrValuePos,
            end: currentPos + attrValuePos + value!.length,
            replacement: variants + suggestion.slice(variants.length + attrNameWithoutPrefix!.length + 1),
          }
        },
      }
    },
  }
}
