import type { SourceMap } from 'magic-string'
import MagicString from 'magic-string'
import { escapeRegExp, expandVariantGroup } from '@unocss/core'
import type { UnoGenerator } from '@unocss/core'
import { splitCode } from '../../../../core/src/extractors/split'
import { wrapSelectorsWithGlobal } from './wrap-global'
import { hash } from './hash'

const classesRE = /class=(["'\`])([\S\s]*?)\1/g // class="mb-1" or class="{clsx('mb-1')}" or class="mb-1 {clsx('mb-1')}"
const classExpressionsRE = /class=()(\{[\S\s]*?\})/g // class={clsx('mb-1')}

const classDirectivesRE = /class:([\S]+?)=(["'\`])?\{([\S\s]*?)\}\2/g // class:mb-1={foo} or class:mb-1="{foo}"
const classDirectiveShorthandsRE = /class:([^\s={/>]+?)(?=[\s{/>])/g // class:mb-1 (compiled to class:uno-1hashz={mb-1})

const expressionsRE = /\{([\S\s]*?)\}/g // { foo }
const classesInsideExpressionRE = /(["'\`])([\S\s]+?)\1/g // { foo ? 'mt-1' : "mt-2"}

export interface TransformSFCOptions {
  /**
   * Prefix for compiled class name
   * @default 'uno-'
   */
  classPrefix?: string
  /**
   * Add hash and combine recognized tokens (optimal for production); set false in dev mode for easy dev tools toggling to allow for design adjustments in the browser
   * @default true
   */
  combine?: boolean
  /**
   * Hash function
   */
  hashFn?: (str: string) => string
}

export async function transformSvelteSFC(code: string, filename: string, uno: UnoGenerator, options: TransformSFCOptions = {}): Promise<{ code: string; map?: SourceMap } | undefined> {
  const {
    classPrefix = 'uno-',
    combine = true,
    hashFn = hash,
  } = options

  let generatedStyleBody = ''
  let map: SourceMap

  const styleTag = code.match(/<style([^>]*)>([\s\S]*?)<\/style\s*>/)
  const preflights = styleTag?.[1]?.includes('uno:preflights')
  const safelist = styleTag?.[1]?.includes('uno:safelist')

  if (preflights || safelist) {
    const { css } = await uno.generate('', { preflights, safelist })
    generatedStyleBody = css
  }

  const classes = [...code.matchAll(classesRE), ...code.matchAll(classExpressionsRE)]
  const classDirectives = [...code.matchAll(classDirectivesRE)]
  const classDirectivesShorthands = [...code.matchAll(classDirectiveShorthandsRE)]

  const hashedClassNames = new Map<string, string>()
  const s = new MagicString(code)

  async function hashClassName(className: string) {
    const tokens = splitCode(className).sort()
    const parsedTokens = await Promise.all(tokens.map(async token => ({ token, result: await uno.parseToken(token) })))

    const knownTokens = parsedTokens.filter(({ result }) => result).map(({ token }) => token)
    const unknownTokens = parsedTokens.filter(({ result }) => !result).map(({ token }) => token)

    const knownClassName = knownTokens.join(' ')
    const unknownClassName = unknownTokens.join(' ')

    if (knownTokens.length === 0)
      return ''

    const hashedClassName = `${classPrefix}${hashFn(`${filename}:${knownClassName}`)}`

    if (combine) {
      hashedClassNames.set(hashedClassName, knownClassName)
      return `${hashedClassName} ${unknownClassName}`.trim()
    }
    else {
      const hashedTokens = knownTokens.map((token) => {
        const hashedToken = `_${hashedClassName}__${token}`
        hashedClassNames.set(hashedToken, token)
        return hashedToken
      })

      return [...hashedTokens, ...unknownTokens].join(' ')
    }
  }

  for (const match of classes) {
    let className = expandVariantGroup(match[2].trim())

    const expressions = [...className.matchAll(expressionsRE)]
    const hashedExpressions = []
    for (const exprMatch of expressions) {
      let expr = exprMatch[0]
      className = className.replace(expr, '')

      const classes = [...expr.matchAll(classesInsideExpressionRE)]
      for (const cls of classes) {
        const hashedClassName = await hashClassName(cls[2])
        if (hashedClassName) {
          const pattern = new RegExp(`(['"\`])${escapeRegExp(cls[2])}\\1`, 'g')
          expr = expr.replace(pattern, `$1${hashedClassName}$1`)
        }
      }

      hashedExpressions.push(expr)
    }

    const hashedClassName = await hashClassName(className)
    if (hashedClassName)
      className = className.replace(className, hashedClassName)

    if (hashedExpressions.length > 0)
      className = `${className} ${hashedExpressions.join(' ')}`.trim()

    s.overwrite(match.index!, match.index! + match[0].length, `class="${className}"`)
  }

  for (const match of classDirectives) {
    const className = match[1]
    const hashedClassName = await hashClassName(className)
    if (hashedClassName)
      s.overwrite(match.index!, match.index! + match[0].length, `class:${hashedClassName}="{${match[3]}}"`)
  }

  for (const match of classDirectivesShorthands) {
    const className = match[1]
    const hashedClassName = await hashClassName(className)
    if (hashedClassName)
      s.overwrite(match.index!, match.index! + match[0].length, `class:${hashedClassName}="{${match[1]}}"`)
  }

  const originalShortcuts = uno.config.shortcuts
  uno.config.shortcuts = [...originalShortcuts, ...hashedClassNames.entries()]
  const { css } = await uno.generate([...hashedClassNames.keys()], { preflights: false, safelist: false, minify: true })
  uno.config.shortcuts = originalShortcuts

  generatedStyleBody += wrapSelectorsWithGlobal(css)

  if (hashedClassNames.size > 0 || s.hasChanged()) {
    code = s.toString()
    map = s.generateMap({ hires: true, source: filename })
  }
  else { return }

  if (styleTag) {
    return {
      code: code.replace(styleTag[0], `<style${styleTag[1] ? ` ${styleTag[1]}` : ''}>${styleTag[2]}${generatedStyleBody}</style>`),
      map,
    }
  }
  return {
    code: `${code}\n<style>${generatedStyleBody}</style>`,
    map,
  }
}
