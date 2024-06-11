import type { StringifiedUtil } from '@unocss/core'
import { expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import type { CssNode, Rule, Selector, SelectorList } from 'css-tree'
import { List, clone, generate, parse } from 'css-tree'
import { transformDirectives } from './transform'
import type { TransformerDirectivesContext } from './types'

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
  const original = code.original

  let body: string | undefined
  if (childNode.type === 'Atrule' && childNode.name === 'apply' && childNode.prelude && childNode.prelude.type === 'Raw') {
    body = removeQuotes(childNode.prelude.value.trim())
  }

  else if (childNode!.type === 'Declaration' && applyVariable.includes(childNode.property) && (childNode.value.type === 'Value' || childNode.value.type === 'Raw')) {
    // Get raw value of the declaration
    // as csstree would try to parse the content with operators, but we don't need them.
    let rawValue = original.slice(
      calcOffset(childNode.value.loc!.start.offset),
      calcOffset(childNode.value.loc!.end.offset),
    ).trim()
    rawValue = removeQuotes(rawValue)
    const items = rawValue
      .split(/\s+/g)
      .filter(Boolean)
      .map(i => removeQuotes(i))
    body = items.join(' ')
  }

  if (!body)
    return

  body = removeComments(body)

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

  const simicolonOffset = original[calcOffset(childNode.loc!.end.offset)] === ';' ? 1 : 0
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
        code.appendRight(original.length + simicolonOffset, body)
      else
        code.appendRight(calcOffset(childNode!.loc!.end.offset + simicolonOffset), body)
    }
  }
  code.remove(
    calcOffset(childNode!.loc!.start.offset),
    calcOffset(childNode!.loc!.end.offset + simicolonOffset),
  )
}

function removeQuotes(value: string) {
  return value.replace(/^(['"])(.*)\1$/, '$2')
}

function removeComments(value: string) {
  return value.replace(/(\/\*(?:.|\n)*?\*\/)|(\/\/.*)/g, '')
}
