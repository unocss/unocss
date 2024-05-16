import { mergeDeep } from '@unocss/core'
import type { PreflightContext } from '@unocss/core'
import type { TypographyCompatibilityOptions } from '../types/compatibilityOptions'
import { DEFAULT } from './default'

function getCSS(
  options: {
    escapedSelector: string[]
    selectorName: string
    preflights: object
    compatibility?: TypographyCompatibilityOptions
  },
): string {
  let css = ''

  const { escapedSelector, selectorName, preflights, compatibility } = options
  const disableNotUtility = compatibility?.noColonNot || compatibility?.noColonWhere

  for (const selector in preflights) {
    // @ts-expect-error preflights do not have definitive keys
    const cssDeclarationBlock = preflights[selector]
    const notProseSelector = `:not(:where(.not-${selectorName},.not-${selectorName} *))`

    // since pseudo class & elements can't be matched
    // within single :where(), they are split and rejoined.
    const pseudoCSSMatchArray = selector
      .split(',')
      .map((s) => {
        // pseudo class & pseudo elements matcher
        // matches :, ::, -, (), numbers and words
        const match = s.match(/:[():\-\w]+$/g)

        if (match) {
          const matchStr = match[0]
          s = s.replace(matchStr, '')
          return escapedSelector.map(e => disableNotUtility
            ? `${e} ${s}${matchStr}`
            : `${e} :where(${s})${notProseSelector}${matchStr}`).join(',')
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
      css += escapedSelector.map(e => disableNotUtility
        ? selector.split(',').map(s => `${e} ${s}`).join(',')
        : `${e} :where(${selector})${notProseSelector}`).join(',')
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
  context: PreflightContext,
  options: {
    escapedSelectors: Set<string>
    selectorName: string
    cssExtend?: object | undefined
    compatibility?: TypographyCompatibilityOptions
  },
): string {
  const { escapedSelectors, selectorName, cssExtend, compatibility } = options
  let escapedSelector = Array.from(escapedSelectors)

  // attribute mode -> add class selector with `:is()` pseudo-class function
  if (!escapedSelector[escapedSelector.length - 1].startsWith('.') && !compatibility?.noColonIs)
    escapedSelector = [`:is(${escapedSelector[escapedSelector.length - 1]},.${selectorName})`]

  if (cssExtend)
    return getCSS({ escapedSelector, selectorName, preflights: mergeDeep(DEFAULT(context.theme), cssExtend), compatibility })

  return getCSS({ escapedSelector, selectorName, preflights: DEFAULT(context.theme), compatibility })
}
