import type { Theme } from '@unocss/preset-mini'
import type { Atrule } from 'css-tree'
import type { TransformerDirectivesContext } from './types'

const screenRuleRE = /(@screen) (.+) /g

export function handleScreen({ code, uno }: TransformerDirectivesContext, node: Atrule) {
  let breakpointName = ''
  let prefix = ''

  if (node.name === 'screen' && node.prelude?.type === 'Raw')
    breakpointName = node.prelude.value.trim()

  if (!breakpointName)
    return

  const match = breakpointName.match(/^(?:(lt|at)-)?(\w+)$/)
  if (match) {
    prefix = match[1]
    breakpointName = match[2]
  }

  const resolveBreakpoints = () => {
    let breakpoints: Record<string, string> | undefined
    if (uno.userConfig && uno.userConfig.theme)
      breakpoints = (uno.userConfig.theme as Theme).breakpoints

    if (!breakpoints)
      breakpoints = (uno.config.theme as Theme).breakpoints

    return breakpoints
      ? Object.entries(breakpoints)
        .sort((a, b) => Number.parseInt(a[1].replace(/[a-z]+/gi, '')) - Number.parseInt(b[1].replace(/[a-z]+/gi, '')))
        .map(([point, size]) => ({ point, size }))
      : undefined
  }
  const variantEntries: Array<[string, string, number]> = (resolveBreakpoints() ?? []).map(({ point, size }, idx) => [point, size, idx])
  const generateMediaQuery = (breakpointName: string, prefix?: string) => {
    const [, size, idx] = variantEntries.find(i => i[0] === breakpointName)!
    if (prefix) {
      if (prefix === 'lt')
        return `@media (max-width: ${calcMaxWidthBySize(size)})`
      else if (prefix === 'at')
        return `@media (min-width: ${size})${variantEntries[idx + 1] ? ` and (max-width: ${calcMaxWidthBySize(variantEntries[idx + 1][1])})` : ''}`

      else throw new Error(`breakpoint variant not supported: ${prefix}`)
    }
    return `@media (min-width: ${size})`
  }

  if (!variantEntries.find(i => i[0] === breakpointName))
    throw new Error(`breakpoint ${breakpointName} not found`)

  const offset = node.loc!.start.offset
  const str = code.original.slice(offset, node.loc!.end.offset)
  const matches = Array.from(str.matchAll(screenRuleRE))

  if (!matches.length)
    return

  for (const match of matches) {
    code.overwrite(
      offset + match.index!,
      offset + match.index! + match[0].length,
      `${generateMediaQuery(breakpointName, prefix)} `,
    )
  }
}

function calcMaxWidthBySize(size: string) {
  const value = size.match(/^-?\d+\.?\d*/)?.[0] || ''
  const unit = size.slice(value.length)
  const maxWidth = (Number.parseFloat(value) - 0.1)
  return Number.isNaN(maxWidth) ? size : `${maxWidth}${unit}`
}
