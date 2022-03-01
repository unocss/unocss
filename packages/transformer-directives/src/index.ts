import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { SourceCodeTransformer, StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { CssNode, List, ListItem, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse, walk } from 'css-tree'
import type MagicString from 'magic-string-extra'
import { regexCssId } from '../../plugins-common/defaults'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export default function transformerDirectives(): SourceCodeTransformer {
  return {
    name: 'css-directive',
    enforce: 'pre',
    idFilter: id => !!id.match(regexCssId),
    transform: (code, id, ctx) => {
      return transformDirectives(code, ctx.uno, id)
    },
  }
}

export async function transformDirectives(code: MagicString, uno: UnoGenerator, filename?: string) {
  if (!code.original.includes('@apply'))
    return

  const ast = parse(code.original, {
    parseAtrulePrelude: false,
    positions: true,
    filename,
  })

  if (ast.type !== 'StyleSheet')
    return

  const stack: Promise<void>[] = []

  const processNode = async(node: CssNode, _item: ListItem<CssNode>, _list: List<CssNode>) => {
    if (node.type !== 'Rule')
      return

    await Promise.all(
      node.block.children.map(async(childNode, _childItem) => {
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

        const parentSelector = generate(node.prelude)

        for (const i of utils) {
          const [, _selector, body, parent] = i
          const selector = _selector?.replace(regexScopePlaceholder, ' ') || _selector

          if (parent) {
            const newNodeCss = `${parent}{${parentSelector}{${body}}}`
            code.appendLeft(node.loc!.start.offset, newNodeCss)
          }
          else if (selector && selector !== '.\\-') {
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

            const newNodeCss = `${generate(prelude)}{${body}}`
            code.appendLeft(node.loc!.start.offset, newNodeCss)
          }
          else if (node.block.children.toArray().length === 1) {
            const newNodeCss = `${parentSelector}{${body}}`
            code.appendLeft(node.loc!.start.offset, newNodeCss)
            code.remove(node.loc!.start.offset, node.loc!.end.offset)
          }
          else {
            code.appendRight(childNode.loc!.end.offset, body)
          }
        }
        code.remove(childNode.loc!.start.offset, childNode.loc!.end.offset)
      }).toArray(),
    )
  }

  walk(ast, (...args) => stack.push(processNode(...args)))

  await Promise.all(stack)
}
