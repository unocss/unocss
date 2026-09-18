import type { PreflightContext, UnoGenerator } from '@unocss/core'
import { toArray } from '@unocss/core'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'

const remUnitRE = /(-?[\d.]+)rem(\s+!important)?;/
const cssVariableRE = /var\((--[\w-]+)\)/g
const cssDeclarationRE = /(?<property>[\w-]+):(?<value>[^;{}]+);/g
const multiplicationRE = /^calc\(\s*(-?[\d.]+)([a-z%]+)\s*\*\s*(-?[\d.]+)\s*\)$/
const cssBlockRE = /(?<selector>[^{}@][^{}]*)\{(?<body>[^{}]*)\}/g
const themeVariableRE = /(?<name>--[\w-]+)\s*:(?<declaration>[^;{}]+)/g

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

/**
 * Collect the CSS custom properties that belong to the active theme, declared
 * on `:root`/`:host` in preflight CSS. Generated runtime variables such
 * as `--un-*` live in other blocks (properties preflight) and are excluded, so
 * they never produce resolved-value comments.
 */
export function getThemeCSSVariables(css: string) {
  const variables = new Map<string, string>()
  for (const block of css.matchAll(cssBlockRE)) {
    if (!/:root\b|:host\b/.test(block.groups?.selector ?? ''))
      continue
    for (const match of (block.groups?.body ?? '').matchAll(themeVariableRE)) {
      if (match.groups?.name)
        variables.set(match.groups.name, match.groups.declaration.replace(/!important\s*$/i, '').trim())
    }
  }
  return variables
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
  if (!cssVariables.size)
    return css
  return css.replace(cssDeclarationRE, (declaration, _property, value: string) => {
    // Only annotate declarations that reference theme custom properties.
    if (!value.includes('var('))
      return declaration
    const resolved = resolveCSSValue(value.trim(), cssVariables)
    return resolved ? `${declaration} /* ${resolved} */` : declaration
  })
}

export async function getCSS(uno: UnoGenerator, utilName: string | string[]) {
  const { css } = await uno.generate(new Set(toArray(utilName)), { preflights: false, safelist: false })
  return css
}

export async function getPrettiedCSS(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  // Preflight CSS never belongs to the hover output; it only supplies the
  // theme custom properties referenced by the util's declarations. Rendering
  // the preflights directly keeps a single `generate` call per hover (the
  // on-demand theme preflight reflects exactly the theme keys tracked while
  // processing this util), and excludes only the preflight CSS itself, so
  // rule CSS sharing a layer with a user preflight is never dropped.
  const result = (await uno.generate(new Set(toArray(util)), { preflights: false, safelist: false }))
  const preflightContext: PreflightContext = { generator: uno, theme: uno.config.theme }
  const preflightCSS = (await Promise.all(uno.config.preflights.map(i => i.getCSS(preflightContext))))
    .filter(Boolean)
    .join('\n')
  const css = addRemToPxComment(
    addResolvedValueComments(
      result.css,
      getThemeCSSVariables(preflightCSS),
    ),
    remToPxRatio,
  )
  const prettified = await prettier.format(css, {
    parser: 'css',
    plugins: [parserCSS],
  })

  return {
    ...result,
    css,
    prettified,
  }
}

export async function getPrettiedMarkdown(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  const prettified = (await getPrettiedCSS(uno, util, remToPxRatio)).prettified.trimEnd()
  return `\`\`\`css\n${prettified}\n\`\`\``
}
