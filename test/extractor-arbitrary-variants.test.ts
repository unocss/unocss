import { describe, expect, it } from 'vitest'
import { removeSourceMap } from '../packages/extractor-arbitrary-variants/src/source-map'

describe('removeSourceMap()', () => {
  it('should remove the source map from the code', () => {
    const code = 'console.log("Hello, world!");\n//# sourceMappingURL=app.js.map\n'
    expect(removeSourceMap(code)).toMatchInlineSnapshot(`
      "console.log("Hello, world!");
      "
    `)
  })

  it('should return the code unchanged if it does not contain a source map', () => {
    const code = 'console.log("Hello, world!");\n'
    expect(removeSourceMap(code)).toBe(code)
  })
})
