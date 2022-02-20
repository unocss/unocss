import { notNull } from '@unocss/core'
import type { RuleMeta, StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { CssNode, ListItem, Selector, SelectorList, StyleSheet } from 'css-tree'
import { List, clone, generate, parse, walk } from 'css-tree'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export async function transformCSS(css: string, uno: UnoGenerator, filename?: string) {
  if (!css.includes('@apply'))
    return css

  const ast = parse(css, {
    parseAtrulePrelude: false,
    positions: true,
    filename,
  })

  if (ast.type !== 'StyleSheet')
    return css

  const stack: Promise<void>[] = []

  const processNode = async(node: CssNode, item: ListItem<CssNode>, list: List<CssNode>) => {
    if (node.type !== 'Rule')
      return

    await Promise.all(
      node.block.children.map(async(childNode, childItem) => {
        if (!(childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude))
          return

        const raw = '-'
        const context = uno.makeContext(raw, [raw, raw, []])

        let classNames: string[] = []

        if (childNode.prelude.type === 'AtrulePrelude') {
          classNames = childNode.prelude.children
            .map(node => node.type === 'Identifier' ? node.name : null)
            .filter(notNull).toArray()
        }

        if (childNode.prelude.type === 'Raw')
          classNames = childNode.prelude.value.split(/\s+/g)

        // expand shortcuts
        const expanded = classNames.map((i) => {
          return uno.expandShortcut(i, context) || ([[i], undefined] as [string[], RuleMeta | undefined])
        }).filter(notNull)

        if (!expanded.length)
          return

        const parentSelector = generate(node.prelude)

        const utils = (
          await Promise.all(
            expanded.map(async i => await uno.stringifyShortcuts([raw, raw, []], context, i[0], i[1])),
          ))
          .filter(notNull).flat()
          .sort((a, b) => a[0] - b[0])
          .reduce((acc, item) => {
            const target = acc.find(i => i[1] === item[1])
            if (target)
              target[2] += item[2]
            else
              acc.push(item as Writeable<StringifiedUtil>)
            return acc
          }, [] as Writeable<StringifiedUtil>[])

        for (const i of utils) {
          if (i[3]) {
            const newNodeCss = `${i[3]}{${parentSelector}{${i[2]}}}`
            const insertNodeAst = parse(newNodeCss) as StyleSheet

            list.insertList(insertNodeAst.children, item)
          }
          else if (i[1] && i[1] !== '.\\-') {
            const pseudoClassSelectors = (
              parse(i[1], {
                context: 'selector',
              }) as Selector)
              .children
              .filter(i => i.type === 'PseudoClassSelector')

            const parentSelectorAst = clone(node.prelude) as SelectorList

            parentSelectorAst.children.forEach((i) => {
              if (i.type === 'Selector')
                i.children.appendList(pseudoClassSelectors)
            })

            const newNodeCss = `${generate(parentSelectorAst)}{${i[2]}}`
            const insertNodeAst = parse(newNodeCss) as StyleSheet

            list.insertList(insertNodeAst.children, item)
          }
          else {
            const rules = new List<string>()
              .fromArray(i[2]
                .replace(/;$/, '')
                .split(';'),
              ).map(i => parse(i, {
                context: 'declaration',
              }))

            node.block.children.insertList(rules, childItem)
          }
        }
        node.block.children.remove(childItem)
      }).toArray(),
    )
  }

  walk(ast, (...args) => stack.push(processNode(...args)))

  await Promise.all(stack)

  // @todo merge rules with same media query

  return generate(ast)
}
