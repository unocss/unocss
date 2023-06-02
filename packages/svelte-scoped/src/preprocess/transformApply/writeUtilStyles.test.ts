import type { SelectorList } from 'css-tree'
import { parse, walk } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { generateUpdatedSelector, surroundAllButOriginalSelectorWithGlobal } from './writeUtilStyles'

describe('generateUpdatedSelector', () => {
  const css = 'button {}'
  const prelude = mockPrelude(css)

  it('replaces .\\- with class name', () => {
    const selector = '.dark [dir="rtl"] .\\-:hover>:not([hidden])~:not([hidden])'
    const expected = '.dark [dir="rtl"] button:hover>:not([hidden])~:not([hidden])'
    expect(generateUpdatedSelector(selector, prelude)).toBe(expected)
  })

  it('handles two classes', () => {
    const cssWithTwoSelectors = 'button, .btn {}'
    const preludeWithTwoSelectors = mockPrelude(cssWithTwoSelectors)

    const selector = '.dark .\\-'
    const expected = '.dark button,.dark .btn'
    expect(generateUpdatedSelector(selector, preludeWithTwoSelectors)).toBe(expected)
  })
})

function mockPrelude(css: string) {
  let firstRulePrelude: SelectorList | undefined
  const ast = parse(css, {
    positions: true,
  })

  walk(ast, (node) => {
    if (node.type === 'Rule') {
      firstRulePrelude = node.prelude as SelectorList
      return false // stop the walk after finding the first 'Rule' node
    }
  })
  return firstRulePrelude as SelectorList
}

describe('surroundAllButOriginalSelectorWithGlobal', () => {
  it('wraps two parents, ignores pseudo-element, wraps child, handles multiple selectors', () => {
    const originalSelector = 'button, .btn'
    const updatedSelector = '.dark .gray button:focus > .child, .dark .gray .btn:focus > .child'
    const expected = ':global(.dark .gray) button:focus :global(> .child), :global(.dark .gray) .btn:focus :global(> .child)'
    expect(surroundAllButOriginalSelectorWithGlobal(originalSelector, updatedSelector)).toEqual(expected)
  })

  it('ignores pseudo-element and wraps child indicated caret without space', () => {
    const originalSelector = 'div'
    const updatedSelector = 'div::first-line>span'
    const expected = 'div::first-line :global(>span)'
    expect(surroundAllButOriginalSelectorWithGlobal(originalSelector, updatedSelector)).toEqual(expected)
  })

  it('ignores pseudo-class', () => {
    const originalSelector = 'button'
    const updatedSelector = 'button:focus'
    const expected = updatedSelector
    expect(surroundAllButOriginalSelectorWithGlobal(originalSelector, updatedSelector)).toEqual(expected)
  })

  it('handles no changes', () => {
    const originalSelector = 'button'
    const updatedSelector = originalSelector
    expect(surroundAllButOriginalSelectorWithGlobal(originalSelector, updatedSelector)).toEqual(originalSelector)
  })
})
