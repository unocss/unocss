import type { VariantObject } from '@unocss/core'
import { resolveBreakpoints } from '../utils'

export function calcMaxWidthBySize(size: string) {
  const value = size.match(/^-?\d+\.?\d*/)?.[0] || ''
  const unit = size.slice(value.length)
  if (unit === 'px') {
    const maxWidth = (Number.parseFloat(value) - 0.1)
    return Number.isNaN(maxWidth) ? size : `${maxWidth}${unit}`
  }
  return `calc(${size} - 0.1px)`
}

const sizePseudo = /(max|min)-\[([^\]]*)\]:/

export function variantBreakpoints(): VariantObject {
  const regexCache: Record<string, RegExp> = {}
  return {
    name: 'breakpoints',
    match(matcher, context) {
      if (sizePseudo.test(matcher)) {
        const match = matcher.match(sizePseudo)!
        const m = matcher.replace(match[0], '')
        return {
          matcher: m,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (${match[1]}-width: ${match[2]})`,
            // parentOrder: order,
          }),
        }
      }
      const variantEntries: Array<[string, string, number]> = (resolveBreakpoints(context) ?? [])
        .map(({ point, size }, idx) => [point, size, idx])
      for (const [point, size, idx] of variantEntries) {
        if (!regexCache[point])
          regexCache[point] = new RegExp(`^((?:([al]t-|[<~]|max-))?${point}(?:${context.generator.config.separators.join('|')}))`)

        const match = matcher.match(regexCache[point])
        if (!match)
          continue

        const [, pre] = match

        const m = matcher.slice(pre.length)
        // container rule is responsive, but also is breakpoint aware
        // it is handled on its own module (container.ts) and so we
        // exclude it from here
        if (m === 'container')
          continue

        const isLtPrefix = pre.startsWith('lt-') || pre.startsWith('<') || pre.startsWith('max-')
        const isAtPrefix = pre.startsWith('at-') || pre.startsWith('~')

        let order = 3000 // parseInt(size)

        if (isLtPrefix) {
          order -= (idx + 1)
          return {
            matcher: m,
            handle: (input, next) => next({
              ...input,
              parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (max-width: ${calcMaxWidthBySize(size)})`,
              parentOrder: order,
            }),
          }
        }

        order += (idx + 1)

        // support for windicss @<breakpoint> => last breakpoint will not have the upper bound
        if (isAtPrefix && idx < variantEntries.length - 1) {
          return {
            matcher: m,
            handle: (input, next) => next({
              ...input,
              parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (min-width: ${size}) and (max-width: ${calcMaxWidthBySize(variantEntries[idx + 1][1])})`,
              parentOrder: order,
            }),
          }
        }

        return {
          matcher: m,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (min-width: ${size})`,
            parentOrder: order,
          }),
        }
      }
    },
    multiPass: true,
    autocomplete: '(at-|lt-|max-|)$breakpoints:',
  }
}
