import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { quotedArbitraryValuesRE } from '../src/index'
import { removeSourceMap } from '../src/source-map'

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

  it('should match arbitrary values with nested brackets without trailing characters', async () => {
    const code = `
   export default /*@__PURE__*/_defineComponent({
    __name: 'index',
    setup(__props) {
      const cardContent = ref('')
      return (_ctx: any,_cache: any) => {
        return (_openBlock(), _createElementBlock("div", {
          class: _normalizeClass([cardContent.value && 'text-gradient-[#fff]'])
        }, null, 2))
      }
    }
  })
`
    expect(code.match(quotedArbitraryValuesRE)?.[0]).toBe('text-gradient-[#fff]')
  })
})
