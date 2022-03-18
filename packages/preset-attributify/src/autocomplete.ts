import type { AutoCompleteExtractor } from '@unocss/core'

const elementRE = /(.*?<\w[\w:\.$-]*\s)((?:'[\s\S]*?'|"[\s\S]*?"|`[\s\S]*?`|\{[\s\S]*?\}|[^>]*?)*)/
const valuedAttributeRE = /(.*?)([?]|(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:%-]+)(?:=("[^"]*|'[^']*))?/
const splitterRE = /[\s'"`;]+/

export const autocompleteExtractorAttributify: AutoCompleteExtractor = {
  name: 'attributify',
  extract: ({ input, cursor }) => {
    let currentPos = 0

    let matchElement = elementRE.exec(input)
    let attrs: string | undefined
    while (matchElement) {
      const [matched, prefix, content] = matchElement
      currentPos += matchElement.index + prefix.length
      if (cursor > currentPos && cursor <= currentPos + content.length) {
        attrs = content
        break
      }
      currentPos += matched.length - prefix.length
      matchElement = elementRE.exec(input.slice(currentPos))
    }
    if (!attrs) return null
    const elPos = currentPos

    let matchAttribute = valuedAttributeRE.exec(attrs)
    let attrName: string | undefined
    let attrValues: string | undefined
    while (matchAttribute) {
      const [matched, prefix, name, rawValues] = matchAttribute
      currentPos += matchAttribute.index + prefix.length
      const len = matched.length - prefix.length
      if (cursor > currentPos && cursor <= currentPos + len) {
        attrName = name
        attrValues = rawValues?.slice(1)
        break
      }
      currentPos += len
      matchAttribute = valuedAttributeRE.exec(attrs.slice(currentPos - elPos))
    }
    if (!attrName) return null

    if (attrName === 'class' || attrName === 'className') return null
    if (attrValues === undefined) {
      return {
        extracted: attrName,
        reverse(replacement) {
          return {
            range: [currentPos, cursor],
            str: replacement,
          }
        },
      }
    }

    currentPos += attrName.length + 2
    const attrPos = currentPos

    let matchSplit = splitterRE.exec(attrValues)
    let value: string | undefined
    while (matchSplit) {
      const [matched] = matchSplit
      const startPos = currentPos - attrPos
      if (cursor > currentPos && cursor <= currentPos + matchSplit.index) {
        value = attrValues.slice(startPos, startPos + matchSplit.index)
        break
      }
      currentPos += matchSplit.index + matched.length
      matchSplit = splitterRE.exec(attrValues.slice(currentPos - attrPos))
    }
    if (value === undefined)
      value = attrValues.slice(currentPos - attrPos)

    return {
      extracted: `${attrName}-${value}`,
      transformSuggestions(suggestions) {
        return suggestions
          .filter(v => v.startsWith(`${attrName}-`))
          .map(v => v.slice(attrName!.length + 1))
      },
      reverse(replacement) {
        return {
          range: [currentPos, cursor],
          str: replacement.slice(attrName!.length + 1),
        }
      },
    }
  },
}
