import { mergeDeep } from '@unocss/core'
import { DEFAULT } from './default'

function getCSS(
  escapedSelector: string[],
  selectorName: string,
  preflights: object,
  compatibilityMode?: boolean,
): string {
  let css = ''

  for (const selector in preflights) {
    // @ts-expect-error preflights do not have definitive keys
    const cssDeclarationBlock = preflights[selector]
    const notProseSelector = `:not(:where(.not-${selectorName},.not-${selectorName} *))`

    // since pseudo class & elements can't be matched
    // within single :where(), they are splitted and rejoined.
    const pseudoCSSMatchArray = selector
      .split(',')
      .map((s) => {
        // pseudo class & pseudo elements matcher
        // matches :, ::, -, (), numbers and words
        const match = s.match(/::?(?:[\(\)\:\-\d\w]+)$/g)

        if (match) {
          const matchStr = match[0]
          s = s.replace(matchStr, '')
          return escapedSelector.map(e =>
            compatibilityMode
              ? `${e} ${s}${matchStr}`
              : `${e} :where(${s})${notProseSelector}${matchStr}`,
          ).join(',')
        }
        return null
      })
      .filter(v => v)

    // rejoin pseudo class & elements
    // multi selectors, single utility
    if (pseudoCSSMatchArray.length) {
      css += pseudoCSSMatchArray.join(',')
    }
    else {
      // directly from css declaration
      css += escapedSelector.map(e =>
        compatibilityMode
          ? `${e} ${selector}`
          : `${e} :where(${selector})${notProseSelector}`,
      ).join(',')
    }

    css += '{'

    for (const k in cssDeclarationBlock) {
      const v = cssDeclarationBlock[k]
      css += `${k}:${v};`
    }

    css += '}'
  }
  return css
}

export function getPreflights(
  escapedSelectores: Set<string>,
  selectorName: string,
  cssExtend?: object | undefined,
  compatibilityMode?: boolean,
): string {
  let escapedSelector = Array.from(escapedSelectores)

  // attribute mode -> add class selector with `:is()` pseudo-class function
  if (!escapedSelector[escapedSelector.length - 1].startsWith('.') && !compatibilityMode)
    escapedSelector = [`:is(${escapedSelector[escapedSelector.length - 1]},.${selectorName})`]

  if (cssExtend)
    return getCSS(escapedSelector, selectorName, mergeDeep(DEFAULT, cssExtend), compatibilityMode)

  return getCSS(escapedSelector, selectorName, DEFAULT, compatibilityMode)
}
