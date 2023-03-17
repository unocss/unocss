import type { Preset, Variant } from '@unocss/core'
import { getBracket, h } from '../../preset-mini/src/utils'
import { extractorSplitArbitrary } from './split-arbitrary'

export interface PresetArbitraryOptions {
}

export const variantVariables: Variant = {
  name: 'variables',
  match(matcher, ctx) {
    if (!matcher.startsWith('['))
      return

    const [match, rest] = getBracket(matcher, '[', ']') ?? []
    if (!(match && rest))
      return

    let newMatcher: string | undefined
    for (const separator of ctx.generator.config.separators) {
      if (rest.startsWith(separator)) {
        newMatcher = rest.slice(separator.length)
        break
      }
    }

    if (newMatcher == null)
      return

    const variant = h.bracket(match) ?? ''
    const useParent = variant.startsWith('@')
    if (!(useParent || variant.includes('&')))
      return

    return {
      matcher: newMatcher,
      handle(input, next) {
        const updates = useParent
          ? {
              parent: `${input.parent ? `${input.parent} $$ ` : ''}${variant}`,
            }
          : {
              selector: variant.replace(/&/g, input.selector),
            }
        return next({
          ...input,
          ...updates,
        })
      },
    }
  },
  multiPass: true,
}

export default function arbitraryPreset(options: PresetArbitraryOptions = {}): Preset {
  return {
    name: '@unocss/preset-arbitrary',
    extractors: [
      extractorSplitArbitrary,
    ],
    variants: [
      variantVariables,
    ],
  }
}
