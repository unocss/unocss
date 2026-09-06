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

// #region resolve breakpoints
export type BreakpointsThemeKey = 'breakpoint' | 'breakpoints' | 'verticalBreakpoint' | 'verticalBreakpoints'

// Wind4 themes key breakpoints as `breakpoint`/`verticalBreakpoint`, Wind3 themes as `breakpoints`/`verticalBreakpoints`;
// resolving by key presence keeps custom or renamed presets working.
const fallbackBreakpointKeys: Record<BreakpointsThemeKey, BreakpointsThemeKey> = {
  breakpoint: 'breakpoints',
  breakpoints: 'breakpoint',
  verticalBreakpoint: 'verticalBreakpoints',
  verticalBreakpoints: 'verticalBreakpoint',
}

export interface BreakpointsContext {
  theme: object
  generator?: { userConfig?: { theme?: object } }
}

const reLetters = /[a-z]+/gi
const resolvedBreakpointsCache = new WeakMap<object, Map<BreakpointsThemeKey, { point: string, size: string }[]>>()

export function resolveBreakpoints({ theme, generator }: BreakpointsContext, key: BreakpointsThemeKey = 'breakpoints') {
  const userTheme = generator?.userConfig?.theme as Record<string, any> | undefined
  const t = theme as Record<string, any>
  const fallbackKey = fallbackBreakpointKeys[key]
  const breakpoints: Record<string, string> | undefined = userTheme?.[key] || userTheme?.[fallbackKey] || t[key] || t[fallbackKey]

  if (!breakpoints)
    return undefined

  let cache = resolvedBreakpointsCache.get(theme)
  if (!cache) {
    cache = new Map()
    resolvedBreakpointsCache.set(theme, cache)
  }
  // horizontal and vertical breakpoints share the same theme, so the cache has to be keyed by both
  if (cache.has(key))
    return cache.get(key)

  const resolved = Object.entries(breakpoints)
    .sort((a, b) => Number.parseInt(a[1].replace(reLetters, '')) - Number.parseInt(b[1].replace(reLetters, '')))
    .map(([point, size]) => ({ point, size }))

  cache.set(key, resolved)
  return resolved
}

export function resolveVerticalBreakpoints(context: BreakpointsContext) {
  return resolveBreakpoints(context, 'verticalBreakpoints')
}

// #endregion

const screenValueRE = /^(?:(lt|at)-)?(\w+)$/

export function resolveScreenMediaQuery(theme: object, value: string) {
  const match = value.match(screenValueRE)
  const prefix = match?.[1] as 'lt' | 'at' | undefined
  const breakpoint = match?.[2] ?? value

  const entries = resolveBreakpoints({ theme }) ?? []
  const index = entries.findIndex(({ point }) => point === breakpoint)
  if (index === -1)
    throw new Error(`breakpoint ${breakpoint} not found`)

  const { size } = entries[index]
  if (prefix === 'lt')
    return `(max-width: ${calcMaxWidthBySize(size)})`
  if (prefix === 'at')
    return `(min-width: ${size})${entries[index + 1] ? ` and (max-width: ${calcMaxWidthBySize(entries[index + 1].size)})` : ''}`
  return `(min-width: ${size})`
}
