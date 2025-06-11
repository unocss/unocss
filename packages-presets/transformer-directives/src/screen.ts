import type { Atrule } from 'css-tree'
import type { TransformerDirectivesContext } from './types'
import { calcMaxWidthBySize } from '@unocss/rule-utils'

// eslint-disable-next-line regexp/no-misleading-capturing-group
const screenRuleRE = /(@screen [^{]+)(.+)/g

export function handleScreen({ code, uno }: TransformerDirectivesContext, node: Atrule) {
  let breakpointName = ''
  let prefix = ''

  if (node.prelude?.type === 'Raw')
    breakpointName = node.prelude.value.trim()

  if (!breakpointName)
    return

  const match = breakpointName.match(/^(?:(lt|at)-)?(\w+)$/)
  if (match) {
    prefix = match[1]
    breakpointName = match[2]
  }

  const resolveBreakpoints = () => {
    const key = uno.config.presets.some(p => p.name === '@unocss/preset-wind4') ? 'breakpoint' : 'breakpoints'
    const breakpoints = uno.config.theme[key as keyof typeof uno.config.theme] as Record<string, string> | undefined

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
      offset + match.index! + match[1].length,
      `${generateMediaQuery(breakpointName, prefix)}`,
    )
  }
}
