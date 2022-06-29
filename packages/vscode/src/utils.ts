import path from 'path'
import type { GenerateResult, UnoGenerator } from '@unocss/core'
import { cssIdRE } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import type { Theme } from '@unocss/preset-mini'
import { parseColor } from '@unocss/preset-mini'

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

const matchedAttributifyRE = /(?<=^\[.+~?=").*(?="\]$)/
export function getColorsMap(uno: UnoGenerator, result: GenerateResult) {
  const theme = uno.config.theme as Theme
  const colorNames = Object.keys(theme.colors ?? {}).map(colorName => colorName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
  const colorsMap = new Map<string, string>()

  for (const i of result.matched) {
    const matchedAttr = i.match(matchedAttributifyRE)
    const body = matchedAttr ? matchedAttr[0].split(':').at(-1) ?? '' : i // remove prefix e.g. `dark:` `hover:`

    for (const colorName of colorNames) {
      const nameIndex = body.indexOf(colorName)
      if (nameIndex > -1) {
        const parsedResult = parseColor(body.substring(nameIndex), theme)
        if (parsedResult?.cssColor) {
          const { alpha: cssAlpha, components } = parsedResult.cssColor
          colorsMap.set(i.replace('~', ''), `rgba(${components.join(',')},${parsedResult.alpha ?? cssAlpha ?? 1})`)
        }

        break
      }
    }
  }

  return colorsMap
}

export function isCssId(id: string) {
  return cssIdRE.test(id)
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
