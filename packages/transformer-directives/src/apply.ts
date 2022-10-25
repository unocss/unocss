import type { StringifiedUtil } from '@unocss/core'
import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { CssNode, Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse } from 'css-tree'
import type { TransformerDirectivesContext } from '.'
import { transformDirectives } from '.'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export async function handleApply(ctx: TransformerDirectivesContext, node: Rule) {
  const { code, uno, options, filename, offset } = ctx
  const calcOffset = (pos: number) => offset ? pos + offset : pos

  await Promise.all(
    node.block.children.map(async (childNode) => {
      if (childNode.type === 'Raw')
        return transformDirectives(code, uno, options, filename, childNode.value, calcOffset(childNode.loc!.start.offset))
      await parseApply(ctx, node, childNode)
    }).toArray(),
  )
}

export async function parseApply({ code, uno, options, offset }: TransformerDirectivesContext, node: Rule, childNode: CssNode) {
  const { varStyle = '--at-' } = options
  const calcOffset = (pos: number) => offset ? pos + offset : pos

  let body: string | undefined
  if (childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude && childNode.prelude.type === 'Raw') {
    body = childNode.prelude.value.trim()
  }
  else if (varStyle !== false && childNode!.type === 'Declaration' && childNode.property === `${varStyle}apply` && childNode.value.type === 'Raw') {
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
      code.appendRight(calcOffset(childNode!.loc!.end.offset), body)
    }
  }
  code.remove(
    calcOffset(childNode!.loc!.start.offset),
    calcOffset(childNode!.loc!.end.offset),
  )
}
