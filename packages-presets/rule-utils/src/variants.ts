import type { Arrayable, VariantHandler, VariantHandlerContext, VariantObject } from '@unocss/core'
import { escapeRegExp, toArray } from '@unocss/core'
import { generateBreakpointMediaQuery, getBracket, resolveBreakpoints } from './utilities'

const sizePseudo = /(max|min)-\[([^\]]*)\]:/

export function variantBreakpoints(themeKey: 'breakpoint' | 'breakpoints' = 'breakpoints'): VariantObject {
  const regexCache: Record<string, RegExp> = {}
  return {
    name: 'breakpoints',
    match(matcher, context) {
      if (sizePseudo.test(matcher)) {
        const match = matcher.match(sizePseudo)!
        const remainingMatcher = matcher.replace(match[0], '')
        return {
          matcher: remainingMatcher,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (${match[1]}-width: ${match[2]})`,
          }),
        }
      }
      const breakpoints = resolveBreakpoints(context, themeKey) ?? []
      for (const [index, { point, size }] of breakpoints.entries()) {
        if (!regexCache[point])
          regexCache[point] = new RegExp(`^((?:([al]t-|[<~]|max-))?${point}(?:${context.generator.config.separators.join('|')}))`)

        const match = matcher.match(regexCache[point])
        if (!match)
          continue

        const [matchedPrefix] = match
        const remainingMatcher = matcher.slice(matchedPrefix.length)
        // Container rules handle their own responsive breakpoints.
        if (remainingMatcher === 'container')
          continue

        const isLtPrefix = matchedPrefix.startsWith('lt-') || matchedPrefix.startsWith('<') || matchedPrefix.startsWith('max-')
        const isAtPrefix = matchedPrefix.startsWith('at-') || matchedPrefix.startsWith('~')
        const prefix = isLtPrefix ? 'lt' : isAtPrefix ? 'at' : undefined
        const mediaQuery = generateBreakpointMediaQuery(size, prefix, breakpoints[index + 1]?.size)
        const parentOrder = 3000 + (isLtPrefix ? -(index + 1) : index + 1)

        return {
          matcher: remainingMatcher,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media ${mediaQuery}`,
            parentOrder,
          }),
        }
      }
    },
    multiPass: true,
    autocomplete: `(at-|lt-|max-|)$${themeKey}:`,
  }
}

export function variantMatcher<T extends object = object>(name: string, handler: Arrayable<(input: VariantHandlerContext) => Record<string, any>>, options: Omit<VariantObject<T>, 'match'> = {}): VariantObject<T> {
  let re: RegExp
  return {
    name,
    match(input, ctx) {
      if (!re)
        re = new RegExp(`^${escapeRegExp(name)}(?:${ctx.generator.config.separators.join('|')})`)

      const match = input.match(re)
      if (match) {
        const matcher = input.slice(match[0].length)
        const handlers: VariantHandler[] = toArray(handler).map(handler => ({
          matcher,
          handle: (input, next) => next({
            ...input,
            ...handler(input),
          }),
          ...options,
        }))
        return handlers.length === 1
          ? handlers[0]
          : handlers
      }
    },
    autocomplete: `${name}:`,
  }
}

export function variantParentMatcher<T extends object = object>(name: string, parent: string): VariantObject<T> {
  let re: RegExp
  return {
    name,
    match(input, ctx) {
      if (!re)
        re = new RegExp(`^${escapeRegExp(name)}(?:${ctx.generator.config.separators.join('|')})`)

      const match = input.match(re)
      if (match) {
        return {
          matcher: input.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${parent}`,
          }),
        }
      }
    },
    autocomplete: `${name}:`,
  }
}

export function variantGetBracket(prefix: string, matcher: string, separators: string[]): string[] | undefined {
  if (matcher.startsWith(`${prefix}[`)) {
    const [match, rest] = getBracket(matcher.slice(prefix.length), '[', ']') ?? []
    if (match && rest) {
      for (const separator of separators) {
        if (rest.startsWith(separator))
          return [match, rest.slice(separator.length), separator]
      }
      return [match, rest, '']
    }
  }
}

export function variantGetParameter(prefix: Arrayable<string>, matcher: string, separators: string[]): string[] | undefined {
  for (const p of toArray(prefix)) {
    if (matcher.startsWith(p)) {
      const body = variantGetBracket(p, matcher, separators)
      if (body) {
        const [label = '', rest = body[1]] = variantGetParameter('/', body[1], separators) ?? []
        return [body[0], rest, label]
      }
      for (const separator of separators.filter(x => x !== '/')) {
        const pos = matcher.indexOf(separator, p.length)
        if (pos !== -1) {
          const labelPos = matcher.indexOf('/', p.length)
          const unlabelled = labelPos === -1 || pos <= labelPos
          return [
            matcher.slice(p.length, unlabelled ? pos : labelPos),
            matcher.slice(pos + separator.length),
            unlabelled ? '' : matcher.slice(labelPos + 1, pos),
          ]
        }
      }
    }
  }
}
