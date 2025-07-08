import { describe, expect, it } from 'vitest'
import { wrapSelectorsWithGlobal } from './wrapGlobal'

describe('wrapSelectorsWithGlobal', () => {
  it('wraps multiple selectors with :global()', () => {
    const css = '.my-class{color:red;}[dir="rtl"] .mb-1{margin-bottom:0.25em;}'
    const expected = ':global(.my-class){color:red;}:global([dir="rtl"] .mb-1){margin-bottom:0.25em;}'

    expect(wrapSelectorsWithGlobal(css)).toBe(expected)
  })

  it('should not wrap selectors preceded by digits', () => {
    const css = `@keyframes animation {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }`
    expect(wrapSelectorsWithGlobal(css)).toBe(css)
  })

  it('should not wrap @media selectors (selectors inside parenthesis)', () => {
    const css = '@media (min-width: 768px) {.my-class{color:red;}}'
    const expected = '@media (min-width: 768px) {:global(.my-class){color:red;}}'

    expect(wrapSelectorsWithGlobal(css)).toBe(expected)
  })

  it('should not wrap selectors starting with * or ::', () => {
    const cssWithAsterisk = '*,::before,::after { --un-rotate: 0;}'
    expect(wrapSelectorsWithGlobal(cssWithAsterisk)).toBe(cssWithAsterisk)
    const cssWithDoubleColon = '::backdrop { --un-rotate: 0;}'
    expect(wrapSelectorsWithGlobal(cssWithDoubleColon)).toBe(cssWithDoubleColon)
  })
})

// if we ever need to wrap a class starting with a colon as in ":not(...)" then we would need to avoid grabbing colons from media queries like `@media (min-width: 640px){.uno-28lpzl{margin-bottom:0.5rem;}}`
