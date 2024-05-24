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
   * @default `/(["'`]):uno(?:-)?(?<name>[^\s\1]+)?:\s([^\1]*?)\1/g`
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
   * Allow add hash to class name even if the class name is explicitly defined
   *
   * @default false
   */
  alwaysHash?: boolean

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
    // eslint-disable-next-line regexp/strict
    trigger = /(["'`]):uno-?(?<name>[^\s\1]+)?:\s([^\1]*?)\1/g,
    classPrefix = 'uno-',
    hashFn = hash,
    keepUnknown = true,
    alwaysHash = false,
  } = options
  // #2866
  const compiledClass = new Set()

  // Provides backwards compatibility. We either accept a trigger string which
  // gets turned into a regexp (like previously) or a regex literal directly.
  const regexp = typeof trigger === 'string'
    ? RegExp(`(["'\`])${escapeRegExp(trigger)}\\s([^\\1]*?)\\1`, 'g')
    : trigger

  return {
    name: '@unocss/transformer-compile-class',
    enforce: 'pre',
    async transform(s, _, { uno, tokens, invalidate }) {
      const matches = [...s.original.matchAll(regexp)]
      if (!matches.length)
        return

      const size = compiledClass.size
      for (const match of matches) {
        let body = (match.length === 4 && match.groups)
          ? expandVariantGroup(match[3].trim())
          : expandVariantGroup(match[2].trim())

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
          body = body.split(/\s+/).sort().join(' ')
          let hash: string
          let explicitName = false

          if (match.groups && match.groups.name) {
            hash = match.groups.name
            if (alwaysHash)
              hash += `-${hashFn(body)}`
            explicitName = true
          }
          else {
            hash = hashFn(body)
          }
          const className = `${classPrefix}${hash}`

          if (tokens && tokens.has(className) && explicitName) {
            const existing = uno.config.shortcuts.find(i => i[0] === className)
            if (existing && existing[1] !== body)
              throw new Error(`Duplicated compile class name "${className}". One is "${body}" and the other is "${existing[1]}". Please choose different class name or set 'alwaysHash' to 'true'.`)
          }

          compiledClass.add(className)
          replacements.unshift(className)
          if (options.layer)
            uno.config.shortcuts.push([className, body, { layer: options.layer }])
          else
            uno.config.shortcuts.push([className, body])

          if (tokens)
            tokens.add(className)
        }

        s.overwrite(start + 1, start + match[0].length - 1, replacements.join(' '))
      }

      if (compiledClass.size > size)
        invalidate()
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
