import path from 'path'
import type { GenerateResult, UnoGenerator } from '@unocss/core'
import { cssIdRE } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import type { Theme } from '@unocss/preset-mini'
import { parseColor } from '@unocss/preset-mini'
import { colorToString } from '@unocss/preset-mini/utils'

export function throttle<T extends ((...args: any) => any)>(func: T, timeFrame: number): T {
  let lastTime = 0
  let timer: any
  return function () {
    const now = Date.now()
    clearTimeout(timer)
    if (now - lastTime >= timeFrame) {
      lastTime = now
      return func()
    }
    else {
      timer = setTimeout(func, timeFrame)
    }
  } as T
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

export function body2ColorValue(body: string, theme: Theme) {
  const themeColorNames = Object.keys(theme.colors ?? {})
  const colorNames = themeColorNames.concat(themeColorNames.map(colorName => colorName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()))

  for (const colorName of colorNames) {
    const nameIndex = body.indexOf(colorName)

    if (nameIndex > -1) {
      const parsedResult = parseColor(body.substring(nameIndex), theme)
      if (parsedResult?.cssColor)
        return parsedResult
    }
  }

  return null
}

const matchedAttributifyRE = /(?<=^\[.+~=").*(?="\]$)/
const matchedValuelessAttributifyRE = /(?<=^\[).+(?==""\]$)/
const _colorsMapCache = new Map<string, string>()
export function getColorsMap(uno: UnoGenerator, result: GenerateResult) {
  const theme = uno.config.theme as Theme
  const colorsMap = new Map<string, string>()

  for (const i of result.matched) {
    const matchedValueless = i.match(matchedValuelessAttributifyRE)?.[0]
    const colorKey = matchedValueless ?? i.replace('~="', '="')

    const cachedColor = _colorsMapCache.get(colorKey)
    if (cachedColor) {
      colorsMap.set(colorKey, cachedColor)
      continue
    }

    const matchedAttr = i.match(matchedAttributifyRE)?.[0] ?? matchedValueless
    const body = (matchedAttr ?? i)
      .split(':').slice(-1)[0] ?? '' // remove prefix e.g. `dark:` `hover:`

    if (body) {
      const colorValue = body2ColorValue(body, theme)
      if (colorValue) {
        const colorString = colorToString(colorValue.cssColor!, colorValue.alpha)
        colorsMap.set(colorKey, colorString)
        _colorsMapCache.set(colorKey, colorString)
      }
    }
  }

  if (_colorsMapCache.size > 5000)
    _colorsMapCache.clear()

  return colorsMap
}

export function isCssId(id: string) {
  return cssIdRE.test(id)
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
