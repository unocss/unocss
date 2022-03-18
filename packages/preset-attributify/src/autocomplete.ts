import type { AutoCompleteExtractor } from '@unocss/core'

const elementRE = /(<\w[\w:\.$-]*\s)((?:'[\s\S]*?'|"[\s\S]*?"|`[\s\S]*?`|\{[\s\S]*?\}|[^>]*?)*)/g
const valuedAttributeRE = /([?]|(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:%-]+)(?:=("[^"]*|'[^']*))?/g
const splitterRE = /[\s'"`;]+/

export const autocompleteExtractorAttributify: AutoCompleteExtractor = {
  name: 'attributify',
  extract: ({ input, cursor }) => {
    const matchedElements = input.matchAll(elementRE)
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
    if (!attrs) return null

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
    if (!attrName) return null

    if (attrName === 'class' || attrName === 'className') return null
    if (attrValues === undefined) {
      return {
        extracted: attrName,
        reverse(replacement) {
          return {
            range: [attrsPos, cursor],
            str: replacement,
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

    return {
      extracted: `${attrName}-${value}`,
      transformSuggestions(suggestions) {
        return suggestions
          .filter(v => v.startsWith(`${attrName}-`))
          .map(v => v.slice(attrName!.length + 1))
      },
      reverse(replacement) {
        return {
          range: [currentPos + attrValuePos, cursor],
          str: replacement.slice(attrName!.length + 1),
        }
      },
    }
  },
}
