import type { PreflightContext } from '@unocss/core'
import type { TypographyOptions } from '..'
import type { TypographyCompatibilityOptions } from '../types/compatibilityOptions'
import { mergeDeep } from '@unocss/core'
import { DEFAULT } from './default'

export { getElements } from './default'

function getCSS(
  options: {
    escapedSelector: string[]
    selectorName: string
    preflights: object
    compatibility?: TypographyCompatibilityOptions
    important: boolean
  },
): string {
  let css = ''

  const { escapedSelector, selectorName, preflights, compatibility, important } = options
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
      css += `${k}:${v}${important ? ' !important' : ''};`
    }

    css += '}'
  }
  return css
}

export function getPreflights(
  context: PreflightContext,
  options: { escapedSelectors: Set<string> } & Pick<TypographyOptions, 'selectorName' | 'cssExtend' | 'compatibility' | 'important'>,
): string {
  const { compatibility, selectorName, important = false } = options
  const cssExtend = typeof options?.cssExtend === 'function' ? options.cssExtend(context.theme) : options?.cssExtend
  let escapedSelector = Array.from(options.escapedSelectors)

  // attribute mode -> add class selector with `:is()` pseudo-class function
  if (!escapedSelector[escapedSelector.length - 1].startsWith('.') && !compatibility?.noColonIs)
    escapedSelector = [`:is(${escapedSelector[escapedSelector.length - 1]},.${options.selectorName})`]

  if (typeof important === 'string') {
    escapedSelector = escapedSelector.map(e => !compatibility?.noColonIs ? `:is(${important}) ${e}` : `${important} ${e}`)
  }

  if (cssExtend)
    return getCSS({ escapedSelector, selectorName: selectorName!, preflights: mergeDeep(DEFAULT(context.theme), cssExtend), compatibility, important: important === true })

  return getCSS({ escapedSelector, selectorName: selectorName!, preflights: DEFAULT(context.theme), compatibility, important: important === true })
}
