import { cssIdRE, expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { SourceCodeTransformer, StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { Atrule, CssNode, Declaration, List, ListItem, Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse, walk } from 'css-tree'
import type MagicString from 'magic-string'
import type { Theme } from '@unocss/preset-mini'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export interface TransformerDirectivesOptions {
  enforce?: SourceCodeTransformer['enforce']
  /**
   * Treat CSS variables as directives for CSS syntax compatible.
   *
   * Pass `false` to disable, or a string to use as a prefix.
   *
   * @default '--at-'
   */
  varStyle?: false | string

  /**
   * Throw an error if utils or themes are not found.
   *
   * @default true
   */
  throwOnMissing?: boolean
}

export default function transformerDirectives(options: TransformerDirectivesOptions = {}): SourceCodeTransformer {
  return {
    name: 'css-directive',
    enforce: options?.enforce,
    idFilter: id => !!id.match(cssIdRE),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, options, id)
    },
  }
}

const themeFnRE = /theme\((.*?)\)/g
const screenRuleRE = /(@screen) (.+) /g

export async function transformDirectives(
  code: MagicString,
  uno: UnoGenerator,
  options: TransformerDirectivesOptions,
  filename?: string,
  originalCode?: string,
  offset?: number,
) {
  const {
    varStyle = '--at-',
    throwOnMissing = true,
  } = options

  const isApply = code.original.includes('@apply') || (varStyle !== false && code.original.includes(varStyle))
  const isScreen = code.original.includes('@screen')
  const hasThemeFn = code.original.match(themeFnRE)

  if (!isApply && !hasThemeFn && !isScreen)
    return

  const ast = parse(originalCode || code.original, {
    parseAtrulePrelude: false,
    positions: true,
    filename,
  })

  if (ast.type !== 'StyleSheet')
    return

  const calcOffset = (pos: number) => offset ? pos + offset : pos

  const handleApply = async (node: Rule, childNode: CssNode) => {
    let body: string | undefined
    if (childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude && childNode.prelude.type === 'Raw') {
      body = childNode.prelude.value.trim()
    }
    else if (varStyle !== false && childNode.type === 'Declaration' && childNode.property === `${varStyle}apply` && childNode.value.type === 'Raw') {
      body = childNode.value.value.trim()
      // remove quotes
      if (body.match(/^(['"]).*\1$/))
        body = body.slice(1, -1)
    }

    if (!body)
      return

    const classNames = expandVariantGroup(body)
      .split(/\s+/g)
      .map(className => className.trim().replace(/\\/, ''))

    const utils = (
      await Promise.all(
        classNames.map(i => uno.parseToken(i, '-')),
      ))
      .filter(notNull).flat()
      .sort((a, b) => a[0] - b[0])
      .sort((a, b) => (a[3] ? uno.parentOrders.get(a[3]) ?? 0 : 0) - (b[3] ? uno.parentOrders.get(b[3]) ?? 0 : 0))
      .reduce((acc, item) => {
        const target = acc.find(i => i[1] === item[1] && i[3] === item[3])
        if (target)
          target[2] += item[2]
        else
        // use spread operator to prevent reassign to uno internal cache
          acc.push([...item] as Writeable<StringifiedUtil>)
        return acc
      }, [] as Writeable<StringifiedUtil>[])

    if (!utils.length)
      return

    for (const i of utils) {
      const [, _selector, body, parent] = i
      const selector = _selector?.replace(regexScopePlaceholder, ' ') || _selector

      if (parent || (selector && selector !== '.\\-')) {
        let newSelector = generate(node.prelude)
        if (selector && selector !== '.\\-') {
          const selectorAST = parse(selector, {
            context: 'selector',
          }) as Selector

          const prelude = clone(node.prelude) as SelectorList

          prelude.children.forEach((child) => {
            const parentSelectorAst = clone(selectorAST) as Selector
            parentSelectorAst.children.forEach((i) => {
              if (i.type === 'ClassSelector' && i.name === '\\-')
                Object.assign(i, clone(child))
            })
            Object.assign(child, parentSelectorAst)
          })
          newSelector = generate(prelude)
        }

        let css = `${newSelector}{${body}}`
        if (parent)
          css = `${parent}{${css}}`

        code.appendLeft(calcOffset(node.loc!.end.offset), css)
      }
      else {
        code.appendRight(calcOffset(childNode.loc!.end.offset), body)
      }
    }
    code.remove(
      calcOffset(childNode.loc!.start.offset),
      calcOffset(childNode.loc!.end.offset),
    )
  }

  const handleThemeFn = (node: Declaration) => {
    const value = node.value
    const offset = value.loc!.start.offset
    const str = code.original.slice(offset, value.loc!.end.offset)
    const matches = Array.from(str.matchAll(themeFnRE))

    if (!matches.length)
      return

    for (const match of matches) {
      const rawArg = match[1].trim()
      if (!rawArg)
        throw new Error('theme() expect exact one argument, but got 0')

      let value: any = uno.config.theme
      const keys = rawArg.slice(1, -1).split('.')

      keys.every((key) => {
        if (value[key] != null)
          value = value[key]
        else if (value[+key] != null)
          value = value[+key]
        else
          return false
        return true
      })

      if (typeof value === 'string') {
        code.overwrite(
          offset + match.index!,
          offset + match.index! + match[0].length,
          value,
        )
      }
      else if (throwOnMissing) {
        throw new Error(`theme of "${rawArg.slice(1, -1)}" did not found`)
      }
    }
  }

  const handleScreen = (node: Atrule) => {
    let breakpointName = ''; let prefix
    if (node.name === 'screen' && node.prelude?.type === 'Raw')
      breakpointName = node.prelude.value.trim()

    if (!breakpointName)
      return

    const match = breakpointName.match(/^(?:(lt|at)-)?(\w+)$/)
    if (match) {
      prefix = match[1]
      breakpointName = match[2]
    }

    const resolveBreakpoints = () => {
      let breakpoints: Record<string, string> | undefined
      if (uno.userConfig && uno.userConfig.theme)
        breakpoints = (uno.userConfig.theme as Theme).breakpoints

      if (!breakpoints)
        breakpoints = (uno.config.theme as Theme).breakpoints

      return breakpoints
    }
    const variantEntries: Array<[string, string, number]> = Object.entries(resolveBreakpoints() ?? {}).map(([point, size], idx) => [point, size, idx])
    const generateMediaQuery = (breakpointName: string, prefix?: string) => {
      const [, size, idx] = variantEntries.find(i => i[0] === breakpointName)!
      if (prefix) {
        if (prefix === 'lt')
          return `@media (max-width: ${calcMaxWidthBySize(size)})`
        else if (prefix === 'at')
          return `@media (min-width: ${size})${variantEntries[idx + 1] ? ` and (max-width: ${calcMaxWidthBySize(variantEntries[idx + 1][1])})` : ''}`

        else throw new Error(`breakpoint variant not surpported: ${prefix}`)
      }
      return `@media (min-width: ${size})`
    }

    if (!variantEntries.find(i => i[0] === breakpointName))
      throw new Error(`breakpoint ${breakpointName} not found`)

    const offset = node.loc!.start.offset
    const str = code.original.slice(offset, node.loc!.end.offset)
    const matches = Array.from(str.matchAll(screenRuleRE))

    if (!matches.length)
      return

    for (const match of matches) {
      code.overwrite(
        offset + match.index!,
        offset + match.index! + match[0].length,
        `${generateMediaQuery(breakpointName, prefix)} `,
      )
    }
  }

  const stack: Promise<void>[] = []

  const processNode = async (node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
    if (isScreen && node.type === 'Atrule')
      handleScreen(node)

    if (hasThemeFn && node.type === 'Declaration')
      handleThemeFn(node)

    if (isApply && node.type === 'Rule') {
      await Promise.all(
        node.block.children.map(async (childNode, _childItem) => {
          if (childNode.type === 'Raw')
            return transformDirectives(code, uno, options, filename, childNode.value, calcOffset(childNode.loc!.start.offset))
          await handleApply(node, childNode)
        }).toArray(),
      )
    }
  }

  walk(ast, (...args) => stack.push(processNode(...args)))

  await Promise.all(stack)
}

function calcMaxWidthBySize(size: string) {
  const value = size.match(/^-?[0-9]+\.?[0-9]*/)?.[0] || ''
  const unit = size.slice(value.length)
  const maxWidth = (parseFloat(value) - 0.1)
  return Number.isNaN(maxWidth) ? size : `${maxWidth}${unit}`
}
