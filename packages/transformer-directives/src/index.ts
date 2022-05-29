import { cssIdRE, expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { SourceCodeTransformer, StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { CssNode, List, ListItem, Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse, walk } from 'css-tree'
import type MagicString from 'magic-string'

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
  const hasThemeFn = /theme\([^)]*?\)/.test(code.original)

  if (!isApply && !hasThemeFn)
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

    const classNames = expandVariantGroup(body).split(/\s+/g)
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

  const handleThemeFn = (node: CssNode) => {
    if (node.type === 'Function' && node.name === 'theme' && node.children) {
      const children = node.children.toArray().filter(n => n.type === 'String')

      // TODO: to discuss how we handle multiple theme params
      // https://github.com/unocss/unocss/pull/1005#issuecomment-1136757201
      if (children.length !== 1)
        throw new Error(`theme() expect exact one argument, but got ${children.length}`)

      const matchedThemes = children.map((childNode) => {
        if (childNode.type !== 'String')
          return null

        const keys = childNode.value.split('.')

        let value: any = uno.config.theme

        keys.every((key) => {
          if (!Reflect.has(value, key)) {
            value = null
            return false
          }
          value = value[key]
          return true
        })

        if (typeof value === 'string')
          return value
        if (throwOnMissing)
          throw new Error(`theme of "${childNode.value}" did not found`)
        return null
      })

      if (matchedThemes.length !== children.length)
        return

      code.overwrite(
        calcOffset(node.loc!.start.offset),
        calcOffset(node.loc!.end.offset),
        matchedThemes.join(' '),
      )
    }
  }

  const stack: Promise<void>[] = []

  const processNode = async (node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
    if (hasThemeFn)
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
