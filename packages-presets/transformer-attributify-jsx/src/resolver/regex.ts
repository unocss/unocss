import type { AttributifyResolverParams } from '..'

// eslint-disable-next-line regexp/no-super-linear-backtracking
const elementRE = /<([^/?<>0-9$_!][^\s>]*)\s+((?:"[^"]*"|'[^"]*'|(\{[^}]*\})|[^{>])+)>/g
const attributeRE = /(?<![~`!$%^&*()_+\-=[{;':"|,.<>/?])([a-z()#][[?\w\-:()#%\]]*)(?:\s*=\s*('[^']*'|"[^"]*"|\S+))?|\{[^}]*\}/gi
// eslint-disable-next-line regexp/no-super-linear-backtracking
const valuedAttributeRE = /((?!\d|-{2}|-\d)[\w\u00A0-\uFFFF:!%.~<-]+)=(?:"[^"]*"|'[^']*'|(\{)((?:[`(][^`)]*[`)]|[^}])+)(\}))/g

export async function attributifyJsxRegexResolver(params: AttributifyResolverParams) {
  const { code, uno, isBlocked } = params
  const tasks: Promise<void>[] = []
  const attributify = uno.config.presets.find(i => i.name === '@unocss/preset-attributify')
  const attributifyPrefix = attributify?.options?.prefix ?? 'un-'
  for (const item of Array.from(code.original.matchAll(elementRE))) {
    // Extract the JSX attributes portion and mask complex valued attributes with whitespace for attributify processing
    let attributifyPart = item[2]
    if (valuedAttributeRE.test(attributifyPart)) {
      attributifyPart = attributifyPart.replace(valuedAttributeRE, (match, _, dynamicFlagStart) => {
        if (!dynamicFlagStart)
          return ' '.repeat(match.length)
        let preLastModifierIndex = 0
        let temp = match
        // No more recursive processing of the more complex situations of JSX in attributes.
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
      const matchedRule = attr[0]
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
}
