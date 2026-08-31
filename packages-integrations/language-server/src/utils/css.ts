import type { UnoGenerator } from '@unocss/core'
import { toArray } from '@unocss/core'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { getCssVariables } from './color'

const remUnitRE = /(-?[\d.]+)rem(\s+!important)?;/
const cssVariableRE = /var\((--[\w-]+)\)/g
const cssDeclarationRE = /(?<property>[\w-]+):(?<value>[^;{}]+);/g
const multiplicationRE = /^calc\(\s*(-?[\d.]+)([a-z%]+)\s*\*\s*(-?[\d.]+)\s*\)$/

/**
 * Credit to [@voorjaar](https://github.com/voorjaar)
 *
 * @see https://github.com/windicss/windicss-intellisense/issues/13
 * @param str
 */
export function addRemToPxComment(str?: string, remToPixel = 16) {
  if (!str)
    return ''
  if (remToPixel < 1)
    return str
  let index = 0
  const output: string[] = []

  while (index < str.length) {
    const rem = str.slice(index).match(remUnitRE)
    if (!rem || !rem.index)
      break
    const px = ` /* ${Number.parseFloat(rem[1]) * remToPixel}px */`
    const end = index + rem.index + rem[0].length

    output.push(str.slice(index, end))
    output.push(px)
    index = end
  }
  output.push(str.slice(index))
  return output.join('')
}

function resolveCSSValue(value: string, cssVariables: Map<string, string>) {
  let resolved = value.replace(cssVariableRE, (match, name: string) => cssVariables.get(name) ?? match)

  if (resolved.includes('var('))
    return

  const multiplication = resolved.match(multiplicationRE)
  if (multiplication) {
    const [, value, unit, multiplier] = multiplication
    resolved = `${Number(value) * Number(multiplier)}${unit}`
  }

  return resolved === value ? undefined : resolved
}

export function addResolvedValueComments(css: string, cssVariables: Map<string, string>) {
  return css.replace(cssDeclarationRE, (declaration, _property, value: string) => {
    const resolved = resolveCSSValue(value.trim(), cssVariables)
    return resolved ? `${declaration} /* ${resolved} */` : declaration
  })
}

export async function getCSS(uno: UnoGenerator, utilName: string | string[]) {
  const { css } = await uno.generate(new Set(toArray(utilName)), { preflights: false, safelist: false })
  return css
}

export async function getPrettiedCSS(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  const result = (await uno.generate(new Set(toArray(util)), { preflights: false, safelist: false }))
  const { css: preflightCSS } = await uno.generate(new Set(), { preflights: true, safelist: false })
  const css = addRemToPxComment(
    addResolvedValueComments(result.css, getCssVariables(preflightCSS)),
    remToPxRatio,
  )
  const prettified = await prettier.format(css, {
    parser: 'css',
    plugins: [parserCSS],
  })

  return {
    ...result,
    prettified,
  }
}

export async function getPrettiedMarkdown(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  const prettified = (await getPrettiedCSS(uno, util, remToPxRatio)).prettified.trimEnd()
  return `\`\`\`css\n${prettified}\n\`\`\``
}
