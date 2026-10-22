import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'
import { toArray } from '@unocss/core'
import { getEnvFlags } from '#integration/env'
import { attributifyJsxOxcResolver } from './resolver/oxc'
import { attributifyJsxRegexResolver } from './resolver/regex'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null
export type ResolverType = 'oxc' | 'regex'
export interface ResolverFilterPattern {
  pattern: string | RegExp
  resolver: ResolverType
}
export type IncludePattern
  = | Array<string | RegExp | ResolverFilterPattern>
    | string
    | RegExp
    | ResolverFilterPattern
    | null

function createFilter(
  include: IncludePattern,
  exclude: FilterPattern,
): {
  idFilter: (id: string) => boolean
  resolveResolver: (id: string) => ResolverType | undefined
} {
  const includePattern = toArray(include || [])
  const excludePattern = toArray(exclude || [])

  const match = (id: string) => {
    if (excludePattern.some(p => id.match(p)))
      return

    return includePattern.find((item) => {
      const pattern = item instanceof RegExp || typeof item === 'string'
        ? item
        : item.pattern
      return id.match(pattern)
    })
  }

  return {
    idFilter: id => match(id) != null,
    resolveResolver: (id) => {
      const matched = match(id)
      if (matched && !(matched instanceof RegExp) && typeof matched !== 'string')
        return matched.resolver
    },
  }
}

export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]

  /**
   * Patterns of modules to be included from processing.
   *
   * Use `{ pattern, resolver }` to select a resolver for matching files.
   * The first matching pattern is used.
   * Patterns without a resolver retain the default Oxc-to-regex fallback.
   *
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: IncludePattern

  /**
   * Regex of modules to exclude from processing
   *
   * @default []
   */
  exclude?: FilterPattern
}

export interface AttributifyResolverParams {
  code: MagicString
  id: string
  uno: UnoGenerator<object>
  isBlocked: (matchedRule: string) => boolean
}

export default function transformerAttributifyJsx(options: TransformerAttributifyJsxOptions = {}): SourceCodeTransformer {
  const {
    blocklist = [],
  } = options

  const isBlocked = (matchedRule: string) => {
    for (const blockedRule of blocklist) {
      if (blockedRule instanceof RegExp) {
        if (blockedRule.test(matchedRule))
          return true
      }
      else if (matchedRule === blockedRule) {
        return true
      }
    }

    return false
  }

  const filter = createFilter(
    options.include || [/\.[jt]sx$/, /\.mdx$/],
    options.exclude || [],
  )

  return {
    name: '@unocss/transformer-attributify-jsx',
    docs: 'https://unocss.dev/transformers/attributify-jsx',
    enforce: 'pre',
    idFilter: filter.idFilter,
    async transform(code, id, { uno }) {
      // Skip if running in VSCode extension context
      try {
        if (getEnvFlags().isVSCode)
          return
      }
      catch {
        // Ignore import error in browser environment
      }

      const params: AttributifyResolverParams = {
        code,
        id,
        uno,
        isBlocked,
      }

      const resolver = filter.resolveResolver(id)
      if (resolver === 'oxc') {
        await attributifyJsxOxcResolver(params)
        return
      }
      if (resolver === 'regex') {
        await attributifyJsxRegexResolver(params)
        return
      }

      try {
        await attributifyJsxOxcResolver(params)
      }
      catch (error) {
        console.warn(
          `[@unocss/transformer-attributify-jsx]: Oxc resolver failed for "${id}", falling back to regex resolver:\n`,
          error,
        )
        await attributifyJsxRegexResolver(params)
      }
    },
  }
}
