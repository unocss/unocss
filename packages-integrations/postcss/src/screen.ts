import type { UnoGenerator } from '@unocss/core'
import type { Root } from 'postcss'
import { calcMaxWidthBySize, resolveBreakpoints } from '@unocss/rule-utils'

export function parseScreen(root: Root, uno: UnoGenerator, directiveName: string) {
  root.walkAtRules(directiveName, (rule) => {
    let breakpointName = ''
    let prefix = ''

    if (rule.params)
      breakpointName = rule.params.trim()

    if (!breakpointName)
      return

    const match = breakpointName.match(/^(?:(lt|at)-)?(\w+)$/)
    if (match) {
      prefix = match[1]
      breakpointName = match[2]
    }

    const variantEntries: Array<[string, string, number]> = (resolveBreakpoints(uno.config.theme) ?? []).map(({ point, size }, idx) => [point, size, idx])
    const generateMediaQuery = (breakpointName: string, prefix?: string) => {
      const [, size, idx] = variantEntries.find(i => i[0] === breakpointName)!
      if (prefix === 'lt')
        return `(max-width: ${calcMaxWidthBySize(size)})`
      if (prefix === 'at')
        return `(min-width: ${size})${variantEntries[idx + 1] ? ` and (max-width: ${calcMaxWidthBySize(variantEntries[idx + 1][1])})` : ''}`
      return `(min-width: ${size})`
    }

    if (!variantEntries.some(i => i[0] === breakpointName))
      throw new Error(`breakpoint ${breakpointName} not found`)

    rule.name = 'media'
    rule.params = `${generateMediaQuery(breakpointName, prefix)}`
  })
}
