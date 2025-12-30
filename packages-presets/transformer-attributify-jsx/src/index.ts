import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'
import { getEnvFlags } from '#integration/env'
import { toArray } from '@unocss/core'
import { attributifyJsxBabelResolver } from './resolver/babel'
import { attributifyJsxRegexResolver } from './resolver/regex'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null

function createFilter(
  include: FilterPattern,
  exclude: FilterPattern,
): (id: string) => boolean {
  const includePattern = toArray(include || [])
  const excludePattern = toArray(exclude || [])
  return (id: string) => {
    if (excludePattern.some(p => id.match(p)))
      return false
    return includePattern.some(p => id.match(p))
  }
}

export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]

  /**
   * Regex of modules to be included from processing
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: FilterPattern

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

  const idFilter = createFilter(
    options.include || [/\.[jt]sx$/, /\.mdx$/],
    options.exclude || [],
  )

  return {
    name: '@unocss/transformer-attributify-jsx',
    enforce: 'pre',
    idFilter,
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

      try {
        await attributifyJsxBabelResolver(params)
      }
      catch (error) {
        console.warn(
          `[@unocss/transformer-attributify-jsx]: Babel resolver failed for "${id}", falling back to regex resolver:`,
          error,
        )
        await attributifyJsxRegexResolver(params)
      }
    },
  }
}
