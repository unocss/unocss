import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { quotedArbitraryValuesRE, splitCodeWithArbitraryVariants } from '../src/index'
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
})

describe('splitCodeWithArbitraryVariants()', () => {
  it('extracts quoted attribute selectors behind a class or pseudo-class prefix', () => {
    const code = [
      `<div class='[&_.recharts-cartesian-grid_line[stroke="#ccc"]]:hidden'></div>`,
      `<button class="[&_svg:not([class*='size-'])]:size-4"></button>`,
    ].join('\n')

    expect(splitCodeWithArbitraryVariants(code)).toEqual(
      expect.arrayContaining([
        '[&_.recharts-cartesian-grid_line[stroke="#ccc"]]:hidden',
        `[&_svg:not([class*='size-'])]:size-4`,
      ]),
    )
  })

  it('keeps extracting quoted attribute selectors without such a prefix', () => {
    const code = `<div class='[&_[stroke="#ccc"]]:hidden [&_tag[stroke="#ccc"]]:hidden'></div>`

    expect(splitCodeWithArbitraryVariants(code)).toEqual(
      expect.arrayContaining([
        '[&_[stroke="#ccc"]]:hidden',
        '[&_tag[stroke="#ccc"]]:hidden',
      ]),
    )
  })
})
