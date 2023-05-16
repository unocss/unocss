const notInCommentRE = /(?<!<!--\s*)/
const stylesTagWithCapturedDirectivesRE = /<style([^>]*)>[\s\S]*?<\/style\s*>/
const actualStylesTagWithCapturedDirectivesRE = new RegExp(notInCommentRE.source + stylesTagWithCapturedDirectivesRE.source, 'g')

const captureOpeningStyleTagWithAttributesRE = /(<style[^>]*>)/

export function addGeneratedStylesIntoStyleBlock(code: string, styles: string) {
  const preExistingStylesTag = code.match(actualStylesTagWithCapturedDirectivesRE)

  if (preExistingStylesTag)
    return code.replace(captureOpeningStyleTagWithAttributesRE, `$1${styles}`)

  return `${code}\n<style>${styles}</style>`
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

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
}
