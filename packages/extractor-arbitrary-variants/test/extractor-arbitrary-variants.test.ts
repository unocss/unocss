import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { removeSourceMap } from '../src/source-map'
import { quotedArbitraryValuesRE } from '../src/index'

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

describe('quotedArbitraryValuesRE', () => {
  it('should match within reasonable time', async () => {
    const code = await readFile(`${process.cwd()}/test/assets/regex-dos.ts`, { encoding: 'utf-8' })
    quotedArbitraryValuesRE.test(code)
  })
})
