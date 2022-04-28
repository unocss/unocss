import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { SourceCodeTransformer, StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { CssNode, List, ListItem, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse, walk } from 'css-tree'
import type MagicString from 'magic-string'
import { regexCssId } from '../../plugins-common/defaults'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

interface TransformerDirectivesOptions {
  enforce?: SourceCodeTransformer['enforce']
}

export default function transformerDirectives(options?: TransformerDirectivesOptions): SourceCodeTransformer {
  return {
    name: 'css-directive',
    enforce: options?.enforce,
    idFilter: id => !!id.match(regexCssId),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, id)
    },
  }
}

export async function transformDirectives(code: MagicString, uno: UnoGenerator, filename?: string, originalCode?: string, offset?: number) {
  if (!code.original.includes('@apply'))
    return

  const ast = parse(originalCode || code.original, {
    parseAtrulePrelude: false,
    positions: true,
    filename,
  })

  const calcOffset = (pos: number) => offset ? pos + offset : pos

  if (ast.type !== 'StyleSheet')
    return

  const stack: Promise<void>[] = []

  const processNode = async (node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
    if (node.type !== 'Rule')
      return

    await Promise.all(
      node.block.children.map(async (childNode, _childItem) => {
        if (childNode.type === 'Raw')
          return transformDirectives(code, uno, filename, childNode.value, calcOffset(childNode.loc!.start.offset))

        if (!(childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude))
          return

        if (childNode.prelude.type !== 'Raw')
          return

        const classNames = expandVariantGroup(childNode.prelude.value).split(/\s+/g)

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
      }).toArray(),
    )
  }

  walk(ast, (...args) => stack.push(processNode(...args)))

  await Promise.all(stack)
}
