import { isString } from '@unocss/core'
import { calcMaxWidthBySize } from './directive'

export function getBracket(str: string, open: string, close: string) {
  if (str === '')
    return

  const l = str.length
  let parenthesis = 0
  let opened = false
  let openAt = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case open:
        if (!opened) {
          opened = true
          openAt = i
        }
        parenthesis++
        break

      case close:
        --parenthesis
        if (parenthesis < 0)
          return
        if (parenthesis === 0) {
          return [
            str.slice(openAt, i + 1),
            str.slice(i + 1),
            str.slice(0, openAt),
          ]
        }
        break
    }
  }
}

export function getStringComponent(str: string, open: string, close: string, separators: string | string[]) {
  if (str === '')
    return

  if (isString(separators))
    separators = [separators]

  if (separators.length === 0)
    return

  const l = str.length
  let parenthesis = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case open:
        parenthesis++
        break

      case close:
        if (--parenthesis < 0)
          return
        break

      default:
        for (const separator of separators) {
          const separatorLength = separator.length
          if (separatorLength && separator === str.slice(i, i + separatorLength) && parenthesis === 0) {
            if (i === 0 || i === l - separatorLength)
              return
            return [
              str.slice(0, i),
              str.slice(i + separatorLength),
            ]
          }
        }
    }
  }

  return [
    str,
    '',
  ]
}

export function getStringComponents(str: string, separators: string | string[], limit?: number, open: string = '(', close: string = ')') {
  limit = limit ?? 10
  const components = []
  let i = 0
  while (str !== '') {
    if (++i > limit)
      return
    const componentPair = getStringComponent(str, open, close, separators)
    if (!componentPair)
      return
    const [component, rest] = componentPair
    components.push(component)
    str = rest
  }
  if (components.length > 0)
    return components
}

export type BreakpointsThemeKey = 'breakpoint' | 'breakpoints' | 'verticalBreakpoint' | 'verticalBreakpoints'

type BreakpointsTheme = Partial<Record<BreakpointsThemeKey, Record<string, string>>>

export interface BreakpointsContext {
  theme: object
  generator?: { userConfig?: { theme?: object } }
}

const reLetters = /[a-z]+/gi
const resolvedBreakpointsCache = new WeakMap<Record<string, string>, { point: string, size: string }[]>()

export function resolveBreakpoints({ theme, generator }: BreakpointsContext, key?: BreakpointsThemeKey) {
  const resolvedTheme = theme as BreakpointsTheme
  const userTheme = generator?.userConfig?.theme as BreakpointsTheme | undefined
  // Directives detect the key from the theme, while presets select their own key.
  const themeKey = key ?? (resolvedTheme.breakpoint != null ? 'breakpoint' : 'breakpoints')
  const breakpoints = userTheme?.[themeKey] || resolvedTheme[themeKey]

  if (!breakpoints)
    return undefined

  // User configuration and the merged theme can contain different breakpoint maps.
  const cached = resolvedBreakpointsCache.get(breakpoints)
  if (cached)
    return cached

  const resolved = Object.entries(breakpoints)
    .sort((a, b) => Number.parseInt(a[1].replace(reLetters, '')) - Number.parseInt(b[1].replace(reLetters, '')))
    .map(([point, size]) => ({ point, size }))

  resolvedBreakpointsCache.set(breakpoints, resolved)
  return resolved
}

export function resolveVerticalBreakpoints(context: BreakpointsContext) {
  const theme = context.theme as BreakpointsTheme
  return resolveBreakpoints(context, theme.verticalBreakpoint != null ? 'verticalBreakpoint' : 'verticalBreakpoints')
}

export function generateBreakpointMediaQuery(size: string, prefix?: 'lt' | 'at', nextSize?: string) {
  if (prefix === 'lt')
    return `(max-width: ${calcMaxWidthBySize(size)})`
  if (prefix === 'at' && nextSize != null)
    return `(min-width: ${size}) and (max-width: ${calcMaxWidthBySize(nextSize)})`
  return `(min-width: ${size})`
}

const screenValueRE = /^(?:(lt|at)-)?(\w+)$/

export function resolveScreenMediaQuery(theme: object, value: string) {
  const match = value.match(screenValueRE)
  const prefix = match?.[1] as 'lt' | 'at' | undefined
  const breakpoint = match?.[2] ?? value

  const entries = resolveBreakpoints({ theme }) ?? []
  const index = entries.findIndex(({ point }) => point === breakpoint)
  if (index === -1)
    throw new Error(`breakpoint ${breakpoint} not found`)

  return generateBreakpointMediaQuery(entries[index].size, prefix, entries[index + 1]?.size)
}
