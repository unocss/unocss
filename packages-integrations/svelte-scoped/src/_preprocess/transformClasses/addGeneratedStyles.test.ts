import { describe, expect, it } from 'vitest'
import { addGeneratedStylesIntoStyleBlock } from './addGeneratedStyles'

describe('addGeneratedStylesIntoStyleBlock', () => {
  it('adds styles to beginning of existing style block', () => {
    const code = '<style>body { background-color: red; }</style>'
    const styles = 'h1 { color: blue; }'
    const expected = '<style>h1 { color: blue; }body { background-color: red; }</style>'

    expect(addGeneratedStylesIntoStyleBlock(code, styles)).toBe(expected)
  })

  it('creates a new style block with the styles if no existing style block', () => {
    const code = '<div>Hello World</div>'
    const styles = 'h1 { color: blue; }'
    const expected = '<div>Hello World</div>\n<style>h1 { color: blue; }</style>'

    expect(addGeneratedStylesIntoStyleBlock(code, styles)).toBe(expected)
  })

  it('should not add styles to commented out style block', () => {
    const styles = 'h1 { color: blue; }'

    const code = `<div />
<!-- <style>body { background-color: red; }</style> -->`

    const expected = `<div />
<!-- <style>body { background-color: red; }</style> -->
<style>${styles}</style>`

    expect(addGeneratedStylesIntoStyleBlock(code, styles)).toBe(expected)
  })
})
