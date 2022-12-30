import path from 'path'
import type { UnoGenerator } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'

export function throttle<T extends ((...args: any) => any)>(func: T, timeFrame: number): T {
  let lastTime = 0
  let timer: any
  return function (...args) {
    const now = Date.now()
    clearTimeout(timer)
    if (now - lastTime >= timeFrame) {
      lastTime = now
      return func(...args)
    }
    else {
      timer = setTimeout(func, timeFrame, ...args)
    }
  } as T
}

export const getCSS = async (uno: UnoGenerator, utilName: string) => {
  const { css } = await uno.generate(utilName, { preflights: false, safelist: false })
  return css
}

export async function getPrettiedCSS(uno: UnoGenerator, util: string) {
  const result = (await uno.generate(new Set([util]), { preflights: false, safelist: false }))
  const prettified = prettier.format(result.css, {
    parser: 'css',
    plugins: [parserCSS],
  })

  return {
    ...result,
    prettified,
  }
}

export async function getPrettiedMarkdown(uno: UnoGenerator, util: string) {
  return `\`\`\`css\n${(await getPrettiedCSS(uno, util)).prettified}\n\`\`\``
}

const getCssVariables = (code: string) => {
  const regex = /(?<key>--\S+?):\s*(?<value>.+?);/gm
  const cssVariables = new Map<string, string>()
  for (const match of code.matchAll(regex)) {
    const key = match.groups?.key
    if (key)
      cssVariables.set(key, match.groups?.value ?? '')
  }

  return cssVariables
}

const matchCssVarReg = /var\((?<cssVarName>--[^,|)]+)(?:,\s*(?<fallback>[^)]+))?\)/gm
const colorRegex = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\(.*\)/gm
export const getColorString = (str: string) => {
  let colorString = str.match(colorRegex)?.[0] // rgba(248, 113, 113, var(--maybe-css-var))

  if (!colorString)
    return

  const cssVars = getCssVariables(str)

  for (const match of colorString.matchAll(matchCssVarReg)) {
    const matchedString = match[0]
    const cssVarName = match.groups?.cssVarName
    const fallback = match.groups?.fallback

    if (cssVarName && cssVars.get(cssVarName))
      // rgba(248, 113, 113, var(--un-text-opacity)) => rgba(248, 113, 113, 1)
      colorString = colorString.replaceAll(matchedString, cssVars.get(cssVarName) ?? matchedString)
    else if (fallback)
      // rgba(248, 113, 113, var(--no-value, 0.5)) => rgba(248, 113, 113, 0.5)
      colorString = colorString.replaceAll(matchedString, fallback)

    // remove all `var(...)`
    colorString = colorString.replaceAll(/,?\s+var\(--.*?\)/gm, '')
  }

  // if (!(new TinyColor(colorString).isValid))
  //   return

  return colorString
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
