import type { StringifiedUtil } from '@unocss/core'
import { regexScopePlaceholder } from '@unocss/core'
import type { CssNode, Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse } from 'css-tree'
import type MagicString from 'magic-string'

export function writeUtilStyles([, selector, body, parent]: StringifiedUtil, s: MagicString, node: Rule, childNode: CssNode) {
  if (!selector)
    return

  const selectorChanged = selector !== '.\\-'

  if (!parent && !selectorChanged)
    return s.appendRight(childNode!.loc!.end.offset, body)

  const originalSelector = generate(node.prelude)

  if (parent && !selectorChanged) {
    const css = `${parent}{${originalSelector}{${body}}}`
    return s.appendLeft(node.loc!.end.offset, css)
  }

  const utilSelector = selector.replace(regexScopePlaceholder, ' ')
  const updatedSelector = generateUpdatedSelector(utilSelector, node.prelude as SelectorList)
  const svelteCompilerReadySelector = surroundAllButOriginalSelectorWithGlobal(originalSelector, updatedSelector)

  const rule = `${svelteCompilerReadySelector}{${body}}`
  const css = parent ? `${parent}{${rule}}` : rule
  s.appendLeft(node.loc!.end.offset, css)
}

export function generateUpdatedSelector(selector: string, _prelude: SelectorList) {
  const selectorAST = parse(selector, {
    context: 'selector',
  }) as Selector

  const prelude = clone(_prelude) as SelectorList

  prelude.children.forEach((child) => {
    const parentSelectorAst = clone(selectorAST) as Selector

    parentSelectorAst.children.forEach((i) => {
      if (i.type === 'ClassSelector' && i.name === '\\-')
        Object.assign(i, clone(child))
    })
    Object.assign(child, parentSelectorAst)
  })
  return generate(prelude)
}

export function surroundAllButOriginalSelectorWithGlobal(originalSelector: string, updatedSelector: string): string {
  const wrapWithGlobal = (str: string) => `:global(${str})`

  const originalSelectors = originalSelector.split(',').map(s => s.trim())
  const updatedSelectors = updatedSelector.split(',').map(s => s.trim())

  const resultSelectors = originalSelectors.map((original, index) => {
    const updated = updatedSelectors[index]
    const [prefix, suffix] = updated.split(original).map(s => s.trim())
    const wrappedPrefix = prefix ? wrapWithGlobal(prefix) : ''

    if (!suffix)
      return `${wrappedPrefix} ${original}`.trim()

    const indexOfFirstCombinator = findFirstCombinatorIndex(suffix)

    if (indexOfFirstCombinator === -1)
      return `${wrappedPrefix} ${original}${suffix}`.trim()

    const pseudo = suffix.substring(0, indexOfFirstCombinator).trim()
    const siblingsOrDescendants = suffix.substring(indexOfFirstCombinator).trim()

    return `${wrappedPrefix} ${original}${pseudo} ${wrapWithGlobal(siblingsOrDescendants)}`.trim()
  })

  return resultSelectors.join(', ')
}

function findFirstCombinatorIndex(input: string): number {
  const combinators = [' ', '>', '~', '+']
  for (const c of combinators) {
    const indexOfFirstCombinator = input.indexOf(c)
    if (indexOfFirstCombinator !== -1)
      return indexOfFirstCombinator
  }
  return -1
}
