import type { SourceCodeTransformer } from '@unocss/core'
import { escapeRegExp, expandVariantGroup } from '@unocss/core'

export interface CompileClassOptions {
  /**
   * Trigger regex literal. The default trigger regex literal matches `:uno:`,
   * for example: `<div class=":uno: font-bold text-white">`.
   *
   * @example
   * The trigger additionally allows defining a capture group named `name`, which
   * allows custom class names. One possible regex would be:
   *
   * ```
   * export default defineConfig({
   *   transformers: [
   *     transformerCompileClass({
   *       trigger: /(["'`]):uno(?:-)?(?<name>[^\s\1]+)?:\s([^\1]*?)\1/g
   *     }),
   *   ],
   * })
   * ```
   *
   * This regular expression matches `:uno-MYNAME:` and uses `MYNAME` in
   * combination with the class prefix as the final class name, for example:
   * `.uno-MYNAME`. It should be noted that the regex literal needs to include
   * the global flag `/g`.
   *
   * @note
   * This parameter is backwards compatible. It accepts string only trigger
   * words, like `:uno:` or a regex literal.
   *
   * @default `/(["'`]):uno:\s([^\1]*?)\1/g`
   */
  trigger?: string | RegExp

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
    trigger = /(["'`]):uno(?:-)?(?<name>[^\s\1]+)?:\s([^\1]*?)\1/g,
    classPrefix = 'uno-',
    hashFn = hash,
    keepUnknown = true,
  } = options

  // Provides backwards compatibility. We either accept a trigger string which
  // gets turned into a regexp (like previously) or a regex literal directly.
  const regexp = typeof trigger === 'string'
    ? RegExp(`(["'\`])${escapeRegExp(trigger)}\\s([^\\1]*?)\\1`, 'g')
    : trigger

  return {
    name: '@unocss/transformer-compile-class',
    enforce: 'pre',
    async transform(s, _, { uno, tokens }) {
      const matches = [...s.original.matchAll(regexp)]
      if (!matches.length)
        return

      for (const match of matches) {
        let body = (match.length === 4 && match.groups)
          ? expandVariantGroup(match[3].trim())
          : expandVariantGroup(match[2].trim())

        const start = match.index!
        const replacements: string[] = []

        if (keepUnknown) {
          const result = await Promise.all(body.split(/\s+/).filter(Boolean).map(async i => [i, !!await uno.parseToken(i)] as const))
          const known = result.filter(([, matched]) => matched).map(([i]) => i)
          const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)
          replacements.push(...unknown)
          body = known.join(' ')
        }

        if (body) {
          body = body.split(/\s+/).sort().join(' ')

          const hashClassName = `${classPrefix}${hashFn(body)}`

          const defineClassName = (match.groups && match.groups.name)
            ? `${classPrefix}${match.groups.name}`
            : ''

          const className = defineClassName || hashClassName
          const token = defineClassName ? `${defineClassName}:${hashClassName}` : hashClassName

          // FIXME: Ideally we should also check that the hash doesn't match. If the hash is the same, the same class
          // name is allowed, as the applied styles are the same.
          if (tokens && tokens.has(className) && !tokens.has(token))
            throw new Error(`duplicate compile class name '${className}', please choose different class name`)

          replacements.unshift(className)
          if (options.layer)
            uno.config.shortcuts.push([className, body, { layer: options.layer }])
          else
            uno.config.shortcuts.push([className, body])

          if (tokens) {
            tokens.add(token)

            if (className !== token) {
              tokens.add(className)
            }
          }
        }

        s.overwrite(start + 1, start + match[0].length - 1, replacements.join(' '))
      }
    },
  }
}

function hash(str: string) {
  let i
  let l
  let hval = 0x811C9DC5

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return (`00000${(hval >>> 0).toString(36)}`).slice(-6)
}
