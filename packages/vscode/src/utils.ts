import path from 'path'
import type { UnoGenerator } from '@unocss/core'
import { cssIdRE } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'

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

export function isCssId(id: string) {
  return cssIdRE.test(id)
}

export function isSubdir(parent: string, child: string) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
