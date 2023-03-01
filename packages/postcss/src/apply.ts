import type { StringifiedUtil, UnoGenerator } from '@unocss/core'
import type { Root } from 'postcss'
import postcss from 'postcss'
import type { Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse } from 'css-tree'
import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export async function parseApply(root: Root, uno: UnoGenerator, directiveName: string) {
  // @ts-expect-error types doesn't allow async callback but it seems work
  root.walkAtRules(directiveName, async (rule) => {
    if (!rule.parent)
      return

    const source = rule.source
    const classNames = expandVariantGroup(rule.params)
      .split(/\s+/g)
      .map(className => className.trim().replace(/\\/, ''))
    const utils = (await Promise.all(
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
        const node = parse(rule.parent.toString(), {
          context: 'rule',
        }) as Rule
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

        const css_parsed = postcss.parse(css)
        css_parsed.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.parent.after(css_parsed)
      }
      else {
        const css = postcss.parse(body)
        css.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.parent.append(css)
      }
    }

    rule.remove()
  })
}
