import type { SourceCodeTransformer } from '@unocss/core'
import { escapeRegExp, expandVariantGroup } from '@unocss/core'

export interface CompileClassOptions {
  /**
   * Trigger string
   * @default ':uno:'
   */
  trigger?: string

  /**
   * Prefix for compile class name
   * @default 'uno-'
   */
  classPrefix?: string

  /**
   * Hash function
   */
  hashFn?: (str: string) => string

  /**
   * Left unknown classes inside the string
   *
   * @default true
   */
  keepUnknown?: boolean

  /**
   * The layer name of generated rules
   */
  layer?: string
}

export default function transformerCompileClass(options: CompileClassOptions = {}): SourceCodeTransformer {
  const {
    trigger = ':uno:',
    classPrefix = 'uno-',
    hashFn = hash,
    keepUnknown = true,
  } = options
  const regex = new RegExp(`(["'\`])${escapeRegExp(trigger)}\\s([^\\1]*?)\\1`, 'g')

  return {
    name: 'compile-class',
    enforce: 'pre',
    async transform(s, _, { uno, tokens }) {
      const matches = [...s.original.matchAll(regex)]
      if (!matches.length)
        return

      for (const match of matches) {
        let body = expandVariantGroup(match[2].trim())
        const start = match.index!
        const replacements = []
        if (keepUnknown) {
          const result = await Promise.all(body.split(/\s+/).filter(Boolean).map(async i => [i, !!await uno.parseToken(i)] as const))
          const known = result.filter(([, matched]) => matched).map(([i]) => i)
          const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)
          replacements.push(...unknown)
          body = known.join(' ')
        }
        if (body) {
          const hash = hashFn(body)
          const className = `${classPrefix}${hash}`
          replacements.unshift(className)
          if (options.layer)
            uno.config.shortcuts.push([className, body, { layer: options.layer }])
          else
            uno.config.shortcuts.push([className, body])
          tokens.add(className)
        }
        s.overwrite(start + 1, start + match[0].length - 1, replacements.join(' '))
      }
    },
  }
}

function hash(str: string) {
  let i; let l
  let hval = 0x811C9DC5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return (`00000${(hval >>> 0).toString(36)}`).slice(-6)
}
