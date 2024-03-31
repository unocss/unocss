import type { StringifiedUtil } from '@unocss/core'
import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { CssNode, Rule, Selector, SelectorList } from 'css-tree'
import { List, clone, generate, parse } from 'css-tree'
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

export async function parseApply({ code, uno, offset, applyVariable }: TransformerDirectivesContext, node: Rule, childNode: CssNode) {
  const calcOffset = (pos: number) => offset ? pos + offset : pos

  let body: string | undefined
  if (childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude && childNode.prelude.type === 'Raw')
    body = childNode.prelude.value.trim()

  else if (childNode!.type === 'Declaration' && applyVariable.includes(childNode.property) && childNode.value.type === 'Raw')
    body = childNode.value.value.trim()

  if (!body)
    return

  // remove quotes
  if (/^(['"]).*\1$/.test(body))
    body = body.slice(1, -1)

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
  const simicolonOffset = code.toString()[childNode.loc!.end.offset] === ';' ? 1 : 0

  for (const i of utils) {
    const [, _selector, body, parent] = i
    const selectorOrGroup = _selector?.replace(regexScopePlaceholder, ' ') || _selector

    if (parent || (selectorOrGroup && selectorOrGroup !== '.\\-')) {
      let newSelector = generate(node.prelude)
      if (selectorOrGroup && selectorOrGroup !== '.\\-') {
        // use rule context since it could be a selector(.foo) or a selector group(.foo, .bar)
        const ruleAST = parse(`${selectorOrGroup}{}`, {
          context: 'rule',
        }) as Rule

        const prelude = clone(node.prelude) as SelectorList

        prelude.children.forEach((child) => {
          const selectorListAst = clone(ruleAST.prelude) as SelectorList
          const classSelectors: List<CssNode> = new List()

          selectorListAst.children.forEach((selectorAst) => {
            classSelectors.appendList((selectorAst as Selector).children.filter(i => i.type === 'ClassSelector' && i.name === '\\-'))
          })
          classSelectors.forEach(i => Object.assign(i, clone(child)))

          Object.assign(child, selectorListAst)
        })
        newSelector = generate(prelude)
      }

      let css = `${newSelector}{${body}}`
      if (parent)
        css = `${parent}{${css}}`

      code.appendLeft(calcOffset(node.loc!.end.offset), css)
    }
    else {
      // If nested css was scoped, put them last.
      if (body.includes('@'))
        code.appendRight(code.original.length + simicolonOffset, body)
      else
        code.appendRight(calcOffset(childNode!.loc!.end.offset + simicolonOffset), body)
    }
  }
  code.remove(
    calcOffset(childNode!.loc!.start.offset),
    calcOffset(childNode!.loc!.end.offset + simicolonOffset),
  )
}
