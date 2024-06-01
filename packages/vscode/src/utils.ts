import path from 'path'
import type { UnoGenerator } from '@unocss/core'
import { toArray } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'

const remUnitRE = /(-?[\d.]+)rem(\s+!important)?;/
const matchCssVarNameRE = /var\((?<cssVarName>--[^,|)]+)(?:,(?<fallback>[^)]+))?\)/g
const cssColorRE = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\(.*\)/g
const varFnRE = /var\((--[^,|)]+)(?:,([^)]+))?\)/

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

export async function getCSS(uno: UnoGenerator, utilName: string | string[]) {
  const { css } = await uno.generate(new Set(toArray(utilName)), { preflights: false, safelist: false })
  return css
}

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

export async function getPrettiedCSS(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  const result = (await uno.generate(new Set(toArray(util)), { preflights: false, safelist: false }))
  const css = addRemToPxComment(result.css, remToPxRatio)
  const prettified = prettier.format(css, {
    parser: 'css',
    plugins: [parserCSS],
  })

  return {
    ...result,
    prettified,
  }
}

export async function getPrettiedMarkdown(uno: UnoGenerator, util: string | string[], remToPxRatio: number) {
  return `\`\`\`css\n${(await getPrettiedCSS(uno, util, remToPxRatio)).prettified}\n\`\`\``
}

function getCssVariables(code: string) {
  const regex = /(?<key>--[^\s:]+):(?<value>.+?)[!;]/g
  const cssVariables = new Map<string, string>()
  for (const match of code.matchAll(regex)) {
    const key = match.groups?.key
    if (key)
      cssVariables.set(key, match.groups?.value ?? '')
  }

  return cssVariables
}

/**
 * Get CSS color string from CSS string
 *
 * @example Input with CSS var
 * ```css
 *.dark [border="dark\:gray-700"] {
 *  --un-border-opacity: 1;
 *  border-color: rgb(55 65 81 / var(--un-border-opacity));
 *}
 * ```
 * return `rgb(55 65 81 / 1)`
 *
 * @example Input with no-value CSS var and its fallback value
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value, 0.5));
 *}
 * ```
 * return `hsl(217 78% 51% / 0.5)`
 *
 * @example Input with no-value CSS var
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value));
 *}
 * ```
 * return `rgb(217 78% 51%)`
 *
 * @param str - CSS string
 * @returns The **first** CSS color string (hex, rgb[a], hsl[a]) or `undefined`
 */
export function getColorString(str: string) {
  let colorString = str.match(cssColorRE)?.[0] // e.g rgb(248 113 113 / var(--maybe-css-var))

  if (!colorString)
    return

  const cssVars = getCssVariables(str)

  // replace `var(...)` with its value
  for (const match of colorString.matchAll(matchCssVarNameRE)) {
    const matchedString = match[0]
    const cssVarName = match.groups?.cssVarName
    const fallback = match.groups?.fallback

    if (cssVarName && cssVars.get(cssVarName)) {
      // rgb(248 113 113 / var(--un-text-opacity)) => rgb(248 113 113 / 1)
      colorString = colorString.replaceAll(matchedString, () => {
        let v = cssVars.get(cssVarName) ?? matchedString
        // resolve nested css var
        while (v && v.startsWith('var(')) {
          const varName = v.match(varFnRE)?.[1]
          if (!varName) {
            v = ''
            break
          }

          v = cssVars.get(varName) || ''
        }
        return v || '1'
      })
    }
    else if (fallback) {
      // rgb(248 113 113 / var(--no-value, 0.5)) => rgb(248 113 113 / 0.5)
      colorString = colorString.replaceAll(matchedString, fallback)
    }

    // rgb(248 113 113 / var(--no-value)) => rgba(248 113 113)
    colorString = colorString.replaceAll(/,?\s+var\(--.*?\)/g, '')
  }

  // if (!(new TinyColor(colorString).isValid))
  //   return

  if (/\/\)/.test(colorString))
    colorString = colorString.replace(/ \/\)/g, '/ 1)')

  return convertToRGBA(colorString)
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled'
}

export function isRejected(result: PromiseSettledResult<unknown>): result is PromiseRejectedResult {
  return result.status === 'rejected'
}

const reRgbFn = /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/

export function convertToRGBA(rgbColor: string) {
  const match = rgbColor.match(reRgbFn)

  if (match) {
    const r = Number.parseInt(match[1].trim())
    const g = Number.parseInt(match[2].trim())
    const b = Number.parseInt(match[3].trim())
    const alpha = Number.parseFloat(match[4].trim())

    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`

    return rgbaColor
  }

  return rgbColor
}
